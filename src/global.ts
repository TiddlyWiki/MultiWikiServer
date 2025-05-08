import type { rootRoute as _rootRoute, Router } from "./routes/router";
import * as path from "path";
import * as fs from "fs";
import type { Prisma } from "@prisma/client";
import type { ZodAssert } from "./utils";
import { Tiddler, Wiki } from "tiddlywiki";
import { Commander } from "./commander";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";


declare global {
  type PrismaTxnClient = Omit<Commander["engine"], "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
  type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>
  /** 
   * This primarily makes sure that positional arguments are used correctly
   * (so you can't switch a title and bag_name around).
   * 
   * If you assign the wrong value (like `5 as PrismaField<"Bags", "bag_name">`), 
   * this will result in a type error on the as keyword, allowing you to catch incorrect types quickly.
  */
  type PrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>> =
    // PrismaPayloadScalars<T>[K];
    // manually map foriegn keys to their corresponding primary key so comparisons work
    // this should remove the need for any global helper functions to convert between types
    (
      // [T, K] extends ["Acl", "role_id"] ? PrismaField<"Roles", "role_id"> :
      // [T, K] extends ["", "role_id"] ? PrismaField<"Roles", "role_id"> :
      [T, K] extends ["Tiddlers", "bag_id"] ? PrismaField<"Bags", "bag_id"> :
      [T, K] extends ["Sessions", "user_id"] ? PrismaField<"Users", "user_id"> :
      [T, K] extends ["Recipe_bags", "bag_id"] ? PrismaField<"Bags", "bag_id"> :
      [T, K] extends ["Recipe_bags", "recipe_id"] ? PrismaField<"Recipes", "recipe_id"> :
      [T, K] extends ["Recipes", "owner_id"] ? PrismaField<"Users", "user_id"> :
      [T, K] extends ["Bags", "owner_id"] ? PrismaField<"Users", "user_id"> :
      (PrismaPayloadScalars<T>[K] & { __prisma_table: T, __prisma_field: K })
    ) | (null extends PrismaPayloadScalars<T>[K] ? null : never);

  type PrismaPayloadScalars<T extends Prisma.ModelName>
    = Prisma.TypeMap["model"][T]["payload"]["scalars"]

  type EntityName<T extends EntityType> =
    T extends "bag" ? PrismaField<"Bags", "bag_name"> :
    T extends "recipe" ? PrismaField<"Recipes", "recipe_name"> :
    never;

  type EntityType = "recipe" | "bag";

  type ACLPermissionName = "READ" | "WRITE" | "ADMIN";

  type rootRoute = _rootRoute;
  type ZodAssert = typeof ZodAssert;

}


// declare global { const ok: typeof assert.ok; }
// (global as any).ok = assert.ok;

// these are some $tw.utils functions that seemed important enough to just copy across
declare global {
  function hop(object: any, property: any): boolean;
  function each<T>(object: T[], callback: (value: T, index: number, object: T[]) => void): void;
  function each<T>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => void): void;
  function eachAsync<T>(object: T[], callback: (value: T, index: number, object: T[]) => void): Promise<void>;
  function eachAsync<T>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => void): Promise<void>;
  function createDirectory(dirPath: string): void;
  function deleteDirectory(dirPath: string): void;
  function encodeURIComponentExtended(s: string): string;
}

(global as any).hop = function (object: any, property: any) {
  return object ? Object.prototype.hasOwnProperty.call(object, property) : false;
};

(global as any).eachAsync = async function (object: any, callback: any) {
  var next, f, length;
  if (object) {
    if (Object.prototype.toString.call(object) == "[object Array]") {
      for (f = 0, length = object.length; f < length; f++) {
        next = await callback(object[f], f, object);
        if (next === false) {
          break;
        }
      }
    } else {
      var keys = Object.keys(object);
      for (f = 0, length = keys.length; f < length; f++) {
        var key = keys[f];
        next = await callback(object[key as string], key, object);
        if (next === false) {
          break;
        }
      }
    }
  }
};

