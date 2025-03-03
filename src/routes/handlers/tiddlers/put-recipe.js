/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/put-recipe.js
type: application/javascript
module-type: mws-route

PUT /recipes/:recipe_name

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["PUT"],
	path: /^\/recipes\/(.+)$/,
	pathParams: ["recipe_name"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		recipe_name: z.prismaField("recipes", "recipe_name", "string"),
	}));

	const {recipe_name} = state.pathParams;

	await state.checkACL("recipe", recipe_name, "WRITE");

	zodAssert.data(state, z => z.object({
		bag_names: z.array(z.prismaField("bags", "bag_name", "string")).optional(),
		description: z.prismaField("recipes", "description", "string").default(""),
	}));

	// result is a validation error object
	var result = await state.store.createRecipe(recipe_name,
		state.data.bag_names,
		state.data.description
	);

	if(!result) {
		return state.sendEmpty(204);
	} else {
		return state.sendResponse(400, {"Content-Type": "text/plain"}, result.message, "utf8");
	}

});
