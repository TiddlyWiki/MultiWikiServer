/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-bag-tiddler-blob.js
type: application/javascript
module-type: mws-route

GET /bags/:bag_name/tiddler/:title/blob

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/bags\/([^\/]+)\/tiddlers\/([^\/]+)\/blob$/,
	pathParams: ["bag_name", "title"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		bag_name: z.uriComponent(),
		title: z.uriComponent(),
	}));

	const {bag_name, title} = state.pathParams;

	if(!bag_name || !title) return state.sendEmpty(404);

	await state.checkACL("bag", bag_name, "READ");

	const result = await state.store.getBagTiddlerStream(title, bag_name);

	if(!result) return state.sendEmpty(404);

	return state.sendStream(200, {
		// not sure where copilot got this one
		// "X-Revision-Number": result.tiddler_id.toString(), 
		Etag: state.makeTiddlerEtag(result),
		"Content-Type": result.type
	}, result.stream);


});