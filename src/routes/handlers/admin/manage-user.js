/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/manage-user.js
type: application/javascript
module-type: mws-route

GET /admin/users/:user_id

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/admin\/users\/([^\/]+)\/?$/,
	pathParams: ["user_id"],
	useACL: {},
}, async state => {
	zodAssert.pathParams(state, z => ({
		user_id: z.prismaField("users", "user_id", "parse-number"),
	}));

	var user_id = state.pathParams.user_id;
	var userData = await state.store.sql.getUser(user_id);

	// Clean up any existing error/success messages if the user_id is different from the "$:/temp/mws/user-info/preview-user-id"
	var lastPreviewedUser = state.store.adminWiki.getTiddlerText("$:/temp/mws/user-info/" + user_id + "/preview-user-id");

	if(user_id !== lastPreviewedUser || state.url.includes("preview")) {
		state.store.adminWiki.deleteTiddler("$:/temp/mws/change-password/" + user_id + "/	error");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/change-password/" + user_id + "/success");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/login/error");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/delete-user/" + user_id + "/error");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/delete-user/" + user_id + "/success");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/update-profile/" + user_id + "/error");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/update-profile/" + user_id + "/success");
	}

	if(!userData) {
		state.writeHead(404, {"Content-Type": "text/html"});
		var errorHtml = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/error", {
			variables: {
				"error-message": "User not found"
			}
		});
		state.write(errorHtml);
		return state.end();
	}

	// Check if the user is trying to access their own profile or is an admin
	var hasPermission = ($tw.utils.parseInt(user_id) === state.authenticatedUser?.user_id) || state.authenticatedUser?.isAdmin;
	if(!hasPermission) {
		return state.sendEmpty(403, {"Content-Type": "text/plain"});
	}

	// Convert dates to strings and ensure all necessary fields are present
	var user = {
		user_id: userData.user_id || "",
		username: userData.username || "",
		email: userData.email || "",
		created_at: userData.created_at ? new Date(userData.created_at).toISOString() : "",
		last_login: userData.last_login ? new Date(userData.last_login).toISOString() : ""
	};

	// Get all roles which the user has been assigned
	var userRole = await state.store.sql.getUserRoles(user_id);
	var allRoles = await state.store.sql.listRoles();

	// sort allRoles by placing the user's role at the top of the list
	allRoles.sort(function(a, b) {
		return (userRole?.roles.some(e => e.role_id === a.role_id) ? -1 : 1)
	});

	state.store.adminWiki.addTiddler(new $tw.Tiddler({
		title: "$:/temp/mws/user-info/" + user_id + "/preview-user-id",
		text: user_id
	}));

	state.writeHead(200, {
		"Content-Type": "text/html"
	});

	// Render the html
	var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
		variables: {
			"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/manage-user",
			"user": JSON.stringify(user),
			"user-initials": user.username.split(" ").map(name => name[0]).join(""),
			"user-role": JSON.stringify(userRole),
			"all-roles": JSON.stringify(allRoles),
			"first-guest-user": state.firstGuestUser ? "yes" : "no",
			"is-current-user-profile": state.authenticatedUser && state.authenticatedUser.user_id === $tw.utils.parseInt(user_id, 10) ? "yes" : "no",
			"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
			"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no",
			"user-id": user_id,
			"user-is-logged-in": !!state.authenticatedUser ? "yes" : "no",
			"has-profile-access": !!state.authenticatedUser ? "yes" : "no"
		}
	});
	state.write(html);
	return state.end();
});
