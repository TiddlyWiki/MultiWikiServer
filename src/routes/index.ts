import { readdirSync, statSync } from "fs";
import { rootRoute, Router } from "../router";
import AuthRoutes from "./auth";
import { TWRoutes } from "./tw-test";
import * as esbuild from "esbuild"
import { request } from "http";


/** 
 * The root route is specially defined in router.ts, 
 * so we don't really need to do anything here except 
 * setup the child routes. 
 */
export default async function RootRoute(root: rootRoute) {
  // AuthRoutes(root);
  // TWRoutes(root);
  // root.defineRoute({
  //   method: ['GET'],
  //   path: /^\/public\/(.*)/,
  //   pathParams: ['reqpath'],
  //   useACL: {},
  // }, async state => {
  //   console.log(state.pathParams.reqpath);
  //   return state.sendFile(200, {}, {
  //     root: 'react-user-mgmt/public',
  //     reqpath: state.pathParams.reqpath?.trim() || 'index.html', 
  //   });
  // })
  await importDir(root, 'handlers');
  await importEsbuild(root);
}
async function importDir(root: rootRoute, folder: string) {
  await Promise.all(readdirSync(`src/routes/${folder}`).map(async (item) => {
    if (item === "get-index.js") return;
    const stat = statSync(`src/routes/${folder}/${item}`);
    if (stat.isFile()) {
      const e = await import(`./${folder}/${item}`);
      if (!e.route) throw new Error(`No route defined in ${item}`);
      e.route(root);
    } else if (stat.isDirectory()) {
      await importDir(root, `${folder}/${item}`);
    }
  }));
}
async function importEsbuild(root: rootRoute) {
  // "build": "tsc -b; esbuild main=src/main.tsx 
  // --outdir=public --bundle --target=es2020 
  // --platform=browser --jsx=automatic"
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
  })

  root.defineRoute({
    method: ['GET'],
    path: /^\/(.*)/,
    pathParams: ['reqpath'],
    bodyFormat: "stream",
    useACL: {},
  }, async state => {
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
    if (proxyRes.statusCode === 404 || !proxyRes.statusCode) {
      return state.sendEmpty(404, { 'Content-Type': 'text/html' })
    }
    return state.sendStream(proxyRes.statusCode, proxyRes.headers, proxyRes)

  });
}