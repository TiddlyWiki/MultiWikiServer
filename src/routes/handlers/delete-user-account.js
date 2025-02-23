/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-user-account.js
type: application/javascript
module-type: mws-route

POST /delete-user-account

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["POST"],
	path: /^\/delete-user-account\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {

	zodAssert.data(state, z => z.object({
		userId: z.string()
			.transform(x => parseInt(x))
			.refine(x => !isNaN(x))
			.describe("userId must be an integer"),
	}));


	var userId = state.data.userId;


	// Check if user is admin
	if(!state.authenticatedUser || !state.authenticatedUser.isAdmin) {
		state.store.adminWiki.addTiddler(new $tw.Tiddler({
			title: "$:/temp/mws/delete-user/error",
			text: "You must be an administrator to delete user accounts"
		}));
		return state.redirect('/admin/users/' + userId);
	}

	// Prevent admin from deleting their own account
	if(state.authenticatedUser.user_id === userId) {
		state.store.adminWiki.addTiddler(new $tw.Tiddler({
			title: "$:/temp/mws/delete-user/error",
			text: "Cannot delete your own account"
		}));
		return state.redirect('/admin/users/' + userId);
	}

	// Check if the user exists
	var user = await state.store.sql.getUser(userId);
	if(!user) {
		state.store.adminWiki.addTiddler(new $tw.Tiddler({
			title: "$:/temp/mws/delete-user/error",
			text: "User not found"
		}));
		return state.redirect('/admin/users/' + userId);
	}

	// Check if this is the last admin account
	var adminRole = await state.store.sql.getRoleByName("ADMIN");
	if(!adminRole) {
		state.store.adminWiki.addTiddler(new $tw.Tiddler({
			title: "$:/temp/mws/delete-user/error",
			text: "Admin role not found"
		}));
		return state.redirect('/admin/users/' + userId);
	}

	var adminUsers = await state.store.sql.listUsersByRoleId(adminRole.role_id);
	if(adminUsers.length <= 1 && adminUsers.some(admin => admin.user_id === userId)) {
		state.store.adminWiki.addTiddler(new $tw.Tiddler({
			title: "$:/temp/mws/delete-user/error",
			text: "Cannot delete the last admin account"
		}));
		return state.redirect('/admin/users/' + userId);
	}

	await state.store.sql.deleteUserRolesByUserId(userId);
	await state.store.sql.deleteUserSessions(userId);
	await state.store.sql.deleteUser(userId);

	// Redirect back to the users management page
	return state.redirect('/admin/users');
});
