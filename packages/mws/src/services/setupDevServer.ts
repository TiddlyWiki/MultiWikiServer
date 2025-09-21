
import { request } from "http";
import { join, resolve } from "path";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { ServerState } from "../ServerState";
import {
  dist_resolve, ServerRequest,
  SendErrorReasonData, SendError,
} from "@tiddlywiki/server";

export type ServerToReactAdmin
  = { [k in keyof ServerToReactAdminMap]?: ServerToReactAdminMap[k] }
  | null

export interface ServerToReactAdminMap {
  sendError: ReturnType<SendError<keyof SendErrorReasonData>["toJSON"]>,
}



class ExtString {
  constructor(private str: string) {

  }
  replaceAll(search: string, replace: string) {
    while (true) {
      let cur = this.str;
      this.str = cur.replace(search, replace);
      if (cur === this.str) return new ExtString(cur);
    }
  }
  [Symbol.toPrimitive](hint: "string") { return this.str; }
  toString() { return this.str; }
}

const rootdir = dist_resolve('../packages/react-admin');
const publicdir = dist_resolve('../public/react-admin');

export async function setupDevServer(
  config: ServerState,
): Promise<(state: ServerRequest, status: number, serverResponse: ServerToReactAdmin) => Promise<typeof STREAM_ENDED>> {
  const { enableDevServer } = config;

  // Escaped </script> to avoid ending the script block early
  const escapedScriptEnd = "<\\/script>";
  const make_index_file = async (pathPrefix: string, serverResponseJSON: string) => {
    pathPrefix = new ExtString(pathPrefix).replaceAll("</script>", "<\\/script>").toString();
    serverResponseJSON = new ExtString(serverResponseJSON).replaceAll("</script>", "<\\/script>").toString();
    return Buffer.from(new ExtString(await readFile(join(publicdir, "index.html"), "utf8"))
      .replaceAll("$$js:pathPrefix$$", pathPrefix)
      .replaceAll("`$$js:pathPrefix:stringify$$`", JSON.stringify(pathPrefix))
      .replaceAll("`$$js:embeddedServerResponse:stringify$$`", serverResponseJSON)
      , "utf8");
  };

  if (!enableDevServer) {
    return async function sendProdServer(state: ServerRequest, status: number, serverResponse: ServerToReactAdmin) {
      const index_file = await make_index_file(state.pathPrefix, JSON.stringify(serverResponse));
      const index_hash = createHash("sha1").update(index_file).digest().toString("base64");
      const sendIndex = (): typeof STREAM_ENDED => state.sendBuffer(200, {
        "content-type": "text/html",
        "content-length": index_file.length,
        "etag": index_hash,
      }, index_file);

      if (state.url === "/") return sendIndex();

      // use sendFile directly instead of having the dev server send it
      return state.sendFile(status, {}, {
        root: publicdir,
        reqpath: state.url,
        on404: async () => sendIndex()
      });
    };
  } else {
    const { ctx, port } = await esbuildStartup();

    return async function sendDevServer(
      state: ServerRequest, status: number, serverResponse: ServerToReactAdmin) {
      const index_file = await make_index_file(state.pathPrefix, JSON.stringify(serverResponse));
      const index_hash = createHash("sha1").update(index_file).digest().toString("base64");
      // const sendIndex = (): typeof STREAM_ENDED => ;

      const proxyRes = await new Promise<import("http").IncomingMessage>((resolve, reject) => {
        const headers = { ...state.headers };
        delete headers[":method"];
        delete headers[":path"];
        delete headers[":authority"];
        delete headers[":scheme"];
        headers.host = "localhost";
        const proxyReq = request({
          hostname: "127.0.0.20",
          port: port,
          path: state.url,
          method: state.method,
          headers,
        }, resolve);
        state.reader.pipe(proxyReq, { end: true });
      });

      const { statusCode, headers } = proxyRes;
      if (statusCode === 200
        && headers["content-type"] === "text/html; charset=utf-8"
      ) {
        const indexCheck = await new Promise<Buffer>(resolve => {
          const chunks: Buffer[] = [];
          proxyRes.on("data", chunk => { chunks.push(chunk); });
          proxyRes.on("end", () => { resolve(Buffer.concat(chunks)) })
        });

        if (indexCheck.toString("utf8").includes("<!-- react-user-mgmt client home page -->"))
          return state.sendBuffer(status, {
            "content-type": "text/html",
            "content-length": index_file.length,
            "etag": index_hash,
          }, index_file);
      }
      if (statusCode === 404 || !statusCode) {
        proxyRes.resume();
        return state.sendBuffer(200, {
          "content-type": "text/html",
          "content-length": index_file.length,
          "etag": index_hash,
        }, index_file);
      } else {
        return state.sendStream(statusCode as number, headers, proxyRes);
      }

    };
  }
}

export async function esbuildStartup() {
  const esbuild = await import("esbuild");

  const entry = resolve(rootdir, 'src/main.tsx');

  if (!existsSync(entry)) {
    throw new Error(`Entry file ${entry} does not exist. You might be running this in production via the ENABLE_DEV_SERVER=mws environment variable, which is only valid in the git repo.`);
  }

  let ctx = await esbuild.context({
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

  const { port } = await ctx.serve({
    servedir: publicdir,
    host: "127.0.0.20"
  });

  const result = await ctx.rebuild();

  writeFileSync(resolve(publicdir, 'stats.json'), JSON.stringify(result.metafile));


  return { ctx, port, result, rootdir, publicdir };
}

