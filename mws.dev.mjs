
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import runMWS from "./dist/mws.js";
import { resolve } from "node:path";
Error.stackTraceLimit = 30;
console.log(process.version);
/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * For development, it is usually preferred to have a custom configuration that 
 * doesn't get committed or overwritten. For this purpose I have gitignore'd two 
 * paths: `mws.dev.json` and `dev`.
 * 
 * The `dev` folder is for whatever keys, certs, or other config you 
 * want to have for development which doesn't change. 
 * 
 * The `mws.dev.json` file in the dev folder is for whatever listen args you want. 
 * It is an "array of ListenArgs". Each item in the array is converted to a listen 
 * arg with the options specified. 
 * 
 * You may also pass arguments to the command line. The `mws.dev.json` file is only used if there
 * are no command line arguments. 
 * 
 * @typedef {Partial<Record<"host"|"port"|"prefix"|"key"|"cert"|"secure", string>>} ListenArgs 
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// if args aren't specified on the cli, generate listen args from the json file

if(process.argv.length === 2) {
  const listenerFile = "./dev/mws.dev.json";

  /** @type {ListenArgs[]} */
  const listeners = existsSync(listenerFile)
    ? JSON.parse(readFileSync(listenerFile, "utf8"))
    : [{}];

  const args = listeners.flatMap(e => {
    if(e.key) e.key = resolve("dev", e.key);
    if(e.cert) e.cert = resolve("dev", e.cert);
    return ["--listener", ...Object.entries(e).map(([k, v]) => `${k}=${v}`)]
  });

  console.log(args);
  process.argv = [process.argv[0], process.argv[1], "listen", ...args];

}
// make the editions/mws directory if it doesn't exist
mkdirSync("dev/wiki", { recursive: true })
// change to the editions/mws directory for development
process.chdir("dev/wiki");
// run the cli
runMWS().catch(console.log);


