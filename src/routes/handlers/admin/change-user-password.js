/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/change-password.js
type: application/javascript
module-type: mws-route

POST /change-user-password

\*/


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
  method: ["POST"],
  path: /^\/change-user-password\/?$/,
  bodyFormat: "www-form-urlencoded",
  useACL: {csrfDisable: true},
  pathParams: [],
}, async state => {

  if(!state.authenticatedUser) {
    state.store.adminWiki.addTiddler({
      title: "$:/temp/mws/login/error",
      text: "You must be logged in to change passwords"
    });
    return state.redirect("/login");
  }

  zodAssert.data(state, z => z.object({
    userId: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string()
  }));

  const {confirmPassword, newPassword, userId} = state.data;

  // Clean up any existing error/success messages
  state.store.adminWiki.deleteTiddler("$:/temp/mws/change-password/" + userId + "/error");
  state.store.adminWiki.deleteTiddler("$:/temp/mws/change-password/" + userId + "/success");
  state.store.adminWiki.deleteTiddler("$:/temp/mws/login/error");

  var currentUserId = state.authenticatedUser.user_id;

  var hasPermission = ((parseInt(userId ?? "") || 0) === currentUserId) || state.authenticatedUser.isAdmin;

  if(!hasPermission) {
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/change-password/" + userId + "/error",
      text: "You don't have permission to change this user's password"
    }));
    return state.redirect("/admin/users/" + userId);
  }

  if(newPassword !== confirmPassword) {
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/change-password/" + userId + "/error",
      text: "New passwords do not match"
    }));
    return state.redirect("/admin/users/" + userId);
  }

  var userData = await state.store.sql.getUser(asPrismaField("users", "user_id", parseInt(userId ?? "") || 0));

  if(!userData) {
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/change-password/" + userId + "/error",
      text: "User not found"
    }));
    return state.redirect("/admin/users/" + userId);
  }

  var newHash = state.auth.hashPassword(newPassword);
  var result = await state.store.sql.updateUserPassword(
    asPrismaField("users", "user_id", parseInt(userId ?? "") || 0), newHash);

  // set success regardless of whether it actually succeeded?
  state.store.adminWiki.addTiddler(new state.Tiddler({
    title: "$:/temp/mws/change-password/" + userId + "/success",
    text: result.message
  }));
  return state.redirect("/admin/users/" + userId);

});

