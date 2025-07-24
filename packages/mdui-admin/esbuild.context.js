import esbuild from "esbuild";
import { resolve } from "path";

export default async function context(rootdir, publicdir) {

  return await esbuild.context({
    entryPoints: [resolve(rootdir, 'src/main.tsx')],
    bundle: true,
    target: 'ES2022',
    platform: 'browser',
    jsx: 'automatic',
    // jsx: "transform",
    outdir: publicdir,
    sourcemap: true,
    metafile: true,
    splitting: false,
    format: "esm",
    ...false ? {
      minify: true,
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "import.meta.env.DEV": "false",
        "import.meta.env.PROD": "true",
        "import.meta.env.SSR": "false",
      },
    } : {
      minify: false,
      define: {
        "process.env.NODE_ENV": JSON.stringify("development"),
        "import.meta.env.DEV": "true",
        "import.meta.env.PROD": "false",
        "import.meta.env.SSR": "false",
      },
      conditions: ["development"],
    }
  });
}