import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { resolve } from "path";
// import { TiddlerStore_PrismaBase } from "../managers/TiddlerStore";


export const info: CommandInfo = {
	name: "load-tiddlers",
	description: "Load tiddlers from a folder into a bag",
	arguments: [
		["path", "Path to load tiddlers from."],
		["bag-name", "Name of the bag to load tiddlers into"],
	],
};

export class Command extends BaseCommand {

	tiddlersPath: string;
	bagName: PrismaField<"Bags", "bag_name">;

	constructor(...args: ConstructorParameters<typeof BaseCommand>) {
		super(...args);
		this.tiddlersPath = resolve(this.params[0] as string);
		this.bagName = this.params[1] as PrismaField<"Bags", "bag_name">;
	}

	async execute() {

		if (this.params.length < 2) return "Missing pathname and/or bag name";
		const tiddlersFromPath = this.$tw.loadTiddlersFromPath(this.tiddlersPath);

		const store = new TiddlerStore_PrismaBase(this.config.engine);

		const bag = await this.config.engine.bags.findUnique({ where: { bag_name: this.bagName } });

		if (!bag) {
			return `Bag "${this.bagName}" does not exist.`;
		}

		// execute a batch transaction, rather than an interactive transaction
		await this.config.engine.$transaction(
			store.saveTiddlersFromPath_PrismaArray(bag.bag_id, tiddlersFromPath.map(e => e.tiddlers).flat())
		);

		return null;

	}
}
