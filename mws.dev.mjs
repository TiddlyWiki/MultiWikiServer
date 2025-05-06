//@ts-check
import startServer from "@tiddlywiki/mws";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// if you want to change the listeners for npm start, you can copy the 
// listener array into mws.dev.json and they will be loaded from there. 
const dir = dirname(import.meta ? fileURLToPath(import.meta.url) : module.filename);

// if args aren't specified, generate listen args from the json file
if(process.argv.length === 2) {
  const listenerFile = dir + "/mws.dev.json";
  /** @type {{host: string; port: string; prefix: string; key: string; cert: string;}[]} */
  const listeners = existsSync(listenerFile)
    ? JSON.parse(readFileSync(listenerFile, "utf8"))
    : []
  // generate the listener options
  const args = listeners.flatMap(e => ["--listen", ...Object.entries(e).map(([k, v]) => `${k}=${v}`)])
  // generaate the process.argv
  process.argv = [process.argv[0], process.argv[1], ...args];
  // log the args for debugging
  console.log(args);
}
// change to the editions/mws directory for development
process.chdir("editions/mws");
// start server
startServer().catch(console.log);
