import { readdirSync, statSync } from "fs";
import { rootRoute } from "../router";
import apiRoutes from "./api/_index";
import { ZodAssert } from "../zodAssert";
import { TiddlerServer } from "./bag-file-server";
import { RecipeManager } from "./manager-recipes";
import { UserManager } from "./manager-users";
import { BaseManager } from "./BaseManager";

export { UserManager, UserManagerMap } from "./manager-users";
export { RecipeManager, RecipeManagerMap } from "./manager-recipes";

export default async function RootRoute(root: rootRoute) {
  TiddlerServer.defineRoutes(root, ZodAssert);

  root.defineRoute({
    useACL: {},
    method: ["POST"],
    path: /^\/manager\/(.*)/,
    pathParams: ["action"],
    bodyFormat: "json",
  }, async state => {

    const [good, error, value] = await state.$transaction(async prisma => {
      if (!state.pathParams.action) throw "No action";
      const user = new UserManager(state, prisma);
      const recipe = new RecipeManager(state, prisma);
      let action;
      if(action = (user as any)[state.pathParams.action])
        return await action(state.data);
      if(action = (recipe as any)[state.pathParams.action])
        return await action(state.data);
      throw "No such action";
    }).then(
      e => [true, undefined, e] as const,
      e => [false, e, undefined] as const
    );

    if (good) {
      return state.sendJSON(200, value);
    } else if (typeof error === "string") {
      return state.sendSimple(400, error);
    } else {
      throw error;
    }
  });

  root.defineRoute({
    method: ["POST"],
    path: /^\/prisma$/,
    bodyFormat: "json",
    useACL: {},
  }, async state => {
    ZodAssert.data(state, z => z.object({
      table: z.string(),
      action: z.string(),
      arg: z.any(),
    }));
    return await state.$transaction(async prisma => {
      const p: any = prisma;
      const table = p[state.data.table];
      if (!table) throw new Error(`No such table`);
      const fn = table[state.data.action];
      if (!fn) throw new Error(`No such table or action`);
      console.log(state.data.arg);
      return state.sendJSON(200, await fn.call(table, state.data.arg));
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