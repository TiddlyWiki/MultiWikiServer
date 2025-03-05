import { Prisma, PrismaClient } from "@prisma/client";

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


export const argproxy: {
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