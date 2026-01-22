import { serverEvents } from "@tiddlywiki/events";
import { Router } from "./router";
import { ListenerHTTP, ListenerHTTPS, ListenOptions } from "./listeners";
import type { GenericRequest, GenericResponse } from "./streamer";
import type { ServerRequest } from "./router";
import { Z2, zod as z } from "./Z2";
import { caughtPromise } from "./utils";

export * from "./listeners";
export * from "./router";
export * from "./SendError";
export * from "./streamer";
export * from "./utils";
export * from "./Z2";
export * from "./zodRegister";
export * from "./zodRoute";
export * from "./better-headers";

/**
 * A startup function which currently does nothing but might eventually do something.
 */
export async function startup() {

}

let exiting = false;
export const exiter = caughtPromise(async (signal: any) => {
  if (exiting) return;
  exiting = true;
  console.log(`Server exiting due to ${signal}...`);

  setTimeout(() => {
    console.log("Server exit timeout reached, forcing exit.");
    serverEvents.emitSync("sync-exit-forced");
    console.log("Exiting process...");
    process.exit(0);
  }, 5000).unref();

  console.time("Server exit events");
  await serverEvents.emitAsync("exit").catch(e => {
    console.error("Error in exit events:", e);
  });
  console.timeEnd("Server exit events");
}, e => {
  console.error("Error in exiter", e);
  process.exit(1);
});

// process.on("SIGINT", exit);
// process.on("SIGTERM", exit);
// process.on("SIGHUP", exit);

const listenOptionsCheck = z.object({
  port: z.string().optional(),
  host: z.string().optional(),
  prefix: z.string().optional()
    .transform(prefix => prefix || "")
    .refine((prefix) => !prefix || prefix.startsWith("/"),
      "Listener path prefix must start with a slash or be falsy")
    .refine((prefix) => !prefix.endsWith("/"),
      "Listener path prefix must NOT end with a slash"),
  key: z.string().optional(),
  cert: z.string().optional(),
  secureServerOptions: z.any(),
  secure: z.boolean().optional(),
  redirect: z.number().optional(),
}).strict().array();

export async function startListening(
  router: Router,
  options: Partial<ListenOptions>[] = []
) {

  const listenerCheck = listenOptionsCheck.safeParse(options);

  if (!listenerCheck.success) {
    console.log("Invalid listener options: ");
    console.log(options);
    const errorString = Z2.prettifyError(listenerCheck.error).toString();
    console.log(errorString);
    throw new Error("Invalid listener options: " + errorString);
  }

  const listenInstances = listenerCheck.data.map(e => {

    if (!e.key !== !e.cert) {
      throw new Error("Both key and cert are required for HTTPS");
    }

    const options2: ListenOptions = {
      port: e.port ?? process.env.PORT ?? "8080",
      host: e.host ?? "localhost",
      prefix: e.prefix ?? "",
      secure: e.secure ?? false,
      key: e.key,
      cert: e.cert,
      redirect: e.redirect,
      secureServerOptions: e.secureServerOptions
    }

    return (e.secureServerOptions || e.key && e.cert)
      ? new ListenerHTTPS(router, options2)
      : new ListenerHTTP(router, options2);

  });

  return listenInstances;

}

declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "zod.make": [zod: Z2<any>]
    "request.middleware": [router: Router, req: GenericRequest, res: GenericResponse, options: ListenOptions]
    "request.state": [router: Router, state: ServerRequest]
    "request.fallback": [router: Router, state: ServerRequest]
    "exit": []
    "sync-exit-forced": []
  }
}

declare global { const STREAM_ENDED: unique symbol; }
const STREAM_ENDED: unique symbol = Symbol("STREAM_ENDED");
(global as any).STREAM_ENDED = STREAM_ENDED;