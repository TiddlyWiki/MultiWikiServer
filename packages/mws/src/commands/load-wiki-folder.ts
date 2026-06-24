import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { CacheState } from "../services/cache";
import { TiddlerFields, TW } from "tiddlywiki";
import * as fs from "fs";
import * as path from "path";

interface ImportedPlugin {
	title: string;
	version: string;
	sourcePath: string;
}

export const info: CommandInfo = {
	name: "load-wiki-folder",
	description: "Load a TiddlyWiki folder into a bag and create a recipe if needed",
	arguments: [
		["path", "Path to the folder containing a tiddlywiki.info file"],
	],
	options: [
		["bag-name <string>", "Name of the bag to load tiddlers into"],
		["bag-description <string>", "Description of the bag"],
		["recipe-name <string>", "Recipe slug to create for /wiki/<slug>"],
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

		const bagName = this.options["bag-name"][0] as PrismaField<"Bag", "name">;
		const bagDescription = this.options["bag-description"][0]!;
		const recipeSlug = this.options["recipe-name"][0]!;
		const recipeDescription = this.options["recipe-description"][0]!;

		const existingRecipe = await this.config.engine.recipe.findFirst({
			where: { slug: recipeSlug },
			select: {
				id: true,
				recipe_bags: {
					select: {
						is_writable: true,
					},
				},
			},
		});

		if (!overwrite && existingRecipe) {
			console.log(`Recipe with slug ${recipeSlug} already exists. Use --overwrite to reset it and reload the bag contents. Skipping.`);
			return;
		}

		const bag = await this.config.engine.bag.upsert({
			where: { name: bagName },
			update: { description: bagDescription },
			create: { name: bagName, description: bagDescription },
			select: { id: true, name: true },
		});

		const savedRecipeId = await this.config.$transaction(async (prisma) => {
			return await loadWikiFolder({
				prisma,
				wikiPath: this.params[0],
				bagId: bag.id,
				recipeId: existingRecipe?.id,
				recipeSlug,
				recipeDescription,
				createRecipe: !existingRecipe,
				$tw: this.$tw,
				cache: this.config.pluginCache,
			});
		});

		console.log(`Recipe slug ${recipeSlug} is stored with recipe id ${savedRecipeId}.`);
		console.log(info.name, "complete:", this.params[0])
		return null;
	}


}


// Copy TiddlyWiki core editions
async function loadWikiFolder({ prisma, $tw, cache, ...options }: {
	prisma: PrismaTxnClient,
	wikiPath: string,
	bagId: PrismaField<"Bag", "id">,
	recipeId?: PrismaField<"Recipe", "id">,
	recipeSlug: string,
	recipeDescription: string,
	createRecipe: boolean,
	$tw: TW,
	cache: CacheState,
}) {
	const importedPlugins: ImportedPlugin[] = [];
	const tiddlersFromPath = loadWikiTiddlers($tw, options.wikiPath, [], importedPlugins);
	const tiddlers = dedupeTiddlersByTitle(tiddlersFromPath.map(e => e.tiddlers).flat());
	const plugins = dedupePlugins(importedPlugins).filter((plugin) => {
		if (cache.pluginFiles.has(plugin.title)) return true;
		console.log(`Folder ${options.wikiPath} missing ${plugin.sourcePath}.`);
		return false;
	});

	const template = await prisma.template.create({
		data: {
			type: "prefixV1",
			definition: {
				readonlyBags: [],
				writablePrefixBags: {
					"": options.bagId,
				},
			},
		},
		select: { id: true },
	});

	let recipeId = options.recipeId;

	if (options.createRecipe) {
		const recipe = await prisma.recipe.create({
			data: {
				...(recipeId ? { id: recipeId } : {}),
				slug: options.recipeSlug,
				description: options.recipeDescription,
				template_id: template.id,
				parameters: {},
			},
			select: { id: true },
		});
		recipeId = recipe.id;
	} else {
		if (!recipeId) throw new Error("Existing recipe id is required for overwrite");
		await prisma.recipe.update({
			where: { id: recipeId },
			data: {
				slug: options.recipeSlug,
				description: options.recipeDescription,
				template_id: template.id,
				parameters: {},
			},
		});
		await prisma.recipeBag.deleteMany({ where: { recipe_id: recipeId } });
		await prisma.recipePlugin.deleteMany({ where: { recipe_id: recipeId } });
	}

	if (!recipeId) throw new Error("Recipe id was not created");

	await prisma.recipeBag.create({
		data: {
			recipe_id: recipeId,
			bag_id: options.bagId,
			priority: 0,
			is_writable: true,
			info: { prefix: "" },
		},
	});

	for (const plugin of plugins) {
			const pluginRow = await prisma.plugin.upsert({
				where: {
					name_version: {
						name: plugin.title,
						version: plugin.version,
					},
				},
				update: {},
				create: {
					name: plugin.title,
					version: plugin.version,
				},
				select: { id: true },
			});

			await prisma.recipePlugin.upsert({
				where: {
					recipe_id_plugin_id: {
						recipe_id: recipeId,
						plugin_id: pluginRow.id,
					},
				},
				update: { resolved_version: plugin.title },
				create: {
					recipe_id: recipeId,
					plugin_id: pluginRow.id,
					resolved_version: plugin.title,
				},
			});
	}

	await prisma.tiddler.deleteMany({ where: { bag_id: options.bagId } });
	for (const tiddler of tiddlers) {
		const fields = normalizeTiddlerFields(tiddler);
		await prisma.tiddler.create({
			data: {
				bag_id: options.bagId,
				title: fields.title,
				fields,
			},
		});
	}

	return recipeId;
}

function loadWikiTiddlers($tw: TW, wikiPath: string, parentPaths: string[], importedPlugins: ImportedPlugin[]) {
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
				tiddlersFromPath.push(...loadWikiTiddlers($tw, resolvedIncludedWikiPath, parentPaths, importedPlugins));
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
			const plugin = $tw.loadPluginFolder(pluginPath);
			if (!plugin?.title) return;
			const relPath = path.relative(twFolder, pluginPath);
			if (relPath.startsWith("..")) extraPlugins.push(pluginPath);
			else importedPlugins.push({
				title: plugin.title,
				version: typeof plugin.version === "string" && plugin.version ? plugin.version : $tw.version,
				sourcePath: relPath,
			});
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

function dedupePlugins(plugins: ImportedPlugin[]) {
	const uniquePlugins = new Map<string, ImportedPlugin>();
	for (const plugin of plugins) {
		uniquePlugins.set(`${plugin.title}\u0000${plugin.version}`, plugin);
	}
	return Array.from(uniquePlugins.values());
}

function dedupeTiddlersByTitle(tiddlers: TiddlerFields[]) {
	const uniqueTiddlers = new Map<string, TiddlerFields>();
	for (const tiddler of tiddlers) {
		const title = typeof tiddler.title === "string" ? tiddler.title : "";
		if (!title) throw new Error("Tiddler must have a title");
		uniqueTiddlers.set(title, tiddler);
	}
	return Array.from(uniqueTiddlers.values());
}

function normalizeTiddlerFields(tiddler: TiddlerFields) {
	const normalized = Object.fromEntries(
		Object.entries(tiddler).flatMap(([fieldName, fieldValue]) => {
			if (fieldValue === undefined) return [];
			return [[fieldName, typeof fieldValue === "string" ? fieldValue : `${fieldValue}`] as const];
		})
	);
	if (!normalized.title) throw new Error("Tiddler must have a title");
	return normalized as Record<string, string> & { title: string };
}

