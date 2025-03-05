/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-bag.js
type: application/javascript
module-type: mws-route

GET /bags/:bag_name/
GET /bags/:bag_name

\*/

"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["GET"],
	path: /^\/bags\/([^\/]+)(\/?)$/,
	pathParams: ["bag_name", "trailing_slash"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		bag_name: z.prismaField("Bags", "bag_name", "string"),
		trailing_slash: z.string().optional()
	}));

	// Redirect if there is no trailing slash. We do this so that the relative URL specified in the upload form works correctly
	if(state.pathParams.trailing_slash !== "/") {
		return state.sendEmpty(301, {location: state.urlInfo.pathname + "/"});
	}

	// technically redundant, since zodAssert would have already returned 404
	if(!state.pathParams.bag_name) throw state.sendEmpty(404);
	const {bag_name} = state.pathParams;

	await state.checkACL("bag", bag_name, "READ");

	const bagTiddlers = await state.store.getBagTiddlers(bag_name);
	if(!bagTiddlers) throw state.sendEmpty(404);

	// If application/json is requested then this is an API request, and gets the response in JSON
	if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
		return state.sendResponse(200, {"Content-Type": "application/json"}, JSON.stringify(bagTiddlers), "utf8");
	} else {
		// This is not a JSON API request, we should return the raw tiddler content
		state.writeHead(200, {
			"Content-Type": "text/html"
		});
		var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
			variables: {
				"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-bag",
				"bag-name": bag_name,
				"bag-titles": JSON.stringify(bagTiddlers.map(bagTiddler => bagTiddler.title)),
				"bag-tiddlers": JSON.stringify(bagTiddlers)
			}
		});
		state.write(html);
		return state.end();
	}

});


