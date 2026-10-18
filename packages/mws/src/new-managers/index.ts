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

import { checkPath, RouterRouteMap, SendError, ServerRequest, zod, ZodRoute } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { serveDocsIndex, serveWikiIndex, } from "./RecipeIndexSender";

import {
  fileSystemMountHandler
} from "./tiddlyserver";
import { RecipeRoutes } from "./RecipeRoutes";
import { AdminRoutes } from "./TabDataAdapter";
import esr from "escape-string-regexp";
import { SessionManager } from "./sessions";
import { registerCacheRoutes } from "../plugin-cache";
import { registerDocsRoute } from "../services/tw-routes";

export * from "./RecipeResolver";
export * from "./TabDataAdapter";
export * from "./TabUpserts";
export * from "./wiki-utils";
export * from "./wiki-contract";
export * from "./tiddlyserver";

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

export type AdminRoutesMap = RouterRouteMap<AdminRoutes>;

serverEvents.on("mws.routes", (root, config) => {
  // this has to happen first so static and wiki can't override it
  SessionManager.defineRoutes(root);


  RecipeRoutes.defineRoutes(root, config);

  AdminRoutes.defineRoutes(root, config);

  registerCacheRoutes(root, config);

  root.defineRoute<"ignore">({
    method: ["GET", "HEAD", "OPTIONS"],
    path: new RegExp(`^${esr(config.rootRoutes.tw5)}/(?<version>.*)$`),
    bodyFormat: "ignore",
  }, async (state) => {

    if (state.method === "OPTIONS") return state.sendEmpty(405);
    checkPath(state, z => ({ version: z.string() }), new Error());
    return await serveDocsIndex(state, state.pathParams.version);

  });

  root.defineRoute<"ignore">({
    method: ["GET", "HEAD", "OPTIONS"],
    path: new RegExp(`^${esr(config.rootRoutes.assets)}/(?<path>.*)$`),
    bodyFormat: "ignore",
  }, async (state) => {

    if (state.method === "OPTIONS") return state.sendEmpty(405);
    checkPath(state, z => ({ path: z.string() }), new Error());
    return state.sendAdmin();

  });


  async function serveStatic(state: ServerRequest<"ignore", string, unknown>, path: string, sendNotFound: boolean) {
    return await fileSystemMountHandler(state, state.config.staticMounts, path, sendNotFound);
  }

  async function serveWiki(state: ServerRequest<"ignore", string, unknown>, recipe_slug: string, sendNotFound: boolean) {
    if (state.method === "OPTIONS" || state.method === "PUT")
      return state.sendEmpty(405);
    recipe_slug = recipe_slug.slice(1);
    state.assertWikiReferer(recipe_slug);
    return await serveWikiIndex(state, recipe_slug, "index", sendNotFound);
  }

  root.defineRoute<"ignore">({
    method: ["GET", "HEAD", "OPTIONS", "PUT"],
    path: new RegExp(`^(?<path>.*)$`),
    bodyFormat: "ignore",
  }, async (state) => {

    checkPath(state, z => ({ path: z.string(), }), new Error());

    const path = state.pathParams.path;
    const { static: staticRoot, wiki: wikiRoot } = config.rootRoutes;
    const or_404 = (handled?: any) => {
      // most of these will return STREAM_ENDED or throw STREAM_ENDED.
      // they aren't throwing SendError
      if (handled) return;
      throw new SendError("NOT_FOUND", 404, null);
    }

    // **Both roots set**
    // 1. Path matches static; item exists → static serves.
    // 2. Path matches static; item missing → 404.
    // **Only static root set**
    // 6. Path matches static; item exists → static serves.
    // 7. Path matches static; item missing → 404.
    if (staticRoot && state.pathParams.path.startsWith(staticRoot + "/")) {
      return or_404(await serveStatic(state, path.slice(staticRoot.length), false));
    }

    // **Both roots set**
    // 3. Path matches wiki; item exists → wiki serves.
    // 4. Path matches wiki; item missing → 404.
    // **Only wiki root set**
    // 10. Path matches wiki; item exists → wiki serves.
    // 11. Path matches wiki; item missing → 404.
    if (wikiRoot && state.pathParams.path.startsWith(wikiRoot + "/")) {
      return or_404(await serveWiki(state, path.slice(wikiRoot.length), false));
    }

    // **Only wiki root set**
    // 12. Path misses wiki; static item exists → static serves.
    // 13. Path misses wiki; static item missing → 404.
    // **Neither root set**
    // 14. Static item exists → static serves.
    if (!staticRoot) {
      const handled = await serveStatic(state, path, false);
      if (handled || wikiRoot) return or_404(handled);
    }

    // **Only static root set**
    // 8. Path misses static; wiki item exists → wiki serves.
    // 9. Path misses static; wiki item missing → 404.
    // **Neither root set**
    // 15. Static item missing; wiki item exists → wiki serves.
    // 16. Static and wiki items missing → 404.
    if (!wikiRoot) {
      return or_404(await serveWiki(state, path, false));
    }

    // **Both roots set**
    // 5. Path matches neither → 404.
    // sendAdmin will override SendError NOT_FOUND if it has an exact match for the path
    return or_404();

  }, async (state, e) => {
    if (state.headersSent) {
      console.log(e.stack + "\nCaptured by:\n" + new Error("").stack?.split("\n").slice(1).join("\n"));
    } else if (state.headers.accept.accepts("text/html")) {
      if (e instanceof SendError) {
        return await state.sendAdmin(e);
      } else {
        const se = new SendError("INTERNAL_SERVER_ERROR", 500, { message: "An unknown error occured. Details have been logged." })
        await state.sendAdmin(se);
      }
    }
    throw e;
  });
});



