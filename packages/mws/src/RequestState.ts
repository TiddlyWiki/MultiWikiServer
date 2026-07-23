import { Prisma } from '@tiddlywiki/mws-prisma';
import { Types } from '@tiddlywiki/mws-prisma';
import { ServerState } from "./ServerState";
import { BodyFormat, ParsedRequest, RouteMatch, Router, ServerRequest, Streamer, StreamerHeadersInput, SuperHeadersInit, SuperHeadersPropertyInit, truthy } from "@tiddlywiki/server";
import { SendError, SendErrorReasonData } from "@tiddlywiki/server";
import { ServerToReactAdmin } from './services/setupDevServer';
import { AuthUser } from './new-managers/sessions';


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

  /** 
   * This is intended to prevent malicious code attempting to access restricted
   * bags using the credentials of more privelaged users and then saving the data
   * to less restricted bags. Eventually this is intended to have a more complete 
   * system where a page requests permission to access another page on behalf of the user.
   */
  assertWikiReferer(recipe_slug: string) {
    const state = this;
    if (!state.headers.referer) return;
    const referer = new URL(state.headers.referer);
    // for now pages outside the path prefix are denied, but this should probably change
    if (!referer.pathname.startsWith(state.pathPrefix))
      throw new SendError("ACCESS_DENIED", 403, { reason: "Referer check failed" })
    // if a recipe endpoint somehow serves a page, it's definitely wiki content, so deny it
    if (referer.pathname.startsWith(state.pathPrefix + "/recipe/"))
      throw new SendError("ACCESS_DENIED", 403, { reason: "Referer check failed" })
    // pages outside the wiki path are allowed to access wiki endpoints if they want
    if (!referer.pathname.startsWith(state.pathPrefix + "/wiki/"))
      return;
    // we now get the recipe name from the referer
    const recipe_name = referer.pathname.substring(state.pathPrefix.length + "/wiki/".length);
    const referer_slug = decodeURIComponent(recipe_name) as PrismaField<"Recipe", "id">;
    if (referer_slug !== recipe_slug)
      throw new SendError("ACCESS_DENIED", 403, { reason: "Referer check failed" })
  }

  /** 
   * If this throws in the wrong situation it may be a bug.
   * Normally this is intended to keep wiki code from trying to acces admin or login paths,
   * since malicious code would be accessing it from every computer that opens the wiki.
   * It is not intended to restrict legitimate scenarios, especially not scenarios coded into
   * the admin-vanilla client. If it throws under stock conditions, it's a bug.
   */
  assertReferer(url: string[]) {
    const state = this;
    // referer is a voluntary header
    if (!state.headers.referer) return;
    const referer = new URL(state.headers.referer);
    // deny referers from outside our pathprefix
    if (!url.some(e => referer.pathname.startsWith(state.pathPrefix + e)))
      throw new SendError("ACCESS_DENIED", 403, { reason: "Referer check failed" })
  }


}

export type ACLPermissionName = "READ" | "WRITE" | "ADMIN";
