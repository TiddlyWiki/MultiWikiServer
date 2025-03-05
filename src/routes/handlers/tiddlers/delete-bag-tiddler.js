/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-bag-tiddler.js
type: application/javascript
module-type: mws-route

DELETE /bags/:bag_name/tiddler/:title

\*/


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["DELETE"],
	path: /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/,
	pathParams: ["bag_name", "title"],
	bodyFormat: "ignore",
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		bag_name: z.prismaField("Bags", "bag_name", "string"),
		title: z.prismaField("Tiddlers", "title", "string"),
	}));

	const {bag_name, title} = state.pathParams;

	await state.checkACL("bag", bag_name, "WRITE");

	// not sure why this didn't check title before, but I think it should
	if(!bag_name || !title) {throw state.sendEmpty(404)}

	var result = await state.store.deleteTiddler(title, bag_name);
	return state.sendEmpty(204, {
		"X-Revision-Number": result.tiddler_id.toString(),
		Etag: state.makeTiddlerEtag(result),
		"Content-Type": "text/plain"
	});

})
