import * as fs from "fs";
import * as path from "path";
import { RouterConfig } from "../router";
import { TiddlerFields } from "../store/new-sql-tiddler-database";
import { AttachmentService } from "./services/attachments";

/**

### NOTES from attachments file

Class to handle the attachments in the filing system

The store folder looks like this:

store/
  inbox/ - files that are in the process of being uploaded via a multipart form upload
    202402282125432742/
      0
      1
      ...
    ...
  files/ - files that are the text content of large tiddlers
    b7def178-79c4-4d88-b7a4-39763014a58b/
      data.jpg - the extension is provided for convenience when directly inspecting the file system
      meta.json - contains:
        {
          "filename": "data.jpg",
          "type": "video/mp4",
          "uploaded": "2024021821224823"
        }
  database.sql - The database file (managed by Prisma)

*/
export class TiddlerStore {
  attachService: AttachmentService;
  storePath: string;
  constructor(
    config: RouterConfig,
    protected prisma: PrismaTxnClient
  ) {
    this.attachService = new AttachmentService(config, prisma);
    this.storePath = config.storePath;
  }

  /*
  Returns null if a bag/recipe name is valid, or a string error message if not
  */
  validateItemName(name: string, allowPrivilegedCharacters: boolean) {
    if (typeof name !== "string") {
      return "Not a valid string";
    }
    if (name.length > 256) {
      return "Too long";
    }
    // Removed ~ from this list temporarily
    if (allowPrivilegedCharacters) {
      if (!(/^[^\s\u00A0\x00-\x1F\x7F`!@#%^&*()+={}\[\];\'\"<>,\\\?]+$/g.test(name))) {
        return "Invalid character(s)";
      }
    } else {
      if (!(/^[^\s\u00A0\x00-\x1F\x7F`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?]+$/g.test(name))) {
        return "Invalid character(s)";
      }
    }
    return null;
  }
  /*
  Returns null if the argument is an array of valid bag/recipe names, or a string error message if not
  */
  validateItemNames(names: string[], allowPrivilegedCharacters: boolean) {
    if (!Array.isArray(names)) {
      return "Not a valid array";
    }
    var errors = [];
    for (const name of names) {
      const result = this.validateItemName(name, allowPrivilegedCharacters);
      if (result && errors.indexOf(result) === -1) {
        errors.push(result);
      }
    }
    if (errors.length === 0) {
      return null;
    } else {
      return errors.join("\n");
    }
  }
  /**
   * You probably want to call this inside a transaction.
   *
  ```js
  var tiddlersFromPath = $tw.loadTiddlersFromPath(path.resolve(
    $tw.boot.corePath, $tw.config.editionsPath, tiddler_files_path
  ));
  ```
   */
  async saveTiddlersFromPath(
    tiddlersFromPath: any,
    bag_name: PrismaField<"Bags", "bag_name">
  ) {

    // Clear out the bag
    await this.prisma.tiddlers.deleteMany({
      where: { bag: { bag_name } }
    });
    // Save the tiddlers
    for (const tiddlersFromFile of tiddlersFromPath) {
      for (const tiddler of tiddlersFromFile.tiddlers) {
        await this.saveBagTiddlerFields(tiddler, bag_name, null);
      }
    }

  }


  /*
  Returns {tiddler_id:}
  */
  async saveBagTiddler(
    incomingTiddlerFields: TiddlerFields,
    bag_name: PrismaField<"Bags", "bag_name">
  ) {
    const { title } = incomingTiddlerFields;

    const existing_attachment_blob = await this.prisma.tiddlers.findFirst({
      where: { title, bag: { bag_name } },
      select: { attachment_blob: true }
    }).then(e => e?.attachment_blob ?? null);

    const { tiddlerFields, attachment_blob } = await this.attachService.processIncomingTiddler({
      tiddlerFields: incomingTiddlerFields,
      existing_attachment_blob,
      existing_canonical_uri: existing_attachment_blob && this.attachService.makeCanonicalUri(bag_name, incomingTiddlerFields.title)
    });
    return this.saveBagTiddlerFields(tiddlerFields, bag_name, attachment_blob);

  }
  /*
  Create a tiddler in a bag adopting the specified file as the attachment. The attachment file must be on the same disk as the attachment store
  Options include:
  
  filepath - filepath to the attachment file
  hash - string hash of the attachment file
  type - content type of file as uploaded
  
  Returns {tiddler_id:}
  */
  async saveBagTiddlerWithAttachment(
    incomingTiddlerFields: TiddlerFields,
    bag_name: PrismaField<"Bags", "bag_name">,
    options: {
      filepath: string;
      hash: string;
      type: string;
      _canonical_uri: string;
    }
  ) {
    const attachment_blob = await this.attachService.adoptAttachment({
      // options.filepath, options.type, options.hash, options._canonical_uri
      incomingFilepath: options.filepath,
      type: options.type,
      hash: options.hash,
      _canonical_uri: options._canonical_uri
    });
    if (attachment_blob) {
      return this.saveBagTiddlerFields(incomingTiddlerFields, bag_name, attachment_blob);
    } else {
      return null;
    }
  }
  /*
  Returns {tiddler_id:,bag_name:}
 
  The critical difference here is that the tiddler gets saved to the top bag.
  */
  async saveRecipeTiddler(
    incomingTiddlerFields: TiddlerFields,
    recipe_name: PrismaField<"Recipes", "recipe_name">
  ) {
    const { title } = incomingTiddlerFields;
    const currentBag = await this.getRecipeBagWithTiddler({ recipe_name, title });
    const existing_attachment_blob = currentBag && await this.prisma.tiddlers.findFirst({
      where: { title, bag: { bag_name: currentBag.bag.bag_name } },
      select: { attachment_blob: true }
    }).then(e => e?.attachment_blob ?? null);

    const { tiddlerFields, attachment_blob } = await this.attachService.processIncomingTiddler({
      existing_attachment_blob,
      existing_canonical_uri: incomingTiddlerFields._canonical_uri,
      tiddlerFields: incomingTiddlerFields
    });
    return this.saveRecipeTiddlerFields(tiddlerFields, recipe_name, attachment_blob);
  }

  /*
  returns {tiddler_id:,tiddler:}
  */
  async getBagTiddler(options: {
    title: PrismaField<"Tiddlers", "title">;
    bag_name?: PrismaField<"Bags", "bag_name">;
    bag_id?: PrismaField<"Bags", "bag_id">;
  }) {
    const { title, bag_name, bag_id } = options;
    ok(bag_name || bag_id, "bag_name or bag_id must be provided");
    const tiddler_id = await this.prisma.tiddlers.findFirst({
      where: bag_name
        ? { title, bag: { bag_name }, is_deleted: false }
        : { title, bag_id, is_deleted: false },
      select: { tiddler_id: true }
    }).then(e => e?.tiddler_id);
    if (!tiddler_id) return null;

    var tiddlerInfo = await this.getTiddlerInfo(tiddler_id);
    if (!tiddlerInfo) return null;

    return {
      ...tiddlerInfo,
      tiddler: await this.attachService.processOutgoingTiddler(tiddlerInfo)
    };

  }

  async getRecipeTiddler(
    title: PrismaField<"Tiddlers", "title">,
    recipe_name: PrismaField<"Recipes", "recipe_name">
  ) {

    const recipe_bag = await this.getRecipeBagWithTiddler({ recipe_name, title });

    if (!recipe_bag) return null;

    return await this.getBagTiddler({ title, bag_id: recipe_bag.bag_id });

  }


  async getRecipeBagWithTiddler({ recipe_name, title }: { recipe_name: string; title: string; }) {

    return await this.prisma.recipe_bags.findFirst({
      include: { bag: true, recipe: true },
      where: {
        recipe: { recipe_name },
        bag: { tiddlers: { some: { title, is_deleted: false } } }
      },
      orderBy: { position: "asc" }
    });
  }


  async getTiddlerInfo(
    tiddler_id: PrismaField<"Tiddlers", "tiddler_id">
  ) {

    const tiddler = await this.prisma.tiddlers.findUnique({
      where: { tiddler_id, is_deleted: false },
      include: { fields: true, bag: true }
    });

    if (!tiddler) return null;

    return {
      bag_name: tiddler.bag.bag_name,
      tiddler_id: tiddler.tiddler_id,
      attachment_blob: tiddler.attachment_blob,
      tiddler: Object.fromEntries([
        ...tiddler.fields.map(e => [e.field_name, e.field_value] as const),
        ["title", tiddler.title]
      ])
    };
  }
  /*
  Get an attachment ready to stream. Returns null if there is an error or:
  tiddler_id: revision of tiddler
  stream: stream of file
  type: type of file
  Returns {tiddler_id:,bag_name:}
  */
  async getBagTiddlerStream(
    title: PrismaField<"Tiddlers", "title">,
    bag_name: PrismaField<"Bags", "bag_name">
  ) {
    const tiddlerInfo = await this.getBagTiddler({ title, bag_name });
    if (!tiddlerInfo) return null;

    if (tiddlerInfo.attachment_blob) {
      return {
        ...await this.attachService.getAttachmentStream(tiddlerInfo.attachment_blob) ?? {},
        tiddler_id: tiddlerInfo.tiddler_id,
        bag_name: bag_name
      };
    } else {
      const { Readable } = require('stream');
      const stream = new Readable();
      stream._read = function () {
        // Push data
        const type = tiddlerInfo.tiddler.type || "text/plain";
        stream.push(tiddlerInfo.tiddler.text || "", (this.config.contentTypeInfo[type] || { encoding: "utf8" }).encoding);
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

  }

  /**
    Returns {tiddler_id:,bag_name:} or null if the recipe is empty
    */
  async saveRecipeTiddlerFields(
    tiddlerFields: TiddlerFields,
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    attachment_blob: PrismaField<"Tiddlers", "attachment_blob">
  ) {

    const recipe = await this.prisma.recipes.findUnique({
      where: { recipe_name },
      include: {
        recipe_bags: {
          // if we're saving to the top most bag, we don't check whether it already has the tiddler
          // where: { bag: { tiddlers: { some: { title: tiddlerFields.title } } } },
          select: { bag: { select: { bag_name: true } } },
          orderBy: { position: "desc" },
          take: 1,
        }
      }
    });

    const bag_name = recipe?.recipe_bags[0]?.bag.bag_name;

    if (!bag_name) return null;

    // Save the tiddler to the specified bag
    var { tiddler_id } = await this.saveBagTiddlerFields(tiddlerFields, bag_name, attachment_blob);

    return { tiddler_id, bag_name };
    // 	// Find the topmost bag in the recipe
    // 	var row = this.engine.runStatementGet(`
    // 	SELECT b.bag_name
    // 	FROM bags AS b
    // 	JOIN (
    // 		SELECT rb.bag_id
    // 		FROM recipe_bags AS rb
    // 		WHERE rb.recipe_id = (
    // 			SELECT recipe_id
    // 			FROM recipes
    // 			WHERE recipe_name = $recipe_name
    // 		)
    // 		ORDER BY rb.position DESC
    // 		LIMIT 1
    // 	) AS selected_bag
    // 	ON b.bag_id = selected_bag.bag_id
    // `, {
    // 		$recipe_name: recipe_name
    // 	});
    // 	if (!row) {
    // 		return null;
    // 	}
    // 	// Save the tiddler to the topmost bag
    // 	var info = this.saveBagTiddler(tiddlerFields, row.bag_name, attachment_blob);
    // 	return {
    // 		tiddler_id: info.tiddler_id,
    // 		bag_name: row.bag_name
    // 	};
  }
  /**
  Returns {tiddler_id:}
  */
  async saveBagTiddlerFields(
    tiddlerFields: TiddlerFields,
    bag_name: PrismaField<"Bags", "bag_name">,
    attachment_blob: PrismaField<"Tiddlers", "attachment_blob">
  ) {

    const { title } = tiddlerFields;

    const oldTiddler = await this.prisma.tiddlers.findFirst({
      where: { bag: { bag_name }, title }
    });

    if (oldTiddler?.tiddler_id) {
      await this.prisma.tiddlers.delete({
        where: { tiddler_id: oldTiddler.tiddler_id, }
      });
    }

    const encodeTiddlerFields = ([field_name, field_value]: [string, any]) => {
      if (typeof field_value === "number") field_value = field_value.toString();
      if (typeof field_value === "undefined" || field_value === null) field_value = "";
      return [field_name, field_value];
    };

    return await this.prisma.tiddlers.create({
      data: {
        bag: { connect: { bag_name } },
        title,
        is_deleted: false,
        attachment_blob: attachment_blob || null,
        fields: {
          create: Object.entries(tiddlerFields)
            .map(encodeTiddlerFields)
            .map(([field_name, field_value]) => ({ field_name, field_value }))
        }
      },
      select: {
        tiddler_id: true
      }
    });

    // 	attachment_blob = attachment_blob || null;
    // 	// Update the tiddlers table
    // 	var info = this.engine.runStatement(`
    // 	INSERT OR REPLACE INTO tiddlers (bag_id, title, is_deleted, attachment_blob)
    // 	VALUES (
    // 		(SELECT bag_id FROM bags WHERE bag_name = $bag_name),
    // 		$title,
    // 		FALSE,
    // 		$attachment_blob
    // 	)
    // `, {
    // 		$title: tiddlerFields.title,
    // 		$attachment_blob: attachment_blob,
    // 		$bag_name: bag_name
    // 	});
    // 	// Update the fields table
    // 	this.engine.runStatement(`
    // 	INSERT OR REPLACE INTO fields (tiddler_id, field_name, field_value)
    // 	SELECT
    // 		t.tiddler_id,
    // 		json_each.key AS field_name,
    // 		json_each.value AS field_value
    // 	FROM (
    // 		SELECT tiddler_id
    // 		FROM tiddlers
    // 		WHERE bag_id = (
    // 			SELECT bag_id
    // 			FROM bags
    // 			WHERE bag_name = $bag_name
    // 		) AND title = $title
    // 	) AS t
    // 	JOIN json_each($field_values) AS json_each
    // `, {
    // 		$title: tiddlerFields.title,
    // 		$bag_name: bag_name,
    // 		$field_values: JSON.stringify(Object.assign({}, tiddlerFields, { title: undefined }))
    // 	});
    // 	return {
    // 		tiddler_id: info.lastInsertRowid
    // 	};
  }

  /**
    Returns {tiddler_id:} of the delete marker
    */
  async deleteTiddler(
    title: PrismaField<"Tiddlers", "title">,
    bag_name: PrismaField<"Bags", "bag_name">
  ) {
    await this.prisma.tiddlers.deleteMany({
      where: { title, bag: { bag_name } },
    });
    const { tiddler_id } = await this.prisma.tiddlers.create({
      data: {
        title,
        bag: { connect: { bag_name } },
        is_deleted: true,
        attachment_blob: null,
      },
      select: {
        tiddler_id: true
      }
    });

    return { bag_name, tiddler_id }

    // 	// Delete the fields of this tiddler
    // 	this.engine.runStatement(`
    // 	DELETE FROM fields
    // 	WHERE tiddler_id IN (
    // 		SELECT t.tiddler_id
    // 		FROM tiddlers AS t
    // 		INNER JOIN bags AS b ON t.bag_id = b.bag_id
    // 		WHERE b.bag_name = $bag_name AND t.title = $title
    // 	)
    // `, {
    // 		$title: title,
    // 		$bag_name: bag_name
    // 	});
    // 	// Mark the tiddler itself as deleted
    // 	const rowDeleteMarker = this.engine.runStatement(`
    // 	INSERT OR REPLACE INTO tiddlers (bag_id, title, is_deleted, attachment_blob)
    // 	VALUES (
    // 		(SELECT bag_id FROM bags WHERE bag_name = $bag_name),
    // 		$title,
    // 		TRUE,
    // 		NULL
    // 	)
    // `, {
    // 		$title: title,
    // 		$bag_name: bag_name
    // 	});
    // 	return { tiddler_id: rowDeleteMarker.lastInsertRowid };
  }
}
