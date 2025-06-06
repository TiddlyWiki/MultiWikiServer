import { Prisma } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { TW } from "tiddlywiki";
import pkg from "../package.json";
import { startupCache } from "./services/cache";
import { createPrismaClient } from "@tiddlywiki/mws-prisma";
import { serverEvents } from "@tiddlywiki/server";
import { existsSync, mkdirSync } from "fs";
import * as path from "path";
import { bootTiddlyWiki } from "./services/tiddlywiki";

/** This is an alias for ServerState in case we want to separate the two purposes. */
export type SiteConfig = ServerState;

/** Pre command server setup */

const DEFAULT_CONTENT_TYPE = "application/octet-stream";
declare const purpose: unique symbol;

export class ServerState {
  wikiPath;
  storePath;
  cachePath;

  constructor(
    paths: {
      wikiPath: string;
      storePath: string;
      cachePath: string;
    },
    /** The $tw instance needs to be disposable once commands are complete. */
    $tw: TW,
    public engine: PrismaEngineClient,
    public pluginCache: TiddlerCache,

  ) {
    const { wikiPath, storePath, cachePath } = paths;
    this.wikiPath = wikiPath;
    this.storePath = storePath;
    this.cachePath = cachePath;

    this.fieldModules = $tw.Tiddler.fieldModules;
    this.contentTypeInfo = $tw.config.contentTypeInfo;

    if (!this.contentTypeInfo[DEFAULT_CONTENT_TYPE])
      throw new Error(
        "The content type info for "
        + DEFAULT_CONTENT_TYPE
        + " cannot be found in TW5"
      );

    this.enableBrowserCache = true;
    this.enableGzip = true;
    this.attachmentsEnabled = false;
    this.attachmentSizeLimit = 100 * 1024;
    this.csrfDisable = false;

    this.enableExternalPlugins = !!process.env.ENABLE_EXTERNAL_PLUGINS;
    this.enableDevServer = !!process.env.ENABLE_DEV_SERVER;
    this.enableDocsRoute = !!process.env.ENABLE_DOCS_ROUTE;

    this.versions = { tw5: $tw.packageInfo.version, mws: pkg.version };

  }

  async init() {
    const users = await this.engine.users.count();
    if (!users) { this.setupRequired = true; }
  }

  $transaction<R>(
    fn: (prisma: Omit<ServerState["engine"], ITXClientDenyList>) => Promise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): Promise<R> {
    // $transaction doesn't have the client extensions types,
    // but should have them available (were they not just types).
    return this.engine.$transaction(fn as (prisma: any) => Promise<any>, options);
  }


  versions;

  setupRequired = false;

  enableBrowserCache;
  enableGzip;
  attachmentsEnabled;
  attachmentSizeLimit;
  enableExternalPlugins;
  enableDevServer;
  enableDocsRoute;
  csrfDisable;

  fieldModules;
  contentTypeInfo: Record<string, ContentTypeInfo>;

  getContentType(type?: string): ContentTypeInfo {
    return type && this.contentTypeInfo[type] || this.contentTypeInfo[DEFAULT_CONTENT_TYPE]!;
  }

}

declare global {

}

export interface ContentTypeInfo {
  encoding: string;
  extension: string | string[];
  flags?: string[];
  deserializerType?: string;
};

export type TiddlerCache = ART<typeof startupCache>;

export async function createServerState(wikiPath: string) {
  // note that this check is important even for cwd
  if (!existsSync(wikiPath)) throw "The wiki path does not exist";

  const $tw = await bootTiddlyWiki(wikiPath);

  const cachePath = path.resolve(wikiPath, "cache");
  mkdirSync(cachePath, { recursive: true });
  const cache = await startupCache($tw, path.resolve(wikiPath, "cache"));

  const storePath = path.resolve(wikiPath, "store");
  const devmode = !!process.env.ENABLE_DEV_SERVER;
  mkdirSync(storePath, { recursive: true });

  const engine = await createPrismaClient(storePath, devmode);

  const config = new ServerState(
    { wikiPath, storePath, cachePath },
    $tw,
    engine,
    cache
  );
  serverEvents.emitAsync("mws.init.before", config, $tw);
  await config.init();
  serverEvents.emitAsync("mws.init.after", config, $tw);
  return { config, $tw };
}
