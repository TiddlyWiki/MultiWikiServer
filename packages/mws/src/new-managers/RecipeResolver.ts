// New endpoints for the wikis → templates → types model (see NEW-DESIGN.md).
//
// Wikis are stored as `recipe` rows and addressed by recipe slug. The recipe
// and wiki endpoint families are kept separate, mirroring the existing code.
//
// All routing goes through a single shared resolver (RecipeResolver) so that
// single, batch, and list operations always present the same view and can
// never disagree about where a title routes.

import { SendError, ServerRequest } from "@tiddlywiki/server";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { WikiStore } from "./wiki-store";
import { mapGetInit } from "./wiki-utils";


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

function inArray<T>(a: readonly T[], b: any): b is T {
  return a.includes(b);
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
    state: ServerRequest<"json" | "ignore", any, any>;
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

    const hasRecipeAccess = recipe.permissions.some(permission => permission.level && permission.level === "A_read");

    if (!hasRecipeAccess)
      throw new SendError("RECIPE_NO_READ_PERMISSION", 403, { recipeName: recipe_slug })

    const hasBagDeniedAccess = recipe.recipe_bags.find(recipeBag =>
      !recipeBag.bag.permissions.some(permission => READ_LEVELS.includes(permission.level))
    );

    if (hasBagDeniedAccess)
      throw new SendError("BAG_NO_READ_PERMISSION", 403, { bagName: hasBagDeniedAccess.bag_id })

    if (needsWrite) {

      const hasWriteAccess = recipe.recipe_bags
        .filter(recipeBag => recipeBag.is_writable)
        .some(recipeBag =>
          recipeBag.bag.permissions.some(permission => inArray(WRITE_LEVELS, permission.level))
        );

      if (!hasWriteAccess)
        throw new SendError("BAG_NO_WRITE_PERMISSION", 403, { bagName: "" });

    }

    return recipe;
  }


  constructor(
    private recipe: RecipeInfo,
    private prisma: PrismaTxnClient,
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
    const present = await this.prisma.tiddler.findMany({
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

  async listTiddlers() {
    const rows = await this.prisma.tiddler.findMany({
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

  async readTiddlers({ titles }: { titles: PrismaField<"Tiddler", "title">[]; }) {

    const rows = await this.prisma.tiddler.findMany({
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
      return this.prisma.bag.findUnique({
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
  async saveTiddlers({ tiddlers }: { tiddlers: Record<string, any>[]; }): Promise<BatchMutationResult[]> {
    return await Promise.all((tiddlers ?? []).map(async fields => {
      const title = fields.title as PrismaField<"Tiddler", "title">;
      if (!title) throw "tiddler must have a title";
      const bag = this.getWriteTarget({ title });
      if (!bag || !this.canWriteBag(bag)) throw "write not permitted";
      const tiddler = await new WikiStore(this.prisma).saveTiddler({
        recipe_id: this.recipe.id,
        bag_id: bag.bag_id,
        fields
      });
      return {
        title,
        info: await this.resolveInfo({ title, target: bag }),
        revision: tiddler.revision.toString(),
      };
    }));
  }

  async deleteTiddlers({ titles }: { titles: PrismaField<"Tiddler", "title">[]; }): Promise<(BatchMutationResult | null)[]> {
    return await Promise.all((titles ?? []).map(async title => {

      const bag = this.getWriteTarget({ title });
      if (!bag || !this.canWriteBag(bag)) throw "write not permitted";

      const event = await new WikiStore(this.prisma).deleteTiddler({
        recipe_id: this.recipe.id,
        bag_id: bag.bag_id,
        title,
      });

      return !event ? null : {
        title,
        info: await this.resolveInfo({ title, target: bag }),
        revision: event.seq.toString(),
      };
    }));
  }

  async getIndexData(includeTiddlers: boolean) {
    const maxSeq = await this.prisma.tiddlerEvent.aggregate({ _max: { seq: true } });

    const bagIds = this.recipe.recipe_bags.map(e => e.bag_id);

    const bagTiddlers = includeTiddlers ? await this.prisma.bag.findMany({
      where: { id: { in: bagIds } },
      select: {
        id: true,
        name: true,
        tiddlers: {
          select: { title: true, fields: true, revision: true },
        },
      },
    }) : [];

    return { bagTiddlers, maxSeq: maxSeq._max.seq }

  }

}


export class IndexSender {

  constructor(
    private recipe: RecipeInfo,
    private bagTiddlers: ART<RecipeResolver["getIndexData"]>["bagTiddlers"],
    private lastEventId: number | null,
  ) { }

  async serveIndexFile(
    state: ServerRequest<any, any>,
  ) {


    const { enableExternalPlugins } = state.config;
    const { cachePath, pluginFiles, pluginHashes, requiredPlugins } = state.pluginCache;

    const plugins = [...new Set([
      "$:/core",
      ...requiredPlugins,
      ...this.recipe.plugins as string[],
    ]).values()];

    plugins.forEach(e => {
      if (!state.pluginCache.pluginFiles.has(e))
        console.log(`Recipe ${this.recipe.id} uses unknown plugin ${e}`);
    });

    if (enableExternalPlugins) {
      state.writeEarlyHints({
        link: plugins.map(e => {
          const plugin = pluginFiles.get(e);
          return `<${state.pathPrefix}/$cache/${plugin}/plugin.js>; rel=preload; as=script`;
        }),
      });
    }

    const template = await readFile(resolve(state.config.cachePath, "tiddlywiki5.html"), "utf8");
    const lastEvent = this.lastEventId;

    const hash = createHash("md5");
    hash.update(template);
    hash.update(this.recipe.recipe_bags.map(e => e.bag.name).join(","));
    hash.update(plugins.map(e => pluginHashes.get(e) ?? "").join(","));
    hash.update(String(lastEvent ?? 0));
    const contentDigest = hash.digest("hex");

    const newEtag = `"${contentDigest}"`;
    state.writeHead(200, {
      contentType: "text/html",
      etag: newEtag,
      cacheControl: "max-age=0, private, no-cache",
    });

    if (state.method === "HEAD") return state.end();

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
    const headPos = template.indexOf("</head>");
    if (headPos === -1) throw new Error("Cannot find </head> in template");
    await state.write(template.substring(0, headPos));

    if (enableExternalPlugins) {
      await state.write("\n" + plugins.map(e => {
        const plugin = pluginFiles.get(e)!;
        const h = pluginHashes.get(e)!;
        return `<link rel="preload" href="${state.pathPrefix}/$cache/${plugin}/plugin.js" as="script" integrity="${h}" crossorigin="anonymous" />`;
      }).join("\n") + "\n");
    }

    // Splice into the tiddler store
    const marker = `<script class="tiddlywiki-tiddler-store" type="application/json">[`;
    const markerPos = template.indexOf(marker);
    if (markerPos === -1) throw new Error("Cannot find tiddler store in template");
    await state.write(template.substring(headPos, markerPos));
    await state.write(marker);

    if (!enableExternalPlugins) {
      const fileStreams = plugins.map(e => createReadStream(join(cachePath, pluginFiles.get(e)!, "plugin.json")));
      for (const stream of fileStreams) {
        state.writeFast("\n");
        await state.pipeFrom(stream);
        state.writeFast(",");
      }
    }

    await this.writeStoreTiddlers(state, String(lastEvent ?? 0));

    await state.write(template.substring(markerPos + marker.length));

    return state.end();
  }

  async writeStoreTiddlers(
    state: ServerRequest<any, any>,
    lastRevisionId: string,
  ) {
    async function writeTiddler(fields: Record<string, string>) {
      await state.write(JSON.stringify(fields).replace(/</g, "\\u003c") + ",\n");
    }

    const bagOrder = new Map(this.recipe.recipe_bags.map(e => [e.bag_id, e.priority]));

    this.bagTiddlers.sort((a, b) => bagOrder.get(b.id)! - bagOrder.get(a.id)!);

    // Top bag wins — last write in the Map wins, so iterate lowest-priority first.
    const recipeTiddlers = Array.from(
      new Map(this.bagTiddlers.flatMap(bag =>
        bag.tiddlers.map(t => [t.title, { bag, tiddler: t }])
      )).values()
    );

    const bagInfo: Record<string, string> = {};
    const revisionInfo: Record<string, string> = {};

    for (const { bag, tiddler } of recipeTiddlers) {
      const fields = { ...(tiddler.fields as Record<string, string>), title: tiddler.title };
      bagInfo[tiddler.title] = bag.name;
      revisionInfo[tiddler.title] = tiddler.revision.toString();
      await writeTiddler(fields);
    }

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
      text: "$protocol$//$host$" + state.pathPrefix + "/",
    });
    if (state.config.enableDevServer) {
      await writeTiddler({ title: "$:/state/multiwikiclient/dev-mode", text: "yes" });
    }
  }

}


