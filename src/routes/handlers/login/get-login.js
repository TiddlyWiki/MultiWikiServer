/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-login.js
type: application/javascript
module-type: mws-route

GET /login

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/login$/,
	useACL: {},
}, async state => {
	// Check if the user already has a valid session
	if(state.authenticatedUser) {
		// User is already logged in, redirect to home page
		return state.redirect("/");
	}

	const loginTitle = "$:/plugins/tiddlywiki/multiwikiserver/auth/form/login";
	var loginTiddler = state.store.adminWiki.getTiddler(loginTitle);

	if(loginTiddler) {
		state.writeHead(200, {"Content-Type": "text/html"});
		state.write(state.store.adminWiki.renderTiddler("text/html", loginTiddler.fields.title));
		return state.end();
	} else {
		state.writeHead(500);
		state.write("Login form is not set up correctly.");
		return state.end();
	}
});
