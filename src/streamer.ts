import "./global";
import * as http2 from 'node:http2';
import send from 'send';
import { Readable } from 'stream';
import { IncomingMessage, ServerResponse, IncomingHttpHeaders as NodeIncomingHeaders, OutgoingHttpHeaders } from 'node:http';
import { is } from './utils';
import { createReadStream } from 'node:fs';
import { Writable } from 'node:stream';

declare module 'node:net' {
  interface Socket {
    // this comment gets prepended to the other comment for this property, thus the hanging sentance.
    /** Not defined on net.Socket instances. 
     * 
     * On tls.Socket instances,  */
    encrypted?: boolean;
  }
}


export interface IncomingHttpHeaders extends NodeIncomingHeaders {
  "accept-encoding"?: string;
}

export const SYMBOL_IGNORE_ERROR: unique symbol = Symbol("IGNORE_ERROR");
export const STREAM_ENDED: unique symbol = Symbol("STREAM_ENDED");


export type StreamerChunk = { data: string, encoding: NodeJS.BufferEncoding } | NodeJS.ReadableStream | Readable | Buffer;

/**
 * The HTTP2 shims used in the request handler are only used for HTTP2 requests. 
 * The NodeJS HTTP2 server actually calls the HTTP1 parser for all HTTP1 requests. 
 */
