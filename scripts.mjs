// start: `SKIPDTS=1 tsup && ENABLE_DEV_SERVER=1 node mws.dev.mjs`
// docs: `ENABLE_DOCS_ROUTE=1 npm start`
// postinstall: `PRISMA_CLIENT_FORCE_WASM=true prisma generate`

import { spawn } from "child_process";
import EventEmitter from "events";
import { writeFileSync } from "fs";
const events = new EventEmitter();
const workspaces = [
  "packages/server",
  "packages/mws",
  "packages/react-admin",
  "packages/tiddlywiki-types",
  "plugins/client"
];
(async function run(arg) {
  switch(arg) {
    case "install":
      // run npm install in each workspace
      await start("npm install", []);
      for(const ws of workspaces) {
        console.log("================================")
        await start("npm install", [], {}, { cwd: ws });
      }
      break;
    case "tsc":
      // run tsc in each workspace
      await start("npm run tsc", []).catch(console.log);
      for(const ws of workspaces) {
        console.log("================================")
        await start("npm run tsc", [], {}, { cwd: ws }).catch(console.log);
      }
      break;
    case "start":
      // don't wait on tsc, it's just for checking types
      // await start("npm run tsc", []);
      await start("tsup --silent", [], {
        SKIPDTS: "1"
      });
      await start("node --trace-uncaught --trace-warnings mws.dev.mjs", process.argv.slice(3), {
        ENABLE_DEV_SERVER: "mws",
        ENABLE_EXTERNAL_PLUGINS: "1",
      });
      break;
    case "docs":
      // call this directly rather than going through npm start
      process.env.ENABLE_DOCS_ROUTE = "1";
      await run("start");
      break;
    case "prisma:generate":
      await start("prisma generate", [], {
        PRISMA_CLIENT_FORCE_WASM: "true"
      });
      break;
    case "client-types": {
      const res = await start("node --trace-uncaught mws.dev.mjs", ["build-types"], {}, {
        pipeOut: true,
      });
      writeFileSync("packages/react-admin/src/server-types.ts", res);
      break;
    }
    case "build:types": {
      await start("npx tsc -p tsconfig.types.json", process.argv.slice(3));
      break;
    }
    default:
      console.log("nothing ran");
  }
})(process.argv[2]).catch(console.log);

const exit = (code) => { events.emit("exit", code); };
process.on("SIGTERM", exit);
process.on("SIGINT", exit);
process.on("SIGHUP", exit);

function start(cmd, args, env2 = {}, { cwd = process.cwd(), pipeOut } = {}) {
  const cp = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env2, },
    shell: true,
    stdio: ["inherit", pipeOut ? "pipe" : "inherit", "inherit"],
  });

  events.on("exit", (code) => { cp.kill(code); });

  if(pipeOut) {

    return new Promise((r, c) => {
      const chunks = [];
      cp.stdout.on("data", (data) => {
        chunks.push(data);
      });
      cp.stdout.on("end", () => {
        r(chunks.map(e => e.toString()).join(""));
      });
      // if any process errors it will immediately exit the script
      cp.on("exit", (code) => {
        if(code) c(code);
      });
    });
  } else {
    return new Promise((r, c) => {
      // if any process errors it will immediately exit the script
      cp.on("exit", (code) => { if(code) c(code); else r(); });
    });
  }


}