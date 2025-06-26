
import { join, resolve } from "path";
import { Prisma } from "prisma-client";
import * as _fsp from "fs/promises";
import { existsSync } from "fs";
import { v7 as uuidv7 } from "uuid";
import { ServerState } from "../ServerState";
import { createStrictAwaitProxy } from "@tiddlywiki/server";
import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
const fsp = createStrictAwaitProxy(_fsp);

export const info: CommandInfo = {
	name: "load-archive",
	description: "Load a MWS archive into the database",
	arguments: [
		["archivePath", "Path to the archive to load"],
	],
};
export class Command extends BaseCommand {


	async execute() {
		if (this.params.length < 1) throw "Missing pathname";
		const archivePath = this.params[0] as string;

		const index: { version: number } = existsSync(resolve(archivePath, "index.json"))
			? JSON.parse(await fsp.readFile(resolve(archivePath, "index.json"), "utf8"))
			: { version: 1 };

		switch (index.version) {
			case 1:
				throw new Error("Archive formats before version 2 are no longer supported.")
				break;
			case 2:
				await new Archiver2(this.config).loadArchive(archivePath);
				break;
			default:
				throw new Error(`Unsupported archive version ${index.version}`);
		}

		this.config.setupRequired = false;

	}

}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/** 
 * This is copied in from the tsup build types for this command, although built with 
 * a modified PrismaField. This should represent the last form of the version 2 
 * archive. 
 */
export interface Archiver2Saves {
	getRecipes(): Promise<({
		recipe_bags: {
			recipe_id: number;
			bag_id: number;
			with_acl: boolean;
			position: number;
		}[];
		acl: {
			role_id: number;
			recipe_id: number;
			permission: "READ" | "WRITE" | "ADMIN";
			acl_id: number;
		}[];
	} & {
		description: string;
		recipe_name: string;
		recipe_id: number;
		owner_id: number | null;
	})[]>;
	getBags(): Promise<{
		tiddlers: {
			fields: {
				[k: string]: string;
			};
			bag_id: number;
			title: string;
			tiddler_id: number;
			is_deleted: boolean;
			attachment_hash: string | null;
		}[];
		acl: {
			role_id: number;
			bag_id: number;
			permission: "READ" | "WRITE" | "ADMIN";
			acl_id: number;
		}[];
		description: string;
		owner_id: number | null;
		bag_id: number;
		bag_name: string;
		is_plugin: boolean;
	}[]>;
	getUsers(): Promise<({
		roles: {
			role_id: number;
			role_name: string;
			description: string | null;
		}[];
		sessions: {
			user_id: number;
			created_at: Date;
			session_id: string;
			last_accessed: Date;
			session_key: string | null;
		}[];
		groups: {
			description: string | null;
			group_id: number;
			group_name: string;
		}[];
	} & {
		user_id: number;
		username: string;
		email: string;
		password: string;
		created_at: Date;
		last_login: Date | null;
	})[]>;
	getGroups(): Promise<({
		roles: {
			role_id: number;
			role_name: string;
			description: string | null;
		}[];
	} & {
		description: string | null;
		group_id: number;
		group_name: string;
	})[]>;
	getRoles(): Promise<{
		role_id: number;
		role_name: string;
		description: string | null;
	}[]>;
}

class Archiver2 {
	constructor(public config: ServerState) { }

	/** This generates UUIDv7 keys since version 2 used integers */
	getNewUUIDv7(map: Map<any, string>, oldkey: any): string {
		const curKey = map.get(oldkey);
		if (curKey) return curKey;
		const newKey = uuidv7();
		map.set(oldkey, newKey);
		return newKey;
	}

	recipe_id_map = new Map<any, string>();
	recipe_key = (key: any) => this.getNewUUIDv7(this.recipe_id_map, key);
	bag_id_map = new Map<any, string>();
	bag_key = (key: any) => this.getNewUUIDv7(this.bag_id_map, key);
	tiddler_id_map = new Map<any, string>();
	tiddler_key = (key: any) => this.getNewUUIDv7(this.tiddler_id_map, key);
	role_id_map = new Map<any, string>();
	role_key = (key: any) => this.getNewUUIDv7(this.role_id_map, key);
	user_id_map = new Map<any, string>();
	user_key = (key: any) => this.getNewUUIDv7(this.user_id_map, key);


	async loadArchive(archivePath: string) {
		await this.config.$transaction(async (prisma) => {
			const roles: Awaited<ReturnType<Archiver2Saves["getRoles"]>> = JSON.parse(await fsp.readFile(resolve(archivePath, "roles.json"), "utf8"));
			await prisma.roles.createMany({
				data: roles.map((e): Prisma.RolesCreateManyInput => ({
					role_id: this.role_key(e.role_id),
					role_name: e.role_name,
					description: e.description,
				}))
			});
			const users: Awaited<ReturnType<Archiver2Saves["getUsers"]>> = JSON.parse(await fsp.readFile(resolve(archivePath, "users.json"), "utf8"));
			await Promise.all(users.map(e => prisma.users.create({
				data: ({
					user_id: this.user_key(e.user_id),
					email: e.email,
					password: e.password,
					username: e.username,
					created_at: e.created_at,
					last_login: e.last_login,
					roles: ({ connect: e.roles.map(e => ({ role_id: this.role_key(e.role_id) })) }),
				} satisfies Prisma.UsersUncheckedCreateInput)
			})));

			// Iterate the bags
			const bagNames = await fsp.readdir(resolve(archivePath, "bags"));
			for (const bagFilename of bagNames) {
				const stat = await fsp.stat(resolve(archivePath, "bags", bagFilename));
				if (!stat.isDirectory()) continue;
				console.log(`Reading bag ${decodeURIComponent(bagFilename)}`);
				await this.restoreBag(resolve(archivePath, "bags", bagFilename), prisma);
			}
			// Iterate the recipes
			const recipeNames = await fsp.readdir(resolve(archivePath, "recipes"));
			for (const recipeFilename of recipeNames) {
				if (!recipeFilename.endsWith(".json")) continue;
				console.log(`Reading recipe ${decodeURIComponent(recipeFilename)}`);
				await this.restoreRecipe(resolve(archivePath, "recipes", recipeFilename), prisma);
			}

		}).catch(e => {
			if (e.name === "PrismaClientKnownRequestError") {
				console.log(e.code, e.meta, e.message);
				throw e.message;
			} else {
				throw e;
			}
		});
	}
	private async restoreRecipe(file: string, prisma: PrismaTxnClient) {
		type RecipeInfo = Awaited<ReturnType<Archiver2Saves["getRecipes"]>>[number];
		const recipeInfo: RecipeInfo = JSON.parse(await fsp.readFile(file, "utf8"));
		// recipeInfo.recipe_bags.filter(e => e.bag_id)
		await prisma.recipes.create({
			data: {
				recipe_id: this.recipe_key(recipeInfo.recipe_id),
				recipe_name: recipeInfo.recipe_name,
				description: recipeInfo.description,
				owner_id: this.user_key(recipeInfo.owner_id),
				plugin_names: [],
				acl: {
					createMany: {
						data: recipeInfo.acl.map(e => ({
							permission: e.permission,
							role_id: this.role_key(e.role_id),
							acl_id: e.acl_id,
						}))
					}
				},
				recipe_bags: {
					createMany: {
						data: recipeInfo.recipe_bags.map(e => ({
							bag_id: this.bag_key(e.bag_id),
							position: e.position,
							with_acl: e.with_acl,
						}))
					}
				},
			}
		});
	}
	private async restoreBag(folder: string, prisma: PrismaTxnClient) {
		type BagInfo = Awaited<ReturnType<Archiver2Saves["getBags"]>>[number];
		const bagInfo: BagInfo = JSON.parse(await fsp.readFile(join(folder, "meta.json"), "utf8"));

		await prisma.bags.create({
			data: {
				bag_id: this.bag_key(bagInfo.bag_id),
				bag_name: bagInfo.bag_name,
				description: bagInfo.description,
				owner_id: this.user_key(bagInfo.owner_id),
				acl: {
					createMany: {
						data: bagInfo.acl.map(e => ({
							permission: e.permission,
							role_id: this.role_key(e.role_id),
							acl_id: e.acl_id,
						}))
					}
				},
			}
		});
		type TiddlerData = Awaited<ReturnType<Archiver2Saves["getBags"]>>[number]["tiddlers"][number];
		const tiddlerFiles = await fsp.readdir(join(folder, "tiddlers"));
		const tiddlers: TiddlerData[] = await Promise.all(tiddlerFiles.map(async (tiddlerFilename) => {
			if (!tiddlerFilename.endsWith(".json")) return;
			const value = await fsp.readFile(join(folder, "tiddlers", tiddlerFilename), "utf8");
			return JSON.parse(value);
		}));
		await prisma.tiddlers.createMany({
			data: tiddlers.flatMap((tiddler): Prisma.TiddlersUncheckedCreateInput => ({
				bag_id: this.bag_key(bagInfo.bag_id),
				title: tiddler.title,
				is_deleted: tiddler.is_deleted,
				attachment_hash: tiddler.attachment_hash,
				revision_id: this.tiddler_key(tiddler.tiddler_id),
			}))
		});
		await prisma.fields.createMany({
			data: tiddlers.flatMap(({ tiddler_id, fields }) => Object.entries(fields)
				.map(([field_name, field_value]): Prisma.FieldsCreateManyInput => ({
					revision_id: this.tiddler_key(tiddler_id),
					field_name,
					field_value,
				}))
			)
		});
	}
	
	async test() {
		const checkBags = await this.config.engine.bags.findMany({
			where: { bag_name: { startsWith: "$:/" } },
			select: { bag_name: true, tiddlers: { select: { title: true } } }
		});
		checkBags.forEach(e => {
			e.tiddlers.forEach(f => {
				if (f.title as string !== e.bag_name as string) {
					if (e.bag_name === "$:/plugins/tiddlywiki/codemirror-fullscreen-editing"
						&& f.title === "$:/plugins/tiddlywiki/codemirror-fullscreen"
					) return;
					console.log(`The bag ${e.bag_name} has a tiddler ${f.title}, in the future this will be unsupported. This can occur if the top bag in a recipe is one of the system bags (starting with $:/)`)
				}
			});
		});
	}
}
