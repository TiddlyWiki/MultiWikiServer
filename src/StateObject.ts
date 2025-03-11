import { Readable } from 'stream';
import { filterAsync, mapAsync, readMultipartData, sendResponse } from './utils';
import { STREAM_ENDED, Streamer, StreamerState } from './streamer';
import { PassThrough } from 'node:stream';
import { AllowedMethod, BodyFormat, RouteMatch, Router } from './router';
import * as z from 'zod';
import { AuthUser } from './routes/services/sessions';
import { Prisma } from '@prisma/client';
import { Types } from '@prisma/client/runtime/library';
import { DataChecks } from './data-checks';

export interface AuthStateRouteACL {
  /** Every level in the route path must have this disabled for it to be disabled */
  csrfDisable?: boolean;
}



// This class abstracts the request/response cycle into a single object.
// It hides most of the details from the routes, allowing us to easily change the underlying server implementation.
export class StateObject<
  B extends BodyFormat = BodyFormat,
  M extends AllowedMethod = AllowedMethod,
  RoutePathParams extends string[][] = string[][],
  D = unknown
> extends StreamerState {

  z: typeof z = z;



  /** sends a status and plain text string body */
  sendSimple(status: number, msg: string): typeof STREAM_ENDED {
    return this.sendString(status, {
      "content-type": "text/plain"
    }, msg, "utf8");
  }
  /** Stringify the value (unconditionally) and send it with content-type `application/json` */
  sendJSON(status: number, obj: any): typeof STREAM_ENDED {
    return this.sendString(status, {
      "content-type": "application/json"
    }, JSON.stringify(obj), "utf8");
  }

  STREAM_ENDED: typeof STREAM_ENDED = STREAM_ENDED;


  get enableBrowserCache() { return this.router.enableBrowserCache; }
  get enableGzip() { return this.router.enableGzip; }
  get pathPrefix() { return this.router.pathPrefix; }
  get config() { return this.router.config; }
  get method(): M { return super.method as M; }
  readMultipartData
  // processIncomingStream
  sendResponse
  sendDevServer
  mapAsync
  filterAsync

  data!:
    B extends "string" ? string :
    B extends "buffer" ? Buffer :
    B extends "www-form-urlencoded-urlsearchparams" ? URLSearchParams :
    B extends "stream" ? Readable :
    B extends "ignore" ? undefined :
    D;
  /** 
   * an *object from entries* of all the pathParams in the tree mapped to the path regex matches from that route.
   * 
   * Object.fromEntries takes the last value if there are duplicates, so conflicting names will have the last value in the path. 
   */
  pathParams: Record<RoutePathParams extends (infer X extends string)[][] ? X : never, string | undefined>;
  /** 
   * The query params. Because these aren't checked anywhere, 
   * the value includes undefined since it will be that if 
   * the key is not specified at all. 
   * 
   * This will always satisfy the zod schema: `z.record(z.array(z.string()))`
   */
  queryParams: Record<string, string[] | undefined>;


  allowAnonReads: boolean = false;
  allowAnonWrites: boolean = false;
  // This isn't necessary on the route state. Something this temporary needs to be more self-contained.
  // however it is used in client state as well, so I have to leave it here for now.
  firstGuestUser: boolean = false;
  databasePath
  // attachmentStore

  // auth: Authenticator;
  // store!: SqlTiddlerStore;
  // adminWiki
  // Tiddler
  // sjcl
  // config

  PasswordService;
  authenticatedUser;

  constructor(
    streamer: Streamer,
    /** The array of Route tree nodes the request matched. */
    private routePath: RouteMatch[],
    /** The bodyformat that ended up taking precedence. This should be correctly typed. */
    public bodyFormat: B,
    public user: AuthUser | null,
    private router: Router
  ) {
    super(streamer);
    this.authenticatedUser = user;

    this.databasePath = this.router.databasePath;
    // this.attachmentStore = this.router.attachmentStore;
    // this.store = this.createStore(this.router.engine);

    // this.adminWiki = this.router.$tw.wiki;
    // this.Tiddler = this.router.$tw.Tiddler;
    // this.sjcl = this.router.sjcl;
    // this.config = this.router.$tw.config;

    this.readMultipartData = readMultipartData.bind(this);
    this.sendResponse = sendResponse.bind(this.router, this);
    this.sendDevServer = this.router.sendDevServer.bind(this.router, this);
    this.mapAsync = mapAsync;
    this.filterAsync = filterAsync;

    this.pathParams = Object.fromEntries<string | undefined>(routePath.map(r =>
      r.route.pathParams
        ?.map((e, i) => [e, r.params[i]] as const)
        .filter(<T>(e: T): e is T & {} => !!e)
      ?? []
    ).flat()) as any;

    const pathParamsZodCheck = z.record(z.string().transform(zodURIComponent).optional()).safeParse(this.pathParams);
    if (!pathParamsZodCheck.success) console.log("BUG: Path params zod error", pathParamsZodCheck.error, this.pathParams);
    else this.pathParams = pathParamsZodCheck.data;
    console.log("pathParams", this.pathParams);

    this.queryParams = Object.fromEntries([...this.urlInfo.searchParams.keys()]
      .map(key => [key, this.urlInfo.searchParams.getAll(key)] as const));

    const queryParamsZodCheck = z.record(z.array(z.string())).safeParse(this.queryParams);
    if (!queryParamsZodCheck.success) console.log("BUG: Query params zod error", queryParamsZodCheck.error, this.queryParams);
    else this.queryParams = queryParamsZodCheck.data;


    this.allowAnonReads = this.router.config.allowAnonReads ?? false;
    this.allowAnonWrites = this.router.config.allowAnonWrites ?? false;

    this.PasswordService = router.PasswordService;
  }

  // createStore(engine: PrismaTxnClient) {
  //   const sql = createStrictAwaitProxy(new SqlTiddlerDatabase(engine));
  //   return createStrictAwaitProxy(new SqlTiddlerStore(sql, this.attachmentStore));
  // }

  $transaction = async <T>(fn: (prisma: PrismaTxnClient) => Promise<T>): Promise<T> => {
    return await this.router.engine.$transaction(async prisma => {
      // return await fn(this.createStore(prisma as PrismaTxnClient))
      return await fn(prisma as PrismaTxnClient);
    });
  }

  $transactionTuple<P extends Prisma.PrismaPromise<any>[]>(arg: (prisma: Router["engine"]) => [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<Types.Utils.UnwrapTuple<P>> {
    return this.router.engine.$transaction(arg(this.router.engine), options);
  }




  makeTiddlerEtag(options: { bag_name: string; tiddler_id: string | number; }) {
    // why do we need tiddler_id AND bag_name? tiddler_id is unique across all tiddlers
    if (options.bag_name || options.tiddler_id) {
      return `"tiddler:${options.bag_name}/${options.tiddler_id}"`;
    } else {
      // TODO: WAIT!! This is a bug.
      // This should say "and" not "or", or else the above should be "&&" not "||".
      // They logically can't BOTH be OR.
      throw "Missing bag_name or tiddler_id";
    }
  }

  /** type-narrowing helper function. This affects anywhere T is used. */
  isBodyFormat<T extends B, S extends { [K in B]: StateObject<K, M, RoutePathParams, D> }[T]>(format: T): this is S {
    return this.bodyFormat as BodyFormat === format;
  }


  /**
   *
   * Sends a **302** status code and **Location** header to the client.
   * 
   * 
   * - **301 Moved Permanently:** The resource has been permanently moved to a new URL.
   * - **302 Found:** The resource is temporarily located at a different URL.
   * - **303 See Other:** Fetch the resource from another URI using a GET request.
   * - **307 Temporary Redirect:** The resource is temporarily located at a different URL; the same HTTP method should be used.
   * - **308 Permanent Redirect:** The resource has permanently moved; the client should use the new URL in future requests.
   */
  redirect(location: string): typeof STREAM_ENDED {
    return this.sendEmpty(302, { 'Location': location });
  }

  sendSSE(retryMilliseconds?: number) {
    if (retryMilliseconds !== undefined)
      if (typeof retryMilliseconds !== "number" || retryMilliseconds < 0)
        throw new Error("Invalid retryMilliseconds: must be a non-negative number");

    const stream = new PassThrough();

    this.sendStream(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
    }, stream);

    stream.write(": This page is a server-sent event stream. It will continue loading until you close it.\n");
    stream.write(": https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events\n");
    stream.write("\n");

    /**
     * 
     * @param {string} eventName The event name. If zero-length, the field is omitted
     * @param eventData The data to send. Must be stringify-able to JSON.
     * @param {string} eventId The event id. If zero-length, the field is omitted.
     */
    const emitEvent = (eventName: string, eventData: any, eventId: string) => {
      if (typeof eventName !== "string")
        throw new Error("Event name must be a string (a zero-length string disables the field)");
      if (eventName.includes("\n"))
        throw new Error("Event name cannot contain newlines");
      if (typeof eventId !== "string")
        throw new Error("Event ID must be a string");
      if (eventId.includes("\n"))
        throw new Error("Event ID cannot contain newlines");

      stream.write([
        eventName && `event: ${eventName}`,
        `data: ${JSON.stringify(eventData)}`,
        eventId && `id: ${eventId}`,
        retryMilliseconds && `retry: ${retryMilliseconds}`,
      ].filter(e => e).join("\n") + "\n\n");
    }

    return {
      /** Emit an SSE event */
      emitEvent,
      emitComment: (comment: string) => stream.write(`: ${comment}\n\n`),
      close: () => stream.end(),
      onClose: (callback: () => void) => stream.on("close", callback),
    };

  }
  // several changes were made to this function
  // - it shouldn't assume it knows where the entityName is
  // - it throws STREAM_ENDED if it ends the request
  // - it does not check whether headers have been sent before throwing. 
  // - headers should not be sent before it is called. 
  // - it should not send a response more than once since it should throw every time it does.
  // and now it is replaced by the getACL prisma query.
  async checkACL(entityType: EntityType, entityName: string, permissionName: ACLPermissionName): Promise<void> {
    console.error("checkACL is not implemented");
    throw this.sendEmpty(500);
  }
  redirectToLogin(returnUrl: string) {

    var validReturnUrlRegex = /^\/(?!.*\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|json)$).*$/;
    var sanitizedReturnUrl = '/';  // Default to home page

    if (validReturnUrlRegex.test(returnUrl)) {
      sanitizedReturnUrl = returnUrl;
      this.setHeader('Set-Cookie', `returnUrl=${encodeURIComponent(sanitizedReturnUrl)}; HttpOnly; Secure; SameSite=Strict; Path=/`);
    } else {
      console.log(`Invalid return URL detected: ${returnUrl}. Redirecting to home page.`);
    }
    const loginUrl = '/login';
    return this.redirect(loginUrl);

  };


  async assertRecipeACL(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    user_id: number | undefined,
    needWrite: boolean
  ) {
    const prisma = this.router.engine;
    const read = new DataChecks(this.config).getBagWhereACL({ permission: "READ", user_id });
    const write = new DataChecks(this.config).getBagWhereACL({ permission: "WRITE", user_id });

    const [recipe, canRead, canWrite] = await prisma.$transaction([
      prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name }
      }),
      prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name, recipe_bags: { every: { bag: { OR: read } } } }
      }),
      needWrite ? prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name, recipe_bags: { some: { position: 0, bag: { OR: write } } } }
      }) : prisma.$queryRaw`SELECT 1`,
    ]);

    if (!recipe)
      throw this.sendEmpty(404, { "x-reason": "recipe not found" });
    if (!canRead)
      throw this.sendEmpty(403, { "x-reason": "no read permission" });
    if (needWrite && !canWrite)
      throw this.sendEmpty(403, { "x-reason": "no write permission" });

  }


  async assertBagACL(
    bag_name: PrismaField<"Bags", "bag_name">,
    user_id: number | undefined,
    needWrite: boolean
  ) {

    const prisma = this.router.engine;
    const [recipe, canRead, canWrite] = await prisma.$transaction([
      prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name }
      }),
      prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name, OR: new DataChecks(this.config).getBagWhereACL({ permission: "READ", user_id }) }
      }),
      needWrite ? prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name, OR: new DataChecks(this.config).getBagWhereACL({ permission: "WRITE", user_id }) }
      }) : prisma.$queryRaw`SELECT 1`,
    ]);

    if (!recipe)
      throw this.sendEmpty(404, { "x-reason": "recipe not found" });
    if (!canRead)
      throw this.sendEmpty(403, { "x-reason": "no read permission" });
    if (needWrite && !canWrite)
      throw this.sendEmpty(403, { "x-reason": "no write permission" });

  }

}

const zodURIComponent = (val: string, ctx: z.RefinementCtx) => {
  try {
    return decodeURIComponent(val);
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid URI component",
    });
    return z.NEVER;
  }
}
