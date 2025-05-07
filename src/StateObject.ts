import { Readable } from 'stream';
import { filterAsync, mapAsync, readMultipartData, sendResponse } from './utils';
import { STREAM_ENDED, Streamer, StreamerState } from './streamer';
import { PassThrough } from 'node:stream';
import { AllowedMethod, BodyFormat, RouteMatch, Router, SiteConfig } from './routes/router';
import * as z from 'zod';
import { AuthUser } from './services/SessionManager';
import { Prisma, PrismaClient } from '@prisma/client';
import { Types } from '@prisma/client/runtime/library';
import { DataChecks } from './utils';
import { setupDevServer } from "./setupDevServer";
import { Commander } from './commander';
import { PasswordService } from './services/PasswordService';

export interface AuthStateRouteACL {

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

  STREAM_ENDED: typeof STREAM_ENDED = STREAM_ENDED;

  get method(): M { return super.method as M; }
  readMultipartData
  sendResponse
  /** This is set in makeRouter */
  sendDevServer!: () => ReturnType<Awaited<ReturnType<typeof setupDevServer>>>;

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
   * 
   * Conflicting names would be defined on the route definitions, so just change the name there if there is a conflict.
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


  private engine: Commander["engine"];
  public config: SiteConfig;
  public PasswordService: PasswordService;

  constructor(
    streamer: Streamer,
    /** The array of Route tree nodes the request matched. */
    private routePath: RouteMatch[],
    /** The bodyformat that ended up taking precedence. This should be correctly typed. */
    public bodyFormat: B,
    public user: AuthUser,
    public router: Router,
    public tiddlerCache: Router["tiddlerCache"],
  ) {
    super(streamer);

    this.engine = router.engine;
    this.config = router.siteConfig;
    this.PasswordService = router.PasswordService;
    

    this.readMultipartData = readMultipartData.bind(this);
    this.sendResponse = sendResponse.bind(undefined, this.config, this);

    this.pathParams = Object.fromEntries<string | undefined>(routePath.map(r =>
      r.route.pathParams
        ?.map((e, i) => [e, r.params[i]] as const)
        .filter(<T>(e: T): e is T & {} => !!e)
      ?? []
    ).flat()) as any;

    const pathParamsZodCheck = z.record(z.string().transform(zodURIComponent).optional()).safeParse(this.pathParams);
    if (!pathParamsZodCheck.success) console.log("BUG: Path params zod error", pathParamsZodCheck.error, this.pathParams);
    else this.pathParams = pathParamsZodCheck.data;

    this.queryParams = Object.fromEntries([...this.urlInfo.searchParams.keys()]
      .map(key => [key, this.urlInfo.searchParams.getAll(key)] as const));

    const queryParamsZodCheck = z.record(z.array(z.string())).safeParse(this.queryParams);
    if (!queryParamsZodCheck.success) console.log("BUG: Query params zod error", queryParamsZodCheck.error, this.queryParams);
    else this.queryParams = queryParamsZodCheck.data;


  }

  okUser() {
    if (!this.user.isLoggedIn) throw "User not authenticated";
  }
  okAdmin() {
    if (!this.user.isLoggedIn) throw "User not authenticated";
    if (!this.user.isAdmin) throw "User is not an admin";
  }

  // createStore(engine: PrismaTxnClient) {
  //   const sql = createStrictAwaitProxy(new SqlTiddlerDatabase(engine));
  //   return createStrictAwaitProxy(new SqlTiddlerStore(sql, this.attachmentStore));
  // }

  $transaction = async <T>(fn: (prisma: PrismaTxnClient) => Promise<T>): Promise<T> => {
    return await this.engine.$transaction(prisma => fn(prisma as PrismaTxnClient));
  }

  $transactionTuple<P extends Prisma.PrismaPromise<any>[]>(arg: (prisma: Commander["engine"]) => [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<Types.Utils.UnwrapTuple<P>> {
    return this.engine.$transaction(arg(this.engine), options);
  }

  makeTiddlerEtag(options: { bag_name: string; tiddler_id: string | number; }) {
    // why do we need tiddler_id AND bag_name? tiddler_id is unique across all tiddlers
    if (options.bag_name && options.tiddler_id) {
      return `"tiddler:${options.bag_name}/${options.tiddler_id}"`;
    } else {
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
   * This will add the path prefix to the redirect path
   * 
   * - **301 Moved Permanently:** The resource has been permanently moved to a new URL.
   * - **302 Found:** The resource is temporarily located at a different URL.
   * - **303 See Other:** Fetch the resource from another URI using a GET request.
   * - **307 Temporary Redirect:** The resource is temporarily located at a different URL; the same HTTP method should be used.
   * - **308 Permanent Redirect:** The resource has permanently moved; the client should use the new URL in future requests.
   */
  redirect(location: string): typeof STREAM_ENDED {
    return this.sendEmpty(302, { 'Location': this.pathPrefix + location });
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


  async getRecipeACL(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    needWrite: boolean
  ) {
    const { user_id, isAdmin, role_ids } = this.user;

    const prisma = this.engine;
    const read = new DataChecks(this.config).getBagWhereACL({ permission: "READ", user_id, role_ids });
    const write = new DataChecks(this.config).getBagWhereACL({ permission: "WRITE", user_id, role_ids });

    const [recipe, canRead, canWrite] = await prisma.$transaction([
      prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name, recipe_bags: { every: { bag: { OR: read } } } }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : needWrite ? prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name, recipe_bags: { some: { position: 0, bag: { OR: write } } } }
      }) : prisma.$queryRaw`SELECT 1`,
    ]);

    return { recipe, canRead, canWrite };

  }
  async assertRecipeACL(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    needWrite: boolean
  ) {

    const { recipe, canRead, canWrite } = await this.getRecipeACL(recipe_name, needWrite);

    if (!recipe) throw this.sendEmpty(404, { "x-reason": "recipe not found" });
    if (!canRead) throw this.sendEmpty(403, { "x-reason": "no read permission" });
    if (!canWrite) throw this.sendEmpty(403, { "x-reason": "no write permission" });

  }

  async getBagACL(
    bag_name: PrismaField<"Bags", "bag_name">,
    needWrite: boolean
  ) {
    const { user_id, isAdmin, role_ids } = this.user;
    const prisma = this.engine;
    const read = new DataChecks(this.config).getBagWhereACL({ permission: "READ", user_id, role_ids });
    const write = new DataChecks(this.config).getBagWhereACL({ permission: "WRITE", user_id, role_ids });
    const [bag, canRead, canWrite] = await prisma.$transaction([
      prisma.bags.findUnique({
        select: { bag_id: true, is_plugin: true, owner_id: true },
        where: { bag_name }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name, OR: read }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : needWrite ? prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name, OR: write }
      }) : prisma.$queryRaw`SELECT 1`,
    ]);
    return { bag, canRead, canWrite };
  }

  async assertBagACL(
    bag_name: PrismaField<"Bags", "bag_name">,
    needWrite: boolean
  ) {
    const { bag, canRead, canWrite } = await this.getBagACL(bag_name, needWrite);

    if (!bag) throw this.sendEmpty(404, { "x-reason": "recipe not found" });
    if (!canRead) throw this.sendEmpty(403, { "x-reason": "no read permission" });
    if (!canWrite) throw this.sendEmpty(403, { "x-reason": "no write permission" });

    return bag;

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
