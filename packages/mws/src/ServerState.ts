import { ITXClientDenyList, Prisma, PrismaClient, Types } from "@tiddlywiki/mws-prisma";
import { dist_resolve } from "@tiddlywiki/server";
import { readFileSync } from "fs";
import { TW } from "tiddlywiki";
import { SessionManager, SessionManagerObject } from "./new-managers/sessions";
import { PluginCache } from "./plugin-cache/PluginCache";
import { createPasswordService } from "./services/PasswordService";
import { loadConfigSync } from "./ServerConfig";
import { SignData } from "./services/CryptoService";


/** This is an alias for ServerState in case we want to separate the two purposes. */
export type SiteConfig = ServerState;

/** Pre command server setup */
const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export class ServerState {


  wikiPath;
  storePath;
  cachePath;

  versions;
  rootRoutes;

  staticMounts;

  setupRequired = false;

  attachmentsEnabled = false;
  attachmentSizeLimit = 0; // 100 * 1024; // 100 KB
  enableDocsRoute = false;
  
  signer;

  // fieldModules;
  // contentTypeInfo: Record<string, ContentTypeInfo>;

  // getContentType(type?: string): ContentTypeInfo {
  //   return type && this.contentTypeInfo[type] || this.contentTypeInfo[DEFAULT_CONTENT_TYPE]!;
  // }

  SessionManager: SessionManagerObject;

  constructor(
    { wikiPath, cachePath, storePath }: {
      wikiPath: string,
      cachePath: string,
      storePath: string
    },
    // public wikiPath: string,
    /** The $tw instance needs to be disposable once commands are complete. */
    // $tw: TW,
    public engine: PrismaEngineClient,
    public PasswordService: PasswordService,
    public cryptoKey: CryptoKey,
    public pluginCache: PluginCache
  ) {
    this.wikiPath = wikiPath;
    this.cachePath = cachePath;
    this.storePath = storePath;

    // this.fieldModules = $tw.Tiddler.fieldModules;
    // this.contentTypeInfo = $tw.config.contentTypeInfo;

    this.SessionManager = SessionManager;

    const pkg = JSON.parse(readFileSync(dist_resolve("../package.json"), "utf8"));

    this.versions = { tw5: pluginCache.versions, mws: pkg.version as string };

    const cfg = loadConfigSync(wikiPath);

    this.rootRoutes = cfg.routeRoots;
    this.staticMounts = cfg.staticMounts;

    this.signer = new SignData(cryptoKey);

  }

  settings: {
    key: string;
    description: string;
    valueType: "string" | "boolean" | "number";
    value?: any;
  }[] = [
      // { key: "siteTitle", description: "Title for the site", valueType: "string" },
      // { key: "siteDescription", description: "Description for the site", valueType: "string" },
      // { key: "enableExternalPlugins", description: "Serve TiddlyWiki plugins via script tags", valueType: "boolean" },
      { key: "enableGzip", description: "Enable gzip compression for responses", valueType: "boolean" },
      // { key: "enableResponseCompression", description: "Compress server responses", valueType: "boolean" },
      // { key: "enableBrowserCache", description: "Enable browser caching of static assets", valueType: "boolean" },
      // { key: "attachmentsEnabled", description: "Enable attachments in the wiki", valueType: "boolean" },
      // { key: "attachmentSizeLimit", description: "Maximum size for attachments in bytes", valueType: "number" },
      // { key: "csrfDisable", description: "Disable CSRF protection (not recommended)", valueType: "boolean" },
      // { key: "enableDevServer", description: "Enable development server features (not recommended for production)", valueType: "boolean" },
      // { key: "enableDocsRoute", description: "Enable documentation route for the server API", valueType: "boolean" }
    ];

  async init() {
    await SignData.importKey(crypto.getRandomValues(new Uint8Array(32)))

    const users = await this.engine.users.count();
    if (!users) { this.setupRequired = true; }

    const existing = Object.fromEntries((await this.engine.settings.findMany()).map(e => [e.key, e.value]));

    for (const { key, valueType } of this.settings) {
      if (typeof existing[key] === "undefined") {
        const value = valueType === "boolean" ? "false" : valueType === "number" ? "0" : "";
        await this.engine.settings.create({ data: { key, value } });
        existing[key] = value as any;
      }
    }

    await this.initSettings(existing);

    this.attachmentsEnabled = false;
    this.attachmentSizeLimit = 100 * 1024;

    this.enableDocsRoute = !!process.env.ENABLE_DOCS_ROUTE;

  }

  async initSettings(existing: Record<string, string>) {
    // this.enableExternalPlugins = existing.enableExternalPlugins === "true";
    // this.enableGzip = existing.enableGzip === "true";
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

  $transactionTupleDebug<P extends Prisma.PrismaPromise<any>[]>(fn: (prisma: PrismaTxnClient) => [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<Types.Utils.UnwrapTuple<P>> {
    return this.engine.$transaction(async (prisma) => {
      const queries = fn(prisma as PrismaTxnClient);
      const results = new Array(queries.length);
      for (let i = 0; i < queries.length; i++) {
        results[i] = await queries[i].catch(err => {
          console.error(`Error in query ${i + 1} of ${queries.length}:`, err.message);
          console.log(new Error().stack);
          throw err;
        });
      }
      return results as any;
    }, {
      maxWait: 10000,
      timeout: 20000,
    })
  }



}

declare global {
  type PrismaTxnClient = Omit<PrismaEngineClient, ITXClientDenyList>;
  type PrismaEngineClient = PrismaClient<never, never, {
    result: {
      // [T in Uncapitalize<Prisma.ModelName>]: {
      //   [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
      //     compute: () => PrismaField<Capitalize<T>, K>;
      //   };
      // };
    };
    client: {};
    model: {};
    query: {};
  }>
}

export interface ContentTypeInfo {
  encoding: string;
  extension: string | string[];
  flags?: string[];
  deserializerType?: string;
};

export type PasswordService = ART<typeof createPasswordService>;


