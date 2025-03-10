
import { Streamer } from "./streamer";
import { BaseKeyMap, BaseManager, BaseManagerMap } from "./routes/BaseManager";
import { randomBytes } from "node:crypto";
import { Router } from "./router";

export interface AuthUser {
  user_id: PrismaField<"Users", "user_id">;
  username: PrismaField<"Users", "username">;
  sessionId: PrismaField<"Sessions", "session_id">;
  isAdmin: boolean;
}

export const SessionKeyMap: BaseKeyMap<SessionManager, true> = {
  login1: true,
  login2: true,
}

export type SessionManagerMap = BaseManagerMap<SessionManager>;

export class SessionManager extends BaseManager {

  static async defineRoutes(root: rootRoute) {
    root.defineRoute({
      method: ["POST"],
      path: /^\/login\/(1|2)$/,
      pathParams: ["login"],
      bodyFormat: "json",
      useACL: {},
    }, async state => {
      return await state.$transaction(async prisma => {
        const session = new SessionManager(state, prisma);
        switch (state.pathParams.login) {
          case "1": return await session.login1();
          case "2": return await session.login2();
          default: throw "No such login";
        }
      });
    });
  }

  static async parseIncomingRequest(streamer: Streamer, router: Router): Promise<AuthUser> {

    const sessionId = streamer.cookies.session as PrismaField<"Sessions", "session_id"> | undefined;
    const session = await router.engine.sessions.findUnique({
      where: { session_id: sessionId },
      select: { user: { select: { user_id: true, username: true, roles: { select: { role_id: true } } } } }
    });

    if (sessionId && session) return {
      user_id: session.user.user_id,
      username: session.user.username,
      isAdmin: session.user.roles.some(e => e.role_id === 1),
      sessionId
    };
    else return {
      user_id: 0 as PrismaField<"Users", "user_id">,
      username: "(anon)" as PrismaField<"Users", "username">,
      isAdmin: false,
      sessionId: "" as PrismaField<"Sessions", "session_id">,
    };
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

    const stater = this.state.PasswordService.LoginGenerator({
      user_id,
      startLoginRequest,
      registrationRecord: password,
    });

    const loginResponse = await stater.next(0);

    if (loginResponse.done) throw "Login failed.";

    const loginSession = await this.state.PasswordService.startLoginSession(stater);

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