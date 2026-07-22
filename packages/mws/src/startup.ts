import { serverEvents } from "@tiddlywiki/events";
import { Router, ServerRoute, dist_resolve, is } from "@tiddlywiki/server";
import { StateObject } from "./RequestState";
import { ServerState, TiddlerCache } from "./ServerState";
import { SessionManager } from "./new-managers/sessions";
import { ClientBuildDefinition, registerStatsRoute, SendAdmin, setupClientBuild } from "./services/setupDevServer";
import { secureHeaders } from 'hono/secure-headers';
import { PrismaClient } from "@tiddlywiki/mws-prisma";
import Debug from "debug";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { TW } from "tiddlywiki";
import { SqliteAdapter } from "./db/sqlite-adapter";
import { bootDefaultTiddlyWiki, defaultPreloadFunction, startupCache } from "./plugin-cache";
import { createPasswordService } from "./services/PasswordService";
import { bootTiddlyWiki } from "./services/tiddlywiki";
import * as opaque from "@serenity-kit/opaque";
import { UpdateTiddlyWikiCommand } from "./new-commands";


declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.config.init.before": [config: ServerState, $tw: TW];
    "mws.config.init.after": [config: ServerState, $tw: TW];
    "mws.adapter.init.before": [adapter: SqliteAdapter];
    "mws.adapter.init.after": [adapter: SqliteAdapter];
    "mws.cache.init.before": [{ cacheArrayStrings: string[] }];
    "mws.cache.init.after": [{ cache: TiddlerCache }];

  }
}

declare module "@tiddlywiki/commander" {
  interface BaseCommand {
    config: ServerState;
    $tw: TW;
  }
}
// this is the primary startup path
serverEvents.on("cli.execute.before", async (name, params, options, instance) => {
  const wikiPath = path.resolve(process.cwd());
  if (!existsSync(wikiPath)) throw "The wiki path does not exist";
  if (is<UpdateTiddlyWikiCommand>(instance, name === "update-tiddlywiki")) {
    instance.wikiPath = wikiPath;
    return;
  }
  const cachePath = path.resolve(wikiPath, "cache");

  const passwordService = await createPasswordService(readPasswordMasterKey(wikiPath));

  const cacheArrayStrings = [defaultPreloadFunction];
  await serverEvents.emitAsync("mws.cache.init.before", { cacheArrayStrings });
  const cache = await startupCache(wikiPath, cacheArrayStrings);
  await serverEvents.emitAsync("mws.cache.init.after", { cache });

  const storePath = path.resolve(wikiPath, "store");
  mkdirSync(storePath, { recursive: true });
  const databasePath = path.resolve(storePath, "database.sqlite");

  writeFileSync(path.join(storePath, "KEEP_ALL_THESE_FILES.txt"), [
    "It is incredibly important that you do not delete any files ",
    "in the store folder, as they are all part of the sqlite database. ",
    "If you delete any of them, you will definitely lose data. ",
    "They are not temporary files, they are part of the database.",
  ].join("\n"));

  const adapter = new SqliteAdapter(databasePath, !!process.env.DEVSERVER);
  await serverEvents.emitAsync("mws.adapter.init.before", adapter);
  await adapter.init();
  await serverEvents.emitAsync("mws.adapter.init.after", adapter);
  const engine: PrismaEngineClient = new PrismaClient({
    log: [
      ...Debug.enabled("prisma:query") ? ["query" as const] : [],
      "info", "warn"
    ],
    adapter: adapter.adapter
  });

  const $tw = await bootDefaultTiddlyWiki(wikiPath);
  const config = new ServerState({ wikiPath, cachePath, storePath }, $tw, engine, passwordService, cache);
  await serverEvents.emitAsync("mws.config.init.before", config, $tw);
  await config.init();
  await serverEvents.emitAsync("mws.config.init.after", config, $tw);

  instance.config = config;
  instance.$tw = $tw;
});

function readPasswordMasterKey(wikiPath: string) {
  const passwordKeyFile = path.join(wikiPath, "passwords.key");
  if (typeof passwordKeyFile === "string"
    && passwordKeyFile
    && !existsSync(passwordKeyFile)) {
    writeFileSync(passwordKeyFile, opaque.server.createSetup());
    console.log("Password master key created at", passwordKeyFile);
  }

  return readFileSync(passwordKeyFile, "utf8").trim();
}



declare module "@tiddlywiki/events" {
  /**
   * - "mws.router.init" event is emitted after setting the augmentations on Router.
   */
  interface ServerEventsMap {
    "mws.router.init": [router: Router];
    "mws.routes.important": [root: ServerRoute, config: ServerState];
    "mws.routes": [root: ServerRoute, config: ServerState];
    "mws.routes.fallback": [root: ServerRoute, config: ServerState];
  }

}
declare module "@tiddlywiki/server" {


  interface Router {
    config: ServerState;
    sendAdmin: SendAdmin;
  }

  interface AllowedRequestedWithHeaderKeys {
    TiddlyWiki: true;
  }
}

Router.allowedRequestedWithHeaders.TiddlyWiki = true;

export const clientBuildDef: ClientBuildDefinition = {
  // rootdir: dist_resolve("../packages/admin-mdui"),
  // publicdir: dist_resolve("../public/admin-mdui"),
  // title: "MWS Admin",
  rootdir: dist_resolve("../packages/admin-vanilla"),
  publicdir: dist_resolve("../public/admin-vanilla"),
  title: "MWS Admin",
};

// this is called by the listen command to create the router instance
serverEvents.on("listen.router.init", async (listen, router) => {

  router.config = listen.config;

  // router.sendAdmin = await setupDevServer(listen.config);
  // router.sendAdmin = await setupClientBuild({
  //   rootdir: dist_resolve("../packages/react-admin"),
  //   publicdir: dist_resolve("../public/react-admin")
  // });
  router.sendAdmin = await setupClientBuild(clientBuildDef);
  router.createServerRequest = async (request, ...args) => {
    const user = await SessionManager.parseIncomingRequest(request.cookies, router.config);
    return new StateObject(user, router, request, ...args);
  }
  router.hono = router.hono.use(secureHeaders({
    strictTransportSecurity: false,
    referrerPolicy: "strict-origin-when-cross-origin"
  }));

  await router.config.engine.roles.findMany({})

  await serverEvents.emitAsync("mws.router.init", router);

  await serverEvents.emitAsync("mws.routes.important", router.rootRoute, router.config);
  await serverEvents.emitAsync("mws.routes", router.rootRoute, router.config);
  registerStatsRoute(router.rootRoute, {
    "react": dist_resolve("../public/admin-react.json"),
    "vanilla": dist_resolve("../public/admin-vanilla.json"),
    "server": dist_resolve("metafile-esm.json"),
  });
  await serverEvents.emitAsync("mws.routes.fallback", router.rootRoute, router.config);
});

serverEvents.on("mws.routes.fallback", (root, config) => {

  root.defineRoute({
    method: ['GET'],
    path: /^\/.*/,
    bodyFormat: "stream",
  }, async state => {
    await state.sendAdmin();
    return STREAM_ENDED;
  });
});


