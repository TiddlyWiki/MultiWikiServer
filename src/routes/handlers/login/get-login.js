/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-login.js
type: application/javascript
module-type: mws-route

GET /login

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["GET"],
	path: /^\/login(\.json)?$/,
	pathParams: ["format"],
	useACL: {},
}, async state => {

	if(state.pathParams.format) {
		return state.sendJSON(200, {
			isLoggedIn: !!state.authenticatedUser,
		});
	} else {
		return state.sendDevServer();
	}

});
