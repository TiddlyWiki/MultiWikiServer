import { ServerRequest } from "@tiddlywiki/server";
import { randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { mapGetInit } from "./wiki-utils";
import { defaultPreloadFunction, PluginCache } from "../plugin-cache";
import { RecipeInfo, RecipeResolver } from "./RecipeResolver";
import { TiddlerFields } from "tiddlywiki";
import { ok } from "node:assert";


type IndexData = ART<RecipeResolver["getIndexData"]>;
// #region serveIndex
export async function serveWikiIndex(
  state: ServerRequest,
  recipe_slug: string,
  type: "index" | "store.js" | "store.json",
  sendNotFound: boolean,
): Promise<typeof STREAM_ENDED | undefined> {
  // we get close the transaction before we start sending the data 
  // so the transaction isn't held up by client bandwidth
  const getData = async () => {
    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      sendNotFound,
    }).then(e => {
      state.asserted = true;
      return e;
    });
    if (!recipe) return null;
    const skipBagTiddlers = state.method === "HEAD";
    const index = await state.$transaction(async (prisma) => {
      return await new RecipeResolver(recipe, prisma, state.user)
        .getIndexData(!skipBagTiddlers);
    });
    const etag = index.getIndexEtag("", state.pluginCache);
    return { recipe, index, etag };
  };

  switch (type) {
    case "index": {
      const data = await getData();
      if (!data) return undefined;
      const { recipe, index, etag } = data;
      const { injectionFunction, twVersion } = index.template;
      const version = state.pluginCache.versionFromTemplate(twVersion);
      if (!version) throw new Error("wut");
      const template = index.template.customHtmlEnabled ? index.template.htmlContent :
        await readFile(resolve(state.config.cachePath, "tiddlywiki", version, "tiddlywiki5.html"), "utf8");
      const plugins = index.getPluginList();
      await initPlugins(state.pluginCache, injectionFunction, version, plugins);
      return await new WikiIndexSender(
        state,
        recipe,
        index,
        etag,
        plugins,
      ).serveIndexFile(template);
    }
    case "store.json":
    case "store.js": {


      const data = await (async () => {
        if (process.env.BUILD_FLAG_EXTERNAL_STORE) {
          const key = state.headers.cookie.get("mws_index_cache")!;
          const cached = IndexSender.storeCache.get(key) ?? await getData();
          IndexSender.storeCache.delete(key);
          return cached;
        } else {
          return await getData();
        }
      })();
      if (!data) return undefined;
      const { recipe, index, etag: newEtag } = data;
      const { injectionFunction, twVersion } = index.template;

      const version = state.pluginCache.versionFromTemplate(twVersion);

      const plugins = index.getPluginList();
      await initPlugins(state.pluginCache, injectionFunction, version, plugins);
      const store = new WikiStoreWriter(state, recipe, index, type, plugins, version);

      const match = state.headers.ifNoneMatch.has(newEtag);

      state.writeHead(match ? 304 : 200, {
        etag: newEtag,
        cacheControl: "max-age=0, private, no-cache",
      });

      switch (type) {
        case "store.js":
          state.applyHeaders({ contentType: { mediaType: "application/javascript", charset: "utf-8" } });
          break;
        case "store.json":
          state.applyHeaders({ contentType: { mediaType: "application/json", charset: "utf-8" } });
          break;
      }

      const isJSON = type === "store.json";
      if (state.method === "HEAD" || match)
        return state.end();
      if (isJSON)
        state.writeFast("[\n");

      await store.writeStore(false);

      if (isJSON)
        state.writeFast("]");
      return state.end();

    }
  }

}
export async function serveDocsIndex(
  state: ServerRequest,
  twVersion: string,
) {
  const { plugins, tiddlers } = await state.pluginCache.readTW5Docs(twVersion);
  const template = await readFile(resolve(state.config.cachePath, "tiddlywiki", twVersion, "tiddlywiki5.html"), "utf8");
  await new DocsIndexSender(state, plugins, tiddlers, twVersion).serveIndexFile(template);
}

// #region StoreBase


