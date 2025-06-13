
import { jsonify, JsonValue, registerZodRoutes, RouterKeyMap, ServerRoute, Streamer, Z2, zod, ZodRoute, zodRoute, ZodState } from "@tiddlywiki/server";
import { createHash, randomBytes } from "node:crypto";
import { ServerState } from "../ServerState";
import { serverEvents } from "@tiddlywiki/events";


export interface AuthUser {
  /** User ID. 0 if the user is not logged in. */
  user_id: PrismaField<"Users", "user_id">;
  /** User role_ids. This may have length even if the user isn't logged in, to allow ACL for anon. */
  role_ids: PrismaField<"Roles", "role_id">[];
  /** Username passed to the client */
  username: PrismaField<"Users", "username">;
  /** A session_id isn't guarenteed. There may be a session even if the user isn't logged in, and may not be even if they are, depending on the the situation. */
  sessionId: PrismaField<"Sessions", "session_id"> | undefined;
  /** Is this user considered a site-admin. This is determined by the auth service, not MWS. */
  isAdmin: boolean;
  /** Is the user logged in? This also means that user_id should be 0. role_ids may still be specified. */
  isLoggedIn: boolean;
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
export function zodSession<P extends string, T extends zod.ZodTypeAny, R extends JsonValue>(
  path: P,
  zodRequest: (z: Z2<"JSON">) => T,
  inner: (state: ZodState<"POST", "json", Record<string, zod.ZodTypeAny>, {}, T>, prisma: PrismaTxnClient) => Promise<R>
): ZodSessionRoute<P, T, R> {
  return {
    ...zodRoute({
      method: ["POST"], path,
      bodyFormat: "json",
      zodPathParams: z => ({}),
      zodQueryParams: z => ({}),
      zodRequestBody: zodRequest,
      securityChecks: { requestedWithHeader: true },
      inner: async (state) => {
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
  R extends JsonValue
> extends ZodRoute<"POST", "json", {}, {}, T, R> {
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

export class SessionManager {

  static defineRoutes(root: ServerRoute) {
    registerZodRoutes(root, new SessionManager(), Object.keys(SessionKeyMap))
  }

  static async parseIncomingRequest(streamer: Streamer, config: ServerState): Promise<AuthUser> {

    const sessionId = streamer.cookies.getAll("session") as PrismaField<"Sessions", "session_id">[];
    console.log(sessionId);
    const session = sessionId && await config.engine.sessions.findFirst({
      where: { session_id: { in: sessionId } },
      select: {
        session_id: true,
        user: {
          select: {
            user_id: true, 
            username: true,
            roles: { select: { role_id: true, role_name: true } }
          }
        }
      }
    });

    if (sessionId && session) return {
      user_id: session.user.user_id,
      username: session.user.username,
      isAdmin: session.user.roles.some(e => e.role_name === "ADMIN"),
      role_ids: session.user.roles.map(e => e.role_id),
      sessionId: session.session_id,
      isLoggedIn: true,
    };
    else return {
      user_id: "" as PrismaField<"Users", "user_id">,
      username: "(anon)" as PrismaField<"Users", "username">,
      isAdmin: false,
      role_ids: [] as PrismaField<"Roles", "role_id">[],
      sessionId: undefined as PrismaField<"Sessions", "session_id"> | undefined,
      isLoggedIn: false,
    };
  }

  login1 = zodSession("/login/1", z => z.object({
    username: z.prismaField("Users", "username", "string"),
    startLoginRequest: z.string(),
  }), async (state, prisma) => {
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
  }), async (state, prisma) => {
    const { finishLoginRequest, skipCookie, loginSession } = state.data;

    if (!loginSession) throw "Login session not found.";

    const stater = state.PasswordService.serverState.get(loginSession);

    if (!stater) throw "Login session not found.";

    const { value } = await stater.next(1, finishLoginRequest);

    if (!value?.session?.sessionKey) throw "Login failed.";

    const session_id = await createSession(prisma, value.user_id, value.session.sessionKey);

    if (!skipCookie) {
      // the client can ask to skip the cookie for things like password change
      state.setCookie("session", session_id, {
        httpOnly: true,
        path: state.pathPrefix + "/",
        secure: state.expectSecure,
        sameSite: "Strict"
      });
    }

    // NEVER send the session_key! The client already has it!
    return { user_id: value.user_id, session_id, };

  })

  logout = zodSession("/logout", z => z.object({
    session_id: z.string(),
    signature: z.string(),
    skipCookie: z.boolean().refine(e => e === true),
  }).optional(), async (state, prisma) => {

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
      return null;
    }

    if (state.user.isLoggedIn) {
      await prisma.sessions.delete({ where: { session_id: state.user.sessionId } });
    }
    var cookies = state.headers.cookie ? state.headers.cookie.split(";") : [];
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i]?.trim().split("=")[0];
      if (!cookie) continue;
      // state.setHeader("Set-Cookie", cookie + "=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict");
      state.setCookie(cookie, "", {
        httpOnly: true,
        path: state.pathPrefix + "/",
        expires: new Date(0),
        secure: state.expectSecure,
        sameSite: "Strict"
      });
    }

    return null;
  });


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