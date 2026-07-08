
// the keys in the arrays are labels which get used for the 

import { EventEmitter } from "events";

// argument names when the tuple is used in a function definition
/**
 * Server events used throughout the entire server.
 * 
 * To find all references to a specific event, use find all occurrences
 * on a usage of the event name string, not on the definition of the event.
 */
export interface ServerEventsMap {

}
// the node implementation handles once in the once handler, not in emit
export class ServerEvents extends EventEmitter<ServerEventsMap> {
  activeCount = 0;
  activeName = "";
  // events aren't supposed to be running on the first evaluation 
  // so this stays true until the proper code changes it.
  eventLogging = true;
  logBefore(eventName: string) {
    if (!this.eventLogging) return;
    if (this.activeName)
      console.log(
        "├ ".repeat(this.activeCount)
        + String(this.activeName)
        + ":", "--------"
      );
    this.activeName = String(eventName);
    this.activeCount++;
    console.time("├ ".repeat(this.activeCount) + String(eventName));
  }
  logAfter(eventName: string) {
    if (!this.eventLogging) return;
    console.timeEnd("├ ".repeat(this.activeCount) + String(eventName));
    this.activeCount--;
    this.activeName = "";
  }
  logLine(text: string) {
    if (!this.eventLogging) return;
    console.log("├ ".repeat(this.activeCount + 1) + text)
  }
  /** Use emitAsync instead */
  override emit!: never;
  /** Call all listeners in sequence sync'ly */
  emitSync<K>(
    eventName: keyof ServerEventsMap | K,
    ...args: K extends keyof ServerEventsMap ? ServerEventsMap[K] : never
  ) {
    this.logBefore(String(eventName));
    this.listeners(eventName).map(e => e(...args));
    this.logAfter(String(eventName));
  }
  /** Call all listeners via Promise.all. */
  async emitAsync<K>(
    eventName: keyof ServerEventsMap | K,
    ...args: K extends keyof ServerEventsMap ? ServerEventsMap[K] : never
  ) {
    this.logBefore(String(eventName));
    for (const e of this.listeners(eventName)) { await e(...args) };
    this.logAfter(String(eventName));
  }
  /** Call all listeners sync'ly, await them, catch errors per listener and forward them to emitLogCatcher.  */
  async emitLog<K>(
    eventName: keyof ServerEventsMap | K,
    ...args: K extends keyof ServerEventsMap ? ServerEventsMap[K] : never
  ) {
    this.logBefore(String(eventName));
    this.listeners(eventName).map(async e => { try { await e(...args) } catch (e) { this.emitLogCatcher?.(e); } })
    this.logAfter(String(eventName));
  }

  emitLogCatcher?: (error: unknown) => void;

}

/**
 * Server events used throughout the entire server.
 * 
 * To find all references to a specific event, use find all occurrences 
 * on a usage of the event name string.
 * 
 * The listener function is awaited, but the return value is ignored. 
 * 
 * If any listener throws, the await rejects, and the error is 
 * caught by the nearest error handler, if one exists. 
 */
export const serverEvents = new ServerEvents();

// declare some global types and functions to be used throughout the server


