import { z } from "zod";
import { rootRoute } from "../../rootRoute";
import { StateObject } from "../../StateObject";
import { serverIndexJson } from "./IndexJson";

export type ServerMap = typeof serverMap;
export type ServerMapKeys = keyof ServerMap extends `server${infer K}` ? K : never;
export type ServerMapRequest = {
  [K in ServerMapKeys]: z.infer<z.ZodObject<ReturnType<ServerMap[`server${K}`]["zodRequest"]>>>
}
export type ServerMapResponse = {
  [K in ServerMapKeys]: z.infer<ReturnType<ServerMap[`server${K}`]["zodResponse"]>>
}

const serverMap = {
  serverIndexJson,
}

class ApiStateObject<M extends "READ" | "WRITE", Q extends Record<string, z.ZodTypeAny>> {
  method: M extends "READ" ? "GET" | "HEAD" : M extends "WRITE" ? "POST" | "PUT" | "DELETE" : never;

  authenticatedUser
  store
  allowAnon
  allowAnonReads
  firstGuestUser
  showAnonConfig
  constructor(
    state: StateObject<any>,
    public reqData: z.infer<z.ZodObject<Q>> | undefined
  ) {
    if (state.method === "OPTIONS") throw new Error("Invalid method");
    this.method = state.method as any;
    this.authenticatedUser = state.authenticatedUser;
    this.store = state.store;
    this.allowAnon = state.allowAnon;
    this.allowAnonReads = state.allowAnonReads;
    this.firstGuestUser = state.firstGuestUser;
    this.showAnonConfig = state.showAnonConfig;
  }

}

export default async function ApiRoutes(parent: rootRoute) {

  parent.defineRoute({
    useACL: {},
    method: ["OPTIONS", "HEAD", "GET", "POST", "PUT", "DELETE"],
    path: /^\/api\/([^\/]+)$/,
    pathParams: ["endpoint"],
    bodyFormat: "json",
  }, async state => {

    if (state.method === "OPTIONS")
      return state.sendEmpty(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type",
      });

    zodAssert.pathParams(state, z => ({
      endpoint: z.string().refine(
        (s): s is ServerMapKeys => (serverMap as any)[`server${s}`] !== undefined,
        { message: "Invalid endpoint" }
      ),
    }));

    const route: ServerEndpoint<"READ" | "WRITE", any, any> = serverMap[`server${state.pathParams.endpoint}`]
    switch (route.methodType) {
      case "READ": {
        zodAssert.queryParams(state, route.zodRequest);
        const res = await route.handler(new ApiStateObject(state, state.queryParams));
        return state.sendJSON(200, zodAssert.any(state, route.zodResponse, res));
      }
      case "WRITE": {
        zodAssert.data(state, route.zodRequest);
        const res = await route.handler(new ApiStateObject(state, state.data as any));
        return state.sendJSON(200, zodAssert.any(state, route.zodResponse, res));
      }
      default: {
        // this just makes sure we didn't miss a method type
        const _: never = route.methodType;
        throw new Error("Invalid method type");
      }
    }

  });
}



export function makeEndpoint<M extends "READ" | "WRITE", Q extends Record<string, z.ZodTypeAny>, R extends z.ZodTypeAny>(
  endpoint: ServerEndpoint<M, Q, R>
) {
  return endpoint;
}

interface ServerEndpoint<M extends "READ" | "WRITE", Q extends Record<string, z.ZodTypeAny>, R extends z.ZodTypeAny> {
  methodType: M;
  /** 
   * A hashmap (aka object, record) of keys to Zod types. The result is passed to the handler.
   * 
   * ### GET and HEAD requests
   * 
   * For GET and HEAD requests, the server will parse query parameters into a Record<string, string[]>.
   * If parsing or validation fail, the server will return a 400 error.
   * 
   * Body will always be an object.
   * 
   * ```ts
   * z => ({
   *   username: z.string().array(),
   * })
   * ```
   * 
   * ### POST, PUT, and DELETE requests
   * 
   * For POST, PUT, and DELETE requests, the server will parse the body as JSON.
   * If there is a body to parse, and parsing or validation fail, the server will return a 400 error.
   * 
   * If there is no body to parse, the handler will be called with undefined for the body.
   * 
   * #### Example
   * 
   * ```ts
   * z => ({
   *   username: z.string(),
   * })
   * ```
   */
  zodRequest: (z: Z2) => Q;
  /** 
   * A zod type (not an object like the request). 
   * The result is returned to the client as JSON. 
   * 
   * Note that by default zod will remove keys from objects that are not in the schema rather than throwing. 
   * If the response fails the schema, the server will return status 500 and log the error.
   * 
   * The return type of the handler function is infered from this schema. 
   */
  zodResponse: (z: Z2<"boolean" | "number">) => R;
  handler: (
    state: ApiStateObject<M, Q>
  ) => Promise<z.infer<R>>;
}