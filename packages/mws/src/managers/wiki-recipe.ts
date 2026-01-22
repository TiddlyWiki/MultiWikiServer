

import { TiddlerFields } from "tiddlywiki";
import { WikiStateStore } from "./WikiStateStore";
import Debug from "debug";
import { zodRoute } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { Prisma } from "@tiddlywiki/mws-prisma";
import { parseTiddlerFields, RECIPE_PREFIX, rethrow } from "./wiki-utils";
import { SendError } from "@tiddlywiki/server";
import { truthy } from "@tiddlywiki/server";
const debugCORS = Debug("mws:cors");
const debugSSE = Debug("mws:sse");


export class WikiRecipeRoutes {

  handleLoadRecipeTiddler = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/tiddlers/:title",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    inner: async (state) => {
      const { recipe_name, title } = state.pathParams;

      await state.assertRecipeAccess(recipe_name, false);
      // we can only throw STREAM_ENDED outside the transaction
      throw await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const bag = await server.getRecipeBagWithTiddler({ recipe_name, title });
        if (!bag) return state.sendEmpty(404, { "x-reason": "tiddler not found" });
        return await server.serveBagTiddler(
          bag.bag_id,
          bag.bag.bag_name,
          title
        );
      });

    }
  })

  rpcLoadRecipeTiddlerList = zodRoute({
    method: ["PUT"],
    path: RECIPE_PREFIX + "/:recipe_name/rpc/$key",
    keyReplacer: "$key",
    bodyFormat: "json",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    zodRequestBody: z => z.strictObject({
      titles: z.prismaField("Tiddlers", "title", "string").array(),
    }),
    inner: async (state) => {

      const { recipe_name } = state.pathParams;

      await state.assertRecipeAccess(recipe_name, false);

      return await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const bags = await server.getRecipeBags(recipe_name);
        const bagsLookup = new Map(bags.map(b => [b.bag_id, b] as const));

        const bagtids = (await Promise.all(bags.map(({ bag_name, bag_id, position }) =>
          server.getBagTiddlers_PrismaQuery(bag_name, {}).then(f => f?.tiddlers.map(t => ({ ...t, bag_name, bag_id, position })))
        ))).filter(truthy).flat();

        bagtids.sort((a, b) => b.position - a.position);

        const requestedTitles = new Set(state.data.titles);
        const titles = Array.from(new Map(bagtids.map(b => [b.title, b])).values())
          .filter(e => requestedTitles.has(e.title));

        const titlesByBagID = titles.reduce((acc, t) => {
          if (!acc[t.bag_id]) acc[t.bag_id] = [];
          acc[t.bag_id]!.push(t);
          return acc;
        }, {} as Record<string, typeof titles>);

        const result = await Promise.all(Object.keys(titlesByBagID).map(e => prisma.bags.findMany({
          where: { bag_id: e },
          select: {
            tiddlers: {
              where: {
                title: { in: titlesByBagID[e]!.map(t => t.title) },
              },
              select: {
                bag_id: true,
                fields: true,
              }
            }
          }
        })));

        return result.map(e => e.map(f => f.tiddlers.map(g => ({
          bag_id: g.bag_id,
          bag_name: rethrow(() => bagsLookup.get(g.bag_id)!.bag_name, "Found a tiddler from a different bag. This is a server error."),
          tiddler: Object.fromEntries(g.fields.map(e => [e.field_name, e.field_value] as const)) as TiddlerFields
        }))).flat()).flat();

      });

    }
  });


  handleSaveRecipeTiddler = zodRoute({
    method: ["PUT"],
    path: RECIPE_PREFIX + "/:recipe_name/tiddlers/:title",
    bodyFormat: "string",
    securityChecks: { requestedWithHeader: true },
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    zodRequestBody: z => z.string(),
    inner: async (state) => {

      const { recipe_name } = state.pathParams;

      const { recipe_id } = await state.assertRecipeAccess(recipe_name, true);

      const fields = parseTiddlerFields(state.data, state.headers.get("content-type")?.mediaType);

      if (fields === undefined)
        throw state.sendEmpty(400, {
          "x-reason": "PUT tiddler expects a valid json or x-mws-tiddler body"
        });

      const { bag_id, bag_name, revision_id } = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const bag = await server.getRecipeWritableBag(recipe_name);
        const { revision_id } = await server.saveBagTiddlerFields(fields, bag.bag_id, null);
        return { bag_id: bag.bag_id, revision_id, bag_name: bag.bag_name };
      });

      await serverEvents.emitAsync("mws.tiddler.events", {
        recipe_id,
        recipe_name,
        bag_id,
        bag_name,
        results: [{ title: fields.title, revision_id, is_deleted: false }]
      });

      return { bag_name, revision_id };

    }
  });

  rpcSaveRecipeTiddlerList = zodRoute({
    method: ["PUT"],
    path: RECIPE_PREFIX + "/:recipe_name/rpc/$key",
    keyReplacer: "$key",
    bodyFormat: "json",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    zodRequestBody: z => z.strictObject({
      tiddlers: z.record(z.string(), z.string()).array(),
    }),
    inner: async (state) => {
      const { recipe_name } = state.pathParams;
      const { tiddlers } = state.data;

      const { recipe_id } = await state.assertRecipeAccess(recipe_name, true);
      const server = new WikiStateStore(state, state.config.engine);
      const { bag_id, bag_name } = await server.getRecipeWritableBag(recipe_name);
      const results = await state.config.engine.$transaction(tiddlers.map(fields =>
        server.saveBagTiddlerFields_PrismaArray(fields as TiddlerFields, bag_id, null)
      ).flat());

      const results2 = results.filter((e, i): e is Exclude<typeof e, Prisma.BatchPayload> => i % 2 === 1);

      await serverEvents.emitAsync("mws.tiddler.events", {
        recipe_id,
        recipe_name,
        bag_id,
        bag_name,
        results: results2.map(({ title, revision_id }) => ({ title, revision_id, is_deleted: false }))
      });

      // console.log("rpcSaveRecipeTiddlerList results2", results2);

      return results2;
    }
  });

  handleDeleteRecipeTiddler = zodRoute({
    method: ["DELETE"],
    path: RECIPE_PREFIX + "/:recipe_name/tiddlers/:title",
    bodyFormat: "json",
    securityChecks: { requestedWithHeader: true },
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    zodRequestBody: z => z.undefined(),
    inner: async (state) => {

      const { recipe_name, title } = state.pathParams;
      if (!recipe_name || !title) throw state.sendEmpty(404, { "x-reason": "bag_name or title not found" });

      const { recipe_id } = await state.assertRecipeAccess(recipe_name, true);

      const { bag_id, bag_name, revision_id } = await state.$transaction(async (prisma) => {

        const server = new WikiStateStore(state, prisma);

        const { bag_id, bag_name, tiddlers } = await server.getRecipeWritableBag(recipe_name, title);

        if (!tiddlers.length)
          throw new SendError("BAG_DOES_NOT_HAVE_THIS_TIDDLER", 403, {
            bagName: bag_name,
            tiddlerTitle: title
          });

        const { revision_id } = await server.deleteBagTiddler(bag_id, title);

        return { bag_id, revision_id, bag_name };

      });

      await serverEvents.emitAsync("mws.tiddler.events", {
        recipe_id,
        recipe_name,
        bag_id,
        bag_name,
        results: [{ title, revision_id, is_deleted: true }]
      });

      return { bag_id, bag_name, revision_id };

    }
  });

  rpcDeleteRecipeTiddlerList = zodRoute({
    method: ["PUT"],
    path: RECIPE_PREFIX + "/:recipe_name/rpc/$key",
    keyReplacer: "$key",
    bodyFormat: "json",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    zodRequestBody: z => z.strictObject({
      titles: z.prismaField("Tiddlers", "title", "string").array(),
    }),
    inner: async (state) => {
      const { recipe_name } = state.pathParams;
      const { titles } = state.data;

      const { recipe_id } = await state.assertRecipeAccess(recipe_name, true);
      const server = new WikiStateStore(state, state.config.engine);
      const { bag_id, bag_name } = await server.getRecipeWritableBag(recipe_name);
      const results = await state.config.engine.$transaction(titles.map(title =>
        server.deleteBagTiddler_PrismaArray(bag_id, title)
      ).flat());
      const results2 = results.filter((e, i): e is Exclude<typeof e, Prisma.BatchPayload> => i % 2 === 1);

      await serverEvents.emitAsync("mws.tiddler.events", {
        recipe_id,
        recipe_name,
        bag_id,
        bag_name,
        results: results2.map(({ title, revision_id }) => ({ title, revision_id, is_deleted: true }))
      });

      return results2;
    }
  });

}

declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.tiddler.events": [{
      recipe_id?: string;
      recipe_name?: string;
      bag_id: string;
      bag_name: string;
      results: { title: string; revision_id: string; is_deleted: boolean; }[];
    }];
  }
}

