/// <reference lib="es2023" />
/// <reference types="node" />

import { spawn } from 'child_process';
import { readFile, readFileSync, writeFileSync } from 'fs';
// the tsup node_modules in the tools directory
import { defineConfig } from './tools/node_modules/tsup/dist/index.js';

const prod = process.env.BUILD_ENV === 'runtime';

export default defineConfig({
  entry: {
    // events: 'packages/events/src/index.ts',
    // commander: 'packages/commander/src/index.ts',
    // server: 'packages/server/src/index.ts',
    mws: 'packages/mws/src/index.ts',
  },
  tsconfig: "tsconfig.json",
  format: ['esm'],
  outDir: "dist",
  external: [
    "tiddlywiki",
    "esbuild",
    "env-cmd",
    "zod-to-ts",
    "@prisma/adapter-libsql",
    "@prisma/adapter-better-sqlite3",
    "@serenity-kit/opaque",
  ],
  dts: false,
  keepNames: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  cjsInterop: true,
  shims: true,
  metafile: true,
  banner: (ctx) => ctx.format === "esm" ? {
    js: [
      "import {createRequire as __createRequire} from 'module';",
      "const require=__createRequire(import.meta.url);",
    ].join("\n")
  } : ctx.format === "cjs" ? {
    js: [

    ].join("\n")
  } : {},
  esbuildOptions(options, context) {
    options.conditions = [
      "tsup",
      "esbuild",
      "build",
    ]
  },
  define: prod ? {
    "process.env.CLIENT_BUILD": "false",
    "process.env.DEVSERVER": "false",
  } : {},
  noExternal: ["@tiddlywiki/mws", "@tiddlywiki/mws-prisma"],
  async onSuccess() {

    writeFileSync("dist/mws.d.ts", [
      "export default function startServer(): Promise<void>;",
    ].join("\n"));
    console.log("TSC dist/mws.d.ts");

    // writeFileSync("public/stats/server.json", readFileSync("dist/metafile-esm.json"));

    if (process.env.TSCMWS) {
      const tag = "TSC ⚡️ done";
      console.time(tag);
      await start("npx tsc -p tsconfig.json --noEmit", []).catch((code) => code);
      console.timeEnd(tag);
    }

    // if (process.env.PLUGINDTS) {
    //   const tag = "TSC ⚡️ done";
    //   console.time(tag);
    //   await start("npx tsc -p tsconfig.types.json", [
    //     "--outFile", "./plugins/client/src/types.d.ts"
    //   ]).catch((code) => code);
    //   let file = readFileSync("./plugins/client/src/types.d.ts", "utf-8");
    //   file = file.replaceAll(`import("@tiddlywiki/server")`, `import("packages/server/src/index")`);
    //   file = file.replaceAll(`import("prisma/client")`, `import("@tiddlywiki/mws-prisma")`);
    //   writeFileSync("./plugins/client/src/types.d.ts", file);
    //   console.log("TSC plugins/client/src/types.d.ts");
    //   console.timeEnd(tag);
    // }
  },
});

function start(cmd: string, args: string[], env2 = {}, { cwd = process.cwd(), detached = false } = {}) {
  const cp = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env2, },
    shell: true,
    stdio: ["inherit", "inherit", "inherit"],
    detached,
  });
  if (detached) cp.unref();
  return new Promise<void>((r, c) => {
    // if any process errors it will immediately exit the script
    cp.on("exit", (code) => { if (code) c(code); else r(); });
  });
}