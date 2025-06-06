import * as opaque from "@serenity-kit/opaque";
import { serverEvents, startup } from "@tiddlywiki/server";
import { AuthService, createPasswordService, PasswordService } from "@tiddlywiki/auth";
import { TW } from "tiddlywiki";
import { createServerState, ServerState } from "./ServerState";
import { commands } from "./commands";
import { setupDevServer } from "./services/setupDevServer";

import "./managers";
import "./managers/admin-recipes";
import "./managers/admin-users";
import "./managers/wiki-routes";
import "./StateObject";
import "./services/tw-routes";
import "./services/cache";

declare module "@tiddlywiki/server" {
  interface ServerEventsMap {
    // these two run inside "cli.execute.before" 
    "mws.routes": [root: ServerRoute, config: ServerState];
    "mws.routes.fallback": [root: ServerRoute, config: ServerState];
  }
}

// request.state is handled in StateObject.ts
serverEvents.on("listen.routes", async (listen, root) => {
  await serverEvents.emitAsync("mws.routes", root, listen.config);
})
serverEvents.on("listen.routes.fallback", async (listen, root) => {
  await serverEvents.emitAsync("mws.routes.fallback", root, listen.config);
})



serverEvents.on("cli.register", commands2 => {
  Object.assign(commands2, commands);
})

export async function runMWS() {
  await opaque.ready;
  const wikiPath = process.cwd();

  await registerPasswordService(wikiPath);
  await registerServerState(wikiPath);
  await startup();
}

declare module "@tiddlywiki/server" {

  interface BaseCommand {
    PasswordService: PasswordService;
  }
  interface ServerRequest {
    PasswordService: PasswordService;
  }
}
async function registerPasswordService(wikiPath: string) {
  const service = await createPasswordService(wikiPath);
  serverEvents.on("listen.routes", async (listen, root) => {
    AuthService.defineRoutes(root, listen.config.engine, service);
  });
  serverEvents.on("cli.execute.before", async (name, params, options, instance) => {
    instance.PasswordService = service;
  });
  serverEvents.on("request.state", async (router, state, streamer) => {
    state.PasswordService = service;
  });
}

declare module "@tiddlywiki/server" {
  interface ServerEventsMap {
    // these two run inside "cli.execute.before" 
    "mws.init.before": [config: ServerState, $tw: TW];
    "mws.init.after": [config: ServerState, $tw: TW];
  }
  interface BaseCommand {
    config: ServerState;
    $tw: TW;
  }
  interface Router {
    config: ServerState;
    sendAdmin: ART<typeof setupDevServer>;
  }
}

async function registerServerState(wikiPath: string) {

  const { config, $tw } = await createServerState(wikiPath);

  serverEvents.on("cli.execute.before", async (name, params, options, instance) => {
    instance.config = config;
    instance.$tw = $tw;
  });

  serverEvents.on("listen.router", async (listen, router) => {
    router.config = listen.config;
    router.sendAdmin = await setupDevServer(listen.config);
  });

}