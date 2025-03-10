import { IncomingHttpHeaders, OutgoingHttpHeaders } from "node:http";
import { Streamer } from "./streamer";
import { StateObject } from './StateObject';
import { createHash } from "node:crypto";
import * as zlib from "node:zlib";
import { ok } from "node:assert";
import { promisify } from "node:util";
import { Router } from "./router";
import { mkdirSync } from "node:fs";
import * as fs from "node:fs";
import * as path from "node:path";
/**
Options include:
- `cbPartStart(headers,name,filename)` - invoked when a file starts being received
- `cbPartChunk(chunk)` - invoked when a chunk of a file is received
- `cbPartEnd()` - invoked when a file finishes being received
- `cbFinished(err)` - invoked when the all the form data has been processed
*/
export function readMultipartData(this: StateObject<any, any>, options: {
  cbPartStart: (headers: IncomingHttpHeaders, name: string | null, filename: string | null) => void,
  cbPartChunk: (chunk: Buffer) => void,
  cbPartEnd: () => void,
  cbFinished: (err: Error | string | null) => void
}) {
  return new Promise<void>((resolve, reject) => {
    // Check that the Content-Type is multipart/form-data
    const contentType = this.headers['content-type'];
    if (!contentType?.startsWith("multipart/form-data")) {
      return reject("Expected multipart/form-data content type");
    }
    // Extract the boundary string from the Content-Type header
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      return reject("Missing boundary in multipart/form-data");
    }
    const boundary = boundaryMatch[1];
    const boundaryBuffer = Buffer.from("--" + boundary);
    // Initialise
    let buffer = Buffer.alloc(0);
    let processingPart = false;
    // Process incoming chunks
    this.reader.on("data", (chunk) => {
      // Accumulate the incoming data
      buffer = Buffer.concat([buffer, chunk]);
      // Loop through any parts within the current buffer
      while (true) {
        if (!processingPart) {
          // If we're not processing a part then we try to find a boundary marker
          const boundaryIndex = buffer.indexOf(boundaryBuffer);
          if (boundaryIndex === -1) {
            // Haven't reached the boundary marker yet, so we should wait for more data
            break;
          }
          // Look for the end of the headers
          const endOfHeaders = buffer.indexOf("\r\n\r\n", boundaryIndex + boundaryBuffer.length);
          if (endOfHeaders === -1) {
            // Haven't reached the end of the headers, so we should wait for more data
            break;
          }
          // Extract and parse headers
          const headersPart = Uint8Array.prototype.slice.call(buffer, boundaryIndex + boundaryBuffer.length, endOfHeaders).toString();
          const currentHeaders: IncomingHttpHeaders = {};
          headersPart.split("\r\n").forEach(headerLine => {
            const [key, value] = headerLine.split(": ");
            ok(typeof key === "string");
            currentHeaders[key.toLowerCase()] = value;
          });
          // Parse the content disposition header
          const contentDisposition: {
            name: string | null,
            filename: string | null
          } = {
            name: null,
            filename: null
          };
          if (currentHeaders["content-disposition"]) {
            // Split the content-disposition header into semicolon-delimited parts
            const parts = currentHeaders["content-disposition"].split(";").map(part => part.trim());
            // Iterate over each part to extract name and filename if they exist
            parts.forEach(part => {
              if (part.startsWith("name=")) {
                // Remove "name=" and trim quotes
                contentDisposition.name = part.substring(6, part.length - 1);
              } else if (part.startsWith("filename=")) {
                // Remove "filename=" and trim quotes
                contentDisposition.filename = part.substring(10, part.length - 1);
              }
            });
          }
          processingPart = true;
          options.cbPartStart(currentHeaders, contentDisposition.name, contentDisposition.filename);
          // Slice the buffer to the next part
          buffer = Buffer.from(buffer, endOfHeaders + 4);
        } else {
          const boundaryIndex = buffer.indexOf(boundaryBuffer);
          if (boundaryIndex >= 0) {
            // Return the part up to the boundary minus the terminating LF CR
            options.cbPartChunk(Buffer.from(buffer, 0, boundaryIndex - 2));
            options.cbPartEnd();
            processingPart = false;
            // this starts at the boundary marker, which gets picked up on the next loop
            buffer = Buffer.from(buffer, boundaryIndex);
          } else {
            // Return the rest of the buffer
            options.cbPartChunk(buffer);
            // Reset the buffer and wait for more data
            buffer = Buffer.alloc(0);
            break;
          }
        }
      }
    });

    // All done
    this.reader.on("end", () => {
      resolve();
    });
  }).then(() => {
    options.cbFinished(null);
  }, (err) => {
    options.cbFinished(err);
    throw err;
  });

}


