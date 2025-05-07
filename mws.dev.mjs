//@ts-check
import { existsSync, mkdirSync, readFileSync } from "node:fs";

mkdirSync("editions/mws", { recursive: true })
// change to the editions/mws directory for development
process.chdir("editions/mws");
// if args aren't specified, generate listen args from the json file
if(process.argv.length === 2) {
  const listenerFile = "mws.dev.json";
  /** @type {{ host: string; port: string; prefix: string; key: string; cert: string; secure: boolean; }[]} */
  const listeners = existsSync(listenerFile) ? JSON.parse(readFileSync(listenerFile, "utf8")) : []
  // generate the listener options
  const args = listeners.flatMap(e => ["--listen", ...Object.entries(e).map(([k, v]) => `${k}=${v}`)])
  // generaate the process.argv
  process.argv = [process.argv[0], process.argv[1], ...args];
  // log the args for debugging
  console.log(args);
}

import "./dist/server.js";
