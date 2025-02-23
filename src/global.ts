import { z } from "zod";
import { StateObject } from "./StateObject";
import { rootRoute } from "./router";
import * as sql from "./store/sql-tiddler-database";
import * as assert from "assert";
import "../jsglobal";
import { Prisma } from "@prisma/client";
okField("recipes", "recipe_id", 5);
okEntityType(sql.okEntityType);
type PrismaPayload<T extends PrismaTables> = Prisma.TypeMap["model"][T]["payload"];

declare global {
  type PrismaTables = Prisma.ModelName
  type PrismaField<T extends PrismaTables, K extends keyof PrismaPayload<T>["scalars"]> = PrismaPayload<T>["scalars"][K] & { __prisma_table: T, __prisma_field: K }



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

  function okField<T extends PrismaTables, K extends keyof PrismaPayload<T>["scalars"]>(
    table: T, field: K, value: PrismaPayload<T>["scalars"][K]
  ): asserts value is PrismaField<T, K>;

}
(global as any).okField = function (table: string, field: string, value: any) { };


declare global { const rootRoute: rootRoute; }

declare global { const ok: typeof assert.ok; }
(global as any).ok = assert.ok;

declare global { const okEntityType: typeof sql.okEntityType; type EntityType = "recipe" | "bag"; }
(global as any).okEntityType = sql.okEntityType;



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
    function data<T extends z.ZodTypeAny, S extends StateObject>(
      state: S, schema:
        S extends StateObject<"ignore" | "stream">
        ? "it is invalid to assert data for this body format"
        : (zod: Z2) => T,
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
      state: S, schemaShape: (zod: Z2) => T,
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
      state: S, schemaShape: (zod: Z2) => T,
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
type Z = typeof import("zod");
interface Z2 extends Z {
  uriComponent: typeof uriComponent;
  parsedNumber: typeof parsedNumber;
}
z.object
const _zodAssert = (
  input: "data" | "pathParams" | "queryParams",
  state: StateObject,
  schema: (z: Z2) => z.ZodTypeAny,
  onError?: (error: z.ZodError<any>) => string | void
) => {
  const z2: Z2 = Object.create(z);
  z2.uriComponent = uriComponent;
  z2.parsedNumber = parsedNumber;

  // this checks if the schema is a string, since that is used to indicate invalid use cases of zodAssert,
  // and if it's correctly typed, then this is the best way to find it.
  if (typeof schema === "string") {
    console.log(new Error(`schema is a string: ${schema}`));
    throw state.sendEmpty(500);
  }

  const { success, data, error } = z.any().pipe(schema(z2)).safeParse(input);
  if (!success) {
    const status = input === "pathParams" ? 404 : 400;
    const message = onError?.(error);
    if (typeof message === "string")
      throw state.sendString(status, {}, message ?? "", "utf8");
    else
      throw state.sendEmpty(status);
  }
  state[input] = data;
};

(global as any).zodAssert = {
  data: _zodAssert.bind(null, "data"),
  pathParams: _zodAssert.bind(null, "pathParams"),
  queryParams: _zodAssert.bind(null, "queryParams"),
}



const uriComponent = (allowZeroLength?: boolean) => z.string().transform((val, ctx) => {
  try {
    return decodeURIComponent(val);
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid URI component",
    });
    return z.NEVER;
  }
}).refine(x => allowZeroLength || x.length > 0, { message: "URI component cannot be empty" });

const parsedNumber = <T extends z.ZodNumber>(schema?: T) =>
  z.string().min(1).transform(Number).pipe(
    z.number().finite().refine(x => !isNaN(x), { message: "Not a number" })
  ).pipe(schema ?? z.number());