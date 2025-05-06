import { StateObject } from "../StateObject";
import { TiddlerStore } from "./TiddlerStore";
import { resolve } from "path";
import { createWriteStream, readFileSync } from "fs";
import sjcl from "sjcl";
import { createHash } from "crypto";
import { AttachmentService, TiddlerFields } from "../services/attachments";
import { UserError } from "../utils";


export class TiddlerServer extends TiddlerStore {

  constructor(
    protected state: StateObject,
    prisma: PrismaTxnClient
  ) {
    const router = state.router;
    super(
      router.fieldModules,
      new AttachmentService(router.siteConfig, prisma),
      router.siteConfig,
      prisma
    );
  }

  private toTiddlyWebJson(info: { bag_name: string; tiddler_id: number; tiddler: TiddlerFields }) {
    const output: any = { fields: {} };
    const knownFields = [
      "bag", "created", "creator", "modified", "modifier", "permissions", "recipe", "revision", "tags", "text", "title", "type", "uri"
    ];

    each(info.tiddler, (field, name) => {
      if (knownFields.indexOf(name) !== -1) {
        output[name] = field;
      } else {
        output.fields[name] = field;
      }
    });
    output.type = info.tiddler.type || "text/vnd.tiddlywiki";

    output.revision = `${info.tiddler_id}`;
    output.bag = info.bag_name;
    return output;
  }

  /** If neither bag_name nor bag_id are specified, the fallback will be sent. */
  async sendBagTiddler({ state, bag_name, bag_id, title }: {
    state: StateObject;
    bag_name?: PrismaField<"Bags", "bag_name">;
    bag_id?: PrismaField<"Bags", "bag_id">;
    title: PrismaField<"Tiddlers", "title">;
  }) {

    const tiddlerInfo = (bag_id || bag_name) && await this.getBagTiddler({ bag_name, bag_id, title });

    if (!tiddlerInfo || !tiddlerInfo.tiddler) {
      // Redirect to fallback URL if tiddler not found
      const fallback = state.queryParams.fallback?.[0];
      if (fallback) {
        // await state.pushStream(fallback);
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
      throw await this.state.sendSimple(400, "Missing file to upload");
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

  async getRecipeTiddlers(recipe_name: PrismaField<"Recipes", "recipe_name">) {
    // Get the recipe name from the parameters
    const bagTiddlers = await this.getRecipeTiddlersByBag(recipe_name);

    bagTiddlers.sort((a, b) => a.position - b.position);

    return Array.from(new Map(bagTiddlers.flatMap(bag =>
      bag.tiddlers.map(tiddler => [tiddler.title, {
        title: tiddler.title,
        tiddler_id: tiddler.tiddler_id,
        is_deleted: tiddler.is_deleted,
        is_plugin: false,
        bag_name: bag.bag_name,
        bag_id: bag.bag_id
      }])
    )).values());

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

  }
  async serveIndexFile(recipe_name: PrismaField<"Recipes", "recipe_name">) {
    const state = this.state;

    // Check request is valid
    if (!recipe_name) {
      return state.sendEmpty(404);
    }

    // const bagTiddlers = await this.getRecipeTiddlersByBag(recipe_name);
    const bagTiddlers = await this.prisma.recipe_bags.findMany({
      where: { recipe: { recipe_name } },
      select: {
        position: true,
        bag: {
          select: {
            bag_id: true,
            bag_name: true,
            is_plugin: true,
            tiddlers: {
              select: {
                title: true,
                tiddler_id: true,
                is_deleted: true,
                attachment_hash: true,
                fields: true,
              },
              where: {
                is_deleted: false,
              },
            }
          }
        }
      },
    });

    bagTiddlers.sort((a, b) => a.position - b.position);

    // const recipeTiddlers = await this.getRecipeTiddlers(recipe_name);
    const recipeTiddlers = Array.from(new Map(bagTiddlers.flatMap(bag =>
      bag.bag.tiddlers.map(tiddler => [tiddler.title, { bag: bag.bag, tiddler }])
    )).values());

    const template = readFileSync(resolve(this.state.config.wikiPath, "tiddlywiki5.html"), "utf8");
    const hash = createHash('md5');
    // Put everything into the hash that could change and invalidate the data that
    // the browser already stored. The headers the data and the encoding.
    hash.update(template);
    hash.update(recipeTiddlers.map(e => e.tiddler.tiddler_id).join("|"));
    const contentDigest = hash.digest("hex");


    state.writeHead(200, {
      "Content-Type": "text/html",
      "Etag": '"' + contentDigest + '"',
      "Cache-Control": "max-age=0, must-revalidate",
    });

    if (state.method === "HEAD") return state.end();
    // Get the tiddlers in the recipe
    // Render the template

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
      // var result = await this.getRecipeTiddler(recipeTiddlerInfo.title, recipe_name);
      // const { title, bag_id, tiddler_id } = recipeTiddlerInfo;
      // var result = await this.getBagTiddler({ title, bag_id });

      const { title, tiddler_id, attachment_hash, fields } = recipeTiddlerInfo.tiddler;
      const { bag_name } = recipeTiddlerInfo.bag;

      const tiddler = Object.fromEntries([
        ...fields.map(e => [e.field_name, e.field_value] as const),
        ["title", title]
      ]) as TiddlerFields;

      const tiddler2 = this.attachService.processOutgoingTiddler({
        tiddler, tiddler_id, attachment_hash, bag_name
      });

      bagInfo[title] = bag_name;
      revisionInfo[title] = tiddler_id.toString();
      writeTiddler(tiddler2);
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
    // get the latest tiddler id in the database. It doesn't have to be filtered.
    const lastTiddlerId = await this.prisma.tiddlers.aggregate({ _max: { tiddler_id: true } });
    writeTiddler({
      title: "$:/state/multiwikiclient/recipe/last_tiddler_id",
      text: (lastTiddlerId._max.tiddler_id ?? 0).toString()
    });

    // the text field could be an empty string also, 
    // but this helps with integrity
    writeTiddler({
      title: "$:/config/multiwikiclient/host",
      text: "$protocol$//$host$" + this.state.pathPrefix + "/",
    });

    state.write(template.substring(markerPos + marker.length))
    // Finish response
    return state.end();
  }

}
