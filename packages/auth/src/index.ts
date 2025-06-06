import { randomBytes } from "crypto";
import { AuthUser, SessionKeyMap, SessionManager } from "./session-routes";
import { PasswordService } from "./PasswordService";
import { registerZodRoutes, serverEvents } from "@tiddlywiki/server";

export * from "./PasswordService";
export * from "./session-routes";


declare module "@tiddlywiki/server" {
  interface ServerRequest {
    user: AuthUser;
  }
}
serverEvents.on("request.state", async (router, state, streamer) => {
  state.user = await SessionManager.parseIncomingRequest(streamer, router.engine);
});

export class AuthService extends SessionManager {

  static defineRoutes(root: ServerRoute, engine: PrismaEngineClient, service: PasswordService) {
    // Explanation:
    // PasswordService is stored three different places:
    // 1. In AuthService, for use in session routes.
    // 2. In BaseCommand, for use in CLI commands.
    // 3. In ServerState, for use in most of the MWS routes, except for auth routes, 
    //    because they don't know about ServerState.
    registerZodRoutes(root, new AuthService(engine, service), Object.keys(SessionKeyMap));
  }

  constructor(
    private engine: PrismaEngineClient,
    public PasswordService: PasswordService,
  ) {
    super();
  }

  async createSession(user_id: PrismaField<"Users", "user_id">, session_key: string) {
    const session_id = randomBytes(16).toString("base64url");
    return await this.engine.sessions.create({
      data: {
        user_id,
        session_key,
        session_id,
        last_accessed: new Date(),
      }
    }).then(({ session_id }) => ({ session_id }));
  }

  async deleteSession(session_id: PrismaField<"Sessions", "session_id">) {
    await this.engine.sessions.delete({ where: { session_id } });
  }

  async getUser(username: PrismaField<"Users", "username">): Promise<{
    user_id: PrismaField<"Users", "user_id">;
    username: PrismaField<"Users", "username">;
    password: PrismaField<"Users", "password">;
  } | null> {
    return await this.engine.users.findUnique({
      where: { username },
      select: {
        user_id: true,
        username: true,
        password: true
      }
    });
  }

  async getSession(session_id: PrismaField<"Sessions", "session_id">): Promise<{
    session_id: PrismaField<"Sessions", "session_id">;
    session_key: PrismaField<"Sessions", "session_key">;
    user_id: PrismaField<"Users", "user_id">;
  } | null> {
    return await this.engine.sessions.findUnique({
      where: { session_id },
      select: {
        session_id: true,
        session_key: true,
        user_id: true
      }
    });
  }
}