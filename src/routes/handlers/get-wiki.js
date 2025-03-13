/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-wiki.js
type: application/javascript
module-type: mws-route

GET /wiki/:recipe_name

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["GET"],
	path: /^\/wiki\/([^\/]+)$/,
	pathParams: ["recipe_name"],
	useACL: {},
}, async state => {
	zodAssert.pathParams(state, z => ({
		recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
	}));
	await state.checkACL("recipe", state.pathParams.recipe_name, "READ");

	// Get the recipe name from the parameters
	var recipe_name = state.pathParams.recipe_name,
		allTiddlers = recipe_name && await state.store.getRecipeTiddlers(recipe_name);

	allTiddlers.sort((a, b) => a.position - b.position);

	const recipeTiddlers = Array.from(new Map(allTiddlers.flatMap(bag => bag.tiddlers.map(tiddler => {
		return [tiddler.title, tiddler];
	})))).map(e => e[1]);

	// console.log("GET /wiki/:recipe_name", recipe_name, !!recipeTiddlers);
	// Check request is valid
	if(!recipe_name || !recipeTiddlers) {
		return state.sendEmpty(404);
	}

	state.writeHead(200, {
		"Content-Type": "text/html"
	});
	// Get the tiddlers in the recipe
	// Render the template
	var template = state.store.adminWiki.renderTiddler("text/plain", "$:/core/templates/tiddlywiki5.html", {
		variables: {
			saveTiddlerFilter: `
				$:/boot/boot.css
				$:/boot/boot.js
				$:/boot/bootprefix.js
				$:/core
				$:/library/sjcl.js
				$:/plugins/tiddlywiki/multiwikiclient
				$:/themes/tiddlywiki/snowwhite
				$:/themes/tiddlywiki/vanilla
			`
		}
	});
	// Splice in our tiddlers
	var marker = `<` + `script class="tiddlywiki-tiddler-store" type="application/json">[`,
		markerPos = template.indexOf(marker);
	if(markerPos === -1) {
		throw new Error("Cannot find tiddler store in template");
	}
	/**
	 * 
	 * @param {Record<string, string>} tiddlerFields 
	 */
	function writeTiddler(tiddlerFields) {
		state.write(JSON.stringify(tiddlerFields).replace(/</g, "\\u003c"));
		state.write(",\n");
	}
	state.write(template.substring(0, markerPos + marker.length));
	const
		/** @type {Record<string, string>} */
		bagInfo = {},
		/** @type {Record<string, string>} */
		revisionInfo = {};

	for(const recipeTiddlerInfo of recipeTiddlers) {
		var result = await state.store.getRecipeTiddler(recipeTiddlerInfo.title, recipe_name);
		if(result) {
			bagInfo[result.tiddler.title] = result.bag_name;
			revisionInfo[result.tiddler.title] = result.tiddler_id.toString();
			writeTiddler(result.tiddler);
		}
	}

	writeTiddler({
		title: "$:/state/multiwikiclient/tiddlers/bag",
		text: JSON.stringify(bagInfo),
		type: "application/json"
	});
	writeTiddler({
		title: "$:/state/multiwikiclient/tiddlers/revision",
		text: JSON.stringify(revisionInfo),
		type: "application/json"
	});
	writeTiddler({
		title: "$:/config/multiwikiclient/recipe",
		text: recipe_name
	});
	writeTiddler({
		title: "$:/state/multiwikiclient/recipe/last_tiddler_id",
		text: (await state.store.getRecipeLastTiddlerId(recipe_name) || 0).toString()
	});
	state.write(template.substring(markerPos + marker.length))
	// Finish response
	return state.end();
});


