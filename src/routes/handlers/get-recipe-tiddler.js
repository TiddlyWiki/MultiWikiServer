/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-recipe-tiddler.js
type: application/javascript
module-type: mws-route

GET /recipes/:recipe_name/tiddler/:title

Parameters:

fallback=<url> // Optional redirect if the tiddler is not found

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/,
	pathParams: ["recipe_name", "title"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		recipe_name: z.uriComponent(),
		title: z.uriComponent(),
	}));

	zodAssert.queryParams(state, z => ({
		fallback: z.array(z.string()).optional()
	}));

	const {recipe_name, title} = state.pathParams;

	await state.checkACL("recipe", recipe_name, "READ");

	// Get the  parameters
	var tiddlerInfo = await state.store.getRecipeTiddler(title, recipe_name);
	if(tiddlerInfo && tiddlerInfo.tiddler) {
		// If application/json is requested then this is an API request, and gets the response in JSON
		if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
			return state.sendResponse(200, {
				"X-Revision-Number": tiddlerInfo.tiddler_id,
				"X-Bag-Name": tiddlerInfo.bag_name,
				Etag: state.makeTiddlerEtag(tiddlerInfo),
				"Content-Type": "application/json"
			}, JSON.stringify(tiddlerInfo.tiddler), "utf8");
		} else {
			// This is not a JSON API request, we should return the raw tiddler content
			const result = await state.store.getBagTiddlerStream(title, tiddlerInfo.bag_name);
			if(result) {
				return state.sendStream(200, {
					Etag: state.makeTiddlerEtag(result),
					"Content-Type": result.type
				}, result.stream);
			} else {
				return state.sendEmpty(404);
			}
		}
	} else {
		// Redirect to fallback URL if tiddler not found4
		const fallback = state.queryParams.fallback?.[0];
		if(fallback) {
			return state.redirect(fallback);
		} else {
			return state.sendEmpty(404);
		}
	}
});