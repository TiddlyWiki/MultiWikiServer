/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-users.js
type: application/javascript
module-type: mws-route

GET /admin/users

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/admin\/users$/,
	useACL: {},
}, async state => {
	var userList = await state.store.sql.listUsers();
	if(state.url.includes("*")) {
		state.store.adminWiki.deleteTiddler("$:/temp/mws/post-user/error");
		state.store.adminWiki.deleteTiddler("$:/temp/mws/post-user/success");
	}

	// Ensure userList is an array
	if (!Array.isArray(userList)) {
		userList = [];
		console.error("userList is not an array");
	}

	if(!state.authenticatedUser?.isAdmin && !state.firstGuestUser) {
		return state.sendEmpty(403, { "Content-Type": "text/plain" });
	}

	state.writeHead(200, {
		"Content-Type": "text/html"
	});

	// Convert dates to strings and ensure all necessary fields are present
	const userList2 = userList.map(user => ({
		user_id: user.user_id || '',
		username: user.username || '',
		email: user.email || '',
		created_at: user.created_at ? new Date(user.created_at).toISOString() : '',
		last_login: user.last_login ? new Date(user.last_login).toISOString() : ''
	}));

	// Render the html
	var html = state.store.adminWiki.renderTiddler("text/plain","$:/plugins/tiddlywiki/multiwikiserver/templates/page",{
		variables: {
			"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-users",
			"user-list": JSON.stringify(userList2),
			"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
			"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no",
			"first-guest-user": state.firstGuestUser ? "yes" : "no"
		}
	});
	state.write(html);
	state.end();
});

