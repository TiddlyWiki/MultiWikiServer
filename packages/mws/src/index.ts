// const originalconsole = console.log.bind(console);
// console.log = (...args) => {
//   originalconsole(new Error("console stack").stack);
//   return originalconsole(...args)
// };
import { install } from "source-map-support";
install();
import { serverEvents } from "@tiddlywiki/events";

import "@tiddlywiki/commander";
import "@tiddlywiki/server";
import "./startup";
import "./new-commands";
import "./new-managers";
import "./zodAssert";
import "./RequestState";
import "./ServerState";
import "./services/tw-routes";
import "./plugin-cache";
import "./new-managers/sessions";
import "./SendError";

// startup
import * as opaque from "@serenity-kit/opaque";
import { dist_resolve, startup } from "@tiddlywiki/server";
import runCLI from "@tiddlywiki/commander";
import { runBuildOnce } from "./services/setupDevServer";
import { clientBuildDef } from "./startup";

export * from "@tiddlywiki/server";
export * from "@tiddlywiki/events";
export {
  SessionManager,
  SessionManagerObject,
  AuthUser
} from "./new-managers/sessions";
export {
  PasswordService
} from "./services/PasswordService";
export {
  WikiPluginCache,
  PluginDefinition,
  TiddlerHasher,
  defaultPreloadFunction,
} from "./plugin-cache";
export * from "./services/setupDevServer";
export * from "./services/tiddlywiki";
export {
  mountTW5Route,
  TW5Route
} from "./services/tw-routes";
export * from "./new-commands";
export * from "./new-managers";

export * from "@tiddlywiki/mws-prisma";

export default async function runMWS(oldOptions?: any) {
  // detect version 0.0 and exit
  if (oldOptions && oldOptions.passwordMasterKeyFile) {
    console.log([
      "=======================================================================================",
      "The wiki you are trying to open was created in a previous version of MWS.",
      "To return to a usable version of this wiki, you may run ",
      "",
      "npm install @tiddlywiki/mws@0.0",
      "",
      "Please export any wikis you want to keep by opening them and downloading them as single-file",
      "wikis by clicking on the cloud status icon and then 'save snapshot for offline use'.",
      "",
      "If you have custom options set up, we have moved to CLI commands instead of options.",
      "You can run `npx mws help` to see the available commands and `npx mws help listen` to ",
      "see the available options for the listen command. The password master key file is now",
      "stored in this folder as `passwords.key`.",
      "=======================================================================================",
    ].join("\n"));
    process.exit(1);
  }
  await opaque.ready;
  if (process.env.CLIENT_BUILD) {
    await runBuildOnce(clientBuildDef);
  } else {
    serverEvents.eventLogging = !!process.env.VERBOSE;
    await startup();
    await runCLI();
    serverEvents.eventLogging = false;
  }

}

serverEvents.on("cli.commander", (program) => {
  program.description("Multi-User Multi-Wiki Server for TiddlyWiki.");
})


declare global {
  namespace NodeJS {
    // These build flags need to be declared in tsBuildFlags.mjs
    interface ProcessEnv {
      /** 
       * This guards the store.js path that bypasses security with a nonce.
       * It's too much headache for no real benefit at the moment.
       * This also disbles the critical flag from the template.
       */
      BUILD_FLAG_EXTERNAL_STORE: boolean;
    }
  }
}