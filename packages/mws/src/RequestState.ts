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

  setHeader<K extends string & keyof StreamerHeadersInput>(name: K, value: StreamerHeadersInput[K]) {
    this.res.setHeaders(this.res.statusCode, { [name]: value } as any);
  }

  applyResponseHeaders(opt: SuperHeadersInit) {
    this.res.headers.apply(opt);
  }

  okUser() {
    if (!this.user.isLoggedIn) throw "User not authenticated";
  }
  okAdmin() {
    if (!this.user.isLoggedIn) throw "User not authenticated";
    if (!this.user.isAdmin) throw "User is not an admin";
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

  makeTiddlerEtag(options: { bag_name: string; revision_id: string | number; }) {
    // why do we need revision_id AND bag_name? revision_id is unique across all tiddlers
    if (options.bag_name && options.revision_id) {
      return `"tiddler:${options.bag_name}/${options.revision_id}"`;
    } else {
      throw "Missing bag_name or revision_id";
    }
  }


  getRefererRecipe() {
    const state = this;
    if (!state.headers.get("referer")) return;
    const referer = new URL(state.headers.get("referer")!);
    // console.log("Referer", state.headers.referer, referer);
    if (!referer.pathname.startsWith(state.pathPrefix))
      throw state.sendEmpty(404, { "x-reason": "invalid path prefix" });
    if (!referer.pathname.startsWith(state.pathPrefix + "/wiki/"))
      return; // keep going
    // we now get the recipe name from the referer
    const recipe_name = referer.pathname.substring(state.pathPrefix.length + "/wiki/".length);
    return decodeURIComponent(recipe_name) as PrismaField<"Recipe", "id">;
  }


}

export type ACLPermissionName = "READ" | "WRITE" | "ADMIN";
