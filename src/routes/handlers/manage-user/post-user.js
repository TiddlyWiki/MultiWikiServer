/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-user.js
type: application/javascript
module-type: mws-route

POST /admin/post-user

\*/
import * as crypto from "crypto";
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
  method: ["POST"],
  path: /^\/admin\/post-user\/?$/,
  bodyFormat: "www-form-urlencoded",
  useACL: { csrfDisable: true },
}, async (state) => {
  zodAssert.data(state, z => z.object({
    username: z.prismaField("users", "username", "string"),
    email: z.prismaField("users", "email", "string"),
  }));

  var username = state.data.username;
  var email = state.data.email;
  var queryParamsTiddlerTitle = "$:/temp/mws/queryParams";

  if(!state.authenticatedUser && !state.firstGuestUser)
    return state.sendSimple(401, "You must be logged in to create users");

  // Check if username or email already exists
  var existingUser = await state.store.sql.getUserByUsername(username);
  var existingUserByEmail = await state.store.sql.getUserByEmail(email);

  if(existingUser || existingUserByEmail)
    return state.sendSimple(400, "User with this username or email already exists");

  var hasUsers = (await state.store.sql.listUsers()).length > 0;

  // Create new user. The password is set by change-password
  var userId = await state.store.sql.createUser(username, email, "");

  if(!hasUsers) {
    // If this is the first guest user, assign admin privileges
    await state.store.sql.setUserAdmin(userId);
  } else {
    // otherwise assign user to the first role that isn't admin
    var roles = await state.store.sql.listRoles();
    var role = roles.find(role => role.role_name !== "ADMIN");
    if(role) await state.store.sql.addRoleToUser(userId, role.role_id);
  }

  return state.sendJSON(200, { userId });

});