async function initPlugins(pluginCache: PluginCache, injectionFunction: string, version: string, plugins: string[]) {
  if (!injectionFunction) throw new Error("INJECTION_FUNCTION_FALSEY: injection function is falsey");

  if (!pluginCache.cacheArrayStrings.includes(injectionFunction)) {
    await pluginCache.assertTitleHashes(injectionFunction, version, plugins);
  }
}

const emptyArray = Object.seal([])
// #region - IndexSender
abstract class IndexSender {
  static storeCache = new Map<string, { recipe: RecipeInfo, index: IndexData, etag: string; }>();

  protected abstract makeStoreWriter: () => StoreWriter;
  protected abstract state: ServerRequest;
  protected abstract lastEventId: string;
  protected abstract enableExternalPlugins: boolean;
  protected abstract enableExternalStore: boolean;
  protected abstract injectStore: boolean;
  protected abstract injectionLocation: string;
  protected abstract injectionFunction: string;
  protected abstract customHtmlEnabled: boolean;
  protected abstract injectDefaultPreloadScript: boolean;
  protected abstract recipeSlug: string;
  protected abstract wikiSlug: string;
  protected abstract etag: string;
  protected abstract plugins: string[];
  protected abstract twVersion: string;



  private get cache() { return this.state.pluginCache; }

  private renderPluginTags(type: "script" | "preload", plugins: string[]) {
    // const { pluginFiles, pluginHashes } = this.state.pluginCache;
    const preloadFunction = this.injectionFunction;
    return plugins.map(e => {
      const plugin = this.cache.pluginPaths.get(this.twVersion, e)!;
      ok(plugin);
      const h = this.state.pluginCache.pluginHashes(preloadFunction).get(plugin)!;
      ok(h);
      switch (type) {
        case "preload":
          return `<link rel="preload" href="${this.state.pathPrefix + this.state.config.rootRoutes.cache}/${plugin}/plugin.js?cb=${encodeURIComponent(preloadFunction)}" as="script" integrity="${h}" crossorigin="anonymous" />`;
        case "script":
          return `<script src="${this.state.pathPrefix + this.state.config.rootRoutes.cache}/${plugin}/plugin.js?cb=${encodeURIComponent(preloadFunction)}" integrity="${h}" crossorigin="anonymous"></script>`;
        default:
          { const exhaustive: never = type; }
          throw new Error(`Unknown plugin tag type: ${type}`);
      }
    }).join("\n") + "\n";
  }

  private renderStoreTags(type: "script" | "preload") {
    const pathPrefix = this.state.pathPrefix;
    const endpt = this.state.config.rootRoutes.recipe;
    const recipe = this.recipeSlug;
    switch (type) {
      case "preload":
        return `<link rel="preload" href="${pathPrefix + endpt}/${this.recipeSlug}/store.js" as="script" crossorigin="anonymous" />`;
      case "script":
        return `<script src="${pathPrefix + endpt}/${this.recipeSlug}/store.js" crossorigin="anonymous"></script>`;
      default:
        { const exhaustive: never = type; }
        throw new Error(`Unknown plugin tag type: ${type}`);
    }

  }

