/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-bag.js
type: application/javascript
module-type: mws-route

POST /bags

Parameters:

bag_name
description

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/bags$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true}
}, async state => {

	zodAssert.data(state, z => z.object({
		bag_name: z.prismaField("Bags", "bag_name", "string"),
		description: z.prismaField("Bags", "description", "string").default("")
	}));

	await state.checkACL("bag", state.data.bag_name, "WRITE");

	// this returns a validation result object
	const error = await state.store.createBag(state.data.bag_name, state.data.description);

	if(!error) {
		return state.redirect("/");
	} else {
		return state.sendString(400, {}, error.message, "utf8");
	}
});
