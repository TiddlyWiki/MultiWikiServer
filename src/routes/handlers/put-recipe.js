/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/put-recipe.js
type: application/javascript
module-type: mws-route

PUT /recipes/:recipe_name

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["PUT"],
	path: /^\/recipes\/(.+)$/,
	pathParams: ["recipe_name"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		recipe_name: z.uriComponent(),
	}));

	const {recipe_name} = state.pathParams;

	await state.checkACL("recipe", recipe_name, "WRITE");

	zodAssert.data(state, z => z.object({
		bag_names: z.array(z.string()).optional(),
		description: z.string().optional(),
	}));

	// result is a validation error object
	var result = await state.store.createRecipe(recipe_name,
		state.data.bag_names,
		state.data.description
	);

	if(!result) {
		state.sendEmpty(204);
	} else {
		state.sendResponse(400, {"Content-Type": "text/plain"}, result.message, "utf8");
	}

});
