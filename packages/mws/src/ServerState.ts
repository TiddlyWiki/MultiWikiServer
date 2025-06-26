import { PrismaClient, Prisma } from "prisma-client";
import { ITXClientDenyList } from "prisma-client/runtime/library";
import { TW } from "tiddlywiki";
import pkg from "../../../package.json";
import { createPasswordService } from "./services/PasswordService";
import { startupCache } from "./services/cache";
import { Types } from "prisma-client/runtime/library";

/** This is an alias for ServerState in case we want to separate the two purposes. */
export type SiteConfig = ServerState;

/** Pre command server setup */
const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export class ServerState {

  constructor(
    { wikiPath, cachePath, storePath }: {
      wikiPath: string,
      cachePath: string,
      storePath: string
    },
    // public wikiPath: string,
    /** The $tw instance needs to be disposable once commands are complete. */
    $tw: TW,
    public engine: PrismaEngineClient,
    public PasswordService: PasswordService,
    public pluginCache: TiddlerCache
  ) {
    this.wikiPath = wikiPath;
    this.cachePath = cachePath;
    this.storePath = storePath;

    this.fieldModules = $tw.Tiddler.fieldModules;
    this.contentTypeInfo = $tw.config.contentTypeInfo;

    if (!this.contentTypeInfo[DEFAULT_CONTENT_TYPE])
      throw new Error(
        "The content type info for "
        + DEFAULT_CONTENT_TYPE
        + " cannot be found in TW5"
      );




    this.versions = { tw5: $tw.packageInfo.version, mws: pkg.version };

  }

  settings: {
    key: string;
    description: string;
    valueType: "string" | "boolean" | "number";
    value?: any;
  }[] = [
      // { key: "siteTitle", description: "Title for the site", valueType: "string" },
      // { key: "siteDescription", description: "Description for the site", valueType: "string" },
      { key: "enableExternalPlugins", description: "Serve TiddlyWiki plugins via script tags", valueType: "boolean" },
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
    const users = await this.engine.users.count();
    if (!users) { this.setupRequired = true; }

    const existing = Object.fromEntries((await this.engine.settings.findMany()).map(e => [e.key, e.value]));

    for (const { key, valueType } of this.settings) {
      const value = valueType === "boolean" ? "false" : valueType === "number" ? "0" : "";
      if (typeof existing[key] === "undefined") {
        await this.engine.settings.create({ data: { key, value } });
        existing[key] = value as any;
      }
    }

    await this.initSettings(existing);

    this.attachmentsEnabled = false;
    this.attachmentSizeLimit = 100 * 1024;

    this.enableDevServer = process.env.ENABLE_DEV_SERVER === "mws";
    this.enableDocsRoute = !!process.env.ENABLE_DOCS_ROUTE;

    if (this.enableDevServer) {
      this.enableExternalPlugins = true;
      this.enableGzip = true;
    }
  }

  async initSettings(existing: Record<string, string>) {

    this.enableExternalPlugins = existing.enableExternalPlugins === "true";
    this.enableGzip = existing.enableGzip === "true";
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

  wikiPath;
  storePath;
  cachePath;

  versions;

  setupRequired = false;

  enableExternalPlugins = true;
  enableGzip = true;

  attachmentsEnabled = false;
  attachmentSizeLimit = 0; // 100 * 1024; // 100 KB
  enableDevServer = false;
  enableDocsRoute = false;

  fieldModules;
  contentTypeInfo: Record<string, ContentTypeInfo>;

  getContentType(type?: string): ContentTypeInfo {
    return type && this.contentTypeInfo[type] || this.contentTypeInfo[DEFAULT_CONTENT_TYPE]!;
  }


}

declare global {
  type PrismaTxnClient = Omit<PrismaEngineClient, ITXClientDenyList>;
  type PrismaEngineClient = PrismaClient<Prisma.PrismaClientOptions, never, {
    result: {
      [T in Uncapitalize<Prisma.ModelName>]: {
        [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
          compute: () => PrismaField<Capitalize<T>, K>;
        };
      };
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
export type TiddlerCache = ART<typeof startupCache>;
