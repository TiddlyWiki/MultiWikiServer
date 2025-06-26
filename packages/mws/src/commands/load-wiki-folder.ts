import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { TiddlerStore_PrismaBase } from "../managers/TiddlerStore";
import { CacheState } from "../services/cache";
import { TiddlerFields, TW } from "tiddlywiki";
import * as fs from "fs";
import * as path from "path";


export const info: CommandInfo = {
	name: "load-wiki-folder",
	description: "Load a TiddlyWiki folder into a bag",
	arguments: [
		["path", "Path to the folder containing a tiddlywiki.info file"],
	],
	options: [
		["bag-name <string>", "Name of the bag to load tiddlers into"],
		["bag-description <string>", "Description of the bag"],
		["recipe-name <string>", "Name of the recipe to create"],
		["recipe-description <string>", "Description of the recipe"],
		["overwrite", "Confirm that you want to overwrite existing content"]
	],
};
// tiddlywiki --load ./mywiki.html --savewikifolder ./mywikifolder
export class Command extends BaseCommand<[string], {
	"bag-name"?: string[];
	"bag-description"?: string[];
	"recipe-name"?: string[];
	"recipe-description"?: string[];
	"overwrite"?: boolean;
}> {


	async execute() {

		// Check parameters
		if (this.params.length < 1) {
			throw "Missing parameters for load-wiki-folder command";
		}

		if (!this.options["bag-name"])
			throw new Error("missing required option bag-name");
		if (!this.options["bag-description"])
			throw new Error("missing required option bag-description");
		if (!this.options["recipe-name"])
			throw new Error("missing required option recipe-name");
		if (!this.options["recipe-description"])
			throw new Error("missing required option recipe-description");

		const overwrite = !!this.options["overwrite"];


		const bagName = this.options["bag-name"][0] as PrismaField<"Bags", "bag_name">;
		const bagDescription = this.options["bag-description"][0] as PrismaField<"Bags", "description">;
		const recipeName = this.options["recipe-name"][0] as PrismaField<"Recipes", "recipe_name">;
		const recipeDescription = this.options["recipe-description"][0] as PrismaField<"Recipes", "description">;

		if (!overwrite && await this.config.engine.recipes.findUnique({
			where: { recipe_name: recipeName }
		})) {
			console.log(`Recipe with name ${recipeName} already exists. Use --overwrite to overwrite it. Skipping.`);
			return;
		}

		const makeQueries = (prisma: PrismaTxnClient) => {
			const store = new TiddlerStore_PrismaBase(prisma);
			const queries = loadWikiFolder({
				wikiPath: this.params[0],
				bagName,
				bagDescription,
				recipeName,
				recipeDescription,
				overwrite,
				store,
				$tw: this.$tw,
				cache: this.config.pluginCache
			});
			queries.forEach((e: any) => {
				if (e.toString() !== "[object PrismaPromise]")
					throw new Error("Expected PrismaPromise, got " + e.toString());
				// console.log(JSON.stringify(e.spec, null, 2));
			});
			return queries;
		}

		if (true) {
			await this.config.engine.$transaction(makeQueries(this.config.engine)).catch((err) => {
				console.error("Error loading wiki folder:", err.stack);
				throw new Error(`Failed to load wiki folder: ${err.message}`);
			});
		} else {
			await this.config.engine.$transaction(async prisma => {
				const queries = makeQueries(prisma as any);
				// for (const query of queries) {
				// 	await query.catch(err => {
				// 		console.error("Error in query:", err.message);
				// 		console.log(new Error().stack);
				// 		throw err;
				// 	});
				// }
			}).catch((err) => {
				console.error("Error loading wiki folder:", err.stack);
				throw new Error(`Failed to load wiki folder: ${err.message}`);
			});
		}

		console.log(info.name, "complete:", this.params[0])
		return null;
	}


}


// Copy TiddlyWiki core editions
function loadWikiFolder({ $tw, store, cache, ...options }: {
	wikiPath: string,
	bagName: PrismaField<"Bags", "bag_name">,
	bagDescription: PrismaField<"Bags", "description">,
	recipeName: PrismaField<"Recipes", "recipe_name">,
	recipeDescription: PrismaField<"Recipes", "description">,
	overwrite: boolean;
	store: TiddlerStore_PrismaBase,
	$tw: TW,
	cache: CacheState,
}) {
	const pluginNamesTW5: string[] = [];
	const tiddlersFromPath = loadWikiTiddlers($tw, options.wikiPath, [], pluginNamesTW5);
	// Add plugins to the recipe list
	const recipeList = [];
	// Create the recipe
	recipeList.push({
		bag_name: options.bagName,
		with_acl: true as PrismaField<"Recipe_bags", "with_acl">,
	});
	recipeList.reverse();


	const plugins = pluginNamesTW5.map(e => ({
		plugin: cache.filePlugins.get(path.join("tiddlywiki", $tw.version, e)),
		folder: e,
	}));

	plugins.forEach(e => {
		if (!e.plugin) console.log(`Folder ${options.wikiPath} missing ${e.folder}.`)
	});

	return [
		// create the bag
		store.upsertBag_PrismaPromise(options.bagName, options.bagDescription),
		// create the recipe and recipe_bags entries
		...store.upsertRecipe_PrismaArray(
			options.recipeName,
			options.recipeDescription,
			recipeList,
			plugins.map(e => e.plugin).filter(truthy)
		),
		// save the tiddlers (this will skip attachments)
		...store.saveTiddlersFromPath_PrismaArray(options.bagName, tiddlersFromPath.map(e => e.tiddlers).flat())
	];

}

