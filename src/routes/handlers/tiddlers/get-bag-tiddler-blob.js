/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-bag-tiddler-blob.js
type: application/javascript
module-type: mws-route

GET /bags/:bag_name/tiddler/:title/blob

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["GET"],
	path: /^\/bags\/([^\/]+)\/tiddlers\/([^\/]+)\/blob$/,
	pathParams: ["bag_name", "title"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		bag_name: z.prismaField("bags", "bag_name", "string"),
		title: z.prismaField("tiddlers", "title", "string"),
	}));

	const {bag_name, title} = state.pathParams;

	if(!bag_name || !title) return state.sendEmpty(404, {"x-reason": "bag_name or title not found"});

	await state.checkACL("bag", bag_name, "READ");

	const result = await state.store.getBagTiddlerStream(title, bag_name);

	if(!result) return state.sendEmpty(404, {"x-reason": "no result"});

	return state.sendStream(200, {
		Etag: state.makeTiddlerEtag(result),
		"Content-Type": result.type
	}, result.stream);


});