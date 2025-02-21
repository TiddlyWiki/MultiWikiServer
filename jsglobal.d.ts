import { IncomingMessage as HTTPIncomingMessage, ServerResponse as HTTPServerResponse } from "http";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import "./src/startup";
import { SqlTiddlerStore, } from "./src/store/sql-tiddler-store";
import * as sql from "./src/store/sql-tiddler-database";
import * as assert from "assert";
import { StateObject } from "./src/StateObject";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { BodyFormat } from "./src/router";

type PrismaTables = Prisma.ModelName
type PrismaPayload<T extends PrismaTables> = Prisma.TypeMap["model"][T]["payload"];

type AllPrismaTypesInUse = {
  [T in PrismaTables]: {
    [K in keyof Prisma.TypeMap["model"][T]["fields"]]: Prisma.TypeMap["model"][T]["fields"][K] extends { typeName: infer T } ? T : unknown
  }[keyof Prisma.TypeMap["model"][T]["fields"]]
}[PrismaTables]

declare global {

  
  type PrismaField<T extends PrismaTables, K extends keyof PrismaPayload<T>["scalars"]> = PrismaPayload<T>["scalars"][K] & { __prisma_table: T, __prisma_field: K }

  type UserID = number & { __user_id: never }

  const ok: typeof assert.ok;
  const okEntityType: typeof sql.okEntityType;
  function parseIntNull(str: string | null): number | null;
  function parseIntNullSafe(str: string | null): { success: boolean, value: number | null };
  
  // const okType: typeof sql.okType;
  // const okTypeTruthy: typeof sql.okTypeTruthy;

  /** 
   * This is a type assertion function that is used to assert that a value is a field value. 
   * It looks up the field type from the prisma schema and restricts the type of the value 
   * to that field type. If the field is optional, null is allowed as a field value. 
   * 
   * This does not check the value itself at runtime, rather it restricts the argument type.
   * 
   * @example
   * 
  ```
    // recieve the id field from somewhere
    var acl_id: number = 5;

    // mark it as a field value
    okField("acl", "acl_id", acl_id);
    
    // you can still use it as a regular number if required
    const t: number = acl_id;

  ```
   */

  function okField<T extends PrismaTables, K extends keyof PrismaPayload<T>["scalars"]>(
    table: T, field: K, value: PrismaPayload<T>["scalars"][K]
  ): asserts value is PrismaField<T, K>;

  const $tw: $TW;

  interface Wiki extends Record<string, any> {

  }
  interface Boot extends Record<string, any> {

  }
  interface Tiddler extends Record<string, any> {

  }


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
    wiki: Wiki;
    utils: {
      [x: string]: any;
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
  interface ServerRouteHandler<P extends number, F extends ServerRouteBodyFormat = "string"> {
    (
      this: ServerRoute,
      req: IncomingMessage,
      res: ServerResponse,
      state: StateObject<F>
    ): Promise<void>;
    // each parent would have to define this
    // params: string[] & { length: P };
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

}


export { };


