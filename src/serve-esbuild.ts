import { request } from "http";
import * as esbuild from "esbuild"
import { StateObject } from "./StateObject";
import { Router } from "./router";

export async function setupDevServer() {
  let ctx = await esbuild.context({
    entryPoints: ['react-user-mgmt/src/main.tsx'],
    bundle: true,
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic',
    outdir: 'react-user-mgmt/public',
  })

  const { port } = await ctx.serve({
    servedir: 'react-user-mgmt/public',
    fallback: 'react-user-mgmt/public/index.html',
  });

  return async function sendDevServer(this: Router, state: StateObject) {
    const proxyRes = await new Promise<import("http").IncomingMessage>((resolve, reject) => {
      const headers = { ...state.headers };
      delete headers[":method"];
      delete headers[":path"];
      delete headers[":authority"];
      delete headers[":scheme"];
      headers.host = "localhost";
      const proxyReq = request({
        hostname: "localhost",
        port: port,
        path: state.url,
        method: state.method,
        headers,
      }, resolve);
      state.reader.pipe(proxyReq, { end: true });
    });

    const { statusCode, headers } = proxyRes;
    if (statusCode === 404 || !statusCode)
      return state.sendEmpty(404, { 'Content-Type': 'text/html' });

    const body = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      proxyRes.on("data", chunk => { chunks.push(chunk); });
      proxyRes.on("end", () => { resolve(Buffer.concat(chunks)); });
      proxyRes.on("error", reject);
    });

    // const text = body.toString("utf8");
    // const part = `<script type="application/json" id="index-json"></script>`;
    // const parts = text.split(part);
    return state.sendBuffer(statusCode as number, headers, body);

    // state.writeHead(proxyRes.statusCode as number, proxyRes.headers);
    // state.write(parts[0] as string);
    // // const json = await getIndexJson(state);
    
    // state.write(`<script type="application/json" id="index-json">${
    //   JSON.stringify(json).replace(/<\/script>/g, '<\\/script>')
    // }</script>`);
    // state.write(parts[1] as string);
    // return state.end();
  }
}

