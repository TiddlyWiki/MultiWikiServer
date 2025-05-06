import { defineConfig } from 'tsup';
import "@serenity-kit/opaque"
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: "dist",
  external: [
    "typescript",
    "tiddlywiki",
    "esbuild",
    "@prisma/client",
    "@prisma/adapter-libsql",
    "@prisma/adapter-better-sqlite3",
    "@serenity-kit/opaque",
    "env-cmd",
  ],
  tsconfig: "tsconfig.json",
  keepNames: true,
  dts: process.env.SKIPDTS ? false : true,          // Generate type declaration files
  sourcemap: true,     // Generate source maps for debugging
  clean: true,         // Clean the output directory before each build
  minify: false,       // Set to true if you want minification
  splitting: false,    // Code splitting only if we need to lazy import
  cjsInterop: true,
  shims: true,         // Add shims for Node.js built-in modules
  metafile: true,      // https://esbuild.github.io/analyze/
  banner: (ctx) => ctx.format === "esm" ? {
    js: `import {createRequire as __createRequire} from 'module'; const require=__createRequire(import.meta.url);import 'source-map-support/register.js';`,
  } : {
    js: `require('source-map-support/register');`,
  },
});
