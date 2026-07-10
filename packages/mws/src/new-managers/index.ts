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

import { checkPath, checkQueryKeys, defineZodRoute, zod, ZodRoute } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { RecipeResolver, serveIndex, } from "./RecipeResolver";
import { AdminLoad, AdminSave } from "./TabDataAdapter";
import { RecipeStatus, RecipeStore, RecipeUpdates, TiddlerBatch, TiddlerList } from "./RecipeRoutes";

export * from "./RecipeResolver";
export * from "./TabDataAdapter";
export * from "./TabUpserts";
export * from "./wiki-utils";
export * from "./wiki-contract";

// #region Routes
// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------
// type jsonify2Tuple<T> = T extends [infer A, ...infer B] ? [jsonify2<A>, ...jsonify2Tuple<B>] : T extends [infer A] ? [jsonify<A>] : [];

type Optional<T> = {
  [P in keyof T as T[P] extends undefined ? P : never]?: T[P];
} & {
  [P in keyof T as T[P] extends undefined ? never : P]: T[P];
};

// type jsonify2<T> =
//   T extends IdString ? string :
//   T extends string ? string :
//   T extends [...any[]] ? number extends T["length"] ? jsonify2<T[number]>[] : [...jsonify2Tuple<T>] :
//   T extends Array<infer U> ? jsonify2<U>[] :
//   T extends ReadonlyArray<infer U> ? jsonify2<U>[] :
//   T extends object ? { [K in keyof T as T[K] extends never ? never : K]: jsonify2<T[K]> } :
//   jsonify<T>;

type ExtractTypes2<PATH, Q2 extends string[], REQ, RES> = (args: Optional<{
  path: keyof PATH extends never ? undefined : { [K in keyof PATH]: zod.input<PATH[K]>; };
  query: string extends Q2[number] ? undefined : Record<Q2[number], string[]>;
  data: undefined extends REQ ? undefined : zod.input<REQ>;
}>) => Promise<RES>;

type RouterRouteMap2<T> = {
  [K in keyof T as ClientRoute<T[K]> extends Function ? K : never]: ClientRoute<T[K]>;
}

type ClientRoute<T> =
  T extends ZodRoute<any, infer B, infer PATH, infer Q2, infer REQ, infer RES>
  ? B extends "ignore" ? ExtractTypes2<PATH, Q2, undefined, RES> : ExtractTypes2<PATH, Q2, REQ, RES>
  : never;


serverEvents.on("mws.routes", (root) => {

  const parent = root.defineRoute({
    method: [],
    denyFinal: true,
    path: new RegExp(`^(?=/recipe/|/wiki/|/admin/|/api/)`),
  }, async (state) => { });

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
    state.assertWikiReferer(recipe_slug);
    return await serveIndex(state, recipe_slug, "index");

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




const ApiRoutes = {
  RecipeStatus,
  RecipeUpdates,
  RecipeStore,
  TiddlerBatch,
  TiddlerList,
  AdminLoad,
  AdminSave,
};
interface ClientRoutes {
  AdminLoad: ClientRoute<typeof AdminLoad>;
  AdminSave: ClientRoute<typeof AdminSave>;
  TiddlerBatch: ClientRoute<typeof TiddlerBatch>;
  TiddlerList: ClientRoute<typeof TiddlerList>;
  RecipeStatus: ClientRoute<typeof RecipeStatus>;
  RecipeUpdates: ClientRoute<typeof RecipeUpdates>;
}
type ClientRoutes2 = RouterRouteMap2<typeof ApiRoutes>;