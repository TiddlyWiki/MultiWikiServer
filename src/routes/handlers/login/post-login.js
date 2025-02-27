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
export const route = (root) => (root.defineRoute({
	method: ["POST"],
	path: /^\/login(\.json)?$/,
	pathParams: ["format"],
	bodyFormat: "www-form-urlencoded",
	useACL: { csrfDisable: true }
}, async state => {
	zodAssert.data(state, z => z.object({
		username: z.prismaField("users", "username", "string"),
		password: z.prismaField("users", "password", "string")
	}));

	zodAssert.pathParams(state, z => ({
		format: z.string().optional()
	}));

	const asJson = state.headers.accept && state.headers.accept.indexOf("application/json") !== -1
		|| state.pathParams.format === ".json";

	var username = state.data.username;
	var password = state.data.password;
	var user = await state.store.sql.getUserByUsername(username);
	var isPasswordValid = state.auth.verifyPassword(password, user ? user.password : null)

	if(user && isPasswordValid) {
		var sessionId = await state.auth.createSession(user.user_id);
		var returnUrl = state.cookies.returnUrl;
		// state.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; Path=/`);
		state.setCookie("session", sessionId, { httpOnly: true, path: "/" });

		if(asJson) {
			return state.sendJSON(200, {
				success: true,
				message: "Logged in",
			});
		} else {
			return state.redirect(returnUrl || "/");
		}
	} else {
		state.store.adminWiki.addTiddler(new state.Tiddler({
			title: "$:/temp/mws/login/error",
			text: "Invalid username or password"
		}));
		if(asJson) {
			return state.sendJSON(200, ({
				success: false,
				"message": "Invalid username or password"
			}));
		} else {
			return state.redirect('/login');
		}
	}
	return state.sendEmpty(400);
}), root.defineRoute({
	useACL: {},
	method: ["POST"],
	bodyFormat: "www-form-urlencoded",
	path: /^\/login\/1/,
}, async state => {
	zodAssert.data(state, z => z.object({
		username: z.prismaField("users", "username", "string"),
		startLoginRequest: z.string(),
	}));

	const user = await state.store.sql.getUserByUsername(state.data.username);

	if(!user) return state.sendSimple(404, "User not found");
	if(!user.password) return state.sendSimple(500, "Error: User has no password");
	if(!state.data.startLoginRequest) return state.sendSimple(400, "Error: startLoginRequest is required");

	return await state.auth.login1({
		userID: user.user_id,
		registrationRecord: user.password,
		startLoginRequest: state.data.startLoginRequest
	});

}), root.defineRoute({
	useACL: {},
	method: ["POST"],
	bodyFormat: "www-form-urlencoded",
	path: /^\/login\/2/,
}, async state => {
	zodAssert.data(state, z => z.object({
		finishLoginRequest: z.string(),
	}));

	// the first step sets a loginsession cookie so we don't need that
	const { finishLoginRequest } = state.data;

	return await state.auth.login2({ finishLoginRequest });

}));
