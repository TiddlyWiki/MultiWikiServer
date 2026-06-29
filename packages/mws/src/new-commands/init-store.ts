import { dist_require_resolve, dist_resolve } from "@tiddlywiki/server";
import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { resolve } from "path";
import { Command as LoadWikiFolderCommand } from "./load-wiki-folder";
import { importRoles, importTemplates, importUsers, indexImportedRolesByName } from "../new-managers/wiki-import";

export const info: CommandInfo = {
	name: "init-store",
	description: "Initialize the MWS data folder",
	arguments: [],
};


export class Command extends BaseCommand {

	async execute(): Promise<any> {
		await this.setupStore().catch((err) => {

			throw err;
		});
	}

	async setupStore() {
		const userCount = await this.config.engine.users.count();
		if (userCount) return;
		const [bootstrapTemplates, bootstrapRoles] = await Promise.all([
			importTemplates(this.config.engine, [
				{
					type: "simpleV1",
					definition: {
						name: `Blank Template`,
						description: "The default template, blank and uneditable.",
						readonlyBags: [],
						writablePrefixBags: {},
						plugins: [],
						requiredPluginsEnabled: true,
						customHtmlEnabled: false,
						htmlContent: "",
						injectionArray: "",
						injectionLocation: "",
					},
				}
			], true),
			importRoles(this.config.engine, [
				{ role_name: "ADMIN", description: "System Administrator" },
				{ role_name: "USER", description: "Basic User" },
			], true),
		]);
		void bootstrapTemplates;
		const adminRoleId = indexImportedRolesByName(bootstrapRoles).get("ADMIN")?.role_id;
		if (!adminRoleId) {
			throw new Error("Failed to create ADMIN role during store initialization.");
		}
		const userResult = await importUsers(this.config.engine, [
				{ username: "admin", email: "", password: "", roleIds: [adminRoleId] },
			], true);
		const admin_id = userResult[0].user_id;
		const password = await this.config.PasswordService.PasswordCreation(admin_id, "1234");
		await this.config.engine.users.update({
			where: { user_id: admin_id },
			data: { password: password }
		});
		console.log("Default user created with username 'admin' and password '1234'. Please change this password after logging in.");




		// should give us the path to boot.js
		const tweditions = resolve(dist_require_resolve("tiddlywiki"), "../../editions");

		const runner = async (path: string, bagName: string, bagDesc: string, recName: string, recDesc: string) => {
			const command = new LoadWikiFolderCommand([path!], {
				"bag-name": [bagName],
				"bag-description": [bagDesc],
				"recipe-name": [recName],
				"recipe-description": [recDesc],
				overwrite: false
			});
			command.$tw = this.$tw;
			command.config = this.config;
			await command.execute();
		}

		await runner(dist_resolve("../editions/mws-docs"),
			"mws-docs", "MWS Documentation from https://mws.tiddlywiki.com",
			"mws-docs", "MWS Documentation from https://mws.tiddlywiki.com");
		await runner(resolve(tweditions, "tw5.com"),
			"docs", "TiddlyWiki Documentation from https://tiddlywiki.com",
			"docs", "TiddlyWiki Documentation from https://tiddlywiki.com");
		await runner(resolve(tweditions, "dev"),
			"dev", "TiddlyWiki Developer Documentation from https://tiddlywiki.com/dev",
			"dev-docs", "TiddlyWiki Developer Documentation from https://tiddlywiki.com/dev");
		await runner(resolve(tweditions, "tour"),
			"tour", "TiddlyWiki Interactive Tour from https://tiddlywiki.com",
			"tour", "TiddlyWiki Interactive Tour from https://tiddlywiki.com");

		this.config.setupRequired = false;
	}
}

