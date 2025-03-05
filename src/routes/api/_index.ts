import { z, ZodType, ZodTypeAny } from "zod";
import { rootRoute } from "../../rootRoute";
import { ApiStateObject, StateObject } from "../../StateObject";
import { serverIndexJson } from "./IndexJson";
import { serverCreateACL, serverDeleteACL, serverListACL } from "./ACL";
import { serverCreateBag, serverDeleteBag, serverEditBag, serverListBags } from "./Bags";
import { _zodAssertAny, Z2, ZodAssert as zodAssert } from "../../zodAssert";
import { JsonValue } from "@prisma/client/runtime/library";
import { serverCreateRecipe } from "./Recipes";
import { serverDeleteUserAccount, serverGetUsers, serverUpdateUser } from "./Users";

// the name is for sorting

export type ServerMap = typeof serverMap;
export type ServerMapKeys = keyof ServerMap extends `server${infer K}` ? K : never;

type GetTypeMap<T> = {
  [K in keyof T]: T[K] extends z.ZodTypeAny ? z.input<T[K]> extends string ? z.infer<T[K]> : never : never
}

export type ServerMapRequest = {
  [K in ServerMapKeys]: Parameters<ServerMap[`server${K}`]["handler"]>[1]
}

export type ServerMapResponse = {
  [K in ServerMapKeys]: Awaited<ReturnType<ServerMap[`server${K}`]["handler"]>>
}

type t = Awaited<ReturnType<ServerMap[`server${"IndexJson"}`]["handler"]>>

export type ServerMapType = {
  [K in ServerMapKeys]: ServerMap[`server${K}`]
}

const serverMap = {
  serverIndexJson,

  serverCreateACL,
  serverDeleteACL,
  serverListACL,

  serverCreateBag,
  serverDeleteBag,
  serverEditBag,
  serverListBags,

  serverCreateRecipe,

  serverDeleteUserAccount,
  serverGetUsers,
  serverUpdateUser,
} satisfies Record<string, ServerEndpoint<any, any>>;

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

    return await handleRoute(route as ServerEndpoint<any, any>, state);

  });
}

async function handleRoute(
  route: ServerEndpoint<any, any>,
  state: StateObject
) {

  return await state.$transaction(async prisma => {

    const [good, error, value] = await route.handler(
      new ApiStateObject(state, prisma),
      zodAssert.any(state, z => route.zodRequest(z), state.data as any)
    ).then(e => [true, undefined, e] as const, e => [false, e, undefined] as const);

    if (good) {
      return state.sendJSON(200, zodAssert.response(state, route.zodResponse, value));
    } else if (typeof error === "string") {
      return state.sendSimple(400, error);
    } else {
      throw error;
    }
  })




}

export function makeEndpoint<Q extends ZodType<JsonValue | undefined>, R extends JsonValue>(
  { handler }: {
    zodRequest: (z: Z2<"JSON">) => Q;
    handler: (state: ApiStateObject, input: z.infer<Q>) => Promise<R>;
    zodResponse: (z: Z2<"JSON">) => any;
  }
) {
  return { handler, zodRequest: (z: Z2) => z.any(), zodResponse: (z: Z2) => z.any() }
}

interface ServerEndpoint<Q extends JsonValue, R extends JsonValue> {
  /** 
   * A hashmap (aka object, record) of keys to Zod types. The result is passed to the handler.
   * 
   * The server will parse the body as JSON.
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
  zodRequest: (z: Z2<"JSON">) => ZodType<Q>;
  /** 
   * A zod type (not an object like the request). 
   * The result is returned to the client as JSON. So the handler must at least return null.
   * 
   * Note that by default zod will remove keys from objects that are not in the schema rather than throwing. 
   * If the response fails the schema, the server will return status 500 and log the error.
   * 
   * The return type of the handler function is infered from this schema. 
   */
  zodResponse: (z: Z2<"JSON">) => ZodType<R>;
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
  handler: (state: ApiStateObject, input: Q) => Promise<R>;
}