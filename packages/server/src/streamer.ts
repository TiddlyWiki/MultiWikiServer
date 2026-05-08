import * as http2 from 'node:http2';
import { SendOptions } from 'send';
import { Readable } from 'stream';
import * as http from 'node:http';
import { zodDecodeURIComponent } from './utils';
import { createReadStream } from 'node:fs';
import { PassThrough, Writable } from 'node:stream';
import { Compressor } from "./compression";
import { serverEvents } from '@tiddlywiki/events';
import { truthy } from './utils';
import { BodyFormat, HonoEnv, ParsedHonoRequest, RouteMatch } from './router';
import { zod } from './Z2';
import { MultipartPart, parseNodeMultipartStream } from '@mjackson/multipart-parser';
import { SendError, SendErrorReason, SendErrorReasonData } from './SendError';
import SuperHeaders, { SetCookie, SuperHeadersPropertyInit } from '@remix-run/headers';
import { URLSearchParamsTyped } from './URLSearchParamsTyped';
import { serveStatic, ServeStaticOptions } from '@hono/node-server/serve-static';
import { Context } from 'hono';
import { getConnInfo } from 'hono/cloudflare-workers';
import { contentType } from 'mime-types';
import { extname } from 'node:path';

declare module 'node:net' {
  interface Socket {
    // this comment gets prepended to the other comment for this property, thus the hanging sentance.
    /** Not defined on net.Socket instances. 
     * 
     * On tls.Socket instances,  */
    encrypted?: boolean;
  }
}

/** copied from /hono/src/helper/streaming/utils.ts */
let isOldBunVersion = (): boolean => {
  // @ts-expect-error @types/bun is not installed
  const version: string = typeof Bun !== 'undefined' ? Bun.version : undefined
  if (version === undefined) { return false }
  const result = version.startsWith('1.1') || version.startsWith('1.0') || version.startsWith('0.')
  // Avoid running this check on every call
  isOldBunVersion = () => result
  return result
}

export interface IncomingHttpHeaders extends http.IncomingHttpHeaders {
  "x-requested-with"?: string;
}

export interface SendFileOptions extends Omit<SendOptions, "root" | "dotfiles" | "index" | "start" | "end"> {
  root: string;
  reqpath: string;
  offset?: number;
  length?: number;
  on404?: () => Promise<typeof STREAM_ENDED>;
  onDir?: () => Promise<typeof STREAM_ENDED>;
  /** Index file to send, defaults to false. */
  index?: SendOptions["index"];
  /** @deprecated not implemented */
  prefix?: Buffer;
  /** @deprecated not implemented */
  suffix?: Buffer;
}

export type StreamerChunk = { data: string, encoding: NodeJS.BufferEncoding } | NodeJS.ReadableStream | Readable | Buffer;
export type GenericRequest = http.IncomingMessage | http2.Http2ServerRequest;
interface Http1ServerResponse
  extends
  Omit<http.ServerResponse, "writeHead">,
  Omit<Record<keyof http2.Http2ServerResponse, undefined>, keyof http.ServerResponse> {
  writeHead(statusCode: number, headers?: http.OutgoingHttpHeaders): this;
}
export type GenericResponse = Http1ServerResponse | http2.Http2ServerResponse;

class IterableHeaders implements Iterable<[string, string]> {
  constructor(private headers: string[]) { }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.headers.length; i += 2) {
      yield [this.headers[i], this.headers[i + 1]] as [string, string];
    }
  }
}

type StreamerHeadersInput = SuperHeadersPropertyInit & { [P in `x-${string}` | "Location"]?: string };

export class StreamerRequest {

  readonly host: string;
  readonly method: string;
  readonly urlInfo: URL;
  /** The request url with path prefix removed. */
  readonly url: string;
  /** The request headers. Never includes the four http2 headers, besides `:authority` as `host`. */
  readonly headers: SuperHeaders;
  // readonly cookies: Cookie;
  protected readonly compressor: Compressor | undefined;
  /** 
   * The path prefix is a essentially folder mount point. 
   * 
   * It starts with a slash, and ends without a slash (`"/dev"`). 
   * 
   * If there is not a prefix, it is an empty string (`""`). 
   */
  public readonly pathPrefix: string;
  /** This is based on the listener either having a key + cert or having secure set */
  public readonly assumeHTTPS: boolean;



