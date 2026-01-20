//@ts-check
import { basename, join, resolve } from 'node:path';
import { copy } from 'esbuild-plugin-copy';
import { existsSync } from 'node:fs';

/**
 * @template {import('esbuild').BuildOptions} T
 * @param {import('esbuild').SameShape<import('esbuild').BuildOptions, T>} options 
 * @returns 
 */
function optionsTyped(options) {
  return options;
}

/**
 * 
 * @param {{rootdir: string, publicdir: string}} param0 
 */
export default async function({ rootdir, publicdir }) {

  /** @type {{in: string; out: string;}[]} */
  const entryPoints = [
    // { in: resolve(rootdir, 'polyfill.ts'), out: "polyfill" },
    { in: resolve(rootdir, 'client/main.tsx'), out: "main" },
  ];

  entryPoints.forEach(e => {
    if(!existsSync(e.in))
      throw new Error(`Entry file for ${e.out} does not exist at ${e.in}`);
  });

  const prod = false;

  const options = optionsTyped({
    entryPoints,
    bundle: true,
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic',
    outdir: publicdir,
    sourcemap: true,
    metafile: true,
    splitting: true,
    format: "esm",
    loader: { '.inline.css': 'text' },
    minify: !process.env.NOMINIFY,
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
      copy({
        assets: [{
          from: [join(rootdir, "public", "**/*")],
          to: ['.'],
        }],
      }),
    ]
  });

  return { options, entryPoints }
}