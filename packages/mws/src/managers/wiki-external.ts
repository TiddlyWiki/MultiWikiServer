import { WikiStateStore } from "./WikiStateStore";
import Debug from "debug";
import { zodRoute } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { BAG_PREFIX, parseTiddlerFields, recieveTiddlerMultipartUpload, RECIPE_PREFIX } from "./wiki-utils";

const debugCORS = Debug("mws:cors");
const debugSSE = Debug("mws:sse");


// this is currently disabled
export class WikiExternalRoutes {


  // this is not used by the sync adaptor.
  // it allows an HTML form to upload a tiddler directly with file upload
  handleFormMultipartRecipeTiddler = zodRoute({
    method: ["POST"],
    path: RECIPE_PREFIX + "/:recipe_name/tiddlers",
    bodyFormat: "stream",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    inner: async (state) => {

      const { recipe_id } = await state.assertRecipeAccess(state.pathParams.recipe_name, true);

      const recipe_name = state.pathParams.recipe_name;

      const tiddlerFields = await recieveTiddlerMultipartUpload(state);

      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const { bag_name, bag_id } = await server.getRecipeWritableBag(recipe_name) ?? {};
        if (!bag_name) throw state.sendEmpty(404, { "x-reason": "bag not found" });
        const { revision_id } = await server.saveBagTiddlerFields(tiddlerFields, bag_id, null);
        return { bag_id, bag_name, results: { revision_id, bag_name } };
      });

      await serverEvents.emitAsync("mws.tiddler.events", {
        recipe_id,
        recipe_name,
        bag_id: res.bag_id,
        bag_name: res.bag_name,
        results: [{ title: tiddlerFields.title, revision_id: res.results.revision_id, is_deleted: false }],
      });

      return res;

    }
  });



  handleLoadBagTiddler = zodRoute({
    method: ["GET", "HEAD"],
    path: BAG_PREFIX + "/:bag_name/tiddlers/:title",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    inner: async (state) => {
      const { bag_name, title } = state.pathParams;
      const bag = await state.assertBagAccess(bag_name, false);
      throw await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return await server.serveBagTiddler(bag.bag_id, bag_name, title);
      });
    }
  });


  handleSaveBagTiddler = zodRoute({
    method: ["PUT"],
    path: BAG_PREFIX + "/:bag_name/tiddlers/:title",
    bodyFormat: "string",
    securityChecks: { requestedWithHeader: true },
    zodPathParams: z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    zodRequestBody: z => z.string(),
    inner: async (state) => {
      const { bag_name, title } = state.pathParams;
      const { bag_id } = await state.assertBagAccess(bag_name, true);
      const fields = parseTiddlerFields(state.data, state.headers.get("content-type")?.mediaType);
      if (fields === undefined)
        throw state.sendEmpty(400, {
          "x-reason": "PUT tiddler expects a valid json or x-mws-tiddler body"
        });
      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return server.saveBagTiddlerFields(fields, bag_id, null);
      });

      await serverEvents.emitAsync("mws.tiddler.events", {
        bag_name,
        bag_id,
        results: [{ title: fields.title, revision_id: res.revision_id, is_deleted: false }],
      });

      return res;
    }
  });
  handleDeleteBagTiddler = zodRoute({
    method: ["DELETE"],
    path: BAG_PREFIX + "/:bag_name/tiddlers/:title",
    bodyFormat: "ignore",
    securityChecks: { requestedWithHeader: true },
    zodPathParams: z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    inner: async (state) => {
      const { bag_name, title } = state.pathParams;
      const { bag_id } = await state.assertBagAccess(bag_name, true);
      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return server.deleteBagTiddler(bag_id, title);
      });
      await serverEvents.emitAsync("mws.tiddler.events", {
        bag_id,
        bag_name,
        results: [{ title, revision_id: res.revision_id, is_deleted: true }],
      });
      return res;
    }
  });
  handleFormMultipartBagTiddler = zodRoute({
    method: ["POST"],
    path: BAG_PREFIX + "/:bag_name/tiddlers",
    bodyFormat: "stream",
    zodPathParams: z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
    }),
    inner: async (state) => {
      const { bag_name } = state.pathParams;
      const { bag_id } = await state.assertBagAccess(bag_name, true);
      const tiddlerFields = await recieveTiddlerMultipartUpload(state);
      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return await server.saveBagTiddlerFields(tiddlerFields, bag_id, null);
      });
      await serverEvents.emitAsync("mws.tiddler.events", {
        bag_id,
        bag_name,
        results: [{ title: tiddlerFields.title, revision_id: res.revision_id, is_deleted: false }],
      });
      return res;
    }
  });

}
