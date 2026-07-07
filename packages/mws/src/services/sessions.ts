
import { BetterCookie, jsonify, JsonValue, registerZodRoutes, RouterKeyMap, SendError, ServerRoute, Streamer, Z2, zod, ZodRoute, zodRoute, ZodState } from "@tiddlywiki/server";
import { createHash, randomBytes } from "node:crypto";
import { ServerState } from "../ServerState";
import { serverEvents } from "@tiddlywiki/events";


export interface SessionManagerObject {
  AdminRoleName: string;
  UserRoleName: string;
  parseIncomingRequest(cookies: BetterCookie, config: ServerState): Promise<AuthUser>;
}

export interface AuthUser {
  /** User ID. 0 if the user is not logged in. */
  user_id: PrismaField<"Users", "user_id">;
  /** User role_ids. This may have length even if the user isn't logged in, to allow ACL for anon. */
  roles: {
    role_id: PrismaField<"Roles", "role_id">;
    role_name: PrismaField<"Roles", "role_name">;
  }[];
  /** Username passed to the client */
  username: PrismaField<"Users", "username">;
  /** A session_id isn't guarenteed. There may be a session even if the user isn't logged in, and may not be even if they are, depending on the the situation. */
  sessionId: PrismaField<"Sessions", "session_id"> | undefined;
  /** Is this user considered a site-admin. This is determined by the auth service, not MWS. */
  isAdmin: boolean;
  /** Is the user logged in? This also means that user_id should be 0. role_ids may still be specified. */
  isLoggedIn: boolean;
  /** Web URL for the user's avatar. */
  avatarUrl?: string;
  /** Default admin role name. Users with this role bypass most permissions. */
  AdminRoleName: string;
  /** Default role for all users. */
  UserRoleName: string;
}

export const SessionKeyMap: RouterKeyMap<SessionManager, true> = {
  login1: true,
  login2: true,
  logout: true,
}


/**
 * 
 * @param path path starting with a forward slash
 * @param zodRequest the zod for state.data
 * @param inner the handler to call
 * @returns the ZodRoute
 */
export function zodSession<P extends string, T extends zod.ZodTypeAny, R extends JsonValue | undefined>(
  path: P,
  zodRequest: (z: Z2<"JSON">) => T,
  preflight: (state: ZodState<"POST", "json", {}, never, T>) => Promise<void>,
  inner: (state: ZodState<"POST", "json", {}, never, T>, prisma: PrismaTxnClient) => Promise<R>
): ZodSessionRoute<P, T, R> {
  return {
    ...zodRoute({
      method: ["POST"],
      path,
      bodyFormat: "json",
      zodPathParams: z => ({}),
      zodQueryKeys: [],
      zodRequestBody: zodRequest,
      securityChecks: { requestedWithHeader: true },
      inner: async (state) => {
        await preflight(state);
        if (state.canceled) throw STREAM_ENDED;
        state.asserted = true;
        return state.$transaction(async (prisma) => await inner(state, prisma));
      }
    }),
    path,
  };
}

export interface ZodSessionRoute<
  PATH extends string,
  T extends zod.ZodTypeAny,
  R extends JsonValue | undefined
> extends ZodRoute<"POST", "json", {}, [], T, R> {
  path: PATH;
}

export type RouterPathRouteMap<T> = {
  [K in keyof T as T[K] extends ZodSessionRoute<any, any, any> ? K : never]:
  T[K] extends ZodSessionRoute<infer P, infer REQ, infer RES> ? {
    (data: zod.input<REQ>): Promise<jsonify<RES>>;
    path: P;
    key: K;
  } : never;
}
export type SessionManagerMap = RouterPathRouteMap<SessionManager>;

serverEvents.on("mws.routes", (root, config) => {
  SessionManager.defineRoutes(root)
});

class RateLimiter {
  private readonly nextRunAt = new Map<string, number>();

  constructor(private readonly minIntervalMs: number) { }

  async wait<T extends zod.ZodTypeAny>(state: ZodState<"POST", "json", {}, never, T>, key: string): Promise<void> {

    const now = Date.now();
    const nextRunAt = this.nextRunAt.get(key) ?? 0;

    if (nextRunAt > now) {
      const delayedUntil = now + this.minIntervalMs;
      this.nextRunAt.set(key, delayedUntil);
      throw state.sendJSON(429, {
        retryAfterMs: delayedUntil - now,
      });
    }

    this.nextRunAt.set(key, now + this.minIntervalMs);

    try {
      await new Promise(resolve => setTimeout(resolve, this.minIntervalMs));
    } finally {
      if (this.nextRunAt.get(key)) {
        this.nextRunAt.delete(key);
      }
    }

  }
}

const passwordLookupRateLimiter = new RateLimiter(500);

export class SessionManager {

  static defineRoutes(root: ServerRoute) {
    const route = new SessionManager();
    const keys = Object.keys(route).filter(e => route[e] instanceof zodRoute);
    registerZodRoutes(root, route, keys)
  }

  static AdminRoleName = "ADMIN";
  static UserRoleName = "USER";

  static async parseIncomingRequest(cookies: BetterCookie, config: ServerState): Promise<AuthUser> {

    const sessionId = cookies.getAll("session") as PrismaField<"Sessions", "session_id">[];
    const session = sessionId && await config.engine.sessions.findFirst({
      where: { session_id: { in: sessionId } },
      select: { session_id: true, user: { select: { user_id: true, username: true, roles: { select: { role_id: true, role_name: true } } } } }
    });

    if (sessionId && session) return {
      user_id: session.user.user_id,
      username: session.user.username,
      isAdmin: session.user.roles.some(e => e.role_name === "ADMIN"),
      roles: session.user.roles.map(e => ({
        role_id: e.role_id,
        role_name: e.role_name
      })),
      sessionId: session.session_id,
      isLoggedIn: true,
      AdminRoleName: SessionManager.AdminRoleName,
      UserRoleName: SessionManager.UserRoleName,
    };
    else return {
      user_id: "" as PrismaField<"Users", "user_id">,
      username: "(anon)" as PrismaField<"Users", "username">,
      isAdmin: false,
      roles: [],
      sessionId: undefined,
      isLoggedIn: false,
      AdminRoleName: SessionManager.AdminRoleName,
      UserRoleName: SessionManager.UserRoleName,
    };
  }

  login1 = zodSession("/login/1", z => z.object({
    username: z.prismaField("Users", "username", "string"),
    startLoginRequest: z.string(),
  }), async () => { }, async (state, prisma) => {
    const { username, startLoginRequest } = state.data;

    const user = await prisma.users.findUnique({
      where: { username },
      select: { user_id: true, password: true, }
    });

    if (!user) throw "User not found.";

    const { user_id, password } = user;

    const stater = state.PasswordService.LoginGenerator({
      user_id,
      startLoginRequest,
      registrationRecord: password,
    });

    const loginResponse = await stater.next(0);

    if (loginResponse.done) throw "Login failed.";

    const loginSession = await state.PasswordService.startLoginSession(stater);

    return { loginResponse: loginResponse.value, loginSession };

  })

  login2 = zodSession("/login/2", z => z.object({
    finishLoginRequest: z.string(),
    loginSession: z.string(),
    skipCookie: z.boolean().optional().default(false),
  }), async () => { }, async (state, prisma) => {
    const { finishLoginRequest, skipCookie, loginSession } = state.data;

    if (!loginSession) throw "Login session not found.";

    const stater = state.PasswordService.serverState.get(loginSession);

    if (!stater) throw "Login session not found.";

    const { value } = await stater.next(1, finishLoginRequest);

    if (!value?.session?.sessionKey) throw "Login failed.";

    const session_id = await createSession(prisma, value.user_id, value.session.sessionKey);

    if (!skipCookie) {
      // the client can ask to skip the cookie for things like password change
      state.setCookie({
        name: "session",
        value: session_id,
        httpOnly: true,
        path: state.pathPrefix + "/",
        secure: state.assumeHTTPS,
        sameSite: "Lax"
      });
    }

    // NEVER send the session_key! The client already has it!
    return { user_id: value.user_id, session_id, };

  })

  logout = zodSession("/logout", z => z.object({
    session_id: z.string(),
    signature: z.string(),
    skipCookie: z.boolean().refine(e => e === true),
  }).optional(), async () => { }, async (state, prisma) => {

    if (state.data?.skipCookie) {
      const session = await prisma.sessions.findUnique({
        where: { session_id: state.data.session_id },
        select: { user_id: true, session_key: true }
      });
      if (!session?.session_key) throw "Session not found.";
      const { session_key } = session;
      const { session_id, signature } = state.data;
      assertSignature({ session_id, signature, session_key });
      await prisma.sessions.delete({ where: { session_id: state.data.session_id } });
      return undefined;
    }

    if (state.user.isLoggedIn) {
      await prisma.sessions.delete({ where: { session_id: state.user.sessionId } });
    }

    state.cookies.forEach((cookie) => {
      if (!cookie) return;
      state.setCookie({
        name: cookie,
        value: "",
        httpOnly: true,
        path: state.pathPrefix + "/",
        expires: new Date(0),
        secure: state.assumeHTTPS,
        sameSite: "Strict"
      });
    });

    return undefined;
  });

  forgotPassword = zodSession("/login/forgot-password", z => z.object({
    emailOrUsername: z.string(),
    resetCode: z.string().optional(),
  }), async state => {
    if (state.data.resetCode)
      await passwordLookupRateLimiter.wait(state, "");
  }, async (state, prisma) => {
    if (state.data.resetCode) {
      const user = await prisma.users.findUnique({ where: { resetCode: state.data.resetCode }, });
      const found = user && [user.email, user.username].includes(state.data.emailOrUsername);
      if (!found) {
        // an additional timeout if it's not found
        await new Promise(r => { setTimeout(r, 500); });
        throw new SendError("RECORD_KEY_NOT_FOUND", 400, { table: "users", name: "resetCode" });
      }
      return { user_id: user.user_id, username: user.username }
    } else {
      throw "Email system is not implemented";
    }
  })

  resetPassword = zodSession("/login/reset-password", z => z.object({
    resetCode: z.string(),
    username: z.string(),
    user_id: z.string(),
    registrationRequest: z.string().optional(),
    registrationRecord: z.string().optional(),
  }), async () => { }, async (state, prisma) => {
    const user = await prisma.users.findUnique({ where: { user_id: state.data.user_id, }, });
    if (!user)
      throw new SendError("RECORD_KEY_NOT_FOUND", 400, { table: "users", name: "user_id" });
    if (user.username !== state.data.username)
      throw new SendError("RECORD_KEY_NOT_FOUND", 400, { table: "users", name: "username" });
    if (user.resetCode !== state.data.resetCode) {
      // do this to prevent brute-force attempts to guess the reset code.
      // programmatically this should only be called correctly as it's the second call. 
      await prisma.users.update({ where: { user_id: state.data.user_id }, data: { resetCode: null } })
      throw new SendError("RECORD_KEY_NOT_FOUND", 400, { table: "users", name: "resetCode" });
    }

    const { registrationRequest, registrationRecord } = state.data;

    if (registrationRequest) {
      return state.PasswordService.createRegistrationResponse({
        userID: state.data.user_id,
        registrationRequest
      });
    } else if (registrationRecord) {
      await prisma.users.update({
        where: { user_id: state.data.user_id },
        data: { password: registrationRecord, resetCode: null }
      });
      return null;
    } else {
      return null;
    }
  });


  user_update_password = zodSession(
    "/login/user_update_password",
    z => z.object({
      user_id: z.prismaField("Users", "user_id", "string"),
      registrationRequest: z.string().optional(),
      registrationRecord: z.string().optional(),
      session_id: z.string().optional(),
      signature: z.string().optional(),
    }),
    async (state) => { state.okUser(); },
    async (state, prisma) => {

      const { user_id, registrationRecord, registrationRequest } = state.data;
      if (!state.user.isAdmin) {
        if (!state.data) throw "Session id and signature are required";
        const session = await prisma.sessions.findUnique({
          where: { session_id: state.data.session_id },
        });

        if (!session?.session_key)
          throw "Session not found";
        const { session_key } = session;
        const { session_id, signature } = state.data;
        if (!session_id || !signature)
          throw "Session id and signature are required";
        assertSignature({ session_id, session_key, signature });

        if (session.user_id !== user_id)
          throw "You must be an admin to update another user's password";

        if (state.user.user_id !== user_id)
          throw "You must be logged in as this user to update the password, "
          + "but normally this isn't supposed to happen (this is a bug, please report it)";

      }

      const userExists = await prisma.users.count({ where: { user_id } });
      if (!userExists) throw "User does not exist";

      if (registrationRequest) {
        return state.PasswordService.createRegistrationResponse({
          userID: user_id,
          registrationRequest
        });
      } else if (registrationRecord) {
        await prisma.users.update({
          where: { user_id },
          data: { password: registrationRecord }
        });
      }

      return null;

    }
  )

}



async function createSession(prisma: PrismaTxnClient, user_id: PrismaField<"Users", "user_id">, session_key: string) {
  const session_id = randomBytes(16).toString("base64url");
  return await prisma.sessions.create({
    data: {
      user_id,
      session_key,
      session_id,
      last_accessed: new Date(),
    }
  }).then(({ session_id }) => session_id);
}


export function assertSignature({ session_id, signature, session_key }: {
  session_id: string; signature: string; session_key: string;
}) {
  const hash = createHash("sha256").update(session_key + session_id).digest("base64");
  if (hash !== signature) throw "Invalid session signature.";
}
