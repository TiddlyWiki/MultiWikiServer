import Debug from "debug";
import { JsonValue, Z2, zod, zodRoute, ZodState } from "@tiddlywiki/server";
const debug = Debug("mws:cors:admin")



export function admin<T extends zod.ZodTypeAny, R extends JsonValue>(
  zodRequest: (z: Z2<"JSON">) => T,
  inner: (state: ZodState<"POST", "json", {}, {}, T>, prisma: PrismaTxnClient) => Promise<R>
) {
  return zodRoute({
    method: ["POST"],
    path: "/admin/$key",
    keyReplacer: "$key",
    zodPathParams: z => ({}),
    zodQueryParams: z => ({}),
    bodyFormat: "json",
    securityChecks: { requestedWithHeader: true },
    zodRequestBody: zodRequest,
    inner: async (state) => {

      debug("admin request from origin %s referer %s", state.headers.get("origin"), state.headers.get("referer"));

      if (!state.headers.get("referer"))
        throw state.sendEmpty(400, { "x-reason": "Missing referer header" });

      const url = new URL(state.headers.get("referer")!);

      const allowed = url.pathname.startsWith(state.pathPrefix + "/admin/")
        || url.pathname === state.pathPrefix + "/"
        || url.pathname === state.pathPrefix + "/login";


      if (!allowed)
        throw state.sendEmpty(400, { "x-reason": "Referer header must start with /admin/" });

      state.asserted = true;
      return state.$transaction(async (prisma) => await inner(state, prisma));
    }
  });
}