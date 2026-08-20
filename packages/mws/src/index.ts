// const originalconsole = console.log.bind(console);
// console.log = (...args) => {
//   originalconsole(new Error("console stack").stack);
//   return originalconsole(...args)
// };
import { install } from "source-map-support";
install();
import { serverEvents } from "@tiddlywiki/events";
import * as path from "path";

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
import { dist_resolve, startup, tryParseJSON } from "@tiddlywiki/server";
import runCLI from "@tiddlywiki/commander";
import { runBuildOnce } from "./services/setupDevServer";
import { clientBuildDef } from "./startup";
import { existsSync } from "fs";
import { readFile } from "fs/promises";

export * from "@tiddlywiki/server";
export * from "@tiddlywiki/events";
export * from "@tiddlywiki/commander";
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

export default async function runMWS() {
  if (process.env.CLIENT_BUILD) {
    await runBuildOnce(clientBuildDef);
    return;
  }
  const wikiPath = path.resolve(process.cwd());
  (async () => {
    if (!existsSync(path.join(wikiPath, "package.json")))
      throw "The wiki path does not have a package.json file"

    const wikiPkg = tryParseJSON<{
      "name": "@tiddlywiki/mws-instance",
      "version": string,
      "private": boolean,
    }>(await readFile(path.join(wikiPath, "package.json"), "utf8"));

    if (!wikiPkg)
      throw "The wiki path has a package.json file with invalid JSON."
    if (wikiPkg.name !== "@tiddlywiki/mws-instance")
      throw "The wiki path package.json file is not named '@tiddlywiki/mws-instance'. "
    if (!wikiPkg.version.startsWith("0.2"))
      throw "The wiki path package.json file has the wrong version. "
      + "Found " + wikiPkg.version + ", expected 0.2.x";

    if (wikiPkg.private !== true) "PACKAGE_JSON_PRIVATE";

  })().catch(e => {
    if (e === "PACKAGE_JSON_PRIVATE") {
      throw 'Your data folder package.json does not have `"private": true"` set. '
      + 'Publishing your data folder is HIGHLY DANGEROUS and exposes '
      + 'all your tiddlers to the public internet as well as making your '
      + 'passwords easier to guess. Refusing to continue.';
    }
    if (typeof e === "string") {
      throw [
        "The current working directory does not appear to be a valid wiki path. ",
        "In order to start the server properly, you must start it from the folder ",
        "containing the passwords.key file. This is the root of your wiki folder.",
        "",
        "Error: " + e,
        "",
        "Since the package.json file for your wiki folder is created automatically, ",
        "this usually means you are in the wrong folder. You should NOT edit the package.json ",
        "file in the current folder to fix this.",
        "",
        "The current folder is: " + wikiPath,
        "",
        'This is also known as "Start In", "Working Directory", "Current Directory", etc. ',
      ].join("\n");
    } else {
      throw e;
    }
  });

  // the primary startup is in startup.ts
  // changes to this sequence should be documented in a change log
  serverEvents.eventLogging = !!process.env.VERBOSE;
  await opaque.ready;
  await startup();
  await runCLI();
  serverEvents.eventLogging = false;

}

serverEvents.on("cli.commander", (program) => {
  program.description("Multi-User Multi-Wiki Server for TiddlyWiki.");
})


// These build flags need to be declared in tsBuildFlags.mjs
declare global {
  /** 
   * This guards the store.js path that bypasses security with a nonce.
   * It's too much headache for no real benefit at the moment.
   * This also disbles the critical flag from the template.
   */
  const BUILD_FLAG_EXTERNAL_STORE: boolean;

  namespace NodeJS {
    interface ProcessEnv {
      DEVSERVER?: "watch" | "build";
    }
  }
}