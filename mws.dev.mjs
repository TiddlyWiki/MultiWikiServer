//@ts-check
import startServer from "@tiddlywiki/mws";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// if you want to change the listeners for npm start, you can copy the 
// listener array into mws.dev.json and they will be loaded from there. 

const dir = dirname(import.meta ? fileURLToPath(import.meta.url) : module.filename);
const listenerFile = dir + "/mws.dev.json";

/** @type {import("@tiddlywiki/mws").MWSConfig["listeners"]} */
const listeners = existsSync(listenerFile)
  ? JSON.parse(readFileSync(listenerFile, "utf8"))
  : [{
    // first run `npm run certs` to generate the certs
    // key: "./runtime-config/localhost.key",
    // cert: "./runtime-config/localhost.crt",
    host: "localhost",
    port: 8080,
  }];


startServer({
  enableDevServer: false,
  passwordMasterKeyFile: "./runtime-config/localpass.key",
  listeners,
  wikiPath: "./editions/mws",
  config: { pathPrefix: "/dev", }
}).catch(console.log);
