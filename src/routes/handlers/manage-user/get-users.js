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
	path: /^\/admin\/users(\.json)?$/,
	pathParams: ["isJson"],
	useACL: {},
}, async state => {


	if(!state.authenticatedUser?.isAdmin && !state.firstGuestUser)
		return state.sendEmpty(403, { "Content-Type": "text/plain" });


	if(!state.pathParams.isJson) return state.sendDevServer();

	const userList = await state.store.sql.listUsers();

	state.writeHead(200, { "Content-Type": "application/json" });

	state.write(JSON.stringify({
		"user-list": userList.map(user => ({
			user_id: user.user_id || '',
			username: user.username || '',
			email: user.email || '',
			created_at: user.created_at ? new Date(user.created_at).toISOString() : '',
			last_login: user.last_login ? new Date(user.last_login).toISOString() : ''
		})),
		"username": state.authenticatedUser
			? state.authenticatedUser.username
			: state.firstGuestUser
				? "Anonymous User"
				: "Guest",
		"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no",
		"first-guest-user": state.firstGuestUser ? "yes" : "no"
	}));

	return state.end();
});

