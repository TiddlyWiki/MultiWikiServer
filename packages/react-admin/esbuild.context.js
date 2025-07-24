export default async function context(rootdir, publicdir) {
  return await esbuild.context({
    entryPoints: [resolve(rootdir, 'src/main.tsx')],
    bundle: true,
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic',
    outdir: publicdir,
    minify: true,
    sourcemap: true,
    metafile: true,
    splitting: true,
    format: "esm",
  });
}