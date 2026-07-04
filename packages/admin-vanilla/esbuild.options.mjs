//@ts-check
import { basename, join, resolve } from 'node:path';
import { copy } from 'esbuild-plugin-copy';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

/**
 * @template {import('esbuild').BuildOptions} T
 * @param {import('esbuild').SameShape<import('esbuild').BuildOptions, T>} options 
 * @returns 
 */
function optionsTyped(options) {
  return options;
}

const prod = true;
/**
 * 
 * @param {{ rootdir: string; publicdir: string; }} param0 
 * @returns 
 */
export default async function({ rootdir, publicdir }) {

  /** @type {{in: string; out: string;}[]} */
  const entryPoints = [
    { in: resolve(rootdir, 'polyfill.ts'), out: "polyfill" },
    { in: resolve(rootdir, 'src/main.tsx'), out: "main" },
  ];

  entryPoints.forEach(e => {
    if(!existsSync(e.in))
      throw new Error(`Entry file for ${e.out} does not exist at ${e.in}`);
  });

  const options = optionsTyped({
    entryPoints,
    bundle: true,
    target: 'ES2022',
    platform: 'browser',
    jsx: 'automatic',
    outdir: publicdir,
    sourcemap: true,
    metafile: true,
    splitting: false,
    loader: { '.inline.css': 'text', ".svg": "text", ".data-url": "dataurl" },
    format: "esm",
    treeShaking: true,
    minify: prod && !process.env.NOMINIFY,
    external: ['node:crypto'],
    define: prod ? {
      "process.env.NODE_ENV": JSON.stringify("production"),
      "import.meta.env.DEV": "false",
      "import.meta.env.PROD": "true",
      "import.meta.env.SSR": "false",
    } : {
      "process.env.NODE_ENV": JSON.stringify("development"),
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.SSR": "false",
    },
    conditions: prod ? [] : ["development"],
    plugins: [
      textLoaderPlugin,
      copy({
        assets: [{
          from: [join(rootdir, "public", "**/*")],
          to: ['.'],
        }],
      }),
    ],
  });

  return { options, entryPoints }
}

/** @type {() => import("esbuild").Plugin} */
export const traceJsxRuntimePlugin = () => ({
  name: 'trace-jsx-runtime',

  setup(build) {
    build.onResolve({ filter: /^react\/jsx-(dev-)?runtime$/ }, (args) => {
      console.warn(`[jsx-runtime] ${args.path} imported by ${args.importer} (kind: ${args.kind})`)
      return null;
    })
  }
});

/**
 * @param {import("esbuild").PluginBuild} build 
 * @param {string} suffix 
 * @param {string} namespace
 * @param {(args: import('esbuild').OnLoadArgs) => (import('esbuild').OnLoadResult | null | undefined | Promise<import('esbuild').OnLoadResult | null | undefined>)} callback
 */
function setResolve(build, suffix, namespace, callback) {
  const regText = new RegExp("\\?" + suffix + "$");
  // Step 1: intercept imports with ?text
  build.onResolve({ filter: regText }, async (args) => {
    const rawPath = args.path.replace(regText, '');
    const result = await build.resolve(rawPath, {
      kind: args.kind,
      importer: args.importer,
      resolveDir: args.resolveDir,
      namespace: args.namespace,
      pluginData: args.pluginData,
      with: args.with,
    });
    if (result.errors.length > 0) {
      return { errors: result.errors };
    }
    return {
      path: result.path,
      namespace: namespace,
      watchFiles: result.path ? [result.path] : [],
    };
  });
  build.onLoad({ filter: /.*/, namespace: 'text-import' }, callback);
}
/** @type {import("esbuild").Plugin} */
export const textLoaderPlugin = {
  name: 'text-loader',
  setup(build) {

    setResolve(build, "text", "text-import", async (args) => {
      console.log("text loader", args.path);
      const contents = await readFile(args.path, 'utf8');
      return { contents, loader: 'text', watchFiles: [args.path], };
    });

    setResolve(build, "file", "file-import", async (args) => {
      console.log("file loader", args.path);
      const contents = await readFile(args.path);
      return { contents, loader: 'file', watchFiles: [args.path], };
    });

  },
};