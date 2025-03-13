import { request } from "http";
import * as esbuild from "esbuild"
import { StateObject } from "../StateObject";
import { Router } from "../router";

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
    if (statusCode === 404 || !statusCode) {
      proxyRes.resume();
      return state.sendEmpty(404, { 'Content-Type': 'text/html' });
    } else {
      return state.sendStream(statusCode as number, headers, proxyRes);
    }
    
  }
}

