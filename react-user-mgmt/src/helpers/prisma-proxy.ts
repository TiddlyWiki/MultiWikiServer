import { Prisma, PrismaClient } from "@prisma/client";

class ProxyPromise<T> implements Promise<T> {
  static getErrorStack<T>(t: ProxyPromise<T>) { return t.#error.stack; }
  action: any;
  table: any;
  arg: any;
  #error = new Error("An error occured for this request");
  constructor({ action, table, arg }: Record<"action" | "table" | "arg", any>) {
    this.action = action;
    this.table = table;
    this.arg = arg;
  }
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return this._await().then(onfulfilled, onrejected);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    return this._await().catch(onrejected);
  }
  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this._await().finally(onfinally);
  }
  toJSON = () => ({
    action: this.action,
    table: this.table,
    arg: this.arg,
    dbnulls: this.arg.data && findValueInObject(this.arg.data, e => e === Prisma.DbNull),
    jsnulls: this.arg.data && findValueInObject(this.arg.data, e => e === Prisma.JsonNull),
  });
  get [Symbol.toStringTag](): string { return "Promise"; }
  _internalPromise?: Promise<T>;
  _await() {
    if (this._internalPromise) return this._internalPromise;
    return this._internalPromise = new Promise<T>(async (resolve, reject) => {
      const [good, req] = await fetch("/prisma", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "X-Requested-With": "TiddlyWiki"
        },
        body: JSON.stringify(this.toJSON())
      }).then(e => [true, e] as const, e => [false, e] as const);
      if (!good) return reject(req);
      const [good2, res] = await req.json().then(e => [true, e] as const, e => [false, e] as const)
      if (!good2) return reject(res)
      resolve(res);
    });
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
type ClientTypes<T> =
  T extends Date ? string :
  T;
type PrismaProxyClient = PrismaClient<{ datasourceUrl: string }, never, {
  result: {
    // this types every output field with PrismaField
    [T in Uncapitalize<Prisma.ModelName>]: {
      [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
        compute: () => ClientTypes<PrismaPayloadScalars<Capitalize<T>>[K]>
      }
    }
  },
  client: {},
  model: {},
  query: {},
}>;

export const proxy: PrismaProxyClient = (() => new Proxy<any>({}, {
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