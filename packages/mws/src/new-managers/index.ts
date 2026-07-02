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

import { registerZodRoutes, RouterKeyMap, ServerRequest, truthy, checkPath } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { IndexSender, RecipeResolver, } from "./RecipeResolver";
import { doAdminDataOp, getAdminDataStore, } from "./tab-routes";
import { TabId } from "@mws/admin-vanilla/src/definition/tabs";
import { RecipeRoutes } from "./RecipeRoutes";

// #region Routes
// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

serverEvents.on("mws.routes", (root) => {

  const parent = root.defineRoute({
    method: [],
    denyFinal: true,
    path: new RegExp(`^(?=/recipe/|/wiki/|/admin/)`),
  }, async (state) => {
    state.user.isAdmin = true;
    state.user.isLoggedIn = true;
  });

  registerZodRoutes(parent, new RecipeRoutes(), Object.keys({
    handleGetRecipeStatus: true,
    handleGetRecipeUpdates: true,
    rpcRecipeTiddlerBatch: true,
    rpcRecipeTiddlerListGet: true,
  } satisfies RouterKeyMap<RecipeRoutes, true>));


  parent.defineRoute<"ignore">({
    method: ["GET", "HEAD",],
    path: new RegExp(`^/admin/load$`),
    bodyFormat: "ignore",
  }, async (state) => {
    state.asserted = state.user.isAdmin;
    state.sendJSON(200, await state.$transaction(async prisma => {
      return await getAdminDataStore(prisma, state.pluginCache);
    }));
  });

  parent.defineRoute<"ignore">({
    method: ["PUT", "OPTIONS"],
    path: new RegExp(`^/admin/(?<op>[^/]+)/(?<tab>.*)$`),
    bodyFormat: "json",
  }, async (state) => {
    if (state.method === "OPTIONS")
      return state.sendEmpty(200);
    state.asserted = state.user.isAdmin;
    checkPath(state, z => ({
      op: z.enum(["save"]),
      tab: z.enum(["wikis", "templates", "bags", "plugins", "users", "roles"] satisfies TabId[])
    }), new Error())
    return state.sendJSON(200, await state.$transaction(async prisma => {
      return await doAdminDataOp({
        prisma,
        pluginCache: state.pluginCache,
        op: state.pathParams.op,
        tab: state.pathParams.tab,
        data: state.data
      });
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
    const recipe = await RecipeResolver.assertRecipe({
      state,
      recipe_slug,
      needsWrite: false
    }).then(e => {
      state.asserted = true;
      return e;
    });

    // we get close the transaction before we start sending the data so the transaction isn't held up by client bandwidth
    const { bagTiddlers, maxSeq } = await state.$transaction(async (prisma) => {
      const { bagTiddlers, maxSeq }
        = await new RecipeResolver(recipe, prisma, state.user.isAdmin)
          .getIndexData(state.method === "GET");
      return { recipe, bagTiddlers, maxSeq };
    });

    return await new IndexSender(recipe, bagTiddlers, maxSeq).serveIndexFile(state);

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

