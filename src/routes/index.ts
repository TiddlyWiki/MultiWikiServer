import { readdirSync, statSync } from "fs";
import { rootRoute } from "../router";
import { ZodAssert } from "../zodAssert";
import { TiddlerServer } from "./bag-file-server";
import { RecipeKeyMap, RecipeManager } from "./managers/manager-recipes";
import { UserKeyMap, UserManager } from "./managers/manager-users";
import { StateObject } from "../StateObject";
import { ZodAction } from "./BaseManager";
import { SessionManager } from "./services/sessions";

import { Prisma, PrismaClient } from "@prisma/client";

export { UserManager, UserManagerMap } from "./managers/manager-users";
export { RecipeManager, RecipeManagerMap } from "./managers/manager-recipes";

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

    return await state.$transaction(async prisma => {
      // the zodRequest handler does the input and output checking. 
      // this just sorts the requests into the correct classes.
      // the transaction will rollback if this throws an error.
      // the key maps are defined in the manager classes based on the zodRequest handlers.
      const action = new Handler(state, prisma)[state.pathParams.action as string] as ZodAction<any, any>;
      return await action();
    })

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


class ProxyPromise {
  static getErrorStack(t: ProxyPromise) { return t.#error.stack; }
  action: any;
  table: any;
  arg: any;
  #error = new Error("An error occured for this request");
  constructor({ action, table, arg }: Omit<ProxyPromise, "#error">) {
    this.action = action;
    this.table = table;
    this.arg = arg;
    Object.defineProperty(this, "toJSON", {
      configurable: true,
      enumerable: true,
      value: () => ({
        action: this.action,
        table: this.table,
        arg: this.arg,
        dbnulls: this.arg.data && findValueInObject(this.arg.data, e => e === Prisma.DbNull),
        jsnulls: this.arg.data && findValueInObject(this.arg.data, e => e === Prisma.JsonNull),
      })
    })
  }
}

function findValueInObject(val: any, predicate: (val: any) => boolean, keys: string[] = [], paths: string[] = []): any {
  if (predicate(val)) {
    paths.push(keys.join("/"));
    return paths;
  }
  if (val && typeof val === "object") {
    for (const key of Object.keys(val)) {
      if (!val.hasOwnProperty(key)) continue;
      findValueInObject(val[key], predicate, [...keys, key], paths);
    }
  }
  console.log(paths, keys);
  return paths;
}

function capitalize<T extends string>(table: T): Capitalize<T> {
  return table.slice(0, 1).toUpperCase() + table.slice(1) as any;
}


const argproxy: {
  [Table in keyof PrismaClient]: {
    [Action in keyof PrismaClient[Table]]:
    PrismaClient[Table][Action] extends (...args: any) => any
    ? <T extends Parameters<PrismaClient[Table][Action]>[0]>(arg: T) => {
      table: Table,
      action: Action,
      arg: T,
      result: Awaited<ReturnType<PrismaClient[Table][Action]>>,
    }
    : never
  }
} = (() => new Proxy<any>({}, {
  get(target: any, table: any) {
    return target[table] = target[table] || new Proxy<any>({}, {
      get(target: any, action: any) {
        return target[action] = target[action] || ((arg: any) => {
          return new ProxyPromise({ action, table: capitalize(table) as any, arg });
        })
      },
    })
  },
}))();