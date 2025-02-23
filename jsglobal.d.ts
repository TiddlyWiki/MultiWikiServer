
import { IncomingMessage as HTTPIncomingMessage, ServerResponse as HTTPServerResponse } from "http";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import "./src/startup";

import * as z from "zod";
import { StateObject } from "./src/StateObject";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { AllowedMethod, BodyFormat, rootRoute } from "./src/router";
import { Wiki, Tiddler } from "tiddlywiki";


declare global {


  const $tw: $TW;


  interface $TW {
    // nothing is allowed to access the global. It must come from the state.
    mws: never;
    // mws: {
    //   store: SqlTiddlerStore<unknown>;
    //   serverManager: ServerManager;
    //   router: Router;
    //   connection: PrismaClient;
    //   databasePath: string;
    //   transaction: <T extends "DEFERRED" | "IMMEDIATE">(type: T, callback: (store: SqlTiddlerStore<T>) => Promise<void>) => Promise<void>;
    // }
  }

  interface $TW {
    loadTiddlersFromPath: any;
    loadPluginFolder: any;
    getLibraryItemSearchPaths: any;
    wiki: never;
    utils: {
      [x: string]: any;
      /** If you pass it null, it stringifies it as "null" */
      decodeURIComponentSafe(str: string): string;
      each<T>(object: T[], callback: (value: T, index: number, object: T[]) => void): void;
      each<T>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => void): void;
      parseJSONSafe(str: string, defaultJSON?: any): any;
      /** `return parseFloat(str) || 0;` */
      parseNumber(string: string): number;
      /** `return parseFloat(str) || 0;` */
      parseNumber(string: string | null): number;
    };
    modules: {
      [x: string]: any;
      forEachModuleOfType: (moduleType: string, callback: (title: string, module: any) => void) => void;
    }
    boot: any;
    config: any;
    node: any;
    hooks: any;
    sjcl: any;
    Wiki: { new(): Wiki };
    Tiddler: { new(fields: Record<string, any>): Tiddler };

  }




  type HTTPVerb = "GET" | "OPTIONS" | "HEAD" | "PUT" | "POST" | "DELETE";

  interface IncomingMessage extends HTTPIncomingMessage {
    url: string;
    method: string;
    headers: {
      //@ts-ignore
      "set-cookie"?: string[];
      [x: string]: string | undefined;
    }
  }

  interface ServerResponse extends HTTPServerResponse { }

  type PrismaTxnClient = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
  interface ServerRoute {
    path: RegExp;
    handler: ServerRouteHandler<number>;
    method?: string;
    useACL?: boolean;
    /** this is required if useACL is true */
    entityName?: string;
    csrfDisable?: boolean;
    bodyFormat?: ServerRouteBodyFormat;
  }
  type ServerRouteBodyFormat = BodyFormat;
  interface ServerRouteHandler<P extends number,
    B extends ServerRouteBodyFormat = "string",
    M extends AllowedMethod = AllowedMethod,
  > {
    (
      this: ServerRoute,
      req: IncomingMessage,
      res: ServerResponse,
      // root route has no params
      state: StateObject<B, M, [[], string[] & { length: P }]>
    ): Promise<void>;
    // each parent would have to define this
    // params: string[] & { length: P };
  }

  interface ServerRouteDefinition {
    (root: rootRoute): any;
  }


  interface ACL_Middleware_Helper {

    (
      request: IncomingMessage | Http2ServerRequest,
      response: ServerResponse | Http2ServerResponse,
      state: StateObject,
      entityType: string | null,
      permissionName: string

    ): Promise<void>;
  }

  interface ZodAssert {
    <T extends z.ZodTypeAny>(
      input: any,
      schema: (zod: typeof z) => T,
      onError?: (error: z.ZodError<any>) => string | void
    ): asserts input is z.infer<T>;
  }

}


export { };