  /** 
   * an *object from entries* of all the pathParams in the tree mapped to the path regex matches from that route.
   * 
   * Object.fromEntries takes the last value if there are duplicates, so conflicting names will have the last value in the path. 
   * 
   * Conflicting names would be defined on the route definitions, so just change the name there if there is a conflict.
   * 
   * pathParams are parsed with `decodeURIComponent` one time.
   */
  public pathParams: Record<string, string | undefined>;

  /** 
   * The query params. Because these aren't checked anywhere, 
   * the value includes undefined since it will be that if 
   * the key is not specified at all. 
   * 
   * This will always satisfy the zod schema: `z.record(z.string(), z.array(z.string()))`
   */
  public queryParams: Record<string, string[] | undefined>;

  public query: URLSearchParamsTyped<any>;

  // protected _req: GenericRequest;

  constructor(
    request: Omit<ParsedHonoRequest, "req">,
    /** The array of Route tree nodes the request matched. */
    public routePath: RouteMatch[],
    /** The bodyformat that ended up taking precedence. This should be correctly typed. */
    public bodyFormat: BodyFormat,
  ) {

    this.url = request.urlInfo.pathname + request.urlInfo.search;
    this.urlInfo = request.urlInfo;
    this.pathPrefix = request.pathPrefix;
    this.assumeHTTPS = request.secure;
    this.method = request.method;
    this.host = request.host;
    this.headers = request.headers;

    this.pathParams = request.pathParams;

    const pathParamsZodCheck = zod.record(zod.string(), zod.string().transform(zodDecodeURIComponent).optional()).safeParse(this.pathParams);
    if (!pathParamsZodCheck.success) console.log("BUG: Path params zod error", pathParamsZodCheck.error, this.pathParams);
    else this.pathParams = pathParamsZodCheck.data;

    this.queryParams = Object.fromEntries([...this.urlInfo.searchParams.keys()]
      .map(key => [key, this.urlInfo.searchParams.getAll(key)] as const));

    const queryParamsZodCheck = zod.record(zod.string(), zod.array(zod.string())).safeParse(this.queryParams);
    if (!queryParamsZodCheck.success) console.log("BUG: Query params zod error", queryParamsZodCheck.error, this.queryParams);
    else this.queryParams = queryParamsZodCheck.data;

    this.query = new URLSearchParams(this.urlInfo.searchParams);

  }

  get cookies() { return this.headers.cookie; }


  // get remoteFamily() { return this._req.socket.remoteFamily; }
  // get remoteAddress() { return this._req.socket.remoteAddress; }
  // get remotePort() { return this._req.socket.remotePort; }

  // get localFamily() { return this._req.socket.localFamily; }
  // get localAddress() { return this._req.socket.localAddress; }
  // get localPort() { return this._req.socket.localPort; }

  /** type-narrowing helper function. This affects anywhere T is used. */
  isBodyFormat(format: BodyFormat): boolean {
    return this.bodyFormat as BodyFormat === format;
  }
  /** Router always sets this unless the method is GET or HEAD or the bodyFormat is "stream" or "ignore". */
  dataBuffer?: Buffer;
  data: unknown;

  STREAM_ENDED: typeof STREAM_ENDED = STREAM_ENDED;

}

/**
 * The HTTP2 shims used in the request handler are only used for HTTP2 requests. 
 * The NodeJS HTTP2 server actually calls the HTTP1 parser for all HTTP1 requests. 
 */
export class Streamer extends StreamerRequest {
  static responseContexts = new WeakMap();
  constructor(
    request: ParsedHonoRequest,
    /** The array of Route tree nodes the request matched. */
    routePath: RouteMatch[],
    /** The bodyformat that ended up taking precedence. This should be correctly typed. */
    bodyFormat: BodyFormat,
    context: Context<HonoEnv, string, {}>,
    onResponse: (res: Response) => void,
  ) {
    super(request, routePath, bodyFormat);
    this.readBuffer = () => context.req.arrayBuffer().then(Buffer.from);
    this.readStream = () => context.req.raw.body && Readable.fromWeb(context.req.raw.body as any);
    this.readRawBody = () => context.req.raw.body;
    this.remoteAddress = getConnInfo(context).remote.address;

    class StreamerResponse {
      statusCode = 200
      headers = new SuperHeaders()
      setCookies: SetCookie[] = [];
      stream = new PassThrough();
      headersSent = false;
      constructor() {
        // this is the stream implementation of hono. 
        // we still have a lot of Node apis being used so we're not ready to switch yet.

        // const { readable, writable } = new TransformStream()
        // this.stream = new StreamingApi(writable, readable)
        // Streamer.responseContexts.set(this.stream.responseReadable, context);
        // // Until Bun v1.1.27, Bun didn't call cancel() on the ReadableStream for Response objects from Bun.serve()
        // if (isOldBunVersion()) {
        //   context.req.raw.signal.addEventListener('abort', () => {
        //     if (!this.stream.closed) { this.stream.abort() }
        //   })
        // }
      }

      private headersSentBy: Error | undefined;
      private checkHeadersSentBy() {
        if (this.headersSent && this.headersSentBy) {
          console.log(this.headersSentBy);
          console.log(new Error("This is the second attempt to send headers. Was it supposed to happen?"));
        } else if (this.headersSent) {
          console.log("Headers were already sent by an unknown source.");
        } else {
          this.headersSentBy = new Error("You appear to be sending headers more than once. This was the first attempt. Does it need to throw or return?")
        }
      }

      set finalResponse(res: Response) {
        this.checkHeadersSentBy();
        this.headersSent = true;
        onResponse(res);
      }
      /** 
       * Set status code and response headers using a super headers init object.  
       * 
       * - `set-cookie` headers are always appended to the array.
       * - known headers will be assigned the value directly and processed by SuperHeaders.
       * - unknown headers must start with x- and will only be lowercased. The value will be coerced to a string.
       */
      setHeaders = (status: number, headers: StreamerHeadersInput) => {
        this.statusCode = status
        function isHeaderProperty(key: string): key is string & keyof SuperHeadersPropertyInit {
          const descriptor = Object.getOwnPropertyDescriptor(SuperHeaders.prototype, key)
          return descriptor !== undefined && 'get' in descriptor && 'set' in descriptor
        }
        function isCustomHeader(key: string): key is string & `x-${string}` {
          return key.startsWith("x-" as const);
        }
        function asArray<T>(a: T): Array<T extends readonly any[] ? T[number] : T> {
          return Array.isArray(a) ? a : [a] as any;
        }
        for (let name of Object.getOwnPropertyNames(headers)) {
          if (name === "setCookie") {
            const value = asArray(headers.setCookie).filter(truthy)
              .map(e => typeof e === "string" ? SetCookie.from(e) : e)
            this.headers.setCookie.push(...value);
          } else if (isHeaderProperty(name)) {
            (this.headers as any)[name] = headers[name];
          } else if (isCustomHeader(name) || name === "Location") {
            if (headers[name])
              this.headers.set(name, `${headers[name]}`);
            else
              this.headers.delete(name);
          } else {
            throw new Error("Unrecognized header name. Must be either recognized or start with x-");
          }
        }
      }
      sendWriter = () => {
        this.finalResponse = new Response(Readable.toWeb(this.stream) as any, {
          status: this.statusCode,
          headers: this.headers,
        });
      }
      sendFile = async (
        status: number,
        headers: StreamerHeadersInput,
        options: ServeStaticOptions<HonoEnv>
      ) => {
        // set the user headers
        this.setHeaders(status, headers);
        type Data = string | ArrayBuffer | ReadableStream | Uint8Array<ArrayBuffer>;
        context.body = (body: Data) => {
          const headers = context.res.headers;
          this.setHeaders(status, {
            contentType: contentType(extname(request.urlInfo.pathname)) || undefined,
            contentLength: headers.get("content-length"),
            contentEncoding: headers.get("content-encoding"),
            contentRange: headers.get("content-range"),
            acceptRanges: headers.get("accept-rainges"),
          });
          const vary = headers.get("vary");
          if (vary) this.headers.append("vary", vary);
          // set status from sendFile because the developer could be calling this for any status code
          return new Response(body, {
            status: this.statusCode,
            headers: this.headers
          }) as ReturnType<typeof context.body>;
        }
        // get the file response
        this.finalResponse = await serveStatic(options)(context, async () => { }) || await context.notFound();
      }
    }
    this.res = new StreamerResponse();

  }

