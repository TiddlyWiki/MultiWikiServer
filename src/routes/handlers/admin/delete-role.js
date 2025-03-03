/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-role.js
type: application/javascript
module-type: mws-route

POST /admin/delete-role

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/admin\/delete-role\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {

	zodAssert.data(state, z => z.object({
		role_id: z.prismaField("roles", "role_id", "parse-number"),
	}));

	var role_id = state.data.role_id;

	if(!state.authenticatedUser || !state.authenticatedUser.isAdmin) {
		return state.sendEmpty(403);
	}

	// Check if the role exists
	var role = await state.store.sql.getRoleById(role_id);
	if(!role) {
		return state.sendEmpty(404);
	}

	// Check if the role is in use
	var isRoleInUse = await state.store.sql.isRoleInUse(role_id);
	if(isRoleInUse) {
		await state.store.sql.deleteUserRolesByRoleId(role_id);
	}

	// Delete the role
	await state.store.sql.deleteRole(role_id);
	// Redirect back to the roles management page
	return state.redirect("/admin/roles");
});

