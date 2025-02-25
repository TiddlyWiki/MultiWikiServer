import { Readable } from 'stream';
import { createStrictAwaitProxy, processIncomingStream, readMultipartData, sendResponse } from './helpers';
import { STREAM_ENDED, Streamer } from './server';
import { PassThrough } from 'node:stream';
import { AllowedMethod, BodyFormat, RouteMatch, Router } from './router';
import { SqlTiddlerStore } from './store/new-sql-tiddler-store';
import * as z from 'zod';
import * as crypto from "crypto";
import { SqlTiddlerDatabase } from './store/new-sql-tiddler-database';
import { resolve } from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { DataChecks } from './store/data-checks';

const authLevelNeededForMethod: Record<AllowedMethod, "readers" | "writers" | undefined> = {
  "GET": "readers",
  "OPTIONS": "readers",
  "HEAD": "readers",
  "PUT": "writers",
  "POST": "writers",
  "DELETE": "writers"
} as const;

export interface AuthStateRouteACL {
  /** Every level in the route path must have this disabled for it to be disabled */
  csrfDisable?: boolean;
}


// This class abstracts the request/response cycle into a single object.
// It hides most of the details from the routes, allowing us to easily change the underlying server implementation.
export class StateObject<
  B extends BodyFormat = BodyFormat,
  M extends AllowedMethod = AllowedMethod,
  RoutePathParams extends string[][] = string[][],
  D = unknown
