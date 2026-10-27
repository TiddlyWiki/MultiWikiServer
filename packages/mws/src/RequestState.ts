import { Prisma } from '@tiddlywiki/mws-prisma';
import { Types } from '@tiddlywiki/mws-prisma';
import { ServerState } from "./ServerState";
import { BodyFormat, Router, ServerRequest, Streamer } from "@tiddlywiki/server";
import { SendError } from "@tiddlywiki/server";
import { AuthUser, SecFetch } from './new-managers/sessions';
import { guarded } from './utils/guarded-promise';
import { make_index_file, make_manifest_file } from './services/setupDevServer';
import { b64 } from './services/CryptoService';


declare module "@tiddlywiki/server" {
  // ServerRequest is the officially typed request object, 
  // which we are replacing with our own StateObject,
  // so add the properties from StateObject to ServerRequest
  // so the route handler definitions coming from server work correctly.
  interface ServerRequest<
    B extends BodyFormat = BodyFormat,
    M extends string = string,
    D = unknown
  > extends StateObject<B, M, D> { }

}


export interface ServerAdminResponse {
  sendError?: SendError<any>;
  userState: ServerRequest["user"];
  rootRoutes: ServerState["rootRoutes"];
  tw5Versions: string[];
  pageToken: string | null;
}


export class StateObject<
  B extends BodyFormat = BodyFormat,
  M extends string = string,
  D = unknown
> extends Streamer implements ServerRequest<B, M, D> {

  declare isBodyFormat: ServerRequest<B, M, D>["isBodyFormat"];
  declare bodyFormat: ServerRequest<B, M, D>["bodyFormat"];
  declare method: ServerRequest<B, M, D>["method"];
  declare data: ServerRequest<B, M, D>["data"];
  declare readMultipartData: ServerRequest<B, M, D>["readMultipartData"];

  config;
  user;
  engine;
  sendAdmin;
  asserted;
  PasswordService;
  pluginCache;
  requestAuthToken;

  constructor(user: AuthUser, router: Router, ...parts: ConstructorParameters<typeof Streamer>) {
    super(...parts);

    this.user = user;
    this.config = router.config;
    this.engine = router.config.engine;
    this.PasswordService = router.config.PasswordService;
    this.pluginCache = router.config.pluginCache;

    this.requestAuthToken = this.headers.authorization?.startsWith("Bearer ")
      ? this.headers.authorization.slice(7)
      : null;


    this.asserted = false;
    this.sendAdmin = (sendError?: SendError<any>): Promise<typeof STREAM_ENDED> =>
      router.sendAdmin(this, sendError);
  }

  serveAdminPath = "/admin";

  setSessionCookie(name: string, value: string) {
    this.setCookie({
      name,
      value,
      httpOnly: true,
      path: this.pathPrefix + "/",
      secure: this.assumeHTTPS,
      sameSite: "Lax"
    });
  }

  async serveIndex({ publicdir, status, sendError }: {
    publicdir: string;
    status: number;
    sendError?: SendError<any>;
  }): Promise<typeof STREAM_ENDED> {
    if (!this.user.session_id) {
      this.user.session_id = b64.encode(crypto.getRandomValues(new Uint8Array(16)));
      this.setSessionCookie("guest_session", this.user.session_id);
    }
    const serverResponse: ServerAdminResponse = {
      userState: this.user,
      tw5Versions: Array.from(this.pluginCache.versions),
      rootRoutes: this.config.rootRoutes,
      sendError,
      pageToken: await this.makePageToken(this.serveAdminPath),
    }
    const indexBuffer = await make_index_file({
      publicdir,
      pathPrefix: this.pathPrefix,
      assetsPrefix: this.config.rootRoutes.assets,
      serverResponseJSON: JSON.stringify(serverResponse)
    });
    return this.sendBuffer(status, {
      contentType: { mediaType: "text/html", charset: "utf-8" },
      contentLength: indexBuffer.length,
      contentSecurityPolicy: null,
    }, indexBuffer);
  }

  async serveManifest({ publicdir }: {
    publicdir: string;
  }): Promise<typeof STREAM_ENDED> {
    const buffer = await make_manifest_file({
      publicdir,
      pathPrefix: this.pathPrefix,
      assetsPrefix: this.config.rootRoutes.assets
    });
    return this.sendBuffer(200, {
      contentType: { mediaType: "text/html", charset: "utf-8" },
      contentLength: buffer.length,
      contentSecurityPolicy: null,
    }, buffer);
  }


  okUser() {
    if (!this.user.isLoggedIn)
      throw new SendError("ACCESS_DENIED", 403, { reason: "User not authenticated" })
  }
  okAdmin() {
    if (!this.user.isLoggedIn)
      throw new SendError("ACCESS_DENIED", 403, { reason: "User not authenticated" })
    if (!this.user.isAdmin)
      throw new SendError("ACCESS_DENIED", 403, { reason: "User is not an admin" })
  }

  okPageToken(urls: string[]) {
    // failing to await this will probably cause the process to exit, which is good
    return guarded(async () => {
      if (!await this.checkPageToken(urls, this.requestAuthToken))
        throw new SendError("ACCESS_DENIED", 403, { reason: "pathname signature failed" });
    })();
  }

  async $transaction<T>(fn: (prisma: PrismaTxnClient) => Promise<T>): Promise<T> {
    if (!this.asserted)
      throw new Error("You must check access before opening a transaction.")
    return await this.engine.$transaction(prisma => fn(prisma as PrismaTxnClient));
  }

  $transactionTuple<P extends Prisma.PrismaPromise<any>[]>(arg: (prisma: ServerState["engine"]) => [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<Types.Utils.UnwrapTuple<P>> {
    if (!this.asserted)
      throw new Error("You must check access before opening a transaction.");
    return this.engine.$transaction(arg(this.engine), options);
  }

  async makePageToken(pathname: string) {

    const secFetchDest = this.headers.get("sec-fetch-dest") as Request["destination"] | null;
    const secFetchMode = this.headers.get("sec-fetch-mode") as Request["mode"] | null;
    const secFetchSite = this.headers.get("sec-fetch-site") as "cross-site" | "same-origin" | "same-site" | "none" | null;
    const secFetchUser = this.headers.get("sec-fetch-user") === "?1";

    if (secFetchDest === "document" && secFetchMode === "navigate") {
      if (!this.user.session_id) return null;
      const parts: string[] = [this.user.session_id, pathname];
      // nonce and timestamp are not needed.
      return await this.config.signer.encode(parts.join("|"));
    } else {
      // throw new SendError("ACCESS_DENIED", 403, { reason: "page must be a document load" });
      await this.okPageToken([pathname]);
    }
    return null;
  }

  async checkPageToken(url: string[], pageToken: string | null) {
    if (!this.user.session_id || !pageToken || pageToken === "null") return false;
    for (const pathname of url) {
      const parts: string[] = [this.user.session_id, pathname]
      if (await this.config.signer.decode(parts.join("|"), pageToken)) return true;
    }
    return false;
  }

}

export type ACLPermissionName = "READ" | "WRITE" | "ADMIN";
