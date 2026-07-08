import { existsSync, rmSync } from "fs";
import { request } from "http";
import { readFile, writeFile } from "fs/promises";
import { join, relative, resolve } from "path";
import { checkPath, dist_resolve, SendError, SendErrorReasonData, ServerRequest, ServerRoute, SuperHeaders } from "@tiddlywiki/server";
import { BuildOptions, BuildResult } from "esbuild";
import { serverEvents } from "@tiddlywiki/events";
import { objNumberSort } from "@tiddlywiki/server";
import escapeStringRegexp from 'escape-string-regexp';


// export type ServerToReactAdmin = Partial<ServerToReactAdminMap> | null;

export interface ServerToReactAdmin {
  sendError?: SendError<any>;
  userState: ServerRequest["user"];
}

export interface SendAdmin {
  (state: ServerRequest<any, any, any>, sendError?: SendError<any>): Promise<typeof STREAM_ENDED>;
}

export interface ClientBuildDefinition {
  rootdir: string;
  publicdir: string;
  /** Prefixes of paths that should serve the index html in addition to `/`. The query is ignored. */
  clientMounts?: string[];
  title: string;
}

const DEV_HOST = process.env.MWS_DEV_HOST || "127.0.0.20";

const DEV_FALLBACK = await readFile(dist_resolve("../public/.default.html"));

async function buildOptions({ rootdir, publicdir, entryHash }: { rootdir: string; publicdir: string; entryHash: boolean; }) {
  const { default: fn } = await import(resolve(rootdir, "esbuild.options.mjs"));
  const result = await fn({ rootdir, publicdir });
  result.options.metafile = true;
  result.options.entryNames = entryHash ? '[name]-[hash]' : undefined;
  return result;
}


function parseMetafileEntryPoints({ entryPoints, result, publicdir }: {
  entryPoints: { in: string; out: string; }[];
  result: BuildResult<BuildOptions & { metafile: true }>;
  publicdir: string;
}) {
  const entryPointsLookup = new Map(
    entryPoints.map(({ in: v, out: k }, index) =>
      [relative(process.cwd(), v), { name: k, index }] as const
    )
  );
  const outputs = Object.entries(result.metafile.outputs);
  const entryPointsInfo = outputs.filter(([k, v]) =>
    v.entryPoint && entryPointsLookup.has(v.entryPoint)
  ).sort(objNumberSort(([k, v]) =>
    entryPointsLookup.get(v.entryPoint!)!.index
  ));
  const js = entryPointsInfo.map(e =>
    relative(publicdir, e[0])
  );
  const css = entryPointsInfo.filter(([k, v]) =>
    v.cssBundle && result.metafile.outputs[v.cssBundle]
  ).map(e =>
    relative(publicdir, e[1].cssBundle!)
  );



  const maxwidth = outputs.reduce((a, [b]) => Math.max(a, b.length), 0);

  console.log("Build", relative(process.cwd(), publicdir), "output the following files");

  outputs.forEach(([k, v]) => {
    const { bytes } = v;
    let bytes2 = bytes, unit = 0;
    while (bytes2 > 1024) { bytes2 /= 1024; unit++; }
    const unitStr = ["B", "KB", "MB", "GB"][unit];
    console.log(`  ${k.padEnd(maxwidth, " ")}: ${(bytes2.toFixed(2) + " " + unitStr).padStart(10, " ")}`);
  });

  return { js, css };
}

const css_placer_regex = escapeStringRegexp("<!-- CSS entry files -->");
const js_placer_regex = escapeStringRegexp("<!-- JS entry files -->");
const title_placer_regex = escapeStringRegexp("<title></title>");