> {
  // handler shims


  z: typeof z = z;



  get url() { return this.streamer.url; }
  get method(): M { return this.streamer.method as M; }
  get headers() { return this.streamer.headers; }
  get host() { return this.streamer.host; }
  get urlInfo() { return this.streamer.urlInfo; }
  get headersSent() { return this.streamer.headersSent; }

  get reader() { return this.streamer.reader; }

  readBody
  readMultipartData
  processIncomingStream
  sendEmpty
  sendString
  sendBuffer
  sendStream
  sendFile
  sendResponse

  /**
   * 
   * Sets a single header value. If the header already exists in the to-be-sent
   * headers, its value will be replaced. Use an array of strings to send multiple
   * headers with the same name
   * 
   * When headers have been set with `response.setHeader()`, they will be merged
   * with any headers passed to `response.writeHead()`, with the headers passed
   * to `response.writeHead()` given precedence.
   * 
   */
  setHeader
  writeHead
  write
  end


  /** sends a status and plain text string body */
  sendSimple(status: number, msg: string) {
    return this.sendString(status, { "content-type": "text/plain" }, msg, "utf8");
  }

  STREAM_ENDED: typeof STREAM_ENDED = STREAM_ENDED;


  get enableBrowserCache() { return this.router.enableBrowserCache; }
  get enableGzip() { return this.router.enableGzip; }
  get pathPrefix() { return this.router.pathPrefix; }


  data!:
    B extends "string" ? string :
    B extends "buffer" ? Buffer :
    B extends "www-form-urlencoded-urlsearchparams" ? URLSearchParams :
    B extends "stream" ? Readable :
    B extends "ignore" ? undefined :
    D;
  /** 
   * an *object from entries* of all the pathParams in the tree mapped to the path regex matches from that route.
   * 
   * Object.fromEntries takes the last value if there are duplicates, so conflicting names will have the last value in the path. 
   */
  pathParams: Record<RoutePathParams extends (infer X extends string)[][] ? X : never, string | undefined>;
  /** 
   * The query params. Because these aren't checked anywhere, 
   * the value includes undefined since it will be that if 
   * the key is not specified at all. 
   * 
   * This will always satisfy the zod schema: `z.record(z.array(z.string()))`
   */
  queryParams: Record<string, string[] | undefined>;
  authLevelNeeded: "readers" | "writers";
  authorizationType: string;
  authenticatedUser: {
    user_id: PrismaField<"users", "user_id">,
    recipe_owner_id: PrismaField<"recipes", "owner_id"> & {},
    isAdmin: boolean,
    username: string,
    sessionId: PrismaField<"sessions", "session_id">,
  } | null = null;

  authenticatedUsername: string | null = null;
  anonAccessConfigured: boolean = false;
  allowAnon: boolean = false;
  allowAnonReads: boolean = false;
  allowAnonWrites: boolean = false;
  showAnonConfig: boolean = false;
  // This isn't necessary on the route state. Something this temporary needs to be more self-contained.
  // however it is used in client state as well, so I have to leave it here for now.
  firstGuestUser: boolean = false;
  store!: SqlTiddlerStore;
  auth: Authenticator;
  databasePath
  attachmentStore
  adminWiki
  engine
  constructor(
    private streamer: Streamer,
    /** The array of Route tree nodes the request matched. */
    private routePath: RouteMatch[],
    /** The bodyformat that ended up taking precedence. This should be correctly typed. */
    public bodyFormat: B,
    private router: Router
  ) {
    // this.store = this.router.$tw.mws.store;
    this.databasePath = resolve(this.router.$tw.boot.wikiPath, "store/database.sqlite");
    this.attachmentStore = this.router.$tw.mws.store.attachmentStore;
    this.adminWiki = this.router.$tw.wiki;

    this.engine = new PrismaClient<{ datasourceUrl: string }, never, {
      result: {
        [T in Prisma.ModelName]: {
          [K in keyof PrismaPayloadScalars<T>]: () => {
            compute: () => PrismaField<T, K>
          }
        }
      },
      client: {},
      model: {},
      query: {},
    }>({ datasourceUrl: "file:" + this.databasePath });

    this.store = this.createStore(this.engine);


    this.readBody = this.streamer.readBody.bind(this.streamer);
    this.readMultipartData = readMultipartData.bind(this);
    this.processIncomingStream = processIncomingStream.bind(this);
    this.sendEmpty = this.streamer.sendEmpty.bind(this.streamer);
    this.sendString = this.streamer.sendString.bind(this.streamer);
    this.sendBuffer = this.streamer.sendBuffer.bind(this.streamer);
    this.sendStream = this.streamer.sendStream.bind(this.streamer);
    this.sendFile = this.streamer.sendFile.bind(this.streamer);
    this.sendResponse = sendResponse.bind(this.router, this);
    this.setHeader = this.streamer.setHeader.bind(this.streamer);
    this.writeHead = this.streamer.writeHead.bind(this.streamer);
    this.write = this.streamer.write.bind(this.streamer);
    this.end = this.streamer.end.bind(this.streamer);

    this.pathParams = Object.fromEntries<string | undefined>(routePath.map(r =>
      r.route.pathParams
        ?.map((e, i) => [e, r.params[i]] as const)
        .filter(<T>(e: T): e is T & {} => !!e)
      ?? []
    ).flat()) as any;
    const pathParamsZodCheck = z.record(z.string()).safeParse(this.pathParams);
    if (!pathParamsZodCheck.success) console.log("BUG: Query params zod error", pathParamsZodCheck.error);

    this.queryParams = Object.fromEntries([...this.urlInfo.searchParams.keys()]
      .map(key => [key, this.urlInfo.searchParams.getAll(key)] as const));
    const queryParamsZodCheck = z.record(z.array(z.string())).safeParse(this.queryParams);
    if (!queryParamsZodCheck.success) console.log("BUG: Query params zod error", queryParamsZodCheck.error);

    this.cookies = this.parseCookieString(this.headers.cookie ?? "");

    this.auth = createStrictAwaitProxy(new Authenticator(this));

    this.authLevelNeeded = authLevelNeededForMethod[this.streamer.method] ?? "writers";
    this.authorizationType = this.authLevelNeeded;

  }

  createStore(engine: PrismaTxnClient) {
    const sql = createStrictAwaitProxy(new SqlTiddlerDatabase(engine));
    return createStrictAwaitProxy(new SqlTiddlerStore(sql, this.attachmentStore, this.adminWiki));
  }

  // $transaction = async <T>(fn: (store: SqlTiddlerStore) => Promise<T>): Promise<T> =>
  //   await this.engine.$transaction(async prisma => await fn(this.createStore(prisma as PrismaTxnClient)));


  public cookies: Record<string, string | undefined>;
  parseCookieString(cookieString: string) {
    const cookies: any = {};
    if (typeof cookieString !== 'string') throw new Error('cookieString must be a string');
    cookieString.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const key = parts[0]!.trim();
        const value = parts.slice(1).join('=').trim();
        cookies[key] = decodeURIComponent(value);
      }
    });
    return cookies;
  }
  async authenticateUser() {
    const session_id = this.cookies.session;
    if (!session_id) { return null; }

    this.store.okSessionID(session_id);
    // get user info
    const user: any = await this.store.sql.findUserBySessionId(session_id);
    if (!user) {
      return null;
    }
    delete user.password;
    const userRole = await this.store.sql.getUserRoles(user.user_id);
    user['isAdmin'] = userRole.some(e => e.role.role_name === 'ADMIN');
    user['sessionId'] = session_id;

    return user;
  }

  getAnonymousAccessConfig() {
    const allowReadsTiddler = this.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined");
    const allowWritesTiddler = this.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined");
    const showAnonymousAccessModal = this.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/ShowAnonymousAccessModal", "undefined");

    return {
      allowReads: allowReadsTiddler === "yes",
      allowWrites: allowWritesTiddler === "yes",
      isEnabled: allowReadsTiddler !== "undefined" && allowWritesTiddler !== "undefined",
      showAnonConfig: showAnonymousAccessModal === "yes"
    };
  }

  async getOldAuthState() {
    // const state: any = {};
    // Authenticate the user
    const authenticatedUser = await this.authenticateUser();
    const authenticatedUsername = authenticatedUser?.username;
    var { allowReads, allowWrites, isEnabled, showAnonConfig } = this.getAnonymousAccessConfig();

    return {
      authenticatedUser,
      authenticatedUsername,
      anonAccessConfigured: isEnabled,
      allowAnon: isEnabled && (this.method === 'GET' ? allowReads : allowWrites),
      allowAnonReads: allowReads,
      allowAnonWrites: allowWrites,
      showAnonConfig: !!this.authenticatedUser?.isAdmin && showAnonConfig,
      firstGuestUser: (await this.store.sql.listUsers()).length === 0 && !this.authenticatedUser,
    };

  }
  makeTiddlerEtag(options: { bag_name: string; tiddler_id: string | number; }) {
    // why do we need tiddler_id AND bag_name? tiddler_id is unique across all tiddlers
    if (options.bag_name || options.tiddler_id) {
      return `"tiddler:${options.bag_name}/${options.tiddler_id}"`;
    } else {
      // TODO: WAIT!! This is a bug.
      // This should say "and" not "or", or else the above should be "&&" not "||".
      // They logically can't BOTH be OR.
      throw "Missing bag_name or tiddler_id";
    }
  }

  /** type-narrowing helper function. This affects anywhere T is used. */
  isBodyFormat<T extends B, S extends { [K in B]: StateObject<K, M, RoutePathParams, D> }[T]>(format: T): this is S {
    return this.bodyFormat as BodyFormat === format;
  }
  /**
   *
   * Sends a **302** status code and **Location** header to the client.
   * 
   * 
   * - **301 Moved Permanently:** The resource has been permanently moved to a new URL.
   * - **302 Found:** The resource is temporarily located at a different URL.
   * - **303 See Other:** Fetch the resource from another URI using a GET request.
   * - **307 Temporary Redirect:** The resource is temporarily located at a different URL; the same HTTP method should be used.
   * - **308 Permanent Redirect:** The resource has permanently moved; the client should use the new URL in future requests.
   */
  redirect(location: string): typeof STREAM_ENDED {
    return this.sendEmpty(302, { 'Location': location });
  }

  sendSSE(retryMilliseconds?: number) {
    if (retryMilliseconds !== undefined)
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
    const emitEvent = (eventName: string, eventData: any, eventId: string) => {
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

    return {
      /** Emit an SSE event */
      emitEvent,
      emitComment: (comment: string) => stream.write(`: ${comment}\n\n`),
      close: () => stream.end(),
      onClose: (callback: () => void) => stream.on("close", callback),
    };

  }
  // several changes were made to this function
  // - it shouldn't assume it knows where the entityName is
  // - it throws STREAM_ENDED if it ends the request
  // - it does not check whether headers have been sent before throwing. 
  // - headers should not be sent before it is called. 
  // - it should not send a response more than once since it should throw every time it does.
  async checkACL(entityType: EntityType, entityName: string, permissionName: ACLPermissionName): Promise<void> {

    this.store.okPermissionName(permissionName);


    if (permissionName !== {
      "GET": "READ",
      "HEAD": "READ",
      "OPTIONS": "READ",
      "PUT": "WRITE",
      "POST": "WRITE",
      "DELETE": "WRITE"
    }[this.method as AllowedMethod]) {
      this.sendEmpty(500);
      throw new Error("invalid permissionName for method")
    }

    this.store.okEntityType(entityType);
    var extensionRegex = /\.[A-Za-z0-9]{1,4}$/;


    // entityName = state.data ? (state.data[`${entityType}_name`] || this.routePath.params[0]) : state.params[0];

    // First, replace '%3A' with ':' to handle TiddlyWiki's system tiddlers
    var partiallyDecoded = entityName?.replace(/%3A/g, ":");
    // Then use decodeURIComponent for the rest
    var decodedEntityName = decodeURIComponent(partiallyDecoded) as
      PrismaField<"bags", "bag_name"> | PrismaField<"recipes", "recipe_name">;
    var aclRecord = await this.store.sql.getACLByName(entityType, decodedEntityName, undefined, false);
    var isGetRequest = this.method === "GET";
    var hasAnonymousAccess = this.allowAnon ? (isGetRequest ? this.allowAnonReads : this.allowAnonWrites) : false;
    var anonymousAccessConfigured = this.anonAccessConfigured;
    const { value: entity } = await this.store.sql.getEntityByName(entityType, decodedEntityName) as any;

    var isAdmin = this.authenticatedUser?.isAdmin;

    if (isAdmin) {
      return;
    }

    if (entity?.owner_id) {
      if (this.authenticatedUser?.user_id && (this.authenticatedUser?.user_id !== entity.owner_id) || !this.authenticatedUser?.user_id && !hasAnonymousAccess) {
        const hasPermission = this.authenticatedUser?.user_id ?
          entityType === 'recipe' ? await this.store.sql.hasRecipePermission(this.authenticatedUser?.user_id, decodedEntityName, isGetRequest ? 'READ' : 'WRITE')
            : await this.store.sql.hasBagPermission(this.authenticatedUser?.user_id, decodedEntityName, isGetRequest ? 'READ' : 'WRITE')
          : false
        if (!hasPermission) {
          throw this.sendEmpty(403);
        }
        return;
      }
    } else {
      // First, we need to check if anonymous access is allowed
      if (!this.authenticatedUser?.user_id && (anonymousAccessConfigured && !hasAnonymousAccess)) {
        if (!extensionRegex.test(this.url))
          throw this.sendEmpty(401);

        return;
      } else {
        // Get permission record
        const permission = await this.store.sql.getPermissionByName(permissionName);
        // ACL Middleware will only apply if the entity has a middleware record
        if (aclRecord && aclRecord?.permission_id === permission?.permission_id) {
          // If not authenticated and anonymous access is not allowed, request authentication
          if (!this.authenticatedUsername && !this.allowAnon) {
            if (this.urlInfo.pathname !== '/login') {
              throw this.redirectToLogin(this.url);
            }
          }
        }

        // Check ACL permission
        var hasPermission = this.method === "POST"
          || await this.store.sql.checkACLPermission(
            this.authenticatedUser?.user_id,
            entityType,
            decodedEntityName,
            permissionName,
            entity?.owner_id
          );

        if (!hasPermission && !hasAnonymousAccess) {
          throw this.sendEmpty(403);
        }
      }
    }
  }
  redirectToLogin(returnUrl: string) {

    var validReturnUrlRegex = /^\/(?!.*\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|json)$).*$/;
    var sanitizedReturnUrl = '/';  // Default to home page

    if (validReturnUrlRegex.test(returnUrl)) {
      sanitizedReturnUrl = returnUrl;
      this.setHeader('Set-Cookie', `returnUrl=${encodeURIComponent(sanitizedReturnUrl)}; HttpOnly; Secure; SameSite=Strict; Path=/`);
    } else {
      console.log(`Invalid return URL detected: ${returnUrl}. Redirecting to home page.`);
    }
    const loginUrl = '/login';
    return this.redirect(loginUrl);

  };
}

export class Authenticator {
  sqlTiddlerDatabase;
  constructor(state: StateObject) {
    this.sqlTiddlerDatabase = state.store.sql;
  }
  /** this is null to improve constant time. we still hash the password even if we discard it. */
  verifyPassword(inputPassword: string, storedHash: string | null) {
    var hashedInput = this.hashPassword(inputPassword);
    if (storedHash === null) return false;
    return hashedInput === storedHash;
  }
  hashPassword(password: string) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }
  async createSession(userId: number) {
    var sessionId = crypto.randomBytes(16).toString("hex");
    // Store the session in your database or in-memory store
    await this.sqlTiddlerDatabase.createUserSession(userId, sessionId);
    return sessionId;
  }
}
