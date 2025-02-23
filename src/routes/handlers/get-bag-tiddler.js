/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-bag-tiddler.js
type: application/javascript
module-type: mws-route

GET /bags/:bag_name/tiddler/:title

Parameters:

fallback=<url> // Optional redirect if the tiddler is not found

\*/


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/,
	pathParams: ["bag_name", "title"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		bag_name: z.uriComponent(),
		title: z.uriComponent(),
	}));

	const {bag_name, title} = state.pathParams;

	await state.checkACL("bag", bag_name, "READ");

	// Get the  parameters
	const tiddlerInfo = await state.store.getBagTiddler(title, bag_name);
	if(tiddlerInfo && tiddlerInfo.tiddler) {
		// If application/json is requested then this is an API request, and gets the response in JSON
		if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
			return state.sendResponse(200, {
				Etag: state.makeTiddlerEtag(tiddlerInfo),
				"Content-Type": "application/json"
			}, JSON.stringify(tiddlerInfo.tiddler), "utf8");

		} else {
			// This is not a JSON API request, we should return the raw tiddler content
			const result = await state.store.getBagTiddlerStream(title, bag_name);
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
		// Redirect to fallback URL if tiddler not found
		const fallback = state.queryParams.fallback?.[0];
		if(fallback) {
			return state.redirect(fallback);
		} else {
			return state.sendEmpty(404);
		}
	}
});


