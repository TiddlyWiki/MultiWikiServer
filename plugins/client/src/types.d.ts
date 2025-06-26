declare module "prisma/global" {
    import type { Prisma } from "prisma-client";
    global {
        namespace PrismaJson {
            type Recipes_plugin_names = string[];
            type Recipe_bags_partitioned_bags = {
                /** partitioned bags allow each user with write access to write to `${title_prefix}${username}` */
                title_prefix: string;
                /**
                 * everyone with acl read can read all tiddlers
                 *
                 * if this is false, admins can still do this, but they will be in a restricted readonly mode.
                 */
                everyone_readable: boolean;
                /**
                 * everyone with acl write can write normal tiddlers.
                 *
                 * site and entity admins can always do this.
                 */
                normally_writable: boolean;
            };
        }
    }
    global {
        /**
         * This primarily makes sure that positional arguments are used correctly
         * (so you can't switch a title and bag_name around).
         *
         * If you assign the wrong value (like `5 as PrismaField<"Bags", "bag_name">`),
         * this will result in a type error on the as keyword, allowing you to catch incorrect types quickly.
        */
        type PrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>> = ([
            T,
            K
        ] extends ["Tiddlers", "bag_id"] ? PrismaField<"Bags", "bag_id"> : [
            T,
            K
        ] extends ["Sessions", "user_id"] ? PrismaField<"Users", "user_id"> : [
            T,
            K
        ] extends ["Recipe_bags", "bag_id"] ? PrismaField<"Bags", "bag_id"> : [
            T,
            K
        ] extends ["Recipe_bags", "recipe_id"] ? PrismaField<"Recipes", "recipe_id"> : [
            T,
            K
        ] extends ["Recipes", "owner_id"] ? PrismaField<"Users", "user_id"> : [
            T,
            K
        ] extends ["Bags", "owner_id"] ? PrismaField<"Users", "user_id"> : (PrismaPayloadScalars<T>[K] & {
            __prisma_table: T;
            __prisma_field: K;
        })) | (null extends PrismaPayloadScalars<T>[K] ? null : never);
        type PrismaPayloadScalars<T extends Prisma.ModelName> = Prisma.TypeMap["model"][T]["payload"]["scalars"];
    }
}
declare module "packages/events/src/index" {
    import EventEmitter from "events";
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
        emit: never;
        emitAsync<K>(eventName: keyof ServerEventsMap | K, ...args: K extends keyof ServerEventsMap ? ServerEventsMap[K] : never): Promise<void>;
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
    export const serverEvents: ServerEvents;
}
declare module "packages/commander/src/BaseCommand" {
    import * as commander from "commander";
    export type CommandClass = {
        new (...args: ConstructorParameters<typeof BaseCommand<any, any>>): BaseCommand<any, any>;
    };
    export type CommandFile = {
        Command: CommandClass;
        info: CommandInfo;
    };
    /**
     * The types for the BaseCommand are as follows:
     *
     * @example
     *
     * BaseCommand<Params, Options>
     * type Params = string[]
     * type Options = { [K: string]: string[] | boolean }
     *
     * @description
     *
     * - Params is all of the strings before the first option
     * - Options is a hashmap of each option, with either a boolean, or an array of strings.
     *
     * The option declaration in info determines how it is parsed.
     *
     * - For options declared with an argument, the value will be an array.
     *   - If no value is given, the array will be empty.
     *   - If the option is not present in the cli, it will not be added to the hashmap.
     * - For options declared without an argument, the value will be true or it will not be present.
     *
     *
     */
    export abstract class BaseCommand<P extends string[] = string[], O extends object = object> {
        params: P;
        options: O;
        constructor(params: P, options: O);
        abstract execute(): Promise<any>;
    }
    export interface CommandInfo {
        name: string;
        description: string;
        /** The values end up as an array in this.params, so the order is important. */
        arguments: [string, string][];
        /** The values end up in a hashmap of "key": "value", so order is only used in the help. */
        options?: [string, string][];
        internal?: boolean;
        getHelp?: () => string;
        command?(program: commander.Command): commander.Command;
    }
}
declare module "packages/commander/src/runCLI" {
    import { BaseCommand, CommandFile } from "packages/commander/src/BaseCommand";
    import * as commander from "commander";
    module "packages/events/src/index" {
        interface ServerEventsMap {
            "cli.register": [commands: Record<string, CommandFile>];
            "cli.commander": [commander.Command];
            "cli.execute.before": [
                name: string,
                params: string[],
                options: Record<string, string | boolean>,
                instance: BaseCommand
            ];
            "cli.execute.after": [
                name: string,
                params: string[],
                options: Record<string, string | boolean>,
                instance: BaseCommand
            ];
        }
    }
    /**
     * Run the following events in order:
     *
     * - `"cli.register"`
     * - `"cli.commander"`
     * - End here if help is requested or no command is specified
     * - `"cli.execute.before"`
     * - The specified command's `execute` method
     * - `"cli.execute.after"`
     */
    export function runCLI(): Promise<undefined>;
}
declare module "packages/commander/src/index" {
    export * from "packages/commander/src/BaseCommand";
    export * from "packages/commander/src/runCLI";
}
declare module "packages/server/src/utils" {
    export function is<T>(a: any, b: boolean): a is T;
    /** Initiates a timer that must get cancelled before the current turn of the event loop ends */
    export class SyncCheck {
        done: () => void;
        constructor();
    }
    /**
     * If any property returns a function, and that function returns a promise,
     * the proxy will throw an error if the promise is not awaited before the next property access.
     *
     * The stack trace of the error will point to the line where the promise was returned.
     */
    export function createStrictAwaitProxy<T extends object>(instance: T): T;
    export function tryParseJSON<T>(json: string): T | undefined;
    export class TypedGenerator<T extends [any, any][]> {
        private inner;
        private index;
        static checker<T extends [any, any][]>(): {
            /** `const value1 = asV(1, yield asY(0, value0))` */
            asV<I extends number>(index: I, args: T[I][0]): T[I][0];
            /** `const value1 = asV(1, yield asY(0, value0))` */
            asY<I extends number>(index: I, ret: T[I][1]): T[I][1];
        };
        static wrapper<T extends [any, any][]>(): <A extends any[]>(factory: (...args: A) => Generator<any, any, any>) => (...args: A) => TypedGenerator<T>;
        constructor(inner: Generator<any, any, any>, index?: number);
        next<I extends number>(index: I, ...args: T[I][0] extends void ? [] : [T[I][0]]): Promise<(T extends [...any[], T[I]] ? IteratorReturnResult<T[I][1]> : IteratorYieldResult<T[I][1]>)>;
        return(value: any): any;
        throw(e: any): any;
    }
    export function mapAsync<T, U, V>(array: T[], callback: (this: V, value: T, index: number, array: T[]) => Promise<U>, thisArg?: any): Promise<U[]>;
    export function filterAsync<T, V>(array: T[], callback: (this: V, value: T, index: number, array: T[]) => Promise<boolean>, thisArg?: any): Promise<T[]>;
    export class UserError extends Error {
        constructor(message: string);
    }
    /**
     * This returns the resolved path relative to the executing code file,
     * however it uses path.resolve, not require.resolve.
     */
    export function dist_resolve(filepath: string): string;
    export function dist_require_resolve(filepath: string): string;
    export interface JsonArray extends Array<JsonValue> {
    }
    export type JsonObject = {
        [Key in string]?: JsonValue;
    };
    export type JsonValue = string | number | boolean | JsonObject | JsonArray | null | Date;
}
declare module "packages/server/src/compression" {
    /*!
     * compression
     * Copyright(c) 2010 Sencha Inc.
     * Copyright(c) 2011 TJ Holowaychuk
     * Copyright(c) 2014 Jonathan Ong
     * Copyright(c) 2014-2015 Douglas Christopher Wilson
     * MIT Licensed
     */
    import { DuplexOptions, PassThrough } from "stream";
    import zlib, { BrotliOptions, ZlibOptions } from 'zlib';
    export interface CompressorOptions {
        /** Opts passed to brotli. The default quality param is 4. */
        brotli?: BrotliOptions;
        /** Opts passed to gzip */
        gzip?: ZlibOptions;
        /** Opts passed to deflate */
        deflate?: ZlibOptions;
        /** options to pass to the Passthrough stream used for identity encoding. */
        identity?: DuplexOptions;
        /**
         * source threshold below which to skip compression.
         * only works if content-length header is set.
         *
         * If a string, may be any number with a byte suffix (kb, mb, etc).
         */
        threshold?: number | string;
        /** use a specific encoding if the accept-encoding header is not present, defaults to identity */
        defaultEncoding?: 'br' | 'gzip' | 'deflate' | 'identity';
    }
    export class Compressor {
        private req;
        private res;
        constructor(req: import("http").IncomingMessage | import("http2").Http2ServerRequest, res: import("http").ServerResponse | import("http2").Http2ServerResponse, { identity, brotli, threshold, defaultEncoding, deflate, gzip }: CompressorOptions);
        /** Ends the response. Shortcut for easy removal when switching streams. */
        finisher: () => import("http").ServerResponse<import("http").IncomingMessage> | import("http2").Http2ServerResponse<import("http2").Http2ServerRequest>;
        enabled: boolean;
        method: string;
        threshold: any;
        defaultEncoding: "deflate" | "gzip" | "br" | "identity";
        ended: boolean;
        createStream: (method: string) => PassThrough;
        length: number;
        listeners: any[] | null;
        stream: PassThrough | zlib.Gzip | zlib.BrotliCompress | zlib.Deflate | undefined;
        shouldCompress(): boolean;
        /** This checks all of the headers that have been already set and sets up encoding. */
        beforeWriteHead(): void;
        splitStream(): Promise<void>;
        getEncodingMethod(supportedEncoding: readonly ('br' | 'gzip' | 'deflate' | 'identity')[]): 'br' | 'gzip' | 'deflate' | 'identity' | 'gzip-stream' | '';
    }
}
declare module "packages/server/src/streamer" {
    import * as http2 from 'node:http2';
    import { SendOptions } from 'send';
    import { Readable } from 'stream';
    import { IncomingMessage, ServerResponse, IncomingHttpHeaders as NodeIncomingHeaders, OutgoingHttpHeaders } from 'node:http';
    import { Writable } from 'node:stream';
    import { Compressor } from "packages/server/src/compression";
    module 'node:net' {
        interface Socket {
            /** Not defined on net.Socket instances.
             *
             * On tls.Socket instances,  */
            encrypted?: boolean;
        }
    }
    export interface IncomingHttpHeaders extends NodeIncomingHeaders {
        "x-requested-with"?: string;
    }
    export const SYMBOL_IGNORE_ERROR: unique symbol;
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
    export type StreamerChunk = {
        data: string;
        encoding: NodeJS.BufferEncoding;
    } | NodeJS.ReadableStream | Readable | Buffer;
    /**
     * The HTTP2 shims used in the request handler are only used for HTTP2 requests.
     * The NodeJS HTTP2 server actually calls the HTTP1 parser for all HTTP1 requests.
     */
    export class Streamer {
        private req;
        private res;
        pathPrefix: string;
        expectSecure: boolean;
        host: string;
        method: string;
        urlInfo: URL;
        url: string;
        headers: IncomingHttpHeaders;
        cookies: URLSearchParams;
        compressor: Compressor;
        constructor(req: IncomingMessage | http2.Http2ServerRequest, res: ServerResponse | http2.Http2ServerResponse, pathPrefix: string, expectSecure: boolean);
        parseCookieString(cookieString: string): URLSearchParams;
        get reader(): Readable;
        get writer(): Writable;
        throw(statusCode: number): void;
        catcher: (error: unknown) => void;
        checkHeadersSentBy(setError: boolean): void;
        toHeadersMap(headers: {
            [x: string]: string | string[] | number | undefined;
        }): Map<string, string[]>;
        readBody: () => Promise<Buffer<ArrayBufferLike>>;
        sendEmpty(status: number, headers?: OutgoingHttpHeaders): typeof STREAM_ENDED;
        sendString(status: number, headers: OutgoingHttpHeaders, data: string, encoding: NodeJS.BufferEncoding): typeof STREAM_ENDED;
        sendBuffer(status: number, headers: OutgoingHttpHeaders, data: Buffer): typeof STREAM_ENDED;
        /** If this is a HEAD request, the stream will be destroyed. */
        sendStream(status: number, headers: OutgoingHttpHeaders, stream: Readable): typeof STREAM_ENDED;
        private sendFD;
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
        sendFile(status: number, headers: OutgoingHttpHeaders, options: SendFileOptions): Promise<typeof STREAM_ENDED>;
        sendSSE(retryMilliseconds?: number): {
            /** Emit an SSE event */
            emitEvent: (eventName: string, eventData: any, eventId: string) => void;
            emitComment: (comment: string) => void;
            onClose: (callback: () => void) => void;
            close: () => void;
        };
        setCookie(name: string, value: string, options: {
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
        }): void;
        appendHeader(name: string, value: string): void;
        setHeader(name: string, value: string): void;
        writeHead(status: number, headers?: OutgoingHttpHeaders): void;
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
        writeEarlyHints(hints: Record<string, string | string[]>): void;
        pause: boolean;
        /** awaiting is not required. everything happens sync'ly */
        write(chunk: Buffer | string, encoding?: NodeJS.BufferEncoding): Promise<void>;
        end(): typeof STREAM_ENDED;
        /** Destroy the transport stream and possibly the entire connection. */
        destroy(): void;
        get headersSent(): boolean;
        headersSentBy: Error | undefined;
    }
    /**
     * This can be used as the basis of state objects and exposes the
     * relevant streamer interface without allowing private members to be exposed.
     *
     */
    export class StreamerState {
        protected streamer: Streamer;
        readBody: () => Promise<Buffer<ArrayBufferLike>>;
        sendEmpty: (status: number, headers?: OutgoingHttpHeaders) => typeof STREAM_ENDED;
        sendString: (status: number, headers: OutgoingHttpHeaders, data: string, encoding: NodeJS.BufferEncoding) => typeof STREAM_ENDED;
        sendBuffer: (status: number, headers: OutgoingHttpHeaders, data: Buffer) => typeof STREAM_ENDED;
        sendStream: (status: number, headers: OutgoingHttpHeaders, stream: Readable) => typeof STREAM_ENDED;
        sendFile: (status: number, headers: OutgoingHttpHeaders, options: SendFileOptions) => Promise<typeof STREAM_ENDED>;
        sendSSE: (retryMilliseconds?: number) => {
            /** Emit an SSE event */
            emitEvent: (eventName: string, eventData: any, eventId: string) => void;
            emitComment: (comment: string) => void;
            onClose: (callback: () => void) => void;
            close: () => void;
        };
        setCookie: (name: string, value: string, options: {
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
        }) => void;
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
        setHeader: (name: string, value: string) => void;
        writeHead: (status: number, headers?: OutgoingHttpHeaders) => void;
        writeEarlyHints: (hints: Record<string, string | string[]>) => void;
        write: (chunk: Buffer | string, encoding?: NodeJS.BufferEncoding) => Promise<void>;
        end: () => typeof STREAM_ENDED;
        /**
         * this will pipe from the specified stream, but will not end the
         * response when the input stream ends. Input stream errors will be
         * caught and reject the promise. The promise will resolve once the
         * input stream ends.
         */
        pipeFrom(stream: Readable): Promise<void>;
        /** sends a status and plain text string body */
        sendSimple(status: number, msg: string): typeof STREAM_ENDED;
        /** Stringify the value (unconditionally) and send it with content-type `application/json` */
        sendJSON<T>(status: number, obj: T): typeof STREAM_ENDED;
        /** End the compression stream, flushing the rest of the compressed data, then begin a brand new stream to concatenate. */
        splitCompressionStream(): Promise<void>;
        STREAM_ENDED: typeof STREAM_ENDED;
        constructor(streamer: Streamer);
        get url(): string;
        get method(): string;
        get headers(): IncomingHttpHeaders;
        get host(): string;
        get urlInfo(): URL;
        get headersSent(): boolean;
        get reader(): Readable;
        get cookies(): URLSearchParams;
        /** This is based on the listener either having a key + cert or having secure set */
        get expectSecure(): boolean;
        /**
         * The path prefix is a essentially folder mount point.
         *
         * It starts with a slash, and ends without a slash (`"/dev"`).
         *
         * If there is not a prefix, it is an empty string (`""`).
         */
        get pathPrefix(): string;
    }
}
declare module "packages/server/src/StateObject" {
    import { Streamer, StreamerState } from "packages/server/src/streamer";
    import { BodyFormat, Router } from "packages/server/src/router";
    import { RouteMatch } from "packages/server/src/router";
    import { IncomingHttpHeaders } from 'http';
    export interface ServerRequest<B extends BodyFormat = BodyFormat, M extends string = string, D = unknown> extends ServerRequestClass<B, M, D> {
    }
    export class ServerRequestClass<B extends BodyFormat = BodyFormat, M extends string = string, D = unknown> extends StreamerState {
        /** The bodyformat that ended up taking precedence. This should be correctly typed. */
        bodyFormat: B;
        protected router: Router;
        get method(): M;
        data: B extends "string" ? string : B extends "buffer" ? Buffer : B extends "www-form-urlencoded-urlsearchparams" ? URLSearchParams : B extends "stream" ? undefined : B extends "ignore" ? undefined : D;
        /**
         * an *object from entries* of all the pathParams in the tree mapped to the path regex matches from that route.
         *
         * Object.fromEntries takes the last value if there are duplicates, so conflicting names will have the last value in the path.
         *
         * Conflicting names would be defined on the route definitions, so just change the name there if there is a conflict.
         *
         * pathParams are parsed with `decodeURIComponent` one time.
         */
        pathParams: Record<string, string | undefined>;
        /**
         * The query params. Because these aren't checked anywhere,
         * the value includes undefined since it will be that if
         * the key is not specified at all.
         *
         * This will always satisfy the zod schema: `z.record(z.string(), z.array(z.string()))`
         */
        queryParams: Record<string, string[] | undefined>;
        constructor(streamer: Streamer, 
        /** The array of Route tree nodes the request matched. */
        routePath: RouteMatch[], 
        /** The bodyformat that ended up taking precedence. This should be correctly typed. */
        bodyFormat: B, router: Router);
        /** type-narrowing helper function. This affects anywhere T is used. */
        isBodyFormat<T extends B, S extends {
            [K in B]: ServerRequest<K, M, D>;
        }[T]>(format: T): this is S;
        /**
         * Checks the request and response headers and calculates the appropriate
         * encoding to use for the response. This may be checked early if you
         * can only support a subset of normal encodings or have precompressed data.
         */
        acceptsEncoding(encoding: ('br' | 'gzip' | 'deflate' | 'identity')[]): "" | "deflate" | "gzip" | "br" | "identity" | "gzip-stream";
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
        redirect(location: string): typeof STREAM_ENDED;
        /**
        Options include:
        - `cbPartStart(headers,name,filename)` - invoked when a file starts being received
        - `cbPartChunk(chunk)` - invoked when a chunk of a file is received
        - `cbPartEnd()` - invoked when a file finishes being received
        - `cbFinished(err)` - invoked when the all the form data has been processed, optional,
                              as it is called immediately before resolving or rejecting the promise.
                              The promise will reject with err if there is an error.
        */
        readMultipartData(this: ServerRequest<any, any>, options: {
            cbPartStart: (headers: IncomingHttpHeaders, name: string | null, filename: string | null) => void;
            cbPartChunk: (chunk: Buffer) => void;
            cbPartEnd: () => void;
            cbFinished?: (err: Error | string | null) => void;
        }): Promise<void>;
    }
}
declare module "packages/server/src/zodRoute" {
    import { JsonValue } from "packages/server/src/utils";
    import { BodyFormat } from "packages/server/src/router";
    import { ServerRequest } from "packages/server/src/StateObject";
    import { RouteDef } from "packages/server/src/router";
    import { Z2, zod as z } from "packages/server/src/Z2";
    import * as core from "zod/v4/core";
    export function zodRoute<M extends string, B extends "GET" | "HEAD" extends M ? "ignore" : BodyFormat, P extends Record<string, z.ZodType<any, string | undefined>>, Q extends Record<string, z.ZodType<any, string[] | undefined>>, T extends z.ZodTypeAny, R extends JsonValue>(route: ZodRoute<M, B, P, Q, T, R>): ZodRoute<M, B, P, Q, T, R>;
    export type FieldTypeGroups = "STRING" | "JSON";
    export interface ZodRoute<M extends string, B extends BodyFormat, P extends Record<string, z.ZodType<any, string | undefined>>, Q extends Record<string, z.ZodType<any, string[] | undefined>>, T extends z.ZodTypeAny, R extends JsonValue> {
        /**
         * The input will be `Record<string, string>`
         * If a path variable is not set in the request, the path will not match.
         *
         * Expects a Record of zod checks. Every path variable must be included.
         *
         * pathParams are parsed with `decodeURIComponent` one time before being passed to the zod check.
        */
        zodPathParams: (z: Z2<"STRING">) => P;
        /**
         * The input will be `Record<string, string[]>`.
         * If a value is not set, an empty string is used.
         *
         * Expects a Record of zod checks.
         *
         * The default behavior is to remove all query params.
         */
        zodQueryParams?: (z: Z2<"STRING">) => Q;
        /**
         * CORS preflight requests do not include credentials or request headers,
         * so you can't authenticate requests. It is a way to provide information about the endpoint.
         *
         * Be careful, because if you specify the same route with different methods, and set corsRequest
         * on more than one, because only the first one will actually be called.
         */
        corsRequest?: (state: ZodState<"OPTIONS", "ignore", P, Q, z.ZodUndefined>) => Promise<typeof STREAM_ENDED>;
        /**
         * A zod check of the request body result.
         *
         * Only valid for `string`, `json`, and `www-form-urlencoded` body types
         *
         * The default is `undefined` for those types.
         */
        zodRequestBody?: (z: B extends "www-form-urlencoded" ? Z2<"STRING"> : B extends "json" ? Z2<"JSON"> : Z2<any>) => T;
        securityChecks?: RouteDef["securityChecks"];
        method: M[];
        path: string;
        bodyFormat: B;
        inner: (state: {
            [K in M]: ZodState<K, B, P, Q, T>;
        }[M]) => Promise<R>;
    }
    export interface ZodState<M extends string, B extends BodyFormat, P extends Record<string, z.ZodType<any, string | undefined>>, Q extends Record<string, z.ZodType<any, string[] | undefined>>, T extends z.ZodTypeAny> extends ServerRequest<B, M, z.output<T>> {
        pathParams: z.output<z.ZodObject<P, core.$strict>> & Record<string, any>;
        queryParams: z.output<z.ZodObject<Q, core.$strict>> & Record<string, any>;
    }
    export type RouterRouteMap<T> = {
        [K in keyof T as T[K] extends ZodRoute<any, any, any, any, any, any> ? K : never]: T[K] extends ZodRoute<any, any, any, any, infer REQ, infer RES> ? ((data: z.input<REQ>) => Promise<jsonify<RES>>) : `${K & string} does not extend`;
    };
    export type jsonify<T> = T extends void ? null : T extends Promise<any> ? unknown : T extends Date ? string : T extends string | number | boolean | null | undefined ? T : T extends [...any[]] ? number extends T["length"] ? jsonify<T[number]>[] : [...jsonifyTuple<T>] : T extends Array<infer U> ? jsonify<U>[] : T extends object ? {
        [K in keyof T]: jsonify<T[K]>;
    } : unknown;
    export type jsonifyTuple<T> = T extends [infer A, ...infer B] ? [jsonify<A>, ...jsonifyTuple<B>] : T extends [infer A] ? [jsonify<A>] : [];
    export type RouterKeyMap<T, V> = {
        [K in keyof T as T[K] extends ZodRoute<any, any, any, any, any, any> ? K : never]: V;
    };
}
declare module "packages/server/src/Z2" {
    import * as z4 from "zod/v4";
    import { FieldTypeGroups } from "packages/server/src/zodRoute";
    export type _zod = typeof z4;
    export interface Z2<T extends FieldTypeGroups> extends _zod {
    }
    export { z4 as zod };
    export const Z2: Z2<any>;
}
declare module "packages/server/src/listeners" {
    import { IncomingMessage, Server, ServerResponse } from "node:http";
    import { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from "node:http2";
    import { Router } from "packages/server/src/router";
    export class ListenerBase {
        server: Http2SecureServer | Server;
        router: Router;
        bindInfo: string;
        options: ListenOptions;
        constructor(server: Http2SecureServer | Server, router: Router, bindInfo: string, options: ListenOptions);
        handleRequest(req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse): void;
    }
    export class ListenerHTTPS extends ListenerBase {
        constructor(router: Router, config: ListenOptions);
    }
    export class ListenerHTTP extends ListenerBase {
        /** Create an http1 server */
        constructor(router: Router, config: ListenOptions);
    }
    export interface ListenOptions {
        port?: string;
        host?: string;
        prefix?: string;
        key?: string;
        cert?: string;
        secure?: boolean;
        redirect?: number;
    }
}
declare module "packages/server/src/router" {
    import { zod } from "packages/server/src/Z2";
    import { ServerRequest, ServerRequestClass } from "packages/server/src/StateObject";
    import { Streamer } from "packages/server/src/streamer";
    import { IncomingMessage, ServerResponse } from "node:http";
    import { Http2ServerRequest, Http2ServerResponse } from "node:http2";
    import { ListenOptions } from "packages/server/src/listeners";
    export class Router {
        rootRoute: ServerRoute;
        allowedRequestedWithHeaders: string[];
        constructor(rootRoute: ServerRoute);
        handle(req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse, options: ListenOptions): void;
        handleRequest(req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse, options: ListenOptions): Promise<void>;
        handleStreamer(streamer: Streamer): Promise<void | typeof STREAM_ENDED>;
        /**
         * This is for overriding the server request that gets created. It is not async.
         * If you need to do anything substantial, use the server events.
         */
        createServerRequest<B extends BodyFormat>(streamer: Streamer, 
        /** The array of Route tree nodes the request matched. */
        routePath: RouteMatch[], 
        /** The bodyformat that ended up taking precedence. This should be correctly typed. */
        bodyFormat: B): ServerRequestClass<B, string, unknown>;
        handleRoute(state: ServerRequest<BodyFormat>, route: RouteMatch[]): Promise<void>;
        findRouteRecursive(routes: ServerRoute[], testPath: string, method: string | null, returnAll: boolean): RouteMatch[][];
        /**
         *
         * Top-level function that starts matching from the root routes.
         * Notice that the pathPrefix is assumed to have been handled beforehand.
         *
         * @param streamer
         * @returns The tree path matched
         */
        findRoute(streamer: Streamer): RouteMatch[];
    }
    export interface RouteMatch {
        route: ServerRoute;
        params: (string | undefined)[];
        remainingPath: string;
    }
    export const zodTransformJSON: (arg: string, ctx: zod.RefinementCtx) => any;
    export const BodyFormats: readonly ["stream", "string", "json", "buffer", "www-form-urlencoded", "www-form-urlencoded-urlsearchparams", "ignore"];
    export type BodyFormat = (typeof BodyFormats)[number];
    export interface RouteDef {
        /**
         * Regex to test the pathname on. It must start with `^`. If this is a child route,
         * it will be tested against the remaining portion of the parent route.
         */
        path: RegExp;
        pathParams?: string[];
        /**
         * The uppercase method names to match this route.
         *
         * If the array is empty and denyFinal is true, it will match all methods.
         *
         * If the array is empty and denyFinal is false, it will throw an error.
         */
        method: string[];
        /**
         * The highest bodyformat in the chain always takes precedent. Type-wise, only one is allowed,
         * but at runtime the first one found is the one used.
         *
         * Note that bodyFormat is completely ignored for GET and HEAD requests.
         */
        bodyFormat?: BodyFormat;
        /** If this route is the last one matched, it will NOT be called, and a 404 will be returned. */
        denyFinal?: boolean;
        securityChecks?: {
            /**
             * If true, the request must have the "x-requested-with" header set to "XMLHttpRequest".
             * This is a common way to check if the request is an AJAX request.
             * If the header is not set, the request will be rejected with a 403 Forbidden.
             */
            requestedWithHeader?: boolean;
        };
    }
    export interface ServerRoute extends RouteDef {
        /**
         * If this route's handler sends headers, the matched child route will not be called.
         */
        handler: (state: ServerRequest) => Promise<typeof STREAM_ENDED>;
        /**
         * ### ROUTING
         *
         * @param route The route definition.
         *
         * If the parent route sends headers, or returns the STREAM_ENDED symbol,
         * this route will not be called.
         *
         * Inner routes are matched on the remaining portion of the parent route
         * using `pathname.slice(match[0].length)`. If the parent route entirely
         * matches the pathname, this route will be matched on "/".
         *
         * If the body format is "stream", "buffer", "ignore" or not yet defined at this level in the tree,
         * then zod cannot be used.
         *
         * Note that GET and HEAD are always bodyFormat: "ignore", regardless of what is set here.
         */
        defineRoute: (route: RouteDef, handler: (state: ServerRequest) => Promise<symbol | void>) => ServerRoute;
    }
    export const ROOT_ROUTE: unique symbol;
    export function createRootRoute(method: string[], handler: (state: ServerRequest) => void): any;
}
declare module "packages/server/src/zodRegister" {
    import { ServerRequest } from "packages/server/src/StateObject";
    import { Z2 } from "packages/server/src/Z2";
    import { ServerRoute } from "packages/server/src/router";
    import { zod } from "packages/server/src/index";
    import * as core from "zod/v4/core";
    export const registerZodRoutes: (parent: ServerRoute, router: any, keys: string[]) => void;
    export function checkData<T extends core.$ZodType>(state: ServerRequest, zodRequestBody: (z: Z2<any>) => T): asserts state is ServerRequest & {
        data: zod.infer<T>;
    };
    export function checkQuery<T extends {
        [x: string]: core.$ZodType<unknown, string[] | undefined>;
    }>(state: ServerRequest, zodQueryParams: (z: Z2<"STRING">) => T): asserts state is ServerRequest & {
        queryParams: zod.infer<zod.ZodObject<T>>;
    };
    export function checkPath<T extends {
        [x: string]: core.$ZodType<unknown, string | undefined>;
    }>(state: ServerRequest, zodPathParams: (z: Z2<"STRING">) => T): asserts state is ServerRequest & {
        pathParams: zod.infer<zod.ZodObject<T>>;
    };
}
declare module "packages/server/src/index" {
    import { Router, type RouteMatch } from "packages/server/src/router";
    import { ListenerHTTP, ListenerHTTPS, ListenOptions } from "packages/server/src/listeners";
    import type { Streamer } from "packages/server/src/streamer";
    import type { IncomingMessage, ServerResponse } from "http";
    import type { Http2ServerRequest, Http2ServerResponse } from "http2";
    import type { ServerRequest } from "packages/server/src/StateObject";
    import { Z2 } from "packages/server/src/Z2";
    export * from "packages/server/src/listeners";
    export * from "packages/server/src/router";
    export * from "packages/server/src/StateObject";
    export * from "packages/server/src/streamer";
    export * from "packages/server/src/utils";
    export * from "packages/server/src/zodRegister";
    export * from "packages/server/src/zodRoute";
    export * from "packages/server/src/Z2";
    /**
     *
     * Runs the following events in order:
     * - `"zod.make"`
     */
    export function startup(): Promise<void>;
    export function startListening(router: Router, options?: ListenOptions[]): Promise<(ListenerHTTPS | ListenerHTTP)[]>;
    module "packages/events/src/index" {
        interface ServerEventsMap {
            "zod.make": [zod: Z2<any>];
            "request.middleware": [router: Router, req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse, options: ListenOptions];
            "request.streamer": [router: Router, streamer: Streamer];
            "request.state": [router: Router, state: ServerRequest, streamer: Streamer];
            "request.handle": [state: ServerRequest, route: RouteMatch[]];
            "request.fallback": [state: ServerRequest, route: RouteMatch[]];
            "exit": [];
        }
    }
    global {
        const STREAM_ENDED: unique symbol;
    }
}
declare module "packages/mws/src/services/PasswordService" {
    import { TypedGenerator } from "packages/server/src/index";
    export type PasswordService = Awaited<ReturnType<typeof createPasswordService>>;
    export function createPasswordService(serverSetup: string): Promise<{
        serverState: Map<string, TypedGenerator<LoginGeneratorStates>>;
        LoginGenerator: (args_0: {
            user_id: PrismaField<"Users", "user_id">;
            startLoginRequest: string;
            registrationRecord: string;
        }) => TypedGenerator<LoginGeneratorStates>;
        PasswordCreation: (userID: string, password: string) => Promise<string & {
            __prisma_table: "Users";
            __prisma_field: "password";
        }>;
        createRegistrationResponse: ({ userID, registrationRequest }: {
            userID: PrismaField<"Users", "user_id">;
            registrationRequest: string;
        }) => Promise<string>;
        startLoginSession: (stater: TypedGenerator<LoginGeneratorStates>) => Promise<string>;
        finishLoginSession: (loginSession: string) => Promise<TypedGenerator<LoginGeneratorStates> | undefined>;
    }>;
    type LoginGeneratorStates = [
        [
            void,
            loginResponse: string
        ],
        [
            finishLoginRequest: string,
            {
                user_id: PrismaField<"Users", "user_id">;
                session: {
                    sessionKey: string;
                } | undefined;
            }
        ]
    ];
}
declare module "packages/mws/src/services/cache" {
    import { TW } from "tiddlywiki";
    export function startupCache($tw: TW, cachePath: string): Promise<{
        pluginFiles: Map<string, string>;
        pluginHashes: Map<string, string>;
        filePlugins: Map<string, string>;
        requiredPlugins: string[];
        cachePath: string;
        prefix: Buffer<ArrayBuffer>;
        suffix: Buffer<ArrayBuffer>;
    }>;
    export type CacheState = ART<typeof startupCache>;
}
declare module "packages/mws/src/ServerState" {
    import { PrismaClient, Prisma } from "prisma-client";
    import { ITXClientDenyList } from "prisma-client/runtime/library";
    import { TW } from "tiddlywiki";
    import { createPasswordService } from "packages/mws/src/services/PasswordService";
    import { startupCache } from "packages/mws/src/services/cache";
    import { Types } from "prisma-client/runtime/client";
    /** This is an alias for ServerState in case we want to separate the two purposes. */
    export type SiteConfig = ServerState;
    export class ServerState {
        engine: PrismaEngineClient;
        PasswordService: PasswordService;
        pluginCache: TiddlerCache;
        constructor({ wikiPath, cachePath, storePath }: {
            wikiPath: string;
            cachePath: string;
            storePath: string;
        }, 
        /** The $tw instance needs to be disposable once commands are complete. */
        $tw: TW, engine: PrismaEngineClient, PasswordService: PasswordService, pluginCache: TiddlerCache);
        settings: {
            key: string;
            description: string;
            valueType: "string" | "boolean" | "number";
            value?: any;
        }[];
        init(): Promise<void>;
        initSettings(existing: Record<string, string>): Promise<void>;
        $transaction<R>(fn: (prisma: Omit<ServerState["engine"], ITXClientDenyList>) => Promise<R>, options?: {
            maxWait?: number;
            timeout?: number;
            isolationLevel?: Prisma.TransactionIsolationLevel;
        }): Promise<R>;
        $transactionTupleDebug<P extends Prisma.PrismaPromise<any>[]>(fn: (prisma: PrismaTxnClient) => [...P], options?: {
            isolationLevel?: Prisma.TransactionIsolationLevel;
        }): Promise<Types.Utils.UnwrapTuple<P>>;
        wikiPath: string;
        storePath: string;
        cachePath: string;
        versions: {
            tw5: any;
            mws: string;
        };
        setupRequired: boolean;
        enableExternalPlugins: boolean;
        enableGzip: boolean;
        attachmentsEnabled: boolean;
        attachmentSizeLimit: number;
        enableDevServer: boolean;
        enableDocsRoute: boolean;
        fieldModules: Record<string, import("tiddlywiki").TiddlerFieldModule>;
        contentTypeInfo: Record<string, ContentTypeInfo>;
        getContentType(type?: string): ContentTypeInfo;
    }
    global {
        type PrismaTxnClient = Omit<PrismaEngineClient, ITXClientDenyList>;
        type PrismaEngineClient = PrismaClient<Prisma.PrismaClientOptions, never, {
            result: {
                [T in Uncapitalize<Prisma.ModelName>]: {
                    [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                        compute: () => PrismaField<Capitalize<T>, K>;
                    };
                };
            };
            client: {};
            model: {};
            query: {};
        }>;
    }
    export interface ContentTypeInfo {
        encoding: string;
        extension: string | string[];
        flags?: string[];
        deserializerType?: string;
    }
    export type PasswordService = ART<typeof createPasswordService>;
    export type TiddlerCache = ART<typeof startupCache>;
}
declare module "packages/mws/src/RequestState" {
    import { Prisma } from 'prisma-client';
    import { Types } from 'prisma-client/runtime/library';
    import { ServerState } from "packages/mws/src/ServerState";
    import { BodyFormat, RouteMatch, Router, ServerRequestClass, Streamer } from "packages/server/src/index";
    export class StateObject<B extends BodyFormat = BodyFormat, M extends string = string, D = unknown> extends ServerRequestClass<B, M, D> {
        config: ServerState;
        user: import("packages/mws/src/services/sessions").AuthUser;
        engine: PrismaEngineClient;
        sendAdmin: () => Promise<symbol>;
        asserted: boolean;
        PasswordService: {
            serverState: Map<string, import("@tiddlywiki/server").TypedGenerator<[[void, loginResponse: string], [finishLoginRequest: string, {
                user_id: PrismaField<"Users", "user_id">;
                session: {
                    sessionKey: string;
                } | undefined;
            }]]>>;
            LoginGenerator: (args_0: {
                user_id: PrismaField<"Users", "user_id">;
                startLoginRequest: string;
                registrationRecord: string;
            }) => import("@tiddlywiki/server").TypedGenerator<[[void, loginResponse: string], [finishLoginRequest: string, {
                user_id: PrismaField<"Users", "user_id">;
                session: {
                    sessionKey: string;
                } | undefined;
            }]]>;
            PasswordCreation: (userID: string, password: string) => Promise<string & {
                __prisma_table: "Users";
                __prisma_field: "password";
            }>;
            createRegistrationResponse: ({ userID, registrationRequest }: {
                userID: PrismaField<"Users", "user_id">;
                registrationRequest: string;
            }) => Promise<string>;
            startLoginSession: (stater: import("@tiddlywiki/server").TypedGenerator<[[void, loginResponse: string], [finishLoginRequest: string, {
                user_id: PrismaField<"Users", "user_id">;
                session: {
                    sessionKey: string;
                } | undefined;
            }]]>) => Promise<string>;
            finishLoginSession: (loginSession: string) => Promise<import("@tiddlywiki/server").TypedGenerator<[[void, loginResponse: string], [finishLoginRequest: string, {
                user_id: PrismaField<"Users", "user_id">;
                session: {
                    sessionKey: string;
                } | undefined;
            }]]> | undefined>;
        };
        pluginCache: {
            pluginFiles: Map<string, string>;
            pluginHashes: Map<string, string>;
            filePlugins: Map<string, string>;
            requiredPlugins: string[];
            cachePath: string;
            prefix: Buffer<ArrayBuffer>;
            suffix: Buffer<ArrayBuffer>;
        };
        constructor(streamer: Streamer, routePath: RouteMatch[], bodyFormat: B, router: Router);
        okUser(): void;
        okAdmin(): void;
        $transaction<T>(fn: (prisma: PrismaTxnClient) => Promise<T>): Promise<T>;
        $transactionTuple<P extends Prisma.PrismaPromise<any>[]>(arg: (prisma: ServerState["engine"]) => [...P], options?: {
            isolationLevel?: Prisma.TransactionIsolationLevel;
        }): Promise<Types.Utils.UnwrapTuple<P>>;
        makeTiddlerEtag(options: {
            bag_name: string;
            revision_id: string | number;
        }): string;
        getRecipeACL(recipe_name: PrismaField<"Recipes", "recipe_name">, needWrite: boolean): Promise<{
            recipe: {
                recipe_id: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_id";
                };
            } | null;
            canRead: unknown;
            canWrite: unknown;
        }>;
        assertRecipeAccess(recipe_name: PrismaField<"Recipes", "recipe_name">, needWrite: boolean): Promise<void>;
        assertBagAccess(bag_name: PrismaField<"Bags", "bag_name">, needWrite: boolean): Promise<{
            owner_id: PrismaField<"Bags", "owner_id">;
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
        }>;
        getBagACL(bag_name: PrismaField<"Bags", "bag_name">, needWrite: boolean): Promise<{
            bag: {
                owner_id: PrismaField<"Bags", "owner_id">;
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
            } | null;
            canRead: unknown;
            canWrite: unknown;
        }>;
        /** If the user isn't logged in, user_id is 0. */
        getBagWhereACL({ recipe_id, permission, user_id, role_ids }: {
            /** Recipe ID can be provided as an extra restriction */
            recipe_id?: string;
            permission: ACLPermissionName;
            user_id: string;
            role_ids: string[];
        }): ({
            owner_id: {
                equals: string;
                not: null;
            };
            acl?: undefined;
        } | {
            acl: {
                some: {
                    permission: {
                        in: ("READ" | "WRITE" | "ADMIN")[];
                    };
                    role_id: {
                        in: string[];
                    };
                };
            };
            owner_id?: undefined;
        } | {
            owner_id: {
                equals: null;
                not: null;
            };
            acl?: undefined;
        } | {
            recipe_bags: {
                some: {
                    position: number | undefined;
                    recipe: {
                        OR: ({
                            owner_id: {
                                equals: string;
                                not: null;
                            };
                            acl?: undefined;
                        } | {
                            acl: {
                                some: {
                                    permission: {
                                        in: ("READ" | "WRITE" | "ADMIN")[];
                                    };
                                    role_id: {
                                        in: string[];
                                    };
                                };
                            };
                            owner_id?: undefined;
                        } | {
                            owner_id: {
                                equals: null;
                                not: null;
                            };
                            acl?: undefined;
                        })[];
                    };
                    with_acl: true;
                    recipe_id: string | undefined;
                };
            };
        })[];
        getWhereACL({ permission, user_id, role_ids }: {
            permission: ACLPermissionName;
            user_id?: string;
            role_ids?: string[];
        }): ({
            owner_id: {
                equals: string;
                not: null;
            };
            acl?: undefined;
        } | {
            acl: {
                some: {
                    permission: {
                        in: ("READ" | "WRITE" | "ADMIN")[];
                    };
                    role_id: {
                        in: string[];
                    };
                };
            };
            owner_id?: undefined;
        } | {
            owner_id: {
                equals: null;
                not: null;
            };
            acl?: undefined;
        })[];
    }
    export type ACLPermissionName = "READ" | "WRITE" | "ADMIN";
}
declare module "packages/mws/src/services/sessions" {
    import { jsonify, JsonValue, RouterKeyMap, ServerRoute, Streamer, Z2, zod, ZodRoute, ZodState } from "packages/server/src/index";
    import { ServerState } from "packages/mws/src/ServerState";
    export interface AuthUser {
        /** User ID. 0 if the user is not logged in. */
        user_id: PrismaField<"Users", "user_id">;
        /** User role_ids. This may have length even if the user isn't logged in, to allow ACL for anon. */
        role_ids: PrismaField<"Roles", "role_id">[];
        /** Username passed to the client */
        username: PrismaField<"Users", "username">;
        /** A session_id isn't guarenteed. There may be a session even if the user isn't logged in, and may not be even if they are, depending on the the situation. */
        sessionId: PrismaField<"Sessions", "session_id"> | undefined;
        /** Is this user considered a site-admin. This is determined by the auth service, not MWS. */
        isAdmin: boolean;
        /** Is the user logged in? This also means that user_id should be 0. role_ids may still be specified. */
        isLoggedIn: boolean;
    }
    export const SessionKeyMap: RouterKeyMap<SessionManager, true>;
    /**
     *
     * @param path path starting with a forward slash
     * @param zodRequest the zod for state.data
     * @param inner the handler to call
     * @returns the ZodRoute
     */
    export function zodSession<P extends string, T extends zod.ZodTypeAny, R extends JsonValue>(path: P, zodRequest: (z: Z2<"JSON">) => T, inner: (state: ZodState<"POST", "json", {}, {}, T>, prisma: PrismaTxnClient) => Promise<R>): ZodSessionRoute<P, T, R>;
    export interface ZodSessionRoute<PATH extends string, T extends zod.ZodTypeAny, R extends JsonValue> extends ZodRoute<"POST", "json", {}, {}, T, R> {
        path: PATH;
    }
    export type RouterPathRouteMap<T> = {
        [K in keyof T as T[K] extends ZodSessionRoute<any, any, any> ? K : never]: T[K] extends ZodSessionRoute<infer P, infer REQ, infer RES> ? {
            (data: zod.input<REQ>): Promise<jsonify<RES>>;
            path: P;
            key: K;
        } : never;
    };
    export type SessionManagerMap = RouterPathRouteMap<SessionManager>;
    export class SessionManager {
        static defineRoutes(root: ServerRoute): void;
        static parseIncomingRequest(streamer: Streamer, config: ServerState): Promise<AuthUser>;
        login1: ZodSessionRoute<"/login/1", zod.ZodObject<{
            username: zod.ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            }, string>>;
            startLoginRequest: zod.ZodString;
        }, zod.z.core.$strip>, {
            loginResponse: string;
            loginSession: string;
        }>;
        login2: ZodSessionRoute<"/login/2", zod.ZodObject<{
            finishLoginRequest: zod.ZodString;
            loginSession: zod.ZodString;
            skipCookie: zod.ZodDefault<zod.ZodOptional<zod.ZodBoolean>>;
        }, zod.z.core.$strip>, {
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            session_id: string & {
                __prisma_table: "Sessions";
                __prisma_field: "session_id";
            };
        }>;
        logout: ZodSessionRoute<"/logout", zod.ZodOptional<zod.ZodObject<{
            session_id: zod.ZodString;
            signature: zod.ZodString;
            skipCookie: zod.ZodBoolean;
        }, zod.z.core.$strip>>, null>;
    }
    export function assertSignature({ session_id, signature, session_key }: {
        session_id: string;
        signature: string;
        session_key: string;
    }): void;
}
declare module "packages/mws/src/services/setupDevServer" {
    import { ServerState } from "packages/mws/src/ServerState";
    import { ServerRequest } from "packages/server/src/index";
    export function setupDevServer(config: ServerState): Promise<(state: ServerRequest) => Promise<symbol>>;
    export function esbuildStartup(): Promise<{
        ctx: import("esbuild").BuildContext<{
            entryPoints: string[];
            bundle: true;
            target: string;
            platform: "browser";
            jsx: "automatic";
            outdir: string;
            minify: true;
            sourcemap: true;
            metafile: true;
            splitting: true;
            format: "esm";
        }>;
        port: number;
        result: import("esbuild").BuildResult<{
            entryPoints: string[];
            bundle: true;
            target: string;
            platform: "browser";
            jsx: "automatic";
            outdir: string;
            minify: true;
            sourcemap: true;
            metafile: true;
            splitting: true;
            format: "esm";
        }>;
        rootdir: string;
        publicdir: string;
    }>;
}
declare module "packages/mws/src/registerRequest" {
    import { Router, ServerRoute, BodyFormat } from "packages/server/src/index";
    import { StateObject } from "packages/mws/src/RequestState";
    import { ServerState } from "packages/mws/src/ServerState";
    import { AuthUser } from "packages/mws/src/services/sessions";
    import { setupDevServer } from "packages/mws/src/services/setupDevServer";
    import helmet from "helmet";
    module "packages/events/src/index" {
        /**
         * - "mws.router.init" event is emitted after setting the augmentations on Router.
         */
        interface ServerEventsMap {
            "mws.router.init": [router: Router];
            "mws.routes.important": [root: ServerRoute, config: ServerState];
            "mws.routes": [root: ServerRoute, config: ServerState];
            "mws.routes.fallback": [root: ServerRoute, config: ServerState];
        }
    }
    module "packages/server/src/index" {
        interface ServerRequest<B extends BodyFormat = BodyFormat, M extends string = string, D = unknown> extends StateObject<B, M, D> {
        }
        interface Router {
            config: ServerState;
            sendAdmin: ART<typeof setupDevServer>;
            helmet: ART<typeof helmet>;
        }
        interface Streamer {
            user: AuthUser;
        }
    }
}
declare module "packages/mws/src/db/sqlite-adapter" {
    import { SqlDriverAdapter, SqlMigrationAwareDriverAdapterFactory } from "@prisma/driver-adapter-utils";
    export class SqliteAdapter {
        private databasePath;
        private isDevMode;
        constructor(databasePath: string, isDevMode: boolean);
        adapter: SqlMigrationAwareDriverAdapterFactory;
        init(): Promise<void>;
        createMigrationsTable(libsql: SqlDriverAdapter): Promise<void>;
        checkMigrationsTable(libsql: SqlDriverAdapter, migrateExisting: boolean, applied_migrations: Set<string>, prismaFolder: string, initMigration: string): Promise<void>;
    }
}
declare module "packages/mws/src/services/tiddlywiki" {
    module "tiddlywiki" {
        interface TWUtils {
            eachAsync: (array: any[], callback: (item: any, index: number) => Promise<void>) => Promise<void>;
        }
        interface TWBoot {
        }
    }
    export function bootTiddlyWiki(wikiPath: string): Promise<import("tiddlywiki").TW>;
}
declare module "packages/mws/src/registerStartup" {
    import { TW } from "tiddlywiki";
    import { SqliteAdapter } from "packages/mws/src/db/sqlite-adapter";
    import { ServerState, TiddlerCache } from "packages/mws/src/ServerState";
    module "packages/events/src/index" {
        interface ServerEventsMap {
            "mws.init.before": [config: ServerState, $tw: TW];
            "mws.init.after": [config: ServerState, $tw: TW];
            "mws.adapter.init.before": [adapter: SqliteAdapter];
            "mws.adapter.init.after": [adapter: SqliteAdapter];
            "mws.cache.init.before": [cachePath: string, $tw: TW];
            "mws.cache.init.after": [cache: TiddlerCache, $tw: TW];
        }
    }
    module "packages/commander/src/index" {
        interface BaseCommand {
            config: ServerState;
            $tw: TW;
        }
    }
}
declare module "packages/mws/src/managers/TiddlerStore" {
    import { TiddlerFields } from "tiddlywiki";
    /**
     *
      @example
    
      const store = new TiddlerStore_PrismaBase(this.config.engine);
      await this.config.engine.$transaction(
        store.saveTiddlersFromPath_PrismaArray(...)
      );
    
      await this.config.engine.$transaction(async (prisma) => {
        const store = new TiddlerStore_PrismaTransaction(prisma);
        // use the store here
      });
     */
    export class TiddlerStore_PrismaBase {
        prisma: PrismaTxnClient;
        constructor(prisma: PrismaTxnClient);
        validateItemName(name: string, allowPrivilegedCharacters: boolean): "Not a valid string" | "Too long" | "Invalid character(s)" | null;
        validateItemNames(names: string[], allowPrivilegedCharacters: boolean): string | null;
        upsertRecipe_PrismaArray(recipe_name: PrismaField<"Recipes", "recipe_name">, description: PrismaField<"Recipes", "description">, bags: {
            bag_name: PrismaField<"Bags", "bag_name">;
            with_acl: PrismaField<"Recipe_bags", "with_acl">;
        }[], plugin_names: string[], { allowPrivilegedCharacters }?: {
            allowPrivilegedCharacters?: boolean;
        }): [import("prisma/client").Prisma.Prisma__RecipesClient<{
            recipe_id: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_id";
            };
        }, never, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>, import("prisma/client").Prisma.Prisma__RecipesClient<{
            description: string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            };
            recipe_id: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_id";
            };
            recipe_name: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            };
            owner_id: PrismaField<"Recipes", "owner_id">;
            plugin_names: PrismaJson.Recipes_plugin_names & {
                __prisma_table: "Recipes";
                __prisma_field: "plugin_names";
            };
            skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
            skip_core: PrismaField<"Recipes", "skip_core">;
        }, never, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>];
        upsertBag_PrismaPromise(bag_name: PrismaField<"Bags", "bag_name">, description: PrismaField<"Bags", "description">, { allowPrivilegedCharacters }?: {
            allowPrivilegedCharacters?: boolean;
        }): import("prisma/client").Prisma.Prisma__BagsClient<{
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
        }, never, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>;
        saveTiddlersFromPath_PrismaArray(bag_name: PrismaField<"Bags", "bag_name">, tiddlers: TiddlerFields[]): [import("prisma/client").Prisma.PrismaPromise<import("prisma/client").Prisma.BatchPayload>, ...(import("prisma/client").Prisma.PrismaPromise<import("prisma/client").Prisma.BatchPayload> | import("prisma/client").Prisma.Prisma__TiddlersClient<{
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }, never, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>)[]];
        saveBagTiddlerFields_PrismaArray(tiddlerFields: TiddlerFields, bag_name: PrismaField<"Bags", "bag_name">, attachment_hash: PrismaField<"Tiddlers", "attachment_hash">): [import("prisma/client").Prisma.PrismaPromise<import("prisma/client").Prisma.BatchPayload>, import("prisma/client").Prisma.Prisma__TiddlersClient<{
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }, never, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>];
        /**
          Returns {revision_id:} of the delete marker
          */
        deleteBagTiddler_PrismaArray(bag_name: PrismaField<"Bags", "bag_name">, title: PrismaField<"Tiddlers", "title">): [import("prisma/client").Prisma.PrismaPromise<import("prisma/client").Prisma.BatchPayload>, import("prisma/client").Prisma.Prisma__TiddlersClient<{
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }, never, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>];
    }
    export class TiddlerStore_PrismaTransaction extends TiddlerStore_PrismaBase {
        prisma: PrismaTxnClient;
        constructor(prisma: PrismaTxnClient);
        saveBagTiddlerFields(tiddlerFields: TiddlerFields, bag_name: PrismaField<"Bags", "bag_name">, attachment_hash: PrismaField<"Tiddlers", "attachment_hash">): Promise<{
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
        deleteBagTiddler(bag_name: PrismaField<"Bags", "bag_name">, title: PrismaField<"Tiddlers", "title">): Promise<{
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
        /**
        * Get the writable bag for the specified recipe.
        *
        * If title is specified, the tiddler will be included in bag.tiddlers, if it exists.
        *
        * The bag will still be returned even if the tiddler does not exist.
        */
        getRecipeWritableBag(recipe_name: PrismaField<"Recipes", "recipe_name">, title?: PrismaField<"Tiddlers", "title">): Promise<{
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            tiddlers: {
                title: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "title";
                };
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
                revision_id: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "revision_id";
                };
                is_deleted: PrismaField<"Tiddlers", "is_deleted">;
                attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
            }[];
        }>;
        getRecipeBagWithTiddler({ recipe_name, title }: {
            recipe_name: string;
            title: string;
        }): Promise<({
            recipe: {
                description: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "description";
                };
                recipe_id: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_id";
                };
                recipe_name: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_name";
                };
                owner_id: PrismaField<"Recipes", "owner_id">;
                plugin_names: PrismaJson.Recipes_plugin_names & {
                    __prisma_table: "Recipes";
                    __prisma_field: "plugin_names";
                };
                skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
                skip_core: PrismaField<"Recipes", "skip_core">;
            };
            bag: {
                description: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "description";
                };
                owner_id: PrismaField<"Bags", "owner_id">;
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
                bag_name: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_name";
                };
            };
        } & {
            position: number & {
                __prisma_table: "Recipe_bags";
                __prisma_field: "position";
            };
            recipe_id: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_id";
            };
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            with_acl: PrismaField<"Recipe_bags", "with_acl">;
            load_modules: PrismaField<"Recipe_bags", "load_modules">;
        }) | null>;
        getRecipeBags(recipe_name: PrismaField<"Recipes", "recipe_name">): Promise<{
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            position: number & {
                __prisma_table: "Recipe_bags";
                __prisma_field: "position";
            };
        }[]>;
        getBagTiddlers(bag_name: PrismaField<"Bags", "bag_name">, options?: {
            last_known_revision_id?: PrismaField<"Tiddlers", "revision_id">;
            include_deleted?: boolean;
        }): Promise<{
            bag_id: string;
            bag_name: string;
            tiddlers: {
                title: string;
                revision_id: string;
                is_deleted: boolean;
            }[];
        }>;
        getBagTiddlers_PrismaQuery(bag_name: PrismaField<"Bags", "bag_name">, options?: {
            last_known_revision_id?: PrismaField<"Tiddlers", "revision_id">;
            include_deleted?: boolean;
        }): import("prisma/client").Prisma.Prisma__BagsClient<{
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            tiddlers: {
                title: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "title";
                };
                revision_id: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "revision_id";
                };
                is_deleted: PrismaField<"Tiddlers", "is_deleted">;
            }[];
        } | null, null, {
            result: { [T in Uncapitalize<import("prisma/client").Prisma.ModelName>]: { [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
                compute: () => PrismaField<Capitalize<T>, K>;
            }; }; };
            client: {};
            model: {};
            query: {};
        }, import("prisma/client").Prisma.PrismaClientOptions>;
    }
}
declare module "packages/mws/src/commands/load-wiki-folder" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand<[string], {
        "bag-name"?: string[];
        "bag-description"?: string[];
        "recipe-name"?: string[];
        "recipe-description"?: string[];
        "overwrite"?: boolean;
    }> {
        execute(): Promise<null | undefined>;
    }
}
declare module "packages/mws/src/commands/save-archive" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        get archivePath(): string;
        prisma?: PrismaTxnClient;
        execute(): Promise<null>;
        getRecipes(): Promise<({
            recipe_bags: {
                position: number & {
                    __prisma_table: "Recipe_bags";
                    __prisma_field: "position";
                };
                recipe_id: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_id";
                };
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
                with_acl: PrismaField<"Recipe_bags", "with_acl">;
                load_modules: PrismaField<"Recipe_bags", "load_modules">;
            }[];
            acl: {
                recipe_id: string & {
                    __prisma_table: "RecipeAcl";
                    __prisma_field: "recipe_id";
                };
                acl_id: number & {
                    __prisma_table: "RecipeAcl";
                    __prisma_field: "acl_id";
                };
                role_id: string & {
                    __prisma_table: "RecipeAcl";
                    __prisma_field: "role_id";
                };
                permission: PrismaField<"RecipeAcl", "permission">;
            }[];
        } & {
            description: string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            };
            recipe_id: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_id";
            };
            recipe_name: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            };
            owner_id: PrismaField<"Recipes", "owner_id">;
            plugin_names: PrismaJson.Recipes_plugin_names & {
                __prisma_table: "Recipes";
                __prisma_field: "plugin_names";
            };
            skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
            skip_core: PrismaField<"Recipes", "skip_core">;
        })[]>;
        getBags(): Promise<{
            tiddlers: {
                fields: {
                    [k: string]: string & {
                        __prisma_table: "Fields";
                        __prisma_field: "field_value";
                    };
                };
                title: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "title";
                };
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
                revision_id: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "revision_id";
                };
                is_deleted: PrismaField<"Tiddlers", "is_deleted">;
                attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
            }[];
            acl: {
                acl_id: number & {
                    __prisma_table: "BagAcl";
                    __prisma_field: "acl_id";
                };
                role_id: string & {
                    __prisma_table: "BagAcl";
                    __prisma_field: "role_id";
                };
                permission: PrismaField<"BagAcl", "permission">;
                bag_id: string & {
                    __prisma_table: "BagAcl";
                    __prisma_field: "bag_id";
                };
            }[];
            description: string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            };
            owner_id: PrismaField<"Bags", "owner_id">;
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
        }[]>;
        getUsers(): Promise<({
            roles: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
            sessions: {
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
                created_at: Date & {
                    __prisma_table: "Sessions";
                    __prisma_field: "created_at";
                };
                session_id: string & {
                    __prisma_table: "Sessions";
                    __prisma_field: "session_id";
                };
                last_accessed: Date & {
                    __prisma_table: "Sessions";
                    __prisma_field: "last_accessed";
                };
                session_key: PrismaField<"Sessions", "session_key">;
            }[];
        } & {
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            email: string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            };
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            password: string & {
                __prisma_table: "Users";
                __prisma_field: "password";
            };
            created_at: Date & {
                __prisma_table: "Users";
                __prisma_field: "created_at";
            };
            last_login: PrismaField<"Users", "last_login">;
        })[]>;
        getRoles(): Promise<{
            description: PrismaField<"Roles", "description">;
            role_id: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            };
            role_name: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            };
        }[]>;
        saveArchive(): Promise<void>;
    }
}
declare module "packages/mws/src/commands/load-archive" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<void>;
    }
    /**
     * This is copied in from the tsup build types for this command, although built with
     * a modified PrismaField. This should represent the last form of the version 2
     * archive.
     */
    export interface Archiver2Saves {
        getRecipes(): Promise<({
            recipe_bags: {
                recipe_id: number;
                bag_id: number;
                with_acl: boolean;
                position: number;
            }[];
            acl: {
                role_id: number;
                recipe_id: number;
                permission: "READ" | "WRITE" | "ADMIN";
                acl_id: number;
            }[];
        } & {
            description: string;
            recipe_name: string;
            recipe_id: number;
            owner_id: number | null;
        })[]>;
        getBags(): Promise<{
            tiddlers: {
                fields: {
                    [k: string]: string;
                };
                bag_id: number;
                title: string;
                tiddler_id: number;
                is_deleted: boolean;
                attachment_hash: string | null;
            }[];
            acl: {
                role_id: number;
                bag_id: number;
                permission: "READ" | "WRITE" | "ADMIN";
                acl_id: number;
            }[];
            description: string;
            owner_id: number | null;
            bag_id: number;
            bag_name: string;
            is_plugin: boolean;
        }[]>;
        getUsers(): Promise<({
            roles: {
                role_id: number;
                role_name: string;
                description: string | null;
            }[];
            sessions: {
                user_id: number;
                created_at: Date;
                session_id: string;
                last_accessed: Date;
                session_key: string | null;
            }[];
            groups: {
                description: string | null;
                group_id: number;
                group_name: string;
            }[];
        } & {
            user_id: number;
            username: string;
            email: string;
            password: string;
            created_at: Date;
            last_login: Date | null;
        })[]>;
        getGroups(): Promise<({
            roles: {
                role_id: number;
                role_name: string;
                description: string | null;
            }[];
        } & {
            description: string | null;
            group_id: number;
            group_name: string;
        })[]>;
        getRoles(): Promise<{
            role_id: number;
            role_name: string;
            description: string | null;
        }[]>;
    }
}
declare module "packages/mws/src/commands/init-store" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<any>;
        setupStore(): Promise<void>;
    }
}
declare module "packages/mws/src/commands/manager" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<void>;
    }
}
declare module "packages/mws/src/commands/tests-complete" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<void>;
    }
}
declare module "packages/mws/src/commands/build-client" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<void>;
    }
}
declare module "packages/mws/src/managers/admin-utils" {
    import { JsonValue, Z2, zod, ZodState } from "packages/server/src/index";
    export function admin<T extends zod.ZodTypeAny, R extends JsonValue>(zodRequest: (z: Z2<"JSON">) => T, inner: (state: ZodState<"POST", "json", {}, {}, T>, prisma: PrismaTxnClient) => Promise<R>): import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, T, R>;
}
declare module "packages/mws/src/managers/admin-recipes" {
    import { RouterKeyMap, RouterRouteMap, ServerRequest, ServerRoute } from "packages/server/src/index";
    export const RecipeKeyMap: RouterKeyMap<RecipeManager, true>;
    export type RecipeManagerMap = RouterRouteMap<RecipeManager>;
    export class RecipeManager {
        static defineRoutes(root: ServerRoute): void;
        constructor();
        recipe_create_or_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            description: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            }, string>>;
            bag_names: import("zod/v4").ZodArray<import("zod/v4").ZodObject<{
                bag_name: import("zod/v4").ZodString;
                with_acl: import("zod/v4").ZodBoolean;
            }, import("zod/v4/core").$strip>>;
            plugin_names: import("zod/v4").ZodArray<import("zod/v4").ZodString>;
            owner_id: import("zod/v4").ZodOptional<import("zod/v4").ZodType<PrismaField<"Recipes", "owner_id">, string | null, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Recipes", "owner_id">, string | null>>>;
            skip_required_plugins: import("zod/v4").ZodType<PrismaField<"Recipes", "skip_required_plugins">, boolean, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Recipes", "skip_required_plugins">, boolean>>;
            skip_core: import("zod/v4").ZodType<PrismaField<"Recipes", "skip_core">, boolean, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Recipes", "skip_core">, boolean>>;
            create_only: import("zod/v4").ZodBoolean;
        }, import("zod/v4/core").$strip>, {
            description: string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            };
            recipe_id: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_id";
            };
            recipe_name: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            };
            owner_id: PrismaField<"Recipes", "owner_id">;
            plugin_names: PrismaJson.Recipes_plugin_names & {
                __prisma_table: "Recipes";
                __prisma_field: "plugin_names";
            };
            skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
            skip_core: PrismaField<"Recipes", "skip_core">;
        }>;
        bag_create_or_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            description: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            }, string>>;
            owner_id: import("zod/v4").ZodOptional<import("zod/v4").ZodType<PrismaField<"Bags", "owner_id">, string | null, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Bags", "owner_id">, string | null>>>;
            create_only: import("zod/v4").ZodBoolean;
        }, import("zod/v4/core").$strip>, {
            description: string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            };
            owner_id: PrismaField<"Bags", "owner_id">;
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
        }>;
        assertCreateOrUpdate({ existing, isCreate, owner_id, type, user }: {
            user: ServerRequest["user"];
            isCreate: boolean;
            owner_id?: PrismaField<"Users", "user_id"> | null;
            existing: {
                owner_id: PrismaField<"Users", "user_id"> | null;
            } | null;
            type: "recipe" | "bag";
        }): void;
        recipe_delete: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            recipe_name: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, null>;
        bag_delete: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            bag_name: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, null>;
        recipe_acl_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            acl: import("zod/v4").ZodArray<import("zod/v4").ZodObject<{
                role_id: import("zod/v4").ZodType<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string>>;
                permission: import("zod/v4").ZodEnum<{
                    READ: "READ";
                    WRITE: "WRITE";
                    ADMIN: "ADMIN";
                }>;
            }, import("zod/v4/core").$strip>>;
        }, import("zod/v4/core").$strip>, null>;
        bag_acl_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            acl: import("zod/v4").ZodArray<import("zod/v4").ZodObject<{
                role_id: import("zod/v4").ZodType<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string>>;
                permission: import("zod/v4").ZodEnum<{
                    READ: "READ";
                    WRITE: "WRITE";
                    ADMIN: "ADMIN";
                }>;
            }, import("zod/v4/core").$strip>>;
        }, import("zod/v4/core").$strip>, null>;
    }
}
declare module "packages/mws/src/managers/admin-users" {
    import { RouterKeyMap, RouterRouteMap, ServerRoute } from "packages/server/src/index";
    export const UserKeyMap: RouterKeyMap<UserManager, true>;
    export type UserManagerMap = RouterRouteMap<UserManager>;
    export class UserManager {
        static defineRoutes(root: ServerRoute): void;
        constructor();
        user_edit_data: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
        }, import("zod/v4/core").$strip>, {
            user: {
                username: string & {
                    __prisma_table: "Users";
                    __prisma_field: "username";
                };
                email: string & {
                    __prisma_table: "Users";
                    __prisma_field: "email";
                };
                roles: {
                    description: PrismaField<"Roles", "description">;
                    role_id: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_id";
                    };
                    role_name: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_name";
                    };
                }[];
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
                created_at: Date & {
                    __prisma_table: "Users";
                    __prisma_field: "created_at";
                };
                last_login: PrismaField<"Users", "last_login">;
            };
            allRoles: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
        }>;
        user_list: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodUndefined, {
            last_login: string | undefined;
            created_at: string;
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            email: string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            };
            roles: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
        }[]>;
        user_create: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            username: import("zod/v4").ZodString;
            email: import("zod/v4").ZodString;
            role_ids: import("zod/v4").ZodArray<import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string>>>;
        }, import("zod/v4/core").$strip>, {
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            created_at: Date & {
                __prisma_table: "Users";
                __prisma_field: "created_at";
            };
        }>;
        user_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
            username: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            }, string>>;
            email: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            }, string>>;
            role_ids: import("zod/v4").ZodArray<import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string>>>;
        }, import("zod/v4/core").$strip>, null>;
        user_delete: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
        }, import("zod/v4/core").$strip>, null>;
        user_update_password: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
            registrationRequest: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
            registrationRecord: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
            session_id: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
            signature: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
        }, import("zod/v4/core").$strip>, string | null>;
        role_create: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            role_name: import("zod/v4").ZodString;
            description: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, {
            description: PrismaField<"Roles", "description">;
            role_id: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            };
            role_name: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            };
        }>;
        role_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            role_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string>>;
            role_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            }, string>>;
            description: import("zod/v4").ZodType<PrismaField<"Roles", "description">, string | null, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Roles", "description">, string | null>>;
        }, import("zod/v4/core").$strip>, {
            description: PrismaField<"Roles", "description">;
            role_id: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            };
            role_name: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            };
        }>;
    }
}
declare module "packages/mws/src/managers/admin-settings" {
    import { RouterKeyMap, RouterRouteMap, ServerRoute } from "packages/server/src/index";
    export const SettingsKeyMap: RouterKeyMap<SettingsManager, true>;
    export type SettingsManagerMap = RouterRouteMap<SettingsManager>;
    class SettingsManager {
        static defineRoutes(root: ServerRoute): void;
        settings_read: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodUndefined, {
            value: (string & {
                __prisma_table: "Settings";
                __prisma_field: "value";
            }) | undefined;
            key: string;
            description: string;
            valueType: "string" | "boolean" | "number";
        }[]>;
        settings_update: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            key: import("zod/v4").ZodString;
            value: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, {
            success: true;
        }>;
    }
}
declare module "packages/mws/src/managers/WikiStateStore" {
    import { TiddlerStore_PrismaTransaction } from "packages/mws/src/managers/TiddlerStore";
    import { ServerRequest } from "packages/server/src/index";
    /** Basically a bunch of methods to help with wiki routes. */
    export class WikiStateStore extends TiddlerStore_PrismaTransaction {
        protected state: ServerRequest;
        constructor(state: ServerRequest, prisma: PrismaTxnClient);
        serveIndexFile(recipe_name: PrismaField<"Recipes", "recipe_name">): Promise<symbol>;
        private serveStoreTiddlers;
        serveBagTiddler(bag_id: PrismaField<"Bags", "bag_id">, bag_name: PrismaField<"Bags", "bag_name">, title: PrismaField<"Tiddlers", "title">): Promise<symbol>;
    }
}
declare module "packages/mws/src/managers/wiki-routes" {
    import { BodyFormat, JsonValue, RouterKeyMap, RouterRouteMap, ServerRoute, zod, ZodRoute } from "packages/server/src/index";
    export const WikiRouterKeyMap: RouterKeyMap<WikiRoutes, true>;
    export type TiddlerManagerMap = RouterRouteMap<WikiRoutes>;
    export interface WikiRoute<M extends string, B extends BodyFormat, P extends Record<string, zod.ZodType<any, string | undefined>>, Q extends Record<string, zod.ZodType<any, string[] | undefined>>, T extends zod.ZodTypeAny, R extends JsonValue> extends ZodRoute<M, B, P, Q, T, R> {
        routeType: "wiki" | "recipe" | "bag";
        routeName: string;
    }
    module "packages/events/src/index" {
        interface ServerEventsMap {
            "mws.tiddler.save": [
                {
                    recipe_name?: string;
                    bag_name: string;
                    title: string;
                    revision_id: string;
                }
            ];
            "mws.tiddler.delete": [
                {
                    recipe_name?: string;
                    bag_name: string;
                    title: string;
                    revision_id: string;
                }
            ];
        }
    }
    module "packages/server/src/index" {
        interface IncomingHttpHeaders {
            'last-event-id'?: string;
        }
    }
    export class WikiRoutes {
        static defineRoutes: (root: ServerRoute) => void;
        handleGetRecipeStatus: ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            isAdmin: boolean;
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            isLoggedIn: boolean;
            isReadOnly: boolean;
        }>;
        handleGetRecipeEvents: ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, {
            "first-event-id": zod.ZodOptional<zod.ZodArray<zod.ZodString>>;
        }, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, never>;
        handleGetBags: ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            position: number & {
                __prisma_table: "Recipe_bags";
                __prisma_field: "position";
            };
        }[]>;
        handleGetBagState: ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            bag_name: zod.ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
        }, {
            last_known_revision_id: zod.ZodOptional<zod.ZodArray<zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string>>>>;
            include_deleted: zod.ZodOptional<zod.ZodArray<zod.ZodEnum<{
                yes: "yes";
                no: "no";
            }>>>;
        }, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            bag_id: string;
            bag_name: string;
            tiddlers: {
                title: string;
                revision_id: string;
                is_deleted: boolean;
            }[];
        }>;
        handleGetAllBagStates: ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, {
            last_known_revision_id: zod.ZodOptional<zod.ZodArray<zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string>>>>;
            include_deleted: zod.ZodOptional<zod.ZodArray<zod.ZodEnum<{
                yes: "yes";
                no: "no";
            }>>>;
            gzip_stream: zod.ZodOptional<zod.ZodArray<zod.ZodEnum<{
                yes: "yes";
                no: "no";
            }>>>;
        }, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            bag_id: string;
            bag_name: string;
            position: number;
            tiddlers: {
                title: string;
                revision_id: string;
                is_deleted: boolean;
            }[];
        }[]>;
        handleLoadRecipeTiddler: ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            title: zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, never>;
        handleSaveRecipeTiddler: ZodRoute<"PUT", "string", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            title: zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodString, {
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
        handleDeleteRecipeTiddler: ZodRoute<"DELETE", "json", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            title: zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodUndefined, {
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
        handleFormMultipartRecipeTiddler: ZodRoute<"POST", "stream", {
            recipe_name: zod.ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            results: {
                revision_id: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "revision_id";
                };
                bag_name: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_name";
                };
            };
        }>;
        handleLoadBagTiddler: ZodRoute<"GET" | "HEAD", "ignore", {
            bag_name: zod.ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            title: zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, never>;
        handleSaveBagTiddler: ZodRoute<"PUT", "string", {
            bag_name: zod.ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            title: zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodString, {
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
        handleDeleteBagTiddler: ZodRoute<"DELETE", "ignore", {
            bag_name: zod.ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            title: zod.ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
        handleFormMultipartBagTiddler: ZodRoute<"POST", "stream", {
            bag_name: zod.ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, zod.z.core.$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
        }, Record<string, zod.ZodType<any, string[] | undefined, zod.z.core.$ZodTypeInternals<any, string[] | undefined>>>, zod.ZodType<unknown, unknown, zod.z.core.$ZodTypeInternals<unknown, unknown>>, {
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>;
    }
}
declare module "packages/mws/src/managers/index" {
    import "packages/mws/src/managers/admin-recipes";
    import "packages/mws/src/managers/admin-users";
    import "packages/mws/src/managers/admin-settings";
    import "packages/mws/src/managers/wiki-routes";
    import { RouterKeyMap, RouterRouteMap, ServerRoute } from "packages/server/src/index";
    export * from "packages/mws/src/managers/admin-recipes";
    export * from "packages/mws/src/managers/admin-users";
    export * from "packages/mws/src/managers/wiki-routes";
    export const StatusKeyMap: RouterKeyMap<StatusManager, true>;
    export type StatusManagerMap = RouterRouteMap<StatusManager>;
    export class StatusManager {
        static defineRoutes(root: ServerRoute): void;
        constructor();
        index_json: import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodUndefined, {
            bagList: ({
                _count: {
                    recipe_bags: number;
                    tiddlers: number;
                    acl: number;
                };
                acl: {
                    acl_id: number & {
                        __prisma_table: "BagAcl";
                        __prisma_field: "acl_id";
                    };
                    role_id: string & {
                        __prisma_table: "BagAcl";
                        __prisma_field: "role_id";
                    };
                    permission: PrismaField<"BagAcl", "permission">;
                    bag_id: string & {
                        __prisma_table: "BagAcl";
                        __prisma_field: "bag_id";
                    };
                }[];
            } & {
                description: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "description";
                };
                owner_id: PrismaField<"Bags", "owner_id">;
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
                bag_name: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_name";
                };
            })[];
            recipeList: ({
                _count: {
                    recipe_bags: number;
                    acl: number;
                };
                recipe_bags: {
                    position: number & {
                        __prisma_table: "Recipe_bags";
                        __prisma_field: "position";
                    };
                    bag_id: string & {
                        __prisma_table: "Bags";
                        __prisma_field: "bag_id";
                    };
                    with_acl: PrismaField<"Recipe_bags", "with_acl">;
                }[];
                acl: {
                    recipe_id: string & {
                        __prisma_table: "RecipeAcl";
                        __prisma_field: "recipe_id";
                    };
                    acl_id: number & {
                        __prisma_table: "RecipeAcl";
                        __prisma_field: "acl_id";
                    };
                    role_id: string & {
                        __prisma_table: "RecipeAcl";
                        __prisma_field: "role_id";
                    };
                    permission: PrismaField<"RecipeAcl", "permission">;
                }[];
            } & {
                description: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "description";
                };
                recipe_id: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_id";
                };
                recipe_name: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_name";
                };
                owner_id: PrismaField<"Recipes", "owner_id">;
                plugin_names: PrismaJson.Recipes_plugin_names & {
                    __prisma_table: "Recipes";
                    __prisma_field: "plugin_names";
                };
                skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
                skip_core: PrismaField<"Recipes", "skip_core">;
            })[];
            isAdmin: boolean;
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            userListUser: false | {
                username: string & {
                    __prisma_table: "Users";
                    __prisma_field: "username";
                };
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
            }[];
            userListAdmin: false | {
                username: string & {
                    __prisma_table: "Users";
                    __prisma_field: "username";
                };
                email: string & {
                    __prisma_table: "Users";
                    __prisma_field: "email";
                };
                roles: {
                    description: PrismaField<"Roles", "description">;
                    role_id: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_id";
                    };
                    role_name: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_name";
                    };
                }[];
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
                created_at: Date & {
                    __prisma_table: "Users";
                    __prisma_field: "created_at";
                };
                last_login: PrismaField<"Users", "last_login">;
            }[];
            roleList: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            clientPlugins: string[];
            corePlugins: string[];
            isLoggedIn: boolean;
            allowAnonReads: false;
            allowAnonWrites: false;
            versions: {
                tw5: any;
                mws: string;
            };
        }>;
    }
}
declare module "packages/mws/src/commands/build-types" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand<[], {}> {
        execute(): Promise<void>;
        getEndpoints(): (readonly ["index_json", import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodUndefined, {
            bagList: ({
                _count: {
                    recipe_bags: number;
                    tiddlers: number;
                    acl: number;
                };
                acl: {
                    acl_id: number & {
                        __prisma_table: "BagAcl";
                        __prisma_field: "acl_id";
                    };
                    role_id: string & {
                        __prisma_table: "BagAcl";
                        __prisma_field: "role_id";
                    };
                    permission: PrismaField<"BagAcl", "permission">;
                    bag_id: string & {
                        __prisma_table: "BagAcl";
                        __prisma_field: "bag_id";
                    };
                }[];
            } & {
                description: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "description";
                };
                owner_id: PrismaField<"Bags", "owner_id">;
                bag_id: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_id";
                };
                bag_name: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_name";
                };
            })[];
            recipeList: ({
                _count: {
                    recipe_bags: number;
                    acl: number;
                };
                recipe_bags: {
                    position: number & {
                        __prisma_table: "Recipe_bags";
                        __prisma_field: "position";
                    };
                    bag_id: string & {
                        __prisma_table: "Bags";
                        __prisma_field: "bag_id";
                    };
                    with_acl: PrismaField<"Recipe_bags", "with_acl">;
                }[];
                acl: {
                    recipe_id: string & {
                        __prisma_table: "RecipeAcl";
                        __prisma_field: "recipe_id";
                    };
                    acl_id: number & {
                        __prisma_table: "RecipeAcl";
                        __prisma_field: "acl_id";
                    };
                    role_id: string & {
                        __prisma_table: "RecipeAcl";
                        __prisma_field: "role_id";
                    };
                    permission: PrismaField<"RecipeAcl", "permission">;
                }[];
            } & {
                description: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "description";
                };
                recipe_id: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_id";
                };
                recipe_name: string & {
                    __prisma_table: "Recipes";
                    __prisma_field: "recipe_name";
                };
                owner_id: PrismaField<"Recipes", "owner_id">;
                plugin_names: PrismaJson.Recipes_plugin_names & {
                    __prisma_table: "Recipes";
                    __prisma_field: "plugin_names";
                };
                skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
                skip_core: PrismaField<"Recipes", "skip_core">;
            })[];
            isAdmin: boolean;
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            userListUser: false | {
                username: string & {
                    __prisma_table: "Users";
                    __prisma_field: "username";
                };
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
            }[];
            userListAdmin: false | {
                username: string & {
                    __prisma_table: "Users";
                    __prisma_field: "username";
                };
                email: string & {
                    __prisma_table: "Users";
                    __prisma_field: "email";
                };
                roles: {
                    description: PrismaField<"Roles", "description">;
                    role_id: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_id";
                    };
                    role_name: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_name";
                    };
                }[];
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
                created_at: Date & {
                    __prisma_table: "Users";
                    __prisma_field: "created_at";
                };
                last_login: PrismaField<"Users", "last_login">;
            }[];
            roleList: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            clientPlugins: string[];
            corePlugins: string[];
            isLoggedIn: boolean;
            allowAnonReads: false;
            allowAnonWrites: false;
            versions: {
                tw5: any;
                mws: string;
            };
        }>] | readonly ["user_edit_data" | "user_list" | "user_create" | "user_update" | "user_delete" | "user_update_password" | "role_create" | "role_update", import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
        }, import("zod/v4/core").$strip>, {
            user: {
                username: string & {
                    __prisma_table: "Users";
                    __prisma_field: "username";
                };
                email: string & {
                    __prisma_table: "Users";
                    __prisma_field: "email";
                };
                roles: {
                    description: PrismaField<"Roles", "description">;
                    role_id: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_id";
                    };
                    role_name: string & {
                        __prisma_table: "Roles";
                        __prisma_field: "role_name";
                    };
                }[];
                user_id: string & {
                    __prisma_table: "Users";
                    __prisma_field: "user_id";
                };
                created_at: Date & {
                    __prisma_table: "Users";
                    __prisma_field: "created_at";
                };
                last_login: PrismaField<"Users", "last_login">;
            };
            allRoles: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodUndefined, {
            last_login: string | undefined;
            created_at: string;
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            email: string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            };
            roles: {
                description: PrismaField<"Roles", "description">;
                role_id: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                };
                role_name: string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_name";
                };
            }[];
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
        }[]> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            username: import("zod/v4").ZodString;
            email: import("zod/v4").ZodString;
            role_ids: import("zod/v4").ZodArray<import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string>>>;
        }, import("zod/v4/core").$strip>, {
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            created_at: Date & {
                __prisma_table: "Users";
                __prisma_field: "created_at";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
            username: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            }, string>>;
            email: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "email";
            }, string>>;
            role_ids: import("zod/v4").ZodArray<import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string>>>;
        }, import("zod/v4/core").$strip>, null> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
        }, import("zod/v4/core").$strip>, null> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            user_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            }, string>>;
            registrationRequest: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
            registrationRecord: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
            session_id: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
            signature: import("zod/v4").ZodOptional<import("zod/v4").ZodString>;
        }, import("zod/v4/core").$strip>, string | null> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            role_name: import("zod/v4").ZodString;
            description: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, {
            description: PrismaField<"Roles", "description">;
            role_id: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            };
            role_name: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            role_id: import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            }, string>>;
            role_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            }, string>>;
            description: import("zod/v4").ZodType<PrismaField<"Roles", "description">, string | null, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Roles", "description">, string | null>>;
        }, import("zod/v4/core").$strip>, {
            description: PrismaField<"Roles", "description">;
            role_id: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_id";
            };
            role_name: string & {
                __prisma_table: "Roles";
                __prisma_field: "role_name";
            };
        }>] | readonly ["recipe_create_or_update" | "bag_create_or_update" | "recipe_delete" | "bag_delete" | "recipe_acl_update" | "bag_acl_update", import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            description: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            }, string>>;
            bag_names: import("zod/v4").ZodArray<import("zod/v4").ZodObject<{
                bag_name: import("zod/v4").ZodString;
                with_acl: import("zod/v4").ZodBoolean;
            }, import("zod/v4/core").$strip>>;
            plugin_names: import("zod/v4").ZodArray<import("zod/v4").ZodString>;
            owner_id: import("zod/v4").ZodOptional<import("zod/v4").ZodType<PrismaField<"Recipes", "owner_id">, string | null, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Recipes", "owner_id">, string | null>>>;
            skip_required_plugins: import("zod/v4").ZodType<PrismaField<"Recipes", "skip_required_plugins">, boolean, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Recipes", "skip_required_plugins">, boolean>>;
            skip_core: import("zod/v4").ZodType<PrismaField<"Recipes", "skip_core">, boolean, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Recipes", "skip_core">, boolean>>;
            create_only: import("zod/v4").ZodBoolean;
        }, import("zod/v4/core").$strip>, {
            description: string & {
                __prisma_table: "Recipes";
                __prisma_field: "description";
            };
            recipe_id: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_id";
            };
            recipe_name: string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            };
            owner_id: PrismaField<"Recipes", "owner_id">;
            plugin_names: PrismaJson.Recipes_plugin_names & {
                __prisma_table: "Recipes";
                __prisma_field: "plugin_names";
            };
            skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">;
            skip_core: PrismaField<"Recipes", "skip_core">;
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            description: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            }, string>>;
            owner_id: import("zod/v4").ZodOptional<import("zod/v4").ZodType<PrismaField<"Bags", "owner_id">, string | null, import("zod/v4/core").$ZodTypeInternals<PrismaField<"Bags", "owner_id">, string | null>>>;
            create_only: import("zod/v4").ZodBoolean;
        }, import("zod/v4/core").$strip>, {
            description: string & {
                __prisma_table: "Bags";
                __prisma_field: "description";
            };
            owner_id: PrismaField<"Bags", "owner_id">;
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            recipe_name: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, null> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            bag_name: import("zod/v4").ZodString;
        }, import("zod/v4/core").$strip>, null> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            acl: import("zod/v4").ZodArray<import("zod/v4").ZodObject<{
                role_id: import("zod/v4").ZodType<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string>>;
                permission: import("zod/v4").ZodEnum<{
                    READ: "READ";
                    WRITE: "WRITE";
                    ADMIN: "ADMIN";
                }>;
            }, import("zod/v4/core").$strip>>;
        }, import("zod/v4/core").$strip>, null> | import("@tiddlywiki/server").ZodRoute<"POST", "json", {}, {}, import("zod/v4").ZodObject<{
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            acl: import("zod/v4").ZodArray<import("zod/v4").ZodObject<{
                role_id: import("zod/v4").ZodType<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                    __prisma_table: "Roles";
                    __prisma_field: "role_id";
                }, string>>;
                permission: import("zod/v4").ZodEnum<{
                    READ: "READ";
                    WRITE: "WRITE";
                    ADMIN: "ADMIN";
                }>;
            }, import("zod/v4/core").$strip>>;
        }, import("zod/v4/core").$strip>, null>] | readonly ["handleGetRecipeStatus" | "handleGetRecipeEvents" | "handleGetBags" | "handleGetBagState" | "handleGetAllBagStates" | "handleLoadRecipeTiddler" | "handleSaveRecipeTiddler" | "handleDeleteRecipeTiddler" | "handleFormMultipartRecipeTiddler" | "handleLoadBagTiddler" | "handleSaveBagTiddler" | "handleDeleteBagTiddler" | "handleFormMultipartBagTiddler", import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            isAdmin: boolean;
            user_id: string & {
                __prisma_table: "Users";
                __prisma_field: "user_id";
            };
            username: string & {
                __prisma_table: "Users";
                __prisma_field: "username";
            };
            isLoggedIn: boolean;
            isReadOnly: boolean;
        }> | import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, {
            "first-event-id": import("zod/v4").ZodOptional<import("zod/v4").ZodArray<import("zod/v4").ZodString>>;
        }, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, never> | import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            bag_id: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_id";
            };
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            position: number & {
                __prisma_table: "Recipe_bags";
                __prisma_field: "position";
            };
        }[]> | import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
        }, {
            last_known_revision_id: import("zod/v4").ZodOptional<import("zod/v4").ZodArray<import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string>>>>;
            include_deleted: import("zod/v4").ZodOptional<import("zod/v4").ZodArray<import("zod/v4").ZodEnum<{
                yes: "yes";
                no: "no";
            }>>>;
        }, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            bag_id: string;
            bag_name: string;
            tiddlers: {
                title: string;
                revision_id: string;
                is_deleted: boolean;
            }[];
        }> | import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, {
            last_known_revision_id: import("zod/v4").ZodOptional<import("zod/v4").ZodArray<import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            }, string>>>>;
            include_deleted: import("zod/v4").ZodOptional<import("zod/v4").ZodArray<import("zod/v4").ZodEnum<{
                yes: "yes";
                no: "no";
            }>>>;
            gzip_stream: import("zod/v4").ZodOptional<import("zod/v4").ZodArray<import("zod/v4").ZodEnum<{
                yes: "yes";
                no: "no";
            }>>>;
        }, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            bag_id: string;
            bag_name: string;
            position: number;
            tiddlers: {
                title: string;
                revision_id: string;
                is_deleted: boolean;
            }[];
        }[]> | import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            title: import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, never> | import("@tiddlywiki/server").ZodRoute<"PUT", "string", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            title: import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodString, {
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"DELETE", "json", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
            title: import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodUndefined, {
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "stream", {
            recipe_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Recipes";
                __prisma_field: "recipe_name";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            bag_name: string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            };
            results: {
                revision_id: string & {
                    __prisma_table: "Tiddlers";
                    __prisma_field: "revision_id";
                };
                bag_name: string & {
                    __prisma_table: "Bags";
                    __prisma_field: "bag_name";
                };
            };
        }> | import("@tiddlywiki/server").ZodRoute<"GET" | "HEAD", "ignore", {
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            title: import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, never> | import("@tiddlywiki/server").ZodRoute<"PUT", "string", {
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            title: import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodString, {
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"DELETE", "ignore", {
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
            title: import("zod/v4").ZodType<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "title";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }> | import("@tiddlywiki/server").ZodRoute<"POST", "stream", {
            bag_name: import("zod/v4").ZodType<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string, import("zod/v4/core").$ZodTypeInternals<string & {
                __prisma_table: "Bags";
                __prisma_field: "bag_name";
            }, string>>;
        }, Record<string, import("zod/v4").ZodType<any, string[] | undefined, import("zod/v4/core").$ZodTypeInternals<any, string[] | undefined>>>, import("zod/v4").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, {
            revision_id: string & {
                __prisma_table: "Tiddlers";
                __prisma_field: "revision_id";
            };
        }>])[];
    }
}
declare module "packages/mws/src/commands/listen" {
    import { Router } from "packages/server/src/index";
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export const AllowedMethods: ("GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS")[];
    export type AllowedMethod = (typeof AllowedMethods)[number];
    export type ListenerRaw = {
        [key in "port" | "host" | "prefix" | "key" | "cert" | "secure" | "redirect"]?: string | undefined;
    };
    module "packages/events/src/index" {
        interface ServerEventsMap {
            "listen.router.init": [command: Command, router: Router];
        }
    }
    export class Command extends BaseCommand<[], {
        listener: ListenerRaw[];
        allow_hosts: string[];
        subdomains: boolean;
        require_https: boolean;
    }> {
        execute(): Promise<void>;
    }
}
declare module "packages/mws/src/commands/index" {
    import * as load_wiki_folder from "packages/mws/src/commands/load-wiki-folder";
    import * as save_archive from "packages/mws/src/commands/save-archive";
    import * as load_archive from "packages/mws/src/commands/load-archive";
    import * as init_store from "packages/mws/src/commands/init-store";
    import * as manager from "packages/mws/src/commands/manager";
    import * as tests_complete from "packages/mws/src/commands/tests-complete";
    import * as build_client from "packages/mws/src/commands/build-client";
    import * as build_types from "packages/mws/src/commands/build-types";
    import * as listen from "packages/mws/src/commands/listen";
    export const commands: {
        readonly listen: typeof listen;
        readonly load_wiki_folder: typeof load_wiki_folder;
        readonly load_archive: typeof load_archive;
        readonly save_archive: typeof save_archive;
        readonly init_store: typeof init_store;
        readonly manager: typeof manager;
        readonly tests_complete: typeof tests_complete;
        readonly build_client: typeof build_client;
        readonly build_types: typeof build_types;
    };
}
declare module "packages/mws/src/zodAssert" {
    import { Prisma } from "prisma-client";
    import { zod } from "packages/server/src/index";
    type _zod = typeof zod;
    type ExtraFieldType = "string" | "number" | "parse-number" | "boolean" | "parse-boolean";
    type FieldTypeGroups = "STRING" | "JSON";
    type FieldTypeStringSelector<T extends FieldTypeGroups> = T extends "STRING" ? "string" : "string";
    type FieldTypeNumberSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-number" : "number";
    type FieldTypeBooleanSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-boolean" : "boolean";
    module "packages/server/src/index" {
        interface Z2<T extends FieldTypeGroups> extends _zod {
            /**
             * Tags the resulting value as being from the specified table field.
             *
             * The third argument is a string literal that specifies the field type based on the selected field.
             *
             * "string" and "parse-number"
             * - will use decodeURIComponent on the value.
             * - Require a string length at least one
             *
             * You can use .optional(), .nullable(), .nulish() after this to make the field optional.
             */
            prismaField<Table extends Prisma.ModelName, Field extends keyof PrismaPayloadScalars<Table>>(table: Table, field: Field, fieldtype: string extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeStringSelector<T> : number extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeNumberSelector<T> : boolean extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeBooleanSelector<T> : never, nullable?: null extends PrismaPayloadScalars<Table>[Field] ? true : false): zod.ZodType<PrismaField<Table, Field>, PrismaPayloadScalars<Table>[Field]>;
        }
    }
    export function prismaField(table: any, field: any, fieldtype: ExtraFieldType, nullable?: boolean): any;
}
declare module "packages/mws/src/services/tw-routes" {
    import { ServerRequest } from "packages/server/src/index";
    /**
     * `tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]`
     *
     *
     *
     * @param options
     * @param options.rootRoute
     */
    export function TW5Route({ mountPath, singleFile, argv, variables, }: {
        mountPath: string;
        singleFile: boolean;
        argv: string[];
        variables?: Record<string, string>;
    }): (state: ServerRequest) => Promise<symbol>;
}
declare module "packages/mws/src/index" {
    import "prisma/global";
    import "packages/commander/src/index";
    import "packages/server/src/index";
    import "packages/mws/src/registerRequest";
    import "packages/mws/src/registerStartup";
    import "packages/mws/src/commands/index";
    import "packages/mws/src/managers/index";
    import "packages/mws/src/zodAssert";
    import "packages/mws/src/RequestState";
    import "packages/mws/src/ServerState";
    import "packages/mws/src/services/tw-routes";
    import "packages/mws/src/services/cache";
    import "packages/mws/src/services/sessions";
    export { ZodRoute } from "packages/server/src/index";
    export * from "packages/mws/src/managers/index";
    export default function runMWS(oldOptions?: any): Promise<void>;
    global {
        /** Awaited Return Type */
        type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
        type Complete<T> = {
            [K in keyof T]-?: T[K];
        };
        interface ObjectConstructor {
            keys<T>(t: T): (string & keyof T)[];
        }
    }
    global {
        /** helper function which returns the arguments as an array, but typed as a tuple, which is still an array, but positional. */
        function tuple<P extends any[]>(...arg: P): P;
    }
    global {
        /**
         * Helper function which narrows the type to only truthy values.
         *
         * It uses `!!` so NaN will also be excluded.
         */
        function truthy<T>(obj: T): obj is Exclude<T, false | null | undefined | 0 | '' | void>;
    }
}
declare module "packages/mws/src/commands/_empty" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<void>;
    }
}
declare module "packages/mws/src/commands/load-tiddlers" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        tiddlersPath: string;
        bagName: PrismaField<"Bags", "bag_name">;
        constructor(...args: ConstructorParameters<typeof BaseCommand>);
        execute(): Promise<"Missing pathname and/or bag name" | null>;
    }
}
declare module "packages/mws/src/commands/save-tiddler-text" {
    import { BaseCommand, CommandInfo } from "packages/commander/src/index";
    export const info: CommandInfo;
    export class Command extends BaseCommand {
        execute(): Promise<void>;
    }
}
declare module "packages/mws/src/services/attachments" {
    import * as fs from "fs";
    import { TiddlerFields } from "tiddlywiki";
    import { ServerState } from "packages/mws/src/ServerState";
    export class AttachmentService {
        protected config: ServerState;
        protected prisma: PrismaTxnClient;
        constructor(config: ServerState, prisma: PrismaTxnClient);
        makeCanonicalUri(bag_name: string, title: string): string;
        processOutgoingTiddler({ tiddler, revision_id, bag_name, attachment_hash }: {
            tiddler: TiddlerFields;
            revision_id: any;
            bag_name: PrismaField<"Bags", "bag_name">;
            attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
        }): TiddlerFields;
        processIncomingTiddler({ tiddlerFields, existing_attachment_hash, existing_canonical_uri }: {
            tiddlerFields: TiddlerFields;
            existing_attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
            existing_canonical_uri: any;
        }): Promise<{
            tiddlerFields: TiddlerFields;
            attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
        }>;
        isValidAttachmentName(content_hash: string): boolean;
        saveAttachment(options: {
            text: string;
            type: string;
            reference: string;
            _canonical_uri: string;
        }): Promise<PrismaField<"Tiddlers", "attachment_hash">>;
        private writeMetaFile;
        adoptAttachment({ incomingFilepath, type, hash, _canonical_uri }: {
            incomingFilepath: any;
            type: string;
            hash: any;
            _canonical_uri: any;
        }): Promise<any>;
        getAttachmentStream(content_hash: string): Promise<{
            stream: fs.ReadStream;
            type: any;
        } | null>;
        getAttachmentFileSize(content_hash: PrismaField<"Tiddlers", "attachment_hash"> & {}): Promise<number | null>;
        getAttachmentMetadata(content_hash: PrismaField<"Tiddlers", "attachment_hash"> & {}): Promise<any>;
    }
}
declare module "packages/mws/src/utils/index" {
    export {};
}
declare module "packages/mws/src/utils/prisma-proxy" { }
