// start: `SKIPDTS=1 tsup && ENABLE_DEV_SERVER=1 node mws.dev.mjs`
// docs: `ENABLE_DOCS_ROUTE=1 npm start`

import { spawn } from "child_process";
const env = process.env;
const start = (cmd, args, env2 = {}) => {
  const cp = spawn(cmd, args, {
    env: { ...env, ...env2, },
    shell: true,
    stdio: "inherit",
  });
  return new Promise((r) => {
    // if any process errors it will immediately exit the script
    cp.on("exit", (code) => { if(code) process.exit(code); r(); })
  });
}
switch(process.argv[2]) {
  case "start":
    // don't wait on tsc, it's just for checking types
    start("npm run tsc", []);
    await start("tsup", [], { SKIPDTS: "1" });
    start("node mws.dev.mjs", process.argv.slice(3), { ENABLE_DEV_SERVER: "1" });
    break;
  case "docs":
    // call this directly rather than going through npm start
    start("node scripts.mjs start", [], { ENABLE_DOCS_ROUTE: "1" });
    break;
  case "prisma:generate":
    start("prisma generate", [], { PRISMA_CLIENT_FORCE_WASM: "true" });
    break;
  default:
    console.log("nothing ran");
}