
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

export class ServerEvents extends EventEmitter<ServerEventsMap> {
  /** Use emitAsync instead */
  override emit!: never;
  /** Call all listeners in sequence sync'ly */
  emitSync<K>(
    eventName: keyof ServerEventsMap | K,
    ...args: K extends keyof ServerEventsMap ? ServerEventsMap[K] : never
  ) {
    this.listeners(eventName).map(e => e(...args));
  }
  /** Call all listeners via Promise.all. */
  async emitAsync<K>(
    eventName: keyof ServerEventsMap | K,
    ...args: K extends keyof ServerEventsMap ? ServerEventsMap[K] : never
  ) {
    // the node implementation handles once in the once handler, not in emit
    await Promise.all(this.listeners(eventName).map(e => e(...args)));
  }
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