  async serveIndexFile(template: string): Promise<typeof STREAM_ENDED> {

    if (this.enableExternalPlugins) {
      this.state.writeEarlyHints({
        link: this.plugins.map(e => {
          const plugin = this.cache.pluginPaths.get(this.twVersion, e);
          return `<${this.state.pathPrefix + this.state.config.rootRoutes.cache}/${plugin}/plugin.js>; rel=preload; as=script`;
        }),
      });
    }

    const match = this.state.headers.ifNoneMatch.has(this.etag);

    const writerCacheKey = randomBytes(24).toString("base64url");

    this.state.writeHead(match ? 304 : 200, {
      contentType: "text/html",
      etag: this.etag,
      cacheControl: "max-age=0, private, no-cache",
      setCookie: {
        name: "mws_index_cache",
        value: writerCacheKey,
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 10,
        path: this.state.pathPrefix + "/",
      }
    });

    if (this.state.method === "HEAD" || match)
      return this.state.end();


    // it is recommended to add <link rel="preload" to the header since these cannot be deferred
    // <link rel="preload" href="main.js" as="script" />
    // and recommended to specify the hashes for each file in their script tag. 
    // <script
    //   src="https://example.com/example-framework.js"
    //   integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
    //   crossorigin="anonymous"></script>
    // this needs to be added to the tiddlywiki file before the script tags
    // $tw = Object.create(null);
    // $tw.preloadTiddlers = $tw.preloadTiddlers || [];
    // $tw.preloadTiddler = function(fields) {
    //   $tw.preloadTiddlers.push(fields);
    // };

    const headPos = template.indexOf(this.injectionLocation);
    if (headPos === -1)
      throw new Error(`Cannot find ${this.injectionLocation} in ${this.customHtmlEnabled ? "custom html" : "template"}`);

    await this.state.write(template.substring(0, headPos) + "\n");

    if (this.enableExternalPlugins)
      await this.state.write(this.renderPluginTags("preload", this.plugins));

    if (this.enableExternalStore)
      await this.state.write(this.renderStoreTags("preload"));

    if (this.injectDefaultPreloadScript) {
      // this is hardcoded to the tiddlywiki default.
      // custom html needs to take care of this itself
      // boot prefix does this but it's in the body tag
      await this.state.write(`
<script>
window.$tw = window.$tw || Object.create(null);
$tw.preloadTiddlers = $tw.preloadTiddlers || [];
$tw.preloadTiddler = function(fields) {
  $tw.preloadTiddlers.push(fields);
};
</script>
`);
    }

    if (this.enableExternalPlugins)
      await this.state.write(this.renderPluginTags("script", this.plugins));


    if (this.enableExternalStore) {
      await this.state.write(this.renderStoreTags("script"));
      await this.state.write(template.substring(headPos));
      // this gets disabled by the build flag regardless of anything else
      // mostly because I can't find a valid reason to have this feature
      if (process.env.BUILD_FLAG_EXTERNAL_STORE) {
        IndexSender.storeCache.set(writerCacheKey, this.makeStoreData());
        setTimeout(() => { IndexSender.storeCache.delete(writerCacheKey); }, 20000);
      }
    } else {

      const loader = this.injectStore ? {
        state: this.state,
        before: async function () {
          this.state.writeFast("<script>\n");
        },
        after: async function () {
          this.state.writeFast("</script>\n");
          await this.state.write(template.substring(headPos));
        },
        writer: this.makeStoreWriter()
      } : {
        state: this.state,
        marker: "",
        markerPos: -1,
        before: async function () {
          // Splice into the tiddler store
          this.marker = `<script class="tiddlywiki-tiddler-store" type="application/json">[`;
          this.markerPos = template.indexOf(this.marker);
          if (this.markerPos === -1) throw new Error("Cannot find tiddler store in template");
          await this.state.write(template.substring(headPos, this.markerPos));
          await this.state.write(this.marker);
        },
        after: async function () {
          await this.state.write(template.substring(this.markerPos + this.marker.length));
        },

        writer: this.makeStoreWriter()
      }

      await loader.before();
      await loader.writer.writeStore(true);
      await loader.after();
    }

    return this.state.end();
  }
  makeStoreData(): never {
    throw new Error("not implemented");
  }
}
class WikiIndexSender extends IndexSender {
  protected lastEventId: string;
  protected enableExternalPlugins: boolean;
  protected enableExternalStore: boolean;
  protected injectStore: boolean;
  protected injectionLocation: string;
  protected customHtmlEnabled: boolean;
  protected injectDefaultPreloadScript: boolean;
  protected recipeSlug: string;
  protected wikiSlug: string;
  protected makeStoreWriter: () => StoreWriter;
  protected injectionFunction: string;
  protected pluginCache: PluginCache;
  protected twVersion: string;


  constructor(
    protected state: ServerRequest<any, any>,
    recipe: RecipeInfo,
    index: IndexData,
    protected etag: string,
    public plugins: string[],
  ) {
    super();
    this.lastEventId = index.lastEventId;
    this.enableExternalPlugins = index.template.externalPlugins;
    this.enableExternalStore = BUILD_FLAG_EXTERNAL_STORE && index.template.externalStore;
    this.injectStore = index.template.customHtmlEnabled;
    this.injectionLocation = index.template.injectionLocation;
    this.injectionFunction = index.template.injectionFunction;
    this.customHtmlEnabled = index.template.customHtmlEnabled;
    this.injectDefaultPreloadScript = index.injectDefault;
    this.recipeSlug = encodeURIComponent(recipe.slug);
    this.wikiSlug = recipe.slug;
    this.pluginCache = state.pluginCache;
    this.twVersion = state.pluginCache.versionFromTemplate(index.template.twVersion);

    this.makeStoreWriter = () => {
      return new WikiStoreWriter(
        state,
        recipe,
        index,
        this.injectStore ? "store.js" : "store.json",
        this.plugins,
        this.twVersion,
      );
    }
  }


}
class DocsIndexSender extends IndexSender {
  protected lastEventId: string;
  protected enableExternalPlugins: boolean;
  protected enableExternalStore: boolean;
  protected injectStore: boolean;
  protected injectionLocation: string;
  protected injectionFunction: string;
  protected customHtmlEnabled: boolean;
  protected injectDefaultPreloadScript: boolean;
  protected etag: string;
  protected recipeSlug: string;
  protected wikiSlug: string;
  protected makeStoreWriter: () => StoreWriter;
  protected pluginCache: PluginCache;

  constructor(
    protected state: ServerRequest,
    public plugins: string[],
    tiddlers: TiddlerFields[],
    protected twVersion: string,
  ) {
    super();
    this.pluginCache = state.pluginCache;
    this.injectDefaultPreloadScript = false;
    this.injectStore = false;
    this.injectionFunction = defaultPreloadFunction;
    this.etag = `"${twVersion}"`;
    this.lastEventId = "0";
    this.customHtmlEnabled = false;
    this.injectStore = false;
    this.injectDefaultPreloadScript = true;
    this.enableExternalPlugins = true;
    this.enableExternalStore = false;
    this.injectionLocation = "</head>";
    this.recipeSlug = undefined as never; // this should throw
    this.wikiSlug = "";
    this.makeStoreWriter = () => new DocsStoreWriter(state, tiddlers, "store.json", plugins, twVersion);
    this.twVersion = twVersion;

  }
}
// #region StoreWriter
abstract class StoreWriter {
  abstract writeStore(keepLastSuffix: boolean): Promise<void>;
  abstract state: ServerRequest;
  abstract prefix: string;
  abstract suffix: string;

  abstract lastEventId: string;
  abstract recipeSlug: string;
  abstract dropLastSuffix: boolean;
  abstract externalPlugins: boolean;
  abstract plugins: string[];
  abstract twVersion: string;

  // private get cachePath() { return this.state.pluginCache.cachePath; }
  // private get pluginFiles() { return this.state.pluginCache.pluginFiles; }
  private get cache() { return this.state.pluginCache; }

  writeTiddler = async (fields: Record<string, string>, last: boolean = false) => {
    await this.state.write(this.prefix + JSON.stringify(fields).replace(/</g, "\\u003c") + (last && this.dropLastSuffix ? "" : this.suffix));
  };

  writePlugins = async () => {
    if (!this.externalPlugins) {
      const fileStreams = this.plugins.map(e =>
        createReadStream(join(this.cache.wikiPath, "cache", this.cache.pluginPaths.get(this.twVersion, e)!, "plugin.json"))
      );
      for (const stream of fileStreams) {
        this.state.writeFast(this.prefix);
        await this.state.pipeFrom(stream);
        this.state.writeFast(this.suffix);
      }
    }
  }

  async writeFinalTiddlers(bagInfo: any, revisionInfo: any, keepLastSuffix: boolean) {

    await this.writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/bag",
      text: JSON.stringify(bagInfo),
      type: "application/json",
    });
    await this.writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/revision",
      text: JSON.stringify(revisionInfo),
      type: "application/json",
    });
    await this.writeTiddler({
      title: "$:/state/multiwikiclient/recipe/last_revision_id",
      text: this.lastEventId,
    });
    await this.writeTiddler({
      title: "$:/config/multiwikiclient/recipe",
      text: this.recipeSlug,
    });
    if (process.env.DEVSERVER) {
      await this.writeTiddler({
        title: "$:/state/multiwikiclient/dev-mode",
        text: "yes"
      });
    }
    await this.writeTiddler({
      title: "$:/config/multiwikiclient/host",
      text: "$protocol$//$host$" + this.state.pathPrefix + this.state.config.rootRoutes.recipe,
    }, !keepLastSuffix);

  }

}
class WikiStoreWriter extends StoreWriter {
  public prefix: string;
  public suffix: string;
  public lastEventId: string;
  public recipeSlug: string;
  public dropLastSuffix: boolean;
  public externalPlugins: boolean;


