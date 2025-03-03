import { readdirSync, statSync } from "fs";
import { rootRoute, Router } from "../router";
import AuthRoutes from "./auth";
import { TWRoutes } from "./tw-test";
import * as esbuild from "esbuild"
import { request } from "http";
import ApiRoutes from "./api/api";
import { ZodAssert } from "../zodAssert";


export default async function RootRoute(root: rootRoute) {
  // await TWRoutes(root);
  await ApiRoutes(root);
  await importDir(root, 'handlers');
  await importEsbuild(root);
}
async function importDir(root: rootRoute, folder: string) {
  await Promise.all(readdirSync(`src/routes/${folder}`).map(async (item) => {
    const stat = statSync(`src/routes/${folder}/${item}`);
    if (stat.isFile()) {
      const e = await import(`./${folder}/${item}`);
      if (!e.route) throw new Error(`No route defined in ${item}`);
      e.route(root, ZodAssert);
    } else if (stat.isDirectory()) {
      await importDir(root, `${folder}/${item}`);
    }
  }));
}

async function importEsbuild(root: rootRoute) {
  // "build": "tsc -b; esbuild main=src/main.tsx 
  // --outdir=public --bundle --target=es2020 
  // --platform=browser --jsx=automatic"
  

  root.defineRoute({
    method: ['GET'],
    path: /^\/(.*)/,
    pathParams: ['reqpath'],
    bodyFormat: "stream",
    useACL: {},
  }, async state => {
    await state.sendDevServer();
  });
}