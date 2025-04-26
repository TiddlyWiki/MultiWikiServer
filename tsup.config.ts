import { defineConfig } from 'tsup';
import "@serenity-kit/opaque"
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: "dist",
  external: [
    "tiddlywiki",
    "esbuild",
    "@prisma/client",
    "@prisma/adapter-libsql",
    "@prisma/adapter-better-sqlite3",
    "@serenity-kit/opaque",
    // "@libsql/client",
    // "better-sqlite3",
    // "node-sqlite3-wasm",
  ],
  tsconfig: "tsconfig.json",
  keepNames: true,
  dts: true,          // Generate type declaration files
  sourcemap: true,     // Generate source maps for debugging
  clean: true,         // Clean the output directory before each build
  minify: false,       // Set to true if you want minification
  splitting: true,     // Code splitting is unnecessary
  cjsInterop: true,
  shims: true,        // Add shims for Node.js built-in modules
  banner: (ctx) => ctx.format === "esm" ? {
    js: `import {createRequire as __createRequire} from 'module'; const require=__createRequire(import.meta.url);import 'source-map-support/register.js';`,
  } : {
    js: `require('source-map-support/register');`,
  },
});
