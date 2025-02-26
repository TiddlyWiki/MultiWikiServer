/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/update-role.js
type: application/javascript
module-type: mws-route

POST /admin/roles/:id

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
  method: ["POST"],
  path: /^\/admin\/roles\/([^\/]+)\/?$/,
  pathParams: ["role_id"],
  bodyFormat: "www-form-urlencoded",
  useACL: {csrfDisable: true},
}, async state => {
  zodAssert.pathParams(state, z => ({
    role_id: z.prismaField("roles", "role_id", "parse-number")
  }));

  zodAssert.data(state, z => z.object({
    role_name: z.prismaField("roles", "role_name", "string"),
    role_description: z.prismaField("roles", "description", "string"),
  }));




  var role_id = state.pathParams.role_id;
  var role_name = state.data.role_name;
  var role_description = state.data.role_description;

  if(!state.authenticatedUser?.isAdmin) {
    return state.sendEmpty(403);
  }

  // get the role
  var role = await state.store.sql.getRoleById(role_id);

  if(!role) {
    return state.sendEmpty(404);
  }

  if(role.role_name.toLowerCase().includes("admin")) {
    return state.sendSimple(400, "Admin role cannot be updated");
  }

  try {
    await state.store.sql.updateRole(
      role_id,
      role_name,
      role_description
    );

    state.writeHead(302, {"Location": "/admin/roles"});
    return state.end();
  } catch(error) {
    console.error("Error updating role:", error);
    return state.sendEmpty(500);
  }
});
