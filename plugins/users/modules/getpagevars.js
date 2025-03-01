/*\
title: $:/plugins/tiddlywiki/multiwikipanel/getpagevars.js
type: application/javascript
module-type: library

A widget that calls a javascript tiddler (exporting a handler function and the widget's name)
to fetch API data asynchronously and inject the resulting variables into its child widget context.
If the action tiddler is invalid, it renders an error and stops processing.
\*/

exports.handler = async function() {
  const pages = [
    [/^\/login\/?$/, () => new Pages().Login(), "Login"],
    [/^\/$/, () => new Pages().Dashboard(), "Wikis Available Here"],
    [/^\/admin\/users\/?$/, () => new Pages().UserList(), "User Management"],
    [/\/admin\/users\/(\d+)$/, () => new Pages().UserEdit(), "Manage User"],
  ];

  const page = pages.find(([re]) => re.test(location.pathname));
  if(page) return await page[1]();

};

class Pages {

  async Login(){
    return {
      "page-content": "$:/plugins/tiddlywiki/multiwikiserver/auth/form/login"
    }
  }

  async Dashboard() {

    const res = await fetch("/index.json");
    const data = await res.json();
    if(typeof data !== "object") throw new Error("Invalid JSON response");

    const { allowedBags, allowedRecipes, authUser, firstGuestUser, showAnonConfig } = data;

    const variables = {
      "show-system": new URLSearchParams(location.search).get("show_system") || "off",
      "page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-index",
      "bag-list": JSON.stringify(allowedBags),
      "recipe-list": JSON.stringify(allowedRecipes),
      "username": authUser
        ? authUser.username
        : firstGuestUser
          ? "Anonymous User"
          : "Guest",
      "user-is-admin": authUser?.isAdmin ? "yes" : "no",
      "first-guest-user": firstGuestUser ? "yes" : "no",
      "show-anon-config": showAnonConfig ? "yes" : "no",
      "user-is-logged-in": !!authUser ? "yes" : "no",
      "user": JSON.stringify(authUser),
      "has-profile-access": !!authUser ? "yes" : "no"
    };
    return variables;
  }
}
