import { Readable } from "stream";
import { StateObject } from "../StateObject";
import { TiddlerFields } from "../store/new-sql-tiddler-database";
import { DataChecks } from "../store/data-checks";


export class TiddlerServer {
  static defineRoutes(root: rootRoute, zodAssert: ZodAssert) {

    root.defineRoute({
      method: ["GET"],
      path: /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/,
      pathParams: ["bag_name", "title"],
      useACL: {},
    }, async state => {
      return await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.serveBagTiddler(state, zodAssert);
      });
    });

    root.defineRoute({
      method: ["GET"],
      path: /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/,
      pathParams: ["recipe_name", "title"],
      useACL: {},
    }, async state => {
      return await state.$transaction(async prisma => {
        const server = new TiddlerServer(state, prisma);
        return await server.serveRecipeTiddler(state, zodAssert);
      });
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
        tiddler = state.store.adminWiki.getTiddler(title),
        isSystemFile = tiddler && tiddler.hasTag("$:/tags/MWS/SystemFile"),
        isSystemFileWikified = tiddler && tiddler.hasTag("$:/tags/MWS/SystemFileWikified");

      if (tiddler && (isSystemFile || isSystemFileWikified)) {
        let text = tiddler.fields.text || "";
        const sysFileType = tiddler.fields["system-file-type"];
        const type = typeof sysFileType === "string" && sysFileType || tiddler.fields.type || "text/plain",
          encoding = (state.config.contentTypeInfo[type] || { encoding: "utf8" }).encoding;
        if (isSystemFileWikified) {
          text = state.store.adminWiki.renderTiddler("text/plain", title);
        }
        return state.sendString(200, {
          "content-type": type
        }, text, encoding);
      } else {
        return state.sendEmpty(404);
      }
    });
  }
  user;
  checks;
  attachmentStore;
  contentTypeInfo;
  constructor(
    state: StateObject,
    public prisma: PrismaTxnClient
  ) {
    this.contentTypeInfo = state.config.contentTypeInfo;

    this.attachmentStore = state.attachmentStore;

    this.checks = new DataChecks({ allowAnonReads: false, allowAnonWrites: false });

    this.user = state.authenticatedUser;
  }

  async serveRecipeTiddler(state: StateObject, zodAssert: ZodAssert) {
    zodAssert.pathParams(state, z => ({
      recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }));

    zodAssert.queryParams(state, z => ({
      fallback: z.array(z.string()).optional()
    }));

    const { recipe_name, title } = state.pathParams;

    const bag = await this.getRecipeBagWithTiddler({ recipe_name, title });

    return await this.sendBagTiddler({ state, bag_name: bag?.bag.bag_name, title });

  }

  async serveBagTiddler(state: StateObject, zodAssert: ZodAssert) {

    zodAssert.pathParams(state, z => ({
      bag_name: z.prismaField("Bags", "bag_name", "string"),
      title: z.prismaField("Tiddlers", "title", "string"),
    }));

    return this.sendBagTiddler({ state, bag_name: state.pathParams.bag_name, title: state.pathParams.title });

  }

  async getRecipeBagWithTiddler({ recipe_name, title }: { recipe_name: string; title: string; }) {
    const { OR } = this.checks.getBagWhereACL({
      permission: "READ",
      user_id: this.user?.user_id
    });
    return await this.prisma.recipe_bags.findFirst({
      include: { bag: true, recipe: true },
      where: {
        recipe: { recipe_name, recipe_bags: { every: { bag: { OR } } } },
        bag: { tiddlers: { some: { title, is_deleted: false } } }
      },
      orderBy: { position: "asc" }
    });
  }

  async sendBagTiddler({ state, bag_name, title }: {
    state: StateObject;
    bag_name: PrismaField<"Bags", "bag_name"> | undefined;
    title: PrismaField<"Tiddlers", "title">;
  }) {

    const tiddlerInfo = bag_name && await this.getBagTiddler({ bag_name, title });
    if (tiddlerInfo && tiddlerInfo.tiddler) {
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
        const result = await state.store.getBagTiddlerStream(title, bag_name);
        if (result) {
          return state.sendStream(200, {
            "Etag": state.makeTiddlerEtag(result),
            "Content-Type": result.type
          }, result.stream);
        } else {
          return state.sendEmpty(404);
        }
      }
    } else {
      // Redirect to fallback URL if tiddler not found
      const fallback = state.queryParams.fallback?.[0];
      console.log("bag-file-server fallback", fallback);
      if (fallback) {
        return state.redirect(fallback);
      } else {
        return state.sendEmpty(404);
      }
    }
  }

  async getBagTiddler({ bag_name, title }: {
    bag_name: PrismaField<"Bags", "bag_name">;
    title: PrismaField<"Tiddlers", "title">;
  }) {
    const tiddlerInfo = await this.getBagTiddlerInner({ bag_name, title });
    if (tiddlerInfo) {
      return Object.assign(
        {},
        tiddlerInfo,
        {
          tiddler: await this.processOutgoingTiddler({ tiddlerFields: tiddlerInfo.tiddler, bag_name, attachment_blob: tiddlerInfo.attachment_blob })
        });
    } else {
      return null;
    }
  }

  async getBagTiddlerInner({ bag_name, title }: {
    bag_name: PrismaField<"Bags", "bag_name">;
    title: PrismaField<"Tiddlers", "title">;
  }) {
    const { OR } = this.checks.getBagWhereACL({
      permission: "READ",
      user_id: this.user?.user_id
    });
    const tiddler = await this.prisma.tiddlers.findFirst({
      where: {
        title,
        bag: { bag_name, OR },
        is_deleted: false
      },
      include: {
        fields: true
      }
    });

    if (!tiddler) return null;

    return {
      bag_name: bag_name as PrismaField<"Bags", "bag_name">,
      tiddler_id: tiddler.tiddler_id as PrismaField<"Tiddlers", "tiddler_id">,
      attachment_blob: tiddler.attachment_blob as PrismaField<"Tiddlers", "attachment_blob">,
      tiddler: Object.fromEntries([
        ...tiddler.fields.map(e => [e.field_name, e.field_value] as const),
        ["title", title]
      ]) as TiddlerFields
    };

  }
  async processOutgoingTiddler({ tiddlerFields, bag_name, attachment_blob }: {
    tiddlerFields: TiddlerFields;
    bag_name: PrismaField<"Bags", "bag_name">;
    attachment_blob: PrismaField<"Tiddlers", "attachment_blob"> | null;
  }) {
    if (!tiddlerFields.title) throw new Error("title cannot be empty");
    if (attachment_blob !== null) {
      return Object.assign({}, tiddlerFields, {
        text: undefined,
        _canonical_uri: `/bags/${encodeURIComponentExtended(bag_name)}/tiddlers/${encodeURIComponentExtended(tiddlerFields.title)}/blob`
      }
      );
    } else {
      return tiddlerFields;
    }
  }
  async getBagTiddlerStream({ title, bag_name }: {
    title: PrismaField<"Tiddlers", "title">;
    bag_name: PrismaField<"Bags", "bag_name">;
  }) {
    const self = this;
    const tiddlerInfo = await this.getBagTiddlerInner({ bag_name, title });
    if (tiddlerInfo) {
      if (tiddlerInfo.attachment_blob) {
        return Object.assign(
          {},
          this.attachmentStore.getAttachmentStream(tiddlerInfo.attachment_blob),
          {
            tiddler_id: tiddlerInfo.tiddler_id,
            bag_name: bag_name
          }
        );
      } else {

        const stream = new Readable();
        const type = tiddlerInfo.tiddler.type || "text/plain";
        const { encoding } = (this.contentTypeInfo[type] || { encoding: "utf8" });
        stream._read = function () {
          // Push data
          stream.push(tiddlerInfo.tiddler.text || "", encoding);
          // Push null to indicate the end of the stream
          stream.push(null);
        };
        return {
          tiddler_id: tiddlerInfo.tiddler_id,
          bag_name: bag_name,
          stream: stream,
          type: tiddlerInfo.tiddler.type || "text/plain"
        };
      }
    } else {
      return null;
    }
  }
}
