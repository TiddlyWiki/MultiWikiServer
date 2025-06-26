

import { TiddlerFields } from "tiddlywiki";
import { createWriteStream, mkdirSync, rmSync } from "fs";
import { resolve } from "path";
import { createHash, Hash } from "crypto";
import { readFile } from "fs/promises";
import { Writable } from "stream";
import { IncomingHttpHeaders } from "http";
import { WikiStateStore } from "./WikiStateStore";
import Debug from "debug";
import { BodyFormat, checkPath, JsonValue, registerZodRoutes, RouterKeyMap, RouterRouteMap, ServerRoute, tryParseJSON, UserError, Z2, zod, ZodRoute, zodRoute, ZodState } from "@tiddlywiki/server";
import { serverEvents, ServerEventsMap } from "@tiddlywiki/events";
const debugCORS = Debug("mws:cors");
const debugSSE = Debug("mws:sse");

export const WikiRouterKeyMap: RouterKeyMap<WikiRoutes, true> = {
  // recipe status updates
  handleGetRecipeStatus: true,
  handleGetRecipeEvents: true,
  handleGetBags: true,
  handleGetBagState: true,
  handleGetAllBagStates: true,
  // individual tiddlers
  handleLoadRecipeTiddler: true,
  handleSaveRecipeTiddler: true,
  handleDeleteRecipeTiddler: true,
  // external tools
  handleDeleteBagTiddler: true,
  handleFormMultipartBagTiddler: true,
  handleFormMultipartRecipeTiddler: true,
  handleLoadBagTiddler: true,
  handleSaveBagTiddler: true,
}

export type TiddlerManagerMap = RouterRouteMap<WikiRoutes>;

export interface WikiRoute<
  M extends string,
  B extends BodyFormat,
  P extends Record<string, zod.ZodType<any, string | undefined>>,
  Q extends Record<string, zod.ZodType<any, string[] | undefined>>,
  T extends zod.ZodTypeAny,
  R extends JsonValue
> extends ZodRoute<M, B, P, Q, T, R> {
  routeType: "wiki" | "recipe" | "bag";
  routeName: string;
}

declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.tiddler.save": [{
      recipe_name?: string;
      bag_name: string;
      title: string;
      revision_id: string;
    }];
    "mws.tiddler.delete": [{
      recipe_name?: string;
      bag_name: string;
      title: string;
      revision_id: string;
    }];
  }
}
declare module "@tiddlywiki/server" {
  interface IncomingHttpHeaders {
    'last-event-id'?: string;
  }
}

serverEvents.on("mws.routes.fallback", (root, config) => {
  WikiRoutes.defineRoutes(root);
})

const BAG_PREFIX = "/bag";
const RECIPE_PREFIX = "/recipe";
const WIKI_PREFIX = "/wiki";

