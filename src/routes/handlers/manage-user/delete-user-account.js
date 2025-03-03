/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-user-account.js
type: application/javascript
module-type: mws-route

POST /delete-user-account

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/delete-user-account\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {

	zodAssert.data(state, z => z.object({
		userId: z.prismaField("users", "user_id", "parse-number"),
	}));

	const userId = state.data.userId;

	if(!state.authenticatedUser?.isAdmin) {
		return state.sendSimple(403, "You don't have permission to delete user accounts");
	}

	if(state.authenticatedUser.user_id === userId) {
		return state.sendSimple(403, "You cannot delete your own account");
	}

	var user = await state.store.sql.getUser(userId);
	if(!user) {
		return state.sendSimple(404, "User not found");
	}

	// Check if this is the last admin account
	const adminRole = await state.store.sql.getAdminRole();

	ok(adminRole);

	const adminUsers = await state.store.sql.listUsersByRoleId(adminRole.role_id);

	if(adminUsers.length <= 1 && adminUsers.some(admin => admin.user_id === userId)) {
		return state.sendSimple(403, "Cannot delete the last admin account");
	}

	await state.store.sql.deleteUserRolesByUserId(userId);
	await state.store.sql.deleteUserSessions(userId);
	await state.store.sql.deleteUser(userId);

	return state.sendSimple(200, "User account deleted");
});