/*
Process an incoming new multipart/form-data stream. Options include:

store - tiddler store
state - provided by server.js
response - provided by server.js
bag_name - name of bag to write to
callback - invoked as callback(err,results). Results is an array of titles of imported tiddlers
*/
/**
 * 
 * @param {Object} options 
 * @param {SqlTiddlerStore} options.store
 * @param {ServerState} options.state
 * @param {ServerResponse} options.response
 * @param {string} options.bag_name
 * @param {function} options.callback
 */
export async function processIncomingStream(
  this: StateObject,
  bag_name: PrismaField<"Bags", "bag_name">,
): Promise<string[]> {
  const state = this;
  // Process the incoming data
  const inboxName = new Date().toISOString().replace(/:/g, "-");
  const inboxPath = path.resolve(this.store.attachmentStore.storePath, "inbox", inboxName);
  createDirectory(inboxPath);
  let fileStream: { write: (arg0: any) => void; end: () => void; } | null = null; // Current file being written
  let hash: { update: (arg0: any) => void; finalize: () => any; } | null = null; // Accumulating hash of current part
  let length = 0; // Accumulating length of current part
  const parts: any[] = []; // Array of {name:, headers:, value:, hash:} and/or {name:, filename:, headers:, inboxFilename:, hash:} 


  const options = { callback: {} }
  await this.readMultipartData({
    cbPartStart: function (headers, name, filename) {
      const part: any = {
        name: name,
        filename: filename,
        headers: headers
      };
      if (filename) {
        const inboxFilename = (parts.length).toString();
        part.inboxFilename = path.resolve(inboxPath, inboxFilename);
        fileStream = fs.createWriteStream(part.inboxFilename);
      } else {
        part.value = "";
      }
      hash = new state.sjcl.hash.sha256();
      length = 0;
      parts.push(part)
    },
    cbPartChunk: function (chunk) {
      if (fileStream) {
        fileStream.write(chunk);
      } else {
        parts[parts.length - 1].value += chunk;
      }
      length = length + chunk.length;
      hash!.update(chunk);
    },
    cbPartEnd: function () {
      if (fileStream) {
        fileStream.end();
      }
      fileStream = null;
      parts[parts.length - 1].hash = state.sjcl.codec.hex.fromBits(hash!.finalize()).slice(0, 64).toString();
      hash = null;
    },
    // if an error is given here, it will also be thrown in the promise
    cbFinished: (err) => { }
  });

  const partFile = parts.find(part => part.name === "file-to-upload" && !!part.filename);
  if (!partFile) {
    throw await this.sendResponse(400, { "Content-Type": "text/plain" }, "Missing file to upload");
  }
  const type = partFile.headers["content-type"];
  const tiddlerFields = {
    title: partFile.filename,
    type: type
  };
  for (const part of parts) {
    const tiddlerFieldPrefix = "tiddler-field-";
    if (part.name.startsWith(tiddlerFieldPrefix)) {
      (tiddlerFields as any)[part.name.slice(tiddlerFieldPrefix.length)] = part.value.trim();
    }
  }

  await this.store.saveBagTiddlerWithAttachment(tiddlerFields, bag_name, {
    filepath: partFile.inboxFilename,
    type: type,
    hash: partFile.hash
  } as any).then(() => {
    deleteDirectory(inboxPath);
    return [tiddlerFields.title];
  }, err => {
    throw err;
  });

  return parts;
};