export class Streamer {
  host: string;
  method: AllowedMethod;
  urlInfo: URL;
  url: string;
  headers: IncomingHttpHeaders;
  isSecure: boolean;
  cookies: URLSearchParams;
  constructor(
    private req: IncomingMessage | http2.Http2ServerRequest,
    private res: ServerResponse | http2.Http2ServerResponse,
    public pathPrefix: string,
  ) {

    this.headers = req.headers;

    this.url = req.url as string;
    if (!this.url.startsWith("/")) throw new Error("This should never happen");

    if (pathPrefix) {
      if (this.url === pathPrefix) {
        res.writeHead(302, { "location": req.url + "/" }).end();
        throw STREAM_ENDED;
      } else if (this.url.startsWith(pathPrefix)) {
        this.url = this.url.slice(pathPrefix.length);
      } else {
        res.writeHead(500, {}).end("The server is setup with a path prefix " + pathPrefix + ", but this request is outside of that prefix.", "utf8");
        throw STREAM_ENDED;
      }
    }

    if (is<http2.Http2ServerRequest>(req, req.httpVersionMajor > 1))
      req.headers.host = req.headers[":authority"];
    if (!req.headers.host) throw new Error("This should never happen");
    this.host = req.headers.host;

    if (!req.method) throw new Error("This should never happen");
    if (!is<AllowedMethod>(req.method, AllowedMethods.includes(req.method as any))) {
      //https://httpwg.org/specs/rfc9110.html#status.501
      res.writeHead(501, {}).end("Method not supported", "utf8");
      throw STREAM_ENDED;
    }
    this.method = req.method;

    this.isSecure = !!req.socket.encrypted;
    this.urlInfo = new URL(`https://${this.headers.host}${this.url}`);

    this.cookies = this.parseCookieString(req.headers.cookie || "");
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


  parseCookieString(cookieString: string) {
    const cookies = new URLSearchParams();
    if (typeof cookieString !== 'string') throw new Error('cookieString must be a string');
    cookieString.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const key = parts[0]!.trim();
        const value = parts.slice(1).join('=').trim();
        cookies.append(key, decodeURIComponent(value));
      }
    });
    return cookies;
  }

  get reader(): Readable { return this.req; }
  get writer(): Writable {
    // don't overwrite it here if it's already set because this could just be for sending the body.
    if (!this.headersSent && !this.headersSentBy)
      this.headersSentBy = new Error("Possible culprit was given access to the response object here.");
    return this.res;
  }

  throw(statusCode: number) {
    this.sendEmpty(statusCode);
    throw SYMBOL_IGNORE_ERROR;
  }

  catcher = (error: unknown) => {
    if (error === SYMBOL_IGNORE_ERROR) return;
    if (error === STREAM_ENDED) return;
    const tag = this.urlInfo.href;
    console.error(tag, error);
    if (!this.headersSent)
      this.sendEmpty(500, { "x-reason": "Internal Server Error (catcher)" });
  }

  checkHeadersSentBy(setError: boolean) {
    if (this.headersSent && this.headersSentBy) {
      console.log(this.headersSentBy);
      console.log(new Error("This is the second attempt to send headers. Was it supposed to happen?"));
    }
    else if (this.res.headersSent) console.log("Headers were sent by an unknown source.");
    // queue up the error in case there is a second attempt.
    else this.headersSentBy = new Error("You appear to be sending headers more than once. The first attempt was here. Does it need to throw or return?")
  }



  toHeadersMap(headers: { [x: string]: string | string[] | number | undefined }) {
    return new Map(Object.entries(headers).map(([k, v]) =>
      [k.toLowerCase(), Array.isArray(v) ? v : v === undefined ? [] : [v.toString()]]
    ));
  }

  readBody = () => new Promise<Buffer>((resolve: (chunk: Buffer) => void) => {
    const chunks: Buffer[] = [];

    this.reader.on('data', chunk => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
    this.reader.on('end', () => resolve(Buffer.concat(chunks)));
  });

  sendEmpty(status: number, headers: OutgoingHttpHeaders = {}): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendEmpty", status, headers);
    }
    this.checkHeadersSentBy(true);
    this.res.writeHead(status, headers);
    this.res.end();
    return STREAM_ENDED;
  }

  sendString(status: number, headers: OutgoingHttpHeaders, data: string, encoding: NodeJS.BufferEncoding): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendString", status, headers);
    }
    this.checkHeadersSentBy(true);
    headers['content-length'] = Buffer.byteLength(data, encoding);
    this.res.writeHead(status, headers);

    if (this.method === "HEAD")
      this.res.end();
    else
      this.res.end(data, encoding);

    return STREAM_ENDED;
  }

  sendBuffer(status: number, headers: OutgoingHttpHeaders, data: Buffer): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendBuffer", status, headers);
    }
    this.checkHeadersSentBy(true);
    headers['content-length'] = data.length;
    this.res.writeHead(status, headers);
    if (this.method === "HEAD")
      this.res.end();
    else
      this.res.end(data);
    return STREAM_ENDED;
  }
  /** If this is a HEAD request, the stream will be ignored AND LEFT OPEN. */
  sendStream(status: number, headers: OutgoingHttpHeaders, stream: Readable): typeof STREAM_ENDED {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendStream", status, headers);
    }
    this.checkHeadersSentBy(true);
    this.res.writeHead(status, headers);
    if (this.method === "HEAD")
      this.res.end();
    else
      stream.pipe(this.res);
    return STREAM_ENDED;
  }
  // I'm not sure if there's a use case for this
  private sendFD(status: number, headers: OutgoingHttpHeaders, options: {
    fd: number;
    offset?: number;
    length?: number;
  }): typeof STREAM_ENDED {
    this.checkHeadersSentBy(true);
    this.res.writeHead(status, headers);
    const { fd, offset, length } = options;
    const stream = createReadStream("", {
      fd,
      start: offset,
      end: length && length - 1,
      autoClose: false,
    });
    stream.pipe(this.res);
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
  sendFile(status: number, headers: OutgoingHttpHeaders, options: {
    root: string;
    reqpath: string;
    offset?: number;
    length?: number;
    index?: string | boolean | string[] | undefined,
    on404?: () => Promise<typeof STREAM_ENDED>;
    onDir?: () => Promise<typeof STREAM_ENDED>;
  }) {

    // the headers and status have to be set on the response object before piping the stream
    this.res.statusCode = status;
    this.toHeadersMap(headers).forEach((v, k) => { this.res.appendHeader(k, v); });

    const { root, reqpath, offset, length } = options;

    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("sendFile", root, reqpath, status, headers);
    }

    const stream = send(this.req, reqpath, {
      dotfiles: "ignore",
      index: false,
      root,
      start: offset,
      end: length && length - 1,
    });
    return new Promise<typeof STREAM_ENDED>((resolve, reject) => {

      stream.on("error", (err) => Promise.resolve().then(async (): Promise<typeof STREAM_ENDED> => {
        if (err === 404 || err?.statusCode === 404) {
          return (await options.on404?.()) ?? this.sendEmpty(404);
        } else {
          console.log(err);
          throw this.sendEmpty(500);
        }
      }).then(resolve, reject));

      stream.on("directory", () => Promise.resolve().then(async (): Promise<typeof STREAM_ENDED> => {
        return (await options.onDir?.())
          ?? this.sendEmpty(404, { "x-reason": "Directory listing not allowed" })
      }).then(resolve, reject));

      stream.on("end", () => {
        resolve(STREAM_ENDED);
      })

      this.checkHeadersSentBy(true);
      stream.pipe(this.res);
    });
  }

  setCookie(name: string, value: string, options: {
    domain?: string;
    path?: string;
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }) {
    var cookie = `${name}=${encodeURIComponent(value)}`;
    if (options.domain) cookie += `; Domain=${options.domain}`;
    if (options.path) cookie += `; Path=${options.path}`;
    if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options.secure) cookie += `; Secure`;
    if (options.httpOnly) cookie += `; HttpOnly`;
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    this.appendHeader("Set-Cookie", cookie);
  }

  appendHeader(name: string, value: string): void {
    const current = this.res.getHeader(name);
    this.res.setHeader(name,
      current
        ? Array.isArray(current)
          ? [...current as string[], value]
          : [current as string, value]
        : value
    );
  }

  setHeader(name: string, value: string): void {
    this.res.setHeader(name, value);
  }
  writeHead(status: number, headers: OutgoingHttpHeaders = {}): void {
    if (process.env.DEBUG?.split(",").includes("send")) {
      console.error("writeHead", status, headers);
    }
    this.checkHeadersSentBy(true);
    this.res.writeHead(status, headers);
  }
  write(chunk: Buffer | string, encoding?: NodeJS.BufferEncoding): void {
    // Between http1 and http2, the types are slightly different, but the runtime effect seems to be the same.
    encoding ? (this.res as ServerResponse).write(chunk, encoding) : (this.res as ServerResponse).write(chunk)
  }
  end(): typeof STREAM_ENDED {
    this.res.end();
    return STREAM_ENDED;
  }

  get headersSent() {
    return this.res.headersSent;
  }

  headersSentBy: Error | undefined;
}

