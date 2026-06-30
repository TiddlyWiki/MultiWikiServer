import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { CacheState } from "../services/cache";
import { TiddlerFields, TW } from "tiddlywiki";
import * as fs from "fs";
import * as path from "path";
import { truthy } from "@tiddlywiki/server";
import { importBags, importRecipes, indexImportedBagsByName, toMappingRows, WikiImportWriter } from "../new-managers/wiki-import";
import { RecipeDefinition } from "../new-managers/wiki-actions";

export const info: CommandInfo = {
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
export class Command extends BaseCommand<[string], {
	"bag-name"?: string[];
	"bag-description"?: string[];
	"recipe-name"?: string[];
	"recipe-description"?: string[];
	"owner-roles"?: string[];
	"template-name"?: string[];
	"overwrite"?: boolean;
	"skip-existing"?: boolean;
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

		const templateName = this.options["template-name"]?.[0] ?? "Blank Template";

		const overwrite = !!this.options["overwrite"];
		const skipExisting = !!this.options["skip-existing"];

		const bagName = this.options["bag-name"][0];
		const bagDescription = this.options["bag-description"][0];
		const recipeName = this.options["recipe-name"][0];
		const recipeDescription = this.options["recipe-description"][0];

		const ownerRoles = this.options["owner-roles"] ?? [];

		if (!templateName) {
			throw new Error(`Template ${templateName} does not exist.`);
		}

		this.config.engine.$transaction(async prisma => {
			const importer = new WikiImportWriter(prisma, false);

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
				select: { id: true, definition: true, type: true }
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

			const [bag] = await importer.importBags([{
				name: bagName,
				description: bagDescription,
				permissions: ownerRoles.map(roleId => ({ level: "C_admin", roleId })),
			}]);

			if (!bag) {
				throw new Error(`Failed to create bag ${bagName}`);
			}

			switch (template.type) {
				case "simpleV1": {
					const recipeDefinition: RecipeDefinition = {
						displayName: recipeName,
						description: recipeDescription,
						plugins: pluginTitles,
						readonlyBags: [],
						writablePrefixBags: toMappingRows({ "": bagName }),
					};
					const {
						bags: compiledBags, plugins: compiledPlugins
					} = await importer.compileRecipeSimpleV1(recipeDefinition, template.definition);
					const [recipe] = await importer.importRecipes([{
						compiledBags,
						plugins: compiledPlugins,
						definition: recipeDefinition,
						permissions: ownerRoles.map(roleId => ({ level: "B_write", roleId })),
						slug: recipeName,
						templateId: template.id,
					}]);
					await saveLoadedTiddlers(this.config.engine, bag.id, tiddlers);
				}
			}


			// const compiledRecipe = await importer.compileRecipe({
			// 	slug: recipeName,
			// 	definition: {
			// 		displayName: recipeName,
			// 		description: recipeDescription,
			// 		readonlyBags: [],
			// 		writablePrefixBags: { "": bagName },
			// 		plugins: pluginTitles,
			// 	},
			// 	permissions: ownerRoles.map(roleId => ({ level: "B_write", roleId })),
			// }, template);





			console.log(info.name, "complete:", this.params[0])
		});

		return null;
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
	cache: CacheState,
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

async function saveLoadedTiddlers(prisma: PrismaEngineClient, bag_id: string, tiddlers: TiddlerFields[]) {
	await prisma.$transaction(async (tx) => {
		await tx.tiddler.deleteMany({ where: { bag_id } });

		for (const tiddler of tiddlers) {
			const title = tiddler.title;
			if (!title) {
				throw new Error("Tiddler must have a title");
			}

			const fields = Object.fromEntries(
				Object.entries(tiddler)
					.filter(([, value]) => value !== undefined)
					.map(([fieldName, fieldValue]) => [fieldName, typeof fieldValue === "string" ? fieldValue : `${fieldValue}`])
			);
			const event = await tx.tiddlerEvent.create({
				data: { bag_id, title, type: "save" }
			});

			await tx.tiddler.upsert({
				where: { bag_id_title: { bag_id, title } },
				update: { fields, revision: event.seq },
				create: { bag_id, title, fields, revision: event.seq },
			});

		}
	});

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

