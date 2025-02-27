/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-acl.js
type: application/javascript
module-type: mws-route

GET /admin/acl

\*/
/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	// not sure why there's allowed to be an unknown number of slashes between the recipe and bag names
	// the original code was recipe_name.split("/"), then took the first and last (as in arr[arr.length-1])
	path: /^\/admin\/acl\/([^\/]+)\/([^\/]+)$/,
	pathParams: ["recipe_name", "bag_name"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		recipe_name: z.prismaField("recipes", "recipe_name", "string"),
		bag_name: z.prismaField("bags", "bag_name", "string")
	}));

	const {recipe_name: recipeName, bag_name: bagName} = state.pathParams;

	var recipes = await state.store.sql.listRecipes()
	var bags = await state.store.sql.listBags()

	var recipe = recipes.find((entry) => entry.recipe_name === recipeName && entry.bag_names.includes(bagName))
	var bag = bags.find((entry) => entry.bag_name === bagName);

	if(!recipe || !bag) {
		return state.sendEmpty(500, {"Content-Type": "text/html"});
	}

	var recipeAclRecords = await state.store.sql.getEntityAclRecords("recipe", recipe.recipe_name);
	var bagAclRecords = await state.store.sql.getEntityAclRecords("bag", bag.bag_name);
	var roles = await state.store.sql.listRoles();
	// var permissions = await state.store.sql.listPermissions();

	// This ensures that the user attempting to view the ACL management page has permission to do so
	async function canContinue() {
		if(state.firstGuestUser) return true;
		if(!state.authenticatedUser) return false;
		if(state.authenticatedUser.isAdmin) return true;
		if(recipeAclRecords.length === 0) return false;
		return await state.store.sql.hasRecipePermission(
			state.authenticatedUser.user_id, recipeName, "WRITE");
	}

	if(!await canContinue()) {
		return state.sendEmpty(403, {"Content-Type": "text/html"});
	}

	// Enhance ACL records with role and permission details
	const recipeAclRecords2 = recipeAclRecords.map(record => {
		var role = roles.find(role => role.role_id === record.role_id);
		// var permission = permissions.find(perm => perm.permission_id === record.permission_id);
		return ({
			...record,
			role,
			role_name: role?.role_name,
			role_description: role?.description,
		})
	});

	const bagAclRecords2 = bagAclRecords.map(record => {
		var role = roles.find(role => role.role_id === record.role_id);
		// var permission = permissions.find(perm => perm.permission_id === record.permission_id);
		return ({
			...record,
			role,
			role_name: role?.role_name,
			role_description: role?.description,
		})
	});

	// send the status 200 before rendering the page
	state.writeHead(200, {"Content-Type": "text/html"});

	var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
		variables: {
			"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/manage-acl",
			"roles-list": JSON.stringify(roles),
			"permissions-list": JSON.stringify(Object.keys(state.store.permissions)),
			"bag": JSON.stringify(bag),
			"recipe": JSON.stringify(recipe),
			"recipe-acl-records": JSON.stringify(recipeAclRecords2),
			"bag-acl-records": JSON.stringify(bagAclRecords2),
			"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
			"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no"
		}
	});

	state.write(html);
	return state.end();
});
