import { ok } from "assert";
import { rootRoute, Router } from "../router";
import * as opaque from "@serenity-kit/opaque";
import { z } from "zod";


export default function AuthRoutes( parent: rootRoute) {

  const authRoute = parent.defineRoute({
    useACL: {},
    method: ["GET", "HEAD", "POST", "PUT"],
    bodyFormat: undefined,
    path: /^\/auth/,
  }, async (state) => {
    return state;
  });

  type authRoute = typeof authRoute;


  const userIdentifiers = new Map();
  const registrationRecords = new Map();
  const userLoginStates = new Map();
  const userSessionKeys = new Map();

  authRoute.defineRoute({
    useACL: {},
    method: ["GET", "HEAD"],
    path: /^\/register/,
  }, async (state) => {
    return state.sendFile(200, {}, {
      root: "public",
      reqpath: "register.html",
    });
  });


  authRoute.defineRoute({
    useACL: {},
    method: ["POST"],
    bodyFormat: "www-form-urlencoded",
    path: /^\/register\/1/,
    zod: z.object({
      username: z.string(),
      registrationRequest: z.string(),
    }),
  }, async (state) => {

    zodAssert.data(state, z => z.object({
      username: z.string(),
      registrationRequest: z.string(),
    }));

    // zod types are supposed to infer here
    const { username, registrationRequest } = state.data;

    const userIdentifier = userIdentifiers.get(username);
    ok(typeof userIdentifier === "string");

    const { registrationResponse } = opaque.server.createRegistrationResponse({
      serverSetup,
      userIdentifier,
      registrationRequest,
    });
    return state.sendString(200, {}, registrationResponse, "utf8");
  });

  const test2 = authRoute.defineRoute({
    useACL: {},
    method: ["POST"],
    bodyFormat: "www-form-urlencoded",
    path: /^\/register\/2/
  }, async (state) => {

    zodAssert.data(state, z => z.object({
      username: z.string(),
      registrationRecord: z.string(),
    }));

    const { username, registrationRecord } = state.data;

    const userIdentifier = userIdentifiers.get(username); // userId/email/username
    ok(typeof userIdentifier === "string");

    registrationRecords.set(userIdentifier, state.data);
    return state.sendEmpty(200, {});
  });

  authRoute.defineRoute({
    useACL: {},
    method: ["GET", "HEAD"],
    bodyFormat: undefined,
    path: /^\/login/,
  }, async (state) => {
    return state.sendFile(200, {}, {
      root: "public",
      reqpath: "login.html",
    });
  });

  authRoute.defineRoute({
    useACL: {},
    method: ["POST"],
    bodyFormat: "www-form-urlencoded",
    zod: z.object,
    path: /^\/login\/1/,
  }, async (state) => {

    zodAssert.data(state, z => z.object({
      username: z.string(),
      startLoginRequest: z.string(),
    }));
    const { username, startLoginRequest } = state.data;

    const userIdentifier = userIdentifiers.get(username);
    ok(typeof userIdentifier === "string");

    const registrationRecord = await registrationRecords.get(userIdentifier);

    const { serverLoginState, loginResponse } = opaque.server.startLogin({
      serverSetup,
      userIdentifier,
      registrationRecord,
      startLoginRequest,
    });

    userLoginStates.set(userIdentifier, serverLoginState);

    return state.sendString(200, {}, loginResponse, "utf8");
  });

  authRoute.defineRoute({
    useACL: {},
    method: ["POST"],
    bodyFormat: "www-form-urlencoded",
    path: /^\/login\/2/,
  }, async (state) => {
    zodAssert.data(state, z => z.object({
      username: z.string(),
      finishLoginRequest: z.string(),
    }));
    const { username, finishLoginRequest } = state.data;

    const userIdentifier = userIdentifiers.get(username); // userId/email/username
    ok(typeof userIdentifier === "string");

    const serverLoginState = userLoginStates.get(userIdentifier);
    ok(typeof serverLoginState === "string");

    // per the spec, the sessionKey may only be returned 
    // if the client's session key has successfully signed something.
    const { sessionKey } = opaque.server.finishLogin({
      finishLoginRequest,
      serverLoginState,
    });

    userSessionKeys.set(userIdentifier, sessionKey);

    return state.sendEmpty(200, {});
  });

  return authRoute;
}

declare const serverSetup: string;


async function* OPAQUE1() {
  // client
  const password = "sup-krah.42-UOI"; // user password

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

  // server
  const userIdentifier = "20e14cd8-ab09-4f4b-87a8-06d2e2e9ff68"; // userId/email/username

  const { registrationResponse } = opaque.server.createRegistrationResponse({
    serverSetup,
    userIdentifier,
    registrationRequest,
  });

  // client
  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState,
    registrationResponse,
    password,
  });

  return registrationRecord;

}


async function* OPAQUE2(registrationRecord: string) {
  await opaque.ready;
  const serverSetup = opaque.server.createSetup();
  // client
  const password = "sup-krah.42-UOI"; // user password

  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
    password,
  });

  // server
  const userIdentifier = "20e14cd8-ab09-4f4b-87a8-06d2e2e9ff68"; // userId/email/username

  const { serverLoginState, loginResponse } = opaque.server.startLogin({
    serverSetup,
    userIdentifier,
    registrationRecord,
    startLoginRequest,
  });

  // client
  const loginResult = opaque.client.finishLogin({
    clientLoginState,
    loginResponse,
    password,
  });
  if (!loginResult) {
    throw new Error("Login failed");
  }
  const { finishLoginRequest, sessionKey } = loginResult;

  // server
  // the server session key is only returned after verifying the client's response, 
  // which validates that the client actually has the session key.
  const { sessionKey: serversessionkey } = opaque.server.finishLogin({
    finishLoginRequest,
    serverLoginState,
  });

  ok(sessionKey === serversessionkey);

}

// export type authRoute = ReturnType<typeof AuthRoutes>;