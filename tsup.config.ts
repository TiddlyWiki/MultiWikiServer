import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // events: 'packages/events/src/index.ts',
    // commander: 'packages/commander/src/index.ts',
    // server: 'packages/server/src/index.ts',
    mws: 'packages/mws/src/index.ts',
  },
  tsconfig: "tsconfig.base.json",
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
    "prisma-client",
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
      "import 'source-map-support/register.js';",
    ].join("\n")
  } : ctx.format === "cjs" ? {
    js: [
      "require('source-map-support/register');",
    ].join("\n")
  } : {},
  esbuildOptions(options, context) {
    options.conditions = [
      "tsup",
      "esbuild",
      "build",
    ]
  },
  async onSuccess() {

    writeFileSync("dist/mws.d.ts", [
      "export default function startServer(): Promise<void>;",
    ].join("\n"));
    console.log("TSC dist/mws.d.ts");

    if (process.env.PLUGINDTS) {
      const tag = "TSC ⚡️ done";
      console.time(tag);
      await start("node scripts.mjs build:types", [
        "--outFile", "./plugins/client/src/types.d.ts"
      ]).catch((code) => code);
      console.log("TSC plugins/client/src/types.d.ts");
      console.timeEnd(tag);
    }
  },
});

function start(cmd, args, env2 = {}, { cwd = process.cwd(), detached = false } = {}) {
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