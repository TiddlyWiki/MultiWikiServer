import { z, ZodEffects } from "zod";
import { StateObject } from "../StateObject";
import { Prisma } from "@prisma/client";
import { STREAM_ENDED } from "../streamer";



export namespace ZodAssert {
  type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>
  /** 
   * assert zod on the request body (`state.data`). 
   * 
   * You cannot assert data on a stream or ignore body format.
   * 
   * Attempting to do so will cause the schema argument to expect a string 
   * containing an error message informing the developer of this.
  */
  export function data<T extends
    S extends StateObject<"ignore" | "stream"> ? z.ZodUnknown :
    S extends StateObject<"www-form-urlencoded"> ? z.ZodObject<any> :
    z.ZodTypeAny, S extends StateObject
  >(
    state: S,
    schema:
      S extends StateObject<"ignore" | "stream">
      ? "it is invalid to assert data for this body format"
      : (zod: S extends StateObject<"www-form-urlencoded"> ? Z2<"STRING"> : Z2<"JSON">) => T,
    /** 
     * If the data does not match the schema, this function is called sync'ly with the zod error.
     * Whatever it returns is sent as a utf8 string response body.
     * @param error The zod error.
     * @returns A string to send as the response body, or void to use the default error message.
     */
    onError?: (error: z.ZodError<any>) => string | void
  ): asserts state is S & ({ data: z.infer<T> }) {
    _zodAssert("data", state, schema as any, onError);
  }

  /** 
   * assert zod on the route path match groups (`state.pathParams`). 
   * 
   * Sends a 404 response instead of 400. 
  */
  export function pathParams<
    T extends Exactly<{ [k in keyof S["pathParams"]]: z.ZodTypeAny; }, T>,
    S extends StateObject,
  >(
    state: S, schemaShape: (zod: Z2<"STRING">) => T,
    /** 
     * If the data does not match the schema, this function is called sync'ly with the zod error.
     * Whatever it returns is sent as a utf8 string response body.
     * @param error The zod error.
     * @returns A string to send as the response body, or void to use the default error message.
     */
    onError?: (error: z.ZodError<any>) => string | void
  ): asserts state is S & ({ pathParams: z.infer<z.ZodObject<T>> }) {
    _zodAssert("pathParams", state, schemaShape, onError);
  }

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
  export function queryParams<T extends Record<string, z.ZodTypeAny>, S extends StateObject>(
    state: S, schemaShape: (zod: Z2<"STRING">) => T,
    /** 
     * If the data does not match the schema, this function is called sync'ly with the zod error.
     * Whatever it returns is sent as a utf8 string response body.
     * @param error The zod error.
     * @returns A string to send as the response body, or void to use the default error message.
     */
    onError?: (error: z.ZodError<any>) => string | void
  ): asserts state is S & ({ queryParams: z.infer<z.ZodObject<T>> }) {
    _zodAssert("queryParams", state, schemaShape, onError);
  }
  /** 
   * assert zod on the data passed to this function and returns the cleaned data.
   * If onError is not specified, or does not return STREAM_ENDED, an error 500 is sent. 
   * Either way, zodAssert will throw STREAM_ENDED immediately.
   * 
   * If onError is not specified, the error will be printed with console.log.
   */
  export function any<T extends z.ZodTypeAny, S extends StateObject>(
    state: S, schemaShape: (zod: Z2<"JSON">) => T, data: z.input<T>,
    /** 
     * If the data does not match the schema, this function is called sync'ly with the zod error.
     * If it does not return the STREAM_ENDED symbol indicating an appropriate error response was sent, 
     * zodAssert will throw with a 500 error.
     * 
     * It is perfectly valid to throw an error from this function,
     * as zodAssert will throw STREAM_ENDED immediately if it returns.
     * 
     * @param error The zod error.
     * @returns STREAM_ENDED to indicate an appropriate error response was sent, or undefined.
     */
    onError?: (error: z.ZodError<any>) => void | symbol
  ): z.infer<T> { return _zodAssertAny("any", state, schemaShape, data, onError); }
  /** 
   * assert zod on the data passed to this function and returns the cleaned data.
   * If onError is not specified, or does not return STREAM_ENDED, an error 500 is sent. 
   * Either way, zodAssert will throw STREAM_ENDED immediately.
   * 
   * If onError is not specified, the error will be printed with console.log.
   */
  export function response<T extends z.ZodTypeAny, S extends StateObject>(
    state: S, schemaShape: (zod: Z2<"JSON">) => T, data: z.input<T>,
    /** 
     * If the data does not match the schema, this function is called sync'ly with the zod error.
     * If it does not return the STREAM_ENDED symbol indicating an appropriate error response was sent, 
     * zodAssert will throw with a 500 error.
     * 
     * It is perfectly valid to throw an error from this function,
     * as zodAssert will throw STREAM_ENDED immediately if it returns.
     * 
     * @param error The zod error.
     * @returns STREAM_ENDED to indicate an appropriate error response was sent, or undefined.
     */
    onError?: (error: z.ZodError<any>) => void | symbol
  ): z.infer<T> { return _zodAssertAny("response", state, schemaShape, data, onError); }


}
// type t = number extends PrismaPayloadScalars<"Roles">["role_id"] ? FieldTypeNumberSelector<"JSON"> : false;
export interface Z2<T extends FieldTypeGroups> extends _zod {
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
    table: Table, field: Field,
    fieldtype:
      string extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeStringSelector<T> :
      number extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeNumberSelector<T> :
      boolean extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeBooleanSelector<T> :
      never,
    nullable?: null extends PrismaPayloadScalars<Table>[Field] ? true : false
  ): ZodEffects<any, PrismaField<Table, Field>, PrismaPayloadScalars<Table>[Field]>;


  authUser(): z.ZodNullable<z.ZodObject<{
    user_id: z.ZodNumber;
    isAdmin: z.ZodBoolean;
    username: z.ZodString;
    sessionId: z.ZodNumber;
  }>>;

}

export const _zodAssertAny = (
  input: string,
  state: StateObject,
  schema: (z: Z2<any>) => z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  inputdata: any,
  onError?: (error: z.ZodError<any>) => symbol | void,
) => {
  const schema2: any = schema(makeZ2(input));
  const { success, data, error } = z.any().pipe(schema2).safeParse(inputdata);
  if (!success) {
    if (!onError) error.issues.forEach(e => console.log(input, e.message, e.path));
    if (onError?.(error) === STREAM_ENDED) throw STREAM_ENDED;
    throw state.sendEmpty(500, { "x-reason": input });
  }
  return data;
}

const _zodAssert = (
  input: "data" | "pathParams" | "queryParams",
  state: StateObject,
  schema: (z: Z2<any>) => z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  onError?: (error: z.ZodError<any>) => string | void,
) => {

  // this checks if the schema is a string, since that is used to indicate invalid use cases of zodAssert,
  // and if it's correctly typed, then this is the best way to find it.
  if (typeof schema === "string") {
    console.log(new Error(`schema is a string: ${schema}`));
    throw state.sendEmpty(500);
  }
  const schema2: any = schema(makeZ2(input));

  const { success, data, error } = z.any().pipe(
    input === "data" ? schema2 : z.object(schema2)
  ).safeParse(state[input]);
  if (!success) {
    if (!onError) error.issues.forEach(e => console.log(input, e.message, e.path));
    const status = input === "pathParams" ? 404 : 400;
    const message = onError?.(error);
    if (typeof message === "string")
      throw state.sendString(status, { "x-reason": input }, message ?? "", "utf8");
    else
      throw state.sendEmpty(status, { "x-reason": input });
  }
  state[input] = data;
};

type _zod = typeof z;
type ExtraFieldType = "string" | "number" | "parse-number" | "boolean" | "parse-boolean";
type FieldTypeGroups = "STRING" | "JSON";
type FieldTypeStringSelector<T extends FieldTypeGroups> = T extends "STRING" ? "string" : "string";
type FieldTypeNumberSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-number" : "number";
type FieldTypeBooleanSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-boolean" : "boolean";

export const Z2 = makeZ2("any");


function makeZ2<T extends FieldTypeGroups>(input: "data" | "pathParams" | "queryParams" | "any" | "response" | string): Z2<T> {
  const z2 = Object.create(z);
  z2.prismaField = prismaField;
  z2.authUser = () => z.object({
    user_id: z.number(),
    isAdmin: z.boolean(),
    username: z.string(),
    sessionId: z.number(),
  }).nullable();
  return z2;
}


function prismaField(table: any, field: any, fieldtype: ExtraFieldType, nullable?: boolean): any {
  const check = (() => {
    switch (fieldtype) {
      case "string":
        return z.string()
          .refine(x => x.length, { message: "String must have length" });
      case "parse-number":
        return z.string().min(1)
          .pipe(z.bigint({ coerce: true }))
          .pipe(z.number({ coerce: true }).finite())
          .refine(x => !isNaN(x), { message: "Invalid number" });
      case "parse-boolean":
        return z.enum(["true", "false", "null"]).transform(x => x === "null" ? null : x === "true");
      case "boolean":
        return z.boolean();
      case "number":
        return z.number().finite().int();
      default:
        throw new Error("Invalid field type");
    }
  })();
  return (nullable ? check.nullable() : check).describe(`${table}.${field}`);

}


// const zodAssertGlobal = {
//   data: _zodAssert.bind(null, "data"),
//   pathParams: _zodAssert.bind(null, "pathParams"),
//   queryParams: _zodAssert.bind(null, "queryParams"),
//   response: _zodAssertAny.bind(null, "response"),
//   any: _zodAssertAny.bind(null, "any"),
//   zod: makeZ2("any"),
// };

// declare global { type ZodAssert = typeof zodAssertGlobal; }

// type t = ZodAssert;