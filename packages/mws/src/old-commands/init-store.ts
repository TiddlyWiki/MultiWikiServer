import { dist_require_resolve, dist_resolve } from "@tiddlywiki/server";
import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { resolve } from "path";
import { Command as LoadWikiFolderCommand } from "./load-wiki-folder";

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

		await this.config.$transaction(async (prisma) => {
			const userCount = await prisma.users.count();

			if (!userCount) {

				await prisma.roles.createMany({
					data: [
						{ role_name: "ADMIN", description: "System Administrator" },
						{ role_name: "USER", description: "Basic User" },
					]
				});

				const user = await prisma.users.create({
					data: { username: "admin", email: "", password: "", roles: { connect: { role_name: "ADMIN" } } },
					select: { user_id: true }
				});

				const password = await this.config.PasswordService.PasswordCreation(user.user_id.toString(), "1234");

				await prisma.users.update({
					where: { user_id: user.user_id },
					data: { password: password }
				});

				console.log("Default user created with username 'admin' and password '1234'. Please change this password after logging in.");
			}

		});

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