async function generateHtml({ js, css, publicdir, rootdir, title }: {
  js: string[];
  css: string[];
  rootdir: string;
  publicdir: string;
  title: string;
}) {

  const indexFile = (
    await readFile(join(rootdir, "index.html"), "utf8").catch(e => { console.log(e); throw e; })
  )
    .replaceAll(new RegExp(`([\t ]+)${css_placer_regex}`, "g"), (_, s) =>
      css.map(e => `${s}<link rel="stylesheet" href="${"$$js:pathPrefix$$"}/${e}" />`).join("\n"))

    .replaceAll(new RegExp(`([\t ]+)${js_placer_regex}`, "g"), (_, s) =>
      js.map(e => `${s}<script type="module" src="${"$$js:pathPrefix$$"}/${e}"></script>`).join("\n"))

    .replaceAll(new RegExp(`([\t ]+)${title_placer_regex}`, "g"), (_, s) =>
      `${s}<title>${title}</title>`)

  await writeFile(publicdir + ".html", indexFile);
}


async function make_index_file({ publicdir, pathPrefix, serverResponseJSON }: {
  publicdir: string;
  pathPrefix: string;
  serverResponseJSON: string;
}) {
  pathPrefix = (pathPrefix).replaceAll("</script>", "<\\/script>").toString();
  serverResponseJSON = (serverResponseJSON).replaceAll("</script>", "<\\/script>").toString();
  return Buffer.from((await readFile(publicdir + ".html", "utf8"))
    .replaceAll("$$js:pathPrefix$$", pathPrefix)
    .replaceAll("`$$js:pathPrefix:stringify$$`", JSON.stringify(pathPrefix))
    .replaceAll("`$$js:embeddedServerResponse:stringify$$`", serverResponseJSON),
    "utf8");
}


export async function setupClientBuild({ rootdir, publicdir, clientMounts, title }: ClientBuildDefinition): Promise<SendAdmin> {

  if (process.env.DEVSERVER === "watch") return await startDevServer({ rootdir, publicdir, clientMounts, title });
  if (process.env.DEVSERVER === "build") await runBuildOnce({ rootdir, publicdir, title });

  if (!existsSync(publicdir)) throw new Error(`${publicdir} does not exist`);

  return async function sendProdServer(state, sendError) {
    if (sendError)
      return await serveIndex({ state, publicdir, status: sendError.status, serverResponse: { userState: state.user, sendError, } });

    if (state.urlInfo.pathname === "/" || clientMounts?.some(e => state.urlInfo.pathname === e || state.urlInfo.pathname.startsWith(e + "/")))
      return await serveIndex({ state, publicdir, status: 200, serverResponse: { userState: state.user, } });

    return state.sendFile(200, {}, {
      root: publicdir,
      reqpath: state.urlInfo.pathname,
      on404: !clientMounts ? (async () => {
        await serveIndex({ state, publicdir, status: 200, serverResponse: { userState: state.user } })
      }) : undefined
    });
  };

}

async function serveIndex({ state, publicdir, status, serverResponse }: {
  state: ServerRequest;
  publicdir: string;
  status: number;
  serverResponse: ServerToReactAdmin;
}): Promise<typeof STREAM_ENDED> {

  const indexBuffer = await make_index_file({
    publicdir,
    pathPrefix: state.pathPrefix,
    serverResponseJSON: JSON.stringify(serverResponse)
  });
  return state.sendBuffer(status, {
    contentType: { mediaType: "text/html", charset: "utf-8" },
    contentLength: indexBuffer.length,
  }, indexBuffer);
}


export async function runBuildOnce({ rootdir, publicdir, title }: ClientBuildDefinition) {
  const timeTag = `Building client ${relative(process.cwd(), rootdir)}`;
  console.time(timeTag);
  if (existsSync(publicdir)) rmSync(publicdir, { recursive: true });
  const esbuild = await import('esbuild');
  const { options, entryPoints } = await buildOptions({ rootdir, publicdir, entryHash: true });

  // errors cause this to reject
  const result = await esbuild.build(options);
  console.timeEnd(timeTag);

  const { js, css } = parseMetafileEntryPoints({ entryPoints, result, publicdir });
  await writeFile(publicdir + ".json", JSON.stringify(result.metafile));
  await generateHtml({ js, css, rootdir, publicdir, title });

  return result;
}



