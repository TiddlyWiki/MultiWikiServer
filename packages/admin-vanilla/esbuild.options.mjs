//@ts-check
import { basename, join, resolve } from 'node:path';
import { copy } from 'esbuild-plugin-copy';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tsBuildFlags } from "../../tsBuildFlags.mjs";
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
export default async function ({ rootdir, publicdir }) {
  console.log(rootdir);
  /** @type {{in: string; out: string;}[]} */
  const entryPoints = [
    { in: resolve(rootdir, 'polyfill.ts'), out: "polyfill" },
    { in: resolve(rootdir, 'src/main.tsx'), out: "main" },
  ];

  entryPoints.forEach(e => {
    if (!existsSync(e.in))
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
    define: {
      ...prod ? {
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
      ...tsBuildFlags,
    },
    conditions: prod ? [] : ["development"],
    plugins: [
      forbidDirectoryPlugin({
        directories: [
          join(rootdir, '../mws/src'),
          join(rootdir, '../server/src'),
        ],
        allow: [
          join(rootdir, "../server/src/Z2.ts"),
          join(rootdir, "../server/src/SendError.ts"),
          join(rootdir, "../mws/src/utils/shared.ts"),
          join(rootdir, "../mws/src/new-managers/TabDataTypes.ts"),
          join(rootdir, "../mws/src/new-managers/TabDataZod.ts"),
        ],
      }),
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



// ...existing code...

import { isAbsolute, relative, sep } from 'node:path';

/**
 * @param {{ directories: string[]; allow?: string[] }} options
 * Relative allow entries are resolved against every forbidden directory.
 * @returns {import('esbuild').Plugin}
 */
export function forbidDirectoryPlugin({ directories, allow = [] }) {
  const skip = Symbol('directory-boundary-probe');

  return {
    name: 'forbid-directory-js',

    setup(build) {
      const roots = directories.map(directory =>
        resolve(build.initialOptions.absWorkingDir ?? process.cwd(), directory));
      const allowed = new Set(roots.flatMap(root => allow.map(file => resolve(root, file))));

      build.onResolve({ filter: /.*/ }, async args => {
        if (args.pluginData?.[skip]) return;

        const result = await build.resolve(args.path, {
          importer: args.importer,
          resolveDir: args.resolveDir,
          kind: args.kind,
          namespace: args.namespace,
          with: args.with,
          pluginData: { ...args.pluginData, [skip]: true },
        });

        // Let normal resolution handle failures and permitted imports.
        // Do not return the probe result: its recursion marker must not leak.
        if (result.errors.length || result.external) return;

        if (allowed.has(result.path)) return;

        const root = roots.find(directory => {
          const child = relative(directory, result.path);
          return child !== '..' &&
            !child.startsWith(`..${sep}`) &&
            !isAbsolute(child);
        });
        if (root === undefined) return;

        const child = relative(root, result.path);

        return {
          errors: [{
            text: `Forbidden import: ${result.path}`,
            notes: [
              { text: `Importer: ${args.importer || '<entry point>'}` },
              { text: `Import specifier: ${args.path}` },
              { text: `Import kind: ${args.kind}` },
              { text: `Resolve directory: ${args.resolveDir}` },
              { text: `Namespace: ${args.namespace} → ${result.namespace}` },
              { text: `Forbidden directory: ${root}` },
              { text: `To permit this file, add it to the exceptions list in esbuild.options.mjs.` },
            ],
          }],
        };
      });
    },
  };
}