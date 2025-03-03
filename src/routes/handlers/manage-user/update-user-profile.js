/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/update-profile.js
type: application/javascript
module-type: mws-route

POST /update-user-profile

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
  method: ["POST"],
  path: /^\/update-user-profile\/?$/,
  bodyFormat: "www-form-urlencoded",
  useACL: {csrfDisable: true},
}, async state => {

  if(!state.authenticatedUser)
    throw state.sendSimple(401, "You must be logged in to update profiles");


  zodAssert.data(state, z => z.object({
    userId: z.prismaField("users", "user_id", "parse-number"),
    username: z.prismaField("users", "username", "string"),
    email: z.prismaField("users", "email", "string"),
    role: z.prismaField("roles", "role_id", "parse-number").optional(),
  }));

  const {userId, username, email} = state.data;

  var roleId = state.data.role;

  // users cannot change their own role
  if(userId === state.authenticatedUser.user_id)
    roleId = undefined;
  // only admins can change other users' profiles
  else if(!state.authenticatedUser.isAdmin)
    return state.sendSimple(403, "You don't have permission to update this profile");

  var result = await state.store.sql.updateUser(userId, username, email, roleId);

  return state.sendSimple(result.success ? 200 : 400, result.message);

});