async function startDevServer({ rootdir, publicdir, clientMounts, title }: ClientBuildDefinition): Promise<SendAdmin> {

  if (!existsSync(rootdir)) throw new Error("rootdir does not exist");
  if (existsSync(publicdir)) rmSync(publicdir, { recursive: true });

  const esbuild = await import('esbuild');

  const { options, entryPoints } = await buildOptions({ rootdir, publicdir, entryHash: false });

  const ctx = await esbuild.context(options);

  const { port } = await ctx.serve({
    servedir: publicdir,
    fallback: dist_resolve("../public/.default.html"),
    host: DEV_HOST,
  });

  async function rebuild() {
    if (existsSync(publicdir)) rmSync(publicdir, { recursive: true });
    // errors cause this to reject
    const result = await ctx.rebuild();
    const { css, js } = parseMetafileEntryPoints({ entryPoints, result, publicdir });
    await writeFile(publicdir + ".json", JSON.stringify(result.metafile));
    await generateHtml({ js, css, rootdir, publicdir, title });
  }

  serverEvents.on("exit", () => ctx.dispose());

  return async function sendDevServer(state: ServerRequest, sendError): Promise<typeof STREAM_ENDED> {
    // this will rebuild the html on page load
    // if the build fails, esbuild will serve the error so we just ignore it

    if (state.headers.get("sec-fetch-dest") === "document")
      await rebuild().catch((e) => { if (!(e.errors && e.warnings)) throw e; });

    if (sendError)
      return await serveIndex({
        state,
        publicdir,
        status: sendError.status,
        serverResponse: { userState: state.user, sendError }
      });

    if (state.urlInfo.pathname === "/" || clientMounts?.some(e => state.urlInfo.pathname === e || state.urlInfo.pathname.startsWith(e + "/")))
      return await serveIndex({
        state,
        publicdir,
        status: 200,
        serverResponse: { userState: state.user }
      });

    const headers = new Headers(state.headers);
    headers.set("host", "localhost");
    const proxyRes = await fetch(`http://${DEV_HOST}:${port}${state.urlInfo.pathname}`, {
      method: state.method,
      headers,
      body: state.readRawBody(),
    });

    const headers2 = new SuperHeaders(proxyRes.headers);
    // console.log(headers2);
    state.applyHeaders({
      contentLength: headers2.contentLength,
      contentType: headers2.contentType,
    });
    if (headers2.contentLength === DEV_FALLBACK.length) {
      const resBuffer = Buffer.from(await proxyRes.arrayBuffer());
      if (resBuffer.every((e, i) => e === DEV_FALLBACK[i])) {
        if (clientMounts) return state.sendEmpty(404);
        return await serveIndex({
          state,
          publicdir,
          status: proxyRes.status,
          serverResponse: { userState: state.user }
        });
      } else {
        return state.sendBuffer(proxyRes.status, {}, resBuffer);
      }
    } else {
      return state.sendStream(proxyRes.status, {}, proxyRes.body);
    }
  };
}


export function registerStatsRoute(rootRoute: ServerRoute, statsJsonMap: Record<string, string>) {
  if (!process.env.DEVSERVER) return;

  rootRoute.defineRoute({
    method: ['GET', 'HEAD'],
    path: /^\/stats\/(?<folder>[^\/]+)\/(?<file>.*)/,
    bodyFormat: "stream",
  }, async (state) => {
    checkPath(state, z => ({
      folder: z.enum(Object.keys(statsJsonMap)),
      file: z.string(),
    }), new Error());
    const { folder, file } = state.pathParams;

    async function makeStatsHTML() {
      return (await readFile(dist_resolve("../public/stats/stats.html"), "utf8"))
        .replaceAll("$$esbuild_stats_file_string$$", `${state.pathPrefix}/stats/${folder}/stats.json`)
        .toString();
    }

    switch (file) {
      case "stats.html":
        return state.sendString(200, {
          contentType: { mediaType: "text/html", charset: "utf-8" },
        }, await makeStatsHTML(), "utf8");
      case "stats.json":
        return state.sendBuffer(200, {
          contentType: { mediaType: "application/json" },
        }, await readFile(statsJsonMap[folder]))
      default:
        return await state.sendFile(200, {}, {
          root: dist_resolve("../public/stats/"),
          reqpath: file,
        });
    }
  });
}
