import { ok } from "assert";
import { Streamer } from "./server";
import { AuthStateRouteACL, StateObject } from "./StateObject";
import RootRoute from "./routes";
import * as z from "zod";
import { createStrictAwaitProxy, is } from "./helpers";
import { TiddlyWiki } from "tiddlywiki";
import { readFileSync } from "fs";

export const AllowedMethods = [...["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"] as const];
export type AllowedMethod = typeof AllowedMethods[number];

export const BodyFormats = ["stream", "string", "json", "buffer", "www-form-urlencoded", "www-form-urlencoded-urlsearchparams", "ignore"] as const;
export type BodyFormat = typeof BodyFormats[number];


const zodTransformJSON = (arg: string, ctx: z.RefinementCtx) => {
  try {
    return JSON.parse(arg, (key, value) => {
      //https://github.com/fastify/secure-json-parse
      if (key === '__proto__')
        throw new Error('Invalid key: __proto__');
      if (key === 'constructor' && Object.prototype.hasOwnProperty.call(value, 'prototype'))
        throw new Error('Invalid key: constructor.prototype');
      return value;
    });
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: e instanceof Error ? e.message : `${e}`,
      fatal: true,
    });
    return z.NEVER;
  }
};

export class Router {

  pathPrefix: string = "";
  enableBrowserCache: boolean = true;
  enableGzip: boolean = true;
  csrfDisable: boolean = false;
  servername: string = "";
  variables = new Map();
  get(name: string): string {
    return this.variables.get(name) || "";
  }


  static async makeRouter() {
    const rootRoute = defineRoute(ROOT_ROUTE, {
      useACL: { csrfDisable: true },
      method: AllowedMethods,
      path: /^/,
      denyFinal: true,
    }, async (state: any) => state);
    await RootRoute(rootRoute);

    const $tw = TiddlyWiki();
    // tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]
    $tw.boot.argv = [
      "++plugins/client",
      "++plugins/server",
      "./editions/mws",
      "--mws-load-plugin-bags",
      "--build", "load-mws-demo-data",
      // "--mws-listen", "port=5001", "host=::"
    ];
    await new Promise<void>(resolve => $tw.boot.boot(resolve));
    try {
      
    } catch(e){
      console.error(e);
    }

    (global as any).$tw = $tw;
    return new Router(rootRoute, $tw);
  }

  constructor(private rootRoute: rootRoute, public $tw: any) {

  }

  async handle(streamer: Streamer) {

    /** This should always have a length of at least 1 because of the root route. */
    const routePath = this.findRoute(streamer);
    if (!routePath.length || routePath[routePath.length - 1]?.route.denyFinal)
      return streamer.sendString(404, {}, "Not found", "utf8");

    // Optionally output debug info
    console.log("Request path:", JSON.stringify(streamer.url));
    console.log("Matched route:", routePath[routePath.length - 1]?.route.path.source)

    // if no bodyFormat is specified, we default to "buffer" since we do still need to recieve the body
    const bodyFormat = routePath.find(e => e.route.bodyFormat)?.route.bodyFormat || "buffer";

    type statetype = { [K in BodyFormat]: StateObject<K> }[BodyFormat]

    const state = createStrictAwaitProxy(
      new StateObject(streamer, routePath, bodyFormat, this) as statetype
    );

    Object.assign(state, await state.getOldAuthState());

    routePath.forEach(match => {
      if (!this.csrfDisable && !match.route.useACL.csrfDisable && state.authLevelNeeded === "writers" && state.headers["x-requested-with"] !== "TiddlyWiki")
        throw streamer.sendString(403, {}, "'X-Requested-With' header required to login to '" + this.servername + "'", "utf8");
    })


    const method = streamer.method;

    // anything that sends a response before this should have thrown, but just in case
    if (streamer.headersSent) return;

    if (["GET", "HEAD"].includes(method)) state.bodyFormat = "ignore";

    if (state.bodyFormat === "stream" || state.bodyFormat === "ignore") {
      // this starts dumping bytes early, rather than letting node do it once the res finishes.
      // the only advantage is that it eases congestion on the socket.
      if (state.bodyFormat === "ignore") streamer.reader.resume();

      return await this.handleRoute(state, routePath);
    }
    if (state.bodyFormat === "string" || state.bodyFormat === "json") {
      state.data = (await state.readBody()).toString("utf8");
      if (state.bodyFormat === "json") {
        // make sure this parses as valid data
        const { success, data } = z.string().transform(zodTransformJSON).safeParse(state.data);
        if (!success) return state.sendEmpty(400, {});
        console.log(state.data, data);
        state.data = data;
      }
    } else if (state.bodyFormat === "www-form-urlencoded-urlsearchparams" 
      || state.bodyFormat === "www-form-urlencoded") {
      const data = state.data = new URLSearchParams((await state.readBody()).toString("utf8"));
      if (state.bodyFormat === "www-form-urlencoded") {
        state.data = Object.fromEntries(data);
      }
    } else if (state.bodyFormat === "buffer") {
      state.data = await state.readBody();
    } else {
      // because it's a union, state becomes never at this point if we matched every route correctly
      // make sure state is never by assigning it to a never const. This will error if something is missed.
      const t: never = state;
      const state2: StateObject = state as any;
      return state2.sendString(500, {}, "Invalid bodyFormat: " + state2.bodyFormat, "utf8");
    }

    return await this.handleRoute(state, routePath);

  }



