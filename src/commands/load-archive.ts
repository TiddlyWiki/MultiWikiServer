
import { Commander, CommandInfo } from "../commander";
import { join, resolve } from "path";
import { $Enums, Prisma } from "@prisma/client";
import { Command as SaveArchiveCommand } from "./save-archive";
import * as _fsp from "fs/promises";
import { createStrictAwaitProxy } from "../utils";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { existsSync } from "fs";
import { v7 as uuidv7 } from 'uuid';

const fsp = createStrictAwaitProxy(_fsp);

export const info: CommandInfo = {
	name: "load-archive",
	description: "Load a MWS archive into the database",
	arguments: [
		["archivePath", "Path to the archive to load"],
	],
	synchronous: true
};
export class Command {

	constructor(
		public params: string[],
		public commander: Commander,
		public callback: (err?: any) => void
	) {


	}

	async execute() {
		if (this.params.length < 1) throw "Missing pathname";
		const archivePath = this.params[0] as string;

		const index: { version: number } = existsSync(resolve(archivePath, "index.json"))
			? JSON.parse(await fsp.readFile(resolve(archivePath, "index.json"), "utf8"))
			: { version: 1 };
		// this is all the versions in this repo.
		// the multi-wiki-support branch from the TW5 repo is not supported.
		switch (index.version) {
			case 1:
				throw new Error("A version 1 archive is no longer supported. The last version to support it may have been 0.16, but even that seemed to be broken.")
			case 2:
				await new Archiver2(this.commander).loadArchive(archivePath);
				break;
			default:
				throw new Error(`Unsupported archive version ${index.version}`);
		}

		this.commander.setupRequired = false;

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
	constructor(public commander: Commander) { }

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
		await this.commander.$transaction(async (prisma) => {
			const roles = JSON.parse(await fsp.readFile(resolve(archivePath, "roles.json"), "utf8"));
			await prisma.roles.createMany({ data: roles });
			const users: Awaited<ReturnType<SaveArchiveCommand["getUsers"]>> = JSON.parse(await fsp.readFile(resolve(archivePath, "users.json"), "utf8"));
			await Promise.all(users.map(e => prisma.users.create({
				data: ({
					user_id: e.user_id,
					email: e.email,
					password: e.password,
					username: e.username,
					created_at: e.created_at,
					last_login: e.last_login,
					roles: ({ connect: e.roles.map(e => ({ role_id: e.role_id })) }),
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
			if (e instanceof PrismaClientKnownRequestError) {
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
		await prisma.recipes.create({
			data: {
				recipe_id: this.recipe_key(recipeInfo.recipe_id),
				recipe_name: recipeInfo.recipe_name,
				description: recipeInfo.description,
				owner_id: this.user_key(recipeInfo.owner_id),
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
				}
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
				is_plugin: bagInfo.is_plugin,
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
}