/*
Send a response to the client. This method checks if the response must be sent
or if the client alrady has the data cached. If that's the case only a 304
response will be transmitted and the browser will use the cached data.
Only requests with status code 200 are considdered for caching.
request: request instance passed to the handler
response: response instance passed to the handler
statusCode: stauts code to send to the browser
headers: response headers (they will be augmented with an `Etag` header)
data: the data to send (passed to the end method of the response instance)
encoding: the encoding of the data to send (passed to the end method of the response instance)
*/
export async function sendResponse(this: Router, state: StateObject<any, any>, statusCode: number, headers: OutgoingHttpHeaders, data: string | Buffer, encoding?: NodeJS.BufferEncoding) {
  if (this.enableBrowserCache && (statusCode == 200)) {
    var hash = createHash('md5');
    // Put everything into the hash that could change and invalidate the data that
    // the browser already stored. The headers the data and the encoding.
    hash.update(data);
    hash.update(JSON.stringify(headers));
    if (encoding) {
      hash.update(encoding);
    }
    var contentDigest = hash.digest("hex");
    // RFC 7232 section 2.3 mandates for the etag to be enclosed in quotes
    headers["Etag"] = '"' + contentDigest + '"';
    headers["Cache-Control"] = "max-age=0, must-revalidate";
    // Check if any of the hashes contained within the if-none-match header
    // matches the current hash.
    // If one matches, do not send the data but tell the browser to use the
    // cached data.
    // We do not implement "*" as it makes no sense here.
    var ifNoneMatch = state.headers["if-none-match"];
    if (ifNoneMatch) {
      var matchParts = ifNoneMatch.split(",").map(function (etag) {
        return etag.replace(/^[ "]+|[ "]+$/g, "");
      });
      if (matchParts.indexOf(contentDigest) != -1) {
        return state.sendEmpty(304, headers);
      }
    }
  }
  /*
  If the gzip=yes is set, check if the user agent permits compression. If so,
  compress our response if the raw data is bigger than 2k. Compressing less
  data is inefficient.
  */
  if (this.enableGzip && (data.length > 2048)) {
    var acceptEncoding = state.headers["accept-encoding"] || "";
    if (/\bdeflate\b/.test(acceptEncoding)) {
      headers["Content-Encoding"] = "deflate";
      data = await promisify(zlib.deflate)(data);
    } else if (/\bgzip\b/.test(acceptEncoding)) {
      headers["Content-Encoding"] = "gzip";
      data = await promisify(zlib.gzip)(data);
    }
  }
  if (typeof data === "string") {
    ok(encoding, "encoding must be set for string data");
    return state.sendString(statusCode, headers, data, encoding);
  } else {
    return state.sendBuffer(statusCode, headers, data);
  }
}


interface Route {
  useACL: any;
  method: string;
  entityName: any;
  csrfDisable: any;
  bodyFormat: string;
  path: { source: string; };
  handler: (streamer: Streamer) => void;
};

interface State {
  wiki: any;
  boot: any;
  server: any;
  urlInfo: any;
  queryParameters: any;
  pathPrefix: string;
  sendResponse: any;
  redirect: any;
  streamMultipartData: any;
  authenticatedUser: any;
  authenticatedUsername: any;
  authorizationType: string;
  allowAnon: boolean;
  anonAccessConfigured: boolean;
  allowAnonReads: boolean;
  allowAnonWrites: boolean;
  showAnonConfig: boolean;
  firstGuestUser: boolean;
  data?: any;
}

interface Server {
  enableBrowserCache: boolean;
  enableGzip: boolean;
  get: (key: string) => any;
  methodMappings: { [key: string]: string };
  isAuthorized: (authorizationType: string, username: string) => boolean;
  getAnonymousAccessConfig: () => { allowReads: boolean; allowWrites: boolean; isEnabled: boolean; showAnonConfig: boolean };
  sqlTiddlerDatabase: any;
  servername: string;
  findMatchingRoute: (request: Streamer, state: State) => Route;
  authenticateUser: (request: Streamer, response: Streamer) => any;
  methodACLPermMappings: { [key: string]: string };
  csrfDisable: boolean;
  wiki: any;
  boot: any;
}


export function is<T>(a: any, b: boolean): a is T { return b; }

