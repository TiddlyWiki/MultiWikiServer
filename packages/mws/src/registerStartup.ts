import { PrismaClient } from "prisma-client";
import Debug from "debug";
import { serverEvents } from "@tiddlywiki/events";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { TW } from "tiddlywiki";
import { SqliteAdapter } from "./db/sqlite-adapter";
import { ServerState, TiddlerCache } from "./ServerState";
import { startupCache } from "./services/cache";
import { createPasswordService } from "./services/PasswordService";
import { bootTiddlyWiki } from "./services/tiddlywiki";
import * as opaque from "@serenity-kit/opaque";

declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.init.before": [config: ServerState, $tw: TW];
    "mws.init.after": [config: ServerState, $tw: TW];
    "mws.adapter.init.before": [adapter: SqliteAdapter];
    "mws.adapter.init.after": [adapter: SqliteAdapter];
    "mws.cache.init.before": [cachePath: string, $tw: TW];
    "mws.cache.init.after": [cache: TiddlerCache, $tw: TW];

  }
}

declare module "@tiddlywiki/commander" {
  interface BaseCommand {
    config: ServerState;
    $tw: TW;
  }
}
serverEvents.on("cli.execute.before", async (name, params, options, instance) => {
  const wikiPath = path.resolve(process.cwd());
  if (!existsSync(wikiPath)) throw "The wiki path does not exist";

  const $tw = await bootTiddlyWiki(wikiPath);
  const passwordService = await createPasswordService(readPasswordMasterKey(wikiPath));

  const cachePath = path.resolve(wikiPath, "cache");
  mkdirSync(cachePath, { recursive: true });
  serverEvents.emitAsync("mws.cache.init.before", cachePath, $tw);
  const cache = await startupCache($tw, cachePath);
  serverEvents.emitAsync("mws.cache.init.after", cache, $tw);

  const storePath = path.resolve(wikiPath, "store");
  mkdirSync(storePath, { recursive: true });
  const databasePath = path.resolve(storePath, "database.sqlite");

  writeFileSync(path.join(storePath, "KEEP_ALL_THESE_FILES.txt"), [
    "It is incredibly important that you do not delete any files ",
    "in the store folder, as they are all part of the sqlite database. ",
    "If you delete any of them, you will definitely lose data. ",
    "They are not temporary files, they are part of the database.",
  ].join("\n"));

  const adapter = new SqliteAdapter(databasePath, !!process.env.ENABLE_DEV_SERVER);
  serverEvents.emitAsync("mws.adapter.init.before", adapter);
  await adapter.init();
  serverEvents.emitAsync("mws.adapter.init.after", adapter);

  const engine: PrismaEngineClient = new PrismaClient({
    log: [
      ...Debug.enabled("prisma:query") ? ["query" as const] : [],
      "info", "warn"
    ],
    adapter: adapter.adapter
  });

  const config = new ServerState({ wikiPath, cachePath, storePath }, $tw, engine, passwordService, cache);
  serverEvents.emitAsync("mws.init.before", config, $tw);
  await config.init();
  serverEvents.emitAsync("mws.init.after", config, $tw);

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

