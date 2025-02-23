/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-anon-config.js
type: application/javascript
module-type: mws-route

POST /admin/post-anon-config

\*/
"use strict";
/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
  method: ["POST"],
  path: /^\/admin\/post-anon-config\/?$/,
  bodyFormat: "www-form-urlencoded",
  useACL: {csrfDisable: true},
}, async state => {
  // Check if user is authenticated and is admin
  if(!state.authenticatedUser || !state.authenticatedUser.isAdmin) {
    return state.sendString(401, {"Content-Type": "text/plain"}, "Unauthorized", "utf8");
    // state.writeHead(401, "Unauthorized", {"Content-Type": "text/plain"});
    // state.end("Unauthorized");
    // return;
  }

  zodAssert.data(state, z => z.object({
    allowReads: z.string().optional(),
    allowWrites: z.string().optional()
  }));

  var allowReads = state.data.allowReads === "on";
  var allowWrites = state.data.allowWrites === "on";

  // Update the configuration tiddlers

  state.store.adminWiki.addTiddler({
    title: "$:/config/MultiWikiServer/AllowAnonymousReads",
    text: allowReads ? "yes" : "no"
  });
  state.store.adminWiki.addTiddler({
    title: "$:/config/MultiWikiServer/AllowAnonymousWrites",
    text: allowWrites ? "yes" : "no"
  });

  state.store.adminWiki.addTiddler({
    title: "$:/config/MultiWikiServer/ShowAnonymousAccessModal",
    text: "no"
  });
  // Redirect back to admin page
  state.writeHead(302, {"Location": "/"});
  state.end();
});
