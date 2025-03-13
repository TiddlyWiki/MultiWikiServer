import { resolve } from "node:path";

import { Commander, CommandInfo } from ".";
import { TiddlerStore } from "../routes/TiddlerStore";

export const info: CommandInfo = {
	name: "mws-load-plugin-bags",
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
		const router = this.commander.router;
		await router.engine.$transaction(async (prisma) => {
			await loadPluginBags(this.$tw, new TiddlerStore(router.config, prisma as any));
			return null;
		});
	}
}


async function loadPluginBags($tw: any, store: TiddlerStore) {

	// Copy plugins
	function makePluginBagName(type: string, publisher: string | undefined, name: string) {
		return "$:/" + type + "/" + (publisher ? publisher + "/" : "") + name;
	}
	async function savePlugin(pluginFields: { title: PrismaField<"Tiddlers", "title">, description?: string; }, type: string, publisher: string | undefined, name: string) {
		const bagName = makePluginBagName(type, publisher, name) as PrismaField<"Bags", "bag_name">;
		const [good, error, bag] = await store.upsertBag(
			bagName,
			(pluginFields.description ?? "(no description)") as PrismaField<"Bags", "description">,
			{ allowPrivilegedCharacters: true }
		).then(e => [true, undefined, e], e => [false, e, undefined]);
		if (!good) {
			console.log(`Error creating plugin bag ${bagName}: ${error}`);
			return;
		}
		await store.saveBagTiddler(pluginFields, bagName);
	}
	async function collectPlugins(folder: string, type: string, publisher?: string | undefined) {
		var pluginFolders = $tw.utils.getSubdirectories(folder) || [];
		for (var p = 0; p < pluginFolders.length; p++) {
			const pluginFolderName = pluginFolders[p];
			if (!$tw.boot.excludeRegExp.test(pluginFolderName)) {
				var pluginFields = $tw.loadPluginFolder(resolve(folder, pluginFolderName));
				if (pluginFields && pluginFields.title) {
					await savePlugin(pluginFields, type, publisher, pluginFolderName);
				}
			}
		}
	}
	async function collectPublisherPlugins(folder: string, type: string) {
		var publisherFolders = $tw.utils.getSubdirectories(folder) || [];
		for (var t = 0; t < publisherFolders.length; t++) {
			const publisherFolderName = publisherFolders[t];
			if (!$tw.boot.excludeRegExp.test(publisherFolderName)) {
				await collectPlugins(resolve(folder, publisherFolderName), type, publisherFolderName);
			}
		}
	};
	await eachAsync($tw.getLibraryItemSearchPaths($tw.config.pluginsPath, $tw.config.pluginsEnvVar), async function (folder: string) {
		await collectPublisherPlugins(folder, "plugins");
	});
	await eachAsync($tw.getLibraryItemSearchPaths($tw.config.themesPath, $tw.config.themesEnvVar), async function (folder: string) {
		await collectPublisherPlugins(folder, "themes");
	});
	await eachAsync($tw.getLibraryItemSearchPaths($tw.config.languagesPath, $tw.config.languagesEnvVar), async function (folder: string) {
		await collectPlugins(folder, "languages");
	});
}



