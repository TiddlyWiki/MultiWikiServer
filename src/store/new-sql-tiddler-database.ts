/*\
title: $:/plugins/tiddlywiki/multiwikiserver/store/sql-tiddler-database.js
type: application/javascript
module-type: library

Low level SQL functions to store and retrieve tiddlers in a SQLite database.

This class is intended to encapsulate all the SQL queries used to access the database.
Validation is for the most part left to the caller

\*/

// import { Database } from "node-sqlite3-wasm";
import { Prisma, PrismaClient } from "@prisma/client";
import { Args, DefaultArgs, GetResult, Operation, Payload } from "@prisma/client/runtime/library";
import * as z from "zod";
import { DataChecks } from "./data-checks";
import type { SqlTiddlerStore } from "./new-sql-tiddler-store";
export interface TiddlerFields extends Record<string, any> {
	title: string;
}
const ModelNames = Object.keys(Prisma.ModelName);


/**
Create a tiddler store. Options include:

databasePath - path to the database file (can be ":memory:" to get a temporary database)
engine - wasm | better

Regardless of whether the behavior makes sense to me or not, I'm trying to keep the same behavior. 

- Prisma doesn't have a concept for insert or replace. That's used a lot throughout the code base.
- Insert or Ignore will skip the row being attempted to be inserted if it violates a unique constraint.
- Insert or Replace will delete the row and insert a new one if it violates a unique constraint.



*/
export class SqlTiddlerDatabase extends DataChecks {
	/** 
	 * The engine maps output values to their corresponding PrismaField values, 
	 * but does not require input values to also be mapped.
	 */

	entityTypeToTableMap = {
		bag: {
			table: "bags",
			column: "bag_name"
		},
		recipe: {
			table: "recipes",
			column: "recipe_name"
		}
	}
	// public $transaction: <T>(fn: (store: SqlTiddlerStore) => Promise<T>) => Promise<T>
	constructor(private engine: PrismaTxnClient) {
		super();
	}

	async createTables() {
		const statements = [`
			-- Users table
			CREATE TABLE IF NOT EXISTS users (
				user_id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				email TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				created_at TEXT DEFAULT (datetime('now')),
				last_login TEXT
			)
		`, `
			-- User Session  table
			CREATE TABLE IF NOT EXISTS sessions (
				user_id INTEGER NOT NULL,
				session_id TEXT NOT NULL,
				created_at TEXT NOT NULL,
				last_accessed TEXT NOT NULL,
				PRIMARY KEY (session_id),
				FOREIGN KEY (user_id) REFERENCES users(user_id)
			)
		`, `
			-- Groups table
			CREATE TABLE IF NOT EXISTS groups (
				group_id INTEGER PRIMARY KEY AUTOINCREMENT,
				group_name TEXT UNIQUE NOT NULL,
				description TEXT
			)
		`, `
			-- Roles table
			CREATE TABLE IF NOT EXISTS roles (
				role_id INTEGER PRIMARY KEY AUTOINCREMENT,
				role_name TEXT UNIQUE NOT NULL,
				description TEXT
			)
		`, `
			-- Permissions table
			CREATE TABLE IF NOT EXISTS permissions (
				permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
				permission_name TEXT UNIQUE NOT NULL,
				description TEXT
			)
		`, `
			-- User-Group association table
			CREATE TABLE IF NOT EXISTS user_groups (
				user_id INTEGER,
				group_id INTEGER,
				PRIMARY KEY (user_id, group_id),
				FOREIGN KEY (user_id) REFERENCES users(user_id),
				FOREIGN KEY (group_id) REFERENCES groups(group_id)
			)
		`, `
			-- User-Role association table
			CREATE TABLE IF NOT EXISTS user_roles (
				user_id INTEGER,
				role_id INTEGER,
				PRIMARY KEY (user_id, role_id),
				FOREIGN KEY (user_id) REFERENCES users(user_id),
				FOREIGN KEY (role_id) REFERENCES roles(role_id)
			)
		`, `
			-- Group-Role association table
			CREATE TABLE IF NOT EXISTS group_roles (
				group_id INTEGER,
				role_id INTEGER,
				PRIMARY KEY (group_id, role_id),
				FOREIGN KEY (group_id) REFERENCES groups(group_id),
				FOREIGN KEY (role_id) REFERENCES roles(role_id)
			)
		`, `
			-- Role-Permission association table
			CREATE TABLE IF NOT EXISTS role_permissions (
				role_id INTEGER,
				permission_id INTEGER,
				PRIMARY KEY (role_id, permission_id),
				FOREIGN KEY (role_id) REFERENCES roles(role_id),
				FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
			)
		`, `
			-- Bags have names and access control settings
			CREATE TABLE IF NOT EXISTS bags (
				bag_id INTEGER PRIMARY KEY AUTOINCREMENT,
				bag_name TEXT UNIQUE NOT NULL,
				accesscontrol TEXT NOT NULL,
				description TEXT NOT NULL
			)
		`, `
			-- Recipes have names...
			CREATE TABLE IF NOT EXISTS recipes (
				recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
				recipe_name TEXT UNIQUE NOT NULL,
				description TEXT NOT NULL,
				owner_id INTEGER,
				FOREIGN KEY (owner_id) REFERENCES users(user_id)
			)
		`, `
			-- ...and recipes also have an ordered list of bags
			CREATE TABLE IF NOT EXISTS recipe_bags (
				recipe_id INTEGER NOT NULL,
				bag_id INTEGER NOT NULL,
				position INTEGER NOT NULL,
				FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON UPDATE CASCADE ON DELETE CASCADE,
				FOREIGN KEY (bag_id) REFERENCES bags(bag_id) ON UPDATE CASCADE ON DELETE CASCADE,
				UNIQUE (recipe_id, bag_id)
			)
		`, `
			-- Tiddlers are contained in bags and have titles
			CREATE TABLE IF NOT EXISTS tiddlers (
				tiddler_id INTEGER PRIMARY KEY AUTOINCREMENT,
				bag_id INTEGER NOT NULL,
				title TEXT NOT NULL,
				is_deleted BOOLEAN NOT NULL,
				attachment_blob TEXT, -- null or the name of an attachment blob
				FOREIGN KEY (bag_id) REFERENCES bags(bag_id) ON UPDATE CASCADE ON DELETE CASCADE,
				UNIQUE (bag_id, title)
			)
		`, `
			-- Tiddlers also have unordered lists of fields, each of which has a name and associated value
			CREATE TABLE IF NOT EXISTS fields (
				tiddler_id INTEGER,
				field_name TEXT NOT NULL,
				field_value TEXT NOT NULL,
				FOREIGN KEY (tiddler_id) REFERENCES tiddlers(tiddler_id) ON UPDATE CASCADE ON DELETE CASCADE,
				UNIQUE (tiddler_id, field_name)
			)
		`, `
			-- ACL table (using bag/recipe ids directly)
			CREATE TABLE IF NOT EXISTS acl (
				acl_id INTEGER PRIMARY KEY AUTOINCREMENT,
				entity_name TEXT NOT NULL,
				entity_type TEXT NOT NULL CHECK (entity_type IN ('bag', 'recipe')),
				role_id INTEGER,
				permission_id INTEGER,
				FOREIGN KEY (role_id) REFERENCES roles(role_id),
				FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
			)
		`, `
			-- Indexes for performance (we can add more as needed based on query patterns)
			CREATE INDEX IF NOT EXISTS idx_tiddlers_bag_id ON tiddlers(bag_id)
		`, `
			CREATE INDEX IF NOT EXISTS idx_fields_tiddler_id ON fields(tiddler_id)
		`, `
			CREATE INDEX IF NOT EXISTS idx_recipe_bags_recipe_id ON recipe_bags(recipe_id)
		`, `
			CREATE INDEX IF NOT EXISTS idx_acl_entity_id ON acl(entity_name)
		`];
		await statements.reduce((n, e) => n.then(async () => {
			await this.engine.$executeRawUnsafe(e)
		}), Promise.resolve())
	}

	async listBags() {
		return await this.engine.bags.findMany({
			select: {
				bag_id: true,
				bag_name: true,
				description: true,
				accesscontrol: true,
			},
			orderBy: {
				bag_name: "asc"
			}
		});
		// const rows = this.engine.runStatementGetAll(`
		// 	SELECT bag_name, bag_id, accesscontrol, description
		// 	FROM bags
		// 	ORDER BY bag_name
		// `);
	}
	/**
	Create or update a bag
	Returns the bag_id of the bag
	*/
	async createBag(
		bag_name: PrismaField<"bags", "bag_name">,
		description: PrismaField<"bags", "description">,
		accesscontrol: PrismaField<"bags", "accesscontrol">
	) {

		// if we're allowing this then the field should just allow null
		// accesscontrol = accesscontrol || "";
		this.okBagName(bag_name);
		return await this.engine.bags.upsert({
			where: { bag_name },
			update: { accesscontrol, description },
			create: { bag_name, accesscontrol, description },
			select: { bag_id: true }
		});
		// // Run the queries
		// var bag = this.engine.runStatement(`
		// 	INSERT OR IGNORE INTO bags (bag_name, accesscontrol, description)
		// 	VALUES ($bag_name, '', '')
		// `, {
		// 	$bag_name: bag_name
		// });
		// const updateBags = this.engine.runStatementGet(`
		// 	UPDATE bags
		// 	SET accesscontrol = ${accesscontrol},
		// 	description = ${description} 
		// 	WHERE bag_name = ${bag_name}
		// 	RETURNING bag_id
		// `, {
		// 	$bag_name: bag_name,
		// 	$accesscontrol: accesscontrol,
		// 	$description: description
		// });
		// return updateBags.lastInsertRowid;
	}
	/**
	Returns array of {recipe_name:,recipe_id:,description:,bag_names: []}
	*/
	async listRecipes() {
		return await this.engine.recipes.findMany({
			select: {
				recipe_name: true,
				recipe_id: true,
				description: true,
				owner_id: true,
				recipe_bags: { select: { bag: { select: { bag_name: true } } } }
			},
			orderBy: {
				recipe_name: "asc"
			}
		}).then(recipes => recipes.map(recipe => ({
			...recipe,
			recipe_bags: undefined,
			bag_names: recipe.recipe_bags.map(e => e.bag.bag_name)
		})));

		// const rows = this.engine.runStatementGetAll(`
		// 	SELECT r.recipe_name, r.recipe_id, r.description, r.owner_id, b.bag_name, rb.position
		// 	FROM recipes AS r
		// 	JOIN recipe_bags AS rb ON rb.recipe_id = r.recipe_id
		// 	JOIN bags AS b ON rb.bag_id = b.bag_id
		// 	ORDER BY r.recipe_name, rb.position
		// `);
		// const results = [];
		// let currentRecipeName = null, currentRecipeIndex = -1;
		// for (const row of rows) {
		// 	if (row.recipe_name !== currentRecipeName) {
		// 		currentRecipeName = row.recipe_name;
		// 		currentRecipeIndex += 1;
		// 		results.push({
		// 			recipe_name: row.recipe_name,
		// 			recipe_id: row.recipe_id,
		// 			description: row.description,
		// 			owner_id: row.owner_id,
		// 			bag_names: []
		// 		});
		// 	}
		// 	results[currentRecipeIndex].bag_names.push(row.bag_name);
		// }
		// return results;
	}
	/**
	Create or update a recipe
	Returns the recipe_id of the new recipe record
	*/
	async createRecipe(
		recipe_name: PrismaField<"recipes", "recipe_name">,
		bag_names: PrismaField<"bags", "bag_name">[],
		description: PrismaField<"recipes", "description">
	) {
		const oldRecipe = await this.engine.recipes.findUnique({
			where: { recipe_name }
		});
		await this.engine.recipes.deleteMany({
			where: { recipe_name }
		});

		return await this.engine.recipes.create({
			data: {
				recipe_name,
				description,
				owner_id: oldRecipe?.owner_id,
				recipe_bags: {
					create: bag_names.map((bag_name, index) => ({
						position: index,
						bag: { connect: { bag_name } }
					}))
				}
			},
			select: {
				recipe_id: true
			}
		});

		// // Run the queries
		// this.engine.runStatement(`
		// 	-- Delete existing recipe_bags entries for this recipe
		// 	DELETE FROM recipe_bags WHERE recipe_id = (SELECT recipe_id FROM recipes WHERE recipe_name = $recipe_name)
		// `, {
		// 	$recipe_name: recipe_name
		// });
		// const updateRecipes = this.engine.runStatement(`
		// 	-- Create the entry in the recipes table if required
		// 	INSERT OR REPLACE INTO recipes (recipe_name, description)
		// 	VALUES ($recipe_name, $description)
		// `, {
		// 	$recipe_name: recipe_name,
		// 	$description: description
		// });
		// this.engine.runStatement(`
		// 	INSERT INTO recipe_bags (recipe_id, bag_id, position)
		// 	SELECT r.recipe_id, b.bag_id, j.key as position
		// 	FROM recipes r
		// 	JOIN bags b
		// 	INNER JOIN json_each($bag_names) AS j ON j.value = b.bag_name
		// 	WHERE r.recipe_name = $recipe_name
		// `, {
		// 	$recipe_name: recipe_name,
		// 	$bag_names: JSON.stringify(bag_names)
		// });

		// return updateRecipes.lastInsertRowid;
	}
	/**
	Assign a recipe to a user
	*/
	async assignRecipeToUser(
		recipe_name: PrismaField<"recipes", "recipe_name">,
		user_id: PrismaField<"users", "user_id">
	) {
		return await this.engine.recipes.update({
			where: { recipe_name },
			data: { owner_id: user_id }
		});
		// this.engine.runStatement(`
		// 	UPDATE recipes SET owner_id = $user_id WHERE recipe_name = $recipe_name
		// `, {
		// 	$recipe_name: recipe_name,
		// 	$user_id: user_id
		// });
	}
	/**
	Returns {tiddler_id:}
	*/
	async saveBagTiddler(
		tiddlerFields: TiddlerFields,
		bag_name: PrismaField<"bags", "bag_name">,
		attachment_blob: PrismaField<"tiddlers", "attachment_blob">
	) {

		const oldTiddler = await this.engine.tiddlers.findFirst({
			where: {
				bag: { bag_name },
				title: tiddlerFields.title
			}
		});
		if (oldTiddler?.tiddler_id)
			await this.engine.tiddlers.delete({
				where: { tiddler_id: oldTiddler.tiddler_id, }
			});
		const encodeTiddlerFields = ([field_name, field_value]: [string, any]) => {
			if (typeof field_value === "number") field_value = field_value.toString();
			if (typeof field_value === "undefined" || field_value === null) field_value = "";
			return [field_name, field_value];
		}

		return await this.engine.tiddlers.create({
			data: {
				bag: { connect: { bag_name } },
				title: tiddlerFields.title,
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
	Returns {tiddler_id:,bag_name:} or null if the recipe is empty
	*/
	async saveRecipeTiddler(
		tiddlerFields: TiddlerFields,
		recipe_name: PrismaField<"recipes", "recipe_name">,
		attachment_blob: PrismaField<"tiddlers", "attachment_blob">
	) {

		const recipe = await this.engine.recipes.findUnique({
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
		var { tiddler_id } = await this.saveBagTiddler(tiddlerFields, bag_name, attachment_blob);

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
	Returns {tiddler_id:} of the delete marker
	*/
	async deleteTiddler(
		title: PrismaField<"tiddlers", "title">,
		bag_name: PrismaField<"bags", "bag_name">
	) {
		await this.engine.tiddlers.deleteMany({
			where: { title, bag: { bag_name } },
		});
		const { tiddler_id } = await this.engine.tiddlers.create({
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
	/**
	returns {tiddler_id:,tiddler:,attachment_blob:}
	*/
	async getBagTiddler(
		title: PrismaField<"tiddlers", "title">,
		bag_name: PrismaField<"bags", "bag_name">,
	) {

		const tiddler = await this.engine.tiddlers.findFirst({
			where: {
				title,
				bag: { bag_name },
				is_deleted: false
			},
			include: {
				fields: true
			}
		});

		if (!tiddler) return null;

		return {
			bag_name,
			tiddler_id: tiddler.tiddler_id,
			attachment_blob: tiddler.attachment_blob,
			tiddler: Object.fromEntries([
				...tiddler.fields.map(e => [e.field_name, e.field_value] as const),
				["title", title]
			])
		}


		// 	const rowTiddler = this.engine.runStatementGet(`
		// 	SELECT t.tiddler_id, t.attachment_blob
		// 	FROM bags AS b
		// 	INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
		// 	WHERE t.title = $title AND b.bag_name = $bag_name AND t.is_deleted = FALSE
		// `, {
		// 		$title: title,
		// 		$bag_name: bag_name
		// 	});
		// 	if (!rowTiddler) {
		// 		return null;
		// 	}
		// 	const rows = this.engine.runStatementGetAll(`
		// 	SELECT field_name, field_value, tiddler_id
		// 	FROM fields
		// 	WHERE tiddler_id = $tiddler_id
		// `, {
		// 		$tiddler_id: rowTiddler.tiddler_id
		// 	});
		// 	if (rows.length === 0) {
		// 		return null;
		// 	} else {
		// 		return {
		// 			tiddler_id: rows[0].tiddler_id,
		// 			attachment_blob: rowTiddler.attachment_blob,
		// 			tiddler: rows.reduce((accumulator, value) => {
		// 				accumulator[value["field_name"]] = value.field_value;
		// 				return accumulator;
		// 			}, { title: title })
		// 		};
		// 	}
	}
	/**
	Returns {bag_name:, tiddler: {fields}, tiddler_id:, attachment_blob:}
	*/
	async getRecipeTiddler(
		title: PrismaField<"tiddlers", "title">,
		recipe_name: PrismaField<"recipes", "recipe_name">,
		select?: {
			attachment_blob?: boolean,
			/** title is always included regardless */
			fields?: boolean
		}
	): Promise<{
		bag_name: PrismaField<"bags", "bag_name">,
		tiddler: TiddlerFields,
		tiddler_id: PrismaField<"tiddlers", "tiddler_id">,
		attachment_blob: PrismaField<"tiddlers", "attachment_blob"> | null | undefined
	} | null> {
		// there is very little reason to optimize this by calling getBagTiddler.
		// having it all in one query may allow prisma or sqlite to optimize it better
		const recipe = await this.engine.recipes.findUnique({
			// select all recipe fields as well as the following joins
			include: {
				recipe_bags: {
					// select the recipe_bags join table for this recipe
					select: {
						bag: {
							// select the bag row for this recipe_bag (a single row)
							select: {
								bag_name: true,
								tiddlers: {
									// select the tiddlers in the bag
									select: {
										tiddler_id: true,
										attachment_blob: select?.attachment_blob,
										bag: { select: { bag_name: true } },
										fields: select?.fields,
									},
									// where the tiddler is not deleted and has this title
									where: { is_deleted: false, title, }
								}
							}
						}
					},
					// where the bag contains this tiddler NOT DELETED
					where: { bag: { tiddlers: { some: { title, is_deleted: false } } } },
					// order by the bag position in the recipe
					orderBy: { position: "desc" },
					// only get the top most bag (that contains this tiddler)
					take: 1,
				}
			},
			// where this recipe_name is the recipe_name
			where: { recipe_name }
		});

		const tiddler = recipe?.recipe_bags[0]?.bag.tiddlers[0];
		if (!tiddler) return null;

		return {
			bag_name: tiddler.bag.bag_name,
			tiddler_id: tiddler.tiddler_id,
			attachment_blob: tiddler.attachment_blob,
			tiddler: Object.fromEntries([
				...tiddler.fields?.map(e => [e.field_name, e.field_value] as const) ?? [],
				["title", title]
			])
		};

		// 	const rowTiddlerId = this.engine.runStatementGet(`	
		// 	SELECT t.tiddler_id, t.attachment_blob, b.bag_name
		// 	FROM bags AS b
		// 	INNER JOIN recipe_bags AS rb ON b.bag_id = rb.bag_id
		// 	INNER JOIN recipes AS r ON rb.recipe_id = r.recipe_id
		// 	INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
		// 	WHERE r.recipe_name = $recipe_name
		// 	AND t.title = $title
		// 	AND t.is_deleted = FALSE
		// 	ORDER BY rb.position DESC
		// 	LIMIT 1
		// `, {
		// 		$title: title,
		// 		$recipe_name: recipe_name
		// 	});
		// 	if (!rowTiddlerId) {
		// 		return null;
		// 	}
		// 	// Get the fields
		// 	const rows = this.engine.runStatementGetAll(`
		// 	SELECT field_name, field_value
		// 	FROM fields
		// 	WHERE tiddler_id = $tiddler_id
		// `, {
		// 		$tiddler_id: rowTiddlerId.tiddler_id
		// 	});
		// 	return {
		// 		bag_name: rowTiddlerId.bag_name,
		// 		tiddler_id: rowTiddlerId.tiddler_id,
		// 		attachment_blob: rowTiddlerId.attachment_blob,
		// 		tiddler: rows.reduce((accumulator, value) => {
		// 			accumulator[value["field_name"]] = value.field_value;
		// 			return accumulator;
		// 		}, { title: title })
		// 	};
	}
	/**
	Checks if a user has permission to access a recipe
	*/
	async hasRecipePermission(
		userId: PrismaField<"users", "user_id">,
		recipeName: PrismaField<"recipes", "recipe_name">,
		permissionName: ACLPermissionName
	) {
		const recipe = await this.engine.recipes.findUnique({
			where: { recipe_name: recipeName },
			select: { owner_id: true },
		});

		if (!recipe?.owner_id) return true;

		return this.checkACLPermission(
			userId, "recipe", recipeName, permissionName,
			asPrismaField("users", "user_id", recipe.owner_id)
		);

		// try {
		// 	// check if the user is the owner of the entity
		// 	const recipe = this.engine.runStatementGet(`
		// 	SELECT owner_id 
		// 	FROM recipes 
		// 	WHERE recipe_name = $recipe_name
		// 	`, {
		// 		$recipe_name: recipeName
		// 	});

		// 	if (!!recipe?.owner_id && recipe?.owner_id === userId) {
		// 		return true;
		// 	} else {
		// 		var permission = this.checkACLPermission(userId, "recipe", recipeName, permissionName, recipe?.owner_id);
		// 		return permission;
		// 	}

		// } catch (error) {
		// 	console.error(error);
		// 	return false;
		// }
	}
	/**
	Checks if a user has permission to access a bag
	*/
	async hasBagPermission(
		userId: PrismaField<"users", "user_id">,
		bagName: PrismaField<"bags", "bag_name">,
		permissionName: ACLPermissionName
	) {
		return this.checkACLPermission(userId, "bag", bagName, permissionName, undefined);
	}
	async getACLByName<T extends EntityType>(
		entityType: T,
		entityName: EntityName<T>,
		permission_name: PrismaField<"permissions", "permission_name"> | undefined,
		fetchAll: boolean
	) {
		this.okEntityType(entityType);
		// TODO, make sure permission_name can be null to return all permissions
		// First, check if there's an ACL record for the entity and get the permission_id
		return await this.engine.acl.findMany({
			where: {
				entity_name: entityName,
				entity_type: entityType,
				permission: { permission_name }
			},
			include: {
				permission: true,
				role: true
			},
			take: fetchAll ? undefined : 1
		});
		throw new Error("Method not implemented.");

		// 	// First, check if there's an ACL record for the entity and get the permission_id
		// 	var checkACLExistsQuery = `
		// 	SELECT acl.*, permissions.permission_name
		// 	FROM acl
		// 	LEFT JOIN permissions ON acl.permission_id = permissions.permission_id
		// 	WHERE acl.entity_type = $entity_type
		// 	AND acl.entity_name = $entity_name
		// `;

		// 	if (!fetchAll) {
		// 		checkACLExistsQuery += ' LIMIT 1';
		// 	}

		// 	const aclRecord = this.engine[fetchAll ? 'runStatementGetAll' : 'runStatementGet'](checkACLExistsQuery, {
		// 		$entity_type: entityType,
		// 		$entity_name: entityName
		// 	});

		// 	return aclRecord;
	}
	async checkACLPermission<T extends EntityType>(
		user_id: PrismaField<"users", "user_id">,
		entity_type: T,
		entity_name: EntityName<T>,
		permission_name: ACLPermissionName,
		ownerId: PrismaField<"users", "user_id"> | undefined
	) {
		this.okEntityType(entity_type);
		this.okEntityName(entity_name);

		// if the entityName starts with "$:/", we'll assume its a system bag/recipe, then grant the user permission
		if (entity_name.startsWith("$:/")) { return true; }

		// First, check if there's an ACL record for the entity and get the permission_id
		const aclRecords = await this.engine.acl.findMany({
			select: { permission: { select: { permission_name: true } } },
			where: { entity_name, entity_type },
		});
		const aclRecordForPermission = aclRecords.some(record =>
			record.permission?.permission_name === permission_name
		);
		// TODO: ENTITY OWNER PERMISSIONS
		// if the entity is site-level (no owner), and no acl record exists for it, return true (allow by default)
		if (!aclRecordForPermission && !ownerId && aclRecords.length === 0) return true;
		// if the entity is owner level, and this is the owner, return true
		// I don't understand why we're checking for an acl. If the owner is the user, they should have access.
		// this will deny the owner access until they setup an acl record for any user
		if (aclRecordForPermission && ownerId && ownerId === user_id) return true;

		// If ACL record exists, check for permission -> role -> user
		return !!await this.engine.acl.count({
			where: {
				entity_name: entity_name,
				entity_type: entity_type,
				permission: { permission_name },
				role: { users: { some: { user_id } } }
			},
			take: 1,
		});

		// const checkPermissionQuery = `
		// 	SELECT *
		// 	FROM users u
		// 	JOIN user_roles ur ON u.user_id = ur.user_id
		// 	JOIN roles r ON ur.role_id = r.role_id
		// 	JOIN acl a ON r.role_id = a.role_id
		// 	WHERE u.user_id = $user_id
		// 	AND a.entity_type = $entity_type
		// 	AND a.entity_name = $entity_name
		// 	AND a.permission_id = $permission_id
		// 	LIMIT 1
		// `;

		// const result = this.engine.runStatementGet(checkPermissionQuery, {
		// 	$user_id: user_id,
		// 	$entity_type: entity_type,
		// 	$entity_name: entity_name,
		// 	$permission_id: aclRecord?.permission_id
		// });

		// let hasPermission = result !== undefined;

		// return hasPermission;

	}
	/**
	 * Returns the ACL records for an entity (bag or recipe)
	 */
	async getEntityAclRecords<T extends EntityType>(
		entity_type: T,
		entity_name: EntityName<T>
	) {
		return await this.engine.acl.findMany({
			where: { entity_name, entity_type },
			include: { role: true, permission: true }
		});
		// 	const checkACLExistsQuery = `
		// 	SELECT *
		// 	FROM acl
		// 	WHERE entity_name = $entity_name
		// `;

		// 	const aclRecords = this.engine.runStatementGetAll(checkACLExistsQuery, {
		// 		$entity_name: entityName
		// 	});

		// 	return aclRecords;
	}
	/**
	Get the entity by name
	*/
	async getEntityByName<T extends EntityType>(
		entity_type: T,
		entity_name: EntityName<T>
	) {

		switch (entity_type) {
			case "bag": return { entity_type: "bag" as const, value: await this.engine.bags.findUnique({ where: { bag_name: entity_name } }) };
			case "recipe": return { entity_type: "recipe" as const, value: await this.engine.recipes.findUnique({ where: { recipe_name: entity_name } }) };
			default: throw new Error("Invalid entity type: " + entity_type);
		}

		// const entityInfo = this.entityTypeToTableMap[entityType];
		// if (entityInfo) {
		// 	return this.engine.runStatementGet(`SELECT * FROM ${entityInfo.table} WHERE ${entityInfo.column} = $entity_name`, {
		// 		$entity_name: entityName
		// 	});
		// }
		// return null;
	}
	/**
	Get the titles of the tiddlers in a bag. Returns an empty array for bags that do not exist
	*/
	async getBagTiddlers(bag_name: PrismaField<"bags", "bag_name">) {
		return this.engine.tiddlers.findMany({
			where: { bag: { bag_name }, is_deleted: false },
			select: { title: true, tiddler_id: true },
			orderBy: { title: "asc" }
		});
		//  Distinct is useless because both bag+title and tiddler_id already have unique indexes.
		// 	const rows = this.engine.runStatementGetAll(`
		// 	SELECT DISTINCT title, tiddler_id
		// 	FROM tiddlers
		// 	WHERE bag_id IN (
		// 		SELECT bag_id
		// 		FROM bags
		// 		WHERE bag_name = $bag_name
		// 	)
		// 	AND tiddlers.is_deleted = FALSE
		// 	ORDER BY title ASC
		// `, {
		// 		$bag_name: bag_name
		// 	});
		// 	return rows;
	}
	/**
	Get the tiddler_id of the newest tiddler in a bag. 
	Returns null for bags that do not exist or are empty.
	Includes deleted tiddlers that still have a record.
	*/
	async getBagLastTiddlerId(bag_name: PrismaField<"bags", "bag_name">) {

		return (await this.engine.tiddlers.aggregate({
			where: { bag: { bag_name } },
			_max: { tiddler_id: true },
		}))._max.tiddler_id;

		// 	const row = this.engine.runStatementGet(`
		// 	SELECT tiddler_id
		// 	FROM tiddlers
		// 	WHERE bag_id IN (
		// 		SELECT bag_id
		// 		FROM bags
		// 		WHERE bag_name = $bag_name
		// 	)
		// 	ORDER BY tiddler_id DESC
		// 	LIMIT 1
		// `, {
		// 		$bag_name: bag_name
		// 	});
		// 	if (row) {
		// 		return row.tiddler_id;
		// 	} else {
		// 		return null;
		// 	}
	}
	/**
	Get the metadata of the tiddlers in a recipe as an array [{title:,tiddler_id:,bag_name:,is_deleted:}],
	sorted in ascending order of tiddler_id.
	 
	Options include:
	 
	limit: optional maximum number of results to return
	last_known_tiddler_id: tiddler_id of the last known update. Only returns tiddlers that have been created, modified or deleted since
	include_deleted: boolean, defaults to false
	 
	Returns null for recipes that do not exist

	TODO: 
	I think there is a problem here if a tiddler is updated in a lower bag after being updated in an upper bag.
	There is also the problem that deleted tiddlers will hide the undeleted version below them, although that is probably intended.
	
	*/
	async getRecipeTiddlers(
		recipe_name: PrismaField<"recipes", "recipe_name">,
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
		const bags = await this.engine.recipe_bags.findMany({
			where: { recipe: { recipe_name } },
			select: {
				position: true,
				bag: {
					select: {
						bag_name: true,
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
			bag_name: e.bag.bag_name,
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
	/**
	Get the tiddler_id of the newest tiddler in a recipe. Returns null for recipes that do not exist
	*/
	async getRecipeLastTiddlerId(
		recipe_name: PrismaField<"recipes", "recipe_name">
	) {
		return (await this.engine.tiddlers.aggregate({
			_max: { tiddler_id: true },
			where: { bag: { recipe_bags: { some: { recipe: { recipe_name } } } } }
		}))._max.tiddler_id;
		// 	const row = this.engine.runStatementGet(`
		// 	SELECT t.title, t.tiddler_id, b.bag_name, MAX(rb.position) AS position
		// 	FROM bags AS b
		// 	INNER JOIN recipe_bags AS rb ON b.bag_id = rb.bag_id
		// 	INNER JOIN recipes AS r ON rb.recipe_id = r.recipe_id
		// 	INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
		// 	WHERE r.recipe_name = $recipe_name
		// 	GROUP BY t.title
		// 	ORDER BY t.tiddler_id DESC
		// 	LIMIT 1
		// `, {
		// 		$recipe_name: recipe_name
		// 	});
		// 	if (row) {
		// 		return row.tiddler_id;
		// 	} else {
		// 		return null;
		// 	}
	}
	/** 
	 * Creates new tiddler_ids for all deleted bags.
	 * 
	 * TODO: This is a very expensive operation. Make sure it isn't immediately followed by deleting the bag.
	 */
	async deleteAllTiddlersInBag(
		bag_name: PrismaField<"bags", "bag_name">
	) {

		const bagTitles = await this.engine.bags.findUnique({
			where: { bag_name },
			select: {
				bag_id: true,
				tiddlers: { select: { title: true } }
			},
		});
		if (!bagTitles) return;
		await this.engine.tiddlers.deleteMany({
			where: { bag: { bag_name } }
		});
		await this.engine.tiddlers.createMany({
			data: bagTitles.tiddlers.map(e => ({
				title: e.title,
				bag_id: bagTitles.bag_id,
				is_deleted: true,
				attachment_blob: null
			}))
		});

		// 	// Delete the fields
		// 	this.engine.runStatement(`
		// 	DELETE FROM fields
		// 	WHERE tiddler_id IN (
		// 		SELECT tiddler_id
		// 		FROM tiddlers
		// 		WHERE bag_id = (SELECT bag_id FROM bags WHERE bag_name = $bag_name)
		// 		AND is_deleted = FALSE
		// 	)
		// `, {
		// 		$bag_name: bag_name
		// 	});
		// 	// Mark the tiddlers as deleted
		// 	this.engine.runStatement(`
		// 	UPDATE tiddlers
		// 	SET is_deleted = TRUE
		// 	WHERE bag_id = (SELECT bag_id FROM bags WHERE bag_name = $bag_name)
		// 	AND is_deleted = FALSE
		// `, {
		// 		$bag_name: bag_name
		// 	});
	}
	/**
	Get the names of the bags in a recipe. Returns an empty array for recipes that do not exist
	*/
	async getRecipeBags(
		recipe_name: PrismaField<"recipes", "recipe_name">
	) {

		return await this.engine.recipe_bags.findMany({
			where: { recipe: { recipe_name } },
			select: { bag: { select: { bag_name: true } } },
			orderBy: { position: "asc" }
		}).then(e => e.map(e => e.bag.bag_name));

		// 	const rows = await this.engine.runStatementGetAll(`
		// 	SELECT bags.bag_name
		// 	FROM bags
		// 	JOIN (
		// 		SELECT rb.bag_id, rb.position as position
		// 		FROM recipe_bags AS rb
		// 		JOIN recipes AS r ON rb.recipe_id = r.recipe_id
		// 		WHERE r.recipe_name = $recipe_name
		// 		ORDER BY rb.position
		// 	) AS bag_priority ON bags.bag_id = bag_priority.bag_id
		// 	ORDER BY position
		// `, {
		// 		$recipe_name: recipe_name
		// 	});
		// 	return rows.map(value => value.bag_name);
	}
	/**
	Get the attachment value of a bag, if any exist
	*/
	async getBagTiddlerAttachmentBlob(
		title: PrismaField<"tiddlers", "title">,
		bag_name: PrismaField<"bags", "bag_name">
	) {

		const e = await this.engine.tiddlers.findFirst({
			where: { title, bag: { bag_name } },
			select: { attachment_blob: true }
		});
		return e?.attachment_blob ?? null;

		// 	const row = this.engine.runStatementGet(`
		// 	SELECT t.attachment_blob
		// 	FROM bags AS b
		// 	INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
		// 	WHERE t.title = $title AND b.bag_name = $bag_name AND t.is_deleted = FALSE
		// `, {
		// 		$title: title,
		// 		$bag_name: bag_name
		// 	});
		// 	return row ? row.attachment_blob : null;
	}
	/**
	Get the attachment value of a recipe, if any exist
	*/
	async getRecipeTiddlerAttachmentBlob(
		title: PrismaField<"tiddlers", "title">,
		recipe_name: PrismaField<"recipes", "recipe_name">
	) {

		const e = await this.getRecipeTiddler(title, recipe_name, { attachment_blob: true });
		return e?.attachment_blob ?? null;

		// 	const row = this.engine.runStatementGet(`
		// 	SELECT t.attachment_blob
		// 	FROM bags AS b
		// 	INNER JOIN recipe_bags AS rb ON b.bag_id = rb.bag_id
		// 	INNER JOIN recipes AS r ON rb.recipe_id = r.recipe_id
		// 	INNER JOIN tiddlers AS t ON b.bag_id = t.bag_id
		// 	WHERE r.recipe_name = $recipe_name AND t.title = $title AND t.is_deleted = FALSE
		// 	ORDER BY rb.position DESC
		// 	LIMIT 1
		// `, {
		// 		$title: title,
		// 		$recipe_name: recipe_name
		// 	});
		// 	return row ? row.attachment_blob : null;
	}
	// User CRUD operations
	async createUser(
		username: string,
		email: string,
		password: string
	) {
		const e = await this.engine.users.create({
			data: {
				username,
				email,
				password
			}
		});
		return e.user_id;
		// const result = this.engine.runStatement(`
		// 		INSERT INTO users (username, email, password)
		// 		VALUES ($username, $email, $password)
		// `, {
		// 	$username: username,
		// 	$email: email,
		// 	$password: password
		// });
		// return result.lastInsertRowid;
	}
	getUser(userId: PrismaField<"users", "user_id">) {
		return this.engine.users.findUnique({ where: { user_id: userId } });
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM users WHERE user_id = $userId
		// `, {
		// 	$userId: userId
		// });
	}
	getUserByUsername(username: PrismaField<"users", "username">) {
		return this.engine.users.findUnique({ where: { username } });
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM users WHERE username = $username
		// `, {
		// 	$username: username
		// });
	}
	getUserByEmail(email: PrismaField<"users", "email">) {
		return this.engine.users.findUnique({ where: { email } });
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM users WHERE email = $email
		// `, {
		// 	$email: email
		// });
	}
	listUsersByRoleId(role_id: PrismaField<"roles", "role_id">) {
		return this.engine.users.findMany({
			where: { roles: { some: { role_id } } },
			orderBy: { username: "asc" }
		});
		// return this.engine.runStatementGetAll(`
		// 		SELECT u.*
		// 		FROM users u
		// 		JOIN user_roles ur ON u.user_id = ur.user_id
		// 		WHERE ur.role_id = $roleId
		// 		ORDER BY u.username
		// `, {
		// 	$roleId: roleId
		// });
	}
	async updateUser(
		user_id: PrismaField<"users", "user_id">,
		username: PrismaField<"users", "username">,
		email: PrismaField<"users", "email">,
		role_id: PrismaField<"roles", "role_id"> | undefined
	) {
		try {
			const emailExists = await this.engine.users.findFirst({
				where: { email, user_id: { not: user_id } }
			});

			if (emailExists) {
				return { success: false, message: "Email address already in use by another user." };
			}

			await this.engine.users.update({
				where: { user_id: user_id },
				data: {
					username, email,
					roles: role_id ? { set: [{ role_id }] } : undefined
				}
			});

			return { success: true, message: "User profile and role updated successfully." };
		} catch (e) {
			return { success: false, message: "Failed to update user profile: " + (e instanceof Error ? e.message : `${e}`) };
		}

		// 	const existingUser = this.engine.runStatement(`
		// 		SELECT user_id FROM users
		// 		WHERE email = $email AND user_id != $userId
		// `, {
		// 		$email: email,
		// 		$userId: userId
		// 	});

		// 	if (existingUser.length > 0) {
		// 		return {
		// 			success: false,
		// 			message: "Email address already in use by another user."
		// 		};
		// 	}

		// 	try {
		// 		this.engine.transaction(() => {
		// 			// Update user information
		// 			this.engine.runStatement(`
		// 				UPDATE users
		// 				SET username = $username, email = $email
		// 				WHERE user_id = $userId
		// 			`, {
		// 				$userId: userId,
		// 				$username: username,
		// 				$email: email
		// 			});

		// 			if (roleId) {
		// 				// Remove all existing roles for the user
		// 				this.engine.runStatement(`
		// 					DELETE FROM user_roles
		// 					WHERE user_id = $userId
		// 				`, {
		// 					$userId: userId
		// 				});

		// 				// Add the new role
		// 				this.engine.runStatement(`
		// 					INSERT INTO user_roles (user_id, role_id)
		// 					VALUES ($userId, $roleId)
		// 				`, {
		// 					$userId: userId,
		// 					$roleId: roleId
		// 				});
		// 			}
		// 		});

		// 		return {
		// 			success: true,
		// 			message: "User profile and role updated successfully."
		// 		};
		// 	} catch (error) {
		// 		return {
		// 			success: false,
		// 			message: "Failed to update user profile: " + error.message
		// 		};
		// 	}
	}
	async updateUserPassword(
		userId: PrismaField<"users", "user_id">,
		newHash: string
	) {
		return await this.engine.users.update({
			where: { user_id: userId },
			data: { password: newHash }
		}).then(() => ({
			success: true,
			message: "Password updated successfully."
		})).catch(e => ({
			success: false,
			message: "Failed to update password: " + (e instanceof Error ? e.message : `${e}`)
		}));
		// try {
		// 	this.engine.runStatement(`
		// 			UPDATE users
		// 			SET password = $newHash
		// 			WHERE user_id = $userId
		// 	`, {
		// 		$userId: userId,
		// 		$newHash: newHash,
		// 	});

		// 	return {
		// 		success: true,
		// 		message: "Password updated successfully."
		// 	};
		// } catch (error) {
		// 	return {
		// 		success: false,
		// 		message: "Failed to update password: " + error.message
		// 	};
		// }
	}
	deleteUser(userId: PrismaField<"users", "user_id">) {
		return this.engine.users.delete({ where: { user_id: userId } });
		// this.engine.runStatement(`
		// 		DELETE FROM users WHERE user_id = $userId
		// `, {
		// 	$userId: userId
		// });
	}
	listUsers() {
		return this.engine.users.findMany({ orderBy: { username: "asc" } });
		// return this.engine.runStatementGetAll(`
		// 		SELECT * FROM users ORDER BY username
		// `);
	}
	async createOrUpdateUserSession(
		userId: PrismaField<"users", "user_id">,
		sessionId: PrismaField<"sessions", "session_id">
	) {
		const currentTimestamp = new Date().toISOString();
		return await this.engine.sessions.upsert({
			where: { user_id: userId, session_id: sessionId },
			create: {
				user_id: userId,
				session_id: sessionId,
				created_at: currentTimestamp,
				last_accessed: currentTimestamp,
			},
			update: {
				session_id: sessionId,
				last_accessed: currentTimestamp
			},
			select: { session_id: true }
		}).then(e => e.session_id);

		// const currentTimestamp = new Date().toISOString();

		// // First, try to update an existing session
		// const updateResult = this.engine.runStatement(`
		// 		UPDATE sessions
		// 		SET session_id = $sessionId, last_accessed = $timestamp
		// 		WHERE user_id = $userId
		// `, {
		// 	$userId: userId,
		// 	$sessionId: sessionId,
		// 	$timestamp: currentTimestamp
		// });

		// // If no existing session was updated, create a new one
		// if (updateResult.changes === 0) {
		// 	this.engine.runStatement(`
		// 				INSERT INTO sessions (user_id, session_id, created_at, last_accessed)
		// 				VALUES ($userId, $sessionId, $timestamp, $timestamp)
		// 		`, {
		// 		$userId: userId,
		// 		$sessionId: sessionId,
		// 		$timestamp: currentTimestamp
		// 	});
		// }

		// return sessionId;
	}
	async createUserSession(
		userId: PrismaField<"users", "user_id">,
		sessionId: PrismaField<"sessions", "session_id">
	) {
		const currentTimestamp = new Date().toISOString();
		return await this.engine.sessions.create({
			data: {
				user_id: userId,
				session_id: sessionId,
				created_at: currentTimestamp,
				last_accessed: currentTimestamp,
			}
		}).then(e => e.session_id);
		// const currentTimestamp = new Date().toISOString();
		// this.engine.runStatement(`
		// 		INSERT INTO sessions (user_id, session_id, created_at, last_accessed)
		// 		VALUES ($userId, $sessionId, $timestamp, $timestamp)
		// `, {
		// 	$userId: userId,
		// 	$sessionId: sessionId,
		// 	$timestamp: currentTimestamp
		// });

		// return sessionId;
	}
	async findUserBySessionId(
		session_id: PrismaField<"sessions", "session_id">
	) {
		// const lastAccessed = new Date(sessionResult.last_accessed);
		const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
		const expires = new Date(Date.now() - expirationTime).toISOString();

		const { count: deleted } = await this.engine.sessions.deleteMany({
			where: { session_id, last_accessed: { lte: expires } }
		});
		if (deleted) return null;

		return await this.engine.sessions.updateManyAndReturn({
			where: { session_id },
			data: { last_accessed: new Date().toISOString() },
			select: { session_id: true, user: true }
		}).then(e => e[0]?.user ?? null);

		// // First, get the user_id from the sessions table
		// const sessionResult = this.engine.runStatementGet(`
		// 		SELECT user_id, last_accessed
		// 		FROM sessions
		// 		WHERE session_id = $sessionId
		// `, {
		// 	$sessionId: sessionId
		// });

		// if (!sessionResult) {
		// 	return null; // Session not found
		// }


		// if (new Date() - lastAccessed > expirationTime) {
		// 	// Session has expired
		// 	this.deleteSession(sessionId);
		// 	return null;
		// }

		// // Update the last_accessed timestamp
		// const currentTimestamp = new Date().toISOString();
		// this.engine.runStatement(`
		// 		UPDATE sessions
		// 		SET last_accessed = $timestamp
		// 		WHERE session_id = $sessionId
		// `, {
		// 	$sessionId: sessionId,
		// 	$timestamp: currentTimestamp
		// });

		// const userResult = this.engine.runStatementGet(`
		// 		SELECT *
		// 		FROM users
		// 		WHERE user_id = $userId
		// `, {
		// 	$userId: sessionResult.user_id
		// });

		// if (!userResult) {
		// 	return null;
		// }

		// return userResult;
	}
	deleteSession(sessionId: PrismaField<"sessions", "session_id">) {
		return this.engine.sessions.delete({ where: { session_id: sessionId } });
		// this.engine.runStatement(`
		// 		DELETE FROM sessions
		// 		WHERE session_id = $sessionId
		// `, {
		// 	$sessionId: sessionId
		// });
	}
	deleteUserSessions(userId: PrismaField<"users", "user_id">) {
		return this.engine.sessions.deleteMany({ where: { user_id: userId } });
		// this.engine.runStatement(`
		// 		DELETE FROM sessions
		// 		WHERE user_id = $userId
		// `, {
		// 	$userId: userId
		// });
	}
	// Set the user as an admin
	async setUserAdmin(userId: PrismaField<"users", "user_id">) {
		var admin = await this.getRoleByName("ADMIN" as PrismaField<"roles", "role_name">);
		if (admin) { this.addRoleToUser(userId, admin.role_id); }
	}
	// Group CRUD operations
	async createGroup(
		group_name: PrismaField<"groups", "group_name">,
		description: PrismaField<"groups", "description">
	) {
		const e = await this.engine.groups.create({
			data: { group_name, description }
		});
		return e.group_id;
		// const result = this.engine.runStatement(`
		// 		INSERT INTO groups (group_name, description)
		// 		VALUES ($groupName, $description)
		// `, {
		// 	$groupName: groupName,
		// 	$description: description
		// });
		// return result.lastInsertRowid;
	}
	getGroup(groupId: PrismaField<"groups", "group_id">) {
		return this.engine.groups.findUnique({
			where: { group_id: groupId }
		});
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM groups WHERE group_id = $groupId
		// `, {
		// 	$groupId: groupId
		// });
	}
	updateGroup(
		groupId: PrismaField<"groups", "group_id">,
		groupName: PrismaField<"groups", "group_name">,
		description: PrismaField<"groups", "description">
	) {
		return this.engine.groups.update({
			where: { group_id: groupId },
			data: { group_name: groupName, description }
		});
		// this.engine.runStatement(`
		// 		UPDATE groups
		// 		SET group_name = $groupName, description = $description
		// 		WHERE group_id = $groupId
		// `, {
		// 	$groupId: groupId,
		// 	$groupName: groupName,
		// 	$description: description
		// });
	}
	deleteGroup(groupId: PrismaField<"groups", "group_id">) {
		return this.engine.groups.delete({ where: { group_id: groupId } });
		// this.engine.runStatement(`
		// 		DELETE FROM groups WHERE group_id = $groupId
		// `, {
		// 	$groupId: groupId
		// });
	}
	listGroups() {
		return this.engine.groups.findMany({ orderBy: { group_name: "asc" } });
		// return this.engine.runStatementGetAll(`
		// 		SELECT * FROM groups ORDER BY group_name
		// `);
	}
	// Role CRUD operations
	async createRole(
		roleName: PrismaField<"roles", "role_name">,
		description: PrismaField<"roles", "description">
	) {
		const e = await this.engine.roles.create({
			data: { role_name: roleName, description }
		});
		return e.role_id;
		// const result = this.engine.runStatement(`
		// 		INSERT OR IGNORE INTO roles (role_name, description)
		// 		VALUES ($roleName, $description)
		// `, {
		// 	$roleName: roleName,
		// 	$description: description
		// });
		// return result.lastInsertRowid;
	}
	getRole(roleId: PrismaField<"roles", "role_id">) {
		return this.engine.roles.findUnique({
			where: { role_id: roleId }
		});
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM roles WHERE role_id = $roleId
		// `, {
		// 	$roleId: roleId
		// });
	}
	getRoleByName(roleName: PrismaField<"roles", "role_name">) {
		return this.engine.roles.findUnique({
			where: { role_name: roleName }
		});
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM roles WHERE role_name = $roleName
		// `, {
		// 	$roleName: roleName
		// });
	}
	updateRole(
		roleId: PrismaField<"roles", "role_id">,
		roleName: PrismaField<"roles", "role_name">,
		description: PrismaField<"roles", "description">
	) {
		return this.engine.roles.update({
			where: { role_id: roleId },
			data: { role_name: roleName, description }
		});
		// this.engine.runStatement(`
		// 		UPDATE roles
		// 		SET role_name = $roleName, description = $description
		// 		WHERE role_id = $roleId
		// `, {
		// 	$roleId: roleId,
		// 	$roleName: roleName,
		// 	$description: description
		// });
	}
	deleteRole(roleId: PrismaField<"roles", "role_id">) {
		return this.engine.roles.delete({ where: { role_id: roleId } });
		// this.engine.runStatement(`
		// 		DELETE FROM roles WHERE role_id = $roleId
		// `, {
		// 	$roleId: roleId
		// });
	}
	listRoles() {
		return this.engine.roles.findMany({ orderBy: { role_name: "asc" } });
		// return this.engine.runStatementGetAll(`
		// 		SELECT * FROM roles ORDER BY role_name DESC
		// `);
	}
	// Permission CRUD operations
	async createPermission(
		permissionName: PrismaField<"permissions", "permission_name">,
		description: PrismaField<"permissions", "description">
	) {
		const e = await this.engine.permissions.create({
			data: { permission_name: permissionName, description },
		});
		return e.permission_id;
		// const result = this.engine.runStatement(`
		// 	INSERT OR IGNORE INTO permissions (permission_name, description)
		// 	VALUES ($permissionName, $description)
		// `, {
		// 	$permissionName: permissionName,
		// 	$description: description
		// });
		// return result.lastInsertRowid;
	}
	getPermission(permissionId: PrismaField<"permissions", "permission_id">) {
		return this.engine.permissions.findUnique({
			where: { permission_id: permissionId }
		});
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM permissions WHERE permission_id = $permissionId
		// `, {
		// 	$permissionId: permissionId
		// });
	}
	getPermissionByName(permissionName: PrismaField<"permissions", "permission_name">) {
		return this.engine.permissions.findUnique({
			where: { permission_name: permissionName }
		});
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM permissions WHERE permission_name = $permissionName
		// `, {
		// 	$permissionName: permissionName
		// });
	}
	updatePermission(
		permissionId: PrismaField<"permissions", "permission_id">,
		permissionName: PrismaField<"permissions", "permission_name">,
		description: PrismaField<"permissions", "description">
	) {
		return this.engine.permissions.update({
			where: { permission_id: permissionId },
			data: { permission_name: permissionName, description }
		});
		// this.engine.runStatement(`
		// 		UPDATE permissions
		// 		SET permission_name = $permissionName, description = $description
		// 		WHERE permission_id = $permissionId
		// `, {
		// 	$permissionId: permissionId,
		// 	$permissionName: permissionName,
		// 	$description: description
		// });
	}
	deletePermission(permissionId: PrismaField<"permissions", "permission_id">) {
		return this.engine.permissions.delete({ where: { permission_id: permissionId } });
		// this.engine.runStatement(`
		// 		DELETE FROM permissions WHERE permission_id = $permissionId
		// `, {
		// 	$permissionId: permissionId
		// });
	}
	listPermissions() {
		return this.engine.permissions.findMany({ orderBy: { permission_name: "asc" } });
		// return this.engine.runStatementGetAll(`
		// 		SELECT * FROM permissions ORDER BY permission_name
		// `);
	}
	// ACL CRUD operations
	createACL<T extends EntityType>(
		entityType: T,
		entityName: EntityName<T>,
		roleId: PrismaField<"roles", "role_id">,
		permissionId: PrismaField<"permissions", "permission_id">
	) {
		if (entityName.startsWith("$:/")) return;
		return this.engine.acl.create({
			data: {
				entity_name: entityName,
				entity_type: entityType,
				role_id: roleId,
				permission_id: permissionId
			}
		}).then(e => e.acl_id);
		// if (!entityName.startsWith("$:/")) {
		// 	const result = this.engine.runStatement(`
		// 		INSERT OR IGNORE INTO acl (entity_name, entity_type, role_id, permission_id)
		// 		VALUES ($entityName, $entityType, $roleId, $permissionId)
		// 	`,
		// 		{
		// 			$entityName: entityName,
		// 			$entityType: entityType,
		// 			$roleId: roleId,
		// 			$permissionId: permissionId
		// 		});
		// 	return result.lastInsertRowid;
		// }
	}
	getACL(aclId: PrismaField<"acl", "acl_id">) {
		return this.engine.acl.findUnique({
			where: { acl_id: aclId }
		});
		// return this.engine.runStatementGet(`
		// 		SELECT * FROM acl WHERE acl_id = $aclId
		// `, {
		// 	$aclId: aclId
		// });
	}
	updateACL<T extends EntityType>(
		aclId: PrismaField<"acl", "acl_id">,
		entityName: PrismaField<"acl", "entity_name">,
		entityType: T,
		roleId: PrismaField<"acl", "role_id">,
		permissionId: PrismaField<"acl", "permission_id">
	) {
		return this.engine.acl.update({
			where: { acl_id: aclId },
			data: {
				entity_name: entityName,
				entity_type: entityType,
				role_id: roleId,
				permission_id: permissionId
			}
		});
		// this.engine.runStatement(`
		// 		UPDATE acl
		// 		SET entity_name = $entityId, entity_type = $entityType, 
		// 				role_id = $roleId, permission_id = $permissionId
		// 		WHERE acl_id = $aclId
		// `, {
		// 	$aclId: aclId,
		// 	$entityId: entityId,
		// 	$entityType: entityType,
		// 	$roleId: roleId,
		// 	$permissionId: permissionId
		// });
	}
	deleteACL(aclId: PrismaField<"acl", "acl_id">) {
		return this.engine.acl.delete({ where: { acl_id: aclId } });
		// this.engine.runStatement(`
		// 		DELETE FROM acl WHERE acl_id = $aclId
		// `, {
		// 	$aclId: aclId
		// });
	}
	listACLs() {
		return this.engine.acl.findMany();
		// return this.engine.runStatementGetAll(`
		// 		SELECT * FROM acl ORDER BY entity_type, entity_name
		// `);
	}
	// Association management functions
	addUserToGroup(
		userId: PrismaField<"users", "user_id">,
		groupId: PrismaField<"groups", "group_id">
	) {
		return this.engine.users.update({
			where: { user_id: userId },
			data: { groups: { connect: { group_id: groupId } } }
		});
		// this.engine.runStatement(`
		// 		INSERT OR IGNORE INTO user_groups (user_id, group_id)
		// 		VALUES ($userId, $groupId)
		// `, {
		// 	$userId: userId,
		// 	$groupId: groupId
		// });
	}
	async isUserInGroup(
		userId: PrismaField<"users", "user_id">,
		groupId: PrismaField<"groups", "group_id">
	) {
		return await this.engine.users.count({
			where: { user_id: userId, groups: { some: { group_id: groupId } } },
		});

		// const result = this.engine.runStatementGet(`
		// 		SELECT 1 FROM user_groups
		// 		WHERE user_id = $userId AND group_id = $groupId
		// `, {
		// 	$userId: userId,
		// 	$groupId: groupId
		// });
		// return result !== undefined;
	}
	removeUserFromGroup(
		userId: PrismaField<"users", "user_id">,
		groupId: PrismaField<"groups", "group_id">
	) {
		return this.engine.users.update({
			where: { user_id: userId },
			data: { groups: { disconnect: { group_id: groupId } } }
		});
		// this.engine.runStatement(`
		// 		DELETE FROM user_groups
		// 		WHERE user_id = $userId AND group_id = $groupId
		// `, {
		// 	$userId: userId,
		// 	$groupId: groupId
		// });
	}
	addRoleToUser(
		userId: PrismaField<"users", "user_id">,
		roleId: PrismaField<"roles", "role_id">
	) {
		return this.engine.users.update({
			where: { user_id: userId },
			data: { roles: { connect: { role_id: roleId } } }
		});
		// this.engine.runStatement(`
		// 		INSERT OR IGNORE INTO user_roles (user_id, role_id)
		// 		VALUES ($userId, $roleId)
		// `, {
		// 	$userId: userId,
		// 	$roleId: roleId
		// });
	}
	removeRoleFromUser(
		userId: PrismaField<"users", "user_id">,
		roleId: PrismaField<"roles", "role_id">
	) {
		return this.engine.users.update({
			where: { user_id: userId },
			data: { roles: { disconnect: { role_id: roleId } } }
		});
		// this.engine.runStatement(`
		// 		DELETE FROM user_roles
		// 		WHERE user_id = $userId AND role_id = $roleId
		// `, {
		// 	$userId: userId,
		// 	$roleId: roleId
		// });
	}
	addRoleToGroup(
		groupId: PrismaField<"groups", "group_id">,
		roleId: PrismaField<"roles", "role_id">
	) {
		return this.engine.groups.update({
			where: { group_id: groupId },
			data: { roles: { connect: { role_id: roleId } } }
		});
		// this.engine.runStatement(`
		// 		INSERT OR IGNORE INTO group_roles (group_id, role_id)
		// 		VALUES ($groupId, $roleId)
		// `, {
		// 	$groupId: groupId,
		// 	$roleId: roleId
		// });
	}
	removeRoleFromGroup(
		group_id: PrismaField<"groups", "group_id">,
		role_id: PrismaField<"roles", "role_id">
	) {
		return this.engine.groups.update({
			where: { group_id },
			data: { roles: { disconnect: { role_id } } }
		});
		// this.engine.runStatement(`
		// 		DELETE FROM group_roles
		// 		WHERE group_id = $groupId AND role_id = $roleId
		// `, {
		// 	$groupId: groupId,
		// 	$roleId: roleId
		// });
	}
	// this doesn't appear to be used anywhere
	// addPermissionToRole(
	// 	roleId: PrismaField<"roles", "role_id">,
	// 	permissionId: PrismaField<"permissions", "permission_id">
	// ) {
	// 	return this.engine.role_permissions.create({
	// 		data: { role_id: roleId, permission_id: permissionId }
	// 	});
	// 	// this.engine.runStatement(`
	// 	// 		INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
	// 	// 		VALUES ($roleId, $permissionId)
	// 	// `, {
	// 	// 	$roleId: roleId,
	// 	// 	$permissionId: permissionId
	// 	// });
	// }
	// this doesn't appear to be used anywhere
	// removePermissionFromRole(
	// 	roleId: PrismaField<"roles", "role_id">,
	// 	permissionId: PrismaField<"permissions", "permission_id">
	// ) {
	// 	return this.engine.role_permissions.delete({
	// 		where: { role_id_permission_id: { role_id: roleId, permission_id: permissionId } }
	// 	});
	// 	// this.engine.runStatement(`
	// 	// 		DELETE FROM role_permissions
	// 	// 		WHERE role_id = $roleId AND permission_id = $permissionId
	// 	// `, {
	// 	// 	$roleId: roleId,
	// 	// 	$permissionId: permissionId
	// 	// });
	// }
	getUserRoles(user_id: PrismaField<"users", "user_id">) {
		return this.engine.users.findUnique({
			where: { user_id },
			select: { roles: true, }
		});
		// const query = `
		// 		SELECT r.role_id, r.role_name
		// 		FROM user_roles ur
		// 		JOIN roles r ON ur.role_id = r.role_id
		// 		WHERE ur.user_id = $userId
		// 		LIMIT 1
		// `;

		// return this.engine.runStatementGet(query, { $userId: userId });
	}
	deleteUserRolesByRoleId(roleId: PrismaField<"roles", "role_id">) {
		return this.engine.roles.update({
			where: { role_id: roleId },
			data: { users: { set: [] } }
		})
		// this.engine.runStatement(`
		// 		DELETE FROM user_roles
		// 		WHERE role_id = $roleId
		// `, {
		// 	$roleId: roleId
		// });
	}
	deleteUserRolesByUserId(userId: PrismaField<"users", "user_id">) {
		return this.engine.users.update({
			where: { user_id: userId },
			data: { roles: { set: [] } }
		});
		// this.engine.runStatement(`
		// 		DELETE FROM user_roles
		// 		WHERE user_id = $userId
		// `, {
		// 	$userId: userId
		// });
	}
	async isRoleInUse(role_id: PrismaField<"roles", "role_id">) {
		return await this.engine.users.count({ where: { roles: { some: { role_id } } } }).then(e => e > 0)
			|| await this.engine.groups.count({ where: { roles: { some: { role_id } } } }).then(e => e > 0)
			|| await this.engine.acl.count({ where: { role_id } }).then(e => e > 0);

		// // Check if the role is assigned to any users
		// const userRoleCheck = this.engine.runStatementGet(`
		// 	SELECT 1
		// 	FROM user_roles
		// 	WHERE role_id = $roleId
		// 	LIMIT 1
		// `, {
		// 	$roleId: roleId
		// });

		// if (userRoleCheck) {
		// 	return true;
		// }

		// // Check if the role is used in any ACLs
		// const aclRoleCheck = this.engine.runStatementGet(`
		// 	SELECT 1
		// 	FROM acl
		// 	WHERE role_id = $roleId
		// 	LIMIT 1
		// `, {
		// 	$roleId: roleId
		// });

		// if (aclRoleCheck) {
		// 	return true;
		// }

		// // If we've reached this point, the role is not in use
		// return false;
	}
	getRoleById(role_id: PrismaField<"roles", "role_id">) {
		return this.engine.roles.findUnique({ where: { role_id } });
		// const role = this.engine.runStatementGet(`
		// 	SELECT role_id, role_name, description
		// 	FROM roles
		// 	WHERE role_id = $roleId
		// `, {
		// 	$roleId: roleId
		// });
		// return role;
	}
}
















































































exports.SqlTiddlerDatabase = SqlTiddlerDatabase;

