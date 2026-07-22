// New endpoints for the wikis → templates → types model (see NEW-DESIGN.md).
//
// Wikis are stored as `recipe` rows and addressed by recipe slug. The recipe
// and wiki endpoint families are kept separate, mirroring the existing code.
//
// All routing goes through a single shared resolver (RecipeResolver) so that
// single, batch, and list operations always present the same view and can
// never disagree about where a title routes.

import { SendError, ServerRequest } from "@tiddlywiki/server";
import { createHash, pseudoRandomBytes, randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { mapGetInit } from "./wiki-utils";
import { IdString } from "@mws/admin-vanilla/src/definition/tabs";
import { serverEvents } from "@tiddlywiki/events";
import { defaultPreloadFunction, TiddlerHasher, WikiPluginCache } from "../plugin-cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TiddlerInfo {
  title: string;
  writeTo: string | null;
  readFrom: string | null;
  existsIn: string[];
  canWrite: boolean;
}

interface BatchMutationResult {
  title: string;
  info: TiddlerInfo;
  revision?: string;
}

/** A bag in a recipe's ordering, lowest priority number = top of the stack. */
// interface RecipeBagRow {
//   bag_id: PrismaField<"Bag", "id">;
//   name: PrismaField<"Bag", "name">;
//   info: PrismaField<"RecipeBag", "info">;
//   priority: PrismaField<"RecipeBag", "priority">;
//   is_writable: PrismaField<"RecipeBag", "is_writable">;
// }

type RecipeInfo = ART<typeof RecipeResolver.assertRecipe>;
type RecipeBagRow = RecipeInfo["recipe_bags"][number];
type WriteTarget = ART<RecipeResolver["getWriteTarget"]>
type ReadInfo = ART<RecipeResolver["getReadInfo"]>;

// Permission levels are hierarchical: C_admin > B_write > A_read. Holding a
// higher level implies all lower ones. The A_/B_/C_ prefixes make alphabetical
// order match privilege order (asc = lowest first, desc = highest first).
const READ_LEVELS = ["A_read", "B_write", "C_admin"] as const;
const WRITE_LEVELS = ["B_write", "C_admin"] as const;

function inArray<T, S extends T>(b: T, a: readonly S[]) {
  return a.includes(b as any);
}

interface EverythingV1TemplateType {
  /** List of readonly bags for the writable bags to sit on top of */
  readonlyBags: PrismaField<"Bag", "id">[];
  /** 
   * write to separate bags based on the prefix of the title. 
   * name collisions favor longest matching prefix. 
   * the empty string marks the default bag. */
  writablePrefixBags: Record<string, PrismaField<"Bag", "id">>;
  // the following restrictions are applied separately from the writable prefix bags. 
  // they can be calculated in either order
  /** Roles restricted to write a shared prefix of tiddlers. */
  rolesWriteSharedPrefix?: [prefix: string, role: PrismaField<"Roles", "role_id">][];
  /** Roles restricted to write to a user-specific prefix of tiddlers */
  rolesWriteUserPrefix?: [prefix: string, role: PrismaField<"Roles", "role_id">][];
  /** Roles write to their own partition in the matched bag, subset of Permissions, both reads and writes invisible to other users. */
  rolesPartioned?: PrismaField<"Roles", "role_id">[];
  /** Roles write specific prefixes to their own partition in the matched bag, subset of Permissions, both reads and writes invisible to other users. */
  rolesWritePartionedPrefix?: [prefix: string, role: PrismaField<"Roles", "role_id">][]
}


// ---------------------------------------------------------------------------
// Resolver — shared routing + permission logic, scoped to one recipe.
// ---------------------------------------------------------------------------

export class RecipeResolver {

  // #region assertRecipe
  /**
   * Asserts the recipe exists and the user passes the read gate, then returns
   * the recipe's bags in display / read order (top first). Single round-trip:
   * bags, recipe permission, and per-bag permissions are all fetched together.
   *
   * Read gate: a user must have read on the recipe definition AND read on every
   * bag in the ordering (including empty ones). Admins bypass. Lacking any one
   * yields a 403, not a filtered view.
   */
  static async assertRecipe({ state, recipe_slug, needsWrite }: {
    state: ServerRequest
    recipe_slug: PrismaField<"Recipe", "slug">;
    needsWrite: boolean;
  }) {
    const prisma = state.engine;
    const isAdmin = state.user.isAdmin;
    const role_ids = state.user.roles.map((r) => r.role_id)
    const recipe = await prisma.recipe.findUnique({
      where: { slug: recipe_slug },
      select: {
        id: true,
        slug: true,
        plugins: true,
        template_id: true,
        // template: {
        //   select: { name: true, definition: true, type: true },
        // },
        permissions: {
          where: { role_id: { in: role_ids } },
          select: { role_id: true, level: true },
        },
        recipe_bags: {
          orderBy: { priority: "asc" },
          select: {
            bag_id: true,
            priority: true,
            is_writable: true,
            prefix: true,
            bag: {
              select: {
                name: true,
                permissions: {
                  where: { role_id: { in: role_ids } },
                  orderBy: { level: "desc" },
                  select: { role_id: true, level: true },
                },
              },
            },
          },
        },
      },
    });

    if (!recipe)
      throw state.sendEmpty(404, { "x-reason": "recipe not found" });

    if (!state.user.isAdmin) {
      if (!recipe.permissions.length)
        throw state.sendEmpty(403, { "x-reason": "no read access to the recipe definition" });
      if (recipe.recipe_bags.some(rb => !rb.bag.permissions.length))
        throw state.sendEmpty(403, { "x-reason": "missing read access on a bag in this wiki" });
    }

    // TODO: this was from assert access

    if (!recipe)
      throw new SendError("RECIPE_NOT_FOUND", 404, { recipeName: recipe_slug })

    if (!isAdmin && !recipe.permissions.length)
      throw new SendError("RECIPE_NO_READ_PERMISSION", 403, { recipeName: recipe_slug })

    const hasBagDeniedAccess = recipe.recipe_bags.find(recipeBag => !recipeBag.bag.permissions.length);

    if (!isAdmin && hasBagDeniedAccess)
      throw new SendError("BAG_NO_READ_PERMISSION", 403, { bagName: hasBagDeniedAccess.bag_id })

    if (!isAdmin && needsWrite) {

      state.okUser();

      const hasWriteAccess = recipe.recipe_bags
        .filter(recipeBag => recipeBag.is_writable)
        .some(recipeBag =>
          recipeBag.bag.permissions.some(permission => inArray(permission.level, WRITE_LEVELS))
        );

      if (!hasWriteAccess)
        throw new SendError("BAG_NO_WRITE_PERMISSION", 403, { bagName: "" });

    }
    return recipe;

  }

  // #region constructor

  constructor(
    private recipe: RecipeInfo,
    private prisma: PrismaTxnClient | null,
    private isAdmin: boolean,
  ) {

    const writablePrefixBags: Record<string, typeof recipe.recipe_bags[number]> = {};
    for (const rb of recipe.recipe_bags) {
      if (rb.is_writable) {
        writablePrefixBags[rb.prefix] = rb;
      }
    }
    this.readonlyBags = recipe.recipe_bags
      .filter(rb => !rb.is_writable)
      .map(rb => rb.bag_id);
    this.writablePrefixes = Object.entries(writablePrefixBags).sort(([a], [b]) => b.length - a.length);

  }
  readonlyBags;
  writablePrefixes;
  getWriteTarget({ title }: { title: string; }) {
    return this.writablePrefixes.find(([prefix]) => title.startsWith(prefix))?.[1] ?? null;
  }

  /** Whether the requesting user may write to the given bag (uses already-fetched permissions). */
  canWriteBag(rb: RecipeBagRow): boolean {
    if (this.isAdmin) return true;
    return (WRITE_LEVELS as readonly string[]).includes(rb.bag.permissions[0]?.level ?? "");
  }

  /**
   * Full TiddlerInfo for one title. For writable bags, a bag only contributes
   * to readFrom/existsIn when its prefix matches the title (i.e. it is the
   * write target). Readonly bags are always included.
   */
  async resolveInfo({ title, target }: {
    title: PrismaField<"Tiddler", "title">;
    /** recipe.getWriteTarget(title); */
    target: WriteTarget;
  }): Promise<TiddlerInfo> {
    const present = await this.prisma!.tiddler.findMany({
      where: { title, bag_id: { in: this.recipe.recipe_bags.map(b => b.bag_id) } },
      select: { bag_id: true },
    });
    const presentSet = new Set(present.map(p => p.bag_id));
    const info = this.getReadInfo({ presentSet, target });
    return this.mapResolveInfo({ title, info })
  }

  mapResolveInfo({ title, info }: {
    title: PrismaField<"Tiddler", "title">;
    info: ReadInfo;
  }): TiddlerInfo {
    return {
      title,
      canWrite: info.writeTarget !== null && this.canWriteBag(info.writeTarget),
      existsIn: info.existsIn.map(e => e.bag.name),
      readFrom: info.readFromBag?.bag.name ?? null,
      writeTo: info.writeTarget?.bag.name ?? null,
    };
  }

  getReadInfo({ presentSet, target }: {
    /** Set of bag ids containing this title, unsorted. */
    presentSet: Set<PrismaField<"Bag", "id">>;
    /** recipe.getWriteTarget(title); */
    target: WriteTarget;
  }) {
    const existsIn = this.recipe.recipe_bags.filter(b => presentSet.has(b.bag_id));
    const readFromBag = existsIn.find(b => b.is_writable ? (target !== null && b.bag_id === target.bag_id) : true);
    return { readFromBag, existsIn, writeTarget: target };
  }
  // #region listTiddlers
  async listTiddlers() {
    const rows = await this.prisma!.tiddler.findMany({
      where: { bag_id: { in: this.recipe.recipe_bags.map(b => b.bag_id) } },
      select: { bag_id: true, title: true },
    });

    // Build an inverted index: title → set of bag_ids containing it.
    const titleBags = new Map<PrismaField<"Tiddler", "title">, Set<PrismaField<"Bag", "id">>>();
    for (const row of rows) {
      mapGetInit(titleBags, row.title, () => new Set()).add(row.bag_id);
    }

    // For each unique title, derive existsIn (all containing bags in
    // priority order) and readFrom (the first / highest-priority one).
    // bags is already ordered ascending by priority (top bag first).
    return Array.from(titleBags.entries(), ([title, titleBag]) => {
      const target = this.getWriteTarget({ title });
      const info = this.getReadInfo({ presentSet: titleBag, target });
      return this.mapResolveInfo({ title, info });
    });
  }
  // #region readTiddlers
  async readTiddlers({ titles }: { titles: PrismaField<"Tiddler", "title">[]; }) {

    const rows = await this.prisma!.tiddler.findMany({
      select: {
        title: true,
        revision: true,
        bag: { select: { id: true } }
      },
      where: {
        bag_id: { in: this.recipe.recipe_bags.map(b => b.bag_id) },
        title: { in: titles }
      }
    });
    // Build an inverted index: title → set of bag_ids containing it.
    const titleBags = new Map<PrismaField<"Tiddler", "title">, Set<PrismaField<"Bag", "id">>>();
    for (const row of rows) {
      mapGetInit(titleBags, row.title, () => new Set()).add(row.bag.id);
    }
    const bagReads = new Map<PrismaField<"Bag", "id">, Map<PrismaField<"Tiddler", "title">, ReadInfo>>();
    for (const title of titles) {
      const tb = titleBags.get(title);
      if (!tb) continue;
      const ri = this.getReadInfo({ presentSet: tb, target: this.getWriteTarget({ title }) });
      if (!ri.readFromBag) continue;
      mapGetInit(bagReads, ri.readFromBag.bag_id, () => new Map()).set(title, ri);
    }
    const bags = await Promise.all(Array.from(bagReads.entries(), ([bag_id, titleMap]) => {
      return this.prisma!.bag.findUnique({
        where: { id: bag_id },
        include: { tiddlers: { where: { title: { in: Array.from(titleMap.keys()) } } } }
      });
    }));
    return bags.map(bag => {
      if (!bag) return [];
      return bag.tiddlers.map(({ title, fields, bag_id, revision }) => {
        const info = bagReads.get(bag_id)?.get(title);
        if (!info) return null;
        return ({
          fields: { ...fields, title, revision: revision.toString() },
          info: this.mapResolveInfo({ title, info })
        });
      });
    }).flat();
  }
  // #region saveTiddlers
  async saveTiddlers({ tiddlers }: { tiddlers: Record<string, any>[]; }): Promise<BatchMutationResult[]> {
    return await Promise.all((tiddlers ?? []).map(async fields => {
      const title = fields.title as PrismaField<"Tiddler", "title">;
      if (!title) throw "tiddler must have a title";
      const bag = this.getWriteTarget({ title });
      if (!bag || !this.canWriteBag(bag)) throw "write not permitted";
      const tiddler = await new WikiStore(this.prisma).saveTiddler({
        recipe_id: new IdString(this.recipe.id),
        bag_id: new IdString(bag.bag_id),
        fields
      });
      return {
        title,
        info: await this.resolveInfo({ title, target: bag }),
        revision: tiddler.revision.toString(),
      };
    }));
  }
  //#region deleteTiddlers
  async deleteTiddlers({ titles }: { titles: PrismaField<"Tiddler", "title">[]; }): Promise<(BatchMutationResult | null)[]> {
    return await Promise.all((titles ?? []).map(async title => {

      const bag = this.getWriteTarget({ title });
      if (!bag || !this.canWriteBag(bag)) throw "write not permitted";

      const event = await new WikiStore(this.prisma).deleteTiddler({
        recipe_id: new IdString(this.recipe.id),
        bag_id: new IdString(bag.bag_id),
        title,
      });

      return !event ? null : {
        title,
        info: await this.resolveInfo({ title, target: bag }),
        revision: event.seq.toString(),
      };
    }));
  }
  // #region getIndexData
  async getIndexData(includeTiddlers: boolean) {
    const maxSeq = await this.prisma!.tiddlerEvent.aggregate({ _max: { seq: true } });

    const bagIds = this.recipe.recipe_bags.map(e => e.bag_id);

    const templateRow = await this.prisma!.template.findUnique({ where: { id: this.recipe.template_id } });
    if (!templateRow) throw new Error("template not found");

    const { customHtmlEnabled, injectionFunction, injectionLocation } = templateRow.definition;
    const template = {
      ...templateRow.definition,
      name: templateRow.name,
      injectionFunction: customHtmlEnabled ? injectionFunction : defaultPreloadFunction,
      injectionLocation: customHtmlEnabled ? injectionLocation : "</head>",
    };

    const bagTiddlers = includeTiddlers ? await this.prisma!.bag.findMany({
      where: { id: { in: bagIds } },
      select: {
        id: true,
        name: true,
        tiddlers: {
          select: { title: true, fields: true, revision: true },
        },
      },
    }) : [];

    return { bagTiddlers, lastEventId: String(maxSeq._max.seq ?? 0), template }

  }

}
type IndexData = ART<RecipeResolver["getIndexData"]>;
// #region serveIndex
export async function serveIndex(
  state: ServerRequest,
  recipe_slug: string, type: "index" | "store"
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
        state.config.enableExternalPlugins,
        state.config.enableExternalStore,
      ).serveIndexFile();
    }
    case "store": {
      const store = await (async () => {
        const key = state.headers.cookie.get("mws_index_cache")!;
        const cached = IndexSender.storeCache.get(key) ?? await getData();
        IndexSender.storeCache.delete(key);
        // console.log(existed ? "cached" : "fresh");
        const { recipe, index } = cached;
        return new StoreWriter(state, recipe, index, true);
      })();

      await store.init();

      const newEtag = store.getEtag("");
      const match = state.headers.ifNoneMatch.has(newEtag);

      state.writeHead(match ? 304 : 200, {
        contentType: "text/html",
        etag: newEtag,
        cacheControl: "max-age=0, private, no-cache",
      });

      if (state.method === "HEAD" || match)
        return state.end();

      await store.writeStorePlugins();
      await store.writeStoreTiddlers();

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
        this.injectStore,
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
      IndexSender.storeCache.set(writerCacheKey, this.makeStoreData());
      setTimeout(() => { IndexSender.storeCache.delete(writerCacheKey); }, 20000);
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
      await loader.writer.writeStorePlugins();
      await loader.writer.writeStoreTiddlers();
      await loader.after();
    }

    return this.state.end();
  }

}

class StoreWriter extends StoreBase {


  constructor(
    private state: Pick<ServerRequest, "user" | "pluginCache" | "write" | "writeFast" | "pipeFrom" | "pathPrefix" | "config">,
    recipe: RecipeInfo,
    index: IndexData,
    injectStore: boolean,
  ) {
    super(recipe, state.pluginCache, index.lastEventId, index.template);
    this.bagTiddlers = index.bagTiddlers;
    if (injectStore) {
      this.prefix = this.injectionFunction + "(";
      this.suffix = ");\n";
    } else {
      this.prefix = "\n";
      this.suffix = ",";
    }
  }

  private prefix: string;
  private suffix: string;
  private bagTiddlers;

  private get cachePath() { return this.state.pluginCache.cachePath; }
  private get pluginFiles() { return this.state.pluginCache.pluginFiles; }


  async writeStorePlugins() {
    const fileStreams = this.plugins.map(e => createReadStream(join(this.cachePath, this.pluginFiles.get(e)!, "plugin.json")));
    for (const stream of fileStreams) {
      this.state.writeFast(this.prefix);
      await this.state.pipeFrom(stream);
      this.state.writeFast(this.suffix);
    }
  }

  // #region write
  async writeStoreTiddlers() {

    const writeTiddler = async (fields: Record<string, string>) => {
      await this.state.write(this.prefix + JSON.stringify(fields).replace(/</g, "\\u003c") + this.suffix);
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
    await writeTiddler({
      title: "$:/config/multiwikiclient/host",
      text: "$protocol$//$host$" + this.state.pathPrefix + "/",
    });
    if (this.state.config.enableDevServer) {
      await writeTiddler({ title: "$:/state/multiwikiclient/dev-mode", text: "yes" });
    }
  }
}


declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.tiddler.events": [{
      recipe_id?: string;
      bag_id: string;
      title: string;
      revision: string;
      deletion: boolean;
    }];
  }
}

// #region - WikiStore

export class WikiStore {
  constructor(private tx: PrismaTxnClient | null) { }
  async saveTiddler(options: {
    /** Only used for the mws.tiddler.events log. */
    recipe_id?: IdString;
    bag_id: IdString;
    fields: any;
  }) {
    // { recipe_id, bag_id, fields }
    const recipe_id = options.recipe_id ? IdString.cast(options.recipe_id) : undefined;
    const bag_id = IdString.cast(options.bag_id);
    const fields = options.fields;
    const title = fields.title;
    if (!title) {
      throw new Error("Tiddler must have a title");
    }

    const event = await this.tx!.tiddlerEvent.create({
      data: { bag_id, title, type: "save" }
    });

    const revision = BigInt(event.seq);

    const tiddler = await this.tx!.tiddler.upsert({
      where: { bag_id_title: { bag_id, title } },
      update: { fields, revision },
      create: { bag_id, title, fields, revision },
    });

    serverEvents.emitLog("mws.tiddler.events", {
      recipe_id,
      bag_id,
      deletion: false,
      revision: `${event.seq}`,
      title,
    });

    return tiddler;

  }


  async deleteTiddler(options: {
    /** Only used for the mws.tiddler.events log. */
    recipe_id?: IdString;
    bag_id: IdString;
    title: string;
  }) {
    const recipe_id = options.recipe_id ? IdString.cast(options.recipe_id) : undefined;
    const bag_id = IdString.cast(options.bag_id);
    const title = options.title as string;
    const deleted = await this.tx!.tiddler.deleteMany({
      where: { bag_id, title }
    });
    if (!deleted.count) return null;
    const event = await this.tx!.tiddlerEvent.create({
      data: { bag_id, title, type: "delete" }
    });
    serverEvents.emitLog("mws.tiddler.events", {
      recipe_id,
      bag_id,
      deletion: true,
      revision: `${event.seq}`,
      title,
    });
    return event;
  }
}
