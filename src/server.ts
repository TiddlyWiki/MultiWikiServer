import "./routes/router";
import "./StateObject";
import "./streamer";
import "./global";
import * as opaque from "@serenity-kit/opaque";
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { bootTiddlyWiki } from "./tiddlywiki";
import { Commander } from "./commander";
import { createPasswordService } from "./services/PasswordService";
import { join } from "node:path";
import { startListeners } from "./listeners";
// import * as http2 from "http2";
// export * from "./services/sessions";

export { SiteConfig } from "./commander";


export default async function startServer() {

  await opaque.ready;

  const cli = process.argv.slice(2);

  const wikiPath = process.cwd();
  if (!existsSync(wikiPath)) throw "The wiki path does not exist";

  const pw = await createPasswordService(readPasswordMasterKey(wikiPath));

  const $tw = await bootTiddlyWiki(wikiPath);

  const commander = new Commander(wikiPath, $tw, pw);

  await commander.init();


  if (cli[0] === "--listen")
    await startListeners(cli, commander);
  else {

    if (commander.setupRequired && cli[0] !== "--init-store" && cli[0] !== "--load-archive") {
      console.log("MWS setup required. Please run either --init-store or --load-archive first");
      process.exit(1);
    }

    await commander.execute(cli);
  }
}
function readPasswordMasterKey(wikiPath: string) {
  const passwordKeyFile = join(wikiPath, "passwords.key");
  if (typeof passwordKeyFile === "string"
    && passwordKeyFile
    && !existsSync(passwordKeyFile)) {
    writeFileSync(passwordKeyFile, opaque.server.createSetup());
    console.log("Password master key created at", passwordKeyFile);
  }

  const passwordMasterKey = readFileSync(passwordKeyFile, "utf8").trim();
  return passwordMasterKey;
}

