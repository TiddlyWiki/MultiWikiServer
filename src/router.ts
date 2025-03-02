import { Streamer } from "./streamer";
import { StateObject } from "./StateObject";
import RootRoute from "./routes";
import * as z from "zod";
import { createStrictAwaitProxy } from "./helpers";
import { existsSync, mkdirSync } from "fs";
import { AttachmentStore } from "./store/attachments";
import { resolve } from "path";
import { Prisma, PrismaClient } from "@prisma/client";
import { bootTiddlyWiki } from "./tiddlywiki";
import {
  Route,
  rootRoute,
  RouteOptAny,
  RouteMatch,
} from "./rootRoute";
import { setupDevServer } from "./serve-esbuild";
import { Authenticator, PasswordCreation } from "./Authenticator";
import * as opaque from "@serenity-kit/opaque";

export { RouteMatch, Route, rootRoute };

export const AllowedMethods = [...["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"] as const];
export type AllowedMethod = typeof AllowedMethods[number];

export const BodyFormats = ["stream", "string", "json", "buffer", "www-form-urlencoded", "www-form-urlencoded-urlsearchparams", "ignore"] as const;
export type BodyFormat = typeof BodyFormats[number];

export const PermissionName = []


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


  static async makeRouter(wikiPath: string) {



    const rootRoute = defineRoute(ROOT_ROUTE, {
      useACL: { csrfDisable: true },
      method: AllowedMethods,
      path: /^/,
      denyFinal: true,
    }, async (state: any) => state);

    await RootRoute(rootRoute);

    const storePath = resolve(wikiPath, "store");

    const createTables = !existsSync(resolve(storePath, "database.sqlite"));

    mkdirSync(storePath, { recursive: true });

    const $tw = (global as any).$tw = await bootTiddlyWiki(createTables, createTables, wikiPath);

    const sendDevServer = await setupDevServer();

    const router = new Router(rootRoute, $tw, wikiPath, sendDevServer);

    await Authenticator.ready;

    await this.initDatabase(router);

    return router;
  }

  static async initDatabase(router: Router) {
    await router.engine.sessions.deleteMany();
    // delete these during dev stuff
    const users = await router.engine.users.findMany();
    for (const user of users) {
      await router.engine.users.update({
        data: { roles: { set: [] } },
        where: { user_id: user.user_id }
      })
    }
    await router.engine.acl.deleteMany();
    await router.engine.users.deleteMany();
    await router.engine.groups.deleteMany();
    await router.engine.roles.deleteMany();
    // await router.engine.permissions.deleteMany();




    await router.engine.roles.createMany({
      data: [
        { role_id: 1, role_name: "ADMIN", description: "System Administrator" },
        { role_id: 2, role_name: "USER", description: "Basic User" },
      ]
    });
    const user = await router.engine.users.create({
      data: { username: "admin", email: "", password: "", roles: { connect: { role_id: 1 } } },
      select: { user_id: true }
    });

    const password = PasswordCreation(user.user_id.toString(), "1234");

    await router.engine.users.update({
      where: { user_id: user.user_id },
      data: { password: password }
    })

  }

  engine: PrismaClient<{ datasourceUrl: string }, never, {
    result: {
      [T in Prisma.ModelName]: {
        [K in keyof PrismaPayloadScalars<T>]: () => {
          compute: () => PrismaField<T, K>
        }
      }
    },
    client: {},
    model: {},
    query: {},
  }>;
  storePath: string;
  databasePath: string;
  attachmentStore: AttachmentStore
  constructor(
    private rootRoute: rootRoute,
    public $tw: any,
    public wikiPath: string,
    public sendDevServer: (this: Router, state: StateObject) => Promise<symbol>,
  ) {
    this.attachmentStore = $tw.mws.attachmentStore;
    this.storePath = resolve(wikiPath, "store");
    this.databasePath = resolve(this.storePath, "database.sqlite");
    this.engine = new PrismaClient({ datasourceUrl: "file:" + this.databasePath });
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
    // console.log(state.authenticatedUser)

    routePath.forEach(match => {
      if (!this.csrfDisable
        && !match.route.useACL.csrfDisable
        && state.authLevelNeeded === "writers"
        && state.headers["x-requested-with"] !== "TiddlyWiki"
      )
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
    ok(!state.authenticatedUser || state.authenticatedUser.user_id, "authenticatedUser must have a user_id");
    ok(!state.authenticatedUser || state.authenticatedUser.username, "authenticatedUser must have a username");


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