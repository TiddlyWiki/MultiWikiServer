import { registerZodRoutes, zod as z, zodRoute, } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { SendError } from "@tiddlywiki/server";

serverEvents.on("mws.routes", (root) => {
  registerZodRoutes(root, new WikiStatusRoutes(), ["handleGetLoginStatus"]);
});

export class WikiStatusRoutes {

  handleGetLoginStatus = zodRoute({
    method: ["GET", "HEAD"],
    path: "/user/status",
    zodPathParams: z => ({}),
    bodyFormat: "ignore",
    securityChecks: { requestedWithHeader: true },
    inner: async (state) => {

      const { isAdmin, user_id, username, isLoggedIn, roles, avatarUrl } = state.user;

      if (!isLoggedIn) return { isLoggedIn: false };

      // this just makes sure we have what we expect.
      const { success, data, error } = z.object({
        isAdmin: z.boolean(),
        user_id: z.string(),
        username: z.string(),
        isLoggedIn: z.boolean(),
        roles: z.array(z.object({
          role_id: z.string(),
          role_name: z.string(),
        })),
        serverTime: z.number(),
        avatarUrl: z.string().optional(),
      }).safeParse({
        isAdmin,
        user_id,
        username,
        isLoggedIn,
        roles,
        serverTime: Date.now(),
        avatarUrl,
      });

      if (!success) {
        console.log("Zod validation failed when sending response", error);
        throw new SendError("INTERNAL_SERVER_ERROR", 500, { message: "Zod validation failed" });
      } else {
        return data;
      }
    }
  })
}