  private bagTiddlers;
  private injectionFunction: string;
  constructor(
    public state: ServerRequest,
    private recipe: RecipeInfo,
    index: IndexData,
    format: "store.js" | "store.json",
    public plugins: string[],
    public twVersion: string,
  ) {
    super();
    this.bagTiddlers = index.bagTiddlers;
    this.injectionFunction = index.template.injectionFunction;
    this.externalPlugins = index.template.externalPlugins;
    this.lastEventId = index.lastEventId;
    this.recipeSlug = recipe.slug;
    switch (format) {
      case "store.js":
        this.prefix = this.injectionFunction + "(";
        this.suffix = ");\n";
        this.dropLastSuffix = false;
        break;
      case "store.json":
        this.prefix = "";
        this.suffix = ",\n";
        this.dropLastSuffix = true;
        break;
    }
  }

  async writeStore(keepLastSuffix: boolean) {

    await this.writePlugins();

    const r = new RecipeResolver(this.recipe, null, this.state.user);
    // Build an index: title → set of bag_ids containing it.
    const titleBags = new Map<PrismaField<"Tiddler", "title">, Set<PrismaField<"Bag", "id">>>();
    const bagsMap = new Map<string, Map<string, IndexData["bagTiddlers"][number]["tiddlers"][number]>>();
    for (const row of this.bagTiddlers) {
      for (const row2 of row.tiddlers) {
        mapGetInit(titleBags, row2.title, () => new Set()).add(row.id);
        mapGetInit(bagsMap, row.id, () => new Map()).set(row2.title, row2);
      }
    }

    const bagInfo: Record<string, string> = {};
    const revisionInfo: Record<string, string> = {};

    for (const [title, titleBag] of titleBags.entries()) {
      // calculate title write target
      const target = r.getWriteTarget({ title });
      // find the correct bag to read from
      const info = r.getReadInfo({ presentSet: titleBag, target });
      // this line happens when a less specific writable bag containing the title 
      // is overshadowed by a more specific writable bag which does not contain the title
      if (!info.readFromBag) continue;
      // get the tiddler from the correct bag (should always exist)
      const tiddler = bagsMap.get(info.readFromBag.bag_id)!.get(title)!;
      // save the bag name for this title
      bagInfo[title] = info.readFromBag.bag.name;
      // save the revision for this title
      revisionInfo[title] = tiddler.revision.toString();
      // write the tiddler
      await this.writeTiddler(tiddler.fields);
    }

    await this.writeFinalTiddlers(bagInfo, revisionInfo, keepLastSuffix);
  }
}

class DocsStoreWriter extends StoreWriter {
  public prefix: string;
  public suffix: string;
  public lastEventId: string;
  public recipeSlug: string;
  public dropLastSuffix: boolean;
  public externalPlugins: boolean;


  private injectionFunction: string;
  constructor(
    public state: ServerRequest,
    private tiddlers: TiddlerFields[],
    format: "store.js" | "store.json",
    public plugins: string[],
    public twVersion: string,
  ) {
    super();
    this.injectionFunction = defaultPreloadFunction;
    this.externalPlugins = true;
    this.lastEventId = "0";
    this.recipeSlug = "tw5.com";
    switch (format) {
      case "store.js":
        this.prefix = this.injectionFunction + "(";
        this.suffix = ");\n";
        this.dropLastSuffix = false;
        break;
      case "store.json":
        this.prefix = "";
        this.suffix = ",\n";
        this.dropLastSuffix = true;
        break;
    }
  }

  async writeStore(keepLastSuffix: boolean) {

    await this.writePlugins();

    for (const fields of this.tiddlers) {
      await this.writeTiddler(fields);
    }

    const bagInfo: Record<string, string> = {};
    const revisionInfo: Record<string, string> = {};

    await this.writeFinalTiddlers(bagInfo, revisionInfo, keepLastSuffix);

  }
}
