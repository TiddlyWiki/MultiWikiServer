import { fromError } from "zod-validation-error";
import Debug from "debug";
import { ZodRoute } from "./zodRoute";
import { Z2 } from "./Z2";
import { ServerRequest, ServerRoute } from "./router";
import { zod } from "@tiddlywiki/server";
import * as core from "zod/v4/core";
const debugCORS = Debug("mws:cors");



export const registerZodRoutes = (parent: ServerRoute, router: any, keys: string[]) => {
  return keys.map((key) => {
    defineZodRoute(parent, key, router[key]);
  });
}

function buildPathRegex(path: string, key: string, keyReplacer: string) {
  if (!path.startsWith("/")) throw new Error(`Path ${path} must start with a forward slash`);
  if (key.startsWith(":")) throw new Error(`Key ${key} must not start with a colon`)
  if (path !== path.trim()) throw new Error(`Path ${path} must not have leading and trailing white space or line terminator characters`);
  const parts = path.split("/");

  return "^" + parts.map((e, i) => {

    const last = i === parts.length - 1;
    if (e === "") {
      if (!last && i !== 0) throw new Error(`Path ${path} has an empty part at index ${i}`);
      return "";
    }
    const name = e.startsWith(":") && e.slice(1);
    if (e === keyReplacer) return key;
    if (!name) return e;
    return (last && !path.endsWith("/")) ? `(?<${name}>.+)` : `(?<${name}>[^/]+)`;
  }).join("/") + (path.endsWith("/") ? "(?=/)" : "$");
}

export function defineZodRoute(
  parent: ServerRoute,
  key: string,
  route: ZodRoute<any, any, any, any, any, any>
) {
  const {
    method, path, bodyFormat, registerError, keyReplacer,
    zodPathParams,
    zodQueryParams = (z => ({}) as any),
    zodRequestBody = ["string", "json", "www-form-urlencoded"].includes(bodyFormat)
      ? z => z.undefined() : (z => z.any() as any),
    inner,
    securityChecks,
  } = route;

  if (method.includes("OPTIONS"))
    throw new Error(key + " includes OPTIONS. Use corsRequest instead.");

  const pathregex = typeof path === "string" ? buildPathRegex(path, key, keyReplacer ?? "") : path;

  return parent.defineRoute({
    method,
    path: new RegExp(pathregex),
    bodyFormat,
    denyFinal: false,
    securityChecks,
  }, async state => {

    checkPath(state, zodPathParams, registerError);

    checkQuery(state, zodQueryParams, registerError);

    checkData(state, zodRequestBody, registerError);

    const timekey = `handler ${state.bodyFormat} ${state.method} ${state.urlInfo.pathname}`;
    if (Debug.enabled("server:handler:timing")) console.time(timekey);
    const [good, error, res] = await inner(state)
      .then(e => [true, undefined, e] as const, e => [false, e, undefined] as const);
    if (Debug.enabled("server:handler:timing")) console.timeEnd(timekey);

    if (!good) {
      if (error === STREAM_ENDED) {
        return error;
      } else if (typeof error === "string") {
        return state.sendString(400, { "x-reason": "zod-handler" }, error, "utf8");
      } else if (error instanceof Error && error.name === "UserError") {
        return state.sendString(400, { "x-reason": "user-error" }, error.message, "utf8");
      } else {
        throw error;
      }
    }
    if (res === undefined) {
      return state.sendEmpty(204, { "content-type": "application/json" });
    } else {
      return state.sendJSON(200, res);
    }
  });
}

export function checkData<
  T extends core.$ZodType
>(
  state: ServerRequest,
  zodRequestBody: (z: Z2<any>) => T,
  registerError: Error
): asserts state is ServerRequest & { data: zod.infer<T> } {
  const inputCheck = Z2.any().pipe(zodRequestBody(Z2)).safeParse(state.data);
  if (!inputCheck.success) {
    console.log(`${inputCheck.error}\nfor\n${registerError.stack?.split("\n").slice(1).join("\n")}`);
    throw state.sendString(400, {
      "content-type": "text/plain; charset=utf-8",
      "x-reason": "zod-request"
    }, Z2.prettifyError(inputCheck.error).toString(), "utf8");
  }
  state.data = inputCheck.data;
}

export function checkQuery<
  T extends { [x: string]: core.$ZodType<unknown, string[] | undefined>; }
>(
  state: ServerRequest,
  zodQueryParams: (z: Z2<"STRING">) => T,
  registerError: Error
): asserts state is ServerRequest & { queryParams: zod.infer<zod.ZodObject<T>> } {
  const queryCheck = Z2.strictObject(zodQueryParams(Z2)).safeParse(state.queryParams);
  if (!queryCheck.success) {
    console.log(`${queryCheck.error}\nfor\n${registerError.stack?.split("\n").slice(1).join("\n")}`);
    throw state.sendString(400, {
      "content-type": "text/plain; charset=utf-8",
      "x-reason": "zod-query"
    }, Z2.prettifyError(queryCheck.error).toString(), "utf8");
  }
  state.queryParams = queryCheck.data as any;
}

export function checkPath<
  T extends { [x: string]: core.$ZodType<unknown, string | undefined>; }
>(
  state: ServerRequest,
  zodPathParams: (z: Z2<"STRING">) => T,
  registerError: Error
): asserts state is ServerRequest & { pathParams: zod.infer<zod.ZodObject<T>> } {
  const pathCheck = Z2.strictObject(zodPathParams(Z2)).safeParse(state.pathParams);
  if (!pathCheck.success) {
    console.log(`${pathCheck.error}\nfor\n${registerError.stack?.split("\n").slice(1).join("\n")}`);
    throw state.sendString(400, {
      "content-type": "text/plain; charset=utf-8",
      "x-reason": "zod-path"
    }, Z2.prettifyError(pathCheck.error).toString(), "utf8");
  }
  state.pathParams = pathCheck.data as any;
}

