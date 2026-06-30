

import { WikiStateStore } from "./WikiStateStore";
import Debug from "debug";
import { checkPath, checkQuery, registerZodRoutes, RouterKeyMap, tryParseJSON, Z2, zod, zodDecodeURIComponent, zodTransformJSON } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { WikiRecipeRoutes } from "./wiki-recipe";
import { WikiStatusRoutes } from "./wiki-status";
import { RECIPE_PREFIX } from "./wiki-utils";
import { WikiExternalRoutes } from "./wiki-external";
import { SendError, SendErrorReason } from "@tiddlywiki/server";
const debugCORS = Debug("mws:cors");
const debugSSE = Debug("mws:sse");


export { WikiExternalRoutes, WikiRecipeRoutes, WikiStatusRoutes };

declare module "@tiddlywiki/server" {
  interface IncomingHttpHeaders {
    'last-event-id'?: string;
  }
}

serverEvents.on("mws.routes", (root, config) => {


  // lets start with the scenarios from the sync adapter
  // 1. Status - The wiki status that gets sent to the TW5 client
  // 2. tiddlers.json - gets a skinny list of the recipe bag state.
  // 3. Save Tiddler - create or update a tiddler
  // 4. Load Tiddler - load the data for a tiddler
  // 5. Delete Tiddler - delete a tiddler
  // 6. Wiki Index - the wiki client itself, with all the config 
  //    from the recipe, and the initial tiddler state

  const parent = root.defineRoute({
    method: [],
    denyFinal: true,
    path: new RegExp(`^(?=${RECIPE_PREFIX}/)`),
  }, async state => {

  });

  // ctrl-click to navigate to any of these routes

  registerZodRoutes(parent, new WikiStatusRoutes(), Object.keys({
    handleGetAllBagStates: true,
    handleGetBagState: true,
    handleGetRecipeStatus: true,
    handleGetRecipeEvents: true,
    handleGetBags: true,
  } satisfies RouterKeyMap<WikiStatusRoutes, true>));

  registerZodRoutes(parent, new WikiRecipeRoutes(), Object.keys({
    handleDeleteRecipeTiddler: true,
    handleLoadRecipeTiddler: true,
    handleSaveRecipeTiddler: true,
    rpcDeleteRecipeTiddlerList: true,
    rpcLoadRecipeTiddlerList: true,
    rpcSaveRecipeTiddlerList: true,
  } satisfies RouterKeyMap<WikiRecipeRoutes, true>));

  // registerZodRoutes(parent, new WikiExternalRoutes(), Object.keys({
  //   handleFormMultipartRecipeTiddler: true,
  //   handleFormMultipartBagTiddler: true,
  //   handleDeleteBagTiddler: true,
  //   handleLoadBagTiddler: true,
  //   handleSaveBagTiddler: true,
  // } satisfies RouterKeyMap<WikiExternalRoutes, true>));

  // the wiki index route
  root.defineRoute({
    method: ["GET", "HEAD", "OPTIONS"],
    path: /^\/wiki\/(?<recipe_name>.*)$/,
    bodyFormat: "ignore",
  }, async (state) => {
    if (state.method === "OPTIONS") throw state.sendEmpty(405, {});

    const timekey = `handler ${state.bodyFormat} ${state.method} ${state.urlInfo.pathname} ${Date.now()}`;

    checkPath(state, z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }), new Error());

    if (!state.pathParams.recipe_name) {
      throw new SendError("RECIPE_NOT_FOUND", 404, { recipeName: state.pathParams.recipe_name });
    }

    if (Debug.enabled("server:handler:timing")) console.time(timekey);

    await state.assertRecipeAccess(state.pathParams.recipe_name, false);

    await state.$transaction(async (prisma) => {
      const server = new WikiStateStore(state, prisma);
      await server.serveIndexFile(state.pathParams.recipe_name);
    });

    if (Debug.enabled("server:handler:timing")) console.timeEnd(timekey);

    throw STREAM_ENDED;
  }, async (state, e) => {
    if (e instanceof SendError) {
      if (state.headersSent) {
        console.log(e + "\n" + new Error("").stack?.split("\n").slice(2).join("\n"));
      } else {
        await state.sendAdmin({ status: e.status, serverResponse: { sendError: e } });
      }
    } else {
      throw e;
    }
    throw STREAM_ENDED;
  });
})
