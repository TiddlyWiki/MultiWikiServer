
import { request } from "http";
import { join, resolve } from "path";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { ServerState } from "../ServerState";
import { dist_resolve, ServerRequest } from "@tiddlywiki/server";


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

const rootdir = dist_resolve('../packages/mdui-admin');
const publicdir = dist_resolve('../public/mdui-admin');

export async function setupDevServer(
  config: ServerState,
) {
  const { enableDevServer } = config;


  const make_index_file = async (pathPrefix: string) =>
    Buffer.from(new ExtString(await readFile(join(publicdir, "index.html"), "utf8"))
      .replaceAll("`$$js:pathPrefix:stringify$$`", JSON.stringify(pathPrefix))
      .replaceAll("$$js:pathPrefix$$", pathPrefix)
      , "utf8");

  if (!enableDevServer) {
    return async function sendProdServer(state: ServerRequest) {
      const index_file = await make_index_file(state.pathPrefix);
      const index_hash = createHash("sha1").update(index_file).digest().toString("base64");
      const sendIndex = (): typeof STREAM_ENDED => state.sendBuffer(200, {
        "content-type": "text/html",
        "content-length": index_file.length,
        "etag": index_hash,
      }, index_file);

      if (state.url === "/") return sendIndex();

      // use sendFile directly instead of having the dev server send it
      return state.sendFile(200, {}, {
        root: publicdir,
        reqpath: state.url,
        on404: async () => sendIndex()
      });
    };
  } else {
    const { ctx, port } = await esbuildStartup();

    return async function sendDevServer(state: ServerRequest) {
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
        // if (statusCode >= 500) console.log("Error from dev server:", statusCode, headers);
        return state.sendStream(statusCode as number, headers, proxyRes);
      }

    };
  }
}

export async function esbuildStartup() {

  const entry = resolve(rootdir, 'src/main.tsx');

  if (!existsSync(entry)) {
    throw new Error(`Entry file ${entry} does not exist. You might be running this in production via the ENABLE_DEV_SERVER=mws environment variable, which is only valid in the git repo.`);
  }

  const { default: context } = await import("@tiddlywiki/mdui-admin/esbuild.context.js")

  const ctx = await context(rootdir, publicdir);

  console.log(rootdir, publicdir)

  const { port } = await ctx.serve({
    servedir: publicdir,
    host: "127.0.0.20",
    onRequest(args) {
      console.log(args);
    },
    fallback: "index.html",
  });

  const result = await ctx.rebuild();

  writeFileSync(resolve(publicdir, 'stats/client.json'), JSON.stringify(result.metafile));

  return { ctx, port, result, rootdir, publicdir };
}

