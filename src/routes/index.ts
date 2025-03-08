import { readdirSync, statSync } from "fs";
import { rootRoute } from "../router";
import apiRoutes from "./api/_index";
import { ZodAssert } from "../zodAssert";
import { TiddlerServer } from "./bag-file-server";
import { RecipeManager } from "./recipe-manager";
import { UserManager } from "./user-manager";
import { BaseManager } from "./BaseManager";

export default async function RootRoute(root: rootRoute) {
  TiddlerServer.defineRoutes(root, ZodAssert);
  BaseManager.defineManager(root, RecipeManager);
  BaseManager.defineManager(root, UserManager);

  root.defineRoute({
    method: ["POST"],
    path: /^\/prisma$/,
    bodyFormat: "json",
    useACL: {},
  }, async state => {
    ZodAssert.data(state, z => z.object({
      table: z.string(),
      action: z.string(),
      arg: z.object({}).nullish(),
    }));
    return await state.$transaction(async prisma => {
      const p: any = prisma;
      const table = p[state.data.table];
      if (!table) throw new Error(`No such table`);
      const fn = table[state.data.action];
      if (!fn) throw new Error(`No such table or action`);
      return state.sendJSON(200, await fn.apply(table, state.data.arg));
    });
  });
  // await apiRoutes(root);
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