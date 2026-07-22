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

export type RecipeInfo = ART<typeof RecipeResolver.assertRecipe>;
export type RecipeBagRow = RecipeInfo["recipe_bags"][number];
export type WriteTarget = ART<RecipeResolver["getWriteTarget"]>
export type ReadInfo = ART<RecipeResolver["getReadInfo"]>;

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
