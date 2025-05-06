import * as fs from "fs";
import * as path from "path";
import { Router, SiteConfig } from "./router";
import { AttachmentService, TiddlerFields } from "../services/attachments";
import { ok } from "assert";
import { Commander } from "../commander";
import { FileInfoTiddlers, TiddlerFieldModule } from "tiddlywiki";
import { UserError } from "../utils";

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
  static fromCommander(commander: Commander, prisma: PrismaTxnClient) {
    return new TiddlerStore(
      commander.$tw.Tiddler.fieldModules,
      new AttachmentService(commander.siteConfig, prisma),
      commander.siteConfig,
      prisma
    );
  }


  storePath: string;

  constructor(
    public fieldModules: Record<string, TiddlerFieldModule>,
    public attachService: AttachmentService,
    public siteConfig: SiteConfig,
    public prisma: PrismaTxnClient
  ) {

    this.storePath = this.siteConfig.storePath;
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
  async upsertRecipe(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    description: PrismaField<"Recipes", "description">,
    bags: { bag_name: PrismaField<"Bags", "bag_name">, with_acl: PrismaField<"Recipe_bags", "with_acl"> }[],
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {
    const [recipe_, recipe_bags_] = this.upsertRecipe_PrismaArray(recipe_name, description, bags, { allowPrivilegedCharacters });
    const recipe = await recipe_;
    await recipe_bags_;
    return recipe;
  }
  upsertRecipe_PrismaArray(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    description: PrismaField<"Recipes", "description">,
    bags: { bag_name: PrismaField<"Bags", "bag_name">, with_acl: PrismaField<"Recipe_bags", "with_acl"> }[],
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {

    const validationRecipeName = this.validateItemName(recipe_name, allowPrivilegedCharacters);
    if (validationRecipeName) throw validationRecipeName;
    if (bags.length === 0) throw new UserError("Recipes must contain at least one bag");

    return [
      this.prisma.recipes.upsert({
        where: { recipe_name },
        update: { description, recipe_bags: { deleteMany: {} } },
        create: { recipe_name, description },
        select: { recipe_id: true }
      }),
      this.prisma.recipes.update({
        where: { recipe_name },
        data: {
          recipe_bags: {
            create: bags.map(({ bag_name, with_acl }, position) => ({
              bag: { connect: { bag_name } },
              position,
              with_acl
            }))
          }
        }
      })
    ];

  }
  async upsertBag(
    bag_name: PrismaField<"Bags", "bag_name">,
    description: PrismaField<"Bags", "description">,
    is_plugin: PrismaField<"Bags", "is_plugin">,
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {
    return await this.upsertBag_PrismaPromise(bag_name, description, is_plugin, {
      allowPrivilegedCharacters
    });
  }
  upsertBag_PrismaPromise(
    bag_name: PrismaField<"Bags", "bag_name">,
    description: PrismaField<"Bags", "description">,
    is_plugin: PrismaField<"Bags", "is_plugin">,
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {

    const validationBagName = this.validateItemName(bag_name, allowPrivilegedCharacters);
    if (validationBagName) throw validationBagName;

    return this.prisma.bags.upsert({
      where: { bag_name },
      update: { description, is_plugin },
      create: { bag_name, description, is_plugin },
      select: { bag_id: true }
    });

  }
  /**
   * You probably want to call this inside a transaction.
   *
  ```js
  const tiddlersFromPath = $tw.loadTiddlersFromPath(tiddlerPath);
  ```
   */
  async saveTiddlersFromPath(
    tiddlersFromPath: { tiddlers: TiddlerFields[] }[],
    bag_name: PrismaField<"Bags", "bag_name">
  ) {

  }
  saveTiddlersFromPath_PrismaArray(
    tiddlersFromPath: { tiddlers: TiddlerFields[] }[],
    bag_name: PrismaField<"Bags", "bag_name">
  ) {
    return [
      this.prisma.tiddlers.deleteMany({
        where: { bag: { bag_name } }
      }),
      ...tiddlersFromPath.flatMap(({ tiddlers }) =>
        tiddlers.flatMap(tiddler =>
          this.saveBagTiddlerFields_PrismaArray(tiddler, bag_name, null)
        )
      )
    ]

  }


  /*
  Returns {tiddler_id:}
  */
  async saveBagTiddler(
    incomingTiddlerFields: TiddlerFields,
    bag_name: PrismaField<"Bags", "bag_name">
  ) {
    const { title } = incomingTiddlerFields;

    const existing_attachment_hash = await this.prisma.tiddlers.findFirst({
      where: { title, bag: { bag_name } },
      select: { attachment_hash: true }
    }).then(e => e?.attachment_hash ?? null);

    const { tiddlerFields, attachment_hash } = await this.attachService.processIncomingTiddler({
      tiddlerFields: incomingTiddlerFields,
      existing_attachment_hash,
      existing_canonical_uri: existing_attachment_hash && this.attachService.makeCanonicalUri(bag_name, incomingTiddlerFields.title)
    });
    return this.saveBagTiddlerFields(tiddlerFields, bag_name, attachment_hash);

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
    const attachment_hash = await this.attachService.adoptAttachment({
      // options.filepath, options.type, options.hash, options._canonical_uri
      incomingFilepath: options.filepath,
      type: options.type,
      hash: options.hash,
      _canonical_uri: options._canonical_uri
    });
    if (attachment_hash) {
      return this.saveBagTiddlerFields(incomingTiddlerFields, bag_name, attachment_hash);
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
    const existing_attachment_hash = currentBag && await this.prisma.tiddlers.findFirst({
      where: { title, bag: { bag_name: currentBag.bag.bag_name } },
      select: { attachment_hash: true }
    }).then(e => e?.attachment_hash ?? null);

    const { tiddlerFields, attachment_hash } = await this.attachService.processIncomingTiddler({
      existing_attachment_hash,
      existing_canonical_uri: incomingTiddlerFields._canonical_uri,
      tiddlerFields: incomingTiddlerFields
    });
    return this.saveRecipeTiddlerFields(tiddlerFields, recipe_name, attachment_hash);
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

    const tiddler = await this.prisma.tiddlers.findFirst({
      where: bag_name
        ? { title, bag: { bag_name }, is_deleted: false }
        : { title, bag_id, is_deleted: false },
      select: { tiddler_id: true }
    });
    if (!tiddler) return null;

    var tiddlerInfo = await this.getTiddlerInfo(tiddler.tiddler_id);
    if (!tiddlerInfo) return null;

    // if (tiddlerInfo.is_plugin) {
    //   const pluginBag = await this.prisma.bags.findUnique({
    //     where: { bag_name: tiddlerInfo.bag_name },
    //     include: { tiddlers: { include: { fields: true } } }
    //   });
    // }

    return {
      ...tiddlerInfo,
      tiddler: this.attachService.processOutgoingTiddler(tiddlerInfo)
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

  async getRecipeWritableBag(
    recipe_name: PrismaField<"Recipes", "recipe_name">
  ) {
    const recipe_bag = await this.prisma.recipe_bags.findFirst({
      select: { bag: true },
      where: { recipe: { recipe_name }, position: 0 }
    });
    if (!recipe_bag) return null;
    return recipe_bag.bag;
  }


  async getTiddlerInfo(
    tiddler_id: PrismaField<"Tiddlers", "tiddler_id">
  ) {

    const tiddler = await this.prisma.tiddlers.findUnique({
      where: { tiddler_id, is_deleted: false },
      include: { fields: true, bag: true }
    });

    if (!tiddler) return null;

    if (tiddler.bag.is_plugin && tiddler.title as string !== tiddler.bag.bag_name as string)
      throw new UserError("Can only get tiddler info for a plugin bag itself");

    return {
      bag_name: tiddler.bag.bag_name,
      is_plugin_bag: tiddler.bag.is_plugin,
      tiddler_id: tiddler.tiddler_id,
      attachment_hash: tiddler.attachment_hash,
      tiddler: Object.fromEntries([
        ...tiddler.fields.map(e => [e.field_name, e.field_value] as const),
        ["title", tiddler.title]
      ]) as TiddlerFields
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

    if (tiddlerInfo.attachment_hash) {
      return {
        ...await this.attachService.getAttachmentStream(tiddlerInfo.attachment_hash) ?? {},
        tiddler_id: tiddlerInfo.tiddler_id,
        bag_name: bag_name
      };
    } else {
      const { Readable } = require('stream');
      const stream = new Readable();
      stream._read = () => {
        // Push data
        const type = tiddlerInfo.tiddler.type || "text/plain";
        stream.push(tiddlerInfo.tiddler.text || "", (this.siteConfig.contentTypeInfo[type] || { encoding: "utf8" }).encoding);
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
    attachment_hash: PrismaField<"Tiddlers", "attachment_hash">
  ) {

    const recipe = await this.prisma.recipes.findUnique({
      where: { recipe_name },
      include: {
        recipe_bags: {
          // we're saving to the top most bag
          where: { position: 0 },
          select: { bag: { select: { bag_id: true, bag_name: true } } },
        }
      }
    });

    if (!recipe) throw new UserError("Recipe not found");

    const bag_name = recipe.recipe_bags[0]?.bag.bag_name;

    if (!bag_name) throw new UserError("Recipe has no bag at position 0");

    // Save the tiddler to the specified bag
    var { tiddler_id } = await this.saveBagTiddlerFields(tiddlerFields, bag_name, attachment_hash);

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
    // 	var info = this.saveBagTiddler(tiddlerFields, row.bag_name, attachment_hash);
    // 	return {
    // 		tiddler_id: info.tiddler_id,
    // 		bag_name: row.bag_name
    // 	};
  }

  async saveBagTiddlerFields(
    tiddlerFields: TiddlerFields,
    bag_name: PrismaField<"Bags", "bag_name">,
    attachment_hash: PrismaField<"Tiddlers", "attachment_hash">
  ) {
    const [deletion, creation] = this.saveBagTiddlerFields_PrismaArray(tiddlerFields, bag_name, attachment_hash);
    await deletion;
    return await creation;
  }
  saveBagTiddlerFields_PrismaArray(
    tiddlerFields: TiddlerFields,
    bag_name: PrismaField<"Bags", "bag_name">,
    attachment_hash: PrismaField<"Tiddlers", "attachment_hash">
  ) {

    const { title } = tiddlerFields;
    if (!title) {
      console.error(tiddlerFields);
      throw new Error("Tiddler must have a title");
    }

    const deletion = this.prisma.tiddlers.deleteMany({
      where: { bag: { bag_name }, title }
    });

    const encodeTiddlerFields = ([field_name, field_value]: [string, any]) => {
      const fieldModule = this.fieldModules[field_name];
      if (typeof field_value === "string") return [field_name, field_value];
      if (fieldModule && fieldModule.stringify) field_value = fieldModule.stringify(field_value);
      if (typeof field_value === "number") field_value = field_value.toString();
      if (typeof field_value === "boolean") field_value = field_value ? "true" : "false";
      if (typeof field_value === "undefined" || field_value === null) field_value = "";
      return [field_name, field_value];
    };

    const creation = this.prisma.tiddlers.create({
      data: {
        bag: { connect: { bag_name } },
        title,
        is_deleted: false,
        attachment_hash: attachment_hash || null,
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

    return [deletion, creation] as const;

    // 	attachment_hash = attachment_hash || null;
    // 	// Update the tiddlers table
    // 	var info = this.engine.runStatement(`
    // 	INSERT OR REPLACE INTO tiddlers (bag_id, title, is_deleted, attachment_hash)
    // 	VALUES (
    // 		(SELECT bag_id FROM bags WHERE bag_name = $bag_name),
    // 		$title,
    // 		FALSE,
    // 		$attachment_hash
    // 	)
    // `, {
    // 		$title: tiddlerFields.title,
    // 		$attachment_hash: attachment_hash,
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
  /*
  Returns {tiddler_id:,bag_name:}
  */
  async deleteRecipeTiddler(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    title: PrismaField<"Tiddlers", "title">
  ) {

    const currentBag = await this.getRecipeBagWithTiddler({ recipe_name, title });
    if (!currentBag)
      throw new UserError("Tiddler not found in recipe");
    if (currentBag.position !== 0)
      throw new UserError("Cannot delete tiddler from non-top bag");
    return await this.deleteBagTiddler(title, currentBag.bag.bag_name);
  }
  /**
    Returns {tiddler_id:} of the delete marker
    */
  async deleteBagTiddler(
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
        attachment_hash: null,
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
    // 	INSERT OR REPLACE INTO tiddlers (bag_id, title, is_deleted, attachment_hash)
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

  async getRecipeTiddlersByBag(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    options: {
      // how do you limit a list of unique titles?
      // limit?: number, 
      last_known_tiddler_id?: number,
      include_deleted?: boolean,
    } = {}
  ) {
    // In prisma it's easy to get the top bag for a specific title. 
    // To get all titles we basically have to get all bags and manually find the top one. 
    const lastid = options.last_known_tiddler_id;
    const withDeleted = options.include_deleted;
    const bags = await this.prisma.recipe_bags.findMany({
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
              },
              where: {
                is_deleted: withDeleted ? undefined : false,
                tiddler_id: lastid ? { gt: lastid } : undefined
              },
            }
          }
        }
      },
    });


    return bags.map(e => ({
      bag_id: e.bag.bag_id,
      bag_name: e.bag.bag_name,
      is_plugin: e.bag.is_plugin,
      position: e.position,
      tiddlers: e.bag.tiddlers
    }));

    // 	// Get the recipe ID
    // 	const rowsCheckRecipe = this.engine.runStatementGet(`
    // 	SELECT recipe_id FROM recipes WHERE recipes.recipe_name = $recipe_name
    // `, {
    // 		$recipe_name: recipe_name
    // 	});
    // 	if (!rowsCheckRecipe) {
    // 		return null;
    // 	}
    // 	const recipe_id = rowsCheckRecipe.recipe_id;
    // 	// Compose the query to get the tiddlers
    // 	const params = {
    // 		$recipe_id: recipe_id
    // 	};
    // 	if (options.limit) {
    // 		params.$limit = options.limit.toString();
    // 	}
    // 	if (options.last_known_tiddler_id) {
    // 		params.$last_known_tiddler_id = options.last_known_tiddler_id;
    // 	}
    // 	const rows = this.engine.runStatementGetAll(`
    // 	SELECT title, tiddler_id, is_deleted, bag_name
    // 	FROM (
    // 		SELECT t.title, t.tiddler_id, t.is_deleted, b.bag_name, MAX(rb.position) AS position
    // 		FROM bags AS b
    // 		INNER JOIN recipe_bags AS rb ON b.bag_id = rb.bag_id
    // 		INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
    // 		WHERE rb.recipe_id = $recipe_id
    // 		${options.include_deleted ? "" : "AND t.is_deleted = FALSE"}
    // 		${options.last_known_tiddler_id ? "AND tiddler_id > $last_known_tiddler_id" : ""}
    // 		GROUP BY t.title
    // 		ORDER BY t.title, tiddler_id DESC
    // 		${options.limit ? "LIMIT $limit" : ""}
    // 	)
    // `, params);
    // 	return rows;
  }
}
