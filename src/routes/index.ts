import { readdirSync, statSync } from "fs";
import { rootRoute, SiteConfig } from "./router";
import { ZodAssert } from "../utils";
import { Prisma, PrismaClient } from "../prisma-client";
import { ManagerRoutes } from "./managers";
import { TiddlerRouter } from "./managers/router-tiddlers";

declare global { const ENABLE_UNSAFE_PRISMA_ROUTE: any; }

export default async function RootRoute(root: rootRoute, config: SiteConfig) {
  // TiddlerServer.defineRoutes(root);
  TiddlerRouter.defineRoutes(root);
  ManagerRoutes(root, config);
  if (typeof ENABLE_UNSAFE_PRISMA_ROUTE !== "undefined")
    root.defineRoute({
      method: ["POST"],
      path: /^\/prisma$/,
      bodyFormat: "json",
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
    path: /^\/.*/,
    bodyFormat: "stream",
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