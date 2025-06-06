
import * as opaque from "@serenity-kit/opaque";
import * as fs from "node:fs";
import * as path from "path";
import { randomBytes } from "node:crypto";
import { ok } from "node:assert";
import { TypedGenerator } from "@tiddlywiki/server";

export type PasswordService = Awaited<ReturnType<typeof createPasswordService>>;

export async function createPasswordService(wikiPath: string) {
  const passwordKeyFile = path.join(wikiPath, "passwords.key");
  if (typeof passwordKeyFile === "string"
    && passwordKeyFile
    && !fs.existsSync(passwordKeyFile)
  ) {
    fs.writeFileSync(passwordKeyFile, opaque.server.createSetup());
    console.log("Password master key created at", passwordKeyFile);
  }

  const masterKey = fs.readFileSync(passwordKeyFile, "utf8").trim();
  if (!masterKey) throw "Master key is required for the auth module";
  await opaque.ready;

  const serverState = new Map<string, TypedGenerator<LoginGeneratorStates>>();

  const LoginGenerator = TypedGenerator.wrapper<LoginGeneratorStates>()(async function* ({
    user_id,
    startLoginRequest,
    registrationRecord,
  }: {
    user_id: PrismaField<"Users", "user_id">;
    startLoginRequest: string;
    registrationRecord: string;
  }): any {

    const { asV, asY } = TypedGenerator.checker<LoginGeneratorStates>();

    const { serverLoginState, loginResponse } = opaque.server.startLogin({
      serverSetup: masterKey,
      userIdentifier: user_id.toString(),
      registrationRecord,
      startLoginRequest,
    });

    const timestamp = Date.now();

    const finishLoginRequest = asV(1, yield asY(0, loginResponse));

    // this is supposed to be programmatic
    // it should never last longer than five minutes
    if (timestamp + 1000 * 60 * 5 < Date.now()) return;

    // per the spec, the sessionKey will only be returned 
    // if the client's session key has been verified.
    return asY(1, {
      session: opaque.server.finishLogin({
        finishLoginRequest,
        serverLoginState,
      }),
      user_id,
    });

  });

  /**
   * This code creates a password registration. It can be used for temporary passwords, if needed. 
   */
  async function PasswordCreation(userID: string, password: string) {
    // client

    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    // server
    const userIdentifier = userID; // userId/email/username

    const { registrationResponse } = opaque.server.createRegistrationResponse({
      serverSetup: masterKey,
      userIdentifier,
      registrationRequest,
    });

    // client
    const { registrationRecord } = opaque.client.finishRegistration({
      clientRegistrationState,
      registrationResponse,
      password,
    });

    return registrationRecord as PrismaField<"Users", "password">;

  }



  async function createRegistrationResponse({ userID, registrationRequest }: {
    userID: PrismaField<"Users", "user_id">;
    registrationRequest: string;
  }) {

    const { registrationResponse } = opaque.server.createRegistrationResponse({
      serverSetup: masterKey,
      userIdentifier: userID.toString(),
      registrationRequest,
    });

    return registrationResponse;

  }

  async function startLoginSession(stater: TypedGenerator<LoginGeneratorStates>) {
    let loginSession;
    do { loginSession = randomBytes(16).toString("base64url"); }
    while (serverState.has(loginSession));
    serverState.set(loginSession, stater);
    return loginSession;
  }

  async function finishLoginSession(loginSession: string) {
    const stater = serverState.get(loginSession);
    if (stater) serverState.delete(loginSession);
    return stater;
  }

  return {
    serverState,
    LoginGenerator,
    PasswordCreation,
    createRegistrationResponse,
    startLoginSession,
    finishLoginSession
  }

}


type LoginGeneratorStates = [
  [void, loginResponse: string],
  [finishLoginRequest: string, {
    user_id: PrismaField<"Users", "user_id">,
    session: { sessionKey: string; } | undefined
  }]
]




/** 
 * This code verifies plain text passwords. 
 * It shouldn't be used in production, 
 * but this is how it would be done. 
 */
function PasswordVerification(userID: string, registrationRecord: string, password: string, serverSetup: string) {

  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ password, });

  // server
  const userIdentifier = userID;

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

  if (!loginResult) { throw new Error("Login failed"); }

  const { finishLoginRequest, sessionKey } = loginResult;

  // server
  // the server session key is only returned after verifying the client's response, 
  // which validates that the client actually has the session key.
  const { sessionKey: serversessionkey } = opaque.server.finishLogin({
    finishLoginRequest,
    serverLoginState,
  });

  // This is never done in production, as the key must not be sent across the wire.
  ok(sessionKey === serversessionkey);

  return { sessionKey };

}
