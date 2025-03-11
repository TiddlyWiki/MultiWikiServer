import { StateObject } from "../StateObject";
import { adminWiki } from "../router";
import { TiddlerStore } from "./TiddlerStore";
import { resolve } from "path";
import { createWriteStream, readFileSync } from "fs";
import sjcl from "sjcl";
import { TiddlerFields } from "./services/attachments";
import { DataChecks } from "../data-checks";


export class TiddlerServer extends TiddlerStore {
  static defineRoutes(root: rootRoute, zodAssert: ZodAssert) {

    async function assertRecipeACL(state: StateObject, recipe_name: string, user_id: number | undefined, needWrite: boolean) {


      const [recipe, canRead, canWrite] = await state.$transactionTuple(prisma => [
        prisma.recipes.findUnique({
          select: { recipe_id: true },
          where: { recipe_name }
        }),
        prisma.recipes.findUnique({
          select: { recipe_id: true },
          where: {
            recipe_name,
            recipe_bags: {
              every: {
                bag: {
                  OR: new DataChecks(state.config).getBagWhereACL({ permission: "READ", user_id })
                }
              }
            }
          }
        }),
        needWrite ? prisma.recipes.findUnique({
          select: { recipe_id: true },
          where: {
            recipe_name,
            recipe_bags: {
              some: {
                position: 0, bag: {
                  OR: new DataChecks(state.config).getBagWhereACL({ permission: "WRITE", user_id })
                }
              }
            }
          }
        }) : prisma.$queryRaw`SELECT 1`,
      ]);

      if (!recipe) throw state.sendEmpty(404, { "x-reason": "recipe not found" });
      if (!canRead) throw state.sendEmpty(403, { "x-reason": "no read permission" });
      if (needWrite && !canWrite) throw state.sendEmpty(403, { "x-reason": "no write permission" });

    }

    root.defineRoute({
      method: ["GET"],
      path: /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/,
      pathParams: ["recipe_name", "title"],
      useACL: {},
    }, async state => {
      zodAssert.pathParams(state, z => ({
        recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
        title: z.prismaField("Tiddlers", "title", "string"),
      }));

      zodAssert.queryParams(state, z => ({
        fallback: z.array(z.string()).optional()
      }));

      const { recipe_name, title } = state.pathParams;

      await assertRecipeACL(state, recipe_name, state.user?.user_id, false);

      return await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        const bag = await server.getRecipeBagWithTiddler({ recipe_name, title });
        if (!bag) return state.sendEmpty(404, { "x-reason": "bag not found" });
        return await server.sendBagTiddler({ state, bag_id: bag.bag_id, title });
      });
    });

    root.defineRoute({
      method: ["GET"],
      path: /^\/recipes\/([^\/]+)\/tiddlers.json$/,
      pathParams: ["recipe_name"],
      useACL: {},
    }, async state => {

      zodAssert.pathParams(state, z => ({
        recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      }));
      zodAssert.queryParams(state, z => ({
        include_deleted: z.string().array().optional(),
        last_known_tiddler_id: z.string().array().optional(),
      }));
      const { recipe_name } = state.pathParams;
      const include_deleted = state.queryParams.include_deleted?.[0] === "true";
      const last_known_tiddler_id = +(state.queryParams.last_known_tiddler_id?.[0] ?? 0) || undefined;

      await assertRecipeACL(state, recipe_name, state.user?.user_id, false);

      const result = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.getRecipeTiddlers(recipe_name, {
          include_deleted,
          last_known_tiddler_id
        });

      });
      return state.sendJSON(200, result);
    });

    root.defineRoute({
      method: ["PUT"],
      path: /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/,
      pathParams: ["recipe_name", "title"],
      bodyFormat: "json",
      useACL: {},
    }, async state => {

      zodAssert.pathParams(state, z => ({
        recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
        title: z.prismaField("Tiddlers", "title", "string"),
      }));

      zodAssert.data(state, z => z.object({
        title: z.prismaField("Tiddlers", "title", "string", false),
      }).and(z.record(z.string())));

      const { recipe_name, title } = state.pathParams;

      await assertRecipeACL(state, recipe_name, state.user?.user_id, true);

      await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        await server.saveRecipeTiddler(state.data, state.pathParams.recipe_name);
      });

      return state.sendEmpty(204);

    })

    root.defineRoute({
      method: ["DELETE"],
      path: /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/,
      pathParams: ["bag_name", "title"],
      bodyFormat: "ignore",
      useACL: {},
    }, async state => {

      zodAssert.pathParams(state, z => ({
        bag_name: z.prismaField("Bags", "bag_name", "string"),
        title: z.prismaField("Tiddlers", "title", "string"),
      }));

      const { bag_name, title } = state.pathParams;
      if (!bag_name || !title) return state.sendEmpty(404, { "x-reason": "bag_name or title not found" });

      console.error("ACL not implemented");

      const result = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.deleteTiddler(title, bag_name);
      });

      console.log("delete result", result);

      return state.sendEmpty(204, {
        "X-Revision-Number": result.tiddler_id.toString(),
        Etag: state.makeTiddlerEtag(result),
        "Content-Type": "text/plain"
      });

    });

    root.defineRoute({
      method: ["GET"],
      path: /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/,
      pathParams: ["bag_name", "title"],
      useACL: {},
    }, async state => {
      zodAssert.pathParams(state, z => ({
        bag_name: z.prismaField("Bags", "bag_name", "string"),
        title: z.prismaField("Tiddlers", "title", "string"),
      }));

      console.error("ACL not implemented");

      return await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return server.sendBagTiddler({
          state,
          bag_name: state.pathParams.bag_name,
          title: state.pathParams.title
        });
      });
    });

    root.defineRoute({
      method: ["POST"],
      path: /^\/bags\/([^\/]+)\/tiddlers\/$/,
      pathParams: ["bag_name"],
      bodyFormat: "stream",
      useACL: { csrfDisable: true },
    }, async state => {
      zodAssert.pathParams(state, z => ({
        bag_name: z.prismaField("Bags", "bag_name", "string"),
      }));

      console.error("ACL not implemented");

      // Get the parameters
      const bag_name = state.pathParams.bag_name;

      const results = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.processIncomingStream(bag_name);
      });

      // we aren't rendering html anymore, so just return json
      return state.sendJSON(200, { bag_name, results });

    });

    root.defineRoute({
      method: ["GET"],
      path: /^\/bags\/([^\/]+)\/tiddlers\/([^\/]+)\/blob$/,
      pathParams: ["bag_name", "title"],
      useACL: {},
    }, async state => {
      zodAssert.pathParams(state, z => ({
        bag_name: z.prismaField("Bags", "bag_name", "string"),
        title: z.prismaField("Tiddlers", "title", "string"),
      }));

      const { bag_name, title } = state.pathParams;

      console.error("ACL not implemented");

      const result = await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.getBagTiddlerStream(title, bag_name);
      });

      if (!result) return state.sendEmpty(404, { "x-reason": "no result" });

      return state.sendStream(200, {
        Etag: state.makeTiddlerEtag(result),
        "Content-Type": result.type
      }, result.stream);

    });


    const SYSTEM_FILE_TITLE_PREFIX = "$:/plugins/tiddlywiki/multiwikiserver/system-files/";
    // the system wiki will hopefully be replaced by a bag in the database
    root.defineRoute({
      method: ["GET"],
      path: /^\/\.system\/(.+)$/,
      pathParams: ["filename"],
      useACL: {},
    }, async state => {
      zodAssert.pathParams(state, z => ({
        filename: z.prismaField("Tiddlers", "title", "string"),
      }));
      // Get the  parameters
      const filename = state.pathParams.filename,
        title = SYSTEM_FILE_TITLE_PREFIX + filename,
        tiddler = adminWiki().getTiddler(title),
        isSystemFile = tiddler && tiddler.hasTag("$:/tags/MWS/SystemFile"),
        isSystemFileWikified = tiddler && tiddler.hasTag("$:/tags/MWS/SystemFileWikified");

      if (tiddler && (isSystemFile || isSystemFileWikified)) {
        let text = tiddler.fields.text || "";
        const sysFileType = tiddler.fields["system-file-type"];
        const type = typeof sysFileType === "string" && sysFileType || tiddler.fields.type || "text/plain",
          encoding = (state.config.contentTypeInfo[type] || { encoding: "utf8" }).encoding;
        if (isSystemFileWikified) {
          text = adminWiki().renderTiddler("text/plain", title);
        }
        return state.sendString(200, {
          "content-type": type
        }, text, encoding);
      } else {
        return state.sendEmpty(404);
      }
    });

    root.defineRoute({
      method: ["GET"],
      path: /^\/wiki\/([^\/]+)$/,
      pathParams: ["recipe_name"],
      useACL: {},
    }, async state => {
      zodAssert.pathParams(state, z => ({
        recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      }));

      await assertRecipeACL(state, state.pathParams.recipe_name, state.user?.user_id, false);

      return await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.serveIndexFile(state.pathParams.recipe_name);
      });

    })
  }

  constructor(
    protected state: StateObject,
    prisma: PrismaTxnClient
  ) {
    super(state.config, prisma);
  }

  async serveAllTiddlers(
    recipe_name: string,
    include_deleted: boolean,
    last_known_tiddler_id: number | null
  ) {
    console.error("Not implemented");

    // Get the tiddlers in the recipe, optionally since the specified last known tiddler_id
    // const store: SqlTiddlerDatabase;
    // const params = {
    //   $recipe_id: recipe_id
    // }
    // if (options.limit) {
    //   params.$limit = options.limit.toString();
    // }
    // if (options.last_known_tiddler_id) {
    //   params.$last_known_tiddler_id = options.last_known_tiddler_id;
    // }
    // const rows = this.engine.runStatementGetAll(`
    //   SELECT title, tiddler_id, is_deleted, bag_name
    //   FROM (
    //     SELECT t.title, t.tiddler_id, t.is_deleted, b.bag_name, MAX(rb.position) AS position
    //     FROM bags AS b
    //     INNER JOIN recipe_bags AS rb ON b.bag_id = rb.bag_id
    //     INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
    //     WHERE rb.recipe_id = $recipe_id
    //     ${options.include_deleted ? "" : "AND t.is_deleted = FALSE"}
    //     ${options.last_known_tiddler_id ? "AND tiddler_id > $last_known_tiddler_id" : ""}
    //     GROUP BY t.title
    //     ORDER BY t.title, tiddler_id DESC
    //     ${options.limit ? "LIMIT $limit" : ""}
    //   )
    // `, params);
    // if (rows.length) {
    //   state.sendResponse(200, { "Content-Type": "application/json" }, JSON.stringify(recipeTiddlers), "utf8");
    //   return;
    // }

    // const tiddlers = await this.prisma.tiddlers.findMany({
    //   where: { bag: { recipe_bags: { some: { recipe: { recipe_name } } } } },
    //   select: { title: true, tiddler_id: true, is_deleted: true, bag_id: true, },
    //   orderBy: { title: "asc", tiddler_id: "desc" }
    // });

    const recipe = await this.prisma.recipes.findUnique({
      where: { recipe_name },
      include: { recipe_bags: { select: { bag_id: true, position: true, bag: true } } }
    });

    if (!recipe) return this.state.sendEmpty(404);

    const bags = new Map(recipe.recipe_bags.map(bag => [bag.bag_id, bag]));

    const tiddlers = await this.prisma.tiddlers.findMany({
      where: { bag_id: { in: recipe.recipe_bags.map(bag => bag.bag_id) } },
      include: { bag: true }
    });

    const recipeTiddlers = new Map<PrismaField<"Tiddlers", "title">, typeof tiddlers[number]>();

    tiddlers.forEach(tiddler => {
      const current = recipeTiddlers.get(tiddler.title);
      if (!current || bags.get(tiddler.bag_id)!.position < bags.get(current.bag_id)!.position)
        recipeTiddlers.set(tiddler.title, tiddler);
    });

    const result = Array.from(recipeTiddlers.values())
      .map(tiddler => ({
        title: tiddler.title,
        tiddler_id: tiddler.tiddler_id,
        is_deleted: tiddler.is_deleted,
        bag_name: tiddler.bag.bag_name,
        // fields: tiddler.fields
      }))
      .filter(e => include_deleted || !e.is_deleted)
      .filter(e => !last_known_tiddler_id || e.tiddler_id > last_known_tiddler_id);

    return this.state.sendJSON(200, result);

  }


  async sendBagTiddler({ state, bag_name, bag_id, title }: {
    state: StateObject;
    bag_name?: PrismaField<"Bags", "bag_name">;
    bag_id?: PrismaField<"Bags", "bag_id">;
    title: PrismaField<"Tiddlers", "title">;
  }) {

    ok(bag_name || bag_id, 'bag_name or bag_id must be provided');

    const tiddlerInfo = await this.getBagTiddler({ bag_name, bag_id, title });

    if (!tiddlerInfo || !tiddlerInfo.tiddler) {
      // Redirect to fallback URL if tiddler not found
      const fallback = state.queryParams.fallback?.[0];
      if (fallback) {
        return state.redirect(fallback);
      } else {
        return state.sendEmpty(404, { "x-reason": "tiddler not found (no fallback)" });
      }
    }


    // If application/json is requested then this is an API request, and gets the response in JSON
    if (state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {

      return state.sendResponse(200, {
        "Etag": state.makeTiddlerEtag(tiddlerInfo),
        "Content-Type": "application/json",
        "X-Revision-Number": tiddlerInfo.tiddler_id,
        "X-Bag-Name": tiddlerInfo.bag_name,
      }, JSON.stringify(tiddlerInfo.tiddler), "utf8");

    } else {

      // This is not a JSON API request, we should return the raw tiddler content
      const result = await this.getBagTiddlerStream(title, tiddlerInfo.bag_name);
      if (!result || !result.stream) return state.sendEmpty(404);

      return state.sendStream(200, {
        "Etag": state.makeTiddlerEtag(result),
        "Content-Type": result.type
      }, result.stream);

    }

  }


  /**
   * Process an incoming new multipart/form-data stream. Options include:
   *
   * @param {Object} options
   * @param {SqlTiddlerStore} options.store
   * @param {ServerState} options.state
   * @param {ServerResponse} options.response
   * @param {string} options.bag_name
   * @param {function} options.callback
   */
  async processIncomingStream(
    bag_name: PrismaField<"Bags", "bag_name">
  ): Promise<string[]> {

    // Process the incoming data
    const inboxName = new Date().toISOString().replace(/:/g, "-");
    const inboxPath = resolve(this.storePath, "inbox", inboxName);
    createDirectory(inboxPath);
    let fileStream: { write: (arg0: any) => void; end: () => void; } | null = null; // Current file being written
    let hash: { update: (arg0: any) => void; finalize: () => any; } | null = null; // Accumulating hash of current part
    let length = 0; // Accumulating length of current part
    const parts: any[] = []; // Array of {name:, headers:, value:, hash:} and/or {name:, filename:, headers:, inboxFilename:, hash:} 

    await this.state.readMultipartData({
      cbPartStart: function (headers, name, filename) {
        const part: any = {
          name: name,
          filename: filename,
          headers: headers
        };
        if (filename) {
          const inboxFilename = (parts.length).toString();
          part.inboxFilename = resolve(inboxPath, inboxFilename);
          fileStream = createWriteStream(part.inboxFilename);
        } else {
          part.value = "";
        }
        hash = new sjcl.hash.sha256();
        length = 0;
        parts.push(part);
      },
      cbPartChunk: function (chunk) {
        if (fileStream) {
          fileStream.write(chunk);
        } else {
          parts[parts.length - 1].value += chunk;
        }
        length = length + chunk.length;
        hash!.update(chunk);
      },
      cbPartEnd: function () {
        if (fileStream) {
          fileStream.end();
        }
        fileStream = null;
        parts[parts.length - 1].hash = sjcl.codec.hex.fromBits(hash!.finalize()).slice(0, 64).toString();
        hash = null;
      },
      // if an error is given here, it will also be thrown in the promise
      cbFinished: (err) => { }
    });

    const partFile = parts.find(part => part.name === "file-to-upload" && !!part.filename);
    if (!partFile) {
      throw await this.state.sendResponse(400, { "Content-Type": "text/plain" }, "Missing file to upload");
    }

    const type = partFile.headers["content-type"];
    const tiddlerFields = { title: partFile.filename, type };

    for (const part of parts) {
      const tiddlerFieldPrefix = "tiddler-field-";
      if (part.name.startsWith(tiddlerFieldPrefix)) {
        (tiddlerFields as any)[part.name.slice(tiddlerFieldPrefix.length)] = part.value.trim();
      }
    }

    await this.saveBagTiddlerWithAttachment(tiddlerFields, bag_name, {
      filepath: partFile.inboxFilename,
      type: type,
      hash: partFile.hash
    } as any).then(() => {
      deleteDirectory(inboxPath);
      return [tiddlerFields.title];
    }, err => {
      throw err;
    });

    return parts;
  }

  async getRecipeTiddlers(recipe_name: PrismaField<"Recipes", "recipe_name">, options: { include_deleted?: boolean, last_known_tiddler_id?: number } = {}) {
    // Get the recipe name from the parameters
    const bagTiddlers = recipe_name && await this.getRecipeTiddlersByBag(recipe_name);
    bagTiddlers.forEach(tiddler => { console.log(tiddler.tiddlers); });

    bagTiddlers.sort((a, b) => a.position - b.position).reverse();

    const recipeTiddlers = Array.from(new Map(bagTiddlers.flatMap(bag =>
      bag.tiddlers.map(tiddler => [tiddler.title, {
        title: tiddler.title,
        tiddler_id: tiddler.tiddler_id,
        is_deleted: tiddler.is_deleted,
        bag_name: bag.bag_name
      }])
    )).values());

    return recipeTiddlers;

  }
  async serveIndexFile(recipe_name: PrismaField<"Recipes", "recipe_name">) {
    const state = this.state;

    console.log(await this.prisma.tiddlers.findMany({}));
    const recipeTiddlers = await this.getRecipeTiddlers(recipe_name);

    recipeTiddlers.forEach(tiddler => {
      console.log(tiddler.title, tiddler.is_deleted);
    });

    // Check request is valid
    if (!recipe_name || !recipeTiddlers) {
      return state.sendEmpty(404);
    }

    state.writeHead(200, {
      "Content-Type": "text/html"
    });
    // Get the tiddlers in the recipe
    // Render the template
    const template = readFileSync("tiddlywiki5.html", "utf8");
    // Splice in our tiddlers
    var marker = `<` + `script class="tiddlywiki-tiddler-store" type="application/json">[`,
      markerPos = template.indexOf(marker);
    if (markerPos === -1) {
      throw new Error("Cannot find tiddler store in template");
    }
    /**
     * 
     * @param {Record<string, string>} tiddlerFields 
     */
    function writeTiddler(tiddlerFields: Record<string, string>) {
      state.write(JSON.stringify(tiddlerFields).replace(/</g, "\\u003c"));
      state.write(",\n");
    }
    state.write(template.substring(0, markerPos + marker.length));
    const
      bagInfo: Record<string, string> = {},
      revisionInfo: Record<string, string> = {};

    for (const recipeTiddlerInfo of recipeTiddlers) {
      var result = await this.getRecipeTiddler(recipeTiddlerInfo.title, recipe_name);
      if (result) {
        bagInfo[result.tiddler.title] = result.bag_name;
        revisionInfo[result.tiddler.title] = result.tiddler_id.toString();
        writeTiddler(result.tiddler);
      }
    }

    writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/bag",
      text: JSON.stringify(bagInfo),
      type: "application/json"
    });
    writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/revision",
      text: JSON.stringify(revisionInfo),
      type: "application/json"
    });
    writeTiddler({
      title: "$:/config/multiwikiclient/recipe",
      text: recipe_name
    });
    const lastTiddlerId = await this.prisma.tiddlers.aggregate({
      where: { bag: { recipe_bags: { some: { recipe: { recipe_name } } } } },
      _max: { tiddler_id: true }
    });
    writeTiddler({
      title: "$:/state/multiwikiclient/recipe/last_tiddler_id",
      text: (lastTiddlerId._max.tiddler_id ?? 0).toString()
    });
    state.write(template.substring(markerPos + marker.length))
    // Finish response
    return state.end();
  }

}
