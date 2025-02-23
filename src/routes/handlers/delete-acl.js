/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-acl.js
type: application/javascript
module-type: mws-route

POST /admin/delete-acl

\*/


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["POST"],
	path: /^\/admin\/delete-acl\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {

	zodAssert.data(state, z => z.object({
		recipe_name: z.string(),
		bag_name: z.string(),
		acl_id: z.string()
			.transform(x => parseInt(x))
			.refine(x => !isNaN(x))
			.describe("acl_id must be an integer"),
		entity_type: z.string()
			.refine(isEntityType)
			.describe("entity_type must be 'recipe' or 'bag'")
	}));

	const {
		recipe_name,
		bag_name,
		acl_id,
		entity_type
	} = state.data;

	const entity_name = {recipe_name, bag_name}[`${entity_type}_name`];

	await state.checkACL(entity_type, entity_name, "WRITE");

	await state.store.sql.deleteACL(acl_id);

	throw state.redirect("/admin/acl/" + recipe_name + "/" + bag_name);
})

