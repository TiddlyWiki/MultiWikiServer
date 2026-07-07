import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { WikiPluginCache } from "../services/cache";
import { TiddlerFields, TW } from "tiddlywiki";
import * as fs from "fs";
import * as path from "path";
import { truthy } from "@tiddlywiki/server";
import { WikiStore, BagDataAdapter, RecipeDataAdapter, toMappingRows } from "../new-managers";
import { IdString } from "@mws/admin-vanilla/src/definition/tabs";
import { serverEvents } from "@tiddlywiki/events";

serverEvents.on("cli.register", (commands) => {
	commands[info.name] = { info, Command: LoadWikiFolderCommand };
});

const info: CommandInfo = {
	name: "load-wiki-folder",
	description: "Load a TiddlyWiki folder into a bag",
	arguments: [
		["path", "Path to the folder containing a tiddlywiki.info file"],
	],
	options: [
		["recipe-name <string>", "Name of the recipe to create"],
		["recipe-description <string>", "Description of the recipe"],
		["bag-name <string>", "Name of the bag to load tiddlers into"],
		["bag-description <string>", "Description of the bag"],
		["template-name <string>", "Template for this recipe"],
		["owner-roles <string>", "Roles to set on the recipes and bags."],
		["overwrite", "Confirm that you want to overwrite existing content"],
		["skip-existing", "Confirm that you want to skip existing content"],
	],
};
// tiddlywiki --load ./mywiki.html --savewikifolder ./mywikifolder
export class LoadWikiFolderCommand extends BaseCommand<[string], {
	"bag-name"?: string[];
	"bag-description"?: string[];
	"recipe-name"?: string[];
	"recipe-description"?: string[];
	"owner-roles"?: string[];
	"template-name"?: string[];
	"overwrite"?: boolean;
	"skip-existing"?: boolean;
}> {
	static info = info;

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

		const templateName = this.options["template-name"]?.[0] ?? "Blank Template";

		const overwrite = !!this.options["overwrite"];
		const skipExisting = !!this.options["skip-existing"];

		const bagName = this.options["bag-name"][0];
		const bagDescription = this.options["bag-description"][0];
		const recipeName = this.options["recipe-name"][0];
		const recipeDescription = this.options["recipe-description"][0];

		const ownerRoles = (this.options["owner-roles"] ?? []).map((role) => role);

		if (!templateName) {
			throw new Error(`Template ${templateName} does not exist.`);
		}

		this.config.engine.$transaction(async prisma => {

			const existingRecipe = await prisma.recipe.findUnique({
				where: { slug: recipeName },
				select: { id: true },
			});
			const existingBag = await prisma.bag.findUnique({
				where: { name: bagName },
				select: { id: true },
			});
			if ((existingRecipe || existingBag)) {
				if (!overwrite && !skipExisting) {
					throw `Recipe or bag already exists for ${recipeName}. Use --overwrite to overwrite it or --skip-existing to continue.`;
				}
				if (skipExisting) {
					console.log(`Recipe or bag already exists for ${recipeName}. Use --overwrite to overwrite it or --skip-existing to continue.`);
					return;
				}
			}

			const template = await prisma.template.findUnique({
				where: { name: templateName },
				select: { id: true, name: true, type: true }
			});

			if (!template) {
				throw `The specified template name '${templateName}' could not be found.`;
			}

			const { pluginTitles, tiddlers } = loadWikiFolder({
				recipeName,
				recipeDescription,
				bagName,
				bagDescription,
				wikiPath: this.params[0],
				cache: this.config.pluginCache,
				$tw: this.$tw,
			});



			switch (template.type) {
				case "simpleV1": {
					const bag = await new BagDataAdapter({ isAdmin: true } as any).saveRow(prisma, {
						id: new IdString(""), // a blank id will use the name if it exists
							name: bagName,
						description: bagDescription,
						bagPermissions: ownerRoles.map(role => ({ level: "C_admin", role })),
					});

					const recipe = await new RecipeDataAdapter({ isAdmin: true } as any).saveRow(prisma, {
						id: new IdString(""), // a blank id will use the slug if it exists
							slug: recipeName,
							templateName: template.name,
						displayName: recipeName,
						description: recipeDescription,
						plugins: pluginTitles,
						readonlyBags: [],
						writablePrefixBags: toMappingRows({ "": bagName }).map((row) => ({
							prefix: row.prefix,
								bagName: row.bagName,
						})),
						recipePermissions: ownerRoles.map(role => ({ level: "B_write", role })),
					});

					const existingTitles = Array.from(await prisma.tiddler.findMany({
						where: { bag_id: IdString.cast(bag.id) },
						select: { title: true }
					}), e => e.title);

					await saveLoadedTiddlers(prisma, recipe.id, bag.id, tiddlers, existingTitles);
				}
			}

			console.log(info.name, "complete:", this.params[0])
		});

		return null;
	}


}


async function saveLoadedTiddlers(
	tx: PrismaTxnClient,
	recipe_id: IdString,
	bag_id: IdString,
	tiddlers: TiddlerFields[],
	existingTitles: string[],
) {
	const newTitles = new Set(tiddlers.map(e => e.title));
	const store = new WikiStore(tx);
	for (const title of existingTitles) {
		if (!newTitles.has(title)) {
			await store.deleteTiddler({ recipe_id, bag_id, title, });
		}
	}
	for (const fields of tiddlers) {
		const title = fields.title;
		if (!title) throw new Error("Tiddler must have a title");
		await store.saveTiddler({ recipe_id, bag_id, fields, });
	}
}

// Copy TiddlyWiki core editions
function loadWikiFolder({ $tw, cache, ...options }: {
	wikiPath: string,
	bagName: string,
	bagDescription: string,
	recipeName: string,
	recipeDescription: string,
	$tw: TW,
	cache: WikiPluginCache,
}) {
	const pluginNamesTW5: string[] = [];
	const tiddlersFromPath = loadWikiTiddlers($tw, options.wikiPath, [], pluginNamesTW5);

	const plugins = pluginNamesTW5.map(e => ({
		plugin: cache.filePlugins.get(path.join("tiddlywiki", $tw.version, e)),
		folder: e,
	}));

	plugins.forEach(e => {
		if (!e.plugin) console.log(`Folder ${options.wikiPath} missing ${e.folder}.`)
	});

	const pluginTitles = plugins.map((entry) => entry.plugin).filter(truthy);

	return {
		pluginTitles,
		tiddlers: tiddlersFromPath.map((entry) => entry.tiddlers).flat(),
	};

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

