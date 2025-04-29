import { defineConfig } from 'tsup';
import "@serenity-kit/opaque"
import { copy } from 'esbuild-plugin-copy';
import { wasmLoader } from 'esbuild-plugin-wasm';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: "dist",
  external: [
    "tiddlywiki",
    "esbuild",
    "@prisma/adapter-libsql",
    "@prisma/adapter-better-sqlite3",
    "prisma-query-client",
    "@serenity-kit/opaque",
    "env-cmd",
  ],
  esbuildOptions: (options, ctx) => {
    options.alias ||= {};
    // options.alias["#wasm-engine-loader"] = "./prisma-query-client/wasm-worker-loader.mjs"
    // options.alias["./query_comiler"]
  },
  esbuildPlugins: [
    wasmLoader({ mode: "deferred" }),
    copy({
      assets: [
        // {
        //   from: ['./prisma-query-client/query_compiler_bg.wasm'],
        //   to: ['./'],
        // },
        // {
        //   from: ['./prisma-query-client/schema.prisma'],
        //   to: ['./'],
        // },
      ],
    })
  ],
  loader: {
    // ".wasm": "copy"
  },
  tsconfig: "tsconfig.json",
  keepNames: true,
  dts: process.env.SKIPDTS ? false : true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  cjsInterop: true,
  shims: true,
  banner: (ctx) => {
    let js = "";
    if (ctx.format === "esm") {
      js += `import {createRequire as __createRequire} from 'module';\n`;
      js += `const require=__createRequire(import.meta.url);\n`;
      // js += `import 'source-map-support/register.js';\n`;
    } else {
      // js += `require('source-map-support/register');`;
    }
    return { js }
  },
});
