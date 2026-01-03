import { serverEvents } from "@tiddlywiki/events";
import { Router, ServerRoute, BodyFormat, Streamer, RouteMatch, dist_resolve } from "@tiddlywiki/server";
import { StateObject } from "./RequestState";
import { ServerState } from "./ServerState";
import { AuthUser, SessionManager } from "./services/sessions";
import helmet from "helmet";
import { IncomingMessage, ServerResponse } from "http";
import { registerStatsRoute, SendAdmin, setupClientBuild } from "./services/setupDevServer";

declare module "@tiddlywiki/events" {
  /**
   * - "mws.router.init" event is emitted after setting the augmentations on Router.
   */
  interface ServerEventsMap {
    "mws.router.init": [router: Router];
    "mws.routes.important": [root: ServerRoute, config: ServerState];
    "mws.routes": [root: ServerRoute, config: ServerState];
    "mws.routes.fallback": [root: ServerRoute, config: ServerState];
  }

}
declare module "@tiddlywiki/server" {


  interface Router {
    config: ServerState;
    sendAdmin: SendAdmin;
    helmet: ART<typeof helmet>;
  }

  interface AllowedRequestedWithHeaderKeys {
    TiddlyWiki: true;
  }
}

Router.allowedRequestedWithHeaders.TiddlyWiki = true;

serverEvents.on("listen.router.init", async (listen, router) => {

  router.config = listen.config;

  // router.sendAdmin = await setupDevServer(listen.config);
  // router.sendAdmin = await setupClientBuild({
  //   rootdir: dist_resolve("../packages/react-admin"),
  //   publicdir: dist_resolve("../public/react-admin")
  // });
  router.sendAdmin = await setupClientBuild({
    rootdir: dist_resolve("../packages/mdui-admin"),
    publicdir: dist_resolve("../public/mdui-admin")
  });
  router.createServerRequest = async (request, routePath, bodyFormat) => {
    const user = await SessionManager.parseIncomingRequest(request.cookies, router.config);
    return new StateObject(request, routePath, bodyFormat, user, router);
  }

  router.helmet = helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  });

  await serverEvents.emitAsync("mws.router.init", router);

  await serverEvents.emitAsync("mws.routes.important", router.rootRoute, router.config);
  await serverEvents.emitAsync("mws.routes", router.rootRoute, router.config);
  registerStatsRoute(router.rootRoute, {
    "react-admin": dist_resolve("../public/react-admin.json"),
    "server": dist_resolve("metafile-esm.json"),
  });
  await serverEvents.emitAsync("mws.routes.fallback", router.rootRoute, router.config);
});
serverEvents.on("request.middleware", async (router, req, res, options) => {
  await new Promise<void>((resolve, reject) =>
    router.helmet(
      req as IncomingMessage,
      res as ServerResponse,
      err => err ? reject(err) : resolve()
    )
  );
});
