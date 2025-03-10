import { readdirSync, statSync } from "fs";
import { rootRoute } from "../router";
import { ZodAssert } from "../zodAssert";
import { TiddlerServer } from "./bag-file-server";
import { RecipeKeyMap, RecipeManager } from "./manager-recipes";
import { UserKeyMap, UserManager } from "./manager-users";
import { StateObject } from "../StateObject";
import { ZodAction } from "./BaseManager";

export { UserManager, UserManagerMap } from "./manager-users";
export { RecipeManager, RecipeManagerMap } from "./manager-recipes";

function isKeyOf<T extends Record<string, any>>(obj: T, key: string | number | symbol): key is keyof T {
  return key in obj;
}

export default async function RootRoute(root: rootRoute) {
  TiddlerServer.defineRoutes(root, ZodAssert);

  root.defineRoute({
    useACL: {},
    method: ["POST", "OPTIONS"],
    path: /^\/manager\/(.*)/,
    pathParams: ["action"],
    bodyFormat: "json",
  }, async state => {
    if (state.method === "OPTIONS") {
      return state.sendEmpty(200, {
        // "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
      });
    }

    // we do it out here so we don't start a transaction if the key is invalid.
    const Handler: any = (() => {
      if (!state.pathParams.action) throw "No action";
      if (isKeyOf(RecipeKeyMap, state.pathParams.action)) {
        return RecipeManager;
      } else if (isKeyOf(UserKeyMap, state.pathParams.action)) {
        return UserManager;
      } else {
        throw "No such action";
      }
    })();

    const [good, error, value] = await state.$transaction(async prisma => {
      // the zodRequest handler does the input and output checking. 
      // this just sorts the requests into the correct classes.
      // the transaction will rollback if this throws an error.
      // the key maps are defined in the manager classes based on the zodRequest handlers.
      const action = new Handler(state, prisma)[state.pathParams.action as string] as ZodAction<any, any>;
      return await action(state.data);
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
      // DEV: this just lets the client directly call the database. 
      // TODO: it's just for dev purposes and will be removed later. 
      // DANGER: it circumvents all security and can totally rewrite the ACL.
      const p: any = prisma;
      const table = p[state.data.table];
      if (!table) throw new Error(`No such table`);
      const fn = table[state.data.action];
      if (!fn) throw new Error(`No such table or action`);
      console.log(state.data.arg);
      return state.sendJSON(200, await fn.call(table, state.data.arg));
    });
  });

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