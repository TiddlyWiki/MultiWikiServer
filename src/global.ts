import { bigint, z, ZodEffects, ZodNumber, ZodString, ZodType, ZodTypeAny } from "zod";
import { StateObject } from "./StateObject";
import { rootRoute } from "./router";
import * as sql from "./store/new-sql-tiddler-database";
import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import "../jsglobal";
import { Prisma } from "@prisma/client";

(global as any).asPrismaKey = function (table: string, field: string, value: any) { return value; };
(global as any).asPrismaField = function (table: string, field: string, value: any) { return value; };
(global as any).hop = function (object: any, property: any) {
  return object ? Object.prototype.hasOwnProperty.call(object, property) : false;
};

// type PrismaPayload<T extends Prisma.ModelName> = Prisma.TypeMap["model"][T]["payload"];
declare global {

  function hop(object: any, property: any): boolean;
  function asPrismaKey<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>>(
    table: T, field: K, value: PrismaPayloadScalars<T>[K]
  ): PrismaKey<T, K, PrismaPayloadScalars<T>[K]>;
  /** 
   * If you assign values like `5 as PrismaField<"bags", "bag_name">`, 
   * this will result in a type error on the as keyword, 
   * allowing you to catch incorrect types quickly.
  */
  type PrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>> =
    // manually map foriegn keys to their corresponding primary key so comparisons work
    [T, K] extends ["acl", "role_id"] ? PrismaField<"roles", "role_id"> :
    [T, K] extends ["user_roles", "role_id"] ? PrismaField<"roles", "role_id"> :
    (PrismaPayloadScalars<T>[K] & { __prisma_table: T, __prisma_field: K })
    | (null extends PrismaPayloadScalars<T>[K] ? null : never);
  type PrismaPayloadScalars<T extends Prisma.ModelName>
    = Prisma.TypeMap["model"][T]["payload"]["scalars"]

  type PrismaKey<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>, V> =
    V extends (infer X) & { __prisma_table: any, __prisma_field: any } ? X & PrismaField<T, K> : never;

  /** 
   * Accepts any value that matches the specified field type, regardless of whether it is already for a different prisma field. 
   * This is mainly needed to convert foriegn key fields. 
   * 
   * For now it's still a manual process, but at least this gives us a reference point to come back to later. 
   */
  function asPrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>>(
    table: T, field: K, value: PrismaPayloadScalars<T>[K]
  ): PrismaField<T, K>;


  type t2<T extends Prisma.ModelName> = Prisma.TypeMap["model"][T]["fields"]

  type t1 = null extends PrismaPayloadScalars<"bags">["accesscontrol"] ? true : false;

  /** 
   * This is a type assertion function that is used to assert that a value is a field value. 
   * It looks up the field type from the prisma schema and restricts the type of the value 
   * to that field type. If the field is optional, null is allowed as a field value. 
   * 
   * This does not check the value itself at runtime, rather it restricts the argument type.
   * 
   * @example
   * 
  ```
    // recieve the id field from somewhere
    var acl_id: number = 5;

    // mark it as a field value
    okField("acl", "acl_id", acl_id);
    
    // you can still use it as a regular number if required
    const t: number = acl_id;

  ```
   */

  // function okField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>>(
  //   table: T, field: K, value: PrismaPayloadScalars<T>[K]
  // ): asserts value is PrismaField<T, K>;

}
// (global as any).okField = function (table: string, field: string, value: any) { };


declare global { const rootRoute: rootRoute; }

declare global { const ok: typeof assert.ok; }
(global as any).ok = assert.ok;

declare global {

  type EntityName<T extends EntityType> =
    T extends "bag" ? PrismaField<"bags", "bag_name"> :
    T extends "recipe" ? PrismaField<"recipes", "recipe_name"> :
    never;

  type EntityType = "recipe" | "bag";

  type ACLPermissionName = "READ" | "WRITE" | "ADMIN";
}




declare global { function parseIntNull(str: string | null): number | null; }
(global as any).parseIntNull = function (str: string | null) {
  return str === null ? null : parseInt(str);
};
declare global { function parseIntNullSafe(str: string | null): { success: boolean, value: number | null }; }
(global as any).parseIntNullSafe = function (str: string | null) {
  if (str === null) return { success: true, value: null };
  const val = parseInt(str);
  return { success: !isNaN(val), value: val };
};
declare global { function isEntityType(value: any): value is "recipe" | "bag"; }
(global as any).isEntityType = (x: any): x is "recipe" | "bag" => ["recipe", "bag"].includes(x);


declare global {
  namespace zodAssert {
    type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>
    /** 
     * assert zod on the request body (`state.data`). 
     * 
     * You cannot assert data on a stream or ignore body format.
     * 
     * Attempting to do so will cause the schema argument to expect a string 
     * containing an error message informing the developer of this.
     */
    function data<T extends
      S extends StateObject<"ignore" | "stream"> ? z.ZodUnknown :
      S extends StateObject<"www-form-urlencoded"> ? z.ZodObject<any> :
      z.ZodTypeAny, S extends StateObject>(
        state: S, schema:
          S extends StateObject<"ignore" | "stream">
          ? "it is invalid to assert data for this body format"
          : (zod: S extends StateObject<"www-form-urlencoded"> ? Z2<never> : Z2<"boolean" | "number">) => T,
        /** 
         * If the data does not match the schema, this function is called sync'ly with the zod error.
         * Whatever it returns is sent as a utf8 string response body.
         * @param error The zod error.
         * @returns A string to send as the response body, or void to use the default error message.
         */
        onError?: (error: z.ZodError<any>) => string | void
      ): asserts state is S & ({ data: z.infer<T> });

    /** 
     * assert zod on the route path match groups (`state.pathParams`). 
     * 
     * Sends a 404 response instead of 400. 
    */
    function pathParams<
      T extends Exactly<{ [k in keyof S["pathParams"]]: z.ZodTypeAny; }, T>,
      S extends StateObject,
    >(
      state: S, schemaShape: (zod: Z2<never>) => T,
      /** 
       * If the data does not match the schema, this function is called sync'ly with the zod error.
       * Whatever it returns is sent as a utf8 string response body.
       * @param error The zod error.
       * @returns A string to send as the response body, or void to use the default error message.
       */
      onError?: (error: z.ZodError<any>) => string | void
    ): asserts state is S & ({ pathParams: z.infer<z.ZodObject<T>> });

    /** 
     * assert zod on the url query parameters (`state.queryParams`). 
     * 
     * This is the only place that the query parameters are declared, so the keys are not checked. 
     * 
     * If no value is specified, it defaults to an empty string
     * (`?key&key=&key` becomes `key: ["", "", ""]`).
     * 
     * In zod: `z.object({ key: z.array(z.string()).optional() })`
     */
    function queryParams<T extends Record<string, z.ZodTypeAny>, S extends StateObject>(
      state: S, schemaShape: (zod: Z2<never>) => T,
      /** 
       * If the data does not match the schema, this function is called sync'ly with the zod error.
       * Whatever it returns is sent as a utf8 string response body.
       * @param error The zod error.
       * @returns A string to send as the response body, or void to use the default error message.
       */
      onError?: (error: z.ZodError<any>) => string | void
    ): asserts state is S & ({ queryParams: z.infer<z.ZodObject<T>> });
  }

}


const _zodAssert = (
  input: "data" | "pathParams" | "queryParams",
  state: StateObject,
  schema: (z: Z2<any>) => z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  onError?: (error: z.ZodError<any>) => string | void
) => {

  // this checks if the schema is a string, since that is used to indicate invalid use cases of zodAssert,
  // and if it's correctly typed, then this is the best way to find it.
  if (typeof schema === "string") {
    console.log(new Error(`schema is a string: ${schema}`));
    throw state.sendEmpty(500);
  }
  const schema2: any = schema(z2);

  const { success, data, error } = z.any().pipe(
    input === "data" ? schema2 : z.object(schema2)
  ).safeParse(state[input]);
  if (!success) {
    const status = input === "pathParams" ? 404 : 400;
    const message = onError?.(error);
    if (typeof message === "string")
      throw state.sendString(status, { "x-reason": input }, message ?? "", "utf8");
    else
      throw state.sendEmpty(status, { "x-reason": input });
  }
  state[input] = data;
};

(global as any).zodAssert = {
  data: _zodAssert.bind(null, "data"),
  pathParams: _zodAssert.bind(null, "pathParams"),
  queryParams: _zodAssert.bind(null, "queryParams"),
}

const zodURIComponent = (val: string, ctx: z.RefinementCtx) => {
  try {
    return decodeURIComponent(val);
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid URI component",
    });
    return z.NEVER;
  }
}
type _zod = typeof z;
const z2: Z2<any> = Object.create(z);
type ExtraFieldType = "string" | "number" | "parse-number" | "boolean" | "parse-boolean";

z2.prismaField = function (table: any, field: any, fieldtype: ExtraFieldType): any {
  switch (fieldtype) {
    case "string":
      return z.string().transform(zodURIComponent)
        .refine(x => x.length, { message: "String must have length" });
    case "parse-number":
      return z.string().min(1).transform(zodURIComponent)
        .pipe(z.bigint({ coerce: true }))
        .pipe(z.number({ coerce: true }).finite())
        .refine(x => !isNaN(x), { message: "Invalid number" });
    case "parse-boolean":
      return z.enum(["true", "false"]).transform(x => x === "true");
    case "boolean":
      return z.boolean();
    case "number":
      return z.number();
    default:
      return z.string();
  }

}

interface Z2<Extra extends "boolean" | "number"> extends _zod {
  /** 
   * Tags the resulting value as being from the specified table field.
   * 
   * The third argument is a string literal that specifies the field type based on the selected field.
   * 
   * "string" and "parse-number" 
   * - will use decodeURIComponent on the value. 
   * - Require a string length at least one
   * 
   * You can use .optional(), .nullable(), .nulish() after this to make the field optional.
   */
  prismaField<Table extends Prisma.ModelName, Field extends keyof PrismaPayloadScalars<Table>>(
    table: Table, field: Field, fieldtype:
      (PrismaPayloadScalars<Table>[Field] & {}) extends string ? "string" :
      (PrismaPayloadScalars<Table>[Field] & {}) extends number ? ("number" & Extra) | "parse-number" :
      (PrismaPayloadScalars<Table>[Field] & {}) extends boolean ? ("boolean" & Extra) | "parse-boolean" :
      never,
  ): ZodEffects<any, PrismaField<Table, Field>, PrismaPayloadScalars<Table>[Field]>

}

interface ZodEffectsExtras<T extends ZodTypeAny> extends ZodEffects<T> {

  parsedNumber(): T extends ZodType<number, any, any> ? never : ZodEffectsExtras<T>;
}
function classWrapper<T extends z.ZodTypeAny>(state: ZodEffects<T>): ZodEffectsExtras<T> {

  const parent = Object.create(state);

  parent.asPrismaField = function <
    Table extends Prisma.ModelName,
    Field extends keyof PrismaPayloadScalars<Table>
  >(
    this: typeof state,
    table: Table,
    field: Field
  ) {
    return this.refine(x => true);
  }

  parent.parsedNumber = function (this: typeof state) {
    return this
      .pipe(z.string().min(1))
      .pipe(z.bigint({ coerce: true }))
      .pipe(z.number({ coerce: true }).finite())
  }
  return parent;
}

function uriComponent(allowZeroLength?: boolean) {
  return classWrapper(
    z.string().transform(zodURIComponent)
      .refine(x => allowZeroLength || x.length > 0, { message: "URI component cannot be empty" })
  );

}

declare global {
  function each<T>(object: T[], callback: (value: T, index: number, object: T[]) => void): void;
  function each<T>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => void): void;
  function eachAsync<T>(object: T[], callback: (value: T, index: number, object: T[]) => void): void;
  function eachAsync<T>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => void): void;
}

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

declare global {
  function createDirectory(dirPath: string): void;
  function deleteDirectory(dirPath: string): void;
}
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
declare global { function encodeURIComponentExtended(s: string): string; }
(global as any).encodeURIComponentExtended = function (s: string) {
  return encodeURIComponent(s).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
};