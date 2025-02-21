import { Readable } from 'stream';
import { recieveMultipartData as readMultipartData, sendResponse } from './helpers';
import { STREAM_ENDED, Streamer } from './server';
import { AuthState } from './AuthState';
import { PassThrough } from 'node:stream';
import { AllowedMethod, BodyFormat, RouteMatch, Router } from './router';
import { z } from 'zod';
import { SqlTiddlerStore } from './store/sql-tiddler-store';

// This class abstracts the request/response cycle into a single object.
// It hides most of the details from the routes, allowing us to easily change the underlying server implementation.
export class StateObject<
  B extends BodyFormat = BodyFormat,
  M extends AllowedMethod = AllowedMethod,
  R extends RouteMatch<any>[] = RouteMatch<any>[],
  D = unknown
> {
  // handler shims
  authenticatedUsername: string | null = null;
  authenticatedUser: any = null;
  store!: SqlTiddlerStore;
  z: typeof z = z;
  allowAnon: any;
  allowAnonReads: any;
  allowAnonWrites: any;
  anonAccessConfigured: any;
  firstGuestUser: any;
  showAnonConfig: any;



  // checkACL: ACL_Middleware_Helper = async (request, response, state, entityType, permissionName) => {
  //   okEntityType(entityType);
  //   var extensionRegex = /\.[A-Za-z0-9]{1,4}$/;

  //   var
  //     sqlTiddlerDatabase = state.store.sql,
  //     entityName = state.data ? (state.data[entityType + "_name"] || state.params[0]) : state.params[0];

  //   // First, replace '%3A' with ':' to handle TiddlyWiki's system tiddlers
  //   var partiallyDecoded = entityName?.replace(/%3A/g, ":");
  //   // Then use decodeURIComponent for the rest
  //   var decodedEntityName = decodeURIComponent(partiallyDecoded);
  //   var aclRecord = await sqlTiddlerDatabase.getACLByName(entityType, decodedEntityName);
  //   var isGetRequest = request.method === "GET";
  //   var hasAnonymousAccess = state.allowAnon ? (isGetRequest ? state.allowAnonReads : state.allowAnonWrites) : false;
  //   var anonymousAccessConfigured = state.anonAccessConfigured;
  //   const { value: entity } = await sqlTiddlerDatabase.getEntityByName(entityType, decodedEntityName);
  //   var isAdmin = state.authenticatedUser?.isAdmin;

  //   if (isAdmin) {
  //     return;
  //   }

  //   if (entity?.owner_id) {
  //     if (state.authenticatedUser?.user_id && (state.authenticatedUser?.user_id !== entity.owner_id) || !state.authenticatedUser?.user_id && !hasAnonymousAccess) {
  //       const hasPermission = state.authenticatedUser?.user_id ?
  //         entityType === 'recipe' ? await sqlTiddlerDatabase.hasRecipePermission(state.authenticatedUser?.user_id, decodedEntityName, isGetRequest ? 'READ' : 'WRITE')
  //           : await sqlTiddlerDatabase.hasBagPermission(state.authenticatedUser?.user_id, decodedEntityName, isGetRequest ? 'READ' : 'WRITE')
  //         : false
  //       if (!response.headersSent && !hasPermission) {
  //         response.writeHead(403, "Forbidden");
  //         response.end();
  //       }
  //       return;
  //     }
  //   } else {
  //     // First, we need to check if anonymous access is allowed
  //     if (!state.authenticatedUser?.user_id && (anonymousAccessConfigured && !hasAnonymousAccess)) {
  //       if (!response.headersSent && !extensionRegex.test(request.url)) {
  //         response.writeHead(401, "Unauthorized");
  //         response.end();
  //       }
  //       return;
  //     } else {
  //       // Get permission record
  //       const permission = await sqlTiddlerDatabase.getPermissionByName(permissionName);
  //       // ACL Middleware will only apply if the entity has a middleware record
  //       if (aclRecord && aclRecord?.permission_id === permission?.permission_id) {
  //         // If not authenticated and anonymous access is not allowed, request authentication
  //         if (!state.authenticatedUsername && !state.allowAnon) {
  //           if (state.urlInfo.pathname !== '/login') {
  //             // redirectToLogin(response, request.url);
  //             return;
  //           }
  //         }
  //       }

  //       // Check ACL permission
  //       var hasPermission = request.method === "POST"
  //         || await sqlTiddlerDatabase.checkACLPermission(
  //           state.authenticatedUser?.user_id,
  //           entityType,
  //           decodedEntityName,
  //           permissionName,
  //           entity?.owner_id
  //         );

  //       if (!hasPermission && !hasAnonymousAccess) {
  //         if (!response.headersSent) {
  //           response.writeHead(403, "Forbidden");
  //           response.end();
  //         }
  //         return;
  //       }
  //     }
  //   }
  // };

  get url() { return this.streamer.url; }
  get method(): M { return this.streamer.method as M; }
  get headers() { return this.streamer.headers; }
  get host() { return this.streamer.host; }
  get urlInfo() { return this.streamer.url; }
  get headersSent() { return this.streamer.headersSent; }

  get reader() { return this.streamer.reader; }

  readBody = this.streamer.readBody.bind(this.streamer);
  readMultipartData = readMultipartData.bind(this.router, this);

  sendEmpty = this.streamer.sendEmpty.bind(this.streamer);
  sendString = this.streamer.sendString.bind(this.streamer);
  sendBuffer = this.streamer.sendBuffer.bind(this.streamer);
  sendStream = this.streamer.sendStream.bind(this.streamer);
  sendFile = this.streamer.sendFile.bind(this.streamer);
  end = this.streamer.end.bind(this.streamer);

  sendResponse = sendResponse.bind(this.router, this);

  get enableBrowserCache() { return this.router.enableBrowserCache; }
  get enableGzip() { return this.router.enableGzip; }
  get pathPrefix() { return this.router.pathPrefix; }

  queryParameters = this.url.searchParams;
  data!:
    B extends "string" ? string :
    B extends "buffer" ? Buffer :
    B extends "www-form-urlencoded-params" ? URLSearchParams :
    B extends "stream" ? Readable :
    B extends "ignore" ? undefined :
    D;
  params: string[][];



  constructor(
    private streamer: Streamer,
    /** The array of Route tree nodes the request matched. */
    route: R,
    /** The bodyformat that ended up taking precedence. This should be correctly typed. */
    public bodyFormat: B,
    public authState: AuthState,
    private router: Router
  ) {
    this.params = route.map(r => r.params);
  }

  wiki: any;
  boot: any;
  server: any;

  /** Runs zod on state.data, assigning the result to state.data if successful, and returning success. */
  zod<T extends z.ZodTypeAny>(schema: (zod: typeof z) => T): this is { data: z.infer<T> } {
    const { success, data } = z.any().pipe(schema(z)).safeParse(this.data);
    if (!success) return false;
    this.data = data;
    return true;
  }

  makeTiddlerEtag(options: { bag_name: string; tiddler_id: string; }) {
    if (options.bag_name || options.tiddler_id) {
      return "\"tiddler:" + options.bag_name + "/" + options.tiddler_id + "\"";
    } else {
      throw "Missing bag_name or tiddler_id";
    }
  }

  /** type-narrowing helper function. This affects anywhere T is used. */
  isBodyFormat<T extends B, S extends { [K in B]: StateObject<K, M, R, D> }[T]>(format: T): this is S {
    return this.bodyFormat as BodyFormat === format;
  }
  /**
   *
   * - **301 Moved Permanently:** The resource has been permanently moved to a new URL.
   * - **302 Found:** The resource is temporarily located at a different URL.
   * - **303 See Other:** Fetch the resource from another URI using a GET request.
   * - **307 Temporary Redirect:** The resource is temporarily located at a different URL; the same HTTP method should be used.
   * - **308 Permanent Redirect:** The resource has permanently moved; the client should use the new URL in future requests.
   */
  redirect(statusCode: number, location: string): typeof STREAM_ENDED {
    return this.sendEmpty(statusCode, { 'Location': location });
  }

  sendSSE(retryMilliseconds: number) {
    if (typeof retryMilliseconds !== "number" || retryMilliseconds < 0)
      throw new Error("Invalid retryMilliseconds: must be a non-negative number");

    const stream = new PassThrough();

    this.sendStream(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
    }, stream);

    stream.write(": This page is a server-sent event stream. It will continue loading until you close it.\n");
    stream.write(": https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events\n");
    stream.write("\n");

    /**
     * 
     * @param {string} eventName The event name. If zero-length, the field is omitted
     * @param eventData The data to send. Must be stringify-able to JSON.
     * @param {string} eventId The event id. If zero-length, the field is omitted.
     */
    const write = (eventName: string, eventData: any, eventId: string) => {
      if (typeof eventName !== "string")
        throw new Error("Event name must be a string (a zero-length string disables the field)");
      if (eventName.includes("\n"))
        throw new Error("Event name cannot contain newlines");
      if (typeof eventId !== "string")
        throw new Error("Event ID must be a string");
      if (eventId.includes("\n"))
        throw new Error("Event ID cannot contain newlines");

      stream.write([
        eventName && `event: ${eventName}`,
        `data: ${JSON.stringify(eventData)}`,
        eventId && `id: ${eventId}`,
        retryMilliseconds && `retry: ${retryMilliseconds}`,
      ].filter(e => e).join("\n") + "\n\n");
    }

    const close = () => stream.end();

    return { write, close };

  }
}
