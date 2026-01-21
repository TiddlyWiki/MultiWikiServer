//@ts-check

// Cross-platform build and development scripts for Windows, Mac, and Linux
// start: `SKIPDTS=1 tsup && ENABLE_DEV_SERVER=1 node mws.dev.mjs`
// docs: `ENABLE_DOCS_ROUTE=1 npm start`
// postinstall: `PRISMA_CLIENT_FORCE_WASM=true prisma generate`

/// <reference lib="es2023" />
/// <reference types="node" />

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { start, events, run, removeRecursive, run_bin, moveFile } from "./helpers.mjs";
import { join, resolve } from "path";

(async function(arg) {
  switch(arg) {
    case "docs":
    case "start":
      await run("tsup", {});
      await start("node --trace-warnings --trace-uncaught mws.dev.mjs", process.argv.slice(3), {
        DEVSERVER: true ? "watch" : "build",
        ENABLE_EXTERNAL_PLUGINS: "1",
        ENABLE_DOCS_ROUTE: arg === "docs" ? "1" : "",
      });
      break;
    case "build":
      await run("tsup", {});
      await run_bin({ CLIENT_BUILD: "1" });
      break;
    case "prisma:generate": {
      await run("prisma validate", { "DATABASE_URL": "postgres://test" });
      await run("prisma format", {});
      await run("prisma generate", {});
      break;
    }
    case "dev-quick-reset": {
      // "rm -rf dev/wiki/store && DEBUG= npm start init-store",
      removeRecursive("dev/wiki/store");
      await start("npm start init-store");
      break;
    }
    case "test": {
      // "test:pack": "(git clean -dfx tests && npm pack --pack-destination tests && cd tests && npm install && npm install ./tiddlywiki-mws-$npm_package_version.tgz --no-save && npm test)",
      // "test": "(git clean -dfx tests && cd tests && npm install .. --no-save && npm test)",
      // "fulltest": "mv node_modules node_modules_old; npm run test:pack; mv node_modules_old node_modules",


      await Promise.resolve().then(async () => {
        // Cross-platform move operation
        moveFile("node_modules", "node_modules_off");
      }).then(async () => {
        await start("git clean -dfx tests");
        const filesFolder = resolve("create-package/files");
        const testsFolder = resolve("tests");
        mkdirSync(testsFolder, { recursive: false });
        // copy files into the folder
        console.log(`Copying files`);
        readdirSync(filesFolder).forEach(file => {
          const oldPath = join(filesFolder, file);
          if(!statSync(oldPath).isFile()) return;
          const newPath = join(testsFolder, file);
          if(existsSync(newPath)) {
            console.log(`File ${file} already exists. Skipping...`);
            return;
          }
          console.log(`├─ ${file}`);
          writeFileSync(newPath, readFileSync(oldPath));
        });
        await start("npm pack --pack-destination tests");
        // Read package.json to get version for cross-platform compatibility
        const packageJson = JSON.parse(readFileSync("package.json").toString());
        const packageVersion = packageJson.version;
        await start(`npm install ./tiddlywiki-mws-${packageVersion}.tgz tiddlywiki`, [], {}, { cwd: "tests" });
      }).then(async () => {
        await start("npx mws init-store", [], {}, { cwd: "tests" });
      }).finally(async () => {
        // Cross-platform move operation
        moveFile("node_modules_off", "node_modules");
      });
      break;
    }
    case "prisma:migrate":
      await start("prisma migrate dev", [
        "--schema", "prisma/schema.prisma",
        "--create-only",
        "--skip-generate"
      ], {
        DATABASE_URL: "file:test.sqlite"
      });
      break;
    default:
      console.log("nothing ran");
  }
})(process.argv[2]).catch((e) => {
  if(e) console.log("caught error", e);
  process.exitCode = 1;
});

const exit = (/** @type {any} */ code) => { events.emit("exit", code); };
process.on("SIGTERM", exit);
process.on("SIGINT", exit);
process.on("SIGHUP", exit);

