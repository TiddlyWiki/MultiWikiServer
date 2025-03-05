/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/put-bag.js
type: application/javascript
module-type: mws-route

PUT /bags/:bag_name

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["PUT"],
	path: /^\/bags\/(.+)$/,
	bodyFormat: "json",
	pathParams: ["bag_name"],
	useACL: {},
}, async state => {
	zodAssert.pathParams(state, z => ({
		bag_name: z.prismaField("Bags", "bag_name", "string"),
	}));

	await state.checkACL("bag", state.pathParams.bag_name, "WRITE");

	// the old code did not make this optional
	zodAssert.data(state, z => z.object({
		description: z.prismaField("Bags", "description", "string"),
	}));

	var result = await state.store.createBag(state.pathParams.bag_name, state.data.description);

	if(!result) {
		return state.sendEmpty(204, {
			"Content-Type": "text/plain"
		});
	} else {
		return state.sendResponse(400, {
			"Content-Type": "text/plain"
		}, result.message, "utf8");
	}

});
