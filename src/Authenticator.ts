import * as crypto from "crypto";
import { StateObject } from "./StateObject";
import * as opaque from "@serenity-kit/opaque";
import { TypedGenerator } from "./utils";

let serverSetup: string = "";
const serverState = new Map<string, TypedGenerator<LoginGeneratorStates>>();
const LOGIN_FAILED = ""
export class Authenticator {
  static ready = Promise.resolve().then(async () => {
    await opaque.ready;
    serverSetup = opaque.server.createSetup();
  })
  static hashPassword(password: string) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }
  hashPassword = Authenticator.hashPassword;
  sqlTiddlerDatabase;
  constructor(private state: StateObject) {
    this.sqlTiddlerDatabase = state.store.sql;
  }
  /** this is null to improve constant time. we still hash the password even if we discard it. */
  verifyPassword(inputPassword: string, storedHash: string | null) {
    var hashedInput = Authenticator.hashPassword(inputPassword);
    if (storedHash === null) return false;
    return hashedInput === storedHash;
  }

  async createSession(userId: PrismaField<"Users", "user_id">) {
    var sessionId = crypto.randomBytes(16).toString("hex");
    // Store the session in your database or in-memory store
    await this.sqlTiddlerDatabase.createUserSession(userId, sessionId as PrismaField<"Sessions", "session_id">);
    return sessionId;
  }
  /**
   * 
   * Returns the registrationRequest to the client.
   * 
   * There is no corresponding register2 function.
   * 
   * Simply save the registrationRecord to the user's password field. 
   * 
   * @param param0 
   * @returns 
   */
  async register1({ userID, registrationRequest }: {
    userID: PrismaField<"Users", "user_id">;
    registrationRequest: string;
  }) {

    const { registrationResponse } = opaque.server.createRegistrationResponse({
      serverSetup,
      userIdentifier: userID.toString(),
      registrationRequest,
    });

    return registrationResponse;

  }


  async login1({ userID, registrationRecord, startLoginRequest }: {
    userID: PrismaField<"Users", "user_id">;
    registrationRecord: string;
    startLoginRequest: string;
  }) {

    const stater = login({
      user_id: userID,
      startLoginRequest,
      registrationRecord,
    });

    const loginResponse = stater.next(0);

    if (loginResponse.done) return this.state.sendSimple(400, "");

    let loginSession;

    do { loginSession = crypto.randomBytes(16).toString("base64url"); }
    while (serverState.has(loginSession));

    serverState.set(loginSession, stater);

    this.state.setCookie("loginsession", loginSession, { httpOnly: true, path: "/" });

    return this.state.sendString(200, {}, loginResponse.value, "utf8");

  }

  async login2({ finishLoginRequest }: {
    finishLoginRequest: string;
  }) {

    if (!this.state.cookies.loginsession) return this.state.sendEmpty(400);

    const stater = serverState.get(this.state.cookies.loginsession);

    if (!stater) return this.state.sendEmpty(400);

    serverState.delete(this.state.cookies.loginsession);

    const { done, value } = stater.next(1, finishLoginRequest);

    if (!value?.session?.sessionKey) return this.state.sendEmpty(400);

    const sessionId = await this.createSession(value.user_id);

    this.state.setCookie("session", sessionId, { httpOnly: true, path: "/", secure: this.state.isSecure });

    await this.state.store.sql.engine.sessions.update({
      where: { session_id: sessionId },
      data: { session_key: value.session.sessionKey }
    }).catch(e => {
      // not sure how they got here without a valid session
      throw this.state.sendEmpty(400, { "x-reason": "Invalid session" });
    });

    return this.state.sendEmpty(200, {});

  }


}

type LoginGeneratorStates = [
  [void, loginResponse: string],
  [finishLoginRequest: string, {
    user_id: PrismaField<"Users", "user_id">,
    session: { sessionKey: string; } | undefined
  }]
]

type RegisterGeneratorStates = [
  [void, registrationResponse: string],
  [registrationRecord: string, void]
]

export const login = TypedGenerator.wrapper<LoginGeneratorStates>()(function* ({
  user_id,
  startLoginRequest,
  registrationRecord
}: {
  user_id: PrismaField<"Users", "user_id">,
  startLoginRequest: string,
  registrationRecord: string
}): any {

  const { asV, asY } = TypedGenerator.checker<LoginGeneratorStates>();
  console.log({
    serverSetup,
    userIdentifier: user_id.toString(),
    registrationRecord,
    startLoginRequest,
  });
  const { serverLoginState, loginResponse } = opaque.server.startLogin({
    serverSetup,
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
export function PasswordCreation(userID: string, password: string) {
  // client

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

  // server
  const userIdentifier = userID; // userId/email/username

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

  return registrationRecord as PrismaField<"Users", "password">;

}

/** 
 * This code verifies plain text passwords. 
 * It shouldn't be used in production, 
 * but this is how it would be done. 
 */
function PasswordVerification(userID: string, registrationRecord: string, password: string) {

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

  ok(sessionKey === serversessionkey);

  return { sessionKey };

}