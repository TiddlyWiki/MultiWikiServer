import { zodRoute, SendError } from "@tiddlywiki/server";
import { RecipeResolver, serveIndex } from "./RecipeResolver";

// ---------------------------------------------------------------------------
// Recipe-scoped endpoints (RSD, batch, list, status) — addressed by title.
// ---------------------------------------------------------------------------


// #region GetStatus
export const RecipeStatus = zodRoute({
  method: ["GET", "HEAD"],
  path: "/recipe/:recipe_slug/status",
  bodyFormat: "ignore",
  zodPathParams: z => ({
    recipe_slug: z.prismaField("Recipe", "slug", "string"),
  }),
  inner: async (state) => {
    const { recipe_slug } = state.pathParams;
    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      needsWrite: false
    }).then(e => {
      state.asserted = true;
      return e;
    });
    return await state.$transaction(async (prisma) => {
      const r = new RecipeResolver(recipe, prisma, state.user.isAdmin);
      const { isAdmin, user_id, username, isLoggedIn } = state.user;
      return {
        isAdmin,
        user_id,
        username,
        isLoggedIn,
        bags: recipe.recipe_bags.map(e => ({
          bag_id: e.bag_id,
          is_writable: e.is_writable,
          prefix: e.prefix,
          priority: e.priority,
          bag_name: e.bag.name,
          canUserWrite: r.canWriteBag(e),
        }))
      };
    });
  },
});
// #region TiddlerList
export const TiddlerList = zodRoute({
  method: ["GET", "HEAD"],
  path: "/recipe/:recipe_slug/list.json",
  bodyFormat: "ignore",
  securityChecks: { requestedWithHeader: false },
  zodPathParams: z => ({
    recipe_slug: z.prismaField("Recipe", "slug", "string"),
  }),
  inner: async (state) => {
    const { recipe_slug } = state.pathParams;
    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      needsWrite: false
    }).then(e => {
      state.asserted = true;
      return e;
    });
    return await state.$transaction(async (prisma) => {
      const r = new RecipeResolver(recipe, prisma, state.user.isAdmin);
      return await r.listTiddlers();
    });
  },
});
// #region RecipeStore
export const RecipeStore = zodRoute({
  method: ["GET", "HEAD"],
  path: "/recipe/:recipe_slug/store.js",
  bodyFormat: "ignore",
  securityChecks: { requestedWithHeader: false },
  zodPathParams: z => ({
    recipe_slug: z.prismaField("Recipe", "slug", "string"),
  }),
  zodQueryKeys: ["cache"],
  inner: async (state) => {
    const { recipe_slug } = state.pathParams;
    throw await serveIndex(state, recipe_slug, "store");
  },
});
// #region RecipeUpdates
/** Poll for tiddler changes since a known sequence number. */
export const RecipeUpdates = zodRoute({
  method: ["GET", "HEAD"],
  path: "/recipe/:recipe_slug/updates",
  bodyFormat: "ignore",
  securityChecks: { requestedWithHeader: false },
  zodPathParams: z => ({
    recipe_slug: z.prismaField("Recipe", "slug", "string"),
  }),
  zodQueryKeys: ["since"],
  inner: async (state) => {
    const { recipe_slug } = state.pathParams;
    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      needsWrite: false
    }).then(e => {
      state.asserted = true;
      return e;
    });

    return await state.$transaction(async (prisma) => {
      const r = new RecipeResolver(recipe, prisma, state.user.isAdmin);
      const bagIDMap = new Map(recipe.recipe_bags.map(b => [b.bag_id, b]));
      const since = Number(state.query.get("since")) || 0;
      const events = await prisma.tiddlerEvent.findMany({
        where: { bag_id: { in: Array.from(bagIDMap.keys()) }, seq: { gt: since } },
        orderBy: { seq: "asc" },
        select: { seq: true, title: true, type: true, bag_id: true },
      });

      const lastSeq = events.at(-1)?.seq ?? since;

      const lastEventByTitle = new Map<string, "save" | "delete">();
      for (const e of events) {
        const target = r.getWriteTarget({ title: e.title });
        if (!bagIDMap.get(e.bag_id)!.is_writable || target && target.bag_id === e.bag_id)
          lastEventByTitle.set(e.title, e.type);
      }

      const modifications: string[] = [];
      const deletions: string[] = [];
      for (const [title, type] of lastEventByTitle) {
        if (type === "save")
          modifications.push(title);

        else
          deletions.push(title);
      }

      return { modifications, deletions, lastSeq: lastSeq.toString() };
    });
  },
});
// #region TiddlerBatch
/**
 * Batch RSD over a set of titles. Per-tiddler: each item returns its own
 * success or failure. Not atomic — a denied item does not fail the rest.
 */
export const TiddlerBatch = zodRoute({
  method: ["PUT"],
  path: "/recipe/:recipe_slug/batch/:op",
  bodyFormat: "json",
  securityChecks: { requestedWithHeader: true },
  zodPathParams: z => ({
    recipe_slug: z.prismaField("Recipe", "slug", "string"),
    op: z.enum(["list", "read", "save", "delete"]),
  }),
  zodRequestBody: z => z.object({
    // for read/delete: titles. for save: tiddler field records (must include title).
    titles: z.prismaField("Tiddler", "title", "string").array().optional(),
    tiddlers: z.record(z.string(), z.any()).array().optional(),
  }),
  inner: async (state) => {
    const { recipe_slug, op } = state.pathParams;

    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      needsWrite: op !== "list" && op !== "read"
    }).then(e => {
      state.asserted = true;
      return e;
    });

    return await state.$transaction(async (prisma) => {

      const r = new RecipeResolver(recipe, prisma, state.user.isAdmin);

      if (op === "list") {
        return await r.listTiddlers();
      }

      if (op === "read") {
        state.data.titles = Array.from(new Set(state.data.titles));
        if (!Array.isArray(state.data.titles))
          throw new SendError("ARGUMENT_REQUIRED", 400, { name: "titles" });
        return await r.readTiddlers({ titles: state.data.titles });
      }

      if (op === "save") {
        if (!Array.isArray(state.data.tiddlers))
          throw new SendError("ARGUMENT_REQUIRED", 400, { name: "tiddlers" });
        return await r.saveTiddlers({ tiddlers: state.data.tiddlers });
      }

      if (op === "delete") {
        state.data.titles = Array.from(new Set(state.data.titles));
        if (!Array.isArray(state.data.titles))
          throw new SendError("ARGUMENT_REQUIRED", 400, { name: "titles" });
        return await r.deleteTiddlers({ titles: state.data.titles });
      }

      { const t: never = op; }

      throw new Error("Invalid op should have been caught by zod");
    });
  },
});

