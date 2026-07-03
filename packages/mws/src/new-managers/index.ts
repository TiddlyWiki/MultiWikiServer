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

import { checkPath, defineZodRoute, jsonify, RemoveNever, zod, ZodRoute } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { IndexSender, RecipeResolver, } from "./RecipeResolver";
import { AdminLoad, AdminSave, user_update_password } from "./TabDataAdapter";
import { RecipeStatus, RecipeUpdates, TiddlerBatch, TiddlerList } from "./RecipeRoutes";
import { IdString, KeyString } from "@mws/admin-vanilla/src/definition/tabs";

export * from "./RecipeResolver";
export * from "./TabDataAdapter";
export * from "./TabImportWriter";
export * from "./wiki-utils";
export * from "./wiki-contract";

// #region Routes
// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------
export type jsonify2Tuple<T> = T extends [infer A, ...infer B] ? [jsonify2<A>, ...jsonify2Tuple<B>] : T extends [infer A] ? [jsonify<A>] : [];

export type jsonify2<T> =
  T extends IdString ? string :
  T extends KeyString ? string :
  T extends [...any[]] ? number extends T["length"] ? jsonify2<T[number]>[] : [...jsonify2Tuple<T>] :
  T extends Array<infer U> ? jsonify2<U>[] :
  T extends ReadonlyArray<infer U> ? jsonify2<U>[] :
  T extends object ? { [K in keyof T as T[K] extends never ? never : K]: jsonify2<T[K]> } :
  jsonify<T>;

type ExtractTypes<PATH, Q2 extends string[], REQ, RES> = (args: {
  path: { [K in keyof PATH]: zod.input<PATH[K]>; };
  query: string extends Q2[number] ? undefined : Record<Q2[number], string[]>;
  data: zod.input<REQ>;
}) => Promise<RES>;

export type RouterRouteMap<T> = {
  [K in keyof T as T[K] extends ZodRoute<any, any, any, any, any, any, any> ? K : never]:
  T[K] extends ZodRoute<any, any, infer PATH, any, infer Q2, infer REQ, infer RES>
  ? ExtractTypes<PATH, Q2, REQ, RES>
  : `${K & string} does not extend`;
}

export type ClientRoute<T> =
  T extends ZodRoute<any, any, infer PATH, any, infer Q2, infer REQ, infer RES>
  ? ExtractTypes<PATH, Q2, REQ, RES>
  : never;

type t1 = ART<ClientRoute<typeof user_update_password>>

const ApiRoutes = {
  RecipeStatus,
  RecipeUpdates,
  TiddlerBatch,
  TiddlerList,
  AdminLoad,
  AdminSave,
  user_update_password,
};

// type t1 = RouterRouteMap<typeof ApiRoutes>;
// const test: t1 = {} as any;
// test.AdminLoad({})
// test.AdminSave({})
// test.TiddlerBatch({})
// test.TiddlerList({})
// test.RecipeStatus({})
// test.RecipeUpdates({})

serverEvents.on("mws.routes", (root) => {

  const parent = root.defineRoute({
    method: [],
    denyFinal: true,
    path: new RegExp(`^(?=/recipe/|/wiki/|/admin/|/api/)`),
  }, async (state) => {
    state.user.isAdmin = true;
    state.user.isLoggedIn = true;
  });

  (Object.entries(ApiRoutes)).forEach(([key, val]) => {
    defineZodRoute(parent, key, val as any);
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