/** Initiates a timer that must get cancelled before the current turn of the event loop ends */
export class SyncCheck {
  done;
  constructor() {
    let cancelled = false;
    const error = new Error("SyncCheck was not completed before the current turn of the event loop ended");
    process.nextTick(() => {
      if (cancelled) return;
      console.log(error);
      process.exit(1);
    });
    this.done = () => { cancelled = true };
  }
}


/** 
 * If any property returns a function, and that function returns a promise, 
 * the proxy will throw an error if the promise is not awaited before the next property access.
 * 
 * The stack trace of the error will point to the line where the promise was returned.
 */
export function createStrictAwaitProxy<T extends object>(instance: T): T {
  let outstandingPromiseError: Error | null = null;

  return new Proxy(instance, {
    get(target, prop, receiver) {
      // throw an error if an outstanding promise exists.
      if (outstandingPromiseError !== null) {
        throw outstandingPromiseError;
      }
      // Use Reflect.get to get the property value.
      const value = Reflect.get(target, prop, receiver);

      // If the property is a function, return a wrapped function.
      if (typeof value === "function") {
        return function (this: any, ...args: any[]) {
          // Protect against calling any methods while an outstanding promise exists.

          // Call the original function preserving the correct "this" context.
          const result = Reflect.apply(value, this, args);
          // If the result is a promise, wrap it to clear the outstanding lock on await.
          if (result instanceof Promise) {
            outstandingPromiseError = new Error(
              `Guarded promise returned by '${String(prop)}' was not awaited.`
            );
            return new Proxy(result, {
              get(promiseTarget, promiseProp, promiseReceiver) {
                // When the promise's then property is accessed (i.e. when it's awaited),
                // clear the outstanding promise so that subsequent method calls are allowed.
                if (promiseProp === "then") {
                  outstandingPromiseError = null;
                }
                return Reflect.get(promiseTarget, promiseProp, promiseReceiver).bind(promiseTarget);
              }
            });
          }
          return result;
        };
      }
      // For non-function properties, just return the value.
      return value;
    }
  });
}

export function tryParseJSON<T>(json: string): T | undefined {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}


export class TypedGenerator<T extends [any, any][]> {
  static checker<T extends [any, any][]>() {
    return {
      /** `const value1 = asV(1, yield asY(0, value0))` */
      asV<I extends number>(index: I, args: T[I][0]): T[I][0] { return args; },
      /** `const value1 = asV(1, yield asY(0, value0))` */
      asY<I extends number>(index: I, ret: T[I][1]): T[I][1] { return ret; },
    }
  }
  static wrapper<T extends [any, any][]>() {
    return <A extends any[]>(factory: (...args: A) => Generator<any, any, any>) => {
      return (...args: A) => new TypedGenerator<T>(factory(...args));
    };
  }
  constructor(private inner: Generator<any, any, any>, private index = 0) { }
  async next<I extends number>(index: I, ...args: T[I][0] extends void ? [] : [T[I][0]]): Promise<(
    T extends [...any[], T[I]] ? IteratorReturnResult<T[I][1]> : IteratorYieldResult<T[I][1]>
  )> {
    if (index !== this.index) throw new Error("Invalid index");
    this.index++;
    return this.inner.next(...args) as any;
  }
  return(value: any): any { this.inner.return(value); }
  throw(e: any): any { this.inner.throw(e); }
}

export async function mapAsync<T, U, V>(array: T[], callback: (this: V, value: T, index: number, array: T[]) => Promise<U>, thisArg?: any): Promise<U[]> {
  const results = new Array(array.length);
  for (let index = 0; index < array.length; index++) {
    results[index] = await callback.call(thisArg, array[index] as T, index, array);
  }
  return results;
};

export async function filterAsync<T, V>(array: T[], callback: (this: V, value: T, index: number, array: T[]) => Promise<boolean>, thisArg?: any): Promise<T[]> {
  const results = [];
  for (let index = 0; index < array.length; index++) {
    if (await callback.call(thisArg, array[index] as T, index, array)) {
      results.push(array[index]);
    }
  }
  return results as any;
}


export function truthy<T>(
  obj: T
): obj is Exclude<T, false | null | undefined | 0 | '' | void> {
  return !!obj;
}