  readBuffer
  readStream
  readRawBody
  remoteAddress

  async readMultipartData(options: {
    cbPartStart: (part: MultipartPart) => Promise<void>;
    cbPartChunk: (part: MultipartPart, chunk: Buffer) => Promise<void>;
    cbPartEnd: (part: MultipartPart) => Promise<void>;
  }): Promise<void> {

    const contentType = this.headers.contentType;
    if (!contentType?.mediaType?.startsWith("multipart/"))
      throw new SendError("MULTIPART_INVALID_CONTENT_TYPE", 400, null);
    if (!contentType.boundary)
      throw new SendError("MULTIPART_MISSING_BOUNDARY", 400, null);

    for await (let part of parseNodeMultipartStream(this.readStream()!, {
      boundary: contentType.boundary,
      useContentPart: false,
      onCreatePart: async (part) => {
        part.append = async (chunk: Uint8Array) => {
          await options.cbPartChunk(part, Buffer.from(chunk));
        };
        await options.cbPartStart(part);
      }
    })) {
      await options.cbPartEnd(part);
    }
  }

  res;

  get writer(): Writable { return this.res.stream; }





  sendEmpty(status: number, headers: StreamerHeadersInput = {}): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendEmpty", status, headers);
    }
    this.writeHead(status, headers);
    this.writer.end();
    return STREAM_ENDED;
  }

  sendString(status: number, headers: StreamerHeadersInput, data: string, encoding: NodeJS.BufferEncoding): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendString", status, headers);
    }
    headers.contentLength = Buffer.byteLength(data, encoding);
    this.writeHead(status, headers);

    if (this.method === "HEAD")
      this.writer.end();
    else
      this.writer.end(data, encoding);

    return STREAM_ENDED;
  }

  sendBuffer(status: number, headers: StreamerHeadersInput, data: Buffer): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendBuffer", status, headers);
    }
    headers.contentLength = data.length;
    this.writeHead(status, headers);
    if (this.method === "HEAD")
      this.writer.end();
    else
      this.writer.end(data);
    return STREAM_ENDED;
  }
  /** If this is a HEAD request, the stream will be destroyed to prevent memory leaks. */
  sendStream(status: number, headers: StreamerHeadersInput, stream: Readable | ReadableStream | null): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendStream", status, headers);
    }
    this.writeHead(status, headers);
    if (stream && "pipeTo" in stream)
      stream = Readable.fromWeb(stream as import("stream/web").ReadableStream<any>);
    if (this.method === "HEAD") {
      stream?.destroy();
      this.writer.end();
    } else {
      if (stream) stream.pipe(this.writer);
      else this.writer.end();
    }
    return STREAM_ENDED;
  }


  // I'm not sure if there's a use case for this
  private sendFD(status: number, headers: StreamerHeadersInput, options: {
    fd: number;
    offset?: number;
    length?: number;
  }): typeof STREAM_ENDED {
    this.writeHead(status, headers);
    const { fd, offset, length } = options;
    const stream = createReadStream("", {
      fd,
      start: offset,
      end: length && length - 1,
      autoClose: false,
    });
    stream.pipe(this.writer);
    return STREAM_ENDED;
  }
  /** 
   * Sends a file with the appropriate cache headers, using the `send` npm module. 
   * 
   * Think of it like a static file server where you are serving files from a directory.
   * 
   * @param options.root The directory to serve files from.
   * @param options.reqpath The path to the file relative to the `root` directory.
   * @param options.offset The offset in bytes to start reading the file from.
   * @param options.length The number of bytes to read from the file.
   * @param options.index "index.html" by default, to disable this set false or 
   * to supply a new index pass a string or an array in preferred order. 
   * 
   * If an index.html file is not found, `send` will NOT generate a directory listing.
   * 
   * The `send` method will automatically set the `Content-Type` header based on the file extension.
   * 
   * If the file is not found, the `send` method will automatically send a 404 response.
   * 
  
   * @returns STREAM_ENDED
   */
  sendFile(status: number, headers: StreamerHeadersInput, options: SendFileOptions): typeof STREAM_ENDED {
    this.res.sendFile(status, headers, {
      path: options.reqpath,
      root: options.root,
      onNotFound: options.on404 ? () => { options.on404!(); } : undefined,
    });
    return STREAM_ENDED;
  }


  sendSSE(retryMilliseconds?: number) {
    if (retryMilliseconds !== undefined)
      if (typeof retryMilliseconds !== "number" || retryMilliseconds < 0)
        throw new Error("Invalid retryMilliseconds: must be a non-negative number");

    this.writeHead(200, {
      contentType: "text/event-stream",
      cacheControl: "no-cache, max-age=0",
      contentEncoding: "identity",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
    });

    this.writer.write(": This page is a server-sent event stream. It will continue loading until you close it.\n");
    this.writer.write(": https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events\n");
    this.writer.write("\n");

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
      if (this.writer.writableEnded)
        throw new Error("Cannot emit event after the stream has ended");

      const draining = this.writer.write([
        eventName && `event: ${eventName}`,
        `data: ${JSON.stringify(eventData)}`,
        eventId && `id: ${eventId}`,
        retryMilliseconds && `retry: ${retryMilliseconds}`,
      ].filter(truthy).join("\n") + "\n\n");
      if (!draining) return new Promise(r => this.writer.once("drain", r));
      else return;
    }
    const emitComment = (comment: string) => {
      this.writer.write(`: ${comment}\n\n`);
    }
    const onClose = (callback: () => void) => {
      this.writer.on("finish", callback);
    }
    const close = () => {
      this.writer.end();
    }

    serverEvents.on("exit", close);
    this.writer.on("finish", () => {
      serverEvents.off("exit", close);
    });

    return {
      /** Emit an SSE event */
      emitEvent,
      emitComment,
      onClose,
      close,
    };

  }

  /** 
   * this will pipe from the specified stream, but will not end the 
   * response when the input stream ends. Input stream errors will be 
   * caught and reject the promise. The promise will resolve once the
   * input stream ends.
   */

  async pipeFrom(stream: Readable) {
    stream.pipe(this.writer, { end: false });
    return new Promise<void>((r, c) => this.writer.on("unpipe", r).on("error", c));
  }

  /** sends a status and plain text string body */
  sendSimple(status: number, msg: string): typeof STREAM_ENDED {
    return this.sendString(status, {
      contentType: "text/plain"
    }, msg, "utf8");
  }
  /** Stringify the value (unconditionally) and send it with content-type `application/json` */
  sendJSON<T>(status: number, obj: T): typeof STREAM_ENDED {
    return this.sendString(status, {
      contentType: "application/json"
    }, JSON.stringify(obj), "utf8");
  }


  // RIP Push Stream. it was a great idea.
  // async pushStream(path: string) {
  //   return new Promise<Streamer>((resolve, reject) => {
  //     const req2: http2.Http2ServerRequest = this.req as any;
  //     if (!req2.stream || !req2.stream.pushAllowed) return reject();
  //     req2.stream.write
  //     const newRawHeaders = this.req.rawHeaders.slice();
  //     for (let i = 0; i < newRawHeaders.length; i += 2) {
  //       if (newRawHeaders[i] === ":method") newRawHeaders[i + 1] = "GET";
  //       if (newRawHeaders[i] === ":path") newRawHeaders[i + 1] = path;
  //     }
  //     req2.stream.pushStream({ ":method": "GET", ":path": path }, (err, pushStream, headers) => {
  //       if (err) return reject(err);
  //       const preq = new http2.Http2ServerRequest(pushStream, req2.headers, {}, newRawHeaders);
  //       const pres = new http2.Http2ServerResponse(pushStream);
  //       const pushStreamer = new Streamer(preq, pres, this.router);
  //       resolve(pushStreamer);
  //     });
  //   }).then(async streamer => {
  //     await this.router.handle(streamer);
  //     return streamer;
  //   }, (err) => { if (err) throw err; });
  // }



  sendError<REASON extends SendErrorReason>(
    status: SendErrorReasonData[REASON]["status"],
    reason: REASON,
    details: SendErrorReasonData[REASON]["details"],
  ): never {
    throw new SendError(reason, status, details);
  }

  /**
   *
   * Sends a **302** status code and **Location** header to the client.
   * 
   * This will add the path prefix to the redirect path
   * 
   * - **301 Moved Permanently:** The resource has been permanently moved to a new URL.
   * - **302 Found:** The resource is temporarily located at a different URL.
   * - **303 See Other:** Fetch the resource from another URI using a GET request.
   * - **307 Temporary Redirect:** The resource is temporarily located at a different URL; the same HTTP method should be used.
   * - **308 Permanent Redirect:** The resource has permanently moved; the client should use the new URL in future requests.
   */
  redirect(location: string): typeof STREAM_ENDED {
    return this.sendEmpty(302, { 'Location': this.pathPrefix + location });
  }


  setCookie(options: {
    name: string,
    value: string,
    /**
   
      Defines the host to which the cookie will be sent.
   
      Only the current domain can be set as the value, or a domain of a higher order, unless it is a public suffix. Setting the domain will make the cookie available to it, as well as to all its subdomains.
   
      If omitted, this attribute defaults to the host of the current document URL, not including subdomains.
   
      Contrary to earlier specifications, leading dots in domain names (.example.com) are ignored.
   
      Multiple host/domain values are not allowed, but if a domain is specified, then subdomains are always included.
   
     */
    domain?: string;
    /**
   
    Indicates the path that must exist in the requested URL for the browser to send the Cookie header.
   
    The forward slash (`/`) character is interpreted as a directory separator, and subdirectories are matched as well. 
    
    For example, for `Path=/docs`,
   
    - the request paths `/docs`,` /docs/`, `/docs/Web/`, and `/docs/Web/HTTP` will all match.
    - the request paths `/`, `/docsets`, `/fr/docs` will not match.
   
     */
    path?: string;
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    /**
      Controls whether or not a cookie is sent with cross-site requests: that is, requests originating from a different site, including the scheme, from the site that set the cookie. This provides some protection against certain cross-site attacks, including cross-site request forgery (CSRF) attacks.
   
      The possible attribute values are:
   
      ### Strict
   
      Send the cookie only for requests originating from the same site that set the cookie.
   
      ### Lax
   
      Send the cookie only for requests originating from the same site that set the cookie, and for cross-site requests that meet both of the following criteria:
   
      - The request is a top-level navigation: this essentially means that the request causes the URL shown in the browser's address bar to change.
   
        - This would exclude, for example, requests made using the fetch() API, or requests for subresources from <img> or <script> elements, or navigations inside <iframe> elements.
   
        - It would include requests made when the user clicks a link in the top-level browsing context from one site to another, or an assignment to document.location, or a <form> submission.
   
      - The request uses a safe method: in particular, this excludes POST, PUT, and DELETE.
   
      Some browsers use Lax as the default value if SameSite is not specified: see Browser compatibility for details.
   
      > Note: When Lax is applied as a default, a more permissive version is used. In this more permissive version, cookies are also included in POST requests, as long as they were set no more than two minutes before the request was made.
   
      ### None
   
      Send the cookie with both cross-site and same-site requests. The Secure attribute must also be set when using this value.
     */
    sameSite?: "Strict" | "Lax" | "None";
  }) {
    // var cookie = `${name}=${encodeURIComponent(value)}`;
    // if (options.domain) cookie += `; Domain=${options.domain}`;
    // if (options.path) cookie += `; Path=${options.path}`;
    // if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    // if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    // if (options.secure) cookie += `; Secure`;
    // if (options.httpOnly) cookie += `; HttpOnly`;
    // if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    this.res.headers.setCookie.push(new SetCookie(options));
  }

  /**
   * 
   * Sets a single header value. If the header already exists in the to-be-sent
   * headers, its value will be replaced.
   * 
   */
  setHeader(name: string, value: string): void {
    this.res.headers.set(name, value);
  }
  writeHead(status: number, headers: StreamerHeadersInput = {}): void {

    this.res.setHeaders(status, headers);
    this.res.sendWriter();
  }
  /**
   * Write early hints using 103 Early Hints, 
   * silently ignored if the request version is prior to 2.
   * 
   * Despite this being an HTTP/1.1 feature, not all browsers
   * correctly implemented it, so this is commonly restricted 
   * to HTTP/2. 
   * 
   * @example
    state.writeEarlyHints({
      'link': [
        '</styles.css>; rel=preload; as=style',
        '</scripts.js>; rel=preload; as=script',
      ],
      'x-trace-id': 'id for diagnostics',
    });
   * @param hints 
   * @returns 
   */
  writeEarlyHints(hints: Record<string, string | string[]>) {
    // TODO: check this
    // if (this._req.httpVersionMajor > 1)
    //   this._res.writeEarlyHints(hints);
  }
  /*
  No handler sent headers before the promise resolved.
  https://branch.desktop:4201/main.js.map SendError: {"status":500,"reason":"REQUEST_DROPPED","details":null}
      at o.handleRoute (file:///home/cubes/client5/MultiWikiServer/packages/server/src/router.ts:200:13)
      at processTicksAndRejections (node:internal/process/task_queues:105:5)
      at o.handleStreamer (file:///home/cubes/client5/MultiWikiServer/packages/server/src/router.ts:133:14)
      at o.handleRequest (file:///home/cubes/client5/MultiWikiServer/packages/server/src/router.ts:73:5) {
    reason: 'REQUEST_DROPPED',
    status: 500,
    details: null
  }
  Somehow something tried to write after the stream was ended.
  It's involved in the dev server setup that I use in some projects 
  but I still have to figure out if this is a bug in mws server or in my project
  because it should not have crashed the server.
  Error: write after end
      at _write (node:internal/streams/writable:489:11)
      at Gzip.Writable.write (node:internal/streams/writable:510:10)
      at IncomingMessage.ondata (node:internal/streams/readable:1009:22)
      at IncomingMessage.emit (node:events:524:28)
      at IncomingMessage.Readable.read (node:internal/streams/readable:782:10)
      at flow (node:internal/streams/readable:1283:53)
      at resume_ (node:internal/streams/readable:1262:3)
      at processTicksAndRejections (node:internal/process/task_queues:90:21)
  */

  private pause: boolean = false;
  /** Writes to the stream, and if pause is indicated, returns a promise that resolves once the drain event emits. */
  async write(chunk: Buffer | string, encoding?: NodeJS.BufferEncoding): Promise<void> {
    const continueWriting = this.writeFast(chunk, encoding);
    if (!continueWriting) return new Promise<void>(resolve => this.writer.once("drain", () => { resolve(); }));
  }
  /** This differs from write in that it does not return a Promise or attach a drain listener to the stream */
  writeFast(chunk: Buffer | string, encoding?: NodeJS.BufferEncoding): boolean {
    return this.writer.write(typeof chunk === "string" ? Buffer.from(chunk, encoding) : chunk);
  }
  end(): typeof STREAM_ENDED {
    // console.log(this.writer.end.toString());
    this.writer.end();
    return STREAM_ENDED;
  }


  get headersSent() {
    return !!this.res.headersSent;
  }


}



