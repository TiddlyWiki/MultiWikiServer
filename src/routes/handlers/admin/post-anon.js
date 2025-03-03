/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-anon.js
type: application/javascript
module-type: mws-route

POST /admin/anon

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
  method: ["POST"],
  path: /^\/admin\/anon\/?$/,
  bodyFormat: "www-form-urlencoded",
  useACL: {csrfDisable: true},
}, async state => {
  // Check if user is authenticated and is admin
  if(!state.authenticatedUser || !state.authenticatedUser.isAdmin) {
    return state.sendString(401, {"Content-Type": "text/plain"}, "Unauthorized", "utf8");
  }

  // Update the configuration tiddlers
  state.store.adminWiki.addTiddler({
    title: "$:/config/MultiWikiServer/ShowAnonymousAccessModal",
    text: "yes"
  });

  // Redirect back to admin page
  return state.redirect("/");
});
