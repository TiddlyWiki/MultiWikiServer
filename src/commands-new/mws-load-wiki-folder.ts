/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-load-wiki-folder.js
type: application/javascript
module-type: command

Command to create and load a bag for the specified core editions

--mws-load-wiki-folder <path> <bag-name> <bag-description> <recipe-name> <recipe-description>

\*/


import { resolve } from "path";
import { Commander, CommandInfo } from "../commander";
import { TiddlerStore } from "../routes/TiddlerStore";
import { TiddlerFields } from "../routes/services/attachments";

export const info: CommandInfo = {
	name: "mws-load-wiki-folder",
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

		// Check parameters
		if (this.params.length < 5) {
			return "Missing parameters for --mws-load-wiki-folder command";
		}
		const archivePath = this.params[0];
		const router = this.commander.router;
		await router.engine.$transaction(async (prisma) => {
			await loadWikiFolder({
				wikiPath: this.params[0] as string,
				bagName: this.params[1] as PrismaField<"Bags", "bag_name">,
				bagDescription: this.params[2] as PrismaField<"Bags", "description">,
				recipeName: this.params[3] as PrismaField<"Recipes", "recipe_name">,
				recipeDescription: this.params[4] as PrismaField<"Recipes", "description">,
				store: new TiddlerStore(router.config, prisma as any),
				$tw: this.commander.$tw
			});
		});
		console.log("import complete", this.params[0])
		return null;
	}
}


// Function to convert a plugin name to a bag name
function makePluginBagName(type: string, publisher: string | undefined, name: string) {
	return "$:/" + type + "/" + (publisher ? publisher + "/" : "") + name;
}

// Copy TiddlyWiki core editions
async function loadWikiFolder({ $tw, store, ...options }: {
	wikiPath: string,
	bagName: PrismaField<"Bags", "bag_name">,
	bagDescription: PrismaField<"Bags", "description">,
	recipeName: PrismaField<"Recipes", "recipe_name">,
	recipeDescription: PrismaField<"Recipes", "description">,
	store: TiddlerStore,
	$tw: any
}) {
	const path = require("path"),
		fs = require("fs");
	// Read the tiddlywiki.info file
	const wikiInfoPath = path.resolve(options.wikiPath, $tw.config.wikiInfo);
	let wikiInfo;
	if (fs.existsSync(wikiInfoPath)) {
		wikiInfo = $tw.utils.parseJSONSafe(fs.readFileSync(wikiInfoPath, "utf8"), function () { return null; });
	}
	if (wikiInfo) {
		// Create the bag
		console.log(await store.upsertBag(options.bagName, options.bagDescription));
		// if (!bagRes.ok) {
		// 	console.log(`Error creating bag ${options.bagName} for edition ${options.wikiPath}: ${bagRes.error}`);
		// 	return;
		// }
		// Add plugins to the recipe list
		const recipeList = [];
		const processPlugins = function (type: string, plugins: string[]) {
			$tw.utils.each(plugins, function (pluginName: string) {
				const parts = pluginName.split("/");
				let publisher, name;
				if (parts.length === 2) {
					publisher = parts[0];
					name = parts[1];
				} else {
					name = parts[0];
				}
				recipeList.push({ bag_name: makePluginBagName(type, publisher, name as string), with_acl: false });
			});
		};
		processPlugins("plugins", wikiInfo.plugins);
		processPlugins("themes", wikiInfo.themes);
		processPlugins("languages", wikiInfo.languages);
		// Create the recipe
		recipeList.push({
			bag_name: options.bagName,
			with_acl: true as PrismaField<"Recipe_bags", "with_acl">,
		});
		recipeList.reverse()
		console.log(await store.upsertRecipe(
			options.recipeName,
			options.recipeDescription,
			recipeList,
		))
		// if (!recipeRes.ok) {
		// 	console.log(`Error creating recipe ${options.recipeName} for edition ${options.wikiPath}: ${recipeRes.error}`);
		// 	return;
		// }

		const tiddler_files_path = path.resolve(options.wikiPath, $tw.config.wikiTiddlersSubDir)
		const tiddlersFromPath: TiddlerInfo[] = $tw.loadTiddlersFromPath(resolve($tw.boot.corePath, $tw.config.editionsPath, tiddler_files_path));
		// console.log(tiddlersFromPath);
		// Save the tiddlers
		await store.saveTiddlersFromPath(tiddlersFromPath, options.bagName);
	}
}
interface TiddlerInfo { tiddlers: TiddlerFields[], filepath: string, type: string, hasMetaFile: boolean }