export class WikiRoutes {
  static defineRoutes = (root: ServerRoute) => {
    const router = new WikiRoutes();
    const keys = Object.keys(WikiRouterKeyMap);
    const parent = root.defineRoute({
      method: [],
      denyFinal: true,
      path: new RegExp(`^(?=${BAG_PREFIX}|${RECIPE_PREFIX})(?=/)`),
    }, async state => {

    })
    registerZodRoutes(parent, router, keys);

    // the wiki index route
    root.defineRoute({
      method: ["GET", "HEAD"],
      path: /^\/wiki\/(.*)$/,
      pathParams: ["recipe_name"],
      bodyFormat: "ignore",
    }, async (state) => {
      const timekey = `handler ${state.bodyFormat} ${state.method} ${state.urlInfo.pathname}`;
      if (Debug.enabled("server:handler:timing")) console.time(timekey);

      if (!state.pathParams.recipe_name)
        throw state.sendEmpty(404, { "x-reason": "recipe name not found" });

      checkPath(state, z => ({
        recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      }));

      await state.assertRecipeAccess(state.pathParams.recipe_name, false);

      await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        await server.serveIndexFile(state.pathParams.recipe_name);
      });

      if (Debug.enabled("server:handler:timing")) console.timeEnd(timekey);

      throw STREAM_ENDED;
    });
  }



  // lets start with the scenarios from the sync adapter
  // 1. Status - The wiki status that gets sent to the TW5 client
  // 2. tiddlers.json - gets a skinny list of the recipe bag state.
  // 3. Save Tiddler - create or update a tiddler
  // 4. Load Tiddler - load the data for a tiddler
  // 5. Delete Tiddler - delete a tiddler
  // 6. Wiki Index - the wiki client itself, with all the config 
  //    from the recipe, and the initial tiddler state

  handleGetRecipeStatus = zodRoute({
    method: ["GET", "HEAD"],
    path: RECIPE_PREFIX + "/:recipe_name/status",
    bodyFormat: "ignore",
    zodPathParams: z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    }),
    inner: async (state) => {

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

      debugSSE("connection opened", recipe_name);
      const events = state.sendSSE();
      serverEvents.on("mws.tiddler.delete", onDelete);
      serverEvents.on("mws.tiddler.save", onSave);
      events.onClose(() => {
        debugSSE("connection closed", recipe_name);
        serverEvents.off("mws.tiddler.delete", onDelete);
        serverEvents.off("mws.tiddler.save", onSave);
      });

      const lastEventID = state.headers['last-event-id'] || state.queryParams["first-event-id"]?.[0];

      if (lastEventID) {
        const updates = await state.engine.recipe_bags.findMany({
          where: { recipe: { recipe_name } },
          orderBy: { position: "asc" },
          select: {
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
                    is_deleted: true,
                    revision_id: lastEventID ? { gt: lastEventID } : undefined,
                  },
                }
              }
            }
          }
        });
        let newlastevent = "";
        updates.forEach(({ bag }) => {
          bag.tiddlers.forEach(tiddler => {
            if (newlastevent < tiddler.revision_id) newlastevent = tiddler.revision_id;
          })
        });
        // if there were no updates, just use the same last event id
        events.emitEvent("tiddler.since-last-event", updates, newlastevent || lastEventID);
      }


      throw STREAM_ENDED;

      // catch errors here otherwise they would cause the initiating request to 
      // possibly return a 500 response. Since the event happens after the 
      // transaction closes, it wouldn't roll it back.

      // the only way to optimize this would be if the mws event included the 
      // entire recipe_bags table, so we could check if the bag is in our recipe

      // it's worse because we're using recipe and bag names instead of ids
      // we also aren't checking permissions every time we emit an event

      // TODO: there are probably things we could improve.

      async function onSave(data: ServerEventsMap["mws.tiddler.save"][0]) {
        try {
          const hasBag = !!await state.engine.recipe_bags.count({
            where: {
              recipe: { recipe_name },
              bag: { bag_name: data.bag_name },
            },
          });
          if (hasBag) {
            debugSSE("tiddler.save", recipe_name);
            events.emitEvent("tiddler.save", data, data.revision_id);
          }
        } catch (e) {
          console.error("Error in onSave for recipe events", e);
        }
      }

      async function onDelete(data: ServerEventsMap["mws.tiddler.delete"][0]) {
        try {
          const hasBag = !!await state.engine.recipe_bags.count({
            where: {
              recipe: { recipe_name },
              bag: { bag_name: data.bag_name },
            },
          });
          if (hasBag) {
            debugSSE("tiddler.delete", data);
            events.emitEvent("tiddler.delete", data, data.revision_id);
          }
        } catch (e) {
          console.error("Error in onDelete for recipe events", e);
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
      const match = state.headers["if-none-match"] === newEtag;
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
      const match = state.headers["if-none-match"] === newEtag;
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

      state.write("[");
      for (let i = 0; i < result.length; i++) {
        await state.write((i > 0 ? "," : "") + JSON.stringify(result[i]));
        if (gzip_stream) await state.splitCompressionStream();
      }
      state.write("]");
      throw state.end();

      // this still sets the return type of the function
      return result;

    }
  })


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

      await state.assertRecipeAccess(recipe_name, true);

      const fields = parseTiddlerFields(state.data, state.headers["content-type"]);

      if (fields === undefined)
        throw state.sendEmpty(400, {
          "x-reason": "PUT tiddler expects a valid json or x-mws-tiddler body"
        });

      const { bag_name, revision_id } = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const bag = await server.getRecipeWritableBag(recipe_name);
        const { revision_id } = await server.saveBagTiddlerFields(fields, bag.bag_name, null);
        return { revision_id, bag_name: bag.bag_name };
      });

      await serverEvents.emitAsync("mws.tiddler.save", {
        recipe_name,
        bag_name,
        title: fields.title,
        revision_id,
      });

      return { bag_name, revision_id };

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

      await state.assertRecipeAccess(recipe_name, true);

      const { bag_name, revision_id } = await state.$transaction(async (prisma) => {

        const server = new WikiStateStore(state, prisma);

        const bag = await server.getRecipeWritableBag(recipe_name, title);

        if (!bag.tiddlers.length) throw new UserError("The writable bag does not contain this tiddler.");

        const { revision_id } = await server.deleteBagTiddler(bag.bag_name, title);

        return { revision_id, bag_name: bag.bag_name };

      });

      await serverEvents.emitAsync("mws.tiddler.delete", {
        recipe_name,
        bag_name,
        title,
        revision_id,
      });

      return { bag_name, revision_id };

    }
  });

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

      await state.assertRecipeAccess(state.pathParams.recipe_name, true);

      const recipe_name = state.pathParams.recipe_name;

      const tiddlerFields = await recieveTiddlerMultipartUpload(state);

      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        const { bag_name } = await server.getRecipeWritableBag(recipe_name) ?? {};
        if (!bag_name) throw state.sendEmpty(404, { "x-reason": "bag not found" });
        const { revision_id } = await server.saveBagTiddlerFields(tiddlerFields, bag_name, null);
        return { bag_name, results: { revision_id, bag_name } };
      });

      await serverEvents.emitAsync("mws.tiddler.save", {
        recipe_name,
        bag_name: res.results.bag_name,
        title: tiddlerFields.title,
        revision_id: res.results.revision_id,
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
      await state.assertBagAccess(bag_name, true);
      const fields = parseTiddlerFields(state.data, state.headers["content-type"]);
      if (fields === undefined)
        throw state.sendEmpty(400, {
          "x-reason": "PUT tiddler expects a valid json or x-mws-tiddler body"
        });
      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return server.saveBagTiddlerFields(fields, bag_name, null);
      });

      await serverEvents.emitAsync("mws.tiddler.save", {
        bag_name,
        title: fields.title,
        revision_id: res.revision_id,
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
      await state.assertBagAccess(bag_name, true);
      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return server.deleteBagTiddler(bag_name, title);
      });
      await serverEvents.emitAsync("mws.tiddler.delete", {
        bag_name,
        title,
        revision_id: res.revision_id,
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
      await state.assertBagAccess(bag_name, true);
      const tiddlerFields = await recieveTiddlerMultipartUpload(state);
      const res = await state.$transaction(async (prisma) => {
        const server = new WikiStateStore(state, prisma);
        return await server.saveBagTiddlerFields(tiddlerFields, bag_name, null);
      });
      await serverEvents.emitAsync("mws.tiddler.save", {
        bag_name,
        title: tiddlerFields.title,
        revision_id: res.revision_id,
      });
      return res;
    }
  });

}


function parseTiddlerFields(input: string, ctype: string | undefined) {

  if (ctype?.startsWith("application/json"))
    return tryParseJSON<any>(input);

  if (ctype?.startsWith("application/x-mws-tiddler")) {
    //https://jsperf.app/mukuro
    // for a big text field (100k random characters)
    // splitting the string is 1000x faster!
    // but I don't really trust getFieldStringBlock 
    // because it doesn't check for fields with colon names
    // in fact, the behavior of the file system adapter when it 
    // encounters invalid field names is just to use JSON anyway.

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


async function recieveTiddlerMultipartUpload(state: ZodState<"POST", "stream", any, any, zod.ZodTypeAny>) {

  interface UploadPart {
    name: string | null;
    headers: IncomingHttpHeaders;
    hash: string;
    length: number;
    filename: string | null;
    value?: string;
    inboxFilename?: string;
  }
  // Process the incoming data
  const inboxName = new Date().toISOString().replace(/:/g, "-");
  const inboxPath = resolve(state.config.storePath, "inbox", inboxName);
  mkdirSync(inboxPath, { recursive: true });

  /** Current file being written */
  let fileStream: Writable | null = null;
  /** Accumulating hash of current part */
  let hasher: Hash | null = null;
  /** Accumulating length of current part */
  let length = 0;
  // Array of {name:, headers:, value:, hash:} and/or {name:, filename:, headers:, inboxFilename:, hash:} 
  const parts: UploadPart[] = [];

  await state.readMultipartData({
    cbPartStart: function (headers, name, filename) {
      const part: UploadPart = {
        name: name,
        filename: filename,
        headers: headers,
        hash: "",
        length: 0,
      };
      if (filename) {
        const inboxFilename = (parts.length).toString();
        part.inboxFilename = resolve(inboxPath, inboxFilename);
        fileStream = createWriteStream(part.inboxFilename);
      } else {
        part.value = "";
      }
      // hash = new sjcl.hash.sha256();
      hasher = createHash("sha-256");
      length = 0;
      parts.push(part);
    },
    cbPartChunk: function (chunk) {
      if (fileStream) {
        fileStream.write(chunk);
      } else {
        parts[parts.length - 1]!.value! += chunk;
      }
      length += chunk.length;
      hasher!.update(chunk);
    },
    cbPartEnd: function () {
      if (fileStream) fileStream.end();
      fileStream = null;
      parts[parts.length - 1]!.hash = hasher!.digest("base64url");
      parts[parts.length - 1]!.length = length;
      hasher = null;
    },
  });

  const partFile = parts.find(part => part.name === "file-to-upload" && !!part.filename);

  if (!partFile) throw state.sendSimple(400, "Missing file to upload");

  const missingfilename = "File uploaded " + new Date().toISOString()

  const type = partFile.headers["content-type"];
  const tiddlerFields: TiddlerFields = { title: partFile.filename ?? missingfilename, type, };

  for (const part of parts) {
    const tiddlerFieldPrefix = "tiddler-field-";
    if (part.name?.startsWith(tiddlerFieldPrefix)) {
      (tiddlerFields as any)[part.name.slice(tiddlerFieldPrefix.length)] = part.value?.trim();
    }
  }

  const contentTypeInfo = state.config.getContentType(type);

  const file = await readFile(partFile.inboxFilename!);

  tiddlerFields.text = file.toString(contentTypeInfo.encoding as BufferEncoding);

  rmSync(inboxPath, { recursive: true, force: true });

  return tiddlerFields;
}