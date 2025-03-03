/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-acl.js
type: application/javascript
module-type: mws-route

POST /admin/delete-acl

\*/


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/admin\/delete-acl\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: { csrfDisable: true },
}, async (state) => {

	zodAssert.data(state, z => z.object({
		recipe_name: z.prismaField("recipes", "recipe_name", "string"),
		bag_name: z.prismaField("bags", "bag_name", "string"),
		acl_id: z.prismaField("acl", "acl_id", "parse-number"),
		entity_type: z.string().refine(state.store.isEntityType)
			.describe("entity_type must be 'recipe' or 'bag'")
	}));

	const {
		recipe_name,
		bag_name,
		acl_id,
		entity_type
	} = state.data;

	const entity_name = { recipe_name, bag_name }[`${entity_type}_name`];

	await state.checkACL(entity_type, entity_name, "WRITE");

	await state.store.sql.deleteACL(acl_id);

	throw state.redirect("/admin/acl/" + recipe_name + "/" + bag_name);
})

