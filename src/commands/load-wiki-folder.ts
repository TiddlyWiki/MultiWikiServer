/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-load-wiki-folder.js
type: application/javascript
module-type: command

Command to create and load a bag for the specified core editions

--load-wiki-folder <path> <bag-name> <bag-description> <recipe-name> <recipe-description>

\*/


import { resolve } from "path";
import { Commander, CommandInfo } from "../commander";
import { TiddlerStore } from "../routes/TiddlerStore";
import { TiddlerFields } from "../services/attachments";

export const info: CommandInfo = {
	name: "load-wiki-folder",
	description: "Load a TiddlyWiki folder into a bag",
	arguments: [
		["path", "Path to the TiddlyWiki5 plugins folder"],
		["bag-name", "Name of the bag to load tiddlers into"],
		["bag-description", "Description of the bag"],
		["recipe-name", "Name of the recipe to create"],
		["recipe-description", "Description of the recipe"],
	],
	synchronous: true
};
// tiddlywiki --load ./mywiki.html --savewikifolder ./mywikifolder
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

		await this.commander.engine.$transaction(loadWikiFolder({
			wikiPath: this.params[0] as string,
			bagName: this.params[1] as PrismaField<"Bags", "bag_name">,
			bagDescription: this.params[2] as PrismaField<"Bags", "description">,
			recipeName: this.params[3] as PrismaField<"Recipes", "recipe_name">,
			recipeDescription: this.params[4] as PrismaField<"Recipes", "description">,
			store: new TiddlerStore(this.commander, this.commander.engine),
			$tw: this.commander.$tw
		}));
		console.log(info.name, "complete:", this.params[0])
		return null;
	}
}


// Function to convert a plugin name to a bag name
function makePluginBagName(type: string, publisher: string | undefined, name: string) {
	return "$:/" + type + "/" + (publisher ? publisher + "/" : "") + name;
}

// Copy TiddlyWiki core editions
function loadWikiFolder({ $tw, store, ...options }: {
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
	if (!wikiInfo) return [];
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


	const tiddler_files_path = path.resolve(options.wikiPath, $tw.config.wikiTiddlersSubDir)
	const tiddlersFromPath: TiddlerInfo[] = $tw.loadTiddlersFromPath(
		resolve($tw.boot.corePath, $tw.config.editionsPath, tiddler_files_path)
	);

	const is_plugin = false as PrismaField<"Bags", "is_plugin">;
	return [
		// create the bag
		store.upsertBag_PrismaPromise(options.bagName, options.bagDescription, is_plugin),
		// create the recipe and recipe_bags entries
		...store.upsertRecipe_PrismaArray(
			options.recipeName,
			options.recipeDescription,
			recipeList,
		),
		// save the tiddlers (this will skip attachments)
		...store.saveTiddlersFromPath_PrismaArray(tiddlersFromPath, options.bagName)
	];

}
interface TiddlerInfo { tiddlers: TiddlerFields[], filepath: string, type: string, hasMetaFile: boolean }