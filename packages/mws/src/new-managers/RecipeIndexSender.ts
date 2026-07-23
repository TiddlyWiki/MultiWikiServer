import { SendError, ServerRequest } from "@tiddlywiki/server";
import { createHash, pseudoRandomBytes, randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { mapGetInit } from "./wiki-utils";
import { IdString } from "@mws/admin-vanilla/src/definition/tabs";
import { serverEvents } from "@tiddlywiki/events";
import { defaultPreloadFunction, TiddlerHasher, WikiPluginCache } from "../plugin-cache";
import { RecipeInfo, RecipeResolver } from "./RecipeResolver";


type IndexData = ART<RecipeResolver["getIndexData"]>;
// #region serveIndex
export async function serveIndex(
  state: ServerRequest,
  recipe_slug: string,
  type: "index" | "store.js" | "store.json"
) {
  // we get close the transaction before we start sending the data 
  // so the transaction isn't held up by client bandwidth
  const getData = async () => {
    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      needsWrite: false
    }).then(e => {
      state.asserted = true;
      return e;
    });
    const skipBagTiddlers = state.method === "HEAD";
    const index = await state.$transaction(async (prisma) => {
      return await new RecipeResolver(recipe, prisma, state.user.isAdmin)
        .getIndexData(!skipBagTiddlers);
    });
    return { recipe, index };
  };

  switch (type) {
    case "index": {
      const { recipe, index } = await getData();

      return await new IndexSender(
        recipe,
        index,
        state,
        index.template.externalPlugins,
        BUILD_FLAG_EXTERNAL_STORE && index.template.externalStore
      ).serveIndexFile();
    }
    case "store.json":
    case "store.js": {



      const store = await (async () => {
        if (process.env.BUILD_FLAG_EXTERNAL_STORE) {
          const key = state.headers.cookie.get("mws_index_cache")!;
          const cached = IndexSender.storeCache.get(key) ?? await getData();
          IndexSender.storeCache.delete(key);
          const { recipe, index } = cached;
          return new StoreWriter(state, recipe, index, type);
        } else {
          const { recipe, index } = await getData();
          return new StoreWriter(state, recipe, index, type);
        }
      })();

      await store.init();

      const newEtag = store.getEtag("");
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
// #region StoreBase
class StoreBase {
  constructor(
    public recipe: RecipeInfo,
    private pluginCache: WikiPluginCache,
    public lastEventId: string,
    public template: IndexData["template"],
  ) { }

  get injectionFunction() { return this.template.injectionFunction; }
  public plugins: string[] = emptyArray;
  assertPlugins() {
    if (this.plugins === emptyArray)
      throw new Error("await this.init() first");
  }
  async init() {

    if (!this.injectionFunction) throw new Error("INJECTION_FUNCTION_FALSEY: injection function is falsey");

    const { customHtmlEnabled, requiredPluginsEnabled } = this.template;

    const plugins = [...new Set([
      ...(!customHtmlEnabled ? ["$:/core"] : []),
      ...(requiredPluginsEnabled ? this.pluginCache.requiredPlugins : []),
      ...this.recipe.plugins as string[],
    ]).values()];

    if (!this.pluginCache.cacheArrayStrings.includes(this.injectionFunction)) {
      await TiddlerHasher.assertTitleHashes(this.pluginCache, this.injectionFunction, plugins);
    }

    plugins.forEach(e => {
      if (!this.pluginCache.pluginFiles.has(e))
        console.log(`Recipe ${this.recipe.id} uses unknown plugin ${e}`);
    });

    this.plugins = plugins;

  }

  getEtag(template: string) {
    this.assertPlugins();
    const hash = createHash("md5");
    hash.update(template);
    hash.update(this.recipe.recipe_bags.map(e => e.bag.name).join(","));
    hash.update(this.plugins.map(e => this.pluginCache.pluginHashes(this.injectionFunction).get(e) ?? "").join(","));
    hash.update(String(this.lastEventId ?? 0));
    const contentDigest = hash.digest("hex");
    return `"${contentDigest}"`;
  }
}

const emptyArray = Object.seal([])
// #region - IndexSender
export class IndexSender extends StoreBase {
  static storeCache = new Map<string, { recipe: RecipeInfo, index: IndexData }>();

  makeStoreWriter;
  makeStoreData

  constructor(
    recipe: RecipeInfo,
    index: IndexData,
    private state: ServerRequest<any, any>,
    private enableExternalPlugins: boolean,
    private enableExternalStore: boolean,
  ) {
    super(recipe, state.pluginCache, index.lastEventId, index.template);

    this.makeStoreWriter = () => {
      const writer = new StoreWriter(
        state,
        recipe,
        index,
        this.injectStore ? "store.js" : "store.json"
      );
      writer.plugins = this.plugins;
      return writer;
    }
    this.makeStoreData = () => ({ recipe, index });
  }

  private get injectStore() { return this.customHtmlEnabled; }
  private get injectionLocation() { return this.template.injectionLocation; }
  private get customHtmlEnabled() { return this.template.customHtmlEnabled; }
  private get pluginFiles() { return this.state.pluginCache.pluginFiles; }

  private renderPluginTags(type: "script" | "preload", plugins: string[]) {
    const { pluginFiles, pluginHashes } = this.state.pluginCache;
    const preloadFunction = this.injectionFunction;


    return plugins.map(e => {
      const plugin = pluginFiles.get(e)!;
      const h = pluginHashes(preloadFunction).get(e)!;

      switch (type) {
        case "preload":
          return `<link rel="preload" href="${this.state.pathPrefix}/$cache/${plugin}/plugin.js?cb=${encodeURIComponent(preloadFunction)}" as="script" integrity="${h}" crossorigin="anonymous" />`;
        case "script":
          return `<script src="${this.state.pathPrefix}/$cache/${plugin}/plugin.js?cb=${encodeURIComponent(preloadFunction)}" integrity="${h}" crossorigin="anonymous"></script>`;
        default:
          { const exhaustive: never = type; }
          throw new Error(`Unknown plugin tag type: ${type}`);
      }
    }).join("\n") + "\n";
  }

  private renderStoreTags(type: "script" | "preload") {
    const pathPrefix = this.state.pathPrefix;
    const recipe = this.recipe.slug;
    switch (type) {
      case "preload":
        return `<link rel="preload" href="${pathPrefix}/recipe/${encodeURIComponent(recipe)}/store.js" as="script" crossorigin="anonymous" />`;
      case "script":
        return `<script src="${pathPrefix}/recipe/${encodeURIComponent(recipe)}/store.js" crossorigin="anonymous"></script>`;
      default:
        { const exhaustive: never = type; }
        throw new Error(`Unknown plugin tag type: ${type}`);
    }

  }

  async serveIndexFile() {
    if (this.plugins === emptyArray)
      await this.init();

    if (this.enableExternalPlugins) {
      this.state.writeEarlyHints({
        link: this.plugins.map(e => {
          const plugin = this.pluginFiles.get(e);
          return `<${this.state.pathPrefix}/$cache/${plugin}/plugin.js>; rel=preload; as=script`;
        }),
      });
    }

    const template = this.customHtmlEnabled ? this.template.htmlContent :
      await readFile(resolve(this.state.config.cachePath, "tiddlywiki5.html"), "utf8");

    const newEtag = this.getEtag(template);
    const match = this.state.headers.ifNoneMatch.has(newEtag);

    const writerCacheKey = randomBytes(24).toString("base64url");



    this.state.writeHead(match ? 304 : 200, {
      contentType: "text/html",
      etag: newEtag,
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

    if (this.enableExternalPlugins || this.enableExternalStore || this.injectStore) {
      if (!this.customHtmlEnabled)
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

}
// #region StoreWriter
class StoreWriter extends StoreBase {

  dropLastSuffix: boolean;
  constructor(
    private state: Pick<ServerRequest, "user" | "pluginCache" | "write" | "writeFast" | "pipeFrom" | "pathPrefix" | "config">,
    recipe: RecipeInfo,
    index: IndexData,
    format: "store.js" | "store.json"
  ) {
    super(recipe, state.pluginCache, index.lastEventId, index.template);
    this.bagTiddlers = index.bagTiddlers;
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

  private prefix: string;
  private suffix: string;
  private bagTiddlers;

  private get cachePath() { return this.state.pluginCache.cachePath; }
  private get pluginFiles() { return this.state.pluginCache.pluginFiles; }

  async writeStore(keepLastSuffix: boolean) {

    if (!this.template.externalPlugins) {
      const fileStreams = this.plugins.map(e => createReadStream(join(this.cachePath, this.pluginFiles.get(e)!, "plugin.json")));
      for (const stream of fileStreams) {
        this.state.writeFast(this.prefix);
        await this.state.pipeFrom(stream);
        this.state.writeFast(this.suffix);
      }
    }

    const writeTiddler = async (fields: Record<string, string>, last: boolean = false) => {
      await this.state.write(this.prefix + JSON.stringify(fields).replace(/</g, "\\u003c") + (last && this.dropLastSuffix ? "" : this.suffix));
    };

    const r = new RecipeResolver(this.recipe, null, this.state.user.isAdmin);
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
      await writeTiddler(tiddler.fields);
    }

    const lastRevisionId = String(this.lastEventId ?? 0);

    await writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/bag",
      text: JSON.stringify(bagInfo),
      type: "application/json",
    });
    await writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/revision",
      text: JSON.stringify(revisionInfo),
      type: "application/json",
    });
    await writeTiddler({
      title: "$:/state/multiwikiclient/recipe/last_revision_id",
      text: lastRevisionId,
    });
    await writeTiddler({
      title: "$:/config/multiwikiclient/recipe",
      text: this.recipe.slug,
    });
    if (this.state.config.enableDevServer) {
      await writeTiddler({
        title: "$:/state/multiwikiclient/dev-mode",
        text: "yes"
      });
    }
    await writeTiddler({
      title: "$:/config/multiwikiclient/host",
      text: "$protocol$//$host$" + this.state.pathPrefix + "/",
    }, !keepLastSuffix);

  }
}
