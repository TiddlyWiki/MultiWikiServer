import "../../../prisma/global";
import { serverEvents } from "@tiddlywiki/events";
Error.stackTraceLimit = 100;; // increase stack trace limit for better debugging
// these all use serverEvents
import "@tiddlywiki/commander";
import "@tiddlywiki/server";
import "./registerRequest";
import "./registerStartup";
import "./commands";
import "./managers";
import "./zodAssert";
import "./RequestState";
import "./ServerState";
import "./services/tw-routes";
import "./services/cache";
import "./services/sessions";

// startup
import * as opaque from "@serenity-kit/opaque";
import { startup } from "@tiddlywiki/server";
import { runCLI } from "@tiddlywiki/commander";

// exports
export { ZodRoute } from "@tiddlywiki/server";
export * from "./managers";

export async function runMWS() {
  await opaque.ready;
  await startup();
  await runCLI();
}



serverEvents.on("cli.commander", (program) => {
  program.description("Multi-User Multi-Wiki Server for TiddlyWiki.");
})


declare global {

  /** Awaited Return Type */
  type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>
  type Complete<T> = { [K in keyof T]-?: T[K] }
  interface ObjectConstructor { keys<T>(t: T): (string & keyof T)[]; }

}

declare global {
  /** helper function which returns the arguments as an array, but typed as a tuple, which is still an array, but positional. */
  function tuple<P extends any[]>(...arg: P): P;
}
(global as any).tuple = function (...args: any[]) { return args; }

declare global {
  /** 
   * Helper function which narrows the type to only truthy values.
   * 
   * It uses `!!` so NaN will also be excluded.
   */
  function truthy<T>(obj: T): obj is Exclude<T, false | null | undefined | 0 | '' | void>
}
(global as any).truthy = function truthy(obj: any) { return !!obj; }


