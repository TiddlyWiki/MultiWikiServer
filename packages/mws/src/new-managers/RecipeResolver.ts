// New endpoints for the wikis → templates → types model (see NEW-DESIGN.md).
//
// Wikis are stored as `recipe` rows and addressed by recipe slug. The recipe
// and wiki endpoint families are kept separate, mirroring the existing code.
//
// All routing goes through a single shared resolver (RecipeResolver) so that
// single, batch, and list operations always present the same view and can
// never disagree about where a title routes.

import { PrismaClient } from "@tiddlywiki/mws-prisma";
import { SendError, ServerRequest } from "@tiddlywiki/server";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { IBagRow, IPluginRow, IRoleRow, ITemplateRow, IUserRow, IWikiRow } from "@mws/admin-vanilla/src/definition/tabs";

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

type Template_type = "simpleV1" | "prefixV1" | "userV1";

interface SimpleV1TemplateType {
  readonlyBags: PrismaField<"Bag", "id">[];
  writableBag: PrismaField<"Bag", "id">;
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

interface UserV1TemplateType {
  readonlyBags: PrismaField<"Bag", "id">[];
  writableBagsPrefix: Record<string, PrismaField<"Bag", "id">>;
  writableBagUsers: PrismaField<"Bag", "id">;
}

interface RecipeDefinition {
  /** List of readonly bags for the writable bags to sit on top of */
  readonlyBags: PrismaField<"Bag", "id">[];
  /** 
   * write to separate bags based on the prefix of the title. 
   * name collisions favor longest matching prefix. 
   * the empty string marks the default bag. */
  writablePrefixBags: Record<string, PrismaField<"Bag", "id">>;
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
  static async assertRecipe({ state, prisma, recipe_slug }: {
    state: ServerRequest<"json" | "ignore", any, any>;
    prisma: PrismaTxnClient;
    recipe_slug: PrismaField<"Recipe", "slug">;
  }) {

    const role_ids = state.user.roles.map((r: { role_id: string }) => r.role_id)
    const recipe = await prisma.recipe.findUnique({
      where: { slug: recipe_slug },
      select: {
        id: true,
        slug: true,
        plugins: true,
        permissions: {
          // any level gives read permission
          where: { role_id: { in: role_ids } },
          select: { role_id: true },
          take: 1,
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
                  select: { level: true },
                  take: 1,
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

    return recipe;
  }

  static async assertRecipeAccess({ prisma, recipe_slug, role_ids, needsWrite, isAdmin }: {
    prisma: PrismaTxnClient;
    recipe_slug: PrismaField<"Recipe", "slug">;
    role_ids: PrismaField<"Roles", "role_id">[];
    needsWrite: boolean;
    isAdmin: boolean;
  }) {
    if (isAdmin) return;
    const recipe = await prisma.recipe.findUnique({
      where: { slug: recipe_slug },
      select: {
        id: true,
        permissions: {
          where: { role_id: { in: role_ids } },
          select: {
            role_id: true,
            level: true,
          },
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
                  select: {
                    role_id: true,
                    level: true,
                  },
                },
              },
            },
          },
        },
      },
    })
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

    if (!needsWrite) return;

    const hasWriteAccess = recipe.recipe_bags
      .filter(recipeBag => recipeBag.is_writable)
      .some(recipeBag =>
        recipeBag.bag.permissions.some(permission => inArray(WRITE_LEVELS, permission.level))
      );

    if (!hasWriteAccess)
      throw new SendError("BAG_NO_WRITE_PERMISSION", 403, { bagName: "" });

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
      const event = await this.prisma.tiddlerEvent.create({
        data: { bag_id: bag.bag_id, title, type: "save" }
      });
      const revision = BigInt(event.seq);
      await this.prisma.tiddler.upsert({
        where: { bag_id_title: { bag_id: bag.bag_id, title: title } },
        update: { fields, revision },
        create: { bag_id: bag.bag_id, title: title, fields, revision },
      });
      return {
        title,
        info: await this.resolveInfo({ title, target: bag }),
        revision: event.seq.toString(),
      };
    }));
  }

  async deleteTiddlers({ titles }: { titles: PrismaField<"Tiddler", "title">[]; }): Promise<BatchMutationResult[]> {
    return await Promise.all((titles ?? []).map(async title => {
      const bag = this.getWriteTarget({ title });
      if (!bag || !this.canWriteBag(bag)) throw "write not permitted";
      await this.prisma.tiddler.deleteMany({ where: { bag_id: bag.bag_id, title } });
      const event = await this.prisma.tiddlerEvent.create({ data: { bag_id: bag.bag_id, title, type: "delete" } });
      return {
        title,
        info: await this.resolveInfo({ title, target: bag }),
        revision: event.seq.toString(),
      };
    }));
  }


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

    const bagIds = this.recipe.recipe_bags.map(e => e.bag_id);

    const [lastEvent, template] = await Promise.all([
      this.prisma.tiddlerEvent.findFirst({
        where: { bag_id: { in: bagIds } },
        orderBy: { seq: "desc" },
        select: { seq: true },
      }),
      readFile(resolve(state.config.cachePath, "tiddlywiki5.html"), "utf8"),
    ]);

    const hash = createHash("md5");
    hash.update(template);
    hash.update(this.recipe.recipe_bags.map(e => e.bag.name).join(","));
    hash.update(plugins.map(e => pluginHashes.get(e) ?? "").join(","));
    hash.update(String(lastEvent?.seq ?? 0));
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

    await this.writeStoreTiddlers(state, String(lastEvent?.seq ?? 0));

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
    const bagIds = this.recipe.recipe_bags
      .filter(e => !state.pluginCache.pluginFiles.has(e.bag.name))
      .map(e => e.bag_id);

    const bagTiddlers = await this.prisma.bag.findMany({
      where: { id: { in: bagIds } },
      select: {
        id: true,
        name: true,
        tiddlers: {
          select: { title: true, fields: true, revision: true },
        },
      },
    });

    bagTiddlers.sort((a, b) => bagOrder.get(b.id)! - bagOrder.get(a.id)!);

    // Top bag wins — last write in the Map wins, so iterate lowest-priority first.
    const recipeTiddlers = Array.from(
      new Map(bagTiddlers.flatMap(bag =>
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


function mapGetInit<K, V>(map: Map<K, V>, key: K, init: () => V): V {
  if (!map.has(key)) {
    let val = init();
    map.set(key, val);
    return val;
  } else {
    return map.get(key) as V;
  }
}



declare global {
  namespace PrismaJson {
    type Template_definition = {
      name: string;
      description: string;
      writablePrefixBags: Record<string, string>;
      readonlyBags: string[];
      plugins: string[];
      requiredPluginsEnabled: boolean;
      customHtmlEnabled: boolean;
      htmlContent: string;
      injectionArray: string;
      injectionLocation: string;
    };
    type Recipe_definition = {
      displayName: string;
      description: string;
      readonlyBags: string[];
      writablePrefixBags: Record<string, string>;
      plugins: string[];
    }
  }
}
export function createSampleWiki(prisma: PrismaEngineClient) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.recipe.findMany({ select: { slug: true } });
    if (existing.length) {
      existing.map(e => { console.log("wiki", e.slug) });
      return;
    }

    const roleRows = await Promise.all([
      tx.roles.upsert({
        where: { role_name: "admin" },
        update: { description: "Full administrative access across the mock multi-wiki surface." },
        create: { role_name: "admin", description: "Full administrative access across the mock multi-wiki surface." },
      }),
      tx.roles.upsert({
        where: { role_name: "editor" },
        update: { description: "Can edit routine authored configuration and content." },
        create: { role_name: "editor", description: "Can edit routine authored configuration and content." },
      }),
      tx.roles.upsert({
        where: { role_name: "viewer" },
        update: { description: "Read-only access to published wiki content." },
        create: { role_name: "viewer", description: "Read-only access to published wiki content." },
      }),
      tx.roles.upsert({
        where: { role_name: "plugin-authors" },
        update: { description: "Can edit plugin-lab wiki content and related assets." },
        create: { role_name: "plugin-authors", description: "Can edit plugin-lab wiki content and related assets." },
      }),
      tx.roles.upsert({
        where: { role_name: "qa" },
        update: { description: "Can review plugin-lab wiki content." },
        create: { role_name: "qa", description: "Can review plugin-lab wiki content." },
      }),
    ]);

    const rolesByName = new Map(roleRows.map((role) => [role.role_name, role]));

    await Promise.all([
      tx.users.upsert({
        where: { username: "alex" },
        update: {
          email: "alex@example.com",
          password: "",
          roles: { set: [{ role_id: rolesByName.get("admin")!.role_id }, { role_id: rolesByName.get("editor")!.role_id }] },
        },
        create: {
          username: "alex",
          email: "alex@example.com",
          password: "",
          roles: { connect: [{ role_id: rolesByName.get("admin")!.role_id }, { role_id: rolesByName.get("editor")!.role_id }] },
        },
      }),
      tx.users.upsert({
        where: { username: "sam" },
        update: {
          email: "sam@example.com",
          password: "",
          roles: { set: [{ role_id: rolesByName.get("editor")!.role_id }] },
        },
        create: {
          username: "sam",
          email: "sam@example.com",
          password: "",
          roles: { connect: [{ role_id: rolesByName.get("editor")!.role_id }] },
        },
      }),
    ]);

    const bagRows = await Promise.all([
      tx.bag.create({ data: { name: "bag-engineering-main", description: "Primary write target for engineering wiki content." } }),
      tx.bag.create({ data: { name: "bag-shared-specs", description: "Readonly canonical specs consumed across multiple workspaces." } }),
      tx.bag.create({ data: { name: "bag-shared-archive", description: "Readonly archive content available to workspace-style wikis." } }),
      tx.bag.create({ data: { name: "bag-policy", description: "Shared policy and governance content layered into workspace wikis." } }),
      tx.bag.create({ data: { name: "bag-docs", description: "Writable namespace target for Docs/ titles." } }),
      tx.bag.create({ data: { name: "bag-drafts", description: "Writable namespace target for Drafts/ titles." } }),
      tx.bag.create({ data: { name: "bag-user-space", description: "Writable namespace target for user-authored personal notes." } }),
      tx.bag.create({ data: { name: "bag-plugin-base", description: "Readonly shared base content for plugin workspaces." } }),
      tx.bag.create({ data: { name: "bag-plugin-archive", description: "Readonly historical plugin review content." } }),
      tx.bag.create({ data: { name: "bag-plugin-lab", description: "Primary write target for plugin lab content." } }),
    ]);

    const bagsByName = new Map(bagRows.map((bag) => [bag.name, bag]));

    const setBagPermission = async (bagName: string, permissionRows: Array<[string, "A_read" | "B_write" | "C_admin"]>) => {
      const bag = bagsByName.get(bagName)!;
      await Promise.all(permissionRows.map(([roleName, level]) => tx.bagPermission.create({
        data: {
          bag_id: bag.id,
          role_id: rolesByName.get(roleName)!.role_id,
          level,
        },
      })));
    };

    await Promise.all([
      setBagPermission("bag-engineering-main", [["admin", "C_admin"], ["editor", "B_write"], ["viewer", "A_read"]]),
      setBagPermission("bag-shared-specs", [["admin", "C_admin"], ["editor", "A_read"], ["viewer", "A_read"]]),
      setBagPermission("bag-shared-archive", [["admin", "C_admin"], ["editor", "A_read"], ["viewer", "A_read"]]),
      setBagPermission("bag-policy", [["admin", "C_admin"], ["editor", "A_read"], ["viewer", "A_read"]]),
      setBagPermission("bag-docs", [["admin", "C_admin"], ["editor", "B_write"], ["viewer", "A_read"]]),
      setBagPermission("bag-drafts", [["admin", "C_admin"], ["editor", "B_write"], ["viewer", "A_read"]]),
      setBagPermission("bag-user-space", [["admin", "C_admin"], ["editor", "B_write"], ["viewer", "A_read"]]),
      setBagPermission("bag-plugin-base", [["admin", "C_admin"], ["plugin-authors", "A_read"], ["qa", "A_read"]]),
      setBagPermission("bag-plugin-archive", [["admin", "C_admin"], ["plugin-authors", "A_read"], ["qa", "A_read"]]),
      setBagPermission("bag-plugin-lab", [["admin", "C_admin"], ["plugin-authors", "B_write"], ["qa", "A_read"]]),
    ]);

    const templateRows = await Promise.all([
      tx.template.create({
        data: {
          type: "prefixV1",
          definition: {
            name: "Workspace Template",
            description: "General-purpose workspace wiki with namespace-based write routing.",
            readonlyBags: ["bag-shared-specs", "bag-shared-archive", "bag-policy"],
            writablePrefixBags: {
              "Docs/": "bag-docs",
              "Drafts/": "bag-drafts",
              "Users/": "bag-user-space",
              "": "bag-engineering-main",
            },
            plugins: [],
            requiredPluginsEnabled: true,
            customHtmlEnabled: false,
            htmlContent: "",
            injectionArray: "$tw.preloadTiddlers",
            injectionLocation: "",
          },
        },
      }),
      tx.template.create({
        data: {
          type: "prefixV1",
          definition: {
            name: "Plugin Sandbox",
            description: "Draft-heavy workspace for plugin authoring and review.",
            readonlyBags: ["bag-plugin-base", "bag-plugin-archive"],
            writablePrefixBags: {
              "Plugins/": "bag-plugin-lab",
              "": "bag-plugin-lab",
            },
            plugins: [],
            requiredPluginsEnabled: false,
            customHtmlEnabled: true,
            htmlContent: "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Plugin Sandbox</title>\n</head>\n<body>\n  <!-- INJECT STORE TIDDLERS HERE -->\n</body>\n</html>",
            injectionArray: "$tw.preloadTiddlers",
            injectionLocation: "<!-- INJECT STORE TIDDLERS HERE -->",
          },
        },
      }),
    ]);

    const [workspaceTemplate, pluginTemplate] = templateRows;

    const recipeRows = await Promise.all([
      tx.recipe.create({
        data: {
          slug: "engineering-hub",
          definition: {
            displayName: "Engineering Hub",
            description: "Shared engineering wiki with namespace routing for specs, drafts, and user notes.",
            readonlyBags: [],
            writablePrefixBags: {
              "Docs/": "bag-docs",
              "Drafts/": "bag-drafts",
              "Users/": "bag-user-space",
              "": "bag-engineering-main",
            },
            plugins: [],
          },
          template_id: workspaceTemplate.id,
          plugins: [],
        },
      }),
      tx.recipe.create({
        data: {
          slug: "plugin-lab",
          definition: {
            displayName: "Plugin Lab",
            description: "Sandbox for draft plugin work and package previews.",
            readonlyBags: [],
            writablePrefixBags: {
              "Plugins/": "bag-plugin-lab",
              "": "bag-plugin-lab",
            },
            plugins: [],
          },
          template_id: pluginTemplate.id,
          plugins: [],
        },
      }),
    ]);

    const [engineeringHub, pluginLab] = recipeRows;

    await Promise.all([
      tx.recipePermission.create({ data: { recipe_id: engineeringHub.id, role_id: rolesByName.get("editor")!.role_id, level: "B_write" } }),
      tx.recipePermission.create({ data: { recipe_id: engineeringHub.id, role_id: rolesByName.get("viewer")!.role_id, level: "A_read" } }),
      tx.recipePermission.create({ data: { recipe_id: pluginLab.id, role_id: rolesByName.get("plugin-authors")!.role_id, level: "B_write" } }),
      tx.recipePermission.create({ data: { recipe_id: pluginLab.id, role_id: rolesByName.get("qa")!.role_id, level: "A_read" } }),
    ]);

    const compiledRecipeBags = [
      { recipeId: engineeringHub.id, bagName: "bag-docs", priority: 0, isWritable: true, prefix: "Docs/" },
      { recipeId: engineeringHub.id, bagName: "bag-drafts", priority: 1, isWritable: true, prefix: "Drafts/" },
      { recipeId: engineeringHub.id, bagName: "bag-user-space", priority: 2, isWritable: true, prefix: "Users/" },
      { recipeId: engineeringHub.id, bagName: "bag-engineering-main", priority: 3, isWritable: true, prefix: "" },
      { recipeId: engineeringHub.id, bagName: "bag-shared-specs", priority: 4, isWritable: false, prefix: "" },
      { recipeId: engineeringHub.id, bagName: "bag-shared-archive", priority: 5, isWritable: false, prefix: "" },
      { recipeId: engineeringHub.id, bagName: "bag-policy", priority: 6, isWritable: false, prefix: "" },
      { recipeId: pluginLab.id, bagName: "bag-plugin-lab", priority: 0, isWritable: true, prefix: "Plugins/" },
      { recipeId: pluginLab.id, bagName: "bag-plugin-lab", priority: 1, isWritable: true, prefix: "" },
      { recipeId: pluginLab.id, bagName: "bag-plugin-base", priority: 2, isWritable: false, prefix: "" },
      { recipeId: pluginLab.id, bagName: "bag-plugin-archive", priority: 3, isWritable: false, prefix: "" },
    ];

    for (const row of compiledRecipeBags) {
      await tx.recipeBag.create({
        data: {
          recipe_id: row.recipeId,
          bag_id: bagsByName.get(row.bagName)!.id,
          priority: row.priority,
          is_writable: row.isWritable,
          prefix: row.prefix,
        },
      });
    }

    console.log(`/wiki/${engineeringHub.slug}`);
    console.log(`/wiki/${pluginLab.slug}`);

    return {
      bags: bagRows,
      templates: templateRows,
      recipes: recipeRows,
    };
  });
}



abstract class WikiRow implements IWikiRow {
  abstract id: string;
  abstract plugins: string;
  abstract slug: string;
  abstract displayName: string;
  abstract lastCompiledAt: string;
  abstract description: string;
  abstract templateId: string;
  abstract readonlyBags: string;
  abstract writablePrefixBags: string;
  abstract recipePermissions: string;
  abstract effectiveReadonlyBags: string;
  abstract effectivePluginSet: string;
  abstract effectiveWritableBags: string;
}


abstract class TemplateRow implements ITemplateRow {
  abstract id: string;
  abstract plugins: string;
  abstract description: string;
  abstract readonlyBags: string;
  abstract writablePrefixBags: string;
  abstract name: string;
  abstract lastUpdatedAt: string;
  abstract requiredPluginsEnabled: string;
  abstract customHtmlEnabled: string;
  abstract htmlContent: string;
  abstract injectionArray: string;
  abstract injectionLocation: string;
  abstract dependentWikis: string;
}

abstract class BagRow implements IBagRow {
  abstract id: string;
  abstract description: string;
  abstract name: string;
  abstract permissions: string;

}

abstract class PluginRow implements IPluginRow {
  abstract id: string;
  abstract version: string;
  abstract description: string;
  abstract name: string;
  abstract status: string;
  abstract publishFromDraft: string;

}

abstract class RoleRow implements IRoleRow {
  abstract id: string;
  abstract description: string;
  abstract roleId: string;

}

abstract class UserRow implements IUserRow {
  abstract id: string;
  abstract username: string;
  abstract email: string;
  abstract roleIds: string;
  abstract password: string;
}


export async function getAdminDataStore(prisma: PrismaTxnClient) {
  const [templates, recipes, bags, roles, users] = await Promise.all([
    prisma.template.findMany({
      select: {
        id: true,
        definition: true,
        recipes: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.recipe.findMany({
      select: {
        id: true,
        slug: true,
        definition: true,
        plugins: true,
        template_id: true,
        permissions: {
          select: {
            level: true,
            role_id: true,
          },
          orderBy: { role_id: "asc" },
        },
        recipe_bags: {
          select: {
            bag_id: true,
            priority: true,
            is_writable: true,
            prefix: true,
            bag: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ priority: "asc" }, { prefix: "desc" }],
        },
      },
      orderBy: { slug: "asc" },
    }),
    prisma.bag.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          select: {
            level: true,
            role_id: true,
          },
          orderBy: { role_id: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.roles.findMany({
      select: {
        role_id: true,
        role_name: true,
        description: true,
      },
      orderBy: { role_name: "asc" },
    }),
    prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        password: true,
        roles: {
          select: {
            role_name: true,
          },
          orderBy: { role_name: "asc" },
        },
      },
      orderBy: { username: "asc" },
    }),
  ]);

  const roleNameById = new Map(roles.map((role) => [role.role_id, role.role_name]));
  const templateNameById = new Map(templates.map((template) => [template.id, template.definition.name]));

  const templateRows: ITemplateRow[] = templates.map((template) => {
    const definition = template.definition;
    return {
      id: template.id,
      name: definition.name,
      description: definition.description,
      readonlyBags: stringifyLineList(definition.readonlyBags),
      writablePrefixBags: stringifyPrefixRows(Object.entries(definition.writablePrefixBags).map(([prefix, bagName]) => ({ prefix, bagName }))),
      plugins: stringifyLineList(definition.plugins),
      lastUpdatedAt: "",
      requiredPluginsEnabled: booleanFlag(definition.requiredPluginsEnabled),
      customHtmlEnabled: booleanFlag(definition.customHtmlEnabled),
      htmlContent: definition.htmlContent,
      injectionArray: definition.injectionArray,
      injectionLocation: definition.injectionLocation,
      dependentWikis: JSON.stringify(template.recipes.map((recipe) => ({ id: recipe.id, name: recipe.slug }))),
    };
  });

  const wikiRows: IWikiRow[] = recipes.map((recipe) => {
    const definition = recipe.definition;
    const effectivePluginSet = Array.isArray(recipe.plugins) ? recipe.plugins.map(String) : [];
    const effectiveReadonlyBags = recipe.recipe_bags.filter(e => !e.is_writable).map((row) => row.bag.name);
    const effectiveWritableBags = recipe.recipe_bags
      .filter((row) => row.is_writable)
      .sort((a, b) => b.prefix.length - a.prefix.length)
      .map((row) => ({ prefix: row.prefix, bagName: row.bag.name }));
    const permissions = recipe.permissions.map((row) => ({
      role: roleNameById.get(row.role_id) ?? row.role_id,
      level: row.level,
    }));
    const definitionWritableBags = Object.entries(definition.writablePrefixBags)
      .sort((a, b) => b[0].length - a[0].length)
      .map(([prefix, bagName]) => ({ prefix, bagName }))
    return {
      id: recipe.id,
      slug: recipe.slug,
      displayName: definition.displayName,
      description: definition.description,
      templateId: JSON.stringify({ id: recipe.template_id, name: templateNameById.get(recipe.template_id) }),
      writablePrefixBags: stringifyPrefixRows(definitionWritableBags),
      readonlyBags: stringifyLineList(definition.readonlyBags),
      plugins: stringifyLineList(definition.plugins),
      lastCompiledAt: "",
      recipePermissions: stringifyPermissions(permissions),
      effectiveWritableBags: stringifyPrefixRows(effectiveWritableBags),
      effectiveReadonlyBags: stringifyLineList(effectiveReadonlyBags),
      effectivePluginSet: stringifyLineList(effectivePluginSet),
    };
  });

  const bagRows: IBagRow[] = bags.map((bag) => ({
    id: bag.id,
    name: bag.name,
    description: bag.description,
    permissions: stringifyPermissions(bag.permissions.map((row) => ({
      role: roleNameById.get(row.role_id) ?? row.role_id,
      level: row.level,
    }))),
  }));

  const roleRows: IRoleRow[] = roles.map((role) => ({
    id: role.role_id,
    roleId: role.role_name,
    description: role.description ?? "",
  }));

  const userRows: IUserRow[] = users.map((user) => ({
    id: user.user_id,
    username: user.username,
    email: user.email,
    roleIds: stringifyLineList(user.roles.map((role) => role.role_name)),
    password: user.password,
  }));

  const pluginRows: IPluginRow[] = [];

  return {
    wikis: wikiRows,
    templates: templateRows,
    bags: bagRows,
    plugins: pluginRows,
    roles: roleRows,
    users: userRows,
  };
}
function stringifyLineList(values: string[]): string {
  return values.filter(Boolean).join("\n");
}

function stringifyPrefixRows(rows: Array<{ prefix: string; bagName: string }>): string {
  return JSON.stringify(rows.map((row) => ({ left: row.prefix, right: row.bagName })));
}

function stringifyPermissions(rows: Array<{ role: string; level: string }>): string {
  return JSON.stringify(rows);
}

function booleanFlag(value: boolean): string {
  return value ? "enabled" : "disabled";
}
