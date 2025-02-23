/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/manage-roles.js
type: application/javascript
module-type: mws-route

GET /admin/manage-roles

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/admin\/manage-roles\/?$/,
	useACL: {csrfDisable: true},
}, async state => {

	if(state.url.includes("*")) {
		state.store.adminWiki.deleteTiddler("$:/temp/mws/post-role/error");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/post-role/success");
	}
	var roles = await state.store.sql.listRoles();
	var editRoleId = state.url.includes("?") ? state.url.split("?")[1]?.split("=")[1] : null;
	var editRole = editRoleId ? roles.find(role => role.role_id === $tw.utils.parseInt(editRoleId, 10)) : null;

	if(editRole && editRole.role_name.toLowerCase().includes("admin")) {
		editRole = null;
		editRoleId = null;
	}

	var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
		variables: {
			"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/manage-roles",
			"roles-list": JSON.stringify(roles),
			"edit-role": editRole ? JSON.stringify(editRole) : "",
			"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
			"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no"
		}
	});
	state.write(html);
	state.end();
});
