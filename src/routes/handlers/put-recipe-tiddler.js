/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/put-recipe-tiddler.js
type: application/javascript
module-type: mws-route

PUT /recipes/:recipe_name/tiddlers/:title

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["PUT"],
	path: /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/,
	pathParams: ["recipe_name", "title"],
	bodyFormat: "json",
	useACL: {},
}, async state => {
	zodAssert.pathParams(state, z => ({
		recipe_name: z.uriComponent(),
		title: z.uriComponent(),
	}));

	await state.checkACL("recipe", state.pathParams.recipe_name, "WRITE");

	const {recipe_name, title} = state.pathParams;

	// since the second param matches one or more characters, title should always be a string
	// safeParseJSON returns an empty object if parsing fails, which makes fields.title undefined,
	// so it wouldn't match that path and would return a 404, but a 400 is better to return,
	// so we'll just rely on the router to return 400 if the body is not valid JSON
	// here we'll just make sure that data is an object. 
	zodAssert.data(state, z => z.record(z.any()));
	const fields = state.data;

	if(title !== fields.title)
		return state.sendString(400, {},
			"Title in URL does not match title in body", "utf8");

	// Check if the recipe exists and the title matches


	var result = await state.store.saveRecipeTiddler(fields, recipe_name);

	if(result) {
		state.writeHead(204, {
			"X-Revision-Number": result.tiddler_id.toString(),
			"X-Bag-Name": result.bag_name,
			Etag: state.makeTiddlerEtag(result),
			"Content-Type": "text/plain"
		});
	} else {
		state.writeHead(400);
	}
	state.end();

});
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.method = "PUT";

	exports.path = /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/;

	exports.useACL = true;

	exports.entityName = "recipe"
	/** @type {ServerRouteHandler<2>} */
	exports.handler = async function(request, response, state) {

	};

}());
