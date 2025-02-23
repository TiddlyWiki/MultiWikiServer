/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-recipe-tiddlers-json.js
type: application/javascript
module-type: mws-route

GET /recipes/:recipe_name/tiddlers.json?last_known_tiddler_id=:last_known_tiddler_id&include_deleted=true|false

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/recipes\/([^\/]+)\/tiddlers.json$/,
	pathParams: ["recipe_name"],
	queryParams: ["last_known_tiddler_id", "include_deleted"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		recipe_name: z.uriComponent(),
	}));

	zodAssert.queryParams(state, z => ({
		last_known_tiddler_id: z.array(z.parsedNumber()).optional(),
		include_deleted: z.array(z.string()).optional(),
	}));

	const {recipe_name} = state.pathParams;
	const include_deleted = state.queryParams.include_deleted?.[0] === "true";
	const last_known_tiddler_id = state.queryParams.last_known_tiddler_id?.[0];

	await state.checkACL("recipe", recipe_name, "READ");

	// Get the  parameters
	var recipeTiddlers = await state.store.getRecipeTiddlers(recipe_name, {
		last_known_tiddler_id,
		include_deleted,
	});
	if(recipeTiddlers) {
		state.sendResponse(200, {
			"Content-Type": "application/json"
		}, JSON.stringify(recipeTiddlers), "utf8");
	} else {
		state.sendEmpty(404);
	}
});
