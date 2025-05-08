import { StateObject } from "../../StateObject";
import { STREAM_ENDED } from "../../streamer";
import { tryParseJSON, ZodAssert as zodAssert } from "../../utils";
import { registerZodRoutes, zodRoute, RouterKeyMap, RouterRouteMap } from "../router";
import { TiddlerServer } from "../bag-file-server";


export const TiddlerKeyMap: RouterKeyMap<TiddlerRouter, true> = {
  handleCreateRecipeTiddler: true,
  handleDeleteRecipeTiddler: true,
  handleGetBagTiddler: true,
  handleGetBagTiddlerBlob: true,
  handleGetRecipeStatus: true,
  handleGetRecipeTiddler: true,
  handleListRecipeTiddlers: true,
  handleSaveRecipeTiddler: true,
  handleGetWikiIndex: true,
}

export type TiddlerManagerMap = RouterRouteMap<TiddlerRouter>;

export class TiddlerRouter {
  static defineRoutes = (root: rootRoute) => {
    registerZodRoutes(root, new TiddlerRouter(), Object.keys(TiddlerKeyMap));
  }

  handleGetRecipeStatus = zodRoute(
    ["GET", "HEAD"],
    "/recipes/:recipe_name/status",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    "ignore",
    z => z.undefined(),
    async (state) => {

      const { recipe_name } = state.pathParams;

      const { recipe, canRead, canWrite } = await state.getRecipeACL(recipe_name, true);

      if (!recipe) throw state.sendEmpty(404, { "x-reason": "recipe not found" });
      if (!canRead) throw state.sendEmpty(403, { "x-reason": "read access denied" });

      const { isAdmin, user_id, username } = state.user;

      return {
        isAdmin,
        user_id,
        username,
        isLoggedIn: state.user.isLoggedIn,
        isReadOnly: !canWrite,
        allowAnonReads: state.config.allowAnonReads,
        allowAnonWrites: state.config.allowAnonWrites,
      };
    }
  );

  handleGetRecipeTiddler = zodRoute(
    ["GET", "HEAD"],
    "/recipes/:recipe_name/tiddlers/:title",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    "ignore",
    z => z.undefined(),
    async (state) => {
      const { recipe_name, title } = state.pathParams;

      await state.assertRecipeACL(recipe_name, false);

      throw await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        const bag = await server.getRecipeBagWithTiddler({ recipe_name, title });
        return server.sendBagTiddler({ state, bag_id: bag?.bag_id, title });
      });

    }
  )

  handleGetBagTiddler = zodRoute(
    ["GET", "HEAD"],
    "/bags/:bag_name/tiddlers/:title",
    z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    "ignore",
    z => z.undefined(),
    async (state) => {

      await state.assertBagACL(state.pathParams.bag_name, false);

      throw await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        // return await server.getBagTiddler(state.pathParams);
        return server.sendBagTiddler({ state, ...state.pathParams });
      });

      // return this.sendTiddlerInfo(state, tiddlerInfo);

    });

  handleGetBagTiddlerBlob = zodRoute(
    ["GET", "HEAD"],
    "/bags/:bag_name/tiddlers/:title/blob",
    z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    "ignore",
    z => z.undefined(),
    async (state) => {
      const { bag_name, title } = state.pathParams;

      await state.assertBagACL(bag_name, false);

      const result = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.getBagTiddlerStream(title, bag_name);
      });

      if (!result) throw state.sendEmpty(404, { "x-reason": "no result" });

      throw state.sendStream(200, {
        Etag: state.makeTiddlerEtag(result),
        "Content-Type": result.type
      }, result.stream);
    });

  handleListRecipeTiddlers = zodRoute(
    ["GET", "HEAD"],
    "/recipes/:recipe_name/tiddlers.json",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    "ignore",
    z => z.undefined(),
    async (state) => {
      zodAssert.queryParams(state, z => ({
        include_deleted: z.string().array().optional(),
        last_known_revision_id: z.string().array().optional(),
      }));

      const { recipe_name } = state.pathParams;
      const include_deleted = state.queryParams.include_deleted?.[0] === "true";
      const last_known_revision_id = state.queryParams.last_known_revision_id?.[0];

      await state.assertRecipeACL(recipe_name, false);

      const result = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        const options = { include_deleted, last_known_revision_id };
        let result = await server.getRecipeTiddlers(recipe_name);
        return result
          .filter(tiddler => options.include_deleted || !tiddler.is_deleted)
          .filter(tiddler => !options.last_known_revision_id || 0 < tiddler.revision_id.localeCompare(options.last_known_revision_id));
      });
      return result;
    }
  )

  parseFields(input: string, ctype: string | undefined) {

    if (ctype?.startsWith("application/json"))
      return tryParseJSON<any>(input);

    if (ctype?.startsWith("application/x-mws-tiddler")) {
      //https://jsperf.app/mukuro
      // for a big text field (100k random characters)
      // splitting the string is 1000x faster!
      // but I don't really trust getFieldStringBlock 
      // because it doesn't check for fields with colon names

      const headerEnd = input.indexOf("\n\n");
      if (headerEnd === -1) return tryParseJSON<any>(input);
      const header = input.slice(0, headerEnd);
      const body = input.slice(headerEnd + 2);

      const fields = tryParseJSON<any>(header);
      if (!fields) return undefined;
      fields.text = body;
      return fields;
    }
  }

  handleSaveRecipeTiddler = zodRoute(
    ["PUT"],
    "/recipes/:recipe_name/tiddlers/:title",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    "string",
    z => z.string(),
    // z => z.object({
    //   title: z.prismaField("Tiddlers", "title", "string", false),
    // }).and(z.record(z.string())),
    async (state) => {

      const { recipe_name } = state.pathParams;

      await state.assertRecipeACL(recipe_name, true);

      const fields = this.parseFields(state.data, state.headers["content-type"]);

      if (fields === undefined) throw state.sendEmpty(400, { "x-reason": "PUT tiddler expects a valid json or x-mws-tiddler body" })

      const { bag_name, revision_id } = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.saveRecipeTiddler(fields, state.pathParams.recipe_name);
      });

      return { bag_name, revision_id };

    });


  handleDeleteRecipeTiddler = zodRoute(
    ["DELETE"],
    "/recipes/:recipe_name/tiddlers/:title",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }),
    "json",
    z => z.undefined(),
    async (state) => {

      const { recipe_name, title } = state.pathParams;
      if (!recipe_name || !title) throw state.sendEmpty(404, { "x-reason": "bag_name or title not found" });

      await state.assertRecipeACL(recipe_name, true);

      const { bag_name, revision_id } = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.deleteRecipeTiddler(recipe_name, title);
      });

      return { bag_name, revision_id };

    });

  // this is not used by the sync adaptor. I'm not sure what uses it.
  handleCreateRecipeTiddler = zodRoute(
    ["POST"],
    "/recipes/:recipe_name/tiddlers",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    "json",
    z => z.object({
      title: z.prismaField("Tiddlers", "title", "string", false),
    }).and(z.record(z.string())),
    async (state) => {

      await state.assertRecipeACL(state.pathParams.recipe_name, true);

      const recipe_name = state.pathParams.recipe_name;

      return await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        const { bag_name } = await server.getRecipeWritableBag(recipe_name) ?? {};
        if (!bag_name) throw state.sendEmpty(404, { "x-reason": "bag not found" });
        return { bag_name, results: await server.processIncomingStream(bag_name) };
      });

    });

  handleGetWikiIndex = zodRoute(
    ["GET", "HEAD"],
    "/wiki/:recipe_name",
    z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    "ignore",
    z => z.undefined(),
    async (state) => {
      await state.assertRecipeACL(state.pathParams.recipe_name, false);

      await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        await server.serveIndexFile(state.pathParams.recipe_name);
      });

      throw STREAM_ENDED;
    });

  private sendTiddlerInfo = async (
    state: StateObject,
    tiddlerInfo: Awaited<ReturnType<TiddlerServer["getBagTiddler"]>>
  ) => {

    zodAssert.queryParams(state, z => ({
      fallback: z.array(z.string()).optional()
    }));
    // fallbacks are kind of slow, I'm not sure if this is a good idea
    if (!tiddlerInfo || !tiddlerInfo.tiddler) {
      // Redirect to fallback URL if tiddler not found
      const fallback = state.queryParams.fallback?.[0];
      if (fallback) {
        // await state.pushStream(fallback);
        throw state.redirect(fallback);
      } else {
        throw state.sendEmpty(404, { "x-reason": "tiddler not found (no fallback)" });
      }
    }

    return tiddlerInfo;
  }


}
