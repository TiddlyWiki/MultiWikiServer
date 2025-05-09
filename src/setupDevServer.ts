
import { request } from "http";
import { join, resolve } from "path";
import { StateObject } from "./StateObject";
import { dist_resolve } from "./utils";
import { createHash } from "crypto";
import { STREAM_ENDED } from "./streamer";
import { readFile } from "fs/promises";
import { writeFileSync } from "fs";

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
}

export async function setupDevServer<T extends StateObject>(
  enableDevServer: boolean,

) {
  const rootdir = dist_resolve('../react-user-mgmt');


  const make_index_file = async (pathPrefix: string) =>
    Buffer.from(new ExtString(await readFile(join(rootdir, "public/index.html"), "utf8"))
      .replaceAll("`$$js:pathPrefix:stringify$$`", JSON.stringify(pathPrefix))
      .replaceAll("$$js:pathPrefix$$", pathPrefix)
      , "utf8");

  if (!enableDevServer) {
    return async function sendProdServer(state: T) {
      const index_file = await make_index_file(state.pathPrefix);
      const index_hash = createHash("sha1").update(index_file).digest().toString("base64");
      const sendIndex = (): typeof STREAM_ENDED => state.sendBuffer(200, {
        "content-type": "text/html",
        "content-length": index_file.length,
        "etag": index_hash,
      }, index_file);

      // console.log(state.url);
      // console.log(rootdir);

      if (state.url === "/") return sendIndex();

      // use sendFile directly instead of having the dev server send it
      return state.sendFile(200, {}, {
        root: resolve(rootdir, "public"),
        reqpath: state.url,
        on404: async () => sendIndex()
      });
    };
  } else {
    const { ctx, port } = await esbuildStartup();

    return async function sendDevServer(state: T) {
      const index_file = await make_index_file(state.pathPrefix);
      const index_hash = createHash("sha1").update(index_file).digest().toString("base64");
      const sendIndex = (): typeof STREAM_ENDED => state.sendBuffer(200, {
        "content-type": "text/html",
        "content-length": index_file.length,
        "etag": index_hash,
      }, index_file);

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
          return sendIndex();
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

  const rootdir = dist_resolve('../react-user-mgmt');
  const esbuild = await import("esbuild");

  let ctx = await esbuild.context({
    entryPoints: [resolve(rootdir, 'src/main.tsx')],
    bundle: true,
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic',
    outdir: resolve(rootdir, 'public'),
    minify: true,
    sourcemap: true,
    metafile: true,
    splitting: true,
    format: "esm",
  });

  const { port } = await ctx.serve({
    servedir: resolve(rootdir, 'public'),
    host: "127.0.0.20"
  });

  const result = await ctx.rebuild();

  writeFileSync(resolve(rootdir, 'public/stats.json'), JSON.stringify(result.metafile));


  return { ctx, port, result, rootdir };
}