import "./globals";
import { install } from "source-map-support";
install();
import { serverEvents } from "@tiddlywiki/events";

// these all use serverEvents
import "@tiddlywiki/commander";
import "@tiddlywiki/server";
import "./registerRequest";
import "./registerStartup";
import "./commands";
import "./managers";
import "./zodAssert";
import "./RequestState";
import "./ServerState";
import "./services/tw-routes";
import "./services/cache";
import "./services/sessions";
import "./SendError";

// startup
import * as opaque from "@serenity-kit/opaque";
import { dist_resolve, startup } from "@tiddlywiki/server";
import runCLI from "@tiddlywiki/commander";
import { runBuildOnce } from "./services/setupDevServer";

// exports
export { ZodRoute } from "@tiddlywiki/server";
export * from "./managers";

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

  await startup();
  await runCLI();


}

serverEvents.on("cli.commander", (program) => {
  program.description("Multi-User Multi-Wiki Server for TiddlyWiki.");
})


if (process.env.CLIENT_BUILD) {
  await runBuildOnce({
    rootdir: dist_resolve("../packages/react-admin"),
    publicdir: dist_resolve("../public/react-admin")
  });
}
