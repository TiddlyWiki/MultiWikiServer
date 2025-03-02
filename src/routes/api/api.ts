import { z } from "zod";
import { rootRoute } from "../../rootRoute";
import { ApiStateObject, StateObject } from "../../StateObject";
import { serverIndexJson } from "./IndexJson";
import { serverCreateACL, serverDeleteACL } from "./ACL";

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
  serverCreateACL,
  serverDeleteACL,
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

    const route = serverMap[`server${state.pathParams.endpoint}`] as ServerEndpoint<"READ" | "WRITE", any, any>;

    const [good, error, value] = await handleRoute(route, state)
      .then(e => [true, undefined, e] as const, e => [false, e, undefined] as const);

    if (good)
      return state.sendJSON(200, zodAssert.response(state, route.zodResponse, value));
    else if (typeof error === "string")
      return state.sendSimple(400, error);
    else
      return state.sendSimple(500, "Internal server error");

  });
}

async function handleRoute(
  route: ServerEndpoint<"READ", Record<string, z.ZodTypeAny>, any>
    | ServerEndpoint<"WRITE", Record<string, z.ZodTypeAny>, any>,
  state: StateObject
) {

  return await state.$transaction(async prisma => {

    switch (route.methodType) {
      case "READ": {
        zodAssert.queryParams(state, z => route.zodRequest(z));
        const apiState = new ApiStateObject(state, prisma, "READ", state.queryParams);
        const value = await route.handler(apiState);
        return zodAssert.response(state, route.zodResponse, value);
      }
      case "WRITE": {
        zodAssert.data(state, z => z.object(route.zodRequest(z)));
        const apiState = new ApiStateObject(state, prisma, "WRITE", state.data);
        const value = await route.handler(apiState);
        return zodAssert.response(state, route.zodResponse, value);
      }
      default: {
        // this just makes sure we didn't miss a method type
        const _: never = route;
        throw new Error("Invalid method type");
      }
    }
  })




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
   * The result is returned to the client as JSON. 
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