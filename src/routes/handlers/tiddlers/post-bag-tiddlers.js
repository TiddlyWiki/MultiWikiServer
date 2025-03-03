/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-bag-tiddlers.js
type: application/javascript
module-type: mws-route

POST /bags/:bag_name/tiddlers/

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/bags\/([^\/]+)\/tiddlers\/$/,
	pathParams: ["bag_name"],
	bodyFormat: "stream",
	useACL: {csrfDisable: true},
}, async state => {
	zodAssert.pathParams(state, z => ({
		bag_name: z.prismaField("bags", "bag_name", "string"),
	}));

	await state.checkACL("bag", state.pathParams.bag_name, "WRITE");

	// const processIncomingStream = require("$:/plugins/tiddlywiki/multiwikiserver/routes/helpers/multipart-forms.js").processIncomingStream;
	// Get the  parameters
	var bag_name = state.pathParams.bag_name;
	// Process the incoming data
	const results = await state.processIncomingStream(bag_name);

	// If application/json is requested then this is an API request, and gets the response in JSON
	if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
		return state.sendResponse(200, {"Content-Type": "application/json"}, JSON.stringify({
			"imported-tiddlers": results
		}));
	} else {

		state.writeHead(200, {
			"Content-Type": "text/html"
		});
		state.write(`
						<!doctype html>
						<head>
							<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
						</head>
						<body>
					`);
		// Render the html
		var html = state.store.adminWiki.renderTiddler("text/html", "$:/plugins/tiddlywiki/multiwikiserver/templates/post-bag-tiddlers", {
			variables: {
				"bag-name": bag_name,
				"imported-titles": JSON.stringify(results)
			}
		});
		state.write(html);
		state.write(`
						</body>
						</html>
					`);
		return state.end();

	}
});
