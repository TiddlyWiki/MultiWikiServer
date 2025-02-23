/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-login.js
type: application/javascript
module-type: mws-route

POST /login

Parameters:

username
password

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["POST"],
	path: /^\/login$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true}
}, async state => {
	zodAssert.data(state, z => z.object({
		username: z.string(),
		password: z.string()
	}));


	var username = state.data.username;
	var password = state.data.password;
	var user = await state.store.sql.getUserByUsername(username);
	var isPasswordValid = state.auth.verifyPassword(password, user ? user.password : null)

	if(user && isPasswordValid) {
		var sessionId = await state.auth.createSession(user.user_id);
		var returnUrl = state.server.parseCookieString(state.headers.cookie).returnUrl
		state.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; Path=/`);
		if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
			return state.sendResponse(200, {"Content-Type": "application/json"}, JSON.stringify({
				"sessionId": sessionId
			}));
		} else {
			return state.redirect(returnUrl || "/");
		}
	} else {
		state.store.adminWiki.addTiddler(new $tw.Tiddler({
			title: "$:/temp/mws/login/error",
			text: "Invalid username or password"
		}));
		if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
			return state.sendResponse(200, {"Content-Type": "application/json"}, JSON.stringify({
				"message": "Invalid username or password"
			}));
		} else {
			return state.redirect('/login');
		}
	}
	return state.sendEmpty(400);
});