/** 
 * This can be used as the basis of state objects and exposes the 
 * relevant streamer interface without allowing private members to be exposed. 
 * 
 */
export class StreamerState {

  readBody
  sendEmpty
  sendString
  sendBuffer
  sendStream
  sendFile
  setCookie
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
  sendSimple(status: number, msg: string): typeof STREAM_ENDED {
    return this.sendString(status, {
      "content-type": "text/plain"
    }, msg, "utf8");
  }
  /** Stringify the value (unconditionally) and send it with content-type `application/json` */
  sendJSON<T>(status: number, obj: T): typeof STREAM_ENDED {
    return this.sendString(status, {
      "content-type": "application/json"
    }, JSON.stringify(obj), "utf8");
  }


  STREAM_ENDED: typeof STREAM_ENDED = STREAM_ENDED;

  constructor(private streamer: Streamer) {
    this.readBody = this.streamer.readBody.bind(this.streamer);
    this.sendEmpty = this.streamer.sendEmpty.bind(this.streamer);
    this.sendString = this.streamer.sendString.bind(this.streamer);
    this.sendBuffer = this.streamer.sendBuffer.bind(this.streamer);
    this.sendStream = this.streamer.sendStream.bind(this.streamer);
    this.sendFile = this.streamer.sendFile.bind(this.streamer);
    this.setHeader = this.streamer.setHeader.bind(this.streamer);
    this.writeHead = this.streamer.writeHead.bind(this.streamer);
    this.write = this.streamer.write.bind(this.streamer);
    this.end = this.streamer.end.bind(this.streamer);
    this.setCookie = this.streamer.setCookie.bind(this.streamer);

  }


  get url() { return this.streamer.url; }
  get method(): AllowedMethod { return this.streamer.method; }
  get headers() { return this.streamer.headers; }
  get host() { return this.streamer.host; }
  get urlInfo() { return this.streamer.urlInfo; }
  get headersSent() { return this.streamer.headersSent; }

  get reader() { return this.streamer.reader; }

  /** Currently this is based on whether the socket is secure, so a proxy will cause problems. */
  get isSecure() { return this.streamer.isSecure; }
  get cookies() { return this.streamer.cookies; }

  /** 
   * The path prefix is a essentially folder mount point. 
   * 
   * It starts with a slash, and ends without a slash (`"/dev"`). 
   * 
   * If there is not a prefix, it is an empty string (`""`). 
   */
  get pathPrefix(): string {
    return this.streamer.pathPrefix;
  }

}


import { AllowedMethod, AllowedMethods, Router } from './routes/router';

