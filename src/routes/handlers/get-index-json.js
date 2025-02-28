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
  path: /^\/index.json$/,
  useACL: {},
}, async state => {
  // Get the bag and recipe information
  var bagList = await state.store.listBags(),
    recipeList = await state.store.listRecipes();


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

  const variables = {
    // "page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-index",
    "bag-list": (allowedBags),
    "recipe-list": (allowedRecipesWithWrite),
    "username": state.authenticatedUser
      ? state.authenticatedUser.username
      : state.firstGuestUser
        ? "Anonymous User"
        : "Guest",
    "user-is-admin": !!(state.authenticatedUser && state.authenticatedUser.isAdmin),
    "first-guest-user": state.firstGuestUser,
    "show-anon-config": state.showAnonConfig,
    "user-is-logged-in": !!state.authenticatedUser,
    "user": state.authenticatedUser,
    "has-profile-access": !!state.authenticatedUser,
    allowReads: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined"),
    allowWrites: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined"),
  };

  return state.sendString(200, { "content-type": "application/json" }, JSON.stringify(variables), "utf8");

  // // Render the html
  // var html = state.store.adminWiki.renderTiddler("text/plain", "$:/plugins/tiddlywiki/multiwikiserver/templates/page", {
  //   variables: {
  //     "show-system": state.queryParams.show_system?.[0] || "off",
  //     "page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-index",
  //     "bag-list": JSON.stringify(allowedBags),
  //     "recipe-list": JSON.stringify(allowedRecipesWithWrite),
  //     "username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
  //     "user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no",
  //     "first-guest-user": state.firstGuestUser ? "yes" : "no",
  //     "show-anon-config": state.showAnonConfig ? "yes" : "no",
  //     "user-is-logged-in": !!state.authenticatedUser ? "yes" : "no",
  //     "user": JSON.stringify(state.authenticatedUser),
  //     "has-profile-access": !!state.authenticatedUser ? "yes" : "no"
  //   }
  // });
  // state.write(html);
  // return state.end();

});



