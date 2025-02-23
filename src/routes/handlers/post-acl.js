/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-acl.js
type: application/javascript
module-type: mws-route

POST /admin/post-acl

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["POST"],
	path: /^\/admin\/post-acl\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {

	zodAssert.data(state, z => z.object({
		entity_name: z.string(),
		entity_type: z.enum(["recipe", "bag"]),
		recipe_name: z.string(),
		bag_name: z.string(),
		role_id: z.parsedNumber().optional(),
		permission_id: z.parsedNumber().optional()
	}));

	const {
		entity_name,
		entity_type,
		recipe_name,
		bag_name,
		role_id,
		permission_id
	} = state.data;


	var isRecipe = entity_type === "recipe"

	try {
		var entityAclRecords = await state.store.sql.getACLByName(entity_type, entity_name, true);

		var aclExists = entityAclRecords.some((record) => (
			record.role_id == role_id && record.permission_id == permission_id
		))

		// This ensures that the user attempting to modify the ACL has permission to do so
		// if(!state.authenticatedUser || (entityAclRecords.length > 0 && !sqlTiddlerDatabase[isRecipe ? 'hasRecipePermission' : 'hasBagPermission'](state.authenticatedUser.user_id, isRecipe ? recipe_name : bag_name, 'WRITE'))){
		// 	response.writeHead(403, "Forbidden");
		// 	response.end();
		// 	return
		// }

		if(aclExists) {
			// do nothing, return the user back to the form
			return state.redirect("/admin/acl/" + recipe_name + "/" + bag_name);
		}

		await state.store.sql.createACL(
			isRecipe ? recipe_name : bag_name,
			entity_type,
			role_id,
			permission_id
		)
		return state.redirect(`/admin/acl/${recipe_name}/${bag_name}`);
	} catch(error) {
		return state.redirect(`/admin/acl/${recipe_name}/${bag_name}`);
	}
});
(function() {
	// const {okEntityType, okType} = require("$:/plugins/tiddlywiki/multiwikiserver/store/sql-tiddler-database");
	// const {ok} = require("assert");

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.method = "POST";

	exports.path = /^\/admin\/post-acl\/?$/;

	exports.bodyFormat = "www-form-urlencoded";

	exports.csrfDisable = true;
	/** @type {ServerRouteHandler<0,"www-form-urlencoded">} */
	exports.handler = async function(request, response, state) {


	};

}());