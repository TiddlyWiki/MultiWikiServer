import { Streamer } from "./streamer";
import { StateObject } from "./StateObject";
import RootRoute from "./routes";
import * as z from "zod";
import { createStrictAwaitProxy } from "./utils";
import { existsSync, mkdirSync, readFileSync } from "fs";
// import { AttachmentStore } from "./routes/attachments";
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
import { createPasswordService, PasswordService } from "./Authenticator";
import { MWSConfig, MWSConfigConfig } from "./server";
import * as sessions from "./routes/services/sessions";
import * as attacher from "./routes/services/attachments";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

export { RouteMatch, Route, rootRoute };

export const AllowedMethods = [...["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"] as const];
export type AllowedMethod = typeof AllowedMethods[number];

export const BodyFormats = ["stream", "string", "json", "buffer", "www-form-urlencoded", "www-form-urlencoded-urlsearchparams", "ignore"] as const;
export type BodyFormat = typeof BodyFormats[number];

export const PermissionName = []

export function adminWiki() {
  return (global as any).$tw.wiki;
}

const zodTransformJSON = (arg: string, ctx: z.RefinementCtx) => {
  try {
    if (arg === "") return undefined;
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

export interface RouterConfig extends MWSConfigConfig {
  attachmentSizeLimit: number;
  attachmentsEnabled: boolean;
  contentTypeInfo: Record<string, any>;
  saveLargeTextToFileSystem: never;
  storePath: string;
}

export class Router {


  static async makeRouter(
    config: MWSConfig["config"],
    passwordKey: string,
    SessionManager: typeof sessions.SessionManager,
    AttachmentService: typeof attacher.AttachmentService,
  ) {
    const { wikiPath } = config;

    const rootRoute = defineRoute(ROOT_ROUTE, {
      useACL: { csrfDisable: true },
      method: AllowedMethods,
      path: /^/,
      denyFinal: true,
    }, async (state: any) => state);

    await SessionManager.defineRoutes(rootRoute);

    await RootRoute(rootRoute);

    const storePath = resolve(wikiPath, "store");

    const createTables = !existsSync(resolve(storePath, "database.sqlite"));

    mkdirSync(storePath, { recursive: true });



    const routerConfig: RouterConfig = {
      ...config,
      attachmentsEnabled: !!config.saveLargeTextToFileSystem,
      attachmentSizeLimit: config.saveLargeTextToFileSystem ?? 0,
      contentTypeInfo: {},
      saveLargeTextToFileSystem: undefined as never,
      storePath: storePath,
    };

    const sendDevServer = await setupDevServer();

    const PasswordService = await createPasswordService(passwordKey);

    const router = new Router(rootRoute, routerConfig,
      sendDevServer,
      PasswordService,
      SessionManager,
      AttachmentService,
    );

    if (createTables) await router.libsql.executeMultiple(readFileSync("./prisma/schema.prisma.sql", "utf8"));

    (global as any).$tw = await bootTiddlyWiki(createTables, wikiPath, router);



    await this.initDatabase(router);

    return router;
  }

  static async initDatabase(router: Router) {
    // await router.engine.sessions.deleteMany();
    // delete these during dev stuff
    // const users = await router.engine.users.findMany();
    // for (const user of users) {
    //   await router.engine.users.update({
    //     data: { roles: { set: [] } },
    //     where: { user_id: user.user_id }
    //   })
    // }
    // await router.engine.acl.deleteMany();
    // await router.engine.users.deleteMany();
    // await router.engine.groups.deleteMany();
    // await router.engine.roles.deleteMany();
    // await router.engine.permissions.deleteMany();


    const userCount = await router.engine.users.count();

    if (!userCount) {

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


      const password = await router.PasswordService.PasswordCreation(user.user_id.toString(), "1234");

      await router.engine.users.update({
        where: { user_id: user.user_id },
        data: { password: password }
      });

      router.devuser = user.user_id;
    } else {
      const user = await router.engine.users.findFirst({
        where: { username: "admin" },
        select: { user_id: true }
      });
      if (user) {
        const password = await router.PasswordService.PasswordCreation(user.user_id.toString(), "1234");
        await router.engine.users.update({
          where: { user_id: user.user_id },
          data: { password: password }
        });
        router.devuser = user.user_id
      } else {
        router.devuser = 0;
      }
    }

  }

  pathPrefix: string = "";
  enableBrowserCache: boolean = true;
  enableGzip: boolean = true;
  csrfDisable: boolean = false;
  servername: string = "";
  variables = new Map();
  get(name: string): string {
    return this.variables.get(name) || "";
  }

  libsql;
  engine: PrismaClient<Prisma.PrismaClientOptions, never, {
    result: {
      // this types every output field with PrismaField
      [T in Uncapitalize<Prisma.ModelName>]: {
        [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
          compute: () => PrismaField<Capitalize<T>, K>
        }
      }
    },
    client: {},
    model: {},
    query: {},
  }>;
  devuser: number = 0;
  storePath: string;
  databasePath: string;
  constructor(
    private rootRoute: rootRoute,
    public config: RouterConfig,
    // public attachmentStore: AttachmentStore,
    public sendDevServer: (this: Router, state: StateObject) => Promise<symbol>,
    public PasswordService: PasswordService,
    public SessionManager: typeof sessions.SessionManager,
    public AttachmentService: typeof attacher.AttachmentService,
  ) {
    this.storePath = resolve(config.wikiPath, "store");
    this.databasePath = resolve(this.storePath, "database.sqlite");

    // for some reason prisma was freezing when loading the system bag favicons.
    // the libsql adapter has an additional advantage of letting us specify pragma 
    // and also gives us more control over connections. 

    this.libsql = createClient({ url: "file:" + this.databasePath });
    this.libsql.execute("pragma synchronous=off");
    const adapter = new PrismaLibSQL(this.libsql);
    this.engine = new PrismaClient({
      log: ["error", "info", "warn"],
      // datasourceUrl: "file:" + this.databasePath,
      adapter,
    });
  }

  async handle(streamer: Streamer) {

    const authUser = await this.SessionManager.parseIncomingRequest(streamer, this);

    /** This should always have a length of at least 1 because of the root route. */
    const routePath = this.findRoute(streamer);
    if (!routePath.length || routePath[routePath.length - 1]?.route.denyFinal)
      return streamer.sendEmpty(404, { "x-reason": "no-route" });

    // Optionally output debug info
    console.log("Request path:", JSON.stringify(streamer.url));
    const matchedRoute = routePath[routePath.length - 1];
    console.log("Matched route:", matchedRoute?.route.method, matchedRoute?.route.path.source)

    // if no bodyFormat is specified, we default to "buffer" since we do still need to recieve the body
    const bodyFormat = routePath.find(e => e.route.bodyFormat)?.route.bodyFormat || "buffer";

    type statetype = { [K in BodyFormat]: StateObject<K> }[BodyFormat]

    const state = createStrictAwaitProxy(
      new StateObject(streamer, routePath, bodyFormat, authUser.isLoggedIn ? authUser : null, this) as statetype
    );

    routePath.forEach(match => {
      if (!this.csrfDisable
        && !match.route.useACL.csrfDisable
        && ["POST", "PUT", "DELETE"].includes(streamer.method)
        && state.headers["x-requested-with"] !== "TiddlyWiki"
      )
        throw streamer.sendString(403, {
          "x-reason": "x-requested-with missing"
        }, `'X-Requested-With' header required to login to '${this.servername}'`, "utf8");
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