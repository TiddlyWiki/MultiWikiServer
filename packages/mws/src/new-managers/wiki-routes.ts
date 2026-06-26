// New endpoints for the wikis → templates → types model (see NEW-DESIGN.md).
//
// Wikis are stored as `recipe` rows. Public wiki and recipe endpoints are
// addressed by recipe slug, while internal relations still use recipe ids.
// The recipe and wiki endpoint families are kept separate, mirroring the
// existing code.
//
// All routing goes through a single shared resolver (RecipeResolver) so that
// single, batch, and list operations always present the same view and can
// never disagree about where a title routes.

import { registerZodRoutes, RouterKeyMap, zodRoute, SendError, ServerRequest, truthy, checkPath } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { getAdminDataStore, RecipeResolver } from "./RecipeResolver";

export const BAG_PREFIX = "/bag";
export const RECIPE_PREFIX = "/recipe";
export const WIKI_PREFIX = "/wiki";

// ---------------------------------------------------------------------------
// Recipe-scoped endpoints (RSD, batch, list, status) — addressed by title.
// ---------------------------------------------------------------------------

export class NewWikiRecipeRoutes {

  handleGetRecipeStatus = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_slug/status",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_slug: z.prismaField("Recipe", "slug", "string"),
    }),
    inner: async (state) => {
      const { recipe_slug } = state.pathParams;

      await RecipeResolver.assertRecipeAccess({

        prisma: state.engine,
        recipe_slug,
        role_ids: state.user.roles.map(e => e.role_id),
        isAdmin: state.user.isAdmin,
        needsWrite: false
      }).then(() => { state.asserted = true; });

      return await state.$transaction(async (prisma) => {
        const recipe = await RecipeResolver.assertRecipe({ state, prisma, recipe_slug });
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

  rpcRecipeTiddlerListGet = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_slug/list.json",
    bodyFormat: "ignore",
    securityChecks: { requestedWithHeader: true },
    zodPathParams: z => ({
      recipe_slug: z.prismaField("Recipe", "slug", "string"),
    }),
    inner: async (state) => {
      const { recipe_slug } = state.pathParams;

      await RecipeResolver.assertRecipeAccess({
        prisma: state.engine,
        recipe_slug,
        role_ids: state.user.roles.map(e => e.role_id),
        isAdmin: state.user.isAdmin,
        needsWrite: false
      }).then(() => { state.asserted = true; });

      return await state.$transaction(async (prisma) => {
        const recipe = await RecipeResolver.assertRecipe({ state, prisma, recipe_slug });
        const r = new RecipeResolver(recipe, prisma, state.user.isAdmin);
        return await r.listTiddlers();
      });
    },
  });
  /** Poll for tiddler changes since a known sequence number. */
  handleGetRecipeUpdates = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_slug/updates",
    bodyFormat: "ignore",
    securityChecks: { requestedWithHeader: true },
    zodPathParams: z => ({
      recipe_slug: z.prismaField("Recipe", "slug", "string"),
    }),
    zodQueryKeys: ["since"],
    inner: async (state) => {
      const { recipe_slug } = state.pathParams;

      await RecipeResolver.assertRecipeAccess({
        prisma: state.engine,
        recipe_slug,
        role_ids: state.user.roles.map(e => e.role_id),
        isAdmin: state.user.isAdmin,
        needsWrite: false
      }).then(() => { state.asserted = true; });

      const since = Number(state.query.get("since")) || 0;

      return await state.$transaction(async (prisma) => {
        const recipe = await RecipeResolver.assertRecipe({ state, prisma, recipe_slug });
        const r = new RecipeResolver(recipe, prisma, state.user.isAdmin);
        const bagIDMap = new Map(recipe.recipe_bags.map(b => [b.bag_id, b]));

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
            modifications.push(title)
          else
            deletions.push(title)
        }

        return { modifications, deletions, lastSeq: lastSeq.toString() };
      });
    },
  });

  /**
   * Batch RSD over a set of titles. Per-tiddler: each item returns its own
   * success or failure. Not atomic — a denied item does not fail the rest.
   */
  rpcRecipeTiddlerBatch = zodRoute({
    method: ["PUT"],
    path: RECIPE_PREFIX + "/:recipe_slug/batch/:op",
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

      await RecipeResolver.assertRecipeAccess({
        prisma: state.engine,
        recipe_slug,
        role_ids: state.user.roles.map(e => e.role_id),
        isAdmin: state.user.isAdmin,
        needsWrite: op !== "list" && op !== "read"
      }).then(() => { state.asserted = true; });


      return await state.$transaction(async (prisma) => {
        const recipe = await RecipeResolver.assertRecipe({ state, prisma, recipe_slug });
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
}



// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

serverEvents.on("mws.routes", (root) => {

  const parent = root.defineRoute({
    method: [],
    denyFinal: true,
    path: new RegExp(`^(?=${RECIPE_PREFIX}/|${WIKI_PREFIX}/|/admin/)`),
  }, async (state) => {
    state.user.isAdmin = true;
    state.user.isLoggedIn = true;
  });

  registerZodRoutes(parent, new NewWikiRecipeRoutes(), Object.keys({
    handleGetRecipeStatus: true,
    handleGetRecipeUpdates: true,
    rpcRecipeTiddlerBatch: true,
    rpcRecipeTiddlerListGet: true,
  } satisfies RouterKeyMap<NewWikiRecipeRoutes, true>));


  parent.defineRoute<"ignore">({
    method: ["GET", "HEAD", "OPTIONS"],
    path: new RegExp(`^/admin/store$`),
    bodyFormat: "ignore",
  }, async (state) => {
    state.asserted = state.user.isAdmin;
    state.sendJSON(200, await state.$transaction(async prisma => {
      return await getAdminDataStore(prisma);
    }));
  });

  parent.defineRoute<"ignore">({
    method: ["GET", "HEAD", "OPTIONS"],
    path: new RegExp(`^/wiki/(?<recipe_slug>[^/]+)$`),
    bodyFormat: "ignore",
  }, async (state) => {
    if (state.method === "OPTIONS")
      return state.sendEmpty(405);

    checkPath(state, z => ({
      recipe_slug: z.prismaField("Recipe", "slug", "string"),
    }), new Error());

    const { recipe_slug } = state.pathParams;

    await RecipeResolver.assertRecipeAccess({
      prisma: state.engine,
      recipe_slug,
      role_ids: state.user.roles.map(e => e.role_id),
      isAdmin: state.user.isAdmin,
      needsWrite: false
    }).then(() => { state.asserted = true; });

    await state.$transaction(async (prisma) => {
      const recipe = await RecipeResolver.assertRecipe({ state, prisma, recipe_slug });
      await new RecipeResolver(recipe, prisma, state.user.isAdmin).serveIndexFile(state);
    });

    return STREAM_ENDED;
  }, async (state, e) => {
    if (state.headersSent) {
      console.log(e.stack + "\nCaptured by:\n" + new Error("").stack?.split("\n").slice(1).join("\n"));
    }
    // else if (state.headers.accept.accepts("text/html")) {
    //   if (e instanceof SendError) {
    //     return await state.sendAdmin({ status: e.status, serverResponse: { sendError: e } });
    //   } else {
    //     const se = new SendError("INTERNAL_SERVER_ERROR", 500, { message: "An unknown error occured. Details have been logged." })
    //     await state.sendAdmin({ status: se.status, serverResponse: { sendError: se } });
    //   }
    // }
    throw e;
  });
});

