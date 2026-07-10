import { Prisma } from '@tiddlywiki/mws-prisma';
import { Types } from '@tiddlywiki/mws-prisma';
import { ServerState } from "./ServerState";
import { BodyFormat, ParsedRequest, RouteMatch, Router, ServerRequest, Streamer, StreamerHeadersInput, SuperHeadersInit, SuperHeadersPropertyInit, truthy } from "@tiddlywiki/server";
import { SendError, SendErrorReasonData } from "@tiddlywiki/server";
import { ServerToReactAdmin } from './services/setupDevServer';
import { AuthUser } from './services/sessions';


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

  constructor(user: AuthUser, router: Router, ...parts: ConstructorParameters<typeof Streamer>) {
    super(...parts);

    this.user = user;
    this.config = router.config;
    this.engine = router.config.engine;
    this.PasswordService = router.config.PasswordService;
    this.pluginCache = router.config.pluginCache;

    this.asserted = false;
    this.sendAdmin = (sendError?: SendError<any>): Promise<typeof STREAM_ENDED> =>
      router.sendAdmin(this, sendError);

    if (this.compressor)
      this.compressor.enabled = router.config.enableGzip;
  }

  okUser() {
    if (!this.user.isLoggedIn)
      throw new SendError("ACCESS_DENIED", 403, { reason:  "User not authenticated" })
  }
  okAdmin() {
    if (!this.user.isLoggedIn) 
      throw new SendError("ACCESS_DENIED", 403, { reason:  "User not authenticated" })
    if (!this.user.isAdmin) 
      throw new SendError("ACCESS_DENIED", 403, { reason:  "User is not an admin" })
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

  assertWikiReferer(recipe_slug: string) {
    const state = this;
    if (!state.headers.referer) return;
    const referer = new URL(state.headers.referer);
    // console.log("Referer", state.headers.referer, referer);
    if (!referer.pathname.startsWith(state.pathPrefix))
      throw new SendError("ACCESS_DENIED", 403, { reason:  "Referer check failed" })
    if (!referer.pathname.startsWith(state.pathPrefix + "/wiki/"))
      return; // keep going
    // we now get the recipe name from the referer
    const recipe_name = referer.pathname.substring(state.pathPrefix.length + "/wiki/".length);
    const referer_slug = decodeURIComponent(recipe_name) as PrismaField<"Recipe", "id">;
    if (referer_slug !== recipe_slug)
      throw new SendError("ACCESS_DENIED", 403, { reason:  "Referer check failed" })
  }

  assertAdminReferer() {
    const state = this;
    // referer is a voluntary header
    if (!state.headers.referer) return;
    const referer = new URL(state.headers.referer);
    // deny referers from outside our pathprefix
    if (!referer.pathname.startsWith(state.pathPrefix))
      throw new SendError("ACCESS_DENIED", 403, { reason:  "Referer check failed" })
    if (referer.pathname.startsWith(state.pathPrefix + "/wiki/"))
      throw new SendError("ACCESS_DENIED", 403, { reason:  "Referer check failed" })
  }


}

export type ACLPermissionName = "READ" | "WRITE" | "ADMIN";
