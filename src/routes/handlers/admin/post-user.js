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
  useACL: {csrfDisable: true},
}, async (state) => {
  zodAssert.data(state, z => z.object({
    username: z.prismaField("users", "username", "string"),
    email: z.prismaField("users", "email", "string"),
    password: z.prismaField("users", "password", "string"),
    confirmPassword: z.prismaField("users", "password", "string"),
  }));

  function deleteTempTiddlers() {
    setTimeout(function() {
      state.store.adminWiki.deleteTiddler("$:/temp/mws/queryParams");
      state.store.adminWiki.deleteTiddler("$:/temp/mws/post-user/error");
      state.store.adminWiki.deleteTiddler("$:/temp/mws/post-user/success");
    }, 1000);
  }

  var sqlTiddlerDatabase = state.store.sql;
  var username = state.data.username;
  var email = state.data.email;
  var password = state.data.password;
  var confirmPassword = state.data.confirmPassword;
  var queryParamsTiddlerTitle = "$:/temp/mws/queryParams";

  if(!state.authenticatedUser && !state.firstGuestUser) {
    // No idea why this is here. An access denied error should NEVER cause a state change. 
    // I have to leave it here until I figure it out though.
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/post-user/error",
      text: "Unauthorized access"
    }));
    deleteTempTiddlers();
    state.redirect("/login");
    return;
  }

  if(!username || !email || !password || !confirmPassword) {
    // no idea what's going on here
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/post-user/error",
      text: "All fields are required"
    }));
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: queryParamsTiddlerTitle,
      username: username,
      email: email,
    }));
    state.redirect("/admin/users");
    deleteTempTiddlers();
    return;
  }

  if(password !== confirmPassword) {
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/post-user/error",
      text: "Passwords do not match"
    }));
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/queryParams",
      username: username,
      email: email,
    }));
    state.redirect("/admin/users");
    deleteTempTiddlers();
    return;
  }

  try {
    // Check if username or email already exists
    var existingUser = await sqlTiddlerDatabase.getUserByUsername(username);
    var existingUserByEmail = await sqlTiddlerDatabase.getUserByEmail(email);

    if(existingUser || existingUserByEmail) {
      state.store.adminWiki.addTiddler(new $tw.Tiddler({
        title: "$:/temp/mws/post-user/error",
        text: existingUser ? "User with this username already exists" : "User account with this email already exists"
      }));
      state.store.adminWiki.addTiddler(new $tw.Tiddler({
        title: queryParamsTiddlerTitle,
        username: username,
        email: email,
      }));

      state.store.adminWiki.addTiddler(new $tw.Tiddler({
        title: "$:/temp/mws/queryParams",
        username: username,
        email: email,
      }));
      state.redirect("/admin/users");
      deleteTempTiddlers();
      return;
    }

    var hasUsers = (await sqlTiddlerDatabase.listUsers()).length > 0;
    var hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Create new user
    var userId = await sqlTiddlerDatabase.createUser(username, email, hashedPassword);

    if(!hasUsers) {
      try {
        // If this is the first guest user, assign admin privileges
        await sqlTiddlerDatabase.setUserAdmin(userId);

        // Create a session for the new admin user
        var sessionId = await state.auth.createSession(userId);

        state.store.adminWiki.addTiddler(new $tw.Tiddler({
          title: "$:/temp/mws/post-user/success",
          text: "Admin user created successfully"
        }));
        state.setHeader("Set-Cookie", "session=" + sessionId + "; HttpOnly; Path=/");
        state.writeHead(302, {"Location": "/"});
        state.end();
        deleteTempTiddlers();
        return;
      } catch(adminError) {
        state.store.adminWiki.addTiddler(new $tw.Tiddler({
          title: "$:/temp/mws/post-user/error",
          text: "Error creating admin user"
        }));
        state.store.adminWiki.addTiddler(new $tw.Tiddler({
          title: queryParamsTiddlerTitle,
          username: username,
          email: email,
        }));
        state.writeHead(302, {"Location": "/admin/users"});
        state.end();
        deleteTempTiddlers();
        return;
      }
    } else {
      state.store.adminWiki.addTiddler(new $tw.Tiddler({
        title: "$:/temp/mws/post-user/success",
        text: "User created successfully"
      }));
      state.store.adminWiki.addTiddler(new $tw.Tiddler({
        title: queryParamsTiddlerTitle,
        username: username,
        email: email,
      }));
      // assign role to user
      var roles = await sqlTiddlerDatabase.listRoles();
      var role = roles.find(function(role) {
        return role.role_name.toUpperCase() !== "ADMIN";
      });
      if(role) {
        await sqlTiddlerDatabase.addRoleToUser(userId, role.role_id);
      }
      state.writeHead(302, {"Location": "/admin/users/" + userId});
      state.end();
      deleteTempTiddlers();
    }
  } catch(error) {
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: "$:/temp/mws/post-user/error",
      text: `Error creating user: ${error}`
    }));
    state.store.adminWiki.addTiddler(new $tw.Tiddler({
      title: queryParamsTiddlerTitle,
      username: username,
      email: email,
    }));
    state.redirect("/admin/users");
    deleteTempTiddlers();
    return;
  }
});
