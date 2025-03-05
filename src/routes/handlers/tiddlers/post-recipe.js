/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-recipe.js
type: application/javascript
module-type: mws-route

POST /recipes

Parameters:

recipe_name
description
bag_names: space separated list of bags

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/recipes$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {
	zodAssert.data(state, z => z.object({
		recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
		description: z.prismaField("Recipes", "description", "string").default(""),
		bag_names: z.prismaField("Bags", "bag_name", "string").array()
	}));
	await state.checkACL("recipe", state.data.recipe_name, "WRITE");

	if(state.data.recipe_name && state.data.bag_names) {
		const result = await state.store.createRecipe(state.data.recipe_name, state.data.bag_names, state.data.description);
		if(!result) {
			if(state.authenticatedUser) {
				await state.store.sql.assignRecipeToUser(state.data.recipe_name, state.authenticatedUser.user_id);
			}
			return state.redirect("/");
		} else {
			return state.sendResponse(400, {"Content-Type": "text/plain"}, result.message, "utf8");
		}
	} else {
		return state.sendEmpty(400, {"Content-Type": "text/plain"});
	}
});