(global as any).each = function (object: any, callback: any) {
  var next, f, length;
  if (object) {
    if (Object.prototype.toString.call(object) == "[object Array]") {
      for (f = 0, length = object.length; f < length; f++) {
        next = callback(object[f], f, object);
        if (next === false) {
          break;
        }
      }
    } else {
      var keys = Object.keys(object);
      for (f = 0, length = keys.length; f < length; f++) {
        var key = keys[f];
        next = callback(object[key as string], key, object);
        if (next === false) {
          break;
        }
      }
    }
  }
};

(global as any).createDirectory = function (dirPath: string) {
  if (dirPath.substr(dirPath.length - 1, 1) !== path.sep) {
    dirPath = dirPath + path.sep;
  }
  var pos = 1;
  pos = dirPath.indexOf(path.sep, pos);
  while (pos !== -1) {
    var subDirPath = dirPath.substr(0, pos);
    if (!(fs.existsSync(subDirPath) && fs.statSync(subDirPath).isDirectory())) {
      try {
        fs.mkdirSync(subDirPath);
      } catch (e) {
        return "Error creating directory '" + subDirPath + "'";
      }
    }
    pos = dirPath.indexOf(path.sep, pos + 1);
  }
  return null;
};

(global as any).deleteDirectory = function deleteDirectory(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    var entries = fs.readdirSync(dirPath);
    for (var entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      var currPath = dirPath + path.sep + entries[entryIndex];
      if (fs.lstatSync(currPath).isDirectory()) {
        deleteDirectory(currPath);
      } else {
        fs.unlinkSync(currPath);
      }
    }
    fs.rmdirSync(dirPath);
  }
  return null;
};

(global as any).encodeURIComponentExtended = function (s: string) {
  return encodeURIComponent(s).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
};


class _Result<OK extends boolean, T> {
  constructor(
    public ok: OK,
    public error: OK extends true ? undefined : unknown,
    public value: OK extends true ? T : undefined
  ) { }
  get [Symbol.iterator]() { return [this.ok, this.error, this.value] }
  static ok<T>(value: T) {
    return new _Result(true, undefined, value)
  }
  static error(error: unknown) {
    return new _Result(false, error, undefined)
  }

  /**
   * @example
   * // const result = try something();
   * const result = Result.try_(() => {
   *   something();
   * });
   */
  static try_<T, This>(callback: (this: This) => T, thisarg: This) {
    try {
      return _Result.ok(callback.apply(thisarg));
    } catch (e) {
      return _Result.error(e);
    }
  }

}
//https://github.com/arthurfiorette/proposal-try-operator
declare global {
  const TryResult: typeof _Result;
  interface Promise<T> {
    try: () => Promise<_Result<true, T> | _Result<false, T>>;
  }
}
(global as any).Result = _Result;
Promise.prototype.try = function <T>(this: Promise<T>) {
  return this.then(_Result.ok, _Result.error);
}

interface $TW {
  loadTiddlersFromPath: any;
  loadPluginFolder: any;
  getLibraryItemSearchPaths: any;
  wiki: never;
  utils: {
    // [x: string]: any;
    /** Use Object.assign instead */
    extend: never
    /** Use Array.isArray instead */
    isArray: never
    /** use prismaField with a parse- option or z.uriComponent if possible */
    decodeURIComponentSafe: never;
    /**
     * 
    ```js
    $tw.utils.stringifyDate = function(value) {
      return value.getUTCFullYear() +
          $tw.utils.pad(value.getUTCMonth() + 1) +
          $tw.utils.pad(value.getUTCDate()) +
          $tw.utils.pad(value.getUTCHours()) +
          $tw.utils.pad(value.getUTCMinutes()) +
          $tw.utils.pad(value.getUTCSeconds()) +
          $tw.utils.pad(value.getUTCMilliseconds(),3);
    };
    ```
     */
    stringifyDate: never;
    // parseJSONSafe(str: string, defaultJSON?: any): any;
    // /** `return parseFloat(str) || 0;` */
    // parseNumber(string: string): number;
    // /** `return parseFloat(str) || 0;` */
    // parseNumber(string: string | null): number;
  };
  boot: any;
  config: any;
  node: any;
  hooks: any;
  sjcl: any;
  Wiki: { new(): Wiki };
  Tiddler: { new(fields: Record<string, any>): Tiddler };

}
