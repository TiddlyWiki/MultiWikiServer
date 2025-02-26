/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-logout.js
type: application/javascript
module-type: mws-route

POST /logout

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["POST"],
	path: /^\/logout$/,
	useACL: {csrfDisable: true},
}, async state => {
	if(state.authenticatedUser) {
		await state.store.sql.deleteSession(state.authenticatedUser.sessionId);
	}
	var cookies = state.headers.cookie ? state.headers.cookie.split(";") : [];
	for(var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i]?.trim().split("=")[0];
		state.setHeader("Set-Cookie", cookie + "=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict");
	}

	// response.setHeader("Set-Cookie", "session=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
	// response.setHeader("Set-Cookie", "returnUrl=; HttpOnly; Path=/");
	// state.writeHead(302, {"Location": "/login"});
	// state.end();

	state.redirect("/login");
});
