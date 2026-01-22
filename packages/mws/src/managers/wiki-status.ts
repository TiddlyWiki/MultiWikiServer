

import { WikiStateStore } from "./WikiStateStore";
import Debug from "debug";
import { zod, zodRoute } from "@tiddlywiki/server";
import { serverEvents, ServerEventsMap } from "@tiddlywiki/events";
import { RECIPE_PREFIX } from "./wiki-utils";
import { SendError } from "@tiddlywiki/server";
const debugCORS = Debug("mws:cors");
const debugSSE = Debug("mws:sse");

export class WikiStatusRoutes {

  handleGetRecipeStatus = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/status",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    inner: async (state) => {

      const { recipe_name } = state.pathParams;

      const { recipe, canRead, canWrite, referer } = await state.getRecipeACL(recipe_name, true);

      if (referer && referer !== recipe_name)
        throw state.sendEmpty(403, { "x-reason": "the page does not have permission to access this endpoint" });

      if (!recipe) throw state.sendEmpty(404, { "x-reason": "recipe not found" });
      if (!canRead) throw state.sendEmpty(403, { "x-reason": "read access denied" });
      
      const { isAdmin, user_id, username, isLoggedIn } = state.user;

      return {
        isAdmin,
        user_id,
        username,
        isLoggedIn,
        isReadOnly: !canWrite,
      };
    }
  });

  handleGetRecipeEvents = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/events",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    zodQueryParams: z => ({
      "first-event-id": z.string().array().optional(),
    }),
    inner: async (state) => {

      const { recipe_name } = state.pathParams;

      await state.assertRecipeAccess(recipe_name, false);

      let lastEventID = state.headers.get('last-event-id') || state.queryParams["first-event-id"]?.[0];

      if (!lastEventID) throw new SendError("LAST_EVENT_ID_NOT_PROVIDED", 403, null);

      debugSSE("connection opened", recipe_name);
      const events = state.sendSSE();
      serverEvents.on("mws.tiddler.events", onEvent);
      events.onClose(() => {
        debugSSE("connection closed", recipe_name);
        serverEvents.off("mws.tiddler.events", onEvent);
      });

      let timeout: any = null, lastSent = 0;

      scheduleEvent();

      throw STREAM_ENDED;

      // catch errors here otherwise they would cause the initiating request to 
      // possibly return a 500 response. Since the event happens after the 
      // transaction closes, it wouldn't roll it back.

      // the only way to optimize this would be if the mws event included the 
      // entire recipe_bags table, so we could check if the bag is in our recipe

      // it's worse because we're using recipe and bag names instead of ids
      // we also aren't checking permissions every time we emit an event

      // TODO: there are probably things we could improve.

      async function onEvent(data: ServerEventsMap["mws.tiddler.events"][0]) {
        try {
          debugSSE("onEvent", data);
          const hasBag = !!await state.engine.recipe_bags.count({
            where: {
              recipe: { recipe_name },
              bag: { bag_name: data.bag_name },
            },
          });
          if (hasBag) {
            debugSSE("hasBag", data.bag_name);
            scheduleEvent();
          }
        } catch (e) {
          console.error("Error in onSave for recipe events", e);
        }
      }

      function scheduleEvent() {
        // if we haven't sent an event in 5 seconds, don't keep debouncing
        if (timeout && lastSent < Date.now() - 5000)
          return void debugSSE("don't debounce", recipe_name, lastSent);
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(sendEvent, 1000);
      }

      async function sendEvent() {
        timeout = null;
        lastSent = Date.now();
        try {
          debugSSE("sendEvent", recipe_name, lastEventID);
          const { updates, newlastevent } = await sendTiddlerEvents(state.engine, recipe_name, lastEventID!, events);
          debugSSE("sendEvent updates", updates.map(e => e.bag.tiddlers.map(e => e.title)), newlastevent);
          if (lastEventID === newlastevent) return;
          events.emitEvent("tiddler.since-last-event", updates, newlastevent);
          lastEventID = newlastevent;
        } catch (e) {
          console.error("Error in sendTiddlerEvents", e);
        }
      }


    }
  })

  handleGetBags = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/bags",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    inner: async (state) => {

      const { recipe_name } = state.pathParams;
      await state.assertRecipeAccess(recipe_name, false);

      const result = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return await server.getRecipeBags(recipe_name);
      });

      return result;

    }
  })

  handleGetBagState = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/bags/:bag_name/state",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      bag_name: z.prismaField("Bags", "bag_name", "string"),
    }),
    zodQueryParams: z => ({
      last_known_revision_id: z.prismaField("Tiddlers", "revision_id", "string").array().optional(),
      include_deleted: z.enum(["yes", "no"]).array().optional(),
    }),
    inner: async (state) => {

      const { recipe_name, bag_name } = state.pathParams;
      await state.assertRecipeAccess(recipe_name, false);

      const last_known_revision_id = state.queryParams.last_known_revision_id?.[0];
      const include_deleted = state.queryParams.include_deleted?.[0] === "yes";

      const result = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return await server.getBagTiddlers(bag_name, { include_deleted, last_known_revision_id });
      });

      let etag = "";
      for (const t of result.tiddlers) {
        if (etag < t.revision_id) etag = t.revision_id;
      }
      const newEtag = `"${etag}"`;
      const match = state.headers.get("if-none-match")?.has(newEtag);
      state.setHeader("etag", newEtag);

      if (match) throw state.sendEmpty(304, {});

      return result;

    }
  });


  handleGetAllBagStates = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/all-bags-state",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    zodQueryParams: z => ({
      last_known_revision_id: z.prismaField("Tiddlers", "revision_id", "string").array().optional(),
      include_deleted: z.enum(["yes", "no"]).array().optional(),
      gzip_stream: z.enum(["yes", "no"]).array().optional(),
    }),
    inner: async (state) => {

      const { recipe_name } = state.pathParams;
      await state.assertRecipeAccess(recipe_name, false);

      const
        last_known_revision_id = state.queryParams.last_known_revision_id?.[0],
        include_deleted = state.queryParams.include_deleted?.[0] === "yes",
        gzip_stream = state.queryParams.gzip_stream?.[0] === "yes";

      const result = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const bags = await server.getRecipeBags(recipe_name);

        const alltids = await Promise.all(bags.map(({ bag_name, position }) =>
          server.getBagTiddlers_PrismaQuery(bag_name, {
            include_deleted,
            last_known_revision_id
          }).then(f => ({ ...f, position }))
        ));

        return zod.array(zod.strictObject({
          bag_id: zod.string(),
          bag_name: zod.string(),
          position: zod.number(),
          tiddlers: zod.strictObject({
            title: zod.string(),
            revision_id: zod.string(),
            is_deleted: zod.boolean()
          }).array()
        })).parse(alltids);
      });

      let etag = "";
      for (const b of result) {
        for (const t of b.tiddlers) {
          if (etag < t.revision_id) etag = t.revision_id;
        }
      }
      const newEtag = `"${etag}${gzip_stream}"`;
      const match = state.headers.get("if-none-match")?.has(newEtag);
      // 304 has to return the same headers if they're to be useful, 
      // so we'll also put them in the etag in case it ignores the query
      state.writeHead(match ? 304 : 200, gzip_stream ? {
        "content-type": "application/gzip",
        "content-encoding": "identity",
        "x-gzip-stream": "yes",
        "etag": newEtag,
      } : {
        "content-type": "application/json",
        "content-encoding": "identity",
        "etag": newEtag,
      });
      if (match) throw state.end();

      state.writeFast("[");
      for (let i = 0; i < result.length; i++) {
        await state.write((i > 0 ? "," : "") + JSON.stringify(result[i]));
        if (gzip_stream) await state.splitCompressionStream();
      }
      state.writeFast("]");
      throw state.end();

      // this still sets the return type of the function
      return result;

    }
  })


}
async function sendTiddlerEvents(
  engine: PrismaEngineClient,
  recipe_name: string & { __prisma_table: "Recipes"; __prisma_field: "recipe_name"; },
  lastEventID: string,
  events: { emitEvent: (eventName: string, eventData: any, eventId: string) => void; emitComment: (comment: string) => void; onClose: (callback: () => void) => void; close: () => void; }
) {
  const updates = await engine.recipe_bags.findMany({
    where: { recipe: { recipe_name } },
    orderBy: { position: "asc" },
    select: {
      bag_id: true,
      recipe_id: true,
      position: true,
      bag: {
        select: {
          bag_name: true,
          tiddlers: {
            select: {
              title: true,
              revision_id: true,
              is_deleted: true,
            },
            where: {
              revision_id: lastEventID ? { gt: lastEventID } : undefined,
            },
          }
        }
      }
    }
  });
  let newlastevent = lastEventID;
  updates.forEach(({ bag }) => {
    bag.tiddlers.forEach(tiddler => {
      if (newlastevent < tiddler.revision_id) newlastevent = tiddler.revision_id;
    });
  });
  // if there were no updates, just use the same last event id
  events.emitEvent("tiddler.since-last-event", updates, newlastevent);

  return { updates, newlastevent };
}

type SendTiddlerEventsResult = ART<typeof sendTiddlerEvents>["updates"];
