/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/update-profile.js
type: application/javascript
module-type: mws-route

POST /update-user-profile

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
  method: ["POST"],
  path: /^\/update-user-profile\/?$/,
  bodyFormat: "www-form-urlencoded",
  useACL: {csrfDisable: true},
}, async state => {
  if(!state.authenticatedUser) {
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/login/error",
      text: "You must be logged in to update profiles"
    }));
    return state.redirect("/login");
  }

  zodAssert.data(state, z => z.object({
    userId: z.prismaField("users", "user_id", "parse-number"),
    username: z.prismaField("users", "username", "string"),
    email: z.prismaField("users", "email", "string"),
    role: z.prismaField("roles", "role_id", "parse-number"),
  }));

  var userId = state.data.userId;
  var username = state.data.username;
  var email = state.data.email;
  var roleId = state.data.role;

  var currentUserId = state.authenticatedUser.user_id;

  var hasPermission = (userId === currentUserId) || state.authenticatedUser.isAdmin;

  if(!hasPermission) {
    // No idea why this is here. An access denied error should NEVER cause a state change.
    // I have to leave it here until I figure it out though
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/update-profile/" + userId + "/error",
      text: "You don't have permission to update this profile"
    }));
    return state.redirect("/admin/users/" + userId);
  }

  if(!state.authenticatedUser.isAdmin) {
    var userRole = await state.store.sql.getUserRoles(userId);
    // TODO: why is this being overwritten?
    //@ts-ignore
    roleId = userRole?.roles[0]?.role_id;
  }

  var result = await state.store.sql.updateUser(userId, username, email, roleId);

  if(result.success) {
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/update-profile/" + userId + "/success",
      text: result.message
    }));
  } else {
    state.store.adminWiki.addTiddler(new state.Tiddler({
      title: "$:/temp/mws/update-profile/" + userId + "/error",
      text: result.message
    }));
  }

  return state.redirect("/admin/users/" + userId);
});
