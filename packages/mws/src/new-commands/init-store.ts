import { dist_require_resolve, dist_resolve } from "@tiddlywiki/server";
import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { resolve } from "path";
import { LoadWikiFolderCommand } from "./load-wiki-folder";
import { RoleImportWriter, TemplateImportWriter, UserImportWriter } from "../new-managers";
import { IdString } from "@mws/admin-vanilla/src/definition/tabs";
import { serverEvents } from "@tiddlywiki/events";

serverEvents.on("cli.register", (commands) => {
	commands[info.name] = { info, Command: InitStoreCommand };
});

const info: CommandInfo = {
	name: "init-store",
	description: "Initialize the MWS data folder",
	arguments: [],
};


export class InitStoreCommand extends BaseCommand {
	static info = info;

	async execute(): Promise<any> {
		await this.setupStore().catch((err) => {
			throw err;
		});
	}

	async setupStore() {
		await this.config.engine.$transaction(async prisma => {
			const userCount = await prisma.users.count();
			if (userCount) return;


			const roles = await new RoleImportWriter(prisma, true).upsert([
				{ name: "ADMIN", description: "System Administrator" },
				{ name: "USER", description: "Basic User" },
			]);

			if (!roles[0])
				throw new Error("Failed to create ADMIN role during store initialization.");


			await new TemplateImportWriter(prisma, true).upsert([{
				name: "Blank Template",
				definition: {
					type: "simpleV1",
					description: "The default template, blank and uneditable.",
					readonlyBags: [],
					writablePrefixBags: [],
					plugins: [],
					requiredPluginsEnabled: true,
					customHtmlEnabled: false,
					externalPlugins: true,
					externalStore: false,
					twVersion: "",
					htmlContent: "",
					injectionFunction: "",
					injectionLocation: "",
				},
				permissions: [{ level: "B_write", role_id: new IdString(roles[0].role_id) }]
			}]);


			const [admin] = await new UserImportWriter(prisma, true).upsert([
				{ username: "admin", email: "", resetCode: null, roleIds: [new IdString(roles[0].role_id)] },
			]);

			const password = await this.config.PasswordService.PasswordCreation(admin.user_id, "1234");

			await prisma.users.update({
				where: { user_id: admin.user_id },
				data: { password: password },
			});

		});

		console.log("Default user created with username 'admin' and password '1234'. Please change this password after logging in.");

		// should give us the path to boot.js
		const tweditions = resolve(dist_require_resolve("tiddlywiki"), "../../editions");

		const runner = async (path: string, bagName: string, bagDesc: string, recName: string, recDesc: string) => {
			const command = new LoadWikiFolderCommand([path!], {
				"bag-relative-root": [dist_resolve("..")],
				"bag-description": [bagDesc],
				"recipe-name": [recName],
				"recipe-description": [recDesc],
				"overwrite": false,
				"owner-roles": ["ADMIN"]
			});
			command.$tw = this.$tw;
			command.config = this.config;
			await command.execute();
		};

		await runner(
			dist_resolve("../editions/mws-docs"),
			"mws-docs", "MWS Documentation from https://mws.tiddlywiki.com",
			"mws-docs", "MWS Documentation from https://mws.tiddlywiki.com",
		);
		await runner(
			resolve(tweditions, "tw5.com"),
			"docs", "TiddlyWiki Documentation from https://tiddlywiki.com",
			"docs", "TiddlyWiki Documentation from https://tiddlywiki.com",
		);
		await runner(
			resolve(tweditions, "dev"),
			"dev", "TiddlyWiki Developer Documentation from https://tiddlywiki.com/dev",
			"dev-docs", "TiddlyWiki Developer Documentation from https://tiddlywiki.com/dev",
		);
		await runner(
			resolve(tweditions, "tour"),
			"tour", "TiddlyWiki Interactive Tour from https://tiddlywiki.com",
			"tour", "TiddlyWiki Interactive Tour from https://tiddlywiki.com",
		);

		this.config.setupRequired = false;
	}
}

