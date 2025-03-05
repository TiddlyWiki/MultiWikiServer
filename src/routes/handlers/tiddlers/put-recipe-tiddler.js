/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/put-recipe-tiddler.js
type: application/javascript
module-type: mws-route

PUT /recipes/:recipe_name/tiddlers/:title

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["PUT"],
	path: /^\/recipes\/([^\/]+)\/tiddlers\/(.+)$/,
	pathParams: ["recipe_name", "title"],
	bodyFormat: "json",
	useACL: {},
}, async state => {
	zodAssert.pathParams(state, z => ({
		recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
		title: z.prismaField("Tiddlers", "title", "string"),
	}));

	await state.checkACL("recipe", state.pathParams.recipe_name, "WRITE");

	const {recipe_name, title} = state.pathParams;

	// since the second param matches one or more characters, title should always be a string
	// safeParseJSON returns an empty object if parsing fails, which makes fields.title undefined,
	// so it wouldn't match that path and would return a 404, but a 400 is better to return,
	// so we'll just rely on the router to return 400 if the body is not valid JSON
	// here we'll just make sure that data is an object. 
	zodAssert.data(state, z => z.object({title: z.string()}).passthrough());
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
	return state.end();

});
