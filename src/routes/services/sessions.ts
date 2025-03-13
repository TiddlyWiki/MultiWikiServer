
import { Streamer } from "../../streamer";
import { BaseKeyMap, BaseManager, BaseManagerMap } from "../BaseManager";
import { randomBytes } from "node:crypto";
import { Router } from "../../router";
import { StateObject } from "../../StateObject";

export interface AuthUser {
  user_id: PrismaField<"Users", "user_id">;
  username: PrismaField<"Users", "username">;
  sessionId: PrismaField<"Sessions", "session_id">;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const SessionKeyMap: BaseKeyMap<SessionManager, true> = {
  login1: true,
  login2: true,
  logout: true,
}

export type SessionManagerMap = BaseManagerMap<SessionManager>;

export class SessionManager extends BaseManager {

  static async defineRoutes(root: rootRoute) {
    root.defineRoute({
      method: ["POST"],
      path: /^\/(login\/1|login\/2|logout)$/,
      pathParams: ["login"],
      bodyFormat: "json",
      useACL: {},
    }, async state => {
      return await state.$transaction(async prisma => {
        const session = new SessionManager(state, prisma);
        switch (state.pathParams.login) {
          case "login/1": return await session.login1(state);
          case "login/2": return await session.login2(state);
          case "logout": return await session.logout(state);
          default: throw "No such login";
        }
      });
    });
  }

  static async parseIncomingRequest(streamer: Streamer, router: Router): Promise<AuthUser> {

    const sessionId = streamer.cookies.session as PrismaField<"Sessions", "session_id"> | undefined;
    const session = sessionId && await router.engine.sessions.findUnique({
      where: { session_id: sessionId },
      select: { user: { select: { user_id: true, username: true, roles: { select: { role_id: true } } } } }
    });

    if (sessionId && session) return {
      user_id: session.user.user_id,
      username: session.user.username,
      isAdmin: session.user.roles.some(e => e.role_id === 1),
      sessionId,
      isLoggedIn: true,
    };
    else return {
      isLoggedIn: false,
      user_id: 0 as PrismaField<"Users", "user_id">,
      username: "(anon)" as PrismaField<"Users", "username">,
      isAdmin: false,
      sessionId: "" as PrismaField<"Sessions", "session_id">,
    };
  }

  constructor(protected state: StateObject, prisma: PrismaTxnClient){
    super(state.config, prisma, state.authenticatedUser, state.firstGuestUser, state.PasswordService);
  }

  login1 = this.ZodRequest(z => z.object({
    // userID: z.prismaField("Users", "user_id", "number", false),
    // registrationRecord: z.string(),
    // startLoginRequest: z.string(),
    username: z.prismaField("Users", "username", "string"),
    startLoginRequest: z.string(),
  }), async ({ username, startLoginRequest }) => {

    const user = await this.prisma.users.findUnique({
      where: { username },
      select: { user_id: true, password: true, }
    });

    if (!user) throw "User not found.";

    const { user_id, password } = user;

    const stater = this.PasswordService.LoginGenerator({
      user_id,
      startLoginRequest,
      registrationRecord: password,
    });

    const loginResponse = await stater.next(0);

    if (loginResponse.done) throw "Login failed.";

    const loginSession = await this.PasswordService.startLoginSession(stater);

    this.state.setCookie("loginsession", loginSession, { httpOnly: true, path: "/" });

    return { loginResponse: loginResponse.value };

  })

  login2 = this.ZodRequest(z => z.object({
    finishLoginRequest: z.string()
  }), async ({ finishLoginRequest }) => {

    if (!this.state.cookies.loginsession) throw "Login session not found.";

    const stater = this.state.PasswordService.serverState.get(this.state.cookies.loginsession);

    if (!stater) throw "Login session not found.";

    const { done, value } = await stater.next(1, finishLoginRequest);

    if (!value?.session?.sessionKey) throw "Login failed.";

    const session_id = await this.createSession(value.user_id, value.session.sessionKey);

    this.state.setCookie("session", session_id, { httpOnly: true, path: "/", secure: this.state.isSecure });

    return null;

  })

  logout = this.ZodRequest(z => z.undefined(), async () => {
    const state = this.state;
    if (state.authenticatedUser) {
      await this.prisma.sessions.delete({ where: { session_id: state.authenticatedUser.sessionId } });
    }
    var cookies = state.headers.cookie ? state.headers.cookie.split(";") : [];
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i]?.trim().split("=")[0];
      if (!cookie) continue;
      // state.setHeader("Set-Cookie", cookie + "=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict");
      state.setCookie(cookie, "", { httpOnly: true, path: "/", expires: new Date(0), secure: state.isSecure, sameSite: "Strict" });
    }

    return null;
  });

  async createSession(user_id: PrismaField<"Users", "user_id">, session_key: string) {
    const session_id = randomBytes(16).toString("base64url");
    return await this.prisma.sessions.create({
      data: {
        user_id,
        session_key,
        session_id,
        last_accessed: new Date(),
      }
    }).then(({ session_id }) => session_id);
  }
}