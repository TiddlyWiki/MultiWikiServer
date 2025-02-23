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
	path: /^\/admin\/acl\/(.+)$/,
	pathParams: ["recipe_name"],
	useACL: {},
}, async state => {

	zodAssert.pathParams(state, z => ({
		recipe_name: z.string(),
	}));

	var params = state.pathParams.recipe_name.split("/")
	var recipeName = params[0];
	var bagName = params[params.length - 1];

	var recipes = await state.store.sql.listRecipes()
	var bags = await state.store.sql.listBags()

	var recipe = recipes.find((entry) => entry.recipe_name === recipeName && entry.bag_names.includes(bagName))
	var bag = bags.find((entry) => entry.bag_name === bagName);

	if(!recipe || !bag) {
		return state.sendEmpty(500, {"Content-Type": "text/html"});
	}

	var recipeAclRecords = await state.store.sql.getEntityAclRecords(recipe.recipe_name);
	var bagAclRecords = await state.store.sql.getEntityAclRecords(bag.bag_name);
	var roles = await state.store.sql.listRoles();
	var permissions = await state.store.sql.listPermissions();

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
	recipeAclRecords = recipeAclRecords.map(record => {
		var role = roles.find(role => role.role_id === record.role_id);
		var permission = permissions.find(perm => perm.permission_id === record.permission_id);
		return ({
			...record,
			role,
			permission,
			role_name: role?.role_name,
			role_description: role?.description,
			permission_name: permission?.permission_name,
			permission_description: permission?.description
		})
	});

	bagAclRecords = bagAclRecords.map(record => {
		var role = roles.find(role => role.role_id === record.role_id);
		var permission = permissions.find(perm => perm.permission_id === record.permission_id);
		return ({
			...record,
			role,
			permission,
			role_name: role?.role_name,
			role_description: role?.description,
			permission_name: permission?.permission_name,
			permission_description: permission?.description
		})
	});

	// send the status 200 before rendering the page
	state.writeHead(200, {"Content-Type": "text/html"});

	var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
		variables: {
			"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/manage-acl",
			"roles-list": JSON.stringify(roles),
			"permissions-list": JSON.stringify(permissions),
			"bag": JSON.stringify(bag),
			"recipe": JSON.stringify(recipe),
			"recipe-acl-records": JSON.stringify(recipeAclRecords),
			"bag-acl-records": JSON.stringify(bagAclRecords),
			"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
			"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no"
		}
	});

	state.write(html);
	return state.end();
});
