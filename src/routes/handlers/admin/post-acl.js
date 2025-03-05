/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-acl.js
type: application/javascript
module-type: mws-route

POST /admin/post-acl

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/admin\/post-acl\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {

	zodAssert.data(state, z => z.object({
		entity_type: z.enum(["recipe", "bag"]),
		recipe_name: z.prismaField("Recipes", "recipe_name", "string").optional(),
		bag_name: z.prismaField("Bags", "bag_name", "string").optional(),
		// I don't know why these were optional in the original code
		role_id: z.prismaField("Roles", "role_id", "parse-number"),
		permission_id: z.prismaField("Acl", "permission", "string").refine(e => state.store.isPermissionName(e))
	}));

	const {
		
		entity_type,
		recipe_name,
		bag_name,
		role_id,
		permission_id
	} = state.data;

	
	var isRecipe = entity_type === "recipe"
	const entity_name = isRecipe ? recipe_name : bag_name;
	if(!entity_name) return state.sendEmpty(400);
	
	try {
		var entityAclRecords = await state.store.sql.getACLByName(entity_type, entity_name, undefined, false);

		var aclExists = entityAclRecords.some((record) => (
			record.role_id == role_id && record.permission == permission_id
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
			entity_type,
			entity_name,
			role_id,
			permission_id
		)
		return state.redirect(`/admin/acl/${recipe_name}/${bag_name}`);
	} catch(error) {
		return state.redirect(`/admin/acl/${recipe_name}/${bag_name}`);
	}
});
