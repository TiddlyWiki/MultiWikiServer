import { z } from "zod";
import { rootRoute } from "../../rootRoute";
import { ApiStateObject, StateObject } from "../../StateObject";
import { serverIndexJson } from "./IndexJson";
import { serverCreateACL, serverDeleteACL, serverListACL } from "./ACL";
import { _zodAssertAny, Z2, ZodAssert as zodAssert } from "../../zodAssert";
import { JsonValue } from "@prisma/client/runtime/library";

export type ServerMap = typeof serverMap;
export type ServerMapKeys = keyof ServerMap extends `server${infer K}` ? K : never;

type GetTypeMap<T> = {
  [K in keyof T]: T[K] extends z.ZodTypeAny ? z.input<T[K]> extends string ? z.infer<T[K]> : never : never
}

export type ServerMapRequest = {
  [K in ServerMapKeys]: ServerMap[`server${K}`]["methodType"] extends "READ"
  ? GetTypeMap<ReturnType<ServerMap[`server${K}`]["zodRequest"]>>
  : z.input<z.ZodObject<ReturnType<ServerMap[`server${K}`]["zodRequest"]>>>
}

export type ServerMapResponse = {
  [K in ServerMapKeys]: z.infer<ReturnType<ServerMap[`server${K}`]["zodResponse"]>>
}

export type ServerMapType = {
  [K in ServerMapKeys]: ServerMap[`server${K}`]["methodType"]
}

const serverMap = {
  serverIndexJson,
  serverCreateACL,
  serverDeleteACL,
  serverListACL,
} satisfies Record<string, ServerEndpoint<any, any, any>>;

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

    const route = serverMap[`server${state.pathParams.endpoint}`];

    return await handleRoute(route as ServerEndpoint<"READ" | "WRITE", any, any>, state);

  });
}

async function handleRoute(
  route: ServerEndpoint<"READ" | "WRITE", Record<string, z.ZodTypeAny>, any>,
  state: StateObject
) {

  return await state.$transaction(async prisma => {
    const getRequestData = () => {
      switch (route.methodType) {
        case "READ":
          const params = Object.fromEntries(Object.entries(state.queryParams)
            .flatMap(([key, value = []]) => value.map(v => [key, v] as const)));
          console.log(params);
          return _zodAssertAny("queryParams", state, z => z.object(route.zodRequest(z)), params);
        case "WRITE":
          return zodAssert.data(state, z => z.object(route.zodRequest(z))), state.data;
        default:
          throw new Error("Invalid method type");
      }
    }

    const apiState = new ApiStateObject(state, prisma, route.methodType, getRequestData());
    const [good, error, value] = await route.handler(apiState)
      .then(e => [true, undefined, e] as const, e => [false, e, undefined] as const);

    if (good) {
      return state.sendJSON(200, zodAssert.response(state, route.zodResponse, value));
    } else if (typeof error === "string") {
      return state.sendSimple(400, error);
    } else {
      throw error;
    }
  })




}

export function makeEndpoint<M extends "READ" | "WRITE", Q extends Record<string, z.ZodTypeAny>, R extends z.ZodType<JsonValue>>(
  endpoint: ServerEndpoint<M, Q, R>
) {
  return endpoint;
}

interface ServerEndpoint<M extends "READ" | "WRITE", Q extends Record<string, z.ZodTypeAny>, R extends z.ZodType<JsonValue>> {
  methodType: M;
  /** 
   * A hashmap (aka object, record) of keys to Zod types. The result is passed to the handler.
   * 
   * ### READ requests (GET and HEAD)
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
   * ### WRITE requests (POST, PUT)
   * 
   * For POST, PUT, and DELETE requests, the server will parse the body as JSON.
   * If parsing or validation fail, the server will return a 400 error.
   * For now it's assumed that there must always be a body.
   * 
   * #### Example
   * 
   * ```ts
   * z => ({
   *   username: z.string(),
   * })
   * ```
   */
  zodRequest: (z: M extends "WRITE" ? Z2<"JSON"> : Z2<"STRING">) => Q;
  /** 
   * A zod type (not an object like the request). 
   * The result is returned to the client as JSON. So the handler must at least return null.
   * 
   * Note that by default zod will remove keys from objects that are not in the schema rather than throwing. 
   * If the response fails the schema, the server will return status 500 and log the error.
   * 
   * The return type of the handler function is infered from this schema. 
   */
  zodResponse: (z: Z2<"JSON">) => R;
  /**
   * The handler returns a response which is then validated against the zodResponse schema.
   * 
   * If the handler throws a string, the server will return a 400 error with the string as the message.
   * 
   * Throwing will also rollback the transaction for the request.
   * 
   * If the handler throws anything other than a string, the server will return a 500 error with a generic message.
   * 
   * 
   */
  handler: (state: ApiStateObject<M, Q>) => Promise<z.infer<R>>;
}