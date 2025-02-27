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
  path: /^\/change-user-password\/(1|2)$/,
  pathParams: ["stage"],
  bodyFormat: "www-form-urlencoded",
  useACL: { csrfDisable: true },
}, async state => {

  if(!state.authenticatedUser) {
    return state.sendSimple(401, "You must be logged in to change passwords");
  }

  zodAssert.data(state, z => z.object({
    userId: z.prismaField("users", "user_id", "parse-number"),
    registrationRequest: z.string().optional(),
    registrationRecord: z.string().optional(),
  }));

  const { userId: user_id } = state.data;

  var currentUserId = state.authenticatedUser.user_id;

  var hasPermission = (user_id === currentUserId) || state.authenticatedUser.isAdmin;

  if(!hasPermission) {
    return state.sendSimple(403, "You don't have permission to change this user's password");
  }

  return await state.$transaction(async store => {
    const userExists = await store.users.count({ where: { user_id } });
    if(!userExists) return state.sendSimple(404, "User not found");

    switch(state.pathParams.stage) {
      case "1":
        if(!state.data.registrationRequest)
          return state.sendSimple(400, "registrationRequest is required");
        return state.auth.register1({
          userID: user_id,
          registrationRequest: state.data.registrationRequest
        });
      case "2":
        if(!state.data.registrationRecord)
          return state.sendSimple(400, "registrationRecord is required");
        await store.users.update({
          where: { user_id },
          data: { password: state.data.registrationRecord }
        });
        return state.sendEmpty(200);
      default:
        return state.sendEmpty(404, { "x-reason": "Invalid stage" });
    }
  });

});

