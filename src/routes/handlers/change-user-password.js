/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/change-password.js
type: application/javascript
module-type: mws-route

POST /change-user-password

\*/
(function () {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
var authenticator = require("$:/plugins/tiddlywiki/multiwikiserver/auth/authentication.js").Authenticator;

exports.method = "POST";

exports.path = /^\/change-user-password\/?$/;

exports.bodyFormat = "www-form-urlencoded";

exports.csrfDisable = true;

/** @type {ServerRouteHandler<0, "www-form-urlencoded">} */
exports.handler = async function (request, response, state) {

  if(!state.authenticatedUser) {
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/login/error",
      text: "You must be logged in to change passwords"
    }));
    response.writeHead(302, { "Location": "/login" });
    response.end();
    return;
  }
  var userId = state.data.userId;
  var newPassword = state.data.newPassword;
  var confirmPassword = state.data.confirmPassword;
  if(!userId || !newPassword || !confirmPassword) {
    response.writeHead(400);
    response.end();
    return;
  }
  // Clean up any existing error/success messages
  state.store.adminWiki.deleteTiddler("$:/temp/mws/change-password/" + userId + "/error");
  state.store.adminWiki.deleteTiddler("$:/temp/mws/change-password/" + userId + "/success");
  state.store.adminWiki.deleteTiddler("$:/temp/mws/login/error");

  var auth = authenticator(state.store.sql);

  var currentUserId = state.authenticatedUser.user_id;

  var hasPermission = ($tw.utils.parseInt(userId) === currentUserId) || state.authenticatedUser.isAdmin;

  if(!hasPermission) {
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/change-password/" + userId + "/error",
      text: "You don't have permission to change this user's password"
    }));
    response.writeHead(302, { "Location": "/admin/users/" + userId });
    response.end();
    return;
  }

  if(newPassword !== confirmPassword) {
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/change-password/" + userId + "/error",
      text: "New passwords do not match"
    }));
    response.writeHead(302, { "Location": "/admin/users/" + userId });
    response.end();
    return;
  }

  var userData = await state.store.sql.getUser($tw.utils.parseInt(userId));

  if(!userData) {
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/change-password/" + userId + "/error",
      text: "User not found"
    }));
    response.writeHead(302, { "Location": "/admin/users/" + userId });
    response.end();
    return;
  }

  var newHash = auth.hashPassword(newPassword);
  var result = await state.store.sql.updateUserPassword($tw.utils.parseInt(userId), newHash);

  // set success regardless of whether it actually succeeded?
  state.store.adminWiki.addTiddler(new $tw.Tiddler({
    title: "$:/temp/mws/change-password/" + userId + "/success",
    text: result.message
  }));
  response.writeHead(302, { "Location": "/admin/users/" + userId });
  response.end();
};

}());