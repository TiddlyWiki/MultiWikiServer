import { resolve } from "node:path";

import { Commander, CommandInfo } from "../commander";
import { TiddlerStore } from "../routes/TiddlerStore";
import { TiddlerFields } from "../services/attachments";
import { truthy, tryParseJSON } from "../utils";
import { Prisma, PrismaClient } from "../prisma-client";
import { PrismaPromise } from "@prisma/client/runtime/library";

export const info: CommandInfo = {
	name: "load-plugin-bags",
	description: "Load plugin bags from the TiddlyWiki5 plugins folder",
	arguments: [
		["path", "Path to the TiddlyWiki5 plugins folder"],
	],
	synchronous: true,

};


export class Command {

	get $tw() { return this.commander.$tw; }
	constructor(
		public params: string[],
		public commander: Commander,
		public callback: (err?: any) => void
	) {

	}
	async execute() {
		console.time(`${info.name} complete`);
		await loadPluginBags(
			this.$tw,
			new TiddlerStore(this.commander, this.commander.engine),
			this.commander.engine
		);
		console.timeEnd(`${info.name} complete`);
	}
}


async function loadPluginBags($tw: any, store: TiddlerStore, engine: PrismaClient) {

	// Copy plugins
	function makePluginBagName(type: string, publisher: string | undefined, name: string) {
		return "$:/" + type + "/" + (publisher ? publisher + "/" : "") + name;
	}
	function savePlugin(
		pluginFields: TiddlerFields,
		// tiddlers: Record<string, TiddlerFields>,
		type: string,
		publisher: string | undefined,
		name: string
	) {

		const bagName = makePluginBagName(type, publisher, name) as PrismaField<"Bags", "bag_name">;
		const description = (pluginFields.description ?? "(no description)") as PrismaField<"Bags", "description">;
		const is_plugin = true as PrismaField<"Bags", "is_plugin">;
		// await store.saveBagTiddler(pluginFields, bagName);
		return [
			store.upsertBag_PrismaPromise(bagName, description, is_plugin, { allowPrivilegedCharacters: true }),
			...store.saveBagTiddlerFields_PrismaArray(pluginFields, bagName, null),
			// ...Object.values(tiddlers).flatMap((fields) => store.saveBagTiddlerFields_PrismaArray(fields, bagName, null))
		].filter(truthy);

	}
	function collectPlugins(folder: string, type: string, publisher?: string | undefined) {
		var pluginFolders = $tw.utils.getSubdirectories(folder) || [];
		const prismaPromiseArray: PrismaPromise<any>[] = [];
		for (var p = 0; p < pluginFolders.length; p++) {
			const pluginFolderName = pluginFolders[p];
			if ($tw.boot.excludeRegExp.test(pluginFolderName)) continue;

			const pluginFields: TiddlerFields = $tw.loadPluginFolder(resolve(folder, pluginFolderName));
			if (!pluginFields?.title) continue;

			// const { tiddlers = {} } = tryParseJSON<{
			// 	tiddlers: Record<string, TiddlerFields>
			// }>(pluginFields.text) ?? {};
			// delete pluginFields.text;

			prismaPromiseArray.push(...savePlugin(pluginFields, type, publisher, pluginFolderName));

			// console.log(`Import plugin ${pluginFields.title}`);
		}
		prismaPromiseArray.forEach(e => {
			if (e[Symbol.toStringTag] !== "PrismaPromise") console.log(e)
		})
		return prismaPromiseArray;
	}
	function collectPublisherPlugins(folder: string, type: string) {
		var publisherFolders: string[] = $tw.utils.getSubdirectories(folder) || [];
		return publisherFolders.flatMap((publisherFolderName) => {
			if ($tw.boot.excludeRegExp.test(publisherFolderName)) return [];
			return collectPlugins(resolve(folder, publisherFolderName), type, publisherFolderName);
		});
	};
	const plugins = $tw.getLibraryItemSearchPaths($tw.config.pluginsPath, $tw.config.pluginsEnvVar);
	const themes = $tw.getLibraryItemSearchPaths($tw.config.themesPath, $tw.config.themesEnvVar);
	const languages = $tw.getLibraryItemSearchPaths($tw.config.languagesPath, $tw.config.languagesEnvVar);
	const prismaPromiseArray = [
		...plugins.flatMap((folder: string) => collectPublisherPlugins(folder, "plugins")),
		...themes.flatMap((folder: string) => collectPublisherPlugins(folder, "themes")),
		...languages.flatMap((folder: string) => collectPlugins(folder, "languages")),
	];
	prismaPromiseArray.forEach(e => {
		if (e[Symbol.toStringTag] !== "PrismaPromise") {
			if (Array.isArray(e)) console.log(e.length);
			else console.log(e);
		}
	})
	await engine.$transaction(prismaPromiseArray);

}



// // these are the main type definitions for the generator function. 
// // Modify these if you use a typed sql framework.
// type YieldInput = Prisma.PrismaPromise<any>;
// type YieldOutput<Input extends YieldInput> = Awaited<Input>;
// // this is the generator type
// type PrismaGenerator<T> = Generator<YieldInput[], T, YieldOutput<YieldInput>[]>;

// const prisma = new PrismaClient();
// prisma.bagAcl.aggregate


// type MapInputToOutput<T extends YieldInput[]> = T extends [
// 	infer First extends YieldInput,
// 	...infer Rest extends YieldInput[]
// ] ? [YieldOutput<First>, ...MapInputToOutput<Rest>] : [];

// /** This just types the yield output according to the input. Make sure you call it with `yield*` */
// function* Yielder<const I extends YieldInput[]>(...input: I)
// 	: PrismaGenerator<MapInputToOutput<I>> { return (yield input) as MapInputToOutput<I>; }

// function prismaYielder(prisma: PrismaClient) {
// 	return function* yielder<const I extends YieldInput[]>(...input: I)
// 		: PrismaGenerator<MapInputToOutput<I>> { return (yield input) as MapInputToOutput<I>; }
// }

// // this section is an example usage of the above functions

// function* prismaBatchTransaction(yielder: typeof Yielder): PrismaGenerator<{ titles: string[] }> {
// 	// yield* is essentially a spread operator for generators 
// 	// yielder yeilds one value then returns the result.
// 	// this just gives us a way to type the output of a yield according to the input
// 	// so if we give it a typed sql query input, it can return a typed result

// 	const [result1] = yield* yielder(prisma.bagAcl.aggregate({}));

// 	return { titles: [] };

// }
