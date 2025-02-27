/* eslint-disable implicit-arrow-linebreak */
/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-index.js
type: application/javascript
module-type: mws-route

GET /?show_system=true

\*/
"use strict";

/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/$/,
	useACL: {},
}, async state => {
	// Get the bag and recipe information
	var bagList = await state.store.listBags(),
		recipeList = await state.store.listRecipes();

	// If application/json is requested then this is an API request, and gets the response in JSON
	if(state.headers.accept && state.headers.accept.indexOf("application/json") !== -1) {
		return state.sendResponse(200, {"Content-Type": "application/json"}, JSON.stringify(recipeList), "utf8");
	} else {
		// This is not a JSON API request, we should return the raw tiddler content
		state.writeHead(200, {
			"Content-Type": "text/html"
		});
		// filter bags and recipies by user's read access from ACL
		const allowedRecipes = await state.filterAsync(recipeList, async recipe =>
			recipe.recipe_name.startsWith("$:/")
			|| state.authenticatedUser?.isAdmin
			|| state.authenticatedUser
			&& await state.store.sql.hasRecipePermission(
				state.authenticatedUser.user_id,
				recipe.recipe_name,
				state.store.permissions.READ
			)
			|| state.allowAnon && state.allowAnonReads
		);

		const allowedBags = await state.filterAsync(bagList, async bag =>
			bag.bag_name.startsWith("$:/")
			|| state.authenticatedUser?.isAdmin
			|| state.authenticatedUser && await state.store.sql.hasBagPermission(
				state.authenticatedUser.user_id,
				bag.bag_name,
				state.store.permissions.READ
			)
			|| state.allowAnon && state.allowAnonReads
		);

		const allowedRecipesWithWrite = await state.mapAsync(allowedRecipes, async recipe => ({
			...recipe,
			has_acl_access: state.authenticatedUser && (
				state.authenticatedUser.isAdmin
				|| recipe.owner_id === state.authenticatedUser.recipe_owner_id
				|| await state.store.sql.hasRecipePermission(
					state.authenticatedUser.user_id,
					recipe.recipe_name,
					state.store.permissions.WRITE
				)
			)
		}))

		console.log(bagList, recipeList);

		// Render the html
		var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
			variables: {
				"show-system": state.queryParams.show_system?.[0] || "off",
				"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-index",
				"bag-list": JSON.stringify(allowedBags),
				"recipe-list": JSON.stringify(allowedRecipesWithWrite),
				"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
				"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no",
				"first-guest-user": state.firstGuestUser ? "yes" : "no",
				"show-anon-config": state.showAnonConfig ? "yes" : "no",
				"user-is-logged-in": !!state.authenticatedUser ? "yes" : "no",
				"user": JSON.stringify(state.authenticatedUser),
				"has-profile-access": !!state.authenticatedUser ? "yes" : "no"
			}
		});
		state.write(html);
		return state.end();
	}
});

