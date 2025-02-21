import "../jsglobal";
import * as http2 from 'node:http2';
import * as opaque from "@serenity-kit/opaque";
import send from 'send';
import { Readable } from 'stream';
import { createServer, IncomingMessage, Server, ServerResponse, IncomingHttpHeaders as NodeIncomingHeaders, OutgoingHttpHeaders } from 'node:http';
import { is } from './helpers';
import { createReadStream, readFileSync } from 'node:fs';
import { Writable } from 'node:stream';
import { AllowedMethod, AllowedMethods, Router } from './router';
import * as sql from "./store/sql-tiddler-database";
import * as assert from "assert";
okEntityType(sql.okEntityType);

var acl_id: number = {} as any;
okField("acl", "acl_id", acl_id);
const t: number = acl_id;

(global as any).ok = assert.ok;
(global as any).okEntityType = sql.okEntityType;
// (global as any).okType = sql.okType;
// (global as any).okTypeTruthy = sql.okTypeTruthy;
(global as any).okField = function (table: string, field: string, value: any) { };
(global as any).parseIntNull = function (str: string | null) {
  return str === null ? null : parseInt(str);
};
(global as any).parseIntNullSafe = function (str: string | null) {
  if (str === null) return { success: true, value: null };
  const val = parseInt(str);
  return { success: !isNaN(val), value: val };
};

export interface IncomingHttpHeaders extends NodeIncomingHeaders {
  "accept-encoding"?: string;
}
interface ListenerOptions {
  key?: Buffer
  cert?: Buffer
  port: number
  hostname?: string
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
  url: URL;
  headers: IncomingHttpHeaders;
  constructor(
    private req: IncomingMessage | http2.Http2ServerRequest,
    private res: ServerResponse | http2.Http2ServerResponse,
    private router: Router
  ) {

    this.headers = req.headers;
    if (is<http2.Http2ServerRequest>(req, req.httpVersionMajor > 1)) {
      this.req.headers.host = req.headers[":authority"];
    }
    if (!req.headers.host) throw new Error("This should never happen");
    if (!req.method) throw new Error("This should never happen");
    if (!req.url?.startsWith("/")) throw new Error("This should never happen");
    //https://httpwg.org/specs/rfc9110.html#status.501
    if (!is<AllowedMethod>(req.method, AllowedMethods.includes(req.method as any)))
      throw this.sendString(501, {}, "Method not supported", "utf8");
    this.host = req.headers.host;
    this.method = req.method;
    this.url = new URL(`https://${req.headers.host}${req.url}`);
    req.complete
  }

  get reader(): Readable { return this.req; }
  get writer(): Writable { return this.res; }

  throw(statusCode: number) {
    this.sendEmpty(statusCode);
    throw SYMBOL_IGNORE_ERROR;
  }

  catcher = (error: unknown) => {
    if (error === SYMBOL_IGNORE_ERROR) return;
    if (error === STREAM_ENDED) return;
    const tag = this.url.href;
    console.error(tag, error);
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
    this.res.writeHead(status, headers);
    this.res.end();
    return STREAM_ENDED;
  }

  sendString(status: number, headers: OutgoingHttpHeaders, data: string, encoding: NodeJS.BufferEncoding): typeof STREAM_ENDED {
    headers['content-length'] = Buffer.byteLength(data, encoding);
    this.res.writeHead(status, headers);
    this.res.end(data, encoding);
    return STREAM_ENDED;
  }

  sendBuffer(status: number, headers: OutgoingHttpHeaders, data: Buffer): typeof STREAM_ENDED {
    headers['content-length'] = data.length;
    this.res.writeHead(status, headers);
    this.res.end(data);
    return STREAM_ENDED;
  }

  sendStream(status: number, headers: OutgoingHttpHeaders, stream: Readable): typeof STREAM_ENDED {
    this.res.writeHead(status, headers);
    stream.pipe(this.res);
    return STREAM_ENDED;
  }
  // I'm not sure if there's a use case for this
  private sendFD(status: number, headers: OutgoingHttpHeaders, options: {
    fd: number;
    offset?: number;
    length?: number;
  }): typeof STREAM_ENDED {
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
    index?: string | boolean | string[] | undefined
  }): typeof STREAM_ENDED {
    // the headers and status have to be set on the response object before piping the stream
    this.res.statusCode = status;
    this.toHeadersMap(headers).forEach((v, k) => { this.res.appendHeader(k, v); });

    const { root, reqpath, offset, length } = options;

    const stream = send(this.req, reqpath, {
      dotfiles: "ignore",
      index: false,
      root,
      start: offset,
      end: length && length - 1,
    });

    stream.on("error", err => {
      if (err === 404) {
        this.sendEmpty(404);
      } else {
        this.sendEmpty(500);
      }
    });

    stream.pipe(this.res);
    return STREAM_ENDED;
  }
  end(): typeof STREAM_ENDED {
    this.res.end();
    return STREAM_ENDED;
  }

  get headersSent() {
    return this.res.headersSent;
  }
}

class ListenerHTTPS {
  server: http2.Http2SecureServer;
  constructor(router: Router, key: Buffer, cert: Buffer) {
    this.server = http2.createSecureServer({ key, cert, allowHTTP1: true, });
    this.server.on("request", (
      req: IncomingMessage | http2.Http2ServerRequest,
      res: ServerResponse | http2.Http2ServerResponse
    ) => {
      console.log("request");
      const streamer = new Streamer(req, res, router);
      router.handle(streamer).catch(streamer.catcher);
    });
  }

}

class ListenerHTTP {
  server: Server;
  /** Create an http1 server */
  constructor(router: Router) {
    this.server = createServer((req, res) => {
      const streamer = new Streamer(req, res, router);
      router.handle(streamer).catch(streamer.catcher);
    });
  }
}


function listenHandler(server: http2.Http2SecureServer | Server) {
  return () => {
    process.exitCode = 2;

    var addr = server.address();
    var bind = !addr ? "unknown" : typeof addr === 'string' ? 'pipe ' + addr : addr.address + ":" + addr.port;

    console.log('Server listening on ' + bind + ' 🚀');
    process.exitCode = 0;

  }
}

function errorHandler(server: http2.Http2SecureServer | Server, port: any) {
  return (error: NodeJS.ErrnoException) => {
    process.exitCode = 1;

    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = "";

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit();
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit();
        break;
      default:
        throw error;
    }
  }
}

async function setupServers(useHTTPS: boolean, port: number) {
  // await lazy-loaded or async models
  await opaque.ready;

  const { server } = useHTTPS
    ? new ListenerHTTPS(new Router(), readFileSync("./localhost.key"), readFileSync("./localhost.crt"))
    : new ListenerHTTP(new Router());
  server.on('error', errorHandler(server, port));
  server.on('listening', listenHandler(server));
  server.listen(port, "::");
}

setupServers(true, 5000);