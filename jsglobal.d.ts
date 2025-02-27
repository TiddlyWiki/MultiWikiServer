
import { IncomingMessage as HTTPIncomingMessage, ServerResponse as HTTPServerResponse } from "http";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import "./src/startup";

import * as z from "zod";
import { StateObject } from "./src/StateObject";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { AllowedMethod, BodyFormat, rootRoute, Router } from "./src/router";
import { Wiki, Tiddler } from "tiddlywiki";


declare global {


  // const $tw: $TW




  interface $TW {
    loadTiddlersFromPath: any;
    loadPluginFolder: any;
    getLibraryItemSearchPaths: any;
    wiki: never;
    utils: {
      // [x: string]: any;
      /** Use Object.assign instead */
      extend: never
      /** Use Array.isArray instead */
      isArray: never
      /** use prismaField with a parse- option or z.uriComponent if possible */
      decodeURIComponentSafe: never;
      /**
       * 
      ```js
      $tw.utils.stringifyDate = function(value) {
        return value.getUTCFullYear() +
            $tw.utils.pad(value.getUTCMonth() + 1) +
            $tw.utils.pad(value.getUTCDate()) +
            $tw.utils.pad(value.getUTCHours()) +
            $tw.utils.pad(value.getUTCMinutes()) +
            $tw.utils.pad(value.getUTCSeconds()) +
            $tw.utils.pad(value.getUTCMilliseconds(),3);
      };
      ```
       */
      stringifyDate: never;
      // parseJSONSafe(str: string, defaultJSON?: any): any;
      // /** `return parseFloat(str) || 0;` */
      // parseNumber(string: string): number;
      // /** `return parseFloat(str) || 0;` */
      // parseNumber(string: string | null): number;
    };
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

  type PrismaTxnClient = Omit<Router["engine"], "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
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


