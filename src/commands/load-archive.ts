
import { Commander, CommandInfo } from "../commander";
import { TiddlerStore } from "../routes/TiddlerStore";
import { join, resolve } from "path";
import { Prisma } from "../prisma-client";
import { Command as SaveArchiveCommand } from "./save-archive";
import * as _fsp from "fs/promises";
import { createStrictAwaitProxy } from "../utils";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { existsSync } from "fs";
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
				await new Archiver1(this.commander).loadArchive(archivePath);
				break;
			case 2:
				await new Archiver2(this.commander).loadArchive(archivePath);
				break;
			default:
				throw new Error(`Unsupported archive version ${index.version}`);
		}

		this.commander.setupRequired = false;

	}

}

class Archiver {
	constructor(
		public commander: Commander,
	) {

	}
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

class Archiver1 extends Archiver {

	async loadArchive(archivePath: string) {
		await this.commander.$transaction(async (prisma) => {
			// load roles from roles/roles.json
			const roles = JSON.parse(await fsp.readFile(resolve(archivePath, "roles", "roles.json"), "utf8"));
			await prisma.roles.createMany({ data: roles });
			// load users from users/{user_id}.json
			const userFiles = await fsp.readdir(resolve(archivePath, "users"));
			const users = await Promise.all(userFiles.map(async (userFile) => {
				return JSON.parse(await fsp.readFile(resolve(archivePath, "users", userFile), "utf8"));
			}));
			await prisma.users.createMany({ data: users });
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
		type RecipeInfo = Awaited<ReturnType<SaveArchiveCommand["getRecipes"]>>[number];
		const recipeInfo: RecipeInfo = JSON.parse(await fsp.readFile(file, "utf8"));
		await prisma.recipes.create({
			data: {
				recipe_id: recipeInfo.recipe_id,
				recipe_name: recipeInfo.recipe_name,
				description: recipeInfo.description,
				owner_id: recipeInfo.owner_id,
				acl: { createMany: { data: recipeInfo.acl } },
				recipe_bags: {
					createMany: {
						data: recipeInfo.recipe_bags.map(e => ({
							bag_id: e.bag_id,
							position: e.position,
							with_acl: e.with_acl,
						}))
					}
				}
			}
		});
	}
	private async restoreBag(folder: string, prisma: PrismaTxnClient) {
		type BagInfo = Awaited<ReturnType<SaveArchiveCommand["getBags"]>>[number];
		const bagInfo: BagInfo = JSON.parse(await fsp.readFile(join(folder, "meta.json"), "utf8"));
		await prisma.bags.create({
			data: {
				bag_id: bagInfo.bag_id,
				bag_name: bagInfo.bag_name,
				description: bagInfo.description,
				owner_id: bagInfo.owner_id,
				is_plugin: bagInfo.bag_name.startsWith("$:/"),
				acl: { createMany: { data: bagInfo.acl } },
			}
		});
		type TiddlerData = Awaited<ReturnType<SaveArchiveCommand["getBags"]>>[number]["tiddlers"][number];
		const tiddlerFiles = await fsp.readdir(join(folder, "tiddlers"));
		const tiddlers: TiddlerData[] = await Promise.all(tiddlerFiles.map(async (tiddlerFilename) => {
			if (!tiddlerFilename.endsWith(".json")) return;
			const value = await fsp.readFile(join(folder, "tiddlers", tiddlerFilename), "utf8");
			return JSON.parse(value);
		}));
		await prisma.tiddlers.createMany({
			data: tiddlers.flatMap((tiddler): Prisma.TiddlersCreateManyInput => ({
				bag_id: bagInfo.bag_id,
				title: tiddler.title,
				is_deleted: tiddler.is_deleted,
				attachment_hash: tiddler.attachment_hash,
				tiddler_id: tiddler.tiddler_id,
			}))
		});
		await prisma.fields.createMany({
			data: tiddlers.flatMap(({ tiddler_id, fields }) => Object.entries(fields)
				.map(([field_name, field_value]): Prisma.FieldsCreateManyInput =>
					({ tiddler_id, field_name, field_value, })
				)
			)
		});
	}
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

class Archiver2 extends Archiver {

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
		type RecipeInfo = Awaited<ReturnType<SaveArchiveCommand["getRecipes"]>>[number];
		const recipeInfo: RecipeInfo = JSON.parse(await fsp.readFile(file, "utf8"));
		await prisma.recipes.create({
			data: {
				recipe_id: recipeInfo.recipe_id,
				recipe_name: recipeInfo.recipe_name,
				description: recipeInfo.description,
				owner_id: recipeInfo.owner_id,
				acl: { createMany: { data: recipeInfo.acl } },
				recipe_bags: {
					createMany: {
						data: recipeInfo.recipe_bags.map(e => ({
							bag_id: e.bag_id,
							position: e.position,
							with_acl: e.with_acl,
						}))
					}
				}
			}
		});
	}
	private async restoreBag(folder: string, prisma: PrismaTxnClient) {
		type BagInfo = Awaited<ReturnType<SaveArchiveCommand["getBags"]>>[number];
		const bagInfo: BagInfo = JSON.parse(await fsp.readFile(join(folder, "meta.json"), "utf8"));
		await prisma.bags.create({
			data: {
				bag_id: bagInfo.bag_id,
				bag_name: bagInfo.bag_name,
				description: bagInfo.description,
				owner_id: bagInfo.owner_id,
				is_plugin: bagInfo.is_plugin,
				acl: { createMany: { data: bagInfo.acl } },
			}
		});
		type TiddlerData = Awaited<ReturnType<SaveArchiveCommand["getBags"]>>[number]["tiddlers"][number];
		const tiddlerFiles = await fsp.readdir(join(folder, "tiddlers"));
		const tiddlers: TiddlerData[] = await Promise.all(tiddlerFiles.map(async (tiddlerFilename) => {
			if (!tiddlerFilename.endsWith(".json")) return;
			const value = await fsp.readFile(join(folder, "tiddlers", tiddlerFilename), "utf8");
			return JSON.parse(value);
		}));
		await prisma.tiddlers.createMany({
			data: tiddlers.flatMap((tiddler): Prisma.TiddlersCreateManyInput => ({
				bag_id: bagInfo.bag_id,
				title: tiddler.title,
				is_deleted: tiddler.is_deleted,
				attachment_hash: tiddler.attachment_hash,
				tiddler_id: tiddler.tiddler_id,
			}))
		});
		await prisma.fields.createMany({
			data: tiddlers.flatMap(({ tiddler_id, fields }) => Object.entries(fields)
				.map(([field_name, field_value]): Prisma.FieldsCreateManyInput =>
					({ tiddler_id, field_name, field_value, })
				)
			)
		});
	}
}