  async handleRoute(state: StateObject<BodyFormat>, route: RouteMatch[]) {

    {
      let result: any = state;
      for (const match of route) {
        await match.route.handler(result);
        if (state.headersSent) return;
      }
      if (!state.headersSent) {
        state.sendEmpty(404, {});
        console.log("No handler sent headers before the promise resolved.");
      }
    }
  }

  findRouteRecursive(
    routes: Route[],
    testPath: string,
    method: AllowedMethod
  ): RouteMatch[] {
    for (const potentialRoute of routes) {
      // Skip if the method doesn't match.
      if (!potentialRoute.method.includes(method)) continue;

      // Try to match the path.
      const match = potentialRoute.path.exec(testPath);

      if (match) {
        // The matched portion of the path.
        const matchedPortion = match[0];
        // Remove the matched portion from the testPath.
        const remainingPath = testPath.slice(matchedPortion.length) || "/";

        const result = {
          route: potentialRoute,
          params: match.slice(1),
          remainingPath,
        };
        const { childRoutes = [] } = potentialRoute as any; // see this.defineRoute
        // If there are inner routes, try to match them recursively.
        if (childRoutes.length > 0) {
          const innerMatch = this.findRouteRecursive(
            childRoutes,
            remainingPath,
            method
          );
          return [result, ...innerMatch];
        } else {
          return [result];
        }
      }
    }
    return [];
  }

  /**
   * 
   * Top-level function that starts matching from the root routes.
   * Notice that the pathPrefix is assumed to have been handled beforehand.
   * 
   * @param streamer 
   * @returns The tree path matched
   */
  findRoute(streamer: Streamer): RouteMatch[] {
    const { method, urlInfo } = streamer;
    let testPath = urlInfo.pathname || "/";
    if (this.pathPrefix && testPath.startsWith(this.pathPrefix))
      testPath = testPath.slice(this.pathPrefix.length) || "/";
    return this.findRouteRecursive([this.rootRoute as any], testPath, method);
  }

}


interface RouteOptAny extends RouteOptBase<BodyFormat, AllowedMethod[], string[]> { }

export interface Route extends RouteDef<ParentTuple, string[]> { }

export interface rootRoute extends RouteDef<[
  undefined,
  AllowedMethod[],
  StateObject<BodyFormat, AllowedMethod>,
  [[]]
], []> { }

export interface RouteMatch {
  route: Route;
  params: (string | undefined)[];
  remainingPath: string;
}

type DetermineRouteOptions<
  P extends ParentTuple, PA extends string[]
> = P extends [BodyFormat, AllowedMethod[], any, any]
  ?
  RouteOptBase<P[0], P[1], PA> & { bodyFormat?: undefined; }
  :
  P extends [undefined, AllowedMethod[], any, any]
  ?
  | { [K in BodyFormat]: RouteOptBase<K, P[1], PA> & { bodyFormat: K; }; }[BodyFormat]
  | RouteOptBase<BodyFormat, P[1], PA> & { bodyFormat?: undefined; }
  : never;

type ParentTuple = [BodyFormat | undefined, AllowedMethod[], any, string[][]];

interface RouteOptBase<B extends BodyFormat, M extends AllowedMethod[], PA extends string[]> {
  /** The ACL options for this route. It is required to simplify updates, but could be empty by default */
  useACL: AuthStateRouteACL;
  /** 
   * Regex to test the pathname on. It must start with `^`. If this is a child route, 
   * it will be tested against the remaining portion of the parent route.  
   */
  path: RegExp;
  pathParams?: PA;
  /** The uppercase method names to match this route */
  method: M;
  /** 
   * The highest bodyformat in the chain always takes precedent. Type-wise, only one is allowed, 
   * but at runtime the first one found is the one used. 
   * 
   * Note that bodyFormat is completely ignored for GET and HEAD requests.
   */
  bodyFormat?: B;
  /** If this route is the last one matched, it will NOT be called, and a 404 will be returned. */
  denyFinal?: boolean;
}

interface RouteDef<P extends ParentTuple, PA extends string[]> extends RouteOptBase<P[0] & {}, P[1], PA> {

  /**
   * If this route's handler sends headers, the matched child route will not be called.
   */
  handler: (state: StateObject<P[0] extends undefined ? BodyFormat : (P[0] & {}), P[1][number], [...P[3], [...PA]], unknown>) => Promise<P[2]>

  /**
   * ### ROUTING
   *
   * @param route The route definition.
   *
   * If the parent route sends headers, or returns the STREAM_ENDED symbol, 
   * this route will not be called.
   *
   * Inner routes are matched on the remaining portion of the parent route
   * using `pathname.slice(match[0].length)`. If the parent route entirely 
   * matches the pathname, this route will be matched on "/".
   * 
   * If the body format is "stream", "buffer", "ignore" or not yet defined at this level in the tree,
   * then zod cannot be used. 
   * 
   * Note that GET and HEAD are always bodyFormat: "ignore", regardless of what is set here.
   */
  defineRoute: <R, PA extends string[],
    // T extends DetermineRouteOptions<P, [...PA]>
    T extends P extends [BodyFormat, AllowedMethod[], any, any]
    ?
    RouteOptBase<P[0], P[1], [...PA]> & { bodyFormat?: undefined; }
    :
    P extends [undefined, AllowedMethod[], any, any]
    ?
    | { [K in BodyFormat]: RouteOptBase<K, P[1], [...PA]> & { bodyFormat: K; }; }[BodyFormat]
    | RouteOptBase<BodyFormat, P[1], [...PA]> & { bodyFormat?: undefined; }
    : never
  >(
    route: T,
    handler: (
      /** 
       * The state object for this route.
       * 
       * If the route only specifies "GET" and/or "HEAD", then the bodyFormat can only be "ignore"
       * 
       * Otherwise, the bodyFormat is determined by the first parent route that specifies it.
       * 
       * The state object is wrapped in a proxy which throws if methods return a promise that 
       * doesn't get awaited before the next property access. It only enforces the first layer 
       * of properties, so if you have a nested object, you will need to wrap it in a proxy as well.
       * 
       * store and store.sql will probably also be wrapped in this proxy.
       */
      state: StateObject<
        // if the route only specifies "GET" and/or "HEAD", then the bodyFormat can only be "ignore"
        (Exclude<T["method"][number], "GET" | "HEAD"> extends never ? never : (
          // parent route specified bodyFormat?
          P[0] extends BodyFormat ? P[0] :
          // this route specified bodyFormat?
          T["bodyFormat"] extends BodyFormat ? T["bodyFormat"] :
          // otherwise it could be anything
          BodyFormat
        )) | (
          // GET and HEAD requests imply "ignore"
          T["method"][number] extends "GET" | "HEAD" ? "ignore" : never
        ),
        // HTTP method
        T["method"][number],
        // possible placeholder for declaring routes
        getPA<P, T>,
        // infer zod, if set for this route
        unknown
      >) => Promise<R>
  ) =>
    P[0] extends BodyFormat ? RouteDef<[P[0], T["method"], R, P[3]], [...PA]> :
    T["bodyFormat"] extends BodyFormat ? RouteDef<[T["bodyFormat"], T["method"], R, P[3]], [...PA]> :
    RouteDef<[undefined, T["method"], R, P[3]], [...PA]>

  $o?: P;
}

type getPA<P extends ParentTuple, T extends DetermineRouteOptions<P, any>> =
  [...P[3], ...T["pathParams"] extends string[] ? [T["pathParams"]] : []];
function test<T extends z.ZodTypeAny>(schema: { schema: T }): T {
  return schema.schema;
}
const test1 = test({ schema: z.object({ test: z.string() }) })
type t1 = typeof test1;
type t2 = z.infer<t1>;

const ROOT_ROUTE: unique symbol = Symbol("ROOT_ROUTE");

function defineRoute(
  parent: { $o?: any, method: any } | typeof ROOT_ROUTE,
  route: RouteOptAny,
  handler: (state: any) => any,
) {

  if (route.bodyFormat && !BodyFormats.includes(route.bodyFormat))
    throw new Error("Invalid bodyFormat: " + route.bodyFormat);
  if (!route.method.every(e => (parent === ROOT_ROUTE ? AllowedMethods : parent.method).includes(e)))
    throw new Error("Invalid method: " + route.method);
  if (route.path.source[0] !== "^")
    throw new Error("Path regex must start with ^");

  if (parent !== ROOT_ROUTE) {
    // the typing is too complicated if we add childRoutes
    if (!(parent as any).childRoutes) (parent as any).childRoutes = [];
    (parent as any).childRoutes.push(route);
  }

  (route as any).defineRoute = (...args: [any, any]) => defineRoute(route, ...args);

  (route as any).handler = handler;

  return route as any; // this is usually ignored except for the root route.
}
/** This doesn't need to run, it's just to test types */
function testroute(root: rootRoute) {

  const test1 = root.defineRoute({
    useACL: {},
    path: /^test/,
    method: ["GET", "POST"],
    bodyFormat: undefined,
  }, async state => {
    const test: BodyFormat = state.bodyFormat;
  });

  const test2_2 = test1.defineRoute({
    useACL: {},
    path: /^test/,
    bodyFormat: "www-form-urlencoded",
    method: ["POST"],
  }, async state => {
    // zod: z.object({ test: z.string() }),


  });

  const test2 = test1.defineRoute({
    useACL: {},
    path: /^test/,
    bodyFormat: "string",
    method: ["GET"],
    zod: z.string(),
    // handler: ,
  }, async (state) => {
    //@ts-expect-error because we didn't include "string"
    const test: Exclude<BodyFormat, "ignore"> = state.bodyFormat;
    // no error here if bodyFormat is correctly typed
    const test2: "ignore" = state.bodyFormat
    // @ts-expect-error because it should be "string"
    state.isBodyFormat("buffer");
    // this should never be an error unless something is really messed up
    state.isBodyFormat("ignore");
  });

  const test3 = test2.defineRoute({
    useACL: {},
    path: /^test/,
    method: ["GET"],
    // // @ts-expect-error because it's already been defined by the parent
    // bodyFormat: "buffer",
    zod: z.string(),
  }, async (state) => {
    //@ts-expect-error because we didn't include "string"
    const test: Exclude<BodyFormat, "ignore"> = state.bodyFormat;
    // no error here if bodyFormat is correctly typed
    const test2: "ignore" = state.bodyFormat
    // @ts-expect-error because it should be "string"
    state.isBodyFormat("buffer");
    // this should never be an error unless something is really messed up
    state.isBodyFormat("ignore");
  })

  const test2post = test1.defineRoute({
    useACL: {},
    path: /^test/,
    bodyFormat: "string",
    method: ["POST"],
    zod: z.string(),
    // handler: ,
  }, async (state) => {
    // @ts-expect-error because we didn't include "string"
    const test: Exclude<BodyFormat, "string"> = state.bodyFormat;
    // no error here if bodyFormat is correctly typed
    const test2: "string" = state.bodyFormat
    // @ts-expect-error because it should be "string"
    state.isBodyFormat("buffer");
    // this should never be an error unless something is really messed up
    state.isBodyFormat("string");
  });

  const test3post = test2post.defineRoute({
    useACL: {},
    path: /^test/,
    method: ["POST"],
    // // @ts-expect-error because it's already been defined by the parent
    // bodyFormat: "buffer",
    zod: z.string(),
  }, async (state) => {
    // @ts-expect-error because we didn't include "string"
    const test: Exclude<BodyFormat, "string"> = state.bodyFormat;
    // no error here if bodyFormat is correctly typed
    const test2: "string" = state.bodyFormat
    // @ts-expect-error because it should be "string"
    state.isBodyFormat("buffer");
    // this should never be an error unless something is really messed up
    state.isBodyFormat("string");
  })
}