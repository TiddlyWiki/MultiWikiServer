import { resolve } from "path";
import { CommandInfo, Commander, SiteConfig } from "../commander";
import { TiddlerStore } from "../routes/TiddlerStore";

export const info: CommandInfo = {
	name: "load-tiddlers",
	description: "Load tiddlers from a folder into a bag",
	arguments: [
		["path", "Path to the TiddlyWiki5 plugins folder"],
		["bag-name", "Name of the bag to load tiddlers into"],
	],
	synchronous: true
};

export class Command {
	get $tw() { return this.commander.$tw; }
	config: SiteConfig;
	tiddlersPath: string;
	bagName: PrismaField<"Bags", "bag_name">;

	constructor(
		public params: string[],
		public commander: Commander,
		public callback: (err?: any) => void
	) {
		this.config = this.commander.siteConfig;
		this.tiddlersPath = resolve(this.params[0] as string);
		this.bagName = this.params[1] as PrismaField<"Bags", "bag_name">;
	}

	async execute() {
		if (this.params.length < 2) return "Missing pathname and/or bag name";
		await this.commander.$transaction(async (prisma) => {
			const store = TiddlerStore.fromCommander(this.commander, prisma);
			var tiddlersFromPath = this.$tw.loadTiddlersFromPath(this.tiddlersPath);
			//@ts-ignore
			await store.saveTiddlersFromPath(tiddlersFromPath, this.bagName);
		});
		return null;

	}
}
