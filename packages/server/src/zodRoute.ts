
import { JsonValue } from "./utils";
import { BodyFormat, ServerRequest } from "./router";
import { RouteDef } from "./router";
import { Z2, zod as z } from "./Z2";
import * as core from "zod/v4/core";


export function zodRoute<
  M extends string,
  B extends "GET" | "HEAD" extends M ? "ignore" : BodyFormat,
  P extends Record<string, z.ZodType<any, string | undefined>>,
  Q extends Record<string, z.ZodType<any, string[] | undefined>>,
  T extends z.ZodTypeAny,
  R
>(route: Omit<ZodRoute<M, B, P, Q, T, R>, "registerError">): ZodRoute<M, B, P, Q, T, R> {
  (route as any).registerError = new Error();
  (route as any)[zodRoute.symbol] = true;
  return route as ZodRoute<M, B, P, Q, T, R>;
}
{
  const COMPILE_TIME_BUT_NEVER_RUNTIME: true = false as any;
  zodRoute.symbol = Symbol("zodRoute");
  const t2 = (instance: any): instance is ZodRoute<any, any, any, any, any, any> =>
    typeof instance === "object" && instance && instance[zodRoute.symbol] === true;

  if (COMPILE_TIME_BUT_NEVER_RUNTIME) {
    zodRoute[Symbol.hasInstance] = t2;
  } else {
    Object.defineProperty(zodRoute, Symbol.hasInstance, {
      value: t2,
      configurable: true,
      writable: false,
    });
  }
}

export type FieldTypeGroups = "STRING" | "JSON";

type ExtraFieldType = "string" | "number" | "parse-number" | "boolean" | "parse-boolean";
type FieldTypeStringSelector<T extends FieldTypeGroups> = T extends "STRING" ? "string" : "string";
type FieldTypeNumberSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-number" : "number";
type FieldTypeBooleanSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-boolean" : "boolean";

export interface ZodRoute<
  M extends string,
  B extends BodyFormat,
  P extends Record<string, z.ZodType<any, string | undefined>>,
  Q extends Record<string, z.ZodType<any, string[] | undefined>>,
  T extends z.ZodTypeAny,
  R
> {

  /**
   * The input will be `Record<string, string>`
   * If a path variable is not set in the request, the path will not match.
   *
   * Expects a Record of zod checks. Every path variable must be included.
   * 
   * pathParams are parsed with `decodeURIComponent` one time before being passed to the zod check.
  */
  zodPathParams: (z: Z2<"STRING">) => P;
  /**
   * The input will be `Record<string, string[]>`.
   * If a value is not set, an empty string is used.
   *
   * Expects a Record of zod checks.
   *
   * The default behavior is to remove all query params.
   */
  zodQueryParams?: (z: Z2<"STRING">) => Q;
  // this was a good idea, but separate routes can have the same path but different methods, 
  // so we have to handle it differently.
  // /** 
  //  * CORS preflight requests do not include credentials or request headers,
  //  * so you can't authenticate requests. It is a way to provide information about the endpoint. 
  //  * 
  //  * Be careful, because if you specify the same route with different methods, and set corsRequest
  //  * on more than one, because only the first one will actually be called.
  //  */
  // corsRequest?: (state: ZodState<"OPTIONS", "ignore", P, Q, z.ZodUndefined>) => Promise<typeof STREAM_ENDED>;
  /**
   * A zod check of the request body result.
   *
   * Only valid for `string`, `json`, and `www-form-urlencoded` body types
   *
   * The default is `undefined` for those types.
   */
  zodRequestBody?: (z: B extends "www-form-urlencoded" ? Z2<"STRING"> : B extends "json" ? Z2<"JSON"> : Z2<any>) => T;

  securityChecks?: RouteDef["securityChecks"];
  method: M[];
  /** 
   * The filter to match requests to. It can either be a string or a regex.
   * 
   * The following string is converted to the following regex. Notice the last param entirely 
   * matches the rest of the path, and it may be zero length (the url may be `/literal/test/hello/world/`)
   *   - `/literal/:param1/hello/world/:param2`
   *   - `/^\/literal\/(?<param1>[^\/]+)\/literal\/literal\/(?<param2>.*)$/`
   * 
   * The following string is converted to the following regex to allow child routes to 
   * be nested under it. The regex uses the lookahead group syntax to ensure that 
   * the child route begins with a forward slash and isn't a partial match.
   * 
   *   - `/literal/:param1/hello/world/:param2/`
   *   - `/^\/literal\/(?<param1>[^\/]+)\/literal\/literal\/(?<param2>[^\/]+)(?=\/)/`
   * 
   * Regex must start with `^`. The matched portion is removed from child route matches. 
   * 
   * 
   * If the last portion of the string is a param, and is not followed by a slash, 
   * it will match the rest of the request path. If it ends with a slash, the matching
   * portion of the request path will be consumed and child routes will match the remaining 
   * portion. 
   * 
   * So `/literal//hello/world/` would be invalid, but `/literal/test/hello/world/` would match. 
   * 
   * The regex is not checked in any way, so children will be matched against the 
   * remaining portion of the path. Lookaheads may be used to match portions of the url 
   * without capturing the path, such as a trailing slash (`/^\/test(?=\/)`)
   * 
   * Name collisions are possible between parent and child routes. The child route takes precedent,
   * and the parent route handler will see the child path param value. 
   * 
   */
  path: string | RegExp;
  /** 
   * @internal - Mostly used internally. 
   * 
   * If specifed, it will be replaced with the provided key. 
   * 
   * 
   */
  keyReplacer?: string
  bodyFormat: B;
  registerError: Error;
  inner: (state: { [K in M]: ZodState<K, B, P, Q, T> }[M]) => Promise<R>;
}

// export interface ZodRouteDef<
//   M extends AllowedMethod,
//   B extends BodyFormat,
//   P extends Record<string, z.ZodTypeAny>,
//   Q extends Record<string, z.ZodTypeAny>,
//   T extends z.ZodTypeAny,
//   R extends JsonValue
// > {
//   zodRequestBody?: B extends "string" | "json" | "www-form-urlencoded" ? (z: Z2) => T : undefined;
// }

export interface ZodState<
  M extends string,
  B extends BodyFormat,
  P extends Record<string, z.ZodType<any, string | undefined>>,
  Q extends Record<string, z.ZodType<any, string[] | undefined>>,
  T extends z.ZodTypeAny
> extends ServerRequest<B, M, z.output<T>> {
  pathParams: z.output<z.ZodObject<P, core.$strict>> & Record<string, any>;
  queryParams: z.output<z.ZodObject<Q, core.$strict>> & Record<string, any>;
}


export type RouterRouteMap<T> = {
  [K in keyof T as T[K] extends ZodRoute<any, any, any, any, any, any> ? K : never]:
  T[K] extends ZodRoute<any, any, any, any, infer REQ, infer RES>
  ? ((data: z.input<REQ>) => Promise<jsonify<RES>>)
  : `${K & string} does not extend`;
}

export type jsonify<T> =
  T extends void ? null :
  T extends Promise<any> ? unknown :
  T extends Date ? string :
  // T extends Map<infer K, infer V> ? [jsonify<K>, jsonify<V>][] :
  // T extends Set<infer U> ? jsonify<U>[] :
  T extends string | number | boolean | null | undefined ? T :
  T extends [...any[]] ? number extends T["length"] ? jsonify<T[number]>[] : [...jsonifyTuple<T>] :
  T extends Array<infer U> ? jsonify<U>[] :
  T extends object ? { [K in keyof T]: jsonify<T[K]> } :
  unknown;

export type jsonifyTuple<T> = T extends [infer A, ...infer B] ? [jsonify<A>, ...jsonifyTuple<B>] : T extends [infer A] ? [jsonify<A>] : [];



export type RouterKeyMap<T, V> = {
  [K in keyof T as T[K] extends ZodRoute<any, any, any, any, any, any> ? K : never]: V;
}
