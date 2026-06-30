import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { createStrictAwaitProxy,  } from "@tiddlywiki/server";
import { resolve } from "path";
import * as _fsp from "fs/promises";
const fsp = createStrictAwaitProxy(_fsp);

export const info: CommandInfo = {
	name: "save-archive",
	description: "Save an archive of recipes, bags and tiddlers to a directory",
	arguments: [
		["path", "Path to the directory to save the archive"],
	],
};
export class Command extends BaseCommand {

	get archivePath() { return this.params[0] as string; }
	prisma?: PrismaTxnClient;

	async execute() {
		// Check parameters
		if (this.params.length < 1) throw "Missing pathname";
		await this.config.$transaction(async (prisma) => {
			this.prisma = prisma;
			await this.saveArchive();
			this.prisma = undefined;
		});
		console.log(info.name, "complete:", this.params[0])
		return null;
	}

	async getRecipes() {
		return await this.prisma!.recipes.findMany({
			include: { recipe_bags: true, acl: true },
		});
	}
	async getBags() {
		const bags = await this.prisma!.bags.findMany({
			include: { tiddlers: { include: { fields: true } }, acl: true }
		});
		return bags.map(e => ({
			...e,
			tiddlers: e.tiddlers.map(t => ({
				...t,
				fields: Object.fromEntries(t.fields.map(f => [f.field_name, f.field_value]))
			}))
		}));
	}
	async getUsers() {
		return await this.prisma!.users.findMany({ include: { roles: true, sessions: true } });
	}
	async getRoles() {
		return await this.prisma!.roles.findMany({});
	}

	async saveArchive() {
		if (!this.prisma) throw new Error("prisma not initialized");
		await fsp.mkdir(resolve(this.archivePath, "recipes"), { recursive: true });
		const recipes = await this.getRecipes();
		for (const recipeInfo of recipes) {
			const recipeFile = `recipes/${recipeInfo.recipe_id}.json`;
			await fsp.writeFile(resolve(this.archivePath, recipeFile), JSON.stringify(recipeInfo, null, "\t"));
		}
		await fsp.mkdir(resolve(this.archivePath, "bags"), { recursive: true });
		const bags = await this.getBags();
		await Promise.all(bags.map(async bagInfo => {
			const tiddlersFolder = `bags/${bagInfo.bag_id}/tiddlers`;
			await fsp.mkdir(resolve(this.archivePath, tiddlersFolder), { recursive: true });
			const bagFile = `bags/${bagInfo.bag_id}/meta.json`;
			await fsp.writeFile(resolve(this.archivePath, bagFile), JSON.stringify({ ...bagInfo, tiddlers: undefined, }, null, "\t"));
			for (const tiddler of bagInfo.tiddlers) {
				const tiddlerFile = `bags/${bagInfo.bag_id}/tiddlers/${tiddler.revision_id}.json`;
				await fsp.writeFile(resolve(this.archivePath, tiddlerFile), JSON.stringify(tiddler, null, "\t"));
			}
		}));
		const users = await this.getUsers();
		await fsp.writeFile(resolve(this.archivePath, "users.json"), JSON.stringify(users, null, "\t"));
		const roles = await this.getRoles();
		await fsp.writeFile(resolve(this.archivePath, "roles.json"), JSON.stringify(roles, null, "\t"));

		await fsp.writeFile(resolve(this.archivePath, "index.json"), JSON.stringify({
			version: 3,
			comment: "The version is an internal identifier for the archive format. It is not the same as the version of TiddlyWiki or MWS.",
		}, null, "\t"));
		// Version 1: 
		//   is_plugin did not exist. A bag_name starting with $:/ was a plugin.
		// Version 2:
		//   is_plugin did exist and made all kinds of bad setups possible.
	}

}