function loadWikiTiddlers($tw: TW, wikiPath: string, parentPaths: string[], pluginNamesTW5: string[]) {
	// Read the tiddlywiki.info file
	const wikiInfoPath = path.resolve(wikiPath, $tw.config.wikiInfo);
	let wikiInfo: any;
	if (fs.existsSync(wikiInfoPath)) {
		wikiInfo = $tw.utils.parseJSONSafe(fs.readFileSync(wikiInfoPath, "utf8"), function () { return null; });
	}
	if (!wikiInfo) return [];

	const tiddlersFromPath: { tiddlers: TiddlerFields[] }[] = [];

	if (wikiInfo.includeWikis) {
		parentPaths = parentPaths.slice(0);
		parentPaths.push(wikiPath);
		$tw.utils.each(wikiInfo.includeWikis, function (info) {
			if (typeof info === "string") {
				info = { path: info };
			}
			var resolvedIncludedWikiPath = path.resolve(wikiPath, info.path);
			if (parentPaths.indexOf(resolvedIncludedWikiPath) === -1) {
				tiddlersFromPath.push(...loadWikiTiddlers($tw, resolvedIncludedWikiPath, parentPaths, pluginNamesTW5));
			} else {
				$tw.utils.error("Cannot recursively include wiki " + resolvedIncludedWikiPath);
			}
		});
	}


	const twFolder = path.join($tw.boot.corePath, "..");
	const extraPlugins: string[] = [];

	const loadPlugins = (plugins: string[], libraryPath: any, envVar: any) => {
		$tw.utils.each(plugins, function (pluginName: string) {
			const pluginPaths = $tw.getLibraryItemSearchPaths(libraryPath, envVar);
			const pluginPath = $tw.findLibraryItem(pluginName, pluginPaths);
			if (!pluginPath) return;
			const relPath = path.relative(twFolder, pluginPath);
			if (relPath.startsWith("..")) extraPlugins.push(pluginPath);
			else pluginNamesTW5.push(relPath);
		});
	}

	loadPlugins(wikiInfo.plugins, $tw.config.pluginsPath, $tw.config.pluginsEnvVar);
	loadPlugins(wikiInfo.themes, $tw.config.themesPath, $tw.config.themesEnvVar);
	loadPlugins(wikiInfo.languages, $tw.config.languagesPath, $tw.config.languagesEnvVar);

	const tiddler_files_path = path.resolve(wikiPath, $tw.config.wikiTiddlersSubDir);

	tiddlersFromPath.push(...$tw.loadTiddlersFromPath(path.resolve(tiddler_files_path)) as any);

	const loadWikiPlugins = (wikiPluginsPath: string) => {
		if (fs.existsSync(wikiPluginsPath)) {
			var pluginFolders = fs.readdirSync(wikiPluginsPath);
			for (var t = 0; t < pluginFolders.length; t++) {
				extraPlugins.push(path.resolve(wikiPluginsPath, "./" + pluginFolders[t]));
			}
		}
	}

	loadWikiPlugins(path.resolve(wikiPath, $tw.config.wikiPluginsSubDir));
	loadWikiPlugins(path.resolve(wikiPath, $tw.config.wikiThemesSubDir));
	loadWikiPlugins(path.resolve(wikiPath, $tw.config.wikiLanguagesSubDir));

	extraPlugins.forEach((e) => {
		const plugin = $tw.loadPluginFolder(e);
		if (!plugin) {
			console.log(`No plugin found at ${e}`);
		} else if (!plugin.title) {
			console.log(`Found a valid plugin at ${e} but it doesn't have a title.`);
		} else {
			console.log(`Loading plugin ${e} into bag since it isn't a TiddlyWiki plugin`);
			tiddlersFromPath.push({ tiddlers: [plugin as TiddlerFields] });
		}
		return undefined;
	});

	return tiddlersFromPath;

}

