
/**
 * Client
**/


declare global {
  namespace PrismaJson {
    // This namespace will always be empty. Definitions should be done by
    // you manually, and merged automatically by typescript. Make sure that
    // your declaration merging file is included in your tsconfig.json
    //
    // Learn more: https://github.com/arthurfiorette/prisma-json-types-generator/issues/143
    // Declaration Merging: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  }
}

/** A filter to be used against nullable List types. */
export type NullableListFilter<T> = {
  equals?: T | T[] | null;
  has?: T | null;
  hasEvery?: T[];
  hasSome?: T[];
  isEmpty?: boolean;
};

/** A type to determine how to update a json field */
export type UpdateInput<T> = T extends object ? { [P in keyof T]?: UpdateInput<T[P]> } : T;

/** A type to determine how to update a json[] field */
export type UpdateManyInput<T> = T | T[] | { set?: T[]; push?: T | T[] };

/** A type to determine how to create a json[] input */
export type CreateManyInput<T> = T | T[] | { set?: T[] };

/**
 * A typed version of NestedStringFilter, allowing narrowing of string types to
 * discriminated unions.
 */
export type TypedNestedStringFilter<S extends string> =
  //@ts-ignore - When Prisma.StringFilter is not present, this type is not used
  Prisma.StringFilter & {
    equals?: S;
    in?: S[];
    notIn?: S[];
    not?: TypedNestedStringFilter<S> | S;
  };

/**
 * A typed version of StringFilter, allowing narrowing of string types to discriminated
 * unions.
 */
export type TypedStringFilter<S extends string> =
  //@ts-ignore - When Prisma.StringFilter is not present, this type is not used
  Prisma.StringFilter & {
    equals?: S;
    in?: S[];
    notIn?: S[];
    not?: TypedNestedStringFilter<S> | S;
  };

/**
 * A typed version of NestedStringNullableFilter, allowing narrowing of string types to
 * discriminated unions.
 */
export type TypedNestedStringNullableFilter<S extends string> =
  //@ts-ignore - When Prisma.StringNullableFilter is not present, this type is not used
  Prisma.StringNullableFilter & {
    equals?: S | null;
    in?: S[] | null;
    notIn?: S[] | null;
    not?: TypedNestedStringNullableFilter<S> | S | null;
  };

/**
 * A typed version of StringNullableFilter, allowing narrowing of string types to
 * discriminated unions.
 */
export type TypedStringNullableFilter<S extends string> =
  //@ts-ignore - When Prisma.StringNullableFilter is not present, this type is not used
  Prisma.StringNullableFilter & {
    equals?: S | null;
    in?: S[] | null;
    notIn?: S[] | null;
    not?: TypedNestedStringNullableFilter<S> | S | null;
  };

/**
 * A typed version of NestedStringWithAggregatesFilter, allowing narrowing of string types
 * to discriminated unions.
 */
export type TypedNestedStringWithAggregatesFilter<S extends string> =
  //@ts-ignore - When Prisma.NestedStringWithAggregatesFilter is not present, this type is not used
  Prisma.NestedStringWithAggregatesFilter & {
    equals?: S;
    in?: S[];
    notIn?: S[];
    not?: TypedNestedStringWithAggregatesFilter<S> | S;
  };

/**
 * A typed version of StringWithAggregatesFilter, allowing narrowing of string types to
 * discriminated unions.
 */
export type TypedStringWithAggregatesFilter<S extends string> =
  //@ts-ignore - When Prisma.StringWithAggregatesFilter is not present, this type is not used
  Prisma.StringWithAggregatesFilter & {
    equals?: S;
    in?: S[];
    notIn?: S[];
    not?: TypedNestedStringWithAggregatesFilter<S> | S;
  };

/**
 * A typed version of NestedStringNullableWithAggregatesFilter, allowing narrowing of
 * string types to discriminated unions.
 */
export type TypedNestedStringNullableWithAggregatesFilter<S extends string> =
  //@ts-ignore - When Prisma.NestedStringNullableWithAggregatesFilter is not present, this type is not used
  Prisma.NestedStringNullableWithAggregatesFilter & {
    equals?: S | null;
    in?: S[] | null;
    notIn?: S[] | null;
    not?: TypedNestedStringNullableWithAggregatesFilter<S> | S | null;
  };

/**
 * A typed version of StringNullableWithAggregatesFilter, allowing narrowing of string
 * types to discriminated unions.
 */
export type TypedStringNullableWithAggregatesFilter<S extends string> =
  //@ts-ignore - When Prisma.StringNullableWithAggregatesFilter is not present, this type is not used
  Prisma.StringNullableWithAggregatesFilter & {
    equals?: S | null;
    in?: S[] | null;
    notIn?: S[] | null;
    not?: TypedNestedStringNullableWithAggregatesFilter<S> | S | null;
  };

/**
 * A typed version of StringFieldUpdateOperationsInput, allowing narrowing of string types
 * to discriminated unions.
 */
export type TypedStringFieldUpdateOperationsInput<S extends string> =
  //@ts-ignore - When Prisma.StringFieldUpdateOperationsInput is not present, this type is not used
  Prisma.StringFieldUpdateOperationsInput & {
    set?: S;
  };

/**
 * A typed version of NullableStringFieldUpdateOperationsInput, allowing narrowing of
 * string types to discriminated unions.
 */
export type TypedNullableStringFieldUpdateOperationsInput<S extends string> =
  //@ts-ignore - When Prisma.NullableStringFieldUpdateOperationsInput is not present, this type is not used
  Prisma.NullableStringFieldUpdateOperationsInput & {
    set?: S | null;
  };

/**
 * A typed version of StringNullableListFilter, allowing narrowing of string types to
 * discriminated unions.
 */
export type TypedStringNullableListFilter<S extends string> =
  //@ts-ignore - When Prisma.StringNullableListFilter is not present, this type is not used
  Prisma.StringNullableListFilter & {
    equals?: S[] | null;
    has?: S | null;
    hasEvery?: S[];
    hasSome?: S[];
  };

/**
 * A typed version of the input type to update a string[] field, allowing narrowing of
 * string types to discriminated unions.
 */
export type UpdateStringArrayInput<S extends string> = {
  set?: S[];
  push?: S | S[];
};

/**
 * A typed version of the input type to create a string[] field, allowing narrowing of
 * string types to discriminated unions.
 */
export type CreateStringArrayInput<S extends string> = {
  set?: S[];
};
import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Settings
 * 
 */
export type Settings = $Result.DefaultSelection<Prisma.$SettingsPayload>
/**
 * Model Recipes
 * 
 */
export type Recipes = $Result.DefaultSelection<Prisma.$RecipesPayload>
/**
 * Model RecipeAcl
 * 
 */
export type RecipeAcl = $Result.DefaultSelection<Prisma.$RecipeAclPayload>
/**
 * Model Recipe_bags
 * 
 */
export type Recipe_bags = $Result.DefaultSelection<Prisma.$Recipe_bagsPayload>
/**
 * Model Bags
 * 
 */
export type Bags = $Result.DefaultSelection<Prisma.$BagsPayload>
/**
 * Model BagAcl
 * 
 */
export type BagAcl = $Result.DefaultSelection<Prisma.$BagAclPayload>
/**
 * Model Tiddlers
 * 
 */
export type Tiddlers = $Result.DefaultSelection<Prisma.$TiddlersPayload>
/**
 * Model Fields
 * 
 */
export type Fields = $Result.DefaultSelection<Prisma.$FieldsPayload>
/**
 * Model Roles
 * 
 */
export type Roles = $Result.DefaultSelection<Prisma.$RolesPayload>
/**
 * Model Users
 * 
 */
export type Users = $Result.DefaultSelection<Prisma.$UsersPayload>
/**
 * Model Sessions
 * 
 */
export type Sessions = $Result.DefaultSelection<Prisma.$SessionsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Permission: {
  READ: 'READ',
  WRITE: 'WRITE',
  ADMIN: 'ADMIN'
};

export type Permission = (typeof Permission)[keyof typeof Permission]

}

export type Permission = $Enums.Permission

export const Permission: typeof $Enums.Permission

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Settings
 * const settings = await prisma.settings.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Settings
   * const settings = await prisma.settings.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.settings`: Exposes CRUD operations for the **Settings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Settings
    * const settings = await prisma.settings.findMany()
    * ```
    */
  get settings(): Prisma.SettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recipes`: Exposes CRUD operations for the **Recipes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Recipes
    * const recipes = await prisma.recipes.findMany()
    * ```
    */
  get recipes(): Prisma.RecipesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recipeAcl`: Exposes CRUD operations for the **RecipeAcl** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecipeAcls
    * const recipeAcls = await prisma.recipeAcl.findMany()
    * ```
    */
  get recipeAcl(): Prisma.RecipeAclDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recipe_bags`: Exposes CRUD operations for the **Recipe_bags** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Recipe_bags
    * const recipe_bags = await prisma.recipe_bags.findMany()
    * ```
    */
  get recipe_bags(): Prisma.Recipe_bagsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bags`: Exposes CRUD operations for the **Bags** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bags
    * const bags = await prisma.bags.findMany()
    * ```
    */
  get bags(): Prisma.BagsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bagAcl`: Exposes CRUD operations for the **BagAcl** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BagAcls
    * const bagAcls = await prisma.bagAcl.findMany()
    * ```
    */
  get bagAcl(): Prisma.BagAclDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tiddlers`: Exposes CRUD operations for the **Tiddlers** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tiddlers
    * const tiddlers = await prisma.tiddlers.findMany()
    * ```
    */
  get tiddlers(): Prisma.TiddlersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fields`: Exposes CRUD operations for the **Fields** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Fields
    * const fields = await prisma.fields.findMany()
    * ```
    */
  get fields(): Prisma.FieldsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.roles`: Exposes CRUD operations for the **Roles** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Roles
    * const roles = await prisma.roles.findMany()
    * ```
    */
  get roles(): Prisma.RolesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.users`: Exposes CRUD operations for the **Users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.UsersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sessions`: Exposes CRUD operations for the **Sessions** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.sessions.findMany()
    * ```
    */
  get sessions(): Prisma.SessionsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.10.1
   * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Settings: 'Settings',
    Recipes: 'Recipes',
    RecipeAcl: 'RecipeAcl',
    Recipe_bags: 'Recipe_bags',
    Bags: 'Bags',
    BagAcl: 'BagAcl',
    Tiddlers: 'Tiddlers',
    Fields: 'Fields',
    Roles: 'Roles',
    Users: 'Users',
    Sessions: 'Sessions'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "settings" | "recipes" | "recipeAcl" | "recipe_bags" | "bags" | "bagAcl" | "tiddlers" | "fields" | "roles" | "users" | "sessions"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Settings: {
        payload: Prisma.$SettingsPayload<ExtArgs>
        fields: Prisma.SettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findFirst: {
            args: Prisma.SettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findMany: {
            args: Prisma.SettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          create: {
            args: Prisma.SettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          createMany: {
            args: Prisma.SettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          delete: {
            args: Prisma.SettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          update: {
            args: Prisma.SettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          deleteMany: {
            args: Prisma.SettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          upsert: {
            args: Prisma.SettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          aggregate: {
            args: Prisma.SettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSettings>
          }
          groupBy: {
            args: Prisma.SettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SettingsCountArgs<ExtArgs>
            result: $Utils.Optional<SettingsCountAggregateOutputType> | number
          }
        }
      }
      Recipes: {
        payload: Prisma.$RecipesPayload<ExtArgs>
        fields: Prisma.RecipesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecipesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecipesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>
          }
          findFirst: {
            args: Prisma.RecipesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecipesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>
          }
          findMany: {
            args: Prisma.RecipesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>[]
          }
          create: {
            args: Prisma.RecipesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>
          }
          createMany: {
            args: Prisma.RecipesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecipesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>[]
          }
          delete: {
            args: Prisma.RecipesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>
          }
          update: {
            args: Prisma.RecipesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>
          }
          deleteMany: {
            args: Prisma.RecipesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecipesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecipesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>[]
          }
          upsert: {
            args: Prisma.RecipesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipesPayload>
          }
          aggregate: {
            args: Prisma.RecipesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecipes>
          }
          groupBy: {
            args: Prisma.RecipesGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecipesGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecipesCountArgs<ExtArgs>
            result: $Utils.Optional<RecipesCountAggregateOutputType> | number
          }
        }
      }
      RecipeAcl: {
        payload: Prisma.$RecipeAclPayload<ExtArgs>
        fields: Prisma.RecipeAclFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecipeAclFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecipeAclFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>
          }
          findFirst: {
            args: Prisma.RecipeAclFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecipeAclFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>
          }
          findMany: {
            args: Prisma.RecipeAclFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>[]
          }
          create: {
            args: Prisma.RecipeAclCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>
          }
          createMany: {
            args: Prisma.RecipeAclCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecipeAclCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>[]
          }
          delete: {
            args: Prisma.RecipeAclDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>
          }
          update: {
            args: Prisma.RecipeAclUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>
          }
          deleteMany: {
            args: Prisma.RecipeAclDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecipeAclUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecipeAclUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>[]
          }
          upsert: {
            args: Prisma.RecipeAclUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipeAclPayload>
          }
          aggregate: {
            args: Prisma.RecipeAclAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecipeAcl>
          }
          groupBy: {
            args: Prisma.RecipeAclGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecipeAclGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecipeAclCountArgs<ExtArgs>
            result: $Utils.Optional<RecipeAclCountAggregateOutputType> | number
          }
        }
      }
      Recipe_bags: {
        payload: Prisma.$Recipe_bagsPayload<ExtArgs>
        fields: Prisma.Recipe_bagsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.Recipe_bagsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.Recipe_bagsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>
          }
          findFirst: {
            args: Prisma.Recipe_bagsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.Recipe_bagsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>
          }
          findMany: {
            args: Prisma.Recipe_bagsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>[]
          }
          create: {
            args: Prisma.Recipe_bagsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>
          }
          createMany: {
            args: Prisma.Recipe_bagsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.Recipe_bagsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>[]
          }
          delete: {
            args: Prisma.Recipe_bagsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>
          }
          update: {
            args: Prisma.Recipe_bagsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>
          }
          deleteMany: {
            args: Prisma.Recipe_bagsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.Recipe_bagsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.Recipe_bagsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>[]
          }
          upsert: {
            args: Prisma.Recipe_bagsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Recipe_bagsPayload>
          }
          aggregate: {
            args: Prisma.Recipe_bagsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecipe_bags>
          }
          groupBy: {
            args: Prisma.Recipe_bagsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Recipe_bagsGroupByOutputType>[]
          }
          count: {
            args: Prisma.Recipe_bagsCountArgs<ExtArgs>
            result: $Utils.Optional<Recipe_bagsCountAggregateOutputType> | number
          }
        }
      }
      Bags: {
        payload: Prisma.$BagsPayload<ExtArgs>
        fields: Prisma.BagsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BagsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BagsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>
          }
          findFirst: {
            args: Prisma.BagsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BagsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>
          }
          findMany: {
            args: Prisma.BagsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>[]
          }
          create: {
            args: Prisma.BagsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>
          }
          createMany: {
            args: Prisma.BagsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BagsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>[]
          }
          delete: {
            args: Prisma.BagsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>
          }
          update: {
            args: Prisma.BagsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>
          }
          deleteMany: {
            args: Prisma.BagsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BagsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BagsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>[]
          }
          upsert: {
            args: Prisma.BagsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagsPayload>
          }
          aggregate: {
            args: Prisma.BagsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBags>
          }
          groupBy: {
            args: Prisma.BagsGroupByArgs<ExtArgs>
            result: $Utils.Optional<BagsGroupByOutputType>[]
          }
          count: {
            args: Prisma.BagsCountArgs<ExtArgs>
            result: $Utils.Optional<BagsCountAggregateOutputType> | number
          }
        }
      }
      BagAcl: {
        payload: Prisma.$BagAclPayload<ExtArgs>
        fields: Prisma.BagAclFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BagAclFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BagAclFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>
          }
          findFirst: {
            args: Prisma.BagAclFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BagAclFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>
          }
          findMany: {
            args: Prisma.BagAclFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>[]
          }
          create: {
            args: Prisma.BagAclCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>
          }
          createMany: {
            args: Prisma.BagAclCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BagAclCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>[]
          }
          delete: {
            args: Prisma.BagAclDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>
          }
          update: {
            args: Prisma.BagAclUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>
          }
          deleteMany: {
            args: Prisma.BagAclDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BagAclUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BagAclUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>[]
          }
          upsert: {
            args: Prisma.BagAclUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BagAclPayload>
          }
          aggregate: {
            args: Prisma.BagAclAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBagAcl>
          }
          groupBy: {
            args: Prisma.BagAclGroupByArgs<ExtArgs>
            result: $Utils.Optional<BagAclGroupByOutputType>[]
          }
          count: {
            args: Prisma.BagAclCountArgs<ExtArgs>
            result: $Utils.Optional<BagAclCountAggregateOutputType> | number
          }
        }
      }
      Tiddlers: {
        payload: Prisma.$TiddlersPayload<ExtArgs>
        fields: Prisma.TiddlersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TiddlersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TiddlersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>
          }
          findFirst: {
            args: Prisma.TiddlersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TiddlersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>
          }
          findMany: {
            args: Prisma.TiddlersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>[]
          }
          create: {
            args: Prisma.TiddlersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>
          }
          createMany: {
            args: Prisma.TiddlersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TiddlersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>[]
          }
          delete: {
            args: Prisma.TiddlersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>
          }
          update: {
            args: Prisma.TiddlersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>
          }
          deleteMany: {
            args: Prisma.TiddlersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TiddlersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TiddlersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>[]
          }
          upsert: {
            args: Prisma.TiddlersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TiddlersPayload>
          }
          aggregate: {
            args: Prisma.TiddlersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTiddlers>
          }
          groupBy: {
            args: Prisma.TiddlersGroupByArgs<ExtArgs>
            result: $Utils.Optional<TiddlersGroupByOutputType>[]
          }
          count: {
            args: Prisma.TiddlersCountArgs<ExtArgs>
            result: $Utils.Optional<TiddlersCountAggregateOutputType> | number
          }
        }
      }
      Fields: {
        payload: Prisma.$FieldsPayload<ExtArgs>
        fields: Prisma.FieldsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FieldsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FieldsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>
          }
          findFirst: {
            args: Prisma.FieldsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FieldsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>
          }
          findMany: {
            args: Prisma.FieldsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>[]
          }
          create: {
            args: Prisma.FieldsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>
          }
          createMany: {
            args: Prisma.FieldsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FieldsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>[]
          }
          delete: {
            args: Prisma.FieldsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>
          }
          update: {
            args: Prisma.FieldsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>
          }
          deleteMany: {
            args: Prisma.FieldsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FieldsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FieldsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>[]
          }
          upsert: {
            args: Prisma.FieldsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FieldsPayload>
          }
          aggregate: {
            args: Prisma.FieldsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFields>
          }
          groupBy: {
            args: Prisma.FieldsGroupByArgs<ExtArgs>
            result: $Utils.Optional<FieldsGroupByOutputType>[]
          }
          count: {
            args: Prisma.FieldsCountArgs<ExtArgs>
            result: $Utils.Optional<FieldsCountAggregateOutputType> | number
          }
        }
      }
      Roles: {
        payload: Prisma.$RolesPayload<ExtArgs>
        fields: Prisma.RolesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RolesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RolesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>
          }
          findFirst: {
            args: Prisma.RolesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RolesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>
          }
          findMany: {
            args: Prisma.RolesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>[]
          }
          create: {
            args: Prisma.RolesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>
          }
          createMany: {
            args: Prisma.RolesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RolesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>[]
          }
          delete: {
            args: Prisma.RolesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>
          }
          update: {
            args: Prisma.RolesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>
          }
          deleteMany: {
            args: Prisma.RolesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RolesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RolesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>[]
          }
          upsert: {
            args: Prisma.RolesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolesPayload>
          }
          aggregate: {
            args: Prisma.RolesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoles>
          }
          groupBy: {
            args: Prisma.RolesGroupByArgs<ExtArgs>
            result: $Utils.Optional<RolesGroupByOutputType>[]
          }
          count: {
            args: Prisma.RolesCountArgs<ExtArgs>
            result: $Utils.Optional<RolesCountAggregateOutputType> | number
          }
        }
      }
      Users: {
        payload: Prisma.$UsersPayload<ExtArgs>
        fields: Prisma.UsersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          findFirst: {
            args: Prisma.UsersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          findMany: {
            args: Prisma.UsersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>[]
          }
          create: {
            args: Prisma.UsersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          createMany: {
            args: Prisma.UsersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>[]
          }
          delete: {
            args: Prisma.UsersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          update: {
            args: Prisma.UsersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          deleteMany: {
            args: Prisma.UsersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>[]
          }
          upsert: {
            args: Prisma.UsersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.UsersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
          }
        }
      }
      Sessions: {
        payload: Prisma.$SessionsPayload<ExtArgs>
        fields: Prisma.SessionsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>
          }
          findFirst: {
            args: Prisma.SessionsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>
          }
          findMany: {
            args: Prisma.SessionsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>[]
          }
          create: {
            args: Prisma.SessionsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>
          }
          createMany: {
            args: Prisma.SessionsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>[]
          }
          delete: {
            args: Prisma.SessionsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>
          }
          update: {
            args: Prisma.SessionsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>
          }
          deleteMany: {
            args: Prisma.SessionsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>[]
          }
          upsert: {
            args: Prisma.SessionsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionsPayload>
          }
          aggregate: {
            args: Prisma.SessionsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSessions>
          }
          groupBy: {
            args: Prisma.SessionsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionsCountArgs<ExtArgs>
            result: $Utils.Optional<SessionsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    settings?: SettingsOmit
    recipes?: RecipesOmit
    recipeAcl?: RecipeAclOmit
    recipe_bags?: Recipe_bagsOmit
    bags?: BagsOmit
    bagAcl?: BagAclOmit
    tiddlers?: TiddlersOmit
    fields?: FieldsOmit
    roles?: RolesOmit
    users?: UsersOmit
    sessions?: SessionsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type RecipesCountOutputType
   */

  export type RecipesCountOutputType = {
    recipe_bags: number
    acl: number
  }

  export type RecipesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe_bags?: boolean | RecipesCountOutputTypeCountRecipe_bagsArgs
    acl?: boolean | RecipesCountOutputTypeCountAclArgs
  }

  // Custom InputTypes
  /**
   * RecipesCountOutputType without action
   */
  export type RecipesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipesCountOutputType
     */
    select?: RecipesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RecipesCountOutputType without action
   */
  export type RecipesCountOutputTypeCountRecipe_bagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: Recipe_bagsWhereInput
  }

  /**
   * RecipesCountOutputType without action
   */
  export type RecipesCountOutputTypeCountAclArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipeAclWhereInput
  }


  /**
   * Count Type BagsCountOutputType
   */

  export type BagsCountOutputType = {
    recipe_bags: number
    tiddlers: number
    acl: number
  }

  export type BagsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe_bags?: boolean | BagsCountOutputTypeCountRecipe_bagsArgs
    tiddlers?: boolean | BagsCountOutputTypeCountTiddlersArgs
    acl?: boolean | BagsCountOutputTypeCountAclArgs
  }

  // Custom InputTypes
  /**
   * BagsCountOutputType without action
   */
  export type BagsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagsCountOutputType
     */
    select?: BagsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BagsCountOutputType without action
   */
  export type BagsCountOutputTypeCountRecipe_bagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: Recipe_bagsWhereInput
  }

  /**
   * BagsCountOutputType without action
   */
  export type BagsCountOutputTypeCountTiddlersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TiddlersWhereInput
  }

  /**
   * BagsCountOutputType without action
   */
  export type BagsCountOutputTypeCountAclArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BagAclWhereInput
  }


  /**
   * Count Type TiddlersCountOutputType
   */

  export type TiddlersCountOutputType = {
    fields: number
  }

  export type TiddlersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fields?: boolean | TiddlersCountOutputTypeCountFieldsArgs
  }

  // Custom InputTypes
  /**
   * TiddlersCountOutputType without action
   */
  export type TiddlersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TiddlersCountOutputType
     */
    select?: TiddlersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TiddlersCountOutputType without action
   */
  export type TiddlersCountOutputTypeCountFieldsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FieldsWhereInput
  }


  /**
   * Count Type RolesCountOutputType
   */

  export type RolesCountOutputType = {
    users: number
  }

  export type RolesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | RolesCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * RolesCountOutputType without action
   */
  export type RolesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolesCountOutputType
     */
    select?: RolesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RolesCountOutputType without action
   */
  export type RolesCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsersWhereInput
  }


  /**
   * Count Type UsersCountOutputType
   */

  export type UsersCountOutputType = {
    sessions: number
    roles: number
  }

  export type UsersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | UsersCountOutputTypeCountSessionsArgs
    roles?: boolean | UsersCountOutputTypeCountRolesArgs
  }

  // Custom InputTypes
  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsersCountOutputType
     */
    select?: UsersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionsWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolesWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Settings
   */

  export type AggregateSettings = {
    _count: SettingsCountAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  export type SettingsMinAggregateOutputType = {
    key: string | null
    value: string | null
  }

  export type SettingsMaxAggregateOutputType = {
    key: string | null
    value: string | null
  }

  export type SettingsCountAggregateOutputType = {
    key: number
    value: number
    _all: number
  }


  export type SettingsMinAggregateInputType = {
    key?: true
    value?: true
  }

  export type SettingsMaxAggregateInputType = {
    key?: true
    value?: true
  }

  export type SettingsCountAggregateInputType = {
    key?: true
    value?: true
    _all?: true
  }

  export type SettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to aggregate.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Settings
    **/
    _count?: true | SettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SettingsMaxAggregateInputType
  }

  export type GetSettingsAggregateType<T extends SettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSettings[P]>
      : GetScalarType<T[P], AggregateSettings[P]>
  }




  export type SettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettingsWhereInput
    orderBy?: SettingsOrderByWithAggregationInput | SettingsOrderByWithAggregationInput[]
    by: SettingsScalarFieldEnum[] | SettingsScalarFieldEnum
    having?: SettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SettingsCountAggregateInputType | true
    _min?: SettingsMinAggregateInputType
    _max?: SettingsMaxAggregateInputType
  }

  export type SettingsGroupByOutputType = {
    key: string
    value: string
    _count: SettingsCountAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  type GetSettingsGroupByPayload<T extends SettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettingsGroupByOutputType[P]>
            : GetScalarType<T[P], SettingsGroupByOutputType[P]>
        }
      >
    >


  export type SettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectScalar = {
    key?: boolean
    value?: boolean
  }

  export type SettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"key" | "value", ExtArgs["result"]["settings"]>

  export type $SettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Settings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      key: string
      value: string
    }, ExtArgs["result"]["settings"]>
    composites: {}
  }

  type SettingsGetPayload<S extends boolean | null | undefined | SettingsDefaultArgs> = $Result.GetResult<Prisma.$SettingsPayload, S>

  type SettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: SettingsCountAggregateInputType | true
    }

  export interface SettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Settings'], meta: { name: 'Settings' } }
    /**
     * Find zero or one Settings that matches the filter.
     * @param {SettingsFindUniqueArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettingsFindUniqueArgs>(args: SelectSubset<T, SettingsFindUniqueArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Settings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettingsFindUniqueOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, SettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettingsFindFirstArgs>(args?: SelectSubset<T, SettingsFindFirstArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, SettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settings
     * const settings = await prisma.settings.findMany()
     * 
     * // Get first 10 Settings
     * const settings = await prisma.settings.findMany({ take: 10 })
     * 
     * // Only select the `key`
     * const settingsWithKeyOnly = await prisma.settings.findMany({ select: { key: true } })
     * 
     */
    findMany<T extends SettingsFindManyArgs>(args?: SelectSubset<T, SettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Settings.
     * @param {SettingsCreateArgs} args - Arguments to create a Settings.
     * @example
     * // Create one Settings
     * const Settings = await prisma.settings.create({
     *   data: {
     *     // ... data to create a Settings
     *   }
     * })
     * 
     */
    create<T extends SettingsCreateArgs>(args: SelectSubset<T, SettingsCreateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Settings.
     * @param {SettingsCreateManyArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SettingsCreateManyArgs>(args?: SelectSubset<T, SettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Settings and returns the data saved in the database.
     * @param {SettingsCreateManyAndReturnArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Settings and only return the `key`
     * const settingsWithKeyOnly = await prisma.settings.createManyAndReturn({
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, SettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Settings.
     * @param {SettingsDeleteArgs} args - Arguments to delete one Settings.
     * @example
     * // Delete one Settings
     * const Settings = await prisma.settings.delete({
     *   where: {
     *     // ... filter to delete one Settings
     *   }
     * })
     * 
     */
    delete<T extends SettingsDeleteArgs>(args: SelectSubset<T, SettingsDeleteArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Settings.
     * @param {SettingsUpdateArgs} args - Arguments to update one Settings.
     * @example
     * // Update one Settings
     * const settings = await prisma.settings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SettingsUpdateArgs>(args: SelectSubset<T, SettingsUpdateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Settings.
     * @param {SettingsDeleteManyArgs} args - Arguments to filter Settings to delete.
     * @example
     * // Delete a few Settings
     * const { count } = await prisma.settings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SettingsDeleteManyArgs>(args?: SelectSubset<T, SettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SettingsUpdateManyArgs>(args: SelectSubset<T, SettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings and returns the data updated in the database.
     * @param {SettingsUpdateManyAndReturnArgs} args - Arguments to update many Settings.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Settings and only return the `key`
     * const settingsWithKeyOnly = await prisma.settings.updateManyAndReturn({
     *   select: { key: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, SettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Settings.
     * @param {SettingsUpsertArgs} args - Arguments to update or create a Settings.
     * @example
     * // Update or create a Settings
     * const settings = await prisma.settings.upsert({
     *   create: {
     *     // ... data to create a Settings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Settings we want to update
     *   }
     * })
     */
    upsert<T extends SettingsUpsertArgs>(args: SelectSubset<T, SettingsUpsertArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsCountArgs} args - Arguments to filter Settings to count.
     * @example
     * // Count the number of Settings
     * const count = await prisma.settings.count({
     *   where: {
     *     // ... the filter for the Settings we want to count
     *   }
     * })
    **/
    count<T extends SettingsCountArgs>(
      args?: Subset<T, SettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SettingsAggregateArgs>(args: Subset<T, SettingsAggregateArgs>): Prisma.PrismaPromise<GetSettingsAggregateType<T>>

    /**
     * Group by Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettingsGroupByArgs['orderBy'] }
        : { orderBy?: SettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Settings model
   */
  readonly fields: SettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Settings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Settings model
   */
  interface SettingsFieldRefs {
    readonly key: FieldRef<"Settings", 'String'>
    readonly value: FieldRef<"Settings", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Settings findUnique
   */
  export type SettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findUniqueOrThrow
   */
  export type SettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findFirst
   */
  export type SettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findFirstOrThrow
   */
  export type SettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findMany
   */
  export type SettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings create
   */
  export type SettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data needed to create a Settings.
     */
    data: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
  }

  /**
   * Settings createMany
   */
  export type SettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
  }

  /**
   * Settings createManyAndReturn
   */
  export type SettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
  }

  /**
   * Settings update
   */
  export type SettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data needed to update a Settings.
     */
    data: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
    /**
     * Choose, which Settings to update.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings updateMany
   */
  export type SettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings updateManyAndReturn
   */
  export type SettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings upsert
   */
  export type SettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The filter to search for the Settings to update in case it exists.
     */
    where: SettingsWhereUniqueInput
    /**
     * In case the Settings found by the `where` argument doesn't exist, create a new Settings with this data.
     */
    create: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
    /**
     * In case the Settings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
  }

  /**
   * Settings delete
   */
  export type SettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Filter which Settings to delete.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings deleteMany
   */
  export type SettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to delete
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to delete.
     */
    limit?: number
  }

  /**
   * Settings without action
   */
  export type SettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
  }


  /**
   * Model Recipes
   */

  export type AggregateRecipes = {
    _count: RecipesCountAggregateOutputType | null
    _min: RecipesMinAggregateOutputType | null
    _max: RecipesMaxAggregateOutputType | null
  }

  export type RecipesMinAggregateOutputType = {
    recipe_id: string | null
    recipe_name: string | null
    description: string | null
    owner_id: string | null
    skip_required_plugins: boolean | null
    skip_core: boolean | null
  }

  export type RecipesMaxAggregateOutputType = {
    recipe_id: string | null
    recipe_name: string | null
    description: string | null
    owner_id: string | null
    skip_required_plugins: boolean | null
    skip_core: boolean | null
  }

  export type RecipesCountAggregateOutputType = {
    recipe_id: number
    recipe_name: number
    description: number
    owner_id: number
    plugin_names: number
    skip_required_plugins: number
    skip_core: number
    _all: number
  }


  export type RecipesMinAggregateInputType = {
    recipe_id?: true
    recipe_name?: true
    description?: true
    owner_id?: true
    skip_required_plugins?: true
    skip_core?: true
  }

  export type RecipesMaxAggregateInputType = {
    recipe_id?: true
    recipe_name?: true
    description?: true
    owner_id?: true
    skip_required_plugins?: true
    skip_core?: true
  }

  export type RecipesCountAggregateInputType = {
    recipe_id?: true
    recipe_name?: true
    description?: true
    owner_id?: true
    plugin_names?: true
    skip_required_plugins?: true
    skip_core?: true
    _all?: true
  }

  export type RecipesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Recipes to aggregate.
     */
    where?: RecipesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipesOrderByWithRelationInput | RecipesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecipesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Recipes
    **/
    _count?: true | RecipesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecipesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecipesMaxAggregateInputType
  }

  export type GetRecipesAggregateType<T extends RecipesAggregateArgs> = {
        [P in keyof T & keyof AggregateRecipes]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecipes[P]>
      : GetScalarType<T[P], AggregateRecipes[P]>
  }




  export type RecipesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipesWhereInput
    orderBy?: RecipesOrderByWithAggregationInput | RecipesOrderByWithAggregationInput[]
    by: RecipesScalarFieldEnum[] | RecipesScalarFieldEnum
    having?: RecipesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecipesCountAggregateInputType | true
    _min?: RecipesMinAggregateInputType
    _max?: RecipesMaxAggregateInputType
  }

  export type RecipesGroupByOutputType = {
    recipe_id: string
    recipe_name: string
    description: string
    owner_id: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins: boolean
    skip_core: boolean
    _count: RecipesCountAggregateOutputType | null
    _min: RecipesMinAggregateOutputType | null
    _max: RecipesMaxAggregateOutputType | null
  }

  type GetRecipesGroupByPayload<T extends RecipesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecipesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecipesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecipesGroupByOutputType[P]>
            : GetScalarType<T[P], RecipesGroupByOutputType[P]>
        }
      >
    >


  export type RecipesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    recipe_id?: boolean
    recipe_name?: boolean
    description?: boolean
    owner_id?: boolean
    plugin_names?: boolean
    skip_required_plugins?: boolean
    skip_core?: boolean
    recipe_bags?: boolean | Recipes$recipe_bagsArgs<ExtArgs>
    acl?: boolean | Recipes$aclArgs<ExtArgs>
    _count?: boolean | RecipesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipes"]>

  export type RecipesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    recipe_id?: boolean
    recipe_name?: boolean
    description?: boolean
    owner_id?: boolean
    plugin_names?: boolean
    skip_required_plugins?: boolean
    skip_core?: boolean
  }, ExtArgs["result"]["recipes"]>

  export type RecipesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    recipe_id?: boolean
    recipe_name?: boolean
    description?: boolean
    owner_id?: boolean
    plugin_names?: boolean
    skip_required_plugins?: boolean
    skip_core?: boolean
  }, ExtArgs["result"]["recipes"]>

  export type RecipesSelectScalar = {
    recipe_id?: boolean
    recipe_name?: boolean
    description?: boolean
    owner_id?: boolean
    plugin_names?: boolean
    skip_required_plugins?: boolean
    skip_core?: boolean
  }

  export type RecipesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"recipe_id" | "recipe_name" | "description" | "owner_id" | "plugin_names" | "skip_required_plugins" | "skip_core", ExtArgs["result"]["recipes"]>
  export type RecipesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe_bags?: boolean | Recipes$recipe_bagsArgs<ExtArgs>
    acl?: boolean | Recipes$aclArgs<ExtArgs>
    _count?: boolean | RecipesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RecipesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RecipesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RecipesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Recipes"
    objects: {
      recipe_bags: Prisma.$Recipe_bagsPayload<ExtArgs>[]
      acl: Prisma.$RecipeAclPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      recipe_id: string
      recipe_name: string
      description: string
      owner_id: string | null
      /**
       * [Recipes_plugin_names]
       */
      plugin_names: PrismaJson.Recipes_plugin_names
      skip_required_plugins: boolean
      skip_core: boolean
    }, ExtArgs["result"]["recipes"]>
    composites: {}
  }

  type RecipesGetPayload<S extends boolean | null | undefined | RecipesDefaultArgs> = $Result.GetResult<Prisma.$RecipesPayload, S>

  type RecipesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecipesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: RecipesCountAggregateInputType | true
    }

  export interface RecipesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Recipes'], meta: { name: 'Recipes' } }
    /**
     * Find zero or one Recipes that matches the filter.
     * @param {RecipesFindUniqueArgs} args - Arguments to find a Recipes
     * @example
     * // Get one Recipes
     * const recipes = await prisma.recipes.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecipesFindUniqueArgs>(args: SelectSubset<T, RecipesFindUniqueArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Recipes that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecipesFindUniqueOrThrowArgs} args - Arguments to find a Recipes
     * @example
     * // Get one Recipes
     * const recipes = await prisma.recipes.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecipesFindUniqueOrThrowArgs>(args: SelectSubset<T, RecipesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Recipes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesFindFirstArgs} args - Arguments to find a Recipes
     * @example
     * // Get one Recipes
     * const recipes = await prisma.recipes.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecipesFindFirstArgs>(args?: SelectSubset<T, RecipesFindFirstArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Recipes that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesFindFirstOrThrowArgs} args - Arguments to find a Recipes
     * @example
     * // Get one Recipes
     * const recipes = await prisma.recipes.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecipesFindFirstOrThrowArgs>(args?: SelectSubset<T, RecipesFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Recipes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Recipes
     * const recipes = await prisma.recipes.findMany()
     * 
     * // Get first 10 Recipes
     * const recipes = await prisma.recipes.findMany({ take: 10 })
     * 
     * // Only select the `recipe_id`
     * const recipesWithRecipe_idOnly = await prisma.recipes.findMany({ select: { recipe_id: true } })
     * 
     */
    findMany<T extends RecipesFindManyArgs>(args?: SelectSubset<T, RecipesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Recipes.
     * @param {RecipesCreateArgs} args - Arguments to create a Recipes.
     * @example
     * // Create one Recipes
     * const Recipes = await prisma.recipes.create({
     *   data: {
     *     // ... data to create a Recipes
     *   }
     * })
     * 
     */
    create<T extends RecipesCreateArgs>(args: SelectSubset<T, RecipesCreateArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Recipes.
     * @param {RecipesCreateManyArgs} args - Arguments to create many Recipes.
     * @example
     * // Create many Recipes
     * const recipes = await prisma.recipes.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecipesCreateManyArgs>(args?: SelectSubset<T, RecipesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Recipes and returns the data saved in the database.
     * @param {RecipesCreateManyAndReturnArgs} args - Arguments to create many Recipes.
     * @example
     * // Create many Recipes
     * const recipes = await prisma.recipes.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Recipes and only return the `recipe_id`
     * const recipesWithRecipe_idOnly = await prisma.recipes.createManyAndReturn({
     *   select: { recipe_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecipesCreateManyAndReturnArgs>(args?: SelectSubset<T, RecipesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Recipes.
     * @param {RecipesDeleteArgs} args - Arguments to delete one Recipes.
     * @example
     * // Delete one Recipes
     * const Recipes = await prisma.recipes.delete({
     *   where: {
     *     // ... filter to delete one Recipes
     *   }
     * })
     * 
     */
    delete<T extends RecipesDeleteArgs>(args: SelectSubset<T, RecipesDeleteArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Recipes.
     * @param {RecipesUpdateArgs} args - Arguments to update one Recipes.
     * @example
     * // Update one Recipes
     * const recipes = await prisma.recipes.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecipesUpdateArgs>(args: SelectSubset<T, RecipesUpdateArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Recipes.
     * @param {RecipesDeleteManyArgs} args - Arguments to filter Recipes to delete.
     * @example
     * // Delete a few Recipes
     * const { count } = await prisma.recipes.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecipesDeleteManyArgs>(args?: SelectSubset<T, RecipesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Recipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Recipes
     * const recipes = await prisma.recipes.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecipesUpdateManyArgs>(args: SelectSubset<T, RecipesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Recipes and returns the data updated in the database.
     * @param {RecipesUpdateManyAndReturnArgs} args - Arguments to update many Recipes.
     * @example
     * // Update many Recipes
     * const recipes = await prisma.recipes.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Recipes and only return the `recipe_id`
     * const recipesWithRecipe_idOnly = await prisma.recipes.updateManyAndReturn({
     *   select: { recipe_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecipesUpdateManyAndReturnArgs>(args: SelectSubset<T, RecipesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Recipes.
     * @param {RecipesUpsertArgs} args - Arguments to update or create a Recipes.
     * @example
     * // Update or create a Recipes
     * const recipes = await prisma.recipes.upsert({
     *   create: {
     *     // ... data to create a Recipes
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Recipes we want to update
     *   }
     * })
     */
    upsert<T extends RecipesUpsertArgs>(args: SelectSubset<T, RecipesUpsertArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Recipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesCountArgs} args - Arguments to filter Recipes to count.
     * @example
     * // Count the number of Recipes
     * const count = await prisma.recipes.count({
     *   where: {
     *     // ... the filter for the Recipes we want to count
     *   }
     * })
    **/
    count<T extends RecipesCountArgs>(
      args?: Subset<T, RecipesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecipesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Recipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecipesAggregateArgs>(args: Subset<T, RecipesAggregateArgs>): Prisma.PrismaPromise<GetRecipesAggregateType<T>>

    /**
     * Group by Recipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecipesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecipesGroupByArgs['orderBy'] }
        : { orderBy?: RecipesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecipesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecipesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Recipes model
   */
  readonly fields: RecipesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Recipes.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecipesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipe_bags<T extends Recipes$recipe_bagsArgs<ExtArgs> = {}>(args?: Subset<T, Recipes$recipe_bagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    acl<T extends Recipes$aclArgs<ExtArgs> = {}>(args?: Subset<T, Recipes$aclArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Recipes model
   */
  interface RecipesFieldRefs {
    readonly recipe_id: FieldRef<"Recipes", 'String'>
    readonly recipe_name: FieldRef<"Recipes", 'String'>
    readonly description: FieldRef<"Recipes", 'String'>
    readonly owner_id: FieldRef<"Recipes", 'String'>
    readonly plugin_names: FieldRef<"Recipes", 'Json'>
    readonly skip_required_plugins: FieldRef<"Recipes", 'Boolean'>
    readonly skip_core: FieldRef<"Recipes", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Recipes findUnique
   */
  export type RecipesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * Filter, which Recipes to fetch.
     */
    where: RecipesWhereUniqueInput
  }

  /**
   * Recipes findUniqueOrThrow
   */
  export type RecipesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * Filter, which Recipes to fetch.
     */
    where: RecipesWhereUniqueInput
  }

  /**
   * Recipes findFirst
   */
  export type RecipesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * Filter, which Recipes to fetch.
     */
    where?: RecipesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipesOrderByWithRelationInput | RecipesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Recipes.
     */
    cursor?: RecipesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Recipes.
     */
    distinct?: RecipesScalarFieldEnum | RecipesScalarFieldEnum[]
  }

  /**
   * Recipes findFirstOrThrow
   */
  export type RecipesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * Filter, which Recipes to fetch.
     */
    where?: RecipesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipesOrderByWithRelationInput | RecipesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Recipes.
     */
    cursor?: RecipesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Recipes.
     */
    distinct?: RecipesScalarFieldEnum | RecipesScalarFieldEnum[]
  }

  /**
   * Recipes findMany
   */
  export type RecipesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * Filter, which Recipes to fetch.
     */
    where?: RecipesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipesOrderByWithRelationInput | RecipesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Recipes.
     */
    cursor?: RecipesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    distinct?: RecipesScalarFieldEnum | RecipesScalarFieldEnum[]
  }

  /**
   * Recipes create
   */
  export type RecipesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * The data needed to create a Recipes.
     */
    data: XOR<RecipesCreateInput, RecipesUncheckedCreateInput>
  }

  /**
   * Recipes createMany
   */
  export type RecipesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Recipes.
     */
    data: RecipesCreateManyInput | RecipesCreateManyInput[]
  }

  /**
   * Recipes createManyAndReturn
   */
  export type RecipesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * The data used to create many Recipes.
     */
    data: RecipesCreateManyInput | RecipesCreateManyInput[]
  }

  /**
   * Recipes update
   */
  export type RecipesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * The data needed to update a Recipes.
     */
    data: XOR<RecipesUpdateInput, RecipesUncheckedUpdateInput>
    /**
     * Choose, which Recipes to update.
     */
    where: RecipesWhereUniqueInput
  }

  /**
   * Recipes updateMany
   */
  export type RecipesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Recipes.
     */
    data: XOR<RecipesUpdateManyMutationInput, RecipesUncheckedUpdateManyInput>
    /**
     * Filter which Recipes to update
     */
    where?: RecipesWhereInput
    /**
     * Limit how many Recipes to update.
     */
    limit?: number
  }

  /**
   * Recipes updateManyAndReturn
   */
  export type RecipesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * The data used to update Recipes.
     */
    data: XOR<RecipesUpdateManyMutationInput, RecipesUncheckedUpdateManyInput>
    /**
     * Filter which Recipes to update
     */
    where?: RecipesWhereInput
    /**
     * Limit how many Recipes to update.
     */
    limit?: number
  }

  /**
   * Recipes upsert
   */
  export type RecipesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * The filter to search for the Recipes to update in case it exists.
     */
    where: RecipesWhereUniqueInput
    /**
     * In case the Recipes found by the `where` argument doesn't exist, create a new Recipes with this data.
     */
    create: XOR<RecipesCreateInput, RecipesUncheckedCreateInput>
    /**
     * In case the Recipes was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecipesUpdateInput, RecipesUncheckedUpdateInput>
  }

  /**
   * Recipes delete
   */
  export type RecipesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
    /**
     * Filter which Recipes to delete.
     */
    where: RecipesWhereUniqueInput
  }

  /**
   * Recipes deleteMany
   */
  export type RecipesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Recipes to delete
     */
    where?: RecipesWhereInput
    /**
     * Limit how many Recipes to delete.
     */
    limit?: number
  }

  /**
   * Recipes.recipe_bags
   */
  export type Recipes$recipe_bagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    where?: Recipe_bagsWhereInput
    orderBy?: Recipe_bagsOrderByWithRelationInput | Recipe_bagsOrderByWithRelationInput[]
    cursor?: Recipe_bagsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Recipe_bagsScalarFieldEnum | Recipe_bagsScalarFieldEnum[]
  }

  /**
   * Recipes.acl
   */
  export type Recipes$aclArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    where?: RecipeAclWhereInput
    orderBy?: RecipeAclOrderByWithRelationInput | RecipeAclOrderByWithRelationInput[]
    cursor?: RecipeAclWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecipeAclScalarFieldEnum | RecipeAclScalarFieldEnum[]
  }

  /**
   * Recipes without action
   */
  export type RecipesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipes
     */
    select?: RecipesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipes
     */
    omit?: RecipesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipesInclude<ExtArgs> | null
  }


  /**
   * Model RecipeAcl
   */

  export type AggregateRecipeAcl = {
    _count: RecipeAclCountAggregateOutputType | null
    _avg: RecipeAclAvgAggregateOutputType | null
    _sum: RecipeAclSumAggregateOutputType | null
    _min: RecipeAclMinAggregateOutputType | null
    _max: RecipeAclMaxAggregateOutputType | null
  }

  export type RecipeAclAvgAggregateOutputType = {
    acl_id: number | null
  }

  export type RecipeAclSumAggregateOutputType = {
    acl_id: number | null
  }

  export type RecipeAclMinAggregateOutputType = {
    acl_id: number | null
    role_id: string | null
    permission: $Enums.Permission | null
    recipe_id: string | null
  }

  export type RecipeAclMaxAggregateOutputType = {
    acl_id: number | null
    role_id: string | null
    permission: $Enums.Permission | null
    recipe_id: string | null
  }

  export type RecipeAclCountAggregateOutputType = {
    acl_id: number
    role_id: number
    permission: number
    recipe_id: number
    _all: number
  }


  export type RecipeAclAvgAggregateInputType = {
    acl_id?: true
  }

  export type RecipeAclSumAggregateInputType = {
    acl_id?: true
  }

  export type RecipeAclMinAggregateInputType = {
    acl_id?: true
    role_id?: true
    permission?: true
    recipe_id?: true
  }

  export type RecipeAclMaxAggregateInputType = {
    acl_id?: true
    role_id?: true
    permission?: true
    recipe_id?: true
  }

  export type RecipeAclCountAggregateInputType = {
    acl_id?: true
    role_id?: true
    permission?: true
    recipe_id?: true
    _all?: true
  }

  export type RecipeAclAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecipeAcl to aggregate.
     */
    where?: RecipeAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecipeAcls to fetch.
     */
    orderBy?: RecipeAclOrderByWithRelationInput | RecipeAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecipeAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecipeAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecipeAcls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecipeAcls
    **/
    _count?: true | RecipeAclCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecipeAclAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecipeAclSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecipeAclMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecipeAclMaxAggregateInputType
  }

  export type GetRecipeAclAggregateType<T extends RecipeAclAggregateArgs> = {
        [P in keyof T & keyof AggregateRecipeAcl]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecipeAcl[P]>
      : GetScalarType<T[P], AggregateRecipeAcl[P]>
  }




  export type RecipeAclGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipeAclWhereInput
    orderBy?: RecipeAclOrderByWithAggregationInput | RecipeAclOrderByWithAggregationInput[]
    by: RecipeAclScalarFieldEnum[] | RecipeAclScalarFieldEnum
    having?: RecipeAclScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecipeAclCountAggregateInputType | true
    _avg?: RecipeAclAvgAggregateInputType
    _sum?: RecipeAclSumAggregateInputType
    _min?: RecipeAclMinAggregateInputType
    _max?: RecipeAclMaxAggregateInputType
  }

  export type RecipeAclGroupByOutputType = {
    acl_id: number
    role_id: string
    permission: $Enums.Permission
    recipe_id: string
    _count: RecipeAclCountAggregateOutputType | null
    _avg: RecipeAclAvgAggregateOutputType | null
    _sum: RecipeAclSumAggregateOutputType | null
    _min: RecipeAclMinAggregateOutputType | null
    _max: RecipeAclMaxAggregateOutputType | null
  }

  type GetRecipeAclGroupByPayload<T extends RecipeAclGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecipeAclGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecipeAclGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecipeAclGroupByOutputType[P]>
            : GetScalarType<T[P], RecipeAclGroupByOutputType[P]>
        }
      >
    >


  export type RecipeAclSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    acl_id?: boolean
    role_id?: boolean
    permission?: boolean
    recipe_id?: boolean
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipeAcl"]>

  export type RecipeAclSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    acl_id?: boolean
    role_id?: boolean
    permission?: boolean
    recipe_id?: boolean
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipeAcl"]>

  export type RecipeAclSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    acl_id?: boolean
    role_id?: boolean
    permission?: boolean
    recipe_id?: boolean
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipeAcl"]>

  export type RecipeAclSelectScalar = {
    acl_id?: boolean
    role_id?: boolean
    permission?: boolean
    recipe_id?: boolean
  }

  export type RecipeAclOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"acl_id" | "role_id" | "permission" | "recipe_id", ExtArgs["result"]["recipeAcl"]>
  export type RecipeAclInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }
  export type RecipeAclIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }
  export type RecipeAclIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }

  export type $RecipeAclPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecipeAcl"
    objects: {
      recipe: Prisma.$RecipesPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      acl_id: number
      role_id: string
      permission: $Enums.Permission
      recipe_id: string
    }, ExtArgs["result"]["recipeAcl"]>
    composites: {}
  }

  type RecipeAclGetPayload<S extends boolean | null | undefined | RecipeAclDefaultArgs> = $Result.GetResult<Prisma.$RecipeAclPayload, S>

  type RecipeAclCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecipeAclFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: RecipeAclCountAggregateInputType | true
    }

  export interface RecipeAclDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecipeAcl'], meta: { name: 'RecipeAcl' } }
    /**
     * Find zero or one RecipeAcl that matches the filter.
     * @param {RecipeAclFindUniqueArgs} args - Arguments to find a RecipeAcl
     * @example
     * // Get one RecipeAcl
     * const recipeAcl = await prisma.recipeAcl.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecipeAclFindUniqueArgs>(args: SelectSubset<T, RecipeAclFindUniqueArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecipeAcl that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecipeAclFindUniqueOrThrowArgs} args - Arguments to find a RecipeAcl
     * @example
     * // Get one RecipeAcl
     * const recipeAcl = await prisma.recipeAcl.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecipeAclFindUniqueOrThrowArgs>(args: SelectSubset<T, RecipeAclFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecipeAcl that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclFindFirstArgs} args - Arguments to find a RecipeAcl
     * @example
     * // Get one RecipeAcl
     * const recipeAcl = await prisma.recipeAcl.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecipeAclFindFirstArgs>(args?: SelectSubset<T, RecipeAclFindFirstArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecipeAcl that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclFindFirstOrThrowArgs} args - Arguments to find a RecipeAcl
     * @example
     * // Get one RecipeAcl
     * const recipeAcl = await prisma.recipeAcl.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecipeAclFindFirstOrThrowArgs>(args?: SelectSubset<T, RecipeAclFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecipeAcls that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecipeAcls
     * const recipeAcls = await prisma.recipeAcl.findMany()
     * 
     * // Get first 10 RecipeAcls
     * const recipeAcls = await prisma.recipeAcl.findMany({ take: 10 })
     * 
     * // Only select the `acl_id`
     * const recipeAclWithAcl_idOnly = await prisma.recipeAcl.findMany({ select: { acl_id: true } })
     * 
     */
    findMany<T extends RecipeAclFindManyArgs>(args?: SelectSubset<T, RecipeAclFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecipeAcl.
     * @param {RecipeAclCreateArgs} args - Arguments to create a RecipeAcl.
     * @example
     * // Create one RecipeAcl
     * const RecipeAcl = await prisma.recipeAcl.create({
     *   data: {
     *     // ... data to create a RecipeAcl
     *   }
     * })
     * 
     */
    create<T extends RecipeAclCreateArgs>(args: SelectSubset<T, RecipeAclCreateArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecipeAcls.
     * @param {RecipeAclCreateManyArgs} args - Arguments to create many RecipeAcls.
     * @example
     * // Create many RecipeAcls
     * const recipeAcl = await prisma.recipeAcl.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecipeAclCreateManyArgs>(args?: SelectSubset<T, RecipeAclCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecipeAcls and returns the data saved in the database.
     * @param {RecipeAclCreateManyAndReturnArgs} args - Arguments to create many RecipeAcls.
     * @example
     * // Create many RecipeAcls
     * const recipeAcl = await prisma.recipeAcl.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecipeAcls and only return the `acl_id`
     * const recipeAclWithAcl_idOnly = await prisma.recipeAcl.createManyAndReturn({
     *   select: { acl_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecipeAclCreateManyAndReturnArgs>(args?: SelectSubset<T, RecipeAclCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecipeAcl.
     * @param {RecipeAclDeleteArgs} args - Arguments to delete one RecipeAcl.
     * @example
     * // Delete one RecipeAcl
     * const RecipeAcl = await prisma.recipeAcl.delete({
     *   where: {
     *     // ... filter to delete one RecipeAcl
     *   }
     * })
     * 
     */
    delete<T extends RecipeAclDeleteArgs>(args: SelectSubset<T, RecipeAclDeleteArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecipeAcl.
     * @param {RecipeAclUpdateArgs} args - Arguments to update one RecipeAcl.
     * @example
     * // Update one RecipeAcl
     * const recipeAcl = await prisma.recipeAcl.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecipeAclUpdateArgs>(args: SelectSubset<T, RecipeAclUpdateArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecipeAcls.
     * @param {RecipeAclDeleteManyArgs} args - Arguments to filter RecipeAcls to delete.
     * @example
     * // Delete a few RecipeAcls
     * const { count } = await prisma.recipeAcl.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecipeAclDeleteManyArgs>(args?: SelectSubset<T, RecipeAclDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecipeAcls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecipeAcls
     * const recipeAcl = await prisma.recipeAcl.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecipeAclUpdateManyArgs>(args: SelectSubset<T, RecipeAclUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecipeAcls and returns the data updated in the database.
     * @param {RecipeAclUpdateManyAndReturnArgs} args - Arguments to update many RecipeAcls.
     * @example
     * // Update many RecipeAcls
     * const recipeAcl = await prisma.recipeAcl.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecipeAcls and only return the `acl_id`
     * const recipeAclWithAcl_idOnly = await prisma.recipeAcl.updateManyAndReturn({
     *   select: { acl_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecipeAclUpdateManyAndReturnArgs>(args: SelectSubset<T, RecipeAclUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecipeAcl.
     * @param {RecipeAclUpsertArgs} args - Arguments to update or create a RecipeAcl.
     * @example
     * // Update or create a RecipeAcl
     * const recipeAcl = await prisma.recipeAcl.upsert({
     *   create: {
     *     // ... data to create a RecipeAcl
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecipeAcl we want to update
     *   }
     * })
     */
    upsert<T extends RecipeAclUpsertArgs>(args: SelectSubset<T, RecipeAclUpsertArgs<ExtArgs>>): Prisma__RecipeAclClient<$Result.GetResult<Prisma.$RecipeAclPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecipeAcls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclCountArgs} args - Arguments to filter RecipeAcls to count.
     * @example
     * // Count the number of RecipeAcls
     * const count = await prisma.recipeAcl.count({
     *   where: {
     *     // ... the filter for the RecipeAcls we want to count
     *   }
     * })
    **/
    count<T extends RecipeAclCountArgs>(
      args?: Subset<T, RecipeAclCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecipeAclCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecipeAcl.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecipeAclAggregateArgs>(args: Subset<T, RecipeAclAggregateArgs>): Prisma.PrismaPromise<GetRecipeAclAggregateType<T>>

    /**
     * Group by RecipeAcl.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAclGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecipeAclGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecipeAclGroupByArgs['orderBy'] }
        : { orderBy?: RecipeAclGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecipeAclGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecipeAclGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecipeAcl model
   */
  readonly fields: RecipeAclFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecipeAcl.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecipeAclClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipe<T extends RecipesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecipesDefaultArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecipeAcl model
   */
  interface RecipeAclFieldRefs {
    readonly acl_id: FieldRef<"RecipeAcl", 'Int'>
    readonly role_id: FieldRef<"RecipeAcl", 'String'>
    readonly permission: FieldRef<"RecipeAcl", 'Permission'>
    readonly recipe_id: FieldRef<"RecipeAcl", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RecipeAcl findUnique
   */
  export type RecipeAclFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * Filter, which RecipeAcl to fetch.
     */
    where: RecipeAclWhereUniqueInput
  }

  /**
   * RecipeAcl findUniqueOrThrow
   */
  export type RecipeAclFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * Filter, which RecipeAcl to fetch.
     */
    where: RecipeAclWhereUniqueInput
  }

  /**
   * RecipeAcl findFirst
   */
  export type RecipeAclFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * Filter, which RecipeAcl to fetch.
     */
    where?: RecipeAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecipeAcls to fetch.
     */
    orderBy?: RecipeAclOrderByWithRelationInput | RecipeAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecipeAcls.
     */
    cursor?: RecipeAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecipeAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecipeAcls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecipeAcls.
     */
    distinct?: RecipeAclScalarFieldEnum | RecipeAclScalarFieldEnum[]
  }

  /**
   * RecipeAcl findFirstOrThrow
   */
  export type RecipeAclFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * Filter, which RecipeAcl to fetch.
     */
    where?: RecipeAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecipeAcls to fetch.
     */
    orderBy?: RecipeAclOrderByWithRelationInput | RecipeAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecipeAcls.
     */
    cursor?: RecipeAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecipeAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecipeAcls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecipeAcls.
     */
    distinct?: RecipeAclScalarFieldEnum | RecipeAclScalarFieldEnum[]
  }

  /**
   * RecipeAcl findMany
   */
  export type RecipeAclFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * Filter, which RecipeAcls to fetch.
     */
    where?: RecipeAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecipeAcls to fetch.
     */
    orderBy?: RecipeAclOrderByWithRelationInput | RecipeAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecipeAcls.
     */
    cursor?: RecipeAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecipeAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecipeAcls.
     */
    skip?: number
    distinct?: RecipeAclScalarFieldEnum | RecipeAclScalarFieldEnum[]
  }

  /**
   * RecipeAcl create
   */
  export type RecipeAclCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * The data needed to create a RecipeAcl.
     */
    data: XOR<RecipeAclCreateInput, RecipeAclUncheckedCreateInput>
  }

  /**
   * RecipeAcl createMany
   */
  export type RecipeAclCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecipeAcls.
     */
    data: RecipeAclCreateManyInput | RecipeAclCreateManyInput[]
  }

  /**
   * RecipeAcl createManyAndReturn
   */
  export type RecipeAclCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * The data used to create many RecipeAcls.
     */
    data: RecipeAclCreateManyInput | RecipeAclCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecipeAcl update
   */
  export type RecipeAclUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * The data needed to update a RecipeAcl.
     */
    data: XOR<RecipeAclUpdateInput, RecipeAclUncheckedUpdateInput>
    /**
     * Choose, which RecipeAcl to update.
     */
    where: RecipeAclWhereUniqueInput
  }

  /**
   * RecipeAcl updateMany
   */
  export type RecipeAclUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecipeAcls.
     */
    data: XOR<RecipeAclUpdateManyMutationInput, RecipeAclUncheckedUpdateManyInput>
    /**
     * Filter which RecipeAcls to update
     */
    where?: RecipeAclWhereInput
    /**
     * Limit how many RecipeAcls to update.
     */
    limit?: number
  }

  /**
   * RecipeAcl updateManyAndReturn
   */
  export type RecipeAclUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * The data used to update RecipeAcls.
     */
    data: XOR<RecipeAclUpdateManyMutationInput, RecipeAclUncheckedUpdateManyInput>
    /**
     * Filter which RecipeAcls to update
     */
    where?: RecipeAclWhereInput
    /**
     * Limit how many RecipeAcls to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecipeAcl upsert
   */
  export type RecipeAclUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * The filter to search for the RecipeAcl to update in case it exists.
     */
    where: RecipeAclWhereUniqueInput
    /**
     * In case the RecipeAcl found by the `where` argument doesn't exist, create a new RecipeAcl with this data.
     */
    create: XOR<RecipeAclCreateInput, RecipeAclUncheckedCreateInput>
    /**
     * In case the RecipeAcl was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecipeAclUpdateInput, RecipeAclUncheckedUpdateInput>
  }

  /**
   * RecipeAcl delete
   */
  export type RecipeAclDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
    /**
     * Filter which RecipeAcl to delete.
     */
    where: RecipeAclWhereUniqueInput
  }

  /**
   * RecipeAcl deleteMany
   */
  export type RecipeAclDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecipeAcls to delete
     */
    where?: RecipeAclWhereInput
    /**
     * Limit how many RecipeAcls to delete.
     */
    limit?: number
  }

  /**
   * RecipeAcl without action
   */
  export type RecipeAclDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeAcl
     */
    select?: RecipeAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecipeAcl
     */
    omit?: RecipeAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeAclInclude<ExtArgs> | null
  }


  /**
   * Model Recipe_bags
   */

  export type AggregateRecipe_bags = {
    _count: Recipe_bagsCountAggregateOutputType | null
    _avg: Recipe_bagsAvgAggregateOutputType | null
    _sum: Recipe_bagsSumAggregateOutputType | null
    _min: Recipe_bagsMinAggregateOutputType | null
    _max: Recipe_bagsMaxAggregateOutputType | null
  }

  export type Recipe_bagsAvgAggregateOutputType = {
    position: number | null
  }

  export type Recipe_bagsSumAggregateOutputType = {
    position: number | null
  }

  export type Recipe_bagsMinAggregateOutputType = {
    recipe_id: string | null
    bag_id: string | null
    position: number | null
    with_acl: boolean | null
    load_modules: boolean | null
  }

  export type Recipe_bagsMaxAggregateOutputType = {
    recipe_id: string | null
    bag_id: string | null
    position: number | null
    with_acl: boolean | null
    load_modules: boolean | null
  }

  export type Recipe_bagsCountAggregateOutputType = {
    recipe_id: number
    bag_id: number
    position: number
    with_acl: number
    load_modules: number
    _all: number
  }


  export type Recipe_bagsAvgAggregateInputType = {
    position?: true
  }

  export type Recipe_bagsSumAggregateInputType = {
    position?: true
  }

  export type Recipe_bagsMinAggregateInputType = {
    recipe_id?: true
    bag_id?: true
    position?: true
    with_acl?: true
    load_modules?: true
  }

  export type Recipe_bagsMaxAggregateInputType = {
    recipe_id?: true
    bag_id?: true
    position?: true
    with_acl?: true
    load_modules?: true
  }

  export type Recipe_bagsCountAggregateInputType = {
    recipe_id?: true
    bag_id?: true
    position?: true
    with_acl?: true
    load_modules?: true
    _all?: true
  }

  export type Recipe_bagsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Recipe_bags to aggregate.
     */
    where?: Recipe_bagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipe_bags to fetch.
     */
    orderBy?: Recipe_bagsOrderByWithRelationInput | Recipe_bagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: Recipe_bagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipe_bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipe_bags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Recipe_bags
    **/
    _count?: true | Recipe_bagsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Recipe_bagsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Recipe_bagsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Recipe_bagsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Recipe_bagsMaxAggregateInputType
  }

  export type GetRecipe_bagsAggregateType<T extends Recipe_bagsAggregateArgs> = {
        [P in keyof T & keyof AggregateRecipe_bags]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecipe_bags[P]>
      : GetScalarType<T[P], AggregateRecipe_bags[P]>
  }




  export type Recipe_bagsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: Recipe_bagsWhereInput
    orderBy?: Recipe_bagsOrderByWithAggregationInput | Recipe_bagsOrderByWithAggregationInput[]
    by: Recipe_bagsScalarFieldEnum[] | Recipe_bagsScalarFieldEnum
    having?: Recipe_bagsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Recipe_bagsCountAggregateInputType | true
    _avg?: Recipe_bagsAvgAggregateInputType
    _sum?: Recipe_bagsSumAggregateInputType
    _min?: Recipe_bagsMinAggregateInputType
    _max?: Recipe_bagsMaxAggregateInputType
  }

  export type Recipe_bagsGroupByOutputType = {
    recipe_id: string
    bag_id: string
    position: number
    with_acl: boolean
    load_modules: boolean
    _count: Recipe_bagsCountAggregateOutputType | null
    _avg: Recipe_bagsAvgAggregateOutputType | null
    _sum: Recipe_bagsSumAggregateOutputType | null
    _min: Recipe_bagsMinAggregateOutputType | null
    _max: Recipe_bagsMaxAggregateOutputType | null
  }

  type GetRecipe_bagsGroupByPayload<T extends Recipe_bagsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Recipe_bagsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Recipe_bagsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Recipe_bagsGroupByOutputType[P]>
            : GetScalarType<T[P], Recipe_bagsGroupByOutputType[P]>
        }
      >
    >


  export type Recipe_bagsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    recipe_id?: boolean
    bag_id?: boolean
    position?: boolean
    with_acl?: boolean
    load_modules?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipe_bags"]>

  export type Recipe_bagsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    recipe_id?: boolean
    bag_id?: boolean
    position?: boolean
    with_acl?: boolean
    load_modules?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipe_bags"]>

  export type Recipe_bagsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    recipe_id?: boolean
    bag_id?: boolean
    position?: boolean
    with_acl?: boolean
    load_modules?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipe_bags"]>

  export type Recipe_bagsSelectScalar = {
    recipe_id?: boolean
    bag_id?: boolean
    position?: boolean
    with_acl?: boolean
    load_modules?: boolean
  }

  export type Recipe_bagsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"recipe_id" | "bag_id" | "position" | "with_acl" | "load_modules", ExtArgs["result"]["recipe_bags"]>
  export type Recipe_bagsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }
  export type Recipe_bagsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }
  export type Recipe_bagsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    recipe?: boolean | RecipesDefaultArgs<ExtArgs>
  }

  export type $Recipe_bagsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Recipe_bags"
    objects: {
      bag: Prisma.$BagsPayload<ExtArgs>
      recipe: Prisma.$RecipesPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      recipe_id: string
      bag_id: string
      position: number
      with_acl: boolean
      load_modules: boolean
    }, ExtArgs["result"]["recipe_bags"]>
    composites: {}
  }

  type Recipe_bagsGetPayload<S extends boolean | null | undefined | Recipe_bagsDefaultArgs> = $Result.GetResult<Prisma.$Recipe_bagsPayload, S>

  type Recipe_bagsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<Recipe_bagsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: Recipe_bagsCountAggregateInputType | true
    }

  export interface Recipe_bagsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Recipe_bags'], meta: { name: 'Recipe_bags' } }
    /**
     * Find zero or one Recipe_bags that matches the filter.
     * @param {Recipe_bagsFindUniqueArgs} args - Arguments to find a Recipe_bags
     * @example
     * // Get one Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends Recipe_bagsFindUniqueArgs>(args: SelectSubset<T, Recipe_bagsFindUniqueArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Recipe_bags that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {Recipe_bagsFindUniqueOrThrowArgs} args - Arguments to find a Recipe_bags
     * @example
     * // Get one Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends Recipe_bagsFindUniqueOrThrowArgs>(args: SelectSubset<T, Recipe_bagsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Recipe_bags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsFindFirstArgs} args - Arguments to find a Recipe_bags
     * @example
     * // Get one Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends Recipe_bagsFindFirstArgs>(args?: SelectSubset<T, Recipe_bagsFindFirstArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Recipe_bags that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsFindFirstOrThrowArgs} args - Arguments to find a Recipe_bags
     * @example
     * // Get one Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends Recipe_bagsFindFirstOrThrowArgs>(args?: SelectSubset<T, Recipe_bagsFindFirstOrThrowArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Recipe_bags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.findMany()
     * 
     * // Get first 10 Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.findMany({ take: 10 })
     * 
     * // Only select the `recipe_id`
     * const recipe_bagsWithRecipe_idOnly = await prisma.recipe_bags.findMany({ select: { recipe_id: true } })
     * 
     */
    findMany<T extends Recipe_bagsFindManyArgs>(args?: SelectSubset<T, Recipe_bagsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Recipe_bags.
     * @param {Recipe_bagsCreateArgs} args - Arguments to create a Recipe_bags.
     * @example
     * // Create one Recipe_bags
     * const Recipe_bags = await prisma.recipe_bags.create({
     *   data: {
     *     // ... data to create a Recipe_bags
     *   }
     * })
     * 
     */
    create<T extends Recipe_bagsCreateArgs>(args: SelectSubset<T, Recipe_bagsCreateArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Recipe_bags.
     * @param {Recipe_bagsCreateManyArgs} args - Arguments to create many Recipe_bags.
     * @example
     * // Create many Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends Recipe_bagsCreateManyArgs>(args?: SelectSubset<T, Recipe_bagsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Recipe_bags and returns the data saved in the database.
     * @param {Recipe_bagsCreateManyAndReturnArgs} args - Arguments to create many Recipe_bags.
     * @example
     * // Create many Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Recipe_bags and only return the `recipe_id`
     * const recipe_bagsWithRecipe_idOnly = await prisma.recipe_bags.createManyAndReturn({
     *   select: { recipe_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends Recipe_bagsCreateManyAndReturnArgs>(args?: SelectSubset<T, Recipe_bagsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Recipe_bags.
     * @param {Recipe_bagsDeleteArgs} args - Arguments to delete one Recipe_bags.
     * @example
     * // Delete one Recipe_bags
     * const Recipe_bags = await prisma.recipe_bags.delete({
     *   where: {
     *     // ... filter to delete one Recipe_bags
     *   }
     * })
     * 
     */
    delete<T extends Recipe_bagsDeleteArgs>(args: SelectSubset<T, Recipe_bagsDeleteArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Recipe_bags.
     * @param {Recipe_bagsUpdateArgs} args - Arguments to update one Recipe_bags.
     * @example
     * // Update one Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends Recipe_bagsUpdateArgs>(args: SelectSubset<T, Recipe_bagsUpdateArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Recipe_bags.
     * @param {Recipe_bagsDeleteManyArgs} args - Arguments to filter Recipe_bags to delete.
     * @example
     * // Delete a few Recipe_bags
     * const { count } = await prisma.recipe_bags.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends Recipe_bagsDeleteManyArgs>(args?: SelectSubset<T, Recipe_bagsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Recipe_bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends Recipe_bagsUpdateManyArgs>(args: SelectSubset<T, Recipe_bagsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Recipe_bags and returns the data updated in the database.
     * @param {Recipe_bagsUpdateManyAndReturnArgs} args - Arguments to update many Recipe_bags.
     * @example
     * // Update many Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Recipe_bags and only return the `recipe_id`
     * const recipe_bagsWithRecipe_idOnly = await prisma.recipe_bags.updateManyAndReturn({
     *   select: { recipe_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends Recipe_bagsUpdateManyAndReturnArgs>(args: SelectSubset<T, Recipe_bagsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Recipe_bags.
     * @param {Recipe_bagsUpsertArgs} args - Arguments to update or create a Recipe_bags.
     * @example
     * // Update or create a Recipe_bags
     * const recipe_bags = await prisma.recipe_bags.upsert({
     *   create: {
     *     // ... data to create a Recipe_bags
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Recipe_bags we want to update
     *   }
     * })
     */
    upsert<T extends Recipe_bagsUpsertArgs>(args: SelectSubset<T, Recipe_bagsUpsertArgs<ExtArgs>>): Prisma__Recipe_bagsClient<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Recipe_bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsCountArgs} args - Arguments to filter Recipe_bags to count.
     * @example
     * // Count the number of Recipe_bags
     * const count = await prisma.recipe_bags.count({
     *   where: {
     *     // ... the filter for the Recipe_bags we want to count
     *   }
     * })
    **/
    count<T extends Recipe_bagsCountArgs>(
      args?: Subset<T, Recipe_bagsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Recipe_bagsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Recipe_bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Recipe_bagsAggregateArgs>(args: Subset<T, Recipe_bagsAggregateArgs>): Prisma.PrismaPromise<GetRecipe_bagsAggregateType<T>>

    /**
     * Group by Recipe_bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Recipe_bagsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends Recipe_bagsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: Recipe_bagsGroupByArgs['orderBy'] }
        : { orderBy?: Recipe_bagsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, Recipe_bagsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecipe_bagsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Recipe_bags model
   */
  readonly fields: Recipe_bagsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Recipe_bags.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__Recipe_bagsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bag<T extends BagsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BagsDefaultArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    recipe<T extends RecipesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecipesDefaultArgs<ExtArgs>>): Prisma__RecipesClient<$Result.GetResult<Prisma.$RecipesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Recipe_bags model
   */
  interface Recipe_bagsFieldRefs {
    readonly recipe_id: FieldRef<"Recipe_bags", 'String'>
    readonly bag_id: FieldRef<"Recipe_bags", 'String'>
    readonly position: FieldRef<"Recipe_bags", 'Int'>
    readonly with_acl: FieldRef<"Recipe_bags", 'Boolean'>
    readonly load_modules: FieldRef<"Recipe_bags", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Recipe_bags findUnique
   */
  export type Recipe_bagsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * Filter, which Recipe_bags to fetch.
     */
    where: Recipe_bagsWhereUniqueInput
  }

  /**
   * Recipe_bags findUniqueOrThrow
   */
  export type Recipe_bagsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * Filter, which Recipe_bags to fetch.
     */
    where: Recipe_bagsWhereUniqueInput
  }

  /**
   * Recipe_bags findFirst
   */
  export type Recipe_bagsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * Filter, which Recipe_bags to fetch.
     */
    where?: Recipe_bagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipe_bags to fetch.
     */
    orderBy?: Recipe_bagsOrderByWithRelationInput | Recipe_bagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Recipe_bags.
     */
    cursor?: Recipe_bagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipe_bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipe_bags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Recipe_bags.
     */
    distinct?: Recipe_bagsScalarFieldEnum | Recipe_bagsScalarFieldEnum[]
  }

  /**
   * Recipe_bags findFirstOrThrow
   */
  export type Recipe_bagsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * Filter, which Recipe_bags to fetch.
     */
    where?: Recipe_bagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipe_bags to fetch.
     */
    orderBy?: Recipe_bagsOrderByWithRelationInput | Recipe_bagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Recipe_bags.
     */
    cursor?: Recipe_bagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipe_bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipe_bags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Recipe_bags.
     */
    distinct?: Recipe_bagsScalarFieldEnum | Recipe_bagsScalarFieldEnum[]
  }

  /**
   * Recipe_bags findMany
   */
  export type Recipe_bagsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * Filter, which Recipe_bags to fetch.
     */
    where?: Recipe_bagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipe_bags to fetch.
     */
    orderBy?: Recipe_bagsOrderByWithRelationInput | Recipe_bagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Recipe_bags.
     */
    cursor?: Recipe_bagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipe_bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipe_bags.
     */
    skip?: number
    distinct?: Recipe_bagsScalarFieldEnum | Recipe_bagsScalarFieldEnum[]
  }

  /**
   * Recipe_bags create
   */
  export type Recipe_bagsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * The data needed to create a Recipe_bags.
     */
    data: XOR<Recipe_bagsCreateInput, Recipe_bagsUncheckedCreateInput>
  }

  /**
   * Recipe_bags createMany
   */
  export type Recipe_bagsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Recipe_bags.
     */
    data: Recipe_bagsCreateManyInput | Recipe_bagsCreateManyInput[]
  }

  /**
   * Recipe_bags createManyAndReturn
   */
  export type Recipe_bagsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * The data used to create many Recipe_bags.
     */
    data: Recipe_bagsCreateManyInput | Recipe_bagsCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Recipe_bags update
   */
  export type Recipe_bagsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * The data needed to update a Recipe_bags.
     */
    data: XOR<Recipe_bagsUpdateInput, Recipe_bagsUncheckedUpdateInput>
    /**
     * Choose, which Recipe_bags to update.
     */
    where: Recipe_bagsWhereUniqueInput
  }

  /**
   * Recipe_bags updateMany
   */
  export type Recipe_bagsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Recipe_bags.
     */
    data: XOR<Recipe_bagsUpdateManyMutationInput, Recipe_bagsUncheckedUpdateManyInput>
    /**
     * Filter which Recipe_bags to update
     */
    where?: Recipe_bagsWhereInput
    /**
     * Limit how many Recipe_bags to update.
     */
    limit?: number
  }

  /**
   * Recipe_bags updateManyAndReturn
   */
  export type Recipe_bagsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * The data used to update Recipe_bags.
     */
    data: XOR<Recipe_bagsUpdateManyMutationInput, Recipe_bagsUncheckedUpdateManyInput>
    /**
     * Filter which Recipe_bags to update
     */
    where?: Recipe_bagsWhereInput
    /**
     * Limit how many Recipe_bags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Recipe_bags upsert
   */
  export type Recipe_bagsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * The filter to search for the Recipe_bags to update in case it exists.
     */
    where: Recipe_bagsWhereUniqueInput
    /**
     * In case the Recipe_bags found by the `where` argument doesn't exist, create a new Recipe_bags with this data.
     */
    create: XOR<Recipe_bagsCreateInput, Recipe_bagsUncheckedCreateInput>
    /**
     * In case the Recipe_bags was found with the provided `where` argument, update it with this data.
     */
    update: XOR<Recipe_bagsUpdateInput, Recipe_bagsUncheckedUpdateInput>
  }

  /**
   * Recipe_bags delete
   */
  export type Recipe_bagsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    /**
     * Filter which Recipe_bags to delete.
     */
    where: Recipe_bagsWhereUniqueInput
  }

  /**
   * Recipe_bags deleteMany
   */
  export type Recipe_bagsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Recipe_bags to delete
     */
    where?: Recipe_bagsWhereInput
    /**
     * Limit how many Recipe_bags to delete.
     */
    limit?: number
  }

  /**
   * Recipe_bags without action
   */
  export type Recipe_bagsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
  }


  /**
   * Model Bags
   */

  export type AggregateBags = {
    _count: BagsCountAggregateOutputType | null
    _min: BagsMinAggregateOutputType | null
    _max: BagsMaxAggregateOutputType | null
  }

  export type BagsMinAggregateOutputType = {
    bag_id: string | null
    bag_name: string | null
    description: string | null
    owner_id: string | null
  }

  export type BagsMaxAggregateOutputType = {
    bag_id: string | null
    bag_name: string | null
    description: string | null
    owner_id: string | null
  }

  export type BagsCountAggregateOutputType = {
    bag_id: number
    bag_name: number
    description: number
    owner_id: number
    _all: number
  }


  export type BagsMinAggregateInputType = {
    bag_id?: true
    bag_name?: true
    description?: true
    owner_id?: true
  }

  export type BagsMaxAggregateInputType = {
    bag_id?: true
    bag_name?: true
    description?: true
    owner_id?: true
  }

  export type BagsCountAggregateInputType = {
    bag_id?: true
    bag_name?: true
    description?: true
    owner_id?: true
    _all?: true
  }

  export type BagsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bags to aggregate.
     */
    where?: BagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bags to fetch.
     */
    orderBy?: BagsOrderByWithRelationInput | BagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bags
    **/
    _count?: true | BagsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BagsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BagsMaxAggregateInputType
  }

  export type GetBagsAggregateType<T extends BagsAggregateArgs> = {
        [P in keyof T & keyof AggregateBags]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBags[P]>
      : GetScalarType<T[P], AggregateBags[P]>
  }




  export type BagsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BagsWhereInput
    orderBy?: BagsOrderByWithAggregationInput | BagsOrderByWithAggregationInput[]
    by: BagsScalarFieldEnum[] | BagsScalarFieldEnum
    having?: BagsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BagsCountAggregateInputType | true
    _min?: BagsMinAggregateInputType
    _max?: BagsMaxAggregateInputType
  }

  export type BagsGroupByOutputType = {
    bag_id: string
    bag_name: string
    description: string
    owner_id: string | null
    _count: BagsCountAggregateOutputType | null
    _min: BagsMinAggregateOutputType | null
    _max: BagsMaxAggregateOutputType | null
  }

  type GetBagsGroupByPayload<T extends BagsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BagsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BagsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BagsGroupByOutputType[P]>
            : GetScalarType<T[P], BagsGroupByOutputType[P]>
        }
      >
    >


  export type BagsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    bag_id?: boolean
    bag_name?: boolean
    description?: boolean
    owner_id?: boolean
    recipe_bags?: boolean | Bags$recipe_bagsArgs<ExtArgs>
    tiddlers?: boolean | Bags$tiddlersArgs<ExtArgs>
    acl?: boolean | Bags$aclArgs<ExtArgs>
    _count?: boolean | BagsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bags"]>

  export type BagsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    bag_id?: boolean
    bag_name?: boolean
    description?: boolean
    owner_id?: boolean
  }, ExtArgs["result"]["bags"]>

  export type BagsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    bag_id?: boolean
    bag_name?: boolean
    description?: boolean
    owner_id?: boolean
  }, ExtArgs["result"]["bags"]>

  export type BagsSelectScalar = {
    bag_id?: boolean
    bag_name?: boolean
    description?: boolean
    owner_id?: boolean
  }

  export type BagsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"bag_id" | "bag_name" | "description" | "owner_id", ExtArgs["result"]["bags"]>
  export type BagsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe_bags?: boolean | Bags$recipe_bagsArgs<ExtArgs>
    tiddlers?: boolean | Bags$tiddlersArgs<ExtArgs>
    acl?: boolean | Bags$aclArgs<ExtArgs>
    _count?: boolean | BagsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BagsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type BagsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BagsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bags"
    objects: {
      recipe_bags: Prisma.$Recipe_bagsPayload<ExtArgs>[]
      tiddlers: Prisma.$TiddlersPayload<ExtArgs>[]
      acl: Prisma.$BagAclPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      bag_id: string
      bag_name: string
      description: string
      owner_id: string | null
    }, ExtArgs["result"]["bags"]>
    composites: {}
  }

  type BagsGetPayload<S extends boolean | null | undefined | BagsDefaultArgs> = $Result.GetResult<Prisma.$BagsPayload, S>

  type BagsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BagsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: BagsCountAggregateInputType | true
    }

  export interface BagsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bags'], meta: { name: 'Bags' } }
    /**
     * Find zero or one Bags that matches the filter.
     * @param {BagsFindUniqueArgs} args - Arguments to find a Bags
     * @example
     * // Get one Bags
     * const bags = await prisma.bags.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BagsFindUniqueArgs>(args: SelectSubset<T, BagsFindUniqueArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bags that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BagsFindUniqueOrThrowArgs} args - Arguments to find a Bags
     * @example
     * // Get one Bags
     * const bags = await prisma.bags.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BagsFindUniqueOrThrowArgs>(args: SelectSubset<T, BagsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsFindFirstArgs} args - Arguments to find a Bags
     * @example
     * // Get one Bags
     * const bags = await prisma.bags.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BagsFindFirstArgs>(args?: SelectSubset<T, BagsFindFirstArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bags that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsFindFirstOrThrowArgs} args - Arguments to find a Bags
     * @example
     * // Get one Bags
     * const bags = await prisma.bags.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BagsFindFirstOrThrowArgs>(args?: SelectSubset<T, BagsFindFirstOrThrowArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bags
     * const bags = await prisma.bags.findMany()
     * 
     * // Get first 10 Bags
     * const bags = await prisma.bags.findMany({ take: 10 })
     * 
     * // Only select the `bag_id`
     * const bagsWithBag_idOnly = await prisma.bags.findMany({ select: { bag_id: true } })
     * 
     */
    findMany<T extends BagsFindManyArgs>(args?: SelectSubset<T, BagsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bags.
     * @param {BagsCreateArgs} args - Arguments to create a Bags.
     * @example
     * // Create one Bags
     * const Bags = await prisma.bags.create({
     *   data: {
     *     // ... data to create a Bags
     *   }
     * })
     * 
     */
    create<T extends BagsCreateArgs>(args: SelectSubset<T, BagsCreateArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bags.
     * @param {BagsCreateManyArgs} args - Arguments to create many Bags.
     * @example
     * // Create many Bags
     * const bags = await prisma.bags.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BagsCreateManyArgs>(args?: SelectSubset<T, BagsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bags and returns the data saved in the database.
     * @param {BagsCreateManyAndReturnArgs} args - Arguments to create many Bags.
     * @example
     * // Create many Bags
     * const bags = await prisma.bags.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bags and only return the `bag_id`
     * const bagsWithBag_idOnly = await prisma.bags.createManyAndReturn({
     *   select: { bag_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BagsCreateManyAndReturnArgs>(args?: SelectSubset<T, BagsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bags.
     * @param {BagsDeleteArgs} args - Arguments to delete one Bags.
     * @example
     * // Delete one Bags
     * const Bags = await prisma.bags.delete({
     *   where: {
     *     // ... filter to delete one Bags
     *   }
     * })
     * 
     */
    delete<T extends BagsDeleteArgs>(args: SelectSubset<T, BagsDeleteArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bags.
     * @param {BagsUpdateArgs} args - Arguments to update one Bags.
     * @example
     * // Update one Bags
     * const bags = await prisma.bags.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BagsUpdateArgs>(args: SelectSubset<T, BagsUpdateArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bags.
     * @param {BagsDeleteManyArgs} args - Arguments to filter Bags to delete.
     * @example
     * // Delete a few Bags
     * const { count } = await prisma.bags.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BagsDeleteManyArgs>(args?: SelectSubset<T, BagsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bags
     * const bags = await prisma.bags.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BagsUpdateManyArgs>(args: SelectSubset<T, BagsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bags and returns the data updated in the database.
     * @param {BagsUpdateManyAndReturnArgs} args - Arguments to update many Bags.
     * @example
     * // Update many Bags
     * const bags = await prisma.bags.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bags and only return the `bag_id`
     * const bagsWithBag_idOnly = await prisma.bags.updateManyAndReturn({
     *   select: { bag_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BagsUpdateManyAndReturnArgs>(args: SelectSubset<T, BagsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bags.
     * @param {BagsUpsertArgs} args - Arguments to update or create a Bags.
     * @example
     * // Update or create a Bags
     * const bags = await prisma.bags.upsert({
     *   create: {
     *     // ... data to create a Bags
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bags we want to update
     *   }
     * })
     */
    upsert<T extends BagsUpsertArgs>(args: SelectSubset<T, BagsUpsertArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsCountArgs} args - Arguments to filter Bags to count.
     * @example
     * // Count the number of Bags
     * const count = await prisma.bags.count({
     *   where: {
     *     // ... the filter for the Bags we want to count
     *   }
     * })
    **/
    count<T extends BagsCountArgs>(
      args?: Subset<T, BagsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BagsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BagsAggregateArgs>(args: Subset<T, BagsAggregateArgs>): Prisma.PrismaPromise<GetBagsAggregateType<T>>

    /**
     * Group by Bags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BagsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BagsGroupByArgs['orderBy'] }
        : { orderBy?: BagsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BagsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBagsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bags model
   */
  readonly fields: BagsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bags.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BagsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipe_bags<T extends Bags$recipe_bagsArgs<ExtArgs> = {}>(args?: Subset<T, Bags$recipe_bagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Recipe_bagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tiddlers<T extends Bags$tiddlersArgs<ExtArgs> = {}>(args?: Subset<T, Bags$tiddlersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    acl<T extends Bags$aclArgs<ExtArgs> = {}>(args?: Subset<T, Bags$aclArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bags model
   */
  interface BagsFieldRefs {
    readonly bag_id: FieldRef<"Bags", 'String'>
    readonly bag_name: FieldRef<"Bags", 'String'>
    readonly description: FieldRef<"Bags", 'String'>
    readonly owner_id: FieldRef<"Bags", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Bags findUnique
   */
  export type BagsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * Filter, which Bags to fetch.
     */
    where: BagsWhereUniqueInput
  }

  /**
   * Bags findUniqueOrThrow
   */
  export type BagsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * Filter, which Bags to fetch.
     */
    where: BagsWhereUniqueInput
  }

  /**
   * Bags findFirst
   */
  export type BagsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * Filter, which Bags to fetch.
     */
    where?: BagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bags to fetch.
     */
    orderBy?: BagsOrderByWithRelationInput | BagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bags.
     */
    cursor?: BagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bags.
     */
    distinct?: BagsScalarFieldEnum | BagsScalarFieldEnum[]
  }

  /**
   * Bags findFirstOrThrow
   */
  export type BagsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * Filter, which Bags to fetch.
     */
    where?: BagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bags to fetch.
     */
    orderBy?: BagsOrderByWithRelationInput | BagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bags.
     */
    cursor?: BagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bags.
     */
    distinct?: BagsScalarFieldEnum | BagsScalarFieldEnum[]
  }

  /**
   * Bags findMany
   */
  export type BagsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * Filter, which Bags to fetch.
     */
    where?: BagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bags to fetch.
     */
    orderBy?: BagsOrderByWithRelationInput | BagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bags.
     */
    cursor?: BagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bags.
     */
    skip?: number
    distinct?: BagsScalarFieldEnum | BagsScalarFieldEnum[]
  }

  /**
   * Bags create
   */
  export type BagsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * The data needed to create a Bags.
     */
    data: XOR<BagsCreateInput, BagsUncheckedCreateInput>
  }

  /**
   * Bags createMany
   */
  export type BagsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bags.
     */
    data: BagsCreateManyInput | BagsCreateManyInput[]
  }

  /**
   * Bags createManyAndReturn
   */
  export type BagsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * The data used to create many Bags.
     */
    data: BagsCreateManyInput | BagsCreateManyInput[]
  }

  /**
   * Bags update
   */
  export type BagsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * The data needed to update a Bags.
     */
    data: XOR<BagsUpdateInput, BagsUncheckedUpdateInput>
    /**
     * Choose, which Bags to update.
     */
    where: BagsWhereUniqueInput
  }

  /**
   * Bags updateMany
   */
  export type BagsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bags.
     */
    data: XOR<BagsUpdateManyMutationInput, BagsUncheckedUpdateManyInput>
    /**
     * Filter which Bags to update
     */
    where?: BagsWhereInput
    /**
     * Limit how many Bags to update.
     */
    limit?: number
  }

  /**
   * Bags updateManyAndReturn
   */
  export type BagsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * The data used to update Bags.
     */
    data: XOR<BagsUpdateManyMutationInput, BagsUncheckedUpdateManyInput>
    /**
     * Filter which Bags to update
     */
    where?: BagsWhereInput
    /**
     * Limit how many Bags to update.
     */
    limit?: number
  }

  /**
   * Bags upsert
   */
  export type BagsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * The filter to search for the Bags to update in case it exists.
     */
    where: BagsWhereUniqueInput
    /**
     * In case the Bags found by the `where` argument doesn't exist, create a new Bags with this data.
     */
    create: XOR<BagsCreateInput, BagsUncheckedCreateInput>
    /**
     * In case the Bags was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BagsUpdateInput, BagsUncheckedUpdateInput>
  }

  /**
   * Bags delete
   */
  export type BagsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
    /**
     * Filter which Bags to delete.
     */
    where: BagsWhereUniqueInput
  }

  /**
   * Bags deleteMany
   */
  export type BagsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bags to delete
     */
    where?: BagsWhereInput
    /**
     * Limit how many Bags to delete.
     */
    limit?: number
  }

  /**
   * Bags.recipe_bags
   */
  export type Bags$recipe_bagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe_bags
     */
    select?: Recipe_bagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe_bags
     */
    omit?: Recipe_bagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Recipe_bagsInclude<ExtArgs> | null
    where?: Recipe_bagsWhereInput
    orderBy?: Recipe_bagsOrderByWithRelationInput | Recipe_bagsOrderByWithRelationInput[]
    cursor?: Recipe_bagsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Recipe_bagsScalarFieldEnum | Recipe_bagsScalarFieldEnum[]
  }

  /**
   * Bags.tiddlers
   */
  export type Bags$tiddlersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    where?: TiddlersWhereInput
    orderBy?: TiddlersOrderByWithRelationInput | TiddlersOrderByWithRelationInput[]
    cursor?: TiddlersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TiddlersScalarFieldEnum | TiddlersScalarFieldEnum[]
  }

  /**
   * Bags.acl
   */
  export type Bags$aclArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    where?: BagAclWhereInput
    orderBy?: BagAclOrderByWithRelationInput | BagAclOrderByWithRelationInput[]
    cursor?: BagAclWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BagAclScalarFieldEnum | BagAclScalarFieldEnum[]
  }

  /**
   * Bags without action
   */
  export type BagsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bags
     */
    select?: BagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bags
     */
    omit?: BagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagsInclude<ExtArgs> | null
  }


  /**
   * Model BagAcl
   */

  export type AggregateBagAcl = {
    _count: BagAclCountAggregateOutputType | null
    _avg: BagAclAvgAggregateOutputType | null
    _sum: BagAclSumAggregateOutputType | null
    _min: BagAclMinAggregateOutputType | null
    _max: BagAclMaxAggregateOutputType | null
  }

  export type BagAclAvgAggregateOutputType = {
    acl_id: number | null
  }

  export type BagAclSumAggregateOutputType = {
    acl_id: number | null
  }

  export type BagAclMinAggregateOutputType = {
    acl_id: number | null
    bag_id: string | null
    role_id: string | null
    permission: $Enums.Permission | null
  }

  export type BagAclMaxAggregateOutputType = {
    acl_id: number | null
    bag_id: string | null
    role_id: string | null
    permission: $Enums.Permission | null
  }

  export type BagAclCountAggregateOutputType = {
    acl_id: number
    bag_id: number
    role_id: number
    permission: number
    _all: number
  }


  export type BagAclAvgAggregateInputType = {
    acl_id?: true
  }

  export type BagAclSumAggregateInputType = {
    acl_id?: true
  }

  export type BagAclMinAggregateInputType = {
    acl_id?: true
    bag_id?: true
    role_id?: true
    permission?: true
  }

  export type BagAclMaxAggregateInputType = {
    acl_id?: true
    bag_id?: true
    role_id?: true
    permission?: true
  }

  export type BagAclCountAggregateInputType = {
    acl_id?: true
    bag_id?: true
    role_id?: true
    permission?: true
    _all?: true
  }

  export type BagAclAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BagAcl to aggregate.
     */
    where?: BagAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BagAcls to fetch.
     */
    orderBy?: BagAclOrderByWithRelationInput | BagAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BagAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BagAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BagAcls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BagAcls
    **/
    _count?: true | BagAclCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BagAclAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BagAclSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BagAclMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BagAclMaxAggregateInputType
  }

  export type GetBagAclAggregateType<T extends BagAclAggregateArgs> = {
        [P in keyof T & keyof AggregateBagAcl]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBagAcl[P]>
      : GetScalarType<T[P], AggregateBagAcl[P]>
  }




  export type BagAclGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BagAclWhereInput
    orderBy?: BagAclOrderByWithAggregationInput | BagAclOrderByWithAggregationInput[]
    by: BagAclScalarFieldEnum[] | BagAclScalarFieldEnum
    having?: BagAclScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BagAclCountAggregateInputType | true
    _avg?: BagAclAvgAggregateInputType
    _sum?: BagAclSumAggregateInputType
    _min?: BagAclMinAggregateInputType
    _max?: BagAclMaxAggregateInputType
  }

  export type BagAclGroupByOutputType = {
    acl_id: number
    bag_id: string
    role_id: string
    permission: $Enums.Permission
    _count: BagAclCountAggregateOutputType | null
    _avg: BagAclAvgAggregateOutputType | null
    _sum: BagAclSumAggregateOutputType | null
    _min: BagAclMinAggregateOutputType | null
    _max: BagAclMaxAggregateOutputType | null
  }

  type GetBagAclGroupByPayload<T extends BagAclGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BagAclGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BagAclGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BagAclGroupByOutputType[P]>
            : GetScalarType<T[P], BagAclGroupByOutputType[P]>
        }
      >
    >


  export type BagAclSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    acl_id?: boolean
    bag_id?: boolean
    role_id?: boolean
    permission?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bagAcl"]>

  export type BagAclSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    acl_id?: boolean
    bag_id?: boolean
    role_id?: boolean
    permission?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bagAcl"]>

  export type BagAclSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    acl_id?: boolean
    bag_id?: boolean
    role_id?: boolean
    permission?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bagAcl"]>

  export type BagAclSelectScalar = {
    acl_id?: boolean
    bag_id?: boolean
    role_id?: boolean
    permission?: boolean
  }

  export type BagAclOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"acl_id" | "bag_id" | "role_id" | "permission", ExtArgs["result"]["bagAcl"]>
  export type BagAclInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }
  export type BagAclIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }
  export type BagAclIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }

  export type $BagAclPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BagAcl"
    objects: {
      bag: Prisma.$BagsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      acl_id: number
      bag_id: string
      role_id: string
      permission: $Enums.Permission
    }, ExtArgs["result"]["bagAcl"]>
    composites: {}
  }

  type BagAclGetPayload<S extends boolean | null | undefined | BagAclDefaultArgs> = $Result.GetResult<Prisma.$BagAclPayload, S>

  type BagAclCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BagAclFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: BagAclCountAggregateInputType | true
    }

  export interface BagAclDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BagAcl'], meta: { name: 'BagAcl' } }
    /**
     * Find zero or one BagAcl that matches the filter.
     * @param {BagAclFindUniqueArgs} args - Arguments to find a BagAcl
     * @example
     * // Get one BagAcl
     * const bagAcl = await prisma.bagAcl.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BagAclFindUniqueArgs>(args: SelectSubset<T, BagAclFindUniqueArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BagAcl that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BagAclFindUniqueOrThrowArgs} args - Arguments to find a BagAcl
     * @example
     * // Get one BagAcl
     * const bagAcl = await prisma.bagAcl.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BagAclFindUniqueOrThrowArgs>(args: SelectSubset<T, BagAclFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BagAcl that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclFindFirstArgs} args - Arguments to find a BagAcl
     * @example
     * // Get one BagAcl
     * const bagAcl = await prisma.bagAcl.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BagAclFindFirstArgs>(args?: SelectSubset<T, BagAclFindFirstArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BagAcl that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclFindFirstOrThrowArgs} args - Arguments to find a BagAcl
     * @example
     * // Get one BagAcl
     * const bagAcl = await prisma.bagAcl.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BagAclFindFirstOrThrowArgs>(args?: SelectSubset<T, BagAclFindFirstOrThrowArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BagAcls that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BagAcls
     * const bagAcls = await prisma.bagAcl.findMany()
     * 
     * // Get first 10 BagAcls
     * const bagAcls = await prisma.bagAcl.findMany({ take: 10 })
     * 
     * // Only select the `acl_id`
     * const bagAclWithAcl_idOnly = await prisma.bagAcl.findMany({ select: { acl_id: true } })
     * 
     */
    findMany<T extends BagAclFindManyArgs>(args?: SelectSubset<T, BagAclFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BagAcl.
     * @param {BagAclCreateArgs} args - Arguments to create a BagAcl.
     * @example
     * // Create one BagAcl
     * const BagAcl = await prisma.bagAcl.create({
     *   data: {
     *     // ... data to create a BagAcl
     *   }
     * })
     * 
     */
    create<T extends BagAclCreateArgs>(args: SelectSubset<T, BagAclCreateArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BagAcls.
     * @param {BagAclCreateManyArgs} args - Arguments to create many BagAcls.
     * @example
     * // Create many BagAcls
     * const bagAcl = await prisma.bagAcl.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BagAclCreateManyArgs>(args?: SelectSubset<T, BagAclCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BagAcls and returns the data saved in the database.
     * @param {BagAclCreateManyAndReturnArgs} args - Arguments to create many BagAcls.
     * @example
     * // Create many BagAcls
     * const bagAcl = await prisma.bagAcl.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BagAcls and only return the `acl_id`
     * const bagAclWithAcl_idOnly = await prisma.bagAcl.createManyAndReturn({
     *   select: { acl_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BagAclCreateManyAndReturnArgs>(args?: SelectSubset<T, BagAclCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BagAcl.
     * @param {BagAclDeleteArgs} args - Arguments to delete one BagAcl.
     * @example
     * // Delete one BagAcl
     * const BagAcl = await prisma.bagAcl.delete({
     *   where: {
     *     // ... filter to delete one BagAcl
     *   }
     * })
     * 
     */
    delete<T extends BagAclDeleteArgs>(args: SelectSubset<T, BagAclDeleteArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BagAcl.
     * @param {BagAclUpdateArgs} args - Arguments to update one BagAcl.
     * @example
     * // Update one BagAcl
     * const bagAcl = await prisma.bagAcl.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BagAclUpdateArgs>(args: SelectSubset<T, BagAclUpdateArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BagAcls.
     * @param {BagAclDeleteManyArgs} args - Arguments to filter BagAcls to delete.
     * @example
     * // Delete a few BagAcls
     * const { count } = await prisma.bagAcl.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BagAclDeleteManyArgs>(args?: SelectSubset<T, BagAclDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BagAcls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BagAcls
     * const bagAcl = await prisma.bagAcl.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BagAclUpdateManyArgs>(args: SelectSubset<T, BagAclUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BagAcls and returns the data updated in the database.
     * @param {BagAclUpdateManyAndReturnArgs} args - Arguments to update many BagAcls.
     * @example
     * // Update many BagAcls
     * const bagAcl = await prisma.bagAcl.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BagAcls and only return the `acl_id`
     * const bagAclWithAcl_idOnly = await prisma.bagAcl.updateManyAndReturn({
     *   select: { acl_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BagAclUpdateManyAndReturnArgs>(args: SelectSubset<T, BagAclUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BagAcl.
     * @param {BagAclUpsertArgs} args - Arguments to update or create a BagAcl.
     * @example
     * // Update or create a BagAcl
     * const bagAcl = await prisma.bagAcl.upsert({
     *   create: {
     *     // ... data to create a BagAcl
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BagAcl we want to update
     *   }
     * })
     */
    upsert<T extends BagAclUpsertArgs>(args: SelectSubset<T, BagAclUpsertArgs<ExtArgs>>): Prisma__BagAclClient<$Result.GetResult<Prisma.$BagAclPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BagAcls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclCountArgs} args - Arguments to filter BagAcls to count.
     * @example
     * // Count the number of BagAcls
     * const count = await prisma.bagAcl.count({
     *   where: {
     *     // ... the filter for the BagAcls we want to count
     *   }
     * })
    **/
    count<T extends BagAclCountArgs>(
      args?: Subset<T, BagAclCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BagAclCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BagAcl.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BagAclAggregateArgs>(args: Subset<T, BagAclAggregateArgs>): Prisma.PrismaPromise<GetBagAclAggregateType<T>>

    /**
     * Group by BagAcl.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BagAclGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BagAclGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BagAclGroupByArgs['orderBy'] }
        : { orderBy?: BagAclGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BagAclGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBagAclGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BagAcl model
   */
  readonly fields: BagAclFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BagAcl.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BagAclClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bag<T extends BagsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BagsDefaultArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BagAcl model
   */
  interface BagAclFieldRefs {
    readonly acl_id: FieldRef<"BagAcl", 'Int'>
    readonly bag_id: FieldRef<"BagAcl", 'String'>
    readonly role_id: FieldRef<"BagAcl", 'String'>
    readonly permission: FieldRef<"BagAcl", 'Permission'>
  }
    

  // Custom InputTypes
  /**
   * BagAcl findUnique
   */
  export type BagAclFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * Filter, which BagAcl to fetch.
     */
    where: BagAclWhereUniqueInput
  }

  /**
   * BagAcl findUniqueOrThrow
   */
  export type BagAclFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * Filter, which BagAcl to fetch.
     */
    where: BagAclWhereUniqueInput
  }

  /**
   * BagAcl findFirst
   */
  export type BagAclFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * Filter, which BagAcl to fetch.
     */
    where?: BagAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BagAcls to fetch.
     */
    orderBy?: BagAclOrderByWithRelationInput | BagAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BagAcls.
     */
    cursor?: BagAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BagAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BagAcls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BagAcls.
     */
    distinct?: BagAclScalarFieldEnum | BagAclScalarFieldEnum[]
  }

  /**
   * BagAcl findFirstOrThrow
   */
  export type BagAclFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * Filter, which BagAcl to fetch.
     */
    where?: BagAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BagAcls to fetch.
     */
    orderBy?: BagAclOrderByWithRelationInput | BagAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BagAcls.
     */
    cursor?: BagAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BagAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BagAcls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BagAcls.
     */
    distinct?: BagAclScalarFieldEnum | BagAclScalarFieldEnum[]
  }

  /**
   * BagAcl findMany
   */
  export type BagAclFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * Filter, which BagAcls to fetch.
     */
    where?: BagAclWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BagAcls to fetch.
     */
    orderBy?: BagAclOrderByWithRelationInput | BagAclOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BagAcls.
     */
    cursor?: BagAclWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BagAcls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BagAcls.
     */
    skip?: number
    distinct?: BagAclScalarFieldEnum | BagAclScalarFieldEnum[]
  }

  /**
   * BagAcl create
   */
  export type BagAclCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * The data needed to create a BagAcl.
     */
    data: XOR<BagAclCreateInput, BagAclUncheckedCreateInput>
  }

  /**
   * BagAcl createMany
   */
  export type BagAclCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BagAcls.
     */
    data: BagAclCreateManyInput | BagAclCreateManyInput[]
  }

  /**
   * BagAcl createManyAndReturn
   */
  export type BagAclCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * The data used to create many BagAcls.
     */
    data: BagAclCreateManyInput | BagAclCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BagAcl update
   */
  export type BagAclUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * The data needed to update a BagAcl.
     */
    data: XOR<BagAclUpdateInput, BagAclUncheckedUpdateInput>
    /**
     * Choose, which BagAcl to update.
     */
    where: BagAclWhereUniqueInput
  }

  /**
   * BagAcl updateMany
   */
  export type BagAclUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BagAcls.
     */
    data: XOR<BagAclUpdateManyMutationInput, BagAclUncheckedUpdateManyInput>
    /**
     * Filter which BagAcls to update
     */
    where?: BagAclWhereInput
    /**
     * Limit how many BagAcls to update.
     */
    limit?: number
  }

  /**
   * BagAcl updateManyAndReturn
   */
  export type BagAclUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * The data used to update BagAcls.
     */
    data: XOR<BagAclUpdateManyMutationInput, BagAclUncheckedUpdateManyInput>
    /**
     * Filter which BagAcls to update
     */
    where?: BagAclWhereInput
    /**
     * Limit how many BagAcls to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BagAcl upsert
   */
  export type BagAclUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * The filter to search for the BagAcl to update in case it exists.
     */
    where: BagAclWhereUniqueInput
    /**
     * In case the BagAcl found by the `where` argument doesn't exist, create a new BagAcl with this data.
     */
    create: XOR<BagAclCreateInput, BagAclUncheckedCreateInput>
    /**
     * In case the BagAcl was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BagAclUpdateInput, BagAclUncheckedUpdateInput>
  }

  /**
   * BagAcl delete
   */
  export type BagAclDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
    /**
     * Filter which BagAcl to delete.
     */
    where: BagAclWhereUniqueInput
  }

  /**
   * BagAcl deleteMany
   */
  export type BagAclDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BagAcls to delete
     */
    where?: BagAclWhereInput
    /**
     * Limit how many BagAcls to delete.
     */
    limit?: number
  }

  /**
   * BagAcl without action
   */
  export type BagAclDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BagAcl
     */
    select?: BagAclSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BagAcl
     */
    omit?: BagAclOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BagAclInclude<ExtArgs> | null
  }


  /**
   * Model Tiddlers
   */

  export type AggregateTiddlers = {
    _count: TiddlersCountAggregateOutputType | null
    _min: TiddlersMinAggregateOutputType | null
    _max: TiddlersMaxAggregateOutputType | null
  }

  export type TiddlersMinAggregateOutputType = {
    revision_id: string | null
    bag_id: string | null
    title: string | null
    is_deleted: boolean | null
    attachment_hash: string | null
  }

  export type TiddlersMaxAggregateOutputType = {
    revision_id: string | null
    bag_id: string | null
    title: string | null
    is_deleted: boolean | null
    attachment_hash: string | null
  }

  export type TiddlersCountAggregateOutputType = {
    revision_id: number
    bag_id: number
    title: number
    is_deleted: number
    attachment_hash: number
    _all: number
  }


  export type TiddlersMinAggregateInputType = {
    revision_id?: true
    bag_id?: true
    title?: true
    is_deleted?: true
    attachment_hash?: true
  }

  export type TiddlersMaxAggregateInputType = {
    revision_id?: true
    bag_id?: true
    title?: true
    is_deleted?: true
    attachment_hash?: true
  }

  export type TiddlersCountAggregateInputType = {
    revision_id?: true
    bag_id?: true
    title?: true
    is_deleted?: true
    attachment_hash?: true
    _all?: true
  }

  export type TiddlersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tiddlers to aggregate.
     */
    where?: TiddlersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tiddlers to fetch.
     */
    orderBy?: TiddlersOrderByWithRelationInput | TiddlersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TiddlersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tiddlers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tiddlers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tiddlers
    **/
    _count?: true | TiddlersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TiddlersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TiddlersMaxAggregateInputType
  }

  export type GetTiddlersAggregateType<T extends TiddlersAggregateArgs> = {
        [P in keyof T & keyof AggregateTiddlers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTiddlers[P]>
      : GetScalarType<T[P], AggregateTiddlers[P]>
  }




  export type TiddlersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TiddlersWhereInput
    orderBy?: TiddlersOrderByWithAggregationInput | TiddlersOrderByWithAggregationInput[]
    by: TiddlersScalarFieldEnum[] | TiddlersScalarFieldEnum
    having?: TiddlersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TiddlersCountAggregateInputType | true
    _min?: TiddlersMinAggregateInputType
    _max?: TiddlersMaxAggregateInputType
  }

  export type TiddlersGroupByOutputType = {
    revision_id: string
    bag_id: string
    title: string
    is_deleted: boolean
    attachment_hash: string | null
    _count: TiddlersCountAggregateOutputType | null
    _min: TiddlersMinAggregateOutputType | null
    _max: TiddlersMaxAggregateOutputType | null
  }

  type GetTiddlersGroupByPayload<T extends TiddlersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TiddlersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TiddlersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TiddlersGroupByOutputType[P]>
            : GetScalarType<T[P], TiddlersGroupByOutputType[P]>
        }
      >
    >


  export type TiddlersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    revision_id?: boolean
    bag_id?: boolean
    title?: boolean
    is_deleted?: boolean
    attachment_hash?: boolean
    fields?: boolean | Tiddlers$fieldsArgs<ExtArgs>
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    _count?: boolean | TiddlersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tiddlers"]>

  export type TiddlersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    revision_id?: boolean
    bag_id?: boolean
    title?: boolean
    is_deleted?: boolean
    attachment_hash?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tiddlers"]>

  export type TiddlersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    revision_id?: boolean
    bag_id?: boolean
    title?: boolean
    is_deleted?: boolean
    attachment_hash?: boolean
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tiddlers"]>

  export type TiddlersSelectScalar = {
    revision_id?: boolean
    bag_id?: boolean
    title?: boolean
    is_deleted?: boolean
    attachment_hash?: boolean
  }

  export type TiddlersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"revision_id" | "bag_id" | "title" | "is_deleted" | "attachment_hash", ExtArgs["result"]["tiddlers"]>
  export type TiddlersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fields?: boolean | Tiddlers$fieldsArgs<ExtArgs>
    bag?: boolean | BagsDefaultArgs<ExtArgs>
    _count?: boolean | TiddlersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TiddlersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }
  export type TiddlersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bag?: boolean | BagsDefaultArgs<ExtArgs>
  }

  export type $TiddlersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tiddlers"
    objects: {
      fields: Prisma.$FieldsPayload<ExtArgs>[]
      bag: Prisma.$BagsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      revision_id: string
      bag_id: string
      title: string
      is_deleted: boolean
      attachment_hash: string | null
    }, ExtArgs["result"]["tiddlers"]>
    composites: {}
  }

  type TiddlersGetPayload<S extends boolean | null | undefined | TiddlersDefaultArgs> = $Result.GetResult<Prisma.$TiddlersPayload, S>

  type TiddlersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TiddlersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: TiddlersCountAggregateInputType | true
    }

  export interface TiddlersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tiddlers'], meta: { name: 'Tiddlers' } }
    /**
     * Find zero or one Tiddlers that matches the filter.
     * @param {TiddlersFindUniqueArgs} args - Arguments to find a Tiddlers
     * @example
     * // Get one Tiddlers
     * const tiddlers = await prisma.tiddlers.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TiddlersFindUniqueArgs>(args: SelectSubset<T, TiddlersFindUniqueArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tiddlers that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TiddlersFindUniqueOrThrowArgs} args - Arguments to find a Tiddlers
     * @example
     * // Get one Tiddlers
     * const tiddlers = await prisma.tiddlers.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TiddlersFindUniqueOrThrowArgs>(args: SelectSubset<T, TiddlersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tiddlers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersFindFirstArgs} args - Arguments to find a Tiddlers
     * @example
     * // Get one Tiddlers
     * const tiddlers = await prisma.tiddlers.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TiddlersFindFirstArgs>(args?: SelectSubset<T, TiddlersFindFirstArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tiddlers that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersFindFirstOrThrowArgs} args - Arguments to find a Tiddlers
     * @example
     * // Get one Tiddlers
     * const tiddlers = await prisma.tiddlers.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TiddlersFindFirstOrThrowArgs>(args?: SelectSubset<T, TiddlersFindFirstOrThrowArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tiddlers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tiddlers
     * const tiddlers = await prisma.tiddlers.findMany()
     * 
     * // Get first 10 Tiddlers
     * const tiddlers = await prisma.tiddlers.findMany({ take: 10 })
     * 
     * // Only select the `revision_id`
     * const tiddlersWithRevision_idOnly = await prisma.tiddlers.findMany({ select: { revision_id: true } })
     * 
     */
    findMany<T extends TiddlersFindManyArgs>(args?: SelectSubset<T, TiddlersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tiddlers.
     * @param {TiddlersCreateArgs} args - Arguments to create a Tiddlers.
     * @example
     * // Create one Tiddlers
     * const Tiddlers = await prisma.tiddlers.create({
     *   data: {
     *     // ... data to create a Tiddlers
     *   }
     * })
     * 
     */
    create<T extends TiddlersCreateArgs>(args: SelectSubset<T, TiddlersCreateArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tiddlers.
     * @param {TiddlersCreateManyArgs} args - Arguments to create many Tiddlers.
     * @example
     * // Create many Tiddlers
     * const tiddlers = await prisma.tiddlers.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TiddlersCreateManyArgs>(args?: SelectSubset<T, TiddlersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tiddlers and returns the data saved in the database.
     * @param {TiddlersCreateManyAndReturnArgs} args - Arguments to create many Tiddlers.
     * @example
     * // Create many Tiddlers
     * const tiddlers = await prisma.tiddlers.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tiddlers and only return the `revision_id`
     * const tiddlersWithRevision_idOnly = await prisma.tiddlers.createManyAndReturn({
     *   select: { revision_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TiddlersCreateManyAndReturnArgs>(args?: SelectSubset<T, TiddlersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tiddlers.
     * @param {TiddlersDeleteArgs} args - Arguments to delete one Tiddlers.
     * @example
     * // Delete one Tiddlers
     * const Tiddlers = await prisma.tiddlers.delete({
     *   where: {
     *     // ... filter to delete one Tiddlers
     *   }
     * })
     * 
     */
    delete<T extends TiddlersDeleteArgs>(args: SelectSubset<T, TiddlersDeleteArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tiddlers.
     * @param {TiddlersUpdateArgs} args - Arguments to update one Tiddlers.
     * @example
     * // Update one Tiddlers
     * const tiddlers = await prisma.tiddlers.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TiddlersUpdateArgs>(args: SelectSubset<T, TiddlersUpdateArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tiddlers.
     * @param {TiddlersDeleteManyArgs} args - Arguments to filter Tiddlers to delete.
     * @example
     * // Delete a few Tiddlers
     * const { count } = await prisma.tiddlers.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TiddlersDeleteManyArgs>(args?: SelectSubset<T, TiddlersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tiddlers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tiddlers
     * const tiddlers = await prisma.tiddlers.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TiddlersUpdateManyArgs>(args: SelectSubset<T, TiddlersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tiddlers and returns the data updated in the database.
     * @param {TiddlersUpdateManyAndReturnArgs} args - Arguments to update many Tiddlers.
     * @example
     * // Update many Tiddlers
     * const tiddlers = await prisma.tiddlers.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tiddlers and only return the `revision_id`
     * const tiddlersWithRevision_idOnly = await prisma.tiddlers.updateManyAndReturn({
     *   select: { revision_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TiddlersUpdateManyAndReturnArgs>(args: SelectSubset<T, TiddlersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tiddlers.
     * @param {TiddlersUpsertArgs} args - Arguments to update or create a Tiddlers.
     * @example
     * // Update or create a Tiddlers
     * const tiddlers = await prisma.tiddlers.upsert({
     *   create: {
     *     // ... data to create a Tiddlers
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tiddlers we want to update
     *   }
     * })
     */
    upsert<T extends TiddlersUpsertArgs>(args: SelectSubset<T, TiddlersUpsertArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tiddlers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersCountArgs} args - Arguments to filter Tiddlers to count.
     * @example
     * // Count the number of Tiddlers
     * const count = await prisma.tiddlers.count({
     *   where: {
     *     // ... the filter for the Tiddlers we want to count
     *   }
     * })
    **/
    count<T extends TiddlersCountArgs>(
      args?: Subset<T, TiddlersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TiddlersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tiddlers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TiddlersAggregateArgs>(args: Subset<T, TiddlersAggregateArgs>): Prisma.PrismaPromise<GetTiddlersAggregateType<T>>

    /**
     * Group by Tiddlers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TiddlersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TiddlersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TiddlersGroupByArgs['orderBy'] }
        : { orderBy?: TiddlersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TiddlersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTiddlersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tiddlers model
   */
  readonly fields: TiddlersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tiddlers.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TiddlersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    fields<T extends Tiddlers$fieldsArgs<ExtArgs> = {}>(args?: Subset<T, Tiddlers$fieldsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bag<T extends BagsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BagsDefaultArgs<ExtArgs>>): Prisma__BagsClient<$Result.GetResult<Prisma.$BagsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tiddlers model
   */
  interface TiddlersFieldRefs {
    readonly revision_id: FieldRef<"Tiddlers", 'String'>
    readonly bag_id: FieldRef<"Tiddlers", 'String'>
    readonly title: FieldRef<"Tiddlers", 'String'>
    readonly is_deleted: FieldRef<"Tiddlers", 'Boolean'>
    readonly attachment_hash: FieldRef<"Tiddlers", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Tiddlers findUnique
   */
  export type TiddlersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * Filter, which Tiddlers to fetch.
     */
    where: TiddlersWhereUniqueInput
  }

  /**
   * Tiddlers findUniqueOrThrow
   */
  export type TiddlersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * Filter, which Tiddlers to fetch.
     */
    where: TiddlersWhereUniqueInput
  }

  /**
   * Tiddlers findFirst
   */
  export type TiddlersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * Filter, which Tiddlers to fetch.
     */
    where?: TiddlersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tiddlers to fetch.
     */
    orderBy?: TiddlersOrderByWithRelationInput | TiddlersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tiddlers.
     */
    cursor?: TiddlersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tiddlers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tiddlers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tiddlers.
     */
    distinct?: TiddlersScalarFieldEnum | TiddlersScalarFieldEnum[]
  }

  /**
   * Tiddlers findFirstOrThrow
   */
  export type TiddlersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * Filter, which Tiddlers to fetch.
     */
    where?: TiddlersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tiddlers to fetch.
     */
    orderBy?: TiddlersOrderByWithRelationInput | TiddlersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tiddlers.
     */
    cursor?: TiddlersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tiddlers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tiddlers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tiddlers.
     */
    distinct?: TiddlersScalarFieldEnum | TiddlersScalarFieldEnum[]
  }

  /**
   * Tiddlers findMany
   */
  export type TiddlersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * Filter, which Tiddlers to fetch.
     */
    where?: TiddlersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tiddlers to fetch.
     */
    orderBy?: TiddlersOrderByWithRelationInput | TiddlersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tiddlers.
     */
    cursor?: TiddlersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tiddlers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tiddlers.
     */
    skip?: number
    distinct?: TiddlersScalarFieldEnum | TiddlersScalarFieldEnum[]
  }

  /**
   * Tiddlers create
   */
  export type TiddlersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * The data needed to create a Tiddlers.
     */
    data: XOR<TiddlersCreateInput, TiddlersUncheckedCreateInput>
  }

  /**
   * Tiddlers createMany
   */
  export type TiddlersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tiddlers.
     */
    data: TiddlersCreateManyInput | TiddlersCreateManyInput[]
  }

  /**
   * Tiddlers createManyAndReturn
   */
  export type TiddlersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * The data used to create many Tiddlers.
     */
    data: TiddlersCreateManyInput | TiddlersCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tiddlers update
   */
  export type TiddlersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * The data needed to update a Tiddlers.
     */
    data: XOR<TiddlersUpdateInput, TiddlersUncheckedUpdateInput>
    /**
     * Choose, which Tiddlers to update.
     */
    where: TiddlersWhereUniqueInput
  }

  /**
   * Tiddlers updateMany
   */
  export type TiddlersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tiddlers.
     */
    data: XOR<TiddlersUpdateManyMutationInput, TiddlersUncheckedUpdateManyInput>
    /**
     * Filter which Tiddlers to update
     */
    where?: TiddlersWhereInput
    /**
     * Limit how many Tiddlers to update.
     */
    limit?: number
  }

  /**
   * Tiddlers updateManyAndReturn
   */
  export type TiddlersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * The data used to update Tiddlers.
     */
    data: XOR<TiddlersUpdateManyMutationInput, TiddlersUncheckedUpdateManyInput>
    /**
     * Filter which Tiddlers to update
     */
    where?: TiddlersWhereInput
    /**
     * Limit how many Tiddlers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tiddlers upsert
   */
  export type TiddlersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * The filter to search for the Tiddlers to update in case it exists.
     */
    where: TiddlersWhereUniqueInput
    /**
     * In case the Tiddlers found by the `where` argument doesn't exist, create a new Tiddlers with this data.
     */
    create: XOR<TiddlersCreateInput, TiddlersUncheckedCreateInput>
    /**
     * In case the Tiddlers was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TiddlersUpdateInput, TiddlersUncheckedUpdateInput>
  }

  /**
   * Tiddlers delete
   */
  export type TiddlersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
    /**
     * Filter which Tiddlers to delete.
     */
    where: TiddlersWhereUniqueInput
  }

  /**
   * Tiddlers deleteMany
   */
  export type TiddlersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tiddlers to delete
     */
    where?: TiddlersWhereInput
    /**
     * Limit how many Tiddlers to delete.
     */
    limit?: number
  }

  /**
   * Tiddlers.fields
   */
  export type Tiddlers$fieldsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    where?: FieldsWhereInput
    orderBy?: FieldsOrderByWithRelationInput | FieldsOrderByWithRelationInput[]
    cursor?: FieldsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FieldsScalarFieldEnum | FieldsScalarFieldEnum[]
  }

  /**
   * Tiddlers without action
   */
  export type TiddlersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tiddlers
     */
    select?: TiddlersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tiddlers
     */
    omit?: TiddlersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TiddlersInclude<ExtArgs> | null
  }


  /**
   * Model Fields
   */

  export type AggregateFields = {
    _count: FieldsCountAggregateOutputType | null
    _min: FieldsMinAggregateOutputType | null
    _max: FieldsMaxAggregateOutputType | null
  }

  export type FieldsMinAggregateOutputType = {
    revision_id: string | null
    field_name: string | null
    field_value: string | null
  }

  export type FieldsMaxAggregateOutputType = {
    revision_id: string | null
    field_name: string | null
    field_value: string | null
  }

  export type FieldsCountAggregateOutputType = {
    revision_id: number
    field_name: number
    field_value: number
    _all: number
  }


  export type FieldsMinAggregateInputType = {
    revision_id?: true
    field_name?: true
    field_value?: true
  }

  export type FieldsMaxAggregateInputType = {
    revision_id?: true
    field_name?: true
    field_value?: true
  }

  export type FieldsCountAggregateInputType = {
    revision_id?: true
    field_name?: true
    field_value?: true
    _all?: true
  }

  export type FieldsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fields to aggregate.
     */
    where?: FieldsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fields to fetch.
     */
    orderBy?: FieldsOrderByWithRelationInput | FieldsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FieldsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fields from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fields.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Fields
    **/
    _count?: true | FieldsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FieldsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FieldsMaxAggregateInputType
  }

  export type GetFieldsAggregateType<T extends FieldsAggregateArgs> = {
        [P in keyof T & keyof AggregateFields]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFields[P]>
      : GetScalarType<T[P], AggregateFields[P]>
  }




  export type FieldsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FieldsWhereInput
    orderBy?: FieldsOrderByWithAggregationInput | FieldsOrderByWithAggregationInput[]
    by: FieldsScalarFieldEnum[] | FieldsScalarFieldEnum
    having?: FieldsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FieldsCountAggregateInputType | true
    _min?: FieldsMinAggregateInputType
    _max?: FieldsMaxAggregateInputType
  }

  export type FieldsGroupByOutputType = {
    revision_id: string
    field_name: string
    field_value: string
    _count: FieldsCountAggregateOutputType | null
    _min: FieldsMinAggregateOutputType | null
    _max: FieldsMaxAggregateOutputType | null
  }

  type GetFieldsGroupByPayload<T extends FieldsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FieldsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FieldsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FieldsGroupByOutputType[P]>
            : GetScalarType<T[P], FieldsGroupByOutputType[P]>
        }
      >
    >


  export type FieldsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    revision_id?: boolean
    field_name?: boolean
    field_value?: boolean
    tiddler?: boolean | TiddlersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fields"]>

  export type FieldsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    revision_id?: boolean
    field_name?: boolean
    field_value?: boolean
    tiddler?: boolean | TiddlersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fields"]>

  export type FieldsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    revision_id?: boolean
    field_name?: boolean
    field_value?: boolean
    tiddler?: boolean | TiddlersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fields"]>

  export type FieldsSelectScalar = {
    revision_id?: boolean
    field_name?: boolean
    field_value?: boolean
  }

  export type FieldsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"revision_id" | "field_name" | "field_value", ExtArgs["result"]["fields"]>
  export type FieldsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tiddler?: boolean | TiddlersDefaultArgs<ExtArgs>
  }
  export type FieldsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tiddler?: boolean | TiddlersDefaultArgs<ExtArgs>
  }
  export type FieldsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tiddler?: boolean | TiddlersDefaultArgs<ExtArgs>
  }

  export type $FieldsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Fields"
    objects: {
      tiddler: Prisma.$TiddlersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      revision_id: string
      field_name: string
      field_value: string
    }, ExtArgs["result"]["fields"]>
    composites: {}
  }

  type FieldsGetPayload<S extends boolean | null | undefined | FieldsDefaultArgs> = $Result.GetResult<Prisma.$FieldsPayload, S>

  type FieldsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FieldsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: FieldsCountAggregateInputType | true
    }

  export interface FieldsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Fields'], meta: { name: 'Fields' } }
    /**
     * Find zero or one Fields that matches the filter.
     * @param {FieldsFindUniqueArgs} args - Arguments to find a Fields
     * @example
     * // Get one Fields
     * const fields = await prisma.fields.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FieldsFindUniqueArgs>(args: SelectSubset<T, FieldsFindUniqueArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Fields that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FieldsFindUniqueOrThrowArgs} args - Arguments to find a Fields
     * @example
     * // Get one Fields
     * const fields = await prisma.fields.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FieldsFindUniqueOrThrowArgs>(args: SelectSubset<T, FieldsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Fields that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsFindFirstArgs} args - Arguments to find a Fields
     * @example
     * // Get one Fields
     * const fields = await prisma.fields.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FieldsFindFirstArgs>(args?: SelectSubset<T, FieldsFindFirstArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Fields that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsFindFirstOrThrowArgs} args - Arguments to find a Fields
     * @example
     * // Get one Fields
     * const fields = await prisma.fields.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FieldsFindFirstOrThrowArgs>(args?: SelectSubset<T, FieldsFindFirstOrThrowArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Fields that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Fields
     * const fields = await prisma.fields.findMany()
     * 
     * // Get first 10 Fields
     * const fields = await prisma.fields.findMany({ take: 10 })
     * 
     * // Only select the `revision_id`
     * const fieldsWithRevision_idOnly = await prisma.fields.findMany({ select: { revision_id: true } })
     * 
     */
    findMany<T extends FieldsFindManyArgs>(args?: SelectSubset<T, FieldsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Fields.
     * @param {FieldsCreateArgs} args - Arguments to create a Fields.
     * @example
     * // Create one Fields
     * const Fields = await prisma.fields.create({
     *   data: {
     *     // ... data to create a Fields
     *   }
     * })
     * 
     */
    create<T extends FieldsCreateArgs>(args: SelectSubset<T, FieldsCreateArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Fields.
     * @param {FieldsCreateManyArgs} args - Arguments to create many Fields.
     * @example
     * // Create many Fields
     * const fields = await prisma.fields.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FieldsCreateManyArgs>(args?: SelectSubset<T, FieldsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Fields and returns the data saved in the database.
     * @param {FieldsCreateManyAndReturnArgs} args - Arguments to create many Fields.
     * @example
     * // Create many Fields
     * const fields = await prisma.fields.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Fields and only return the `revision_id`
     * const fieldsWithRevision_idOnly = await prisma.fields.createManyAndReturn({
     *   select: { revision_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FieldsCreateManyAndReturnArgs>(args?: SelectSubset<T, FieldsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Fields.
     * @param {FieldsDeleteArgs} args - Arguments to delete one Fields.
     * @example
     * // Delete one Fields
     * const Fields = await prisma.fields.delete({
     *   where: {
     *     // ... filter to delete one Fields
     *   }
     * })
     * 
     */
    delete<T extends FieldsDeleteArgs>(args: SelectSubset<T, FieldsDeleteArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Fields.
     * @param {FieldsUpdateArgs} args - Arguments to update one Fields.
     * @example
     * // Update one Fields
     * const fields = await prisma.fields.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FieldsUpdateArgs>(args: SelectSubset<T, FieldsUpdateArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Fields.
     * @param {FieldsDeleteManyArgs} args - Arguments to filter Fields to delete.
     * @example
     * // Delete a few Fields
     * const { count } = await prisma.fields.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FieldsDeleteManyArgs>(args?: SelectSubset<T, FieldsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Fields.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Fields
     * const fields = await prisma.fields.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FieldsUpdateManyArgs>(args: SelectSubset<T, FieldsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Fields and returns the data updated in the database.
     * @param {FieldsUpdateManyAndReturnArgs} args - Arguments to update many Fields.
     * @example
     * // Update many Fields
     * const fields = await prisma.fields.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Fields and only return the `revision_id`
     * const fieldsWithRevision_idOnly = await prisma.fields.updateManyAndReturn({
     *   select: { revision_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FieldsUpdateManyAndReturnArgs>(args: SelectSubset<T, FieldsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Fields.
     * @param {FieldsUpsertArgs} args - Arguments to update or create a Fields.
     * @example
     * // Update or create a Fields
     * const fields = await prisma.fields.upsert({
     *   create: {
     *     // ... data to create a Fields
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Fields we want to update
     *   }
     * })
     */
    upsert<T extends FieldsUpsertArgs>(args: SelectSubset<T, FieldsUpsertArgs<ExtArgs>>): Prisma__FieldsClient<$Result.GetResult<Prisma.$FieldsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Fields.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsCountArgs} args - Arguments to filter Fields to count.
     * @example
     * // Count the number of Fields
     * const count = await prisma.fields.count({
     *   where: {
     *     // ... the filter for the Fields we want to count
     *   }
     * })
    **/
    count<T extends FieldsCountArgs>(
      args?: Subset<T, FieldsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FieldsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Fields.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FieldsAggregateArgs>(args: Subset<T, FieldsAggregateArgs>): Prisma.PrismaPromise<GetFieldsAggregateType<T>>

    /**
     * Group by Fields.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FieldsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FieldsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FieldsGroupByArgs['orderBy'] }
        : { orderBy?: FieldsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FieldsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFieldsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Fields model
   */
  readonly fields: FieldsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Fields.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FieldsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tiddler<T extends TiddlersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TiddlersDefaultArgs<ExtArgs>>): Prisma__TiddlersClient<$Result.GetResult<Prisma.$TiddlersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Fields model
   */
  interface FieldsFieldRefs {
    readonly revision_id: FieldRef<"Fields", 'String'>
    readonly field_name: FieldRef<"Fields", 'String'>
    readonly field_value: FieldRef<"Fields", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Fields findUnique
   */
  export type FieldsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * Filter, which Fields to fetch.
     */
    where: FieldsWhereUniqueInput
  }

  /**
   * Fields findUniqueOrThrow
   */
  export type FieldsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * Filter, which Fields to fetch.
     */
    where: FieldsWhereUniqueInput
  }

  /**
   * Fields findFirst
   */
  export type FieldsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * Filter, which Fields to fetch.
     */
    where?: FieldsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fields to fetch.
     */
    orderBy?: FieldsOrderByWithRelationInput | FieldsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fields.
     */
    cursor?: FieldsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fields from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fields.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fields.
     */
    distinct?: FieldsScalarFieldEnum | FieldsScalarFieldEnum[]
  }

  /**
   * Fields findFirstOrThrow
   */
  export type FieldsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * Filter, which Fields to fetch.
     */
    where?: FieldsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fields to fetch.
     */
    orderBy?: FieldsOrderByWithRelationInput | FieldsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fields.
     */
    cursor?: FieldsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fields from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fields.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fields.
     */
    distinct?: FieldsScalarFieldEnum | FieldsScalarFieldEnum[]
  }

  /**
   * Fields findMany
   */
  export type FieldsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * Filter, which Fields to fetch.
     */
    where?: FieldsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fields to fetch.
     */
    orderBy?: FieldsOrderByWithRelationInput | FieldsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Fields.
     */
    cursor?: FieldsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fields from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fields.
     */
    skip?: number
    distinct?: FieldsScalarFieldEnum | FieldsScalarFieldEnum[]
  }

  /**
   * Fields create
   */
  export type FieldsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * The data needed to create a Fields.
     */
    data: XOR<FieldsCreateInput, FieldsUncheckedCreateInput>
  }

  /**
   * Fields createMany
   */
  export type FieldsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Fields.
     */
    data: FieldsCreateManyInput | FieldsCreateManyInput[]
  }

  /**
   * Fields createManyAndReturn
   */
  export type FieldsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * The data used to create many Fields.
     */
    data: FieldsCreateManyInput | FieldsCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Fields update
   */
  export type FieldsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * The data needed to update a Fields.
     */
    data: XOR<FieldsUpdateInput, FieldsUncheckedUpdateInput>
    /**
     * Choose, which Fields to update.
     */
    where: FieldsWhereUniqueInput
  }

  /**
   * Fields updateMany
   */
  export type FieldsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Fields.
     */
    data: XOR<FieldsUpdateManyMutationInput, FieldsUncheckedUpdateManyInput>
    /**
     * Filter which Fields to update
     */
    where?: FieldsWhereInput
    /**
     * Limit how many Fields to update.
     */
    limit?: number
  }

  /**
   * Fields updateManyAndReturn
   */
  export type FieldsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * The data used to update Fields.
     */
    data: XOR<FieldsUpdateManyMutationInput, FieldsUncheckedUpdateManyInput>
    /**
     * Filter which Fields to update
     */
    where?: FieldsWhereInput
    /**
     * Limit how many Fields to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Fields upsert
   */
  export type FieldsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * The filter to search for the Fields to update in case it exists.
     */
    where: FieldsWhereUniqueInput
    /**
     * In case the Fields found by the `where` argument doesn't exist, create a new Fields with this data.
     */
    create: XOR<FieldsCreateInput, FieldsUncheckedCreateInput>
    /**
     * In case the Fields was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FieldsUpdateInput, FieldsUncheckedUpdateInput>
  }

  /**
   * Fields delete
   */
  export type FieldsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
    /**
     * Filter which Fields to delete.
     */
    where: FieldsWhereUniqueInput
  }

  /**
   * Fields deleteMany
   */
  export type FieldsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fields to delete
     */
    where?: FieldsWhereInput
    /**
     * Limit how many Fields to delete.
     */
    limit?: number
  }

  /**
   * Fields without action
   */
  export type FieldsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fields
     */
    select?: FieldsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fields
     */
    omit?: FieldsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FieldsInclude<ExtArgs> | null
  }


  /**
   * Model Roles
   */

  export type AggregateRoles = {
    _count: RolesCountAggregateOutputType | null
    _min: RolesMinAggregateOutputType | null
    _max: RolesMaxAggregateOutputType | null
  }

  export type RolesMinAggregateOutputType = {
    role_id: string | null
    role_name: string | null
    description: string | null
  }

  export type RolesMaxAggregateOutputType = {
    role_id: string | null
    role_name: string | null
    description: string | null
  }

  export type RolesCountAggregateOutputType = {
    role_id: number
    role_name: number
    description: number
    _all: number
  }


  export type RolesMinAggregateInputType = {
    role_id?: true
    role_name?: true
    description?: true
  }

  export type RolesMaxAggregateInputType = {
    role_id?: true
    role_name?: true
    description?: true
  }

  export type RolesCountAggregateInputType = {
    role_id?: true
    role_name?: true
    description?: true
    _all?: true
  }

  export type RolesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Roles to aggregate.
     */
    where?: RolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RolesOrderByWithRelationInput | RolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Roles
    **/
    _count?: true | RolesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RolesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RolesMaxAggregateInputType
  }

  export type GetRolesAggregateType<T extends RolesAggregateArgs> = {
        [P in keyof T & keyof AggregateRoles]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoles[P]>
      : GetScalarType<T[P], AggregateRoles[P]>
  }




  export type RolesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolesWhereInput
    orderBy?: RolesOrderByWithAggregationInput | RolesOrderByWithAggregationInput[]
    by: RolesScalarFieldEnum[] | RolesScalarFieldEnum
    having?: RolesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RolesCountAggregateInputType | true
    _min?: RolesMinAggregateInputType
    _max?: RolesMaxAggregateInputType
  }

  export type RolesGroupByOutputType = {
    role_id: string
    role_name: string
    description: string | null
    _count: RolesCountAggregateOutputType | null
    _min: RolesMinAggregateOutputType | null
    _max: RolesMaxAggregateOutputType | null
  }

  type GetRolesGroupByPayload<T extends RolesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RolesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RolesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RolesGroupByOutputType[P]>
            : GetScalarType<T[P], RolesGroupByOutputType[P]>
        }
      >
    >


  export type RolesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    role_name?: boolean
    description?: boolean
    users?: boolean | Roles$usersArgs<ExtArgs>
    _count?: boolean | RolesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roles"]>

  export type RolesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    role_name?: boolean
    description?: boolean
  }, ExtArgs["result"]["roles"]>

  export type RolesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    role_name?: boolean
    description?: boolean
  }, ExtArgs["result"]["roles"]>

  export type RolesSelectScalar = {
    role_id?: boolean
    role_name?: boolean
    description?: boolean
  }

  export type RolesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"role_id" | "role_name" | "description", ExtArgs["result"]["roles"]>
  export type RolesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Roles$usersArgs<ExtArgs>
    _count?: boolean | RolesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RolesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RolesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RolesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Roles"
    objects: {
      users: Prisma.$UsersPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      role_id: string
      role_name: string
      description: string | null
    }, ExtArgs["result"]["roles"]>
    composites: {}
  }

  type RolesGetPayload<S extends boolean | null | undefined | RolesDefaultArgs> = $Result.GetResult<Prisma.$RolesPayload, S>

  type RolesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RolesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: RolesCountAggregateInputType | true
    }

  export interface RolesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Roles'], meta: { name: 'Roles' } }
    /**
     * Find zero or one Roles that matches the filter.
     * @param {RolesFindUniqueArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RolesFindUniqueArgs>(args: SelectSubset<T, RolesFindUniqueArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Roles that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RolesFindUniqueOrThrowArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RolesFindUniqueOrThrowArgs>(args: SelectSubset<T, RolesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesFindFirstArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RolesFindFirstArgs>(args?: SelectSubset<T, RolesFindFirstArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Roles that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesFindFirstOrThrowArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RolesFindFirstOrThrowArgs>(args?: SelectSubset<T, RolesFindFirstOrThrowArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Roles
     * const roles = await prisma.roles.findMany()
     * 
     * // Get first 10 Roles
     * const roles = await prisma.roles.findMany({ take: 10 })
     * 
     * // Only select the `role_id`
     * const rolesWithRole_idOnly = await prisma.roles.findMany({ select: { role_id: true } })
     * 
     */
    findMany<T extends RolesFindManyArgs>(args?: SelectSubset<T, RolesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Roles.
     * @param {RolesCreateArgs} args - Arguments to create a Roles.
     * @example
     * // Create one Roles
     * const Roles = await prisma.roles.create({
     *   data: {
     *     // ... data to create a Roles
     *   }
     * })
     * 
     */
    create<T extends RolesCreateArgs>(args: SelectSubset<T, RolesCreateArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Roles.
     * @param {RolesCreateManyArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const roles = await prisma.roles.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RolesCreateManyArgs>(args?: SelectSubset<T, RolesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Roles and returns the data saved in the database.
     * @param {RolesCreateManyAndReturnArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const roles = await prisma.roles.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Roles and only return the `role_id`
     * const rolesWithRole_idOnly = await prisma.roles.createManyAndReturn({
     *   select: { role_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RolesCreateManyAndReturnArgs>(args?: SelectSubset<T, RolesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Roles.
     * @param {RolesDeleteArgs} args - Arguments to delete one Roles.
     * @example
     * // Delete one Roles
     * const Roles = await prisma.roles.delete({
     *   where: {
     *     // ... filter to delete one Roles
     *   }
     * })
     * 
     */
    delete<T extends RolesDeleteArgs>(args: SelectSubset<T, RolesDeleteArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Roles.
     * @param {RolesUpdateArgs} args - Arguments to update one Roles.
     * @example
     * // Update one Roles
     * const roles = await prisma.roles.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RolesUpdateArgs>(args: SelectSubset<T, RolesUpdateArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Roles.
     * @param {RolesDeleteManyArgs} args - Arguments to filter Roles to delete.
     * @example
     * // Delete a few Roles
     * const { count } = await prisma.roles.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RolesDeleteManyArgs>(args?: SelectSubset<T, RolesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Roles
     * const roles = await prisma.roles.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RolesUpdateManyArgs>(args: SelectSubset<T, RolesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles and returns the data updated in the database.
     * @param {RolesUpdateManyAndReturnArgs} args - Arguments to update many Roles.
     * @example
     * // Update many Roles
     * const roles = await prisma.roles.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Roles and only return the `role_id`
     * const rolesWithRole_idOnly = await prisma.roles.updateManyAndReturn({
     *   select: { role_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RolesUpdateManyAndReturnArgs>(args: SelectSubset<T, RolesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Roles.
     * @param {RolesUpsertArgs} args - Arguments to update or create a Roles.
     * @example
     * // Update or create a Roles
     * const roles = await prisma.roles.upsert({
     *   create: {
     *     // ... data to create a Roles
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Roles we want to update
     *   }
     * })
     */
    upsert<T extends RolesUpsertArgs>(args: SelectSubset<T, RolesUpsertArgs<ExtArgs>>): Prisma__RolesClient<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesCountArgs} args - Arguments to filter Roles to count.
     * @example
     * // Count the number of Roles
     * const count = await prisma.roles.count({
     *   where: {
     *     // ... the filter for the Roles we want to count
     *   }
     * })
    **/
    count<T extends RolesCountArgs>(
      args?: Subset<T, RolesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RolesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RolesAggregateArgs>(args: Subset<T, RolesAggregateArgs>): Prisma.PrismaPromise<GetRolesAggregateType<T>>

    /**
     * Group by Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RolesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RolesGroupByArgs['orderBy'] }
        : { orderBy?: RolesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RolesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Roles model
   */
  readonly fields: RolesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Roles.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RolesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Roles$usersArgs<ExtArgs> = {}>(args?: Subset<T, Roles$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Roles model
   */
  interface RolesFieldRefs {
    readonly role_id: FieldRef<"Roles", 'String'>
    readonly role_name: FieldRef<"Roles", 'String'>
    readonly description: FieldRef<"Roles", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Roles findUnique
   */
  export type RolesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where: RolesWhereUniqueInput
  }

  /**
   * Roles findUniqueOrThrow
   */
  export type RolesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where: RolesWhereUniqueInput
  }

  /**
   * Roles findFirst
   */
  export type RolesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RolesOrderByWithRelationInput | RolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * Roles findFirstOrThrow
   */
  export type RolesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RolesOrderByWithRelationInput | RolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * Roles findMany
   */
  export type RolesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RolesOrderByWithRelationInput | RolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Roles.
     */
    cursor?: RolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * Roles create
   */
  export type RolesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * The data needed to create a Roles.
     */
    data: XOR<RolesCreateInput, RolesUncheckedCreateInput>
  }

  /**
   * Roles createMany
   */
  export type RolesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Roles.
     */
    data: RolesCreateManyInput | RolesCreateManyInput[]
  }

  /**
   * Roles createManyAndReturn
   */
  export type RolesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * The data used to create many Roles.
     */
    data: RolesCreateManyInput | RolesCreateManyInput[]
  }

  /**
   * Roles update
   */
  export type RolesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * The data needed to update a Roles.
     */
    data: XOR<RolesUpdateInput, RolesUncheckedUpdateInput>
    /**
     * Choose, which Roles to update.
     */
    where: RolesWhereUniqueInput
  }

  /**
   * Roles updateMany
   */
  export type RolesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Roles.
     */
    data: XOR<RolesUpdateManyMutationInput, RolesUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RolesWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Roles updateManyAndReturn
   */
  export type RolesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * The data used to update Roles.
     */
    data: XOR<RolesUpdateManyMutationInput, RolesUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RolesWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Roles upsert
   */
  export type RolesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * The filter to search for the Roles to update in case it exists.
     */
    where: RolesWhereUniqueInput
    /**
     * In case the Roles found by the `where` argument doesn't exist, create a new Roles with this data.
     */
    create: XOR<RolesCreateInput, RolesUncheckedCreateInput>
    /**
     * In case the Roles was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RolesUpdateInput, RolesUncheckedUpdateInput>
  }

  /**
   * Roles delete
   */
  export type RolesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    /**
     * Filter which Roles to delete.
     */
    where: RolesWhereUniqueInput
  }

  /**
   * Roles deleteMany
   */
  export type RolesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Roles to delete
     */
    where?: RolesWhereInput
    /**
     * Limit how many Roles to delete.
     */
    limit?: number
  }

  /**
   * Roles.users
   */
  export type Roles$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    where?: UsersWhereInput
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    cursor?: UsersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Roles without action
   */
  export type RolesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
  }


  /**
   * Model Users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersMinAggregateOutputType = {
    user_id: string | null
    username: string | null
    email: string | null
    password: string | null
    created_at: Date | null
    last_login: Date | null
  }

  export type UsersMaxAggregateOutputType = {
    user_id: string | null
    username: string | null
    email: string | null
    password: string | null
    created_at: Date | null
    last_login: Date | null
  }

  export type UsersCountAggregateOutputType = {
    user_id: number
    username: number
    email: number
    password: number
    created_at: number
    last_login: number
    _all: number
  }


  export type UsersMinAggregateInputType = {
    user_id?: true
    username?: true
    email?: true
    password?: true
    created_at?: true
    last_login?: true
  }

  export type UsersMaxAggregateInputType = {
    user_id?: true
    username?: true
    email?: true
    password?: true
    created_at?: true
    last_login?: true
  }

  export type UsersCountAggregateInputType = {
    user_id?: true
    username?: true
    email?: true
    password?: true
    created_at?: true
    last_login?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to aggregate.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type UsersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsersWhereInput
    orderBy?: UsersOrderByWithAggregationInput | UsersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: UsersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    user_id: string
    username: string
    email: string
    password: string
    created_at: Date
    last_login: Date | null
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends UsersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type UsersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    last_login?: boolean
    sessions?: boolean | Users$sessionsArgs<ExtArgs>
    roles?: boolean | Users$rolesArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type UsersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    last_login?: boolean
  }, ExtArgs["result"]["users"]>

  export type UsersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    last_login?: boolean
  }, ExtArgs["result"]["users"]>

  export type UsersSelectScalar = {
    user_id?: boolean
    username?: boolean
    email?: boolean
    password?: boolean
    created_at?: boolean
    last_login?: boolean
  }

  export type UsersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"user_id" | "username" | "email" | "password" | "created_at" | "last_login", ExtArgs["result"]["users"]>
  export type UsersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | Users$sessionsArgs<ExtArgs>
    roles?: boolean | Users$rolesArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UsersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UsersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Users"
    objects: {
      sessions: Prisma.$SessionsPayload<ExtArgs>[]
      roles: Prisma.$RolesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      user_id: string
      username: string
      email: string
      password: string
      created_at: Date
      last_login: Date | null
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type UsersGetPayload<S extends boolean | null | undefined | UsersDefaultArgs> = $Result.GetResult<Prisma.$UsersPayload, S>

  type UsersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface UsersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Users'], meta: { name: 'Users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {UsersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsersFindUniqueArgs>(args: SelectSubset<T, UsersFindUniqueArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsersFindUniqueOrThrowArgs>(args: SelectSubset<T, UsersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsersFindFirstArgs>(args?: SelectSubset<T, UsersFindFirstArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsersFindFirstOrThrowArgs>(args?: SelectSubset<T, UsersFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `user_id`
     * const usersWithUser_idOnly = await prisma.users.findMany({ select: { user_id: true } })
     * 
     */
    findMany<T extends UsersFindManyArgs>(args?: SelectSubset<T, UsersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Users.
     * @param {UsersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends UsersCreateArgs>(args: SelectSubset<T, UsersCreateArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UsersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsersCreateManyArgs>(args?: SelectSubset<T, UsersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UsersCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `user_id`
     * const usersWithUser_idOnly = await prisma.users.createManyAndReturn({
     *   select: { user_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsersCreateManyAndReturnArgs>(args?: SelectSubset<T, UsersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Users.
     * @param {UsersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends UsersDeleteArgs>(args: SelectSubset<T, UsersDeleteArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Users.
     * @param {UsersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsersUpdateArgs>(args: SelectSubset<T, UsersUpdateArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UsersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsersDeleteManyArgs>(args?: SelectSubset<T, UsersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsersUpdateManyArgs>(args: SelectSubset<T, UsersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UsersUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `user_id`
     * const usersWithUser_idOnly = await prisma.users.updateManyAndReturn({
     *   select: { user_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsersUpdateManyAndReturnArgs>(args: SelectSubset<T, UsersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Users.
     * @param {UsersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends UsersUpsertArgs>(args: SelectSubset<T, UsersUpsertArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UsersCountArgs>(
      args?: Subset<T, UsersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsersGroupByArgs['orderBy'] }
        : { orderBy?: UsersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Users model
   */
  readonly fields: UsersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sessions<T extends Users$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, Users$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    roles<T extends Users$rolesArgs<ExtArgs> = {}>(args?: Subset<T, Users$rolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Users model
   */
  interface UsersFieldRefs {
    readonly user_id: FieldRef<"Users", 'String'>
    readonly username: FieldRef<"Users", 'String'>
    readonly email: FieldRef<"Users", 'String'>
    readonly password: FieldRef<"Users", 'String'>
    readonly created_at: FieldRef<"Users", 'DateTime'>
    readonly last_login: FieldRef<"Users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Users findUnique
   */
  export type UsersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users findUniqueOrThrow
   */
  export type UsersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users findFirst
   */
  export type UsersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Users findFirstOrThrow
   */
  export type UsersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Users findMany
   */
  export type UsersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Users create
   */
  export type UsersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * The data needed to create a Users.
     */
    data: XOR<UsersCreateInput, UsersUncheckedCreateInput>
  }

  /**
   * Users createMany
   */
  export type UsersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UsersCreateManyInput | UsersCreateManyInput[]
  }

  /**
   * Users createManyAndReturn
   */
  export type UsersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UsersCreateManyInput | UsersCreateManyInput[]
  }

  /**
   * Users update
   */
  export type UsersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * The data needed to update a Users.
     */
    data: XOR<UsersUpdateInput, UsersUncheckedUpdateInput>
    /**
     * Choose, which Users to update.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users updateMany
   */
  export type UsersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UsersUpdateManyMutationInput, UsersUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UsersWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * Users updateManyAndReturn
   */
  export type UsersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UsersUpdateManyMutationInput, UsersUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UsersWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * Users upsert
   */
  export type UsersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * The filter to search for the Users to update in case it exists.
     */
    where: UsersWhereUniqueInput
    /**
     * In case the Users found by the `where` argument doesn't exist, create a new Users with this data.
     */
    create: XOR<UsersCreateInput, UsersUncheckedCreateInput>
    /**
     * In case the Users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsersUpdateInput, UsersUncheckedUpdateInput>
  }

  /**
   * Users delete
   */
  export type UsersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter which Users to delete.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users deleteMany
   */
  export type UsersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UsersWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * Users.sessions
   */
  export type Users$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    where?: SessionsWhereInput
    orderBy?: SessionsOrderByWithRelationInput | SessionsOrderByWithRelationInput[]
    cursor?: SessionsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionsScalarFieldEnum | SessionsScalarFieldEnum[]
  }

  /**
   * Users.roles
   */
  export type Users$rolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Roles
     */
    select?: RolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Roles
     */
    omit?: RolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolesInclude<ExtArgs> | null
    where?: RolesWhereInput
    orderBy?: RolesOrderByWithRelationInput | RolesOrderByWithRelationInput[]
    cursor?: RolesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * Users without action
   */
  export type UsersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
  }


  /**
   * Model Sessions
   */

  export type AggregateSessions = {
    _count: SessionsCountAggregateOutputType | null
    _min: SessionsMinAggregateOutputType | null
    _max: SessionsMaxAggregateOutputType | null
  }

  export type SessionsMinAggregateOutputType = {
    session_id: string | null
    created_at: Date | null
    last_accessed: Date | null
    session_key: string | null
    user_id: string | null
  }

  export type SessionsMaxAggregateOutputType = {
    session_id: string | null
    created_at: Date | null
    last_accessed: Date | null
    session_key: string | null
    user_id: string | null
  }

  export type SessionsCountAggregateOutputType = {
    session_id: number
    created_at: number
    last_accessed: number
    session_key: number
    user_id: number
    _all: number
  }


  export type SessionsMinAggregateInputType = {
    session_id?: true
    created_at?: true
    last_accessed?: true
    session_key?: true
    user_id?: true
  }

  export type SessionsMaxAggregateInputType = {
    session_id?: true
    created_at?: true
    last_accessed?: true
    session_key?: true
    user_id?: true
  }

  export type SessionsCountAggregateInputType = {
    session_id?: true
    created_at?: true
    last_accessed?: true
    session_key?: true
    user_id?: true
    _all?: true
  }

  export type SessionsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to aggregate.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionsOrderByWithRelationInput | SessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionsMaxAggregateInputType
  }

  export type GetSessionsAggregateType<T extends SessionsAggregateArgs> = {
        [P in keyof T & keyof AggregateSessions]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSessions[P]>
      : GetScalarType<T[P], AggregateSessions[P]>
  }




  export type SessionsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionsWhereInput
    orderBy?: SessionsOrderByWithAggregationInput | SessionsOrderByWithAggregationInput[]
    by: SessionsScalarFieldEnum[] | SessionsScalarFieldEnum
    having?: SessionsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionsCountAggregateInputType | true
    _min?: SessionsMinAggregateInputType
    _max?: SessionsMaxAggregateInputType
  }

  export type SessionsGroupByOutputType = {
    session_id: string
    created_at: Date
    last_accessed: Date
    session_key: string | null
    user_id: string
    _count: SessionsCountAggregateOutputType | null
    _min: SessionsMinAggregateOutputType | null
    _max: SessionsMaxAggregateOutputType | null
  }

  type GetSessionsGroupByPayload<T extends SessionsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionsGroupByOutputType[P]>
            : GetScalarType<T[P], SessionsGroupByOutputType[P]>
        }
      >
    >


  export type SessionsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    session_id?: boolean
    created_at?: boolean
    last_accessed?: boolean
    session_key?: boolean
    user_id?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sessions"]>

  export type SessionsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    session_id?: boolean
    created_at?: boolean
    last_accessed?: boolean
    session_key?: boolean
    user_id?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sessions"]>

  export type SessionsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    session_id?: boolean
    created_at?: boolean
    last_accessed?: boolean
    session_key?: boolean
    user_id?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sessions"]>

  export type SessionsSelectScalar = {
    session_id?: boolean
    created_at?: boolean
    last_accessed?: boolean
    session_key?: boolean
    user_id?: boolean
  }

  export type SessionsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"session_id" | "created_at" | "last_accessed" | "session_key" | "user_id", ExtArgs["result"]["sessions"]>
  export type SessionsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type SessionsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type SessionsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }

  export type $SessionsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sessions"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      session_id: string
      created_at: Date
      last_accessed: Date
      session_key: string | null
      user_id: string
    }, ExtArgs["result"]["sessions"]>
    composites: {}
  }

  type SessionsGetPayload<S extends boolean | null | undefined | SessionsDefaultArgs> = $Result.GetResult<Prisma.$SessionsPayload, S>

  type SessionsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: SessionsCountAggregateInputType | true
    }

  export interface SessionsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sessions'], meta: { name: 'Sessions' } }
    /**
     * Find zero or one Sessions that matches the filter.
     * @param {SessionsFindUniqueArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionsFindUniqueArgs>(args: SelectSubset<T, SessionsFindUniqueArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sessions that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionsFindUniqueOrThrowArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionsFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsFindFirstArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionsFindFirstArgs>(args?: SelectSubset<T, SessionsFindFirstArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sessions that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsFindFirstOrThrowArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionsFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.sessions.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.sessions.findMany({ take: 10 })
     * 
     * // Only select the `session_id`
     * const sessionsWithSession_idOnly = await prisma.sessions.findMany({ select: { session_id: true } })
     * 
     */
    findMany<T extends SessionsFindManyArgs>(args?: SelectSubset<T, SessionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sessions.
     * @param {SessionsCreateArgs} args - Arguments to create a Sessions.
     * @example
     * // Create one Sessions
     * const Sessions = await prisma.sessions.create({
     *   data: {
     *     // ... data to create a Sessions
     *   }
     * })
     * 
     */
    create<T extends SessionsCreateArgs>(args: SelectSubset<T, SessionsCreateArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionsCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const sessions = await prisma.sessions.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionsCreateManyArgs>(args?: SelectSubset<T, SessionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionsCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const sessions = await prisma.sessions.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `session_id`
     * const sessionsWithSession_idOnly = await prisma.sessions.createManyAndReturn({
     *   select: { session_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionsCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sessions.
     * @param {SessionsDeleteArgs} args - Arguments to delete one Sessions.
     * @example
     * // Delete one Sessions
     * const Sessions = await prisma.sessions.delete({
     *   where: {
     *     // ... filter to delete one Sessions
     *   }
     * })
     * 
     */
    delete<T extends SessionsDeleteArgs>(args: SelectSubset<T, SessionsDeleteArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sessions.
     * @param {SessionsUpdateArgs} args - Arguments to update one Sessions.
     * @example
     * // Update one Sessions
     * const sessions = await prisma.sessions.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionsUpdateArgs>(args: SelectSubset<T, SessionsUpdateArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionsDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.sessions.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionsDeleteManyArgs>(args?: SelectSubset<T, SessionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const sessions = await prisma.sessions.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionsUpdateManyArgs>(args: SelectSubset<T, SessionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionsUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const sessions = await prisma.sessions.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `session_id`
     * const sessionsWithSession_idOnly = await prisma.sessions.updateManyAndReturn({
     *   select: { session_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionsUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sessions.
     * @param {SessionsUpsertArgs} args - Arguments to update or create a Sessions.
     * @example
     * // Update or create a Sessions
     * const sessions = await prisma.sessions.upsert({
     *   create: {
     *     // ... data to create a Sessions
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sessions we want to update
     *   }
     * })
     */
    upsert<T extends SessionsUpsertArgs>(args: SelectSubset<T, SessionsUpsertArgs<ExtArgs>>): Prisma__SessionsClient<$Result.GetResult<Prisma.$SessionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.sessions.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionsCountArgs>(
      args?: Subset<T, SessionsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionsAggregateArgs>(args: Subset<T, SessionsAggregateArgs>): Prisma.PrismaPromise<GetSessionsAggregateType<T>>

    /**
     * Group by Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionsGroupByArgs['orderBy'] }
        : { orderBy?: SessionsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sessions model
   */
  readonly fields: SessionsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sessions.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sessions model
   */
  interface SessionsFieldRefs {
    readonly session_id: FieldRef<"Sessions", 'String'>
    readonly created_at: FieldRef<"Sessions", 'DateTime'>
    readonly last_accessed: FieldRef<"Sessions", 'DateTime'>
    readonly session_key: FieldRef<"Sessions", 'String'>
    readonly user_id: FieldRef<"Sessions", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Sessions findUnique
   */
  export type SessionsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where: SessionsWhereUniqueInput
  }

  /**
   * Sessions findUniqueOrThrow
   */
  export type SessionsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where: SessionsWhereUniqueInput
  }

  /**
   * Sessions findFirst
   */
  export type SessionsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionsOrderByWithRelationInput | SessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionsScalarFieldEnum | SessionsScalarFieldEnum[]
  }

  /**
   * Sessions findFirstOrThrow
   */
  export type SessionsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionsOrderByWithRelationInput | SessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionsScalarFieldEnum | SessionsScalarFieldEnum[]
  }

  /**
   * Sessions findMany
   */
  export type SessionsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionsOrderByWithRelationInput | SessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionsScalarFieldEnum | SessionsScalarFieldEnum[]
  }

  /**
   * Sessions create
   */
  export type SessionsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * The data needed to create a Sessions.
     */
    data: XOR<SessionsCreateInput, SessionsUncheckedCreateInput>
  }

  /**
   * Sessions createMany
   */
  export type SessionsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionsCreateManyInput | SessionsCreateManyInput[]
  }

  /**
   * Sessions createManyAndReturn
   */
  export type SessionsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionsCreateManyInput | SessionsCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Sessions update
   */
  export type SessionsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * The data needed to update a Sessions.
     */
    data: XOR<SessionsUpdateInput, SessionsUncheckedUpdateInput>
    /**
     * Choose, which Sessions to update.
     */
    where: SessionsWhereUniqueInput
  }

  /**
   * Sessions updateMany
   */
  export type SessionsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionsUpdateManyMutationInput, SessionsUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionsWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Sessions updateManyAndReturn
   */
  export type SessionsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionsUpdateManyMutationInput, SessionsUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionsWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Sessions upsert
   */
  export type SessionsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * The filter to search for the Sessions to update in case it exists.
     */
    where: SessionsWhereUniqueInput
    /**
     * In case the Sessions found by the `where` argument doesn't exist, create a new Sessions with this data.
     */
    create: XOR<SessionsCreateInput, SessionsUncheckedCreateInput>
    /**
     * In case the Sessions was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionsUpdateInput, SessionsUncheckedUpdateInput>
  }

  /**
   * Sessions delete
   */
  export type SessionsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
    /**
     * Filter which Sessions to delete.
     */
    where: SessionsWhereUniqueInput
  }

  /**
   * Sessions deleteMany
   */
  export type SessionsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionsWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Sessions without action
   */
  export type SessionsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sessions
     */
    omit?: SessionsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SettingsScalarFieldEnum: {
    key: 'key',
    value: 'value'
  };

  export type SettingsScalarFieldEnum = (typeof SettingsScalarFieldEnum)[keyof typeof SettingsScalarFieldEnum]


  export const RecipesScalarFieldEnum: {
    recipe_id: 'recipe_id',
    recipe_name: 'recipe_name',
    description: 'description',
    owner_id: 'owner_id',
    plugin_names: 'plugin_names',
    skip_required_plugins: 'skip_required_plugins',
    skip_core: 'skip_core'
  };

  export type RecipesScalarFieldEnum = (typeof RecipesScalarFieldEnum)[keyof typeof RecipesScalarFieldEnum]


  export const RecipeAclScalarFieldEnum: {
    acl_id: 'acl_id',
    role_id: 'role_id',
    permission: 'permission',
    recipe_id: 'recipe_id'
  };

  export type RecipeAclScalarFieldEnum = (typeof RecipeAclScalarFieldEnum)[keyof typeof RecipeAclScalarFieldEnum]


  export const Recipe_bagsScalarFieldEnum: {
    recipe_id: 'recipe_id',
    bag_id: 'bag_id',
    position: 'position',
    with_acl: 'with_acl',
    load_modules: 'load_modules'
  };

  export type Recipe_bagsScalarFieldEnum = (typeof Recipe_bagsScalarFieldEnum)[keyof typeof Recipe_bagsScalarFieldEnum]


  export const BagsScalarFieldEnum: {
    bag_id: 'bag_id',
    bag_name: 'bag_name',
    description: 'description',
    owner_id: 'owner_id'
  };

  export type BagsScalarFieldEnum = (typeof BagsScalarFieldEnum)[keyof typeof BagsScalarFieldEnum]


  export const BagAclScalarFieldEnum: {
    acl_id: 'acl_id',
    bag_id: 'bag_id',
    role_id: 'role_id',
    permission: 'permission'
  };

  export type BagAclScalarFieldEnum = (typeof BagAclScalarFieldEnum)[keyof typeof BagAclScalarFieldEnum]


  export const TiddlersScalarFieldEnum: {
    revision_id: 'revision_id',
    bag_id: 'bag_id',
    title: 'title',
    is_deleted: 'is_deleted',
    attachment_hash: 'attachment_hash'
  };

  export type TiddlersScalarFieldEnum = (typeof TiddlersScalarFieldEnum)[keyof typeof TiddlersScalarFieldEnum]


  export const FieldsScalarFieldEnum: {
    revision_id: 'revision_id',
    field_name: 'field_name',
    field_value: 'field_value'
  };

  export type FieldsScalarFieldEnum = (typeof FieldsScalarFieldEnum)[keyof typeof FieldsScalarFieldEnum]


  export const RolesScalarFieldEnum: {
    role_id: 'role_id',
    role_name: 'role_name',
    description: 'description'
  };

  export type RolesScalarFieldEnum = (typeof RolesScalarFieldEnum)[keyof typeof RolesScalarFieldEnum]


  export const UsersScalarFieldEnum: {
    user_id: 'user_id',
    username: 'username',
    email: 'email',
    password: 'password',
    created_at: 'created_at',
    last_login: 'last_login'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const SessionsScalarFieldEnum: {
    session_id: 'session_id',
    created_at: 'created_at',
    last_accessed: 'last_accessed',
    session_key: 'session_key',
    user_id: 'user_id'
  };

  export type SessionsScalarFieldEnum = (typeof SessionsScalarFieldEnum)[keyof typeof SessionsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Permission'
   */
  export type EnumPermissionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Permission'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type SettingsWhereInput = {
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    key?: StringFilter<"Settings"> | string
    value?: StringFilter<"Settings"> | string
  }

  export type SettingsOrderByWithRelationInput = {
    key?: SortOrder
    value?: SortOrder
  }

  export type SettingsWhereUniqueInput = Prisma.AtLeast<{
    key?: string
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    value?: StringFilter<"Settings"> | string
  }, "key">

  export type SettingsOrderByWithAggregationInput = {
    key?: SortOrder
    value?: SortOrder
    _count?: SettingsCountOrderByAggregateInput
    _max?: SettingsMaxOrderByAggregateInput
    _min?: SettingsMinOrderByAggregateInput
  }

  export type SettingsScalarWhereWithAggregatesInput = {
    AND?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    OR?: SettingsScalarWhereWithAggregatesInput[]
    NOT?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    key?: StringWithAggregatesFilter<"Settings"> | string
    value?: StringWithAggregatesFilter<"Settings"> | string
  }

  export type RecipesWhereInput = {
    AND?: RecipesWhereInput | RecipesWhereInput[]
    OR?: RecipesWhereInput[]
    NOT?: RecipesWhereInput | RecipesWhereInput[]
    recipe_id?: StringFilter<"Recipes"> | string
    recipe_name?: StringFilter<"Recipes"> | string
    description?: StringFilter<"Recipes"> | string
    owner_id?: StringNullableFilter<"Recipes"> | string | null
    plugin_names?: JsonFilter<"Recipes">
    skip_required_plugins?: BoolFilter<"Recipes"> | boolean
    skip_core?: BoolFilter<"Recipes"> | boolean
    recipe_bags?: Recipe_bagsListRelationFilter
    acl?: RecipeAclListRelationFilter
  }

  export type RecipesOrderByWithRelationInput = {
    recipe_id?: SortOrder
    recipe_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrderInput | SortOrder
    plugin_names?: SortOrder
    skip_required_plugins?: SortOrder
    skip_core?: SortOrder
    recipe_bags?: Recipe_bagsOrderByRelationAggregateInput
    acl?: RecipeAclOrderByRelationAggregateInput
  }

  export type RecipesWhereUniqueInput = Prisma.AtLeast<{
    recipe_id?: string
    recipe_name?: string
    AND?: RecipesWhereInput | RecipesWhereInput[]
    OR?: RecipesWhereInput[]
    NOT?: RecipesWhereInput | RecipesWhereInput[]
    description?: StringFilter<"Recipes"> | string
    owner_id?: StringNullableFilter<"Recipes"> | string | null
    plugin_names?: JsonFilter<"Recipes">
    skip_required_plugins?: BoolFilter<"Recipes"> | boolean
    skip_core?: BoolFilter<"Recipes"> | boolean
    recipe_bags?: Recipe_bagsListRelationFilter
    acl?: RecipeAclListRelationFilter
  }, "recipe_id" | "recipe_name">

  export type RecipesOrderByWithAggregationInput = {
    recipe_id?: SortOrder
    recipe_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrderInput | SortOrder
    plugin_names?: SortOrder
    skip_required_plugins?: SortOrder
    skip_core?: SortOrder
    _count?: RecipesCountOrderByAggregateInput
    _max?: RecipesMaxOrderByAggregateInput
    _min?: RecipesMinOrderByAggregateInput
  }

  export type RecipesScalarWhereWithAggregatesInput = {
    AND?: RecipesScalarWhereWithAggregatesInput | RecipesScalarWhereWithAggregatesInput[]
    OR?: RecipesScalarWhereWithAggregatesInput[]
    NOT?: RecipesScalarWhereWithAggregatesInput | RecipesScalarWhereWithAggregatesInput[]
    recipe_id?: StringWithAggregatesFilter<"Recipes"> | string
    recipe_name?: StringWithAggregatesFilter<"Recipes"> | string
    description?: StringWithAggregatesFilter<"Recipes"> | string
    owner_id?: StringNullableWithAggregatesFilter<"Recipes"> | string | null
    plugin_names?: JsonWithAggregatesFilter<"Recipes">
    skip_required_plugins?: BoolWithAggregatesFilter<"Recipes"> | boolean
    skip_core?: BoolWithAggregatesFilter<"Recipes"> | boolean
  }

  export type RecipeAclWhereInput = {
    AND?: RecipeAclWhereInput | RecipeAclWhereInput[]
    OR?: RecipeAclWhereInput[]
    NOT?: RecipeAclWhereInput | RecipeAclWhereInput[]
    acl_id?: IntFilter<"RecipeAcl"> | number
    role_id?: StringFilter<"RecipeAcl"> | string
    permission?: EnumPermissionFilter<"RecipeAcl"> | $Enums.Permission
    recipe_id?: StringFilter<"RecipeAcl"> | string
    recipe?: XOR<RecipesScalarRelationFilter, RecipesWhereInput>
  }

  export type RecipeAclOrderByWithRelationInput = {
    acl_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    recipe_id?: SortOrder
    recipe?: RecipesOrderByWithRelationInput
  }

  export type RecipeAclWhereUniqueInput = Prisma.AtLeast<{
    acl_id?: number
    AND?: RecipeAclWhereInput | RecipeAclWhereInput[]
    OR?: RecipeAclWhereInput[]
    NOT?: RecipeAclWhereInput | RecipeAclWhereInput[]
    role_id?: StringFilter<"RecipeAcl"> | string
    permission?: EnumPermissionFilter<"RecipeAcl"> | $Enums.Permission
    recipe_id?: StringFilter<"RecipeAcl"> | string
    recipe?: XOR<RecipesScalarRelationFilter, RecipesWhereInput>
  }, "acl_id">

  export type RecipeAclOrderByWithAggregationInput = {
    acl_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    recipe_id?: SortOrder
    _count?: RecipeAclCountOrderByAggregateInput
    _avg?: RecipeAclAvgOrderByAggregateInput
    _max?: RecipeAclMaxOrderByAggregateInput
    _min?: RecipeAclMinOrderByAggregateInput
    _sum?: RecipeAclSumOrderByAggregateInput
  }

  export type RecipeAclScalarWhereWithAggregatesInput = {
    AND?: RecipeAclScalarWhereWithAggregatesInput | RecipeAclScalarWhereWithAggregatesInput[]
    OR?: RecipeAclScalarWhereWithAggregatesInput[]
    NOT?: RecipeAclScalarWhereWithAggregatesInput | RecipeAclScalarWhereWithAggregatesInput[]
    acl_id?: IntWithAggregatesFilter<"RecipeAcl"> | number
    role_id?: StringWithAggregatesFilter<"RecipeAcl"> | string
    permission?: EnumPermissionWithAggregatesFilter<"RecipeAcl"> | $Enums.Permission
    recipe_id?: StringWithAggregatesFilter<"RecipeAcl"> | string
  }

  export type Recipe_bagsWhereInput = {
    AND?: Recipe_bagsWhereInput | Recipe_bagsWhereInput[]
    OR?: Recipe_bagsWhereInput[]
    NOT?: Recipe_bagsWhereInput | Recipe_bagsWhereInput[]
    recipe_id?: StringFilter<"Recipe_bags"> | string
    bag_id?: StringFilter<"Recipe_bags"> | string
    position?: IntFilter<"Recipe_bags"> | number
    with_acl?: BoolFilter<"Recipe_bags"> | boolean
    load_modules?: BoolFilter<"Recipe_bags"> | boolean
    bag?: XOR<BagsScalarRelationFilter, BagsWhereInput>
    recipe?: XOR<RecipesScalarRelationFilter, RecipesWhereInput>
  }

  export type Recipe_bagsOrderByWithRelationInput = {
    recipe_id?: SortOrder
    bag_id?: SortOrder
    position?: SortOrder
    with_acl?: SortOrder
    load_modules?: SortOrder
    bag?: BagsOrderByWithRelationInput
    recipe?: RecipesOrderByWithRelationInput
  }

  export type Recipe_bagsWhereUniqueInput = Prisma.AtLeast<{
    recipe_id_bag_id?: Recipe_bagsRecipe_idBag_idCompoundUniqueInput
    AND?: Recipe_bagsWhereInput | Recipe_bagsWhereInput[]
    OR?: Recipe_bagsWhereInput[]
    NOT?: Recipe_bagsWhereInput | Recipe_bagsWhereInput[]
    recipe_id?: StringFilter<"Recipe_bags"> | string
    bag_id?: StringFilter<"Recipe_bags"> | string
    position?: IntFilter<"Recipe_bags"> | number
    with_acl?: BoolFilter<"Recipe_bags"> | boolean
    load_modules?: BoolFilter<"Recipe_bags"> | boolean
    bag?: XOR<BagsScalarRelationFilter, BagsWhereInput>
    recipe?: XOR<RecipesScalarRelationFilter, RecipesWhereInput>
  }, "recipe_id_bag_id">

  export type Recipe_bagsOrderByWithAggregationInput = {
    recipe_id?: SortOrder
    bag_id?: SortOrder
    position?: SortOrder
    with_acl?: SortOrder
    load_modules?: SortOrder
    _count?: Recipe_bagsCountOrderByAggregateInput
    _avg?: Recipe_bagsAvgOrderByAggregateInput
    _max?: Recipe_bagsMaxOrderByAggregateInput
    _min?: Recipe_bagsMinOrderByAggregateInput
    _sum?: Recipe_bagsSumOrderByAggregateInput
  }

  export type Recipe_bagsScalarWhereWithAggregatesInput = {
    AND?: Recipe_bagsScalarWhereWithAggregatesInput | Recipe_bagsScalarWhereWithAggregatesInput[]
    OR?: Recipe_bagsScalarWhereWithAggregatesInput[]
    NOT?: Recipe_bagsScalarWhereWithAggregatesInput | Recipe_bagsScalarWhereWithAggregatesInput[]
    recipe_id?: StringWithAggregatesFilter<"Recipe_bags"> | string
    bag_id?: StringWithAggregatesFilter<"Recipe_bags"> | string
    position?: IntWithAggregatesFilter<"Recipe_bags"> | number
    with_acl?: BoolWithAggregatesFilter<"Recipe_bags"> | boolean
    load_modules?: BoolWithAggregatesFilter<"Recipe_bags"> | boolean
  }

  export type BagsWhereInput = {
    AND?: BagsWhereInput | BagsWhereInput[]
    OR?: BagsWhereInput[]
    NOT?: BagsWhereInput | BagsWhereInput[]
    bag_id?: StringFilter<"Bags"> | string
    bag_name?: StringFilter<"Bags"> | string
    description?: StringFilter<"Bags"> | string
    owner_id?: StringNullableFilter<"Bags"> | string | null
    recipe_bags?: Recipe_bagsListRelationFilter
    tiddlers?: TiddlersListRelationFilter
    acl?: BagAclListRelationFilter
  }

  export type BagsOrderByWithRelationInput = {
    bag_id?: SortOrder
    bag_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrderInput | SortOrder
    recipe_bags?: Recipe_bagsOrderByRelationAggregateInput
    tiddlers?: TiddlersOrderByRelationAggregateInput
    acl?: BagAclOrderByRelationAggregateInput
  }

  export type BagsWhereUniqueInput = Prisma.AtLeast<{
    bag_id?: string
    bag_name?: string
    AND?: BagsWhereInput | BagsWhereInput[]
    OR?: BagsWhereInput[]
    NOT?: BagsWhereInput | BagsWhereInput[]
    description?: StringFilter<"Bags"> | string
    owner_id?: StringNullableFilter<"Bags"> | string | null
    recipe_bags?: Recipe_bagsListRelationFilter
    tiddlers?: TiddlersListRelationFilter
    acl?: BagAclListRelationFilter
  }, "bag_id" | "bag_name">

  export type BagsOrderByWithAggregationInput = {
    bag_id?: SortOrder
    bag_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrderInput | SortOrder
    _count?: BagsCountOrderByAggregateInput
    _max?: BagsMaxOrderByAggregateInput
    _min?: BagsMinOrderByAggregateInput
  }

  export type BagsScalarWhereWithAggregatesInput = {
    AND?: BagsScalarWhereWithAggregatesInput | BagsScalarWhereWithAggregatesInput[]
    OR?: BagsScalarWhereWithAggregatesInput[]
    NOT?: BagsScalarWhereWithAggregatesInput | BagsScalarWhereWithAggregatesInput[]
    bag_id?: StringWithAggregatesFilter<"Bags"> | string
    bag_name?: StringWithAggregatesFilter<"Bags"> | string
    description?: StringWithAggregatesFilter<"Bags"> | string
    owner_id?: StringNullableWithAggregatesFilter<"Bags"> | string | null
  }

  export type BagAclWhereInput = {
    AND?: BagAclWhereInput | BagAclWhereInput[]
    OR?: BagAclWhereInput[]
    NOT?: BagAclWhereInput | BagAclWhereInput[]
    acl_id?: IntFilter<"BagAcl"> | number
    bag_id?: StringFilter<"BagAcl"> | string
    role_id?: StringFilter<"BagAcl"> | string
    permission?: EnumPermissionFilter<"BagAcl"> | $Enums.Permission
    bag?: XOR<BagsScalarRelationFilter, BagsWhereInput>
  }

  export type BagAclOrderByWithRelationInput = {
    acl_id?: SortOrder
    bag_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    bag?: BagsOrderByWithRelationInput
  }

  export type BagAclWhereUniqueInput = Prisma.AtLeast<{
    acl_id?: number
    AND?: BagAclWhereInput | BagAclWhereInput[]
    OR?: BagAclWhereInput[]
    NOT?: BagAclWhereInput | BagAclWhereInput[]
    bag_id?: StringFilter<"BagAcl"> | string
    role_id?: StringFilter<"BagAcl"> | string
    permission?: EnumPermissionFilter<"BagAcl"> | $Enums.Permission
    bag?: XOR<BagsScalarRelationFilter, BagsWhereInput>
  }, "acl_id">

  export type BagAclOrderByWithAggregationInput = {
    acl_id?: SortOrder
    bag_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    _count?: BagAclCountOrderByAggregateInput
    _avg?: BagAclAvgOrderByAggregateInput
    _max?: BagAclMaxOrderByAggregateInput
    _min?: BagAclMinOrderByAggregateInput
    _sum?: BagAclSumOrderByAggregateInput
  }

  export type BagAclScalarWhereWithAggregatesInput = {
    AND?: BagAclScalarWhereWithAggregatesInput | BagAclScalarWhereWithAggregatesInput[]
    OR?: BagAclScalarWhereWithAggregatesInput[]
    NOT?: BagAclScalarWhereWithAggregatesInput | BagAclScalarWhereWithAggregatesInput[]
    acl_id?: IntWithAggregatesFilter<"BagAcl"> | number
    bag_id?: StringWithAggregatesFilter<"BagAcl"> | string
    role_id?: StringWithAggregatesFilter<"BagAcl"> | string
    permission?: EnumPermissionWithAggregatesFilter<"BagAcl"> | $Enums.Permission
  }

  export type TiddlersWhereInput = {
    AND?: TiddlersWhereInput | TiddlersWhereInput[]
    OR?: TiddlersWhereInput[]
    NOT?: TiddlersWhereInput | TiddlersWhereInput[]
    revision_id?: StringFilter<"Tiddlers"> | string
    bag_id?: StringFilter<"Tiddlers"> | string
    title?: StringFilter<"Tiddlers"> | string
    is_deleted?: BoolFilter<"Tiddlers"> | boolean
    attachment_hash?: StringNullableFilter<"Tiddlers"> | string | null
    fields?: FieldsListRelationFilter
    bag?: XOR<BagsScalarRelationFilter, BagsWhereInput>
  }

  export type TiddlersOrderByWithRelationInput = {
    revision_id?: SortOrder
    bag_id?: SortOrder
    title?: SortOrder
    is_deleted?: SortOrder
    attachment_hash?: SortOrderInput | SortOrder
    fields?: FieldsOrderByRelationAggregateInput
    bag?: BagsOrderByWithRelationInput
  }

  export type TiddlersWhereUniqueInput = Prisma.AtLeast<{
    revision_id?: string
    bag_id_title?: TiddlersBag_idTitleCompoundUniqueInput
    AND?: TiddlersWhereInput | TiddlersWhereInput[]
    OR?: TiddlersWhereInput[]
    NOT?: TiddlersWhereInput | TiddlersWhereInput[]
    bag_id?: StringFilter<"Tiddlers"> | string
    title?: StringFilter<"Tiddlers"> | string
    is_deleted?: BoolFilter<"Tiddlers"> | boolean
    attachment_hash?: StringNullableFilter<"Tiddlers"> | string | null
    fields?: FieldsListRelationFilter
    bag?: XOR<BagsScalarRelationFilter, BagsWhereInput>
  }, "revision_id" | "bag_id_title">

  export type TiddlersOrderByWithAggregationInput = {
    revision_id?: SortOrder
    bag_id?: SortOrder
    title?: SortOrder
    is_deleted?: SortOrder
    attachment_hash?: SortOrderInput | SortOrder
    _count?: TiddlersCountOrderByAggregateInput
    _max?: TiddlersMaxOrderByAggregateInput
    _min?: TiddlersMinOrderByAggregateInput
  }

  export type TiddlersScalarWhereWithAggregatesInput = {
    AND?: TiddlersScalarWhereWithAggregatesInput | TiddlersScalarWhereWithAggregatesInput[]
    OR?: TiddlersScalarWhereWithAggregatesInput[]
    NOT?: TiddlersScalarWhereWithAggregatesInput | TiddlersScalarWhereWithAggregatesInput[]
    revision_id?: StringWithAggregatesFilter<"Tiddlers"> | string
    bag_id?: StringWithAggregatesFilter<"Tiddlers"> | string
    title?: StringWithAggregatesFilter<"Tiddlers"> | string
    is_deleted?: BoolWithAggregatesFilter<"Tiddlers"> | boolean
    attachment_hash?: StringNullableWithAggregatesFilter<"Tiddlers"> | string | null
  }

  export type FieldsWhereInput = {
    AND?: FieldsWhereInput | FieldsWhereInput[]
    OR?: FieldsWhereInput[]
    NOT?: FieldsWhereInput | FieldsWhereInput[]
    revision_id?: StringFilter<"Fields"> | string
    field_name?: StringFilter<"Fields"> | string
    field_value?: StringFilter<"Fields"> | string
    tiddler?: XOR<TiddlersScalarRelationFilter, TiddlersWhereInput>
  }

  export type FieldsOrderByWithRelationInput = {
    revision_id?: SortOrder
    field_name?: SortOrder
    field_value?: SortOrder
    tiddler?: TiddlersOrderByWithRelationInput
  }

  export type FieldsWhereUniqueInput = Prisma.AtLeast<{
    revision_id_field_name?: FieldsRevision_idField_nameCompoundUniqueInput
    AND?: FieldsWhereInput | FieldsWhereInput[]
    OR?: FieldsWhereInput[]
    NOT?: FieldsWhereInput | FieldsWhereInput[]
    revision_id?: StringFilter<"Fields"> | string
    field_name?: StringFilter<"Fields"> | string
    field_value?: StringFilter<"Fields"> | string
    tiddler?: XOR<TiddlersScalarRelationFilter, TiddlersWhereInput>
  }, "revision_id_field_name">

  export type FieldsOrderByWithAggregationInput = {
    revision_id?: SortOrder
    field_name?: SortOrder
    field_value?: SortOrder
    _count?: FieldsCountOrderByAggregateInput
    _max?: FieldsMaxOrderByAggregateInput
    _min?: FieldsMinOrderByAggregateInput
  }

  export type FieldsScalarWhereWithAggregatesInput = {
    AND?: FieldsScalarWhereWithAggregatesInput | FieldsScalarWhereWithAggregatesInput[]
    OR?: FieldsScalarWhereWithAggregatesInput[]
    NOT?: FieldsScalarWhereWithAggregatesInput | FieldsScalarWhereWithAggregatesInput[]
    revision_id?: StringWithAggregatesFilter<"Fields"> | string
    field_name?: StringWithAggregatesFilter<"Fields"> | string
    field_value?: StringWithAggregatesFilter<"Fields"> | string
  }

  export type RolesWhereInput = {
    AND?: RolesWhereInput | RolesWhereInput[]
    OR?: RolesWhereInput[]
    NOT?: RolesWhereInput | RolesWhereInput[]
    role_id?: StringFilter<"Roles"> | string
    role_name?: StringFilter<"Roles"> | string
    description?: StringNullableFilter<"Roles"> | string | null
    users?: UsersListRelationFilter
  }

  export type RolesOrderByWithRelationInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    description?: SortOrderInput | SortOrder
    users?: UsersOrderByRelationAggregateInput
  }

  export type RolesWhereUniqueInput = Prisma.AtLeast<{
    role_id?: string
    role_name?: string
    AND?: RolesWhereInput | RolesWhereInput[]
    OR?: RolesWhereInput[]
    NOT?: RolesWhereInput | RolesWhereInput[]
    description?: StringNullableFilter<"Roles"> | string | null
    users?: UsersListRelationFilter
  }, "role_id" | "role_name">

  export type RolesOrderByWithAggregationInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    description?: SortOrderInput | SortOrder
    _count?: RolesCountOrderByAggregateInput
    _max?: RolesMaxOrderByAggregateInput
    _min?: RolesMinOrderByAggregateInput
  }

  export type RolesScalarWhereWithAggregatesInput = {
    AND?: RolesScalarWhereWithAggregatesInput | RolesScalarWhereWithAggregatesInput[]
    OR?: RolesScalarWhereWithAggregatesInput[]
    NOT?: RolesScalarWhereWithAggregatesInput | RolesScalarWhereWithAggregatesInput[]
    role_id?: StringWithAggregatesFilter<"Roles"> | string
    role_name?: StringWithAggregatesFilter<"Roles"> | string
    description?: StringNullableWithAggregatesFilter<"Roles"> | string | null
  }

  export type UsersWhereInput = {
    AND?: UsersWhereInput | UsersWhereInput[]
    OR?: UsersWhereInput[]
    NOT?: UsersWhereInput | UsersWhereInput[]
    user_id?: StringFilter<"Users"> | string
    username?: StringFilter<"Users"> | string
    email?: StringFilter<"Users"> | string
    password?: StringFilter<"Users"> | string
    created_at?: DateTimeFilter<"Users"> | Date | string
    last_login?: DateTimeNullableFilter<"Users"> | Date | string | null
    sessions?: SessionsListRelationFilter
    roles?: RolesListRelationFilter
  }

  export type UsersOrderByWithRelationInput = {
    user_id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    last_login?: SortOrderInput | SortOrder
    sessions?: SessionsOrderByRelationAggregateInput
    roles?: RolesOrderByRelationAggregateInput
  }

  export type UsersWhereUniqueInput = Prisma.AtLeast<{
    user_id?: string
    username?: string
    email?: string
    AND?: UsersWhereInput | UsersWhereInput[]
    OR?: UsersWhereInput[]
    NOT?: UsersWhereInput | UsersWhereInput[]
    password?: StringFilter<"Users"> | string
    created_at?: DateTimeFilter<"Users"> | Date | string
    last_login?: DateTimeNullableFilter<"Users"> | Date | string | null
    sessions?: SessionsListRelationFilter
    roles?: RolesListRelationFilter
  }, "user_id" | "username" | "email">

  export type UsersOrderByWithAggregationInput = {
    user_id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    last_login?: SortOrderInput | SortOrder
    _count?: UsersCountOrderByAggregateInput
    _max?: UsersMaxOrderByAggregateInput
    _min?: UsersMinOrderByAggregateInput
  }

  export type UsersScalarWhereWithAggregatesInput = {
    AND?: UsersScalarWhereWithAggregatesInput | UsersScalarWhereWithAggregatesInput[]
    OR?: UsersScalarWhereWithAggregatesInput[]
    NOT?: UsersScalarWhereWithAggregatesInput | UsersScalarWhereWithAggregatesInput[]
    user_id?: StringWithAggregatesFilter<"Users"> | string
    username?: StringWithAggregatesFilter<"Users"> | string
    email?: StringWithAggregatesFilter<"Users"> | string
    password?: StringWithAggregatesFilter<"Users"> | string
    created_at?: DateTimeWithAggregatesFilter<"Users"> | Date | string
    last_login?: DateTimeNullableWithAggregatesFilter<"Users"> | Date | string | null
  }

  export type SessionsWhereInput = {
    AND?: SessionsWhereInput | SessionsWhereInput[]
    OR?: SessionsWhereInput[]
    NOT?: SessionsWhereInput | SessionsWhereInput[]
    session_id?: StringFilter<"Sessions"> | string
    created_at?: DateTimeFilter<"Sessions"> | Date | string
    last_accessed?: DateTimeFilter<"Sessions"> | Date | string
    session_key?: StringNullableFilter<"Sessions"> | string | null
    user_id?: StringFilter<"Sessions"> | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }

  export type SessionsOrderByWithRelationInput = {
    session_id?: SortOrder
    created_at?: SortOrder
    last_accessed?: SortOrder
    session_key?: SortOrderInput | SortOrder
    user_id?: SortOrder
    user?: UsersOrderByWithRelationInput
  }

  export type SessionsWhereUniqueInput = Prisma.AtLeast<{
    session_id?: string
    AND?: SessionsWhereInput | SessionsWhereInput[]
    OR?: SessionsWhereInput[]
    NOT?: SessionsWhereInput | SessionsWhereInput[]
    created_at?: DateTimeFilter<"Sessions"> | Date | string
    last_accessed?: DateTimeFilter<"Sessions"> | Date | string
    session_key?: StringNullableFilter<"Sessions"> | string | null
    user_id?: StringFilter<"Sessions"> | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }, "session_id">

  export type SessionsOrderByWithAggregationInput = {
    session_id?: SortOrder
    created_at?: SortOrder
    last_accessed?: SortOrder
    session_key?: SortOrderInput | SortOrder
    user_id?: SortOrder
    _count?: SessionsCountOrderByAggregateInput
    _max?: SessionsMaxOrderByAggregateInput
    _min?: SessionsMinOrderByAggregateInput
  }

  export type SessionsScalarWhereWithAggregatesInput = {
    AND?: SessionsScalarWhereWithAggregatesInput | SessionsScalarWhereWithAggregatesInput[]
    OR?: SessionsScalarWhereWithAggregatesInput[]
    NOT?: SessionsScalarWhereWithAggregatesInput | SessionsScalarWhereWithAggregatesInput[]
    session_id?: StringWithAggregatesFilter<"Sessions"> | string
    created_at?: DateTimeWithAggregatesFilter<"Sessions"> | Date | string
    last_accessed?: DateTimeWithAggregatesFilter<"Sessions"> | Date | string
    session_key?: StringNullableWithAggregatesFilter<"Sessions"> | string | null
    user_id?: StringWithAggregatesFilter<"Sessions"> | string
  }

  export type SettingsCreateInput = {
    key: string
    value: string
  }

  export type SettingsUncheckedCreateInput = {
    key: string
    value: string
  }

  export type SettingsUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type SettingsUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type SettingsCreateManyInput = {
    key: string
    value: string
  }

  export type SettingsUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type SettingsUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type RecipesCreateInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
    recipe_bags?: Recipe_bagsCreateNestedManyWithoutRecipeInput
    acl?: RecipeAclCreateNestedManyWithoutRecipeInput
  }

  export type RecipesUncheckedCreateInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
    recipe_bags?: Recipe_bagsUncheckedCreateNestedManyWithoutRecipeInput
    acl?: RecipeAclUncheckedCreateNestedManyWithoutRecipeInput
  }

  export type RecipesUpdateInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
    recipe_bags?: Recipe_bagsUpdateManyWithoutRecipeNestedInput
    acl?: RecipeAclUpdateManyWithoutRecipeNestedInput
  }

  export type RecipesUncheckedUpdateInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
    recipe_bags?: Recipe_bagsUncheckedUpdateManyWithoutRecipeNestedInput
    acl?: RecipeAclUncheckedUpdateManyWithoutRecipeNestedInput
  }

  export type RecipesCreateManyInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
  }

  export type RecipesUpdateManyMutationInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
  }

  export type RecipesUncheckedUpdateManyInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
  }

  export type RecipeAclCreateInput = {
    role_id: string
    permission: $Enums.Permission
    recipe: RecipesCreateNestedOneWithoutAclInput
  }

  export type RecipeAclUncheckedCreateInput = {
    acl_id?: number
    role_id: string
    permission: $Enums.Permission
    recipe_id: string
  }

  export type RecipeAclUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    recipe?: RecipesUpdateOneRequiredWithoutAclNestedInput
  }

  export type RecipeAclUncheckedUpdateInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    recipe_id?: StringFieldUpdateOperationsInput | string
  }

  export type RecipeAclCreateManyInput = {
    acl_id?: number
    role_id: string
    permission: $Enums.Permission
    recipe_id: string
  }

  export type RecipeAclUpdateManyMutationInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type RecipeAclUncheckedUpdateManyInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    recipe_id?: StringFieldUpdateOperationsInput | string
  }

  export type Recipe_bagsCreateInput = {
    position: number
    with_acl?: boolean
    load_modules?: boolean
    bag: BagsCreateNestedOneWithoutRecipe_bagsInput
    recipe: RecipesCreateNestedOneWithoutRecipe_bagsInput
  }

  export type Recipe_bagsUncheckedCreateInput = {
    recipe_id: string
    bag_id: string
    position: number
    with_acl?: boolean
    load_modules?: boolean
  }

  export type Recipe_bagsUpdateInput = {
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
    bag?: BagsUpdateOneRequiredWithoutRecipe_bagsNestedInput
    recipe?: RecipesUpdateOneRequiredWithoutRecipe_bagsNestedInput
  }

  export type Recipe_bagsUncheckedUpdateInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    bag_id?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type Recipe_bagsCreateManyInput = {
    recipe_id: string
    bag_id: string
    position: number
    with_acl?: boolean
    load_modules?: boolean
  }

  export type Recipe_bagsUpdateManyMutationInput = {
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type Recipe_bagsUncheckedUpdateManyInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    bag_id?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type BagsCreateInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    recipe_bags?: Recipe_bagsCreateNestedManyWithoutBagInput
    tiddlers?: TiddlersCreateNestedManyWithoutBagInput
    acl?: BagAclCreateNestedManyWithoutBagInput
  }

  export type BagsUncheckedCreateInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    recipe_bags?: Recipe_bagsUncheckedCreateNestedManyWithoutBagInput
    tiddlers?: TiddlersUncheckedCreateNestedManyWithoutBagInput
    acl?: BagAclUncheckedCreateNestedManyWithoutBagInput
  }

  export type BagsUpdateInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    recipe_bags?: Recipe_bagsUpdateManyWithoutBagNestedInput
    tiddlers?: TiddlersUpdateManyWithoutBagNestedInput
    acl?: BagAclUpdateManyWithoutBagNestedInput
  }

  export type BagsUncheckedUpdateInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    recipe_bags?: Recipe_bagsUncheckedUpdateManyWithoutBagNestedInput
    tiddlers?: TiddlersUncheckedUpdateManyWithoutBagNestedInput
    acl?: BagAclUncheckedUpdateManyWithoutBagNestedInput
  }

  export type BagsCreateManyInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
  }

  export type BagsUpdateManyMutationInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BagsUncheckedUpdateManyInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BagAclCreateInput = {
    role_id: string
    permission: $Enums.Permission
    bag: BagsCreateNestedOneWithoutAclInput
  }

  export type BagAclUncheckedCreateInput = {
    acl_id?: number
    bag_id: string
    role_id: string
    permission: $Enums.Permission
  }

  export type BagAclUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
    bag?: BagsUpdateOneRequiredWithoutAclNestedInput
  }

  export type BagAclUncheckedUpdateInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    bag_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type BagAclCreateManyInput = {
    acl_id?: number
    bag_id: string
    role_id: string
    permission: $Enums.Permission
  }

  export type BagAclUpdateManyMutationInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type BagAclUncheckedUpdateManyInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    bag_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type TiddlersCreateInput = {
    revision_id?: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
    fields?: FieldsCreateNestedManyWithoutTiddlerInput
    bag: BagsCreateNestedOneWithoutTiddlersInput
  }

  export type TiddlersUncheckedCreateInput = {
    revision_id?: string
    bag_id: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
    fields?: FieldsUncheckedCreateNestedManyWithoutTiddlerInput
  }

  export type TiddlersUpdateInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
    fields?: FieldsUpdateManyWithoutTiddlerNestedInput
    bag?: BagsUpdateOneRequiredWithoutTiddlersNestedInput
  }

  export type TiddlersUncheckedUpdateInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    bag_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
    fields?: FieldsUncheckedUpdateManyWithoutTiddlerNestedInput
  }

  export type TiddlersCreateManyInput = {
    revision_id?: string
    bag_id: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
  }

  export type TiddlersUpdateManyMutationInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TiddlersUncheckedUpdateManyInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    bag_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FieldsCreateInput = {
    field_name: string
    field_value: string
    tiddler: TiddlersCreateNestedOneWithoutFieldsInput
  }

  export type FieldsUncheckedCreateInput = {
    revision_id: string
    field_name: string
    field_value: string
  }

  export type FieldsUpdateInput = {
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
    tiddler?: TiddlersUpdateOneRequiredWithoutFieldsNestedInput
  }

  export type FieldsUncheckedUpdateInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
  }

  export type FieldsCreateManyInput = {
    revision_id: string
    field_name: string
    field_value: string
  }

  export type FieldsUpdateManyMutationInput = {
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
  }

  export type FieldsUncheckedUpdateManyInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
  }

  export type RolesCreateInput = {
    role_id?: string
    role_name: string
    description?: string | null
    users?: UsersCreateNestedManyWithoutRolesInput
  }

  export type RolesUncheckedCreateInput = {
    role_id?: string
    role_name: string
    description?: string | null
    users?: UsersUncheckedCreateNestedManyWithoutRolesInput
  }

  export type RolesUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UsersUpdateManyWithoutRolesNestedInput
  }

  export type RolesUncheckedUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    users?: UsersUncheckedUpdateManyWithoutRolesNestedInput
  }

  export type RolesCreateManyInput = {
    role_id?: string
    role_name: string
    description?: string | null
  }

  export type RolesUpdateManyMutationInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RolesUncheckedUpdateManyInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsersCreateInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
    sessions?: SessionsCreateNestedManyWithoutUserInput
    roles?: RolesCreateNestedManyWithoutUsersInput
  }

  export type UsersUncheckedCreateInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
    sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
    roles?: RolesUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UsersUpdateInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionsUpdateManyWithoutUserNestedInput
    roles?: RolesUpdateManyWithoutUsersNestedInput
  }

  export type UsersUncheckedUpdateInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
    roles?: RolesUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type UsersCreateManyInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
  }

  export type UsersUpdateManyMutationInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsersUncheckedUpdateManyInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SessionsCreateInput = {
    session_id: string
    created_at?: Date | string
    last_accessed: Date | string
    session_key?: string | null
    user: UsersCreateNestedOneWithoutSessionsInput
  }

  export type SessionsUncheckedCreateInput = {
    session_id: string
    created_at?: Date | string
    last_accessed: Date | string
    session_key?: string | null
    user_id: string
  }

  export type SessionsUpdateInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UsersUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionsUncheckedUpdateInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
  }

  export type SessionsCreateManyInput = {
    session_id: string
    created_at?: Date | string
    last_accessed: Date | string
    session_key?: string | null
    user_id: string
  }

  export type SessionsUpdateManyMutationInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionsUncheckedUpdateManyInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type SettingsCountOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
  }

  export type SettingsMaxOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
  }

  export type SettingsMinOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type Recipe_bagsListRelationFilter = {
    every?: Recipe_bagsWhereInput
    some?: Recipe_bagsWhereInput
    none?: Recipe_bagsWhereInput
  }

  export type RecipeAclListRelationFilter = {
    every?: RecipeAclWhereInput
    some?: RecipeAclWhereInput
    none?: RecipeAclWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type Recipe_bagsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RecipeAclOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RecipesCountOrderByAggregateInput = {
    recipe_id?: SortOrder
    recipe_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrder
    plugin_names?: SortOrder
    skip_required_plugins?: SortOrder
    skip_core?: SortOrder
  }

  export type RecipesMaxOrderByAggregateInput = {
    recipe_id?: SortOrder
    recipe_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrder
    skip_required_plugins?: SortOrder
    skip_core?: SortOrder
  }

  export type RecipesMinOrderByAggregateInput = {
    recipe_id?: SortOrder
    recipe_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrder
    skip_required_plugins?: SortOrder
    skip_core?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumPermissionFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[]
    notIn?: $Enums.Permission[]
    not?: NestedEnumPermissionFilter<$PrismaModel> | $Enums.Permission
  }

  export type RecipesScalarRelationFilter = {
    is?: RecipesWhereInput
    isNot?: RecipesWhereInput
  }

  export type RecipeAclCountOrderByAggregateInput = {
    acl_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    recipe_id?: SortOrder
  }

  export type RecipeAclAvgOrderByAggregateInput = {
    acl_id?: SortOrder
  }

  export type RecipeAclMaxOrderByAggregateInput = {
    acl_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    recipe_id?: SortOrder
  }

  export type RecipeAclMinOrderByAggregateInput = {
    acl_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
    recipe_id?: SortOrder
  }

  export type RecipeAclSumOrderByAggregateInput = {
    acl_id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumPermissionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[]
    notIn?: $Enums.Permission[]
    not?: NestedEnumPermissionWithAggregatesFilter<$PrismaModel> | $Enums.Permission
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPermissionFilter<$PrismaModel>
    _max?: NestedEnumPermissionFilter<$PrismaModel>
  }

  export type BagsScalarRelationFilter = {
    is?: BagsWhereInput
    isNot?: BagsWhereInput
  }

  export type Recipe_bagsRecipe_idBag_idCompoundUniqueInput = {
    recipe_id: string
    bag_id: string
  }

  export type Recipe_bagsCountOrderByAggregateInput = {
    recipe_id?: SortOrder
    bag_id?: SortOrder
    position?: SortOrder
    with_acl?: SortOrder
    load_modules?: SortOrder
  }

  export type Recipe_bagsAvgOrderByAggregateInput = {
    position?: SortOrder
  }

  export type Recipe_bagsMaxOrderByAggregateInput = {
    recipe_id?: SortOrder
    bag_id?: SortOrder
    position?: SortOrder
    with_acl?: SortOrder
    load_modules?: SortOrder
  }

  export type Recipe_bagsMinOrderByAggregateInput = {
    recipe_id?: SortOrder
    bag_id?: SortOrder
    position?: SortOrder
    with_acl?: SortOrder
    load_modules?: SortOrder
  }

  export type Recipe_bagsSumOrderByAggregateInput = {
    position?: SortOrder
  }

  export type TiddlersListRelationFilter = {
    every?: TiddlersWhereInput
    some?: TiddlersWhereInput
    none?: TiddlersWhereInput
  }

  export type BagAclListRelationFilter = {
    every?: BagAclWhereInput
    some?: BagAclWhereInput
    none?: BagAclWhereInput
  }

  export type TiddlersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BagAclOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BagsCountOrderByAggregateInput = {
    bag_id?: SortOrder
    bag_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrder
  }

  export type BagsMaxOrderByAggregateInput = {
    bag_id?: SortOrder
    bag_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrder
  }

  export type BagsMinOrderByAggregateInput = {
    bag_id?: SortOrder
    bag_name?: SortOrder
    description?: SortOrder
    owner_id?: SortOrder
  }

  export type BagAclCountOrderByAggregateInput = {
    acl_id?: SortOrder
    bag_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
  }

  export type BagAclAvgOrderByAggregateInput = {
    acl_id?: SortOrder
  }

  export type BagAclMaxOrderByAggregateInput = {
    acl_id?: SortOrder
    bag_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
  }

  export type BagAclMinOrderByAggregateInput = {
    acl_id?: SortOrder
    bag_id?: SortOrder
    role_id?: SortOrder
    permission?: SortOrder
  }

  export type BagAclSumOrderByAggregateInput = {
    acl_id?: SortOrder
  }

  export type FieldsListRelationFilter = {
    every?: FieldsWhereInput
    some?: FieldsWhereInput
    none?: FieldsWhereInput
  }

  export type FieldsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TiddlersBag_idTitleCompoundUniqueInput = {
    bag_id: string
    title: string
  }

  export type TiddlersCountOrderByAggregateInput = {
    revision_id?: SortOrder
    bag_id?: SortOrder
    title?: SortOrder
    is_deleted?: SortOrder
    attachment_hash?: SortOrder
  }

  export type TiddlersMaxOrderByAggregateInput = {
    revision_id?: SortOrder
    bag_id?: SortOrder
    title?: SortOrder
    is_deleted?: SortOrder
    attachment_hash?: SortOrder
  }

  export type TiddlersMinOrderByAggregateInput = {
    revision_id?: SortOrder
    bag_id?: SortOrder
    title?: SortOrder
    is_deleted?: SortOrder
    attachment_hash?: SortOrder
  }

  export type TiddlersScalarRelationFilter = {
    is?: TiddlersWhereInput
    isNot?: TiddlersWhereInput
  }

  export type FieldsRevision_idField_nameCompoundUniqueInput = {
    revision_id: string
    field_name: string
  }

  export type FieldsCountOrderByAggregateInput = {
    revision_id?: SortOrder
    field_name?: SortOrder
    field_value?: SortOrder
  }

  export type FieldsMaxOrderByAggregateInput = {
    revision_id?: SortOrder
    field_name?: SortOrder
    field_value?: SortOrder
  }

  export type FieldsMinOrderByAggregateInput = {
    revision_id?: SortOrder
    field_name?: SortOrder
    field_value?: SortOrder
  }

  export type UsersListRelationFilter = {
    every?: UsersWhereInput
    some?: UsersWhereInput
    none?: UsersWhereInput
  }

  export type UsersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RolesCountOrderByAggregateInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    description?: SortOrder
  }

  export type RolesMaxOrderByAggregateInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    description?: SortOrder
  }

  export type RolesMinOrderByAggregateInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    description?: SortOrder
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SessionsListRelationFilter = {
    every?: SessionsWhereInput
    some?: SessionsWhereInput
    none?: SessionsWhereInput
  }

  export type RolesListRelationFilter = {
    every?: RolesWhereInput
    some?: RolesWhereInput
    none?: RolesWhereInput
  }

  export type SessionsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RolesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsersCountOrderByAggregateInput = {
    user_id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    last_login?: SortOrder
  }

  export type UsersMaxOrderByAggregateInput = {
    user_id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    last_login?: SortOrder
  }

  export type UsersMinOrderByAggregateInput = {
    user_id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    password?: SortOrder
    created_at?: SortOrder
    last_login?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UsersScalarRelationFilter = {
    is?: UsersWhereInput
    isNot?: UsersWhereInput
  }

  export type SessionsCountOrderByAggregateInput = {
    session_id?: SortOrder
    created_at?: SortOrder
    last_accessed?: SortOrder
    session_key?: SortOrder
    user_id?: SortOrder
  }

  export type SessionsMaxOrderByAggregateInput = {
    session_id?: SortOrder
    created_at?: SortOrder
    last_accessed?: SortOrder
    session_key?: SortOrder
    user_id?: SortOrder
  }

  export type SessionsMinOrderByAggregateInput = {
    session_id?: SortOrder
    created_at?: SortOrder
    last_accessed?: SortOrder
    session_key?: SortOrder
    user_id?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type Recipe_bagsCreateNestedManyWithoutRecipeInput = {
    create?: XOR<Recipe_bagsCreateWithoutRecipeInput, Recipe_bagsUncheckedCreateWithoutRecipeInput> | Recipe_bagsCreateWithoutRecipeInput[] | Recipe_bagsUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutRecipeInput | Recipe_bagsCreateOrConnectWithoutRecipeInput[]
    createMany?: Recipe_bagsCreateManyRecipeInputEnvelope
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
  }

  export type RecipeAclCreateNestedManyWithoutRecipeInput = {
    create?: XOR<RecipeAclCreateWithoutRecipeInput, RecipeAclUncheckedCreateWithoutRecipeInput> | RecipeAclCreateWithoutRecipeInput[] | RecipeAclUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: RecipeAclCreateOrConnectWithoutRecipeInput | RecipeAclCreateOrConnectWithoutRecipeInput[]
    createMany?: RecipeAclCreateManyRecipeInputEnvelope
    connect?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
  }

  export type Recipe_bagsUncheckedCreateNestedManyWithoutRecipeInput = {
    create?: XOR<Recipe_bagsCreateWithoutRecipeInput, Recipe_bagsUncheckedCreateWithoutRecipeInput> | Recipe_bagsCreateWithoutRecipeInput[] | Recipe_bagsUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutRecipeInput | Recipe_bagsCreateOrConnectWithoutRecipeInput[]
    createMany?: Recipe_bagsCreateManyRecipeInputEnvelope
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
  }

  export type RecipeAclUncheckedCreateNestedManyWithoutRecipeInput = {
    create?: XOR<RecipeAclCreateWithoutRecipeInput, RecipeAclUncheckedCreateWithoutRecipeInput> | RecipeAclCreateWithoutRecipeInput[] | RecipeAclUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: RecipeAclCreateOrConnectWithoutRecipeInput | RecipeAclCreateOrConnectWithoutRecipeInput[]
    createMany?: RecipeAclCreateManyRecipeInputEnvelope
    connect?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type Recipe_bagsUpdateManyWithoutRecipeNestedInput = {
    create?: XOR<Recipe_bagsCreateWithoutRecipeInput, Recipe_bagsUncheckedCreateWithoutRecipeInput> | Recipe_bagsCreateWithoutRecipeInput[] | Recipe_bagsUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutRecipeInput | Recipe_bagsCreateOrConnectWithoutRecipeInput[]
    upsert?: Recipe_bagsUpsertWithWhereUniqueWithoutRecipeInput | Recipe_bagsUpsertWithWhereUniqueWithoutRecipeInput[]
    createMany?: Recipe_bagsCreateManyRecipeInputEnvelope
    set?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    disconnect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    delete?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    update?: Recipe_bagsUpdateWithWhereUniqueWithoutRecipeInput | Recipe_bagsUpdateWithWhereUniqueWithoutRecipeInput[]
    updateMany?: Recipe_bagsUpdateManyWithWhereWithoutRecipeInput | Recipe_bagsUpdateManyWithWhereWithoutRecipeInput[]
    deleteMany?: Recipe_bagsScalarWhereInput | Recipe_bagsScalarWhereInput[]
  }

  export type RecipeAclUpdateManyWithoutRecipeNestedInput = {
    create?: XOR<RecipeAclCreateWithoutRecipeInput, RecipeAclUncheckedCreateWithoutRecipeInput> | RecipeAclCreateWithoutRecipeInput[] | RecipeAclUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: RecipeAclCreateOrConnectWithoutRecipeInput | RecipeAclCreateOrConnectWithoutRecipeInput[]
    upsert?: RecipeAclUpsertWithWhereUniqueWithoutRecipeInput | RecipeAclUpsertWithWhereUniqueWithoutRecipeInput[]
    createMany?: RecipeAclCreateManyRecipeInputEnvelope
    set?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    disconnect?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    delete?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    connect?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    update?: RecipeAclUpdateWithWhereUniqueWithoutRecipeInput | RecipeAclUpdateWithWhereUniqueWithoutRecipeInput[]
    updateMany?: RecipeAclUpdateManyWithWhereWithoutRecipeInput | RecipeAclUpdateManyWithWhereWithoutRecipeInput[]
    deleteMany?: RecipeAclScalarWhereInput | RecipeAclScalarWhereInput[]
  }

  export type Recipe_bagsUncheckedUpdateManyWithoutRecipeNestedInput = {
    create?: XOR<Recipe_bagsCreateWithoutRecipeInput, Recipe_bagsUncheckedCreateWithoutRecipeInput> | Recipe_bagsCreateWithoutRecipeInput[] | Recipe_bagsUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutRecipeInput | Recipe_bagsCreateOrConnectWithoutRecipeInput[]
    upsert?: Recipe_bagsUpsertWithWhereUniqueWithoutRecipeInput | Recipe_bagsUpsertWithWhereUniqueWithoutRecipeInput[]
    createMany?: Recipe_bagsCreateManyRecipeInputEnvelope
    set?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    disconnect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    delete?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    update?: Recipe_bagsUpdateWithWhereUniqueWithoutRecipeInput | Recipe_bagsUpdateWithWhereUniqueWithoutRecipeInput[]
    updateMany?: Recipe_bagsUpdateManyWithWhereWithoutRecipeInput | Recipe_bagsUpdateManyWithWhereWithoutRecipeInput[]
    deleteMany?: Recipe_bagsScalarWhereInput | Recipe_bagsScalarWhereInput[]
  }

  export type RecipeAclUncheckedUpdateManyWithoutRecipeNestedInput = {
    create?: XOR<RecipeAclCreateWithoutRecipeInput, RecipeAclUncheckedCreateWithoutRecipeInput> | RecipeAclCreateWithoutRecipeInput[] | RecipeAclUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: RecipeAclCreateOrConnectWithoutRecipeInput | RecipeAclCreateOrConnectWithoutRecipeInput[]
    upsert?: RecipeAclUpsertWithWhereUniqueWithoutRecipeInput | RecipeAclUpsertWithWhereUniqueWithoutRecipeInput[]
    createMany?: RecipeAclCreateManyRecipeInputEnvelope
    set?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    disconnect?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    delete?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    connect?: RecipeAclWhereUniqueInput | RecipeAclWhereUniqueInput[]
    update?: RecipeAclUpdateWithWhereUniqueWithoutRecipeInput | RecipeAclUpdateWithWhereUniqueWithoutRecipeInput[]
    updateMany?: RecipeAclUpdateManyWithWhereWithoutRecipeInput | RecipeAclUpdateManyWithWhereWithoutRecipeInput[]
    deleteMany?: RecipeAclScalarWhereInput | RecipeAclScalarWhereInput[]
  }

  export type RecipesCreateNestedOneWithoutAclInput = {
    create?: XOR<RecipesCreateWithoutAclInput, RecipesUncheckedCreateWithoutAclInput>
    connectOrCreate?: RecipesCreateOrConnectWithoutAclInput
    connect?: RecipesWhereUniqueInput
  }

  export type EnumPermissionFieldUpdateOperationsInput = {
    set?: $Enums.Permission
  }

  export type RecipesUpdateOneRequiredWithoutAclNestedInput = {
    create?: XOR<RecipesCreateWithoutAclInput, RecipesUncheckedCreateWithoutAclInput>
    connectOrCreate?: RecipesCreateOrConnectWithoutAclInput
    upsert?: RecipesUpsertWithoutAclInput
    connect?: RecipesWhereUniqueInput
    update?: XOR<XOR<RecipesUpdateToOneWithWhereWithoutAclInput, RecipesUpdateWithoutAclInput>, RecipesUncheckedUpdateWithoutAclInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BagsCreateNestedOneWithoutRecipe_bagsInput = {
    create?: XOR<BagsCreateWithoutRecipe_bagsInput, BagsUncheckedCreateWithoutRecipe_bagsInput>
    connectOrCreate?: BagsCreateOrConnectWithoutRecipe_bagsInput
    connect?: BagsWhereUniqueInput
  }

  export type RecipesCreateNestedOneWithoutRecipe_bagsInput = {
    create?: XOR<RecipesCreateWithoutRecipe_bagsInput, RecipesUncheckedCreateWithoutRecipe_bagsInput>
    connectOrCreate?: RecipesCreateOrConnectWithoutRecipe_bagsInput
    connect?: RecipesWhereUniqueInput
  }

  export type BagsUpdateOneRequiredWithoutRecipe_bagsNestedInput = {
    create?: XOR<BagsCreateWithoutRecipe_bagsInput, BagsUncheckedCreateWithoutRecipe_bagsInput>
    connectOrCreate?: BagsCreateOrConnectWithoutRecipe_bagsInput
    upsert?: BagsUpsertWithoutRecipe_bagsInput
    connect?: BagsWhereUniqueInput
    update?: XOR<XOR<BagsUpdateToOneWithWhereWithoutRecipe_bagsInput, BagsUpdateWithoutRecipe_bagsInput>, BagsUncheckedUpdateWithoutRecipe_bagsInput>
  }

  export type RecipesUpdateOneRequiredWithoutRecipe_bagsNestedInput = {
    create?: XOR<RecipesCreateWithoutRecipe_bagsInput, RecipesUncheckedCreateWithoutRecipe_bagsInput>
    connectOrCreate?: RecipesCreateOrConnectWithoutRecipe_bagsInput
    upsert?: RecipesUpsertWithoutRecipe_bagsInput
    connect?: RecipesWhereUniqueInput
    update?: XOR<XOR<RecipesUpdateToOneWithWhereWithoutRecipe_bagsInput, RecipesUpdateWithoutRecipe_bagsInput>, RecipesUncheckedUpdateWithoutRecipe_bagsInput>
  }

  export type Recipe_bagsCreateNestedManyWithoutBagInput = {
    create?: XOR<Recipe_bagsCreateWithoutBagInput, Recipe_bagsUncheckedCreateWithoutBagInput> | Recipe_bagsCreateWithoutBagInput[] | Recipe_bagsUncheckedCreateWithoutBagInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutBagInput | Recipe_bagsCreateOrConnectWithoutBagInput[]
    createMany?: Recipe_bagsCreateManyBagInputEnvelope
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
  }

  export type TiddlersCreateNestedManyWithoutBagInput = {
    create?: XOR<TiddlersCreateWithoutBagInput, TiddlersUncheckedCreateWithoutBagInput> | TiddlersCreateWithoutBagInput[] | TiddlersUncheckedCreateWithoutBagInput[]
    connectOrCreate?: TiddlersCreateOrConnectWithoutBagInput | TiddlersCreateOrConnectWithoutBagInput[]
    createMany?: TiddlersCreateManyBagInputEnvelope
    connect?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
  }

  export type BagAclCreateNestedManyWithoutBagInput = {
    create?: XOR<BagAclCreateWithoutBagInput, BagAclUncheckedCreateWithoutBagInput> | BagAclCreateWithoutBagInput[] | BagAclUncheckedCreateWithoutBagInput[]
    connectOrCreate?: BagAclCreateOrConnectWithoutBagInput | BagAclCreateOrConnectWithoutBagInput[]
    createMany?: BagAclCreateManyBagInputEnvelope
    connect?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
  }

  export type Recipe_bagsUncheckedCreateNestedManyWithoutBagInput = {
    create?: XOR<Recipe_bagsCreateWithoutBagInput, Recipe_bagsUncheckedCreateWithoutBagInput> | Recipe_bagsCreateWithoutBagInput[] | Recipe_bagsUncheckedCreateWithoutBagInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutBagInput | Recipe_bagsCreateOrConnectWithoutBagInput[]
    createMany?: Recipe_bagsCreateManyBagInputEnvelope
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
  }

  export type TiddlersUncheckedCreateNestedManyWithoutBagInput = {
    create?: XOR<TiddlersCreateWithoutBagInput, TiddlersUncheckedCreateWithoutBagInput> | TiddlersCreateWithoutBagInput[] | TiddlersUncheckedCreateWithoutBagInput[]
    connectOrCreate?: TiddlersCreateOrConnectWithoutBagInput | TiddlersCreateOrConnectWithoutBagInput[]
    createMany?: TiddlersCreateManyBagInputEnvelope
    connect?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
  }

  export type BagAclUncheckedCreateNestedManyWithoutBagInput = {
    create?: XOR<BagAclCreateWithoutBagInput, BagAclUncheckedCreateWithoutBagInput> | BagAclCreateWithoutBagInput[] | BagAclUncheckedCreateWithoutBagInput[]
    connectOrCreate?: BagAclCreateOrConnectWithoutBagInput | BagAclCreateOrConnectWithoutBagInput[]
    createMany?: BagAclCreateManyBagInputEnvelope
    connect?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
  }

  export type Recipe_bagsUpdateManyWithoutBagNestedInput = {
    create?: XOR<Recipe_bagsCreateWithoutBagInput, Recipe_bagsUncheckedCreateWithoutBagInput> | Recipe_bagsCreateWithoutBagInput[] | Recipe_bagsUncheckedCreateWithoutBagInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutBagInput | Recipe_bagsCreateOrConnectWithoutBagInput[]
    upsert?: Recipe_bagsUpsertWithWhereUniqueWithoutBagInput | Recipe_bagsUpsertWithWhereUniqueWithoutBagInput[]
    createMany?: Recipe_bagsCreateManyBagInputEnvelope
    set?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    disconnect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    delete?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    update?: Recipe_bagsUpdateWithWhereUniqueWithoutBagInput | Recipe_bagsUpdateWithWhereUniqueWithoutBagInput[]
    updateMany?: Recipe_bagsUpdateManyWithWhereWithoutBagInput | Recipe_bagsUpdateManyWithWhereWithoutBagInput[]
    deleteMany?: Recipe_bagsScalarWhereInput | Recipe_bagsScalarWhereInput[]
  }

  export type TiddlersUpdateManyWithoutBagNestedInput = {
    create?: XOR<TiddlersCreateWithoutBagInput, TiddlersUncheckedCreateWithoutBagInput> | TiddlersCreateWithoutBagInput[] | TiddlersUncheckedCreateWithoutBagInput[]
    connectOrCreate?: TiddlersCreateOrConnectWithoutBagInput | TiddlersCreateOrConnectWithoutBagInput[]
    upsert?: TiddlersUpsertWithWhereUniqueWithoutBagInput | TiddlersUpsertWithWhereUniqueWithoutBagInput[]
    createMany?: TiddlersCreateManyBagInputEnvelope
    set?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    disconnect?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    delete?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    connect?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    update?: TiddlersUpdateWithWhereUniqueWithoutBagInput | TiddlersUpdateWithWhereUniqueWithoutBagInput[]
    updateMany?: TiddlersUpdateManyWithWhereWithoutBagInput | TiddlersUpdateManyWithWhereWithoutBagInput[]
    deleteMany?: TiddlersScalarWhereInput | TiddlersScalarWhereInput[]
  }

  export type BagAclUpdateManyWithoutBagNestedInput = {
    create?: XOR<BagAclCreateWithoutBagInput, BagAclUncheckedCreateWithoutBagInput> | BagAclCreateWithoutBagInput[] | BagAclUncheckedCreateWithoutBagInput[]
    connectOrCreate?: BagAclCreateOrConnectWithoutBagInput | BagAclCreateOrConnectWithoutBagInput[]
    upsert?: BagAclUpsertWithWhereUniqueWithoutBagInput | BagAclUpsertWithWhereUniqueWithoutBagInput[]
    createMany?: BagAclCreateManyBagInputEnvelope
    set?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    disconnect?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    delete?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    connect?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    update?: BagAclUpdateWithWhereUniqueWithoutBagInput | BagAclUpdateWithWhereUniqueWithoutBagInput[]
    updateMany?: BagAclUpdateManyWithWhereWithoutBagInput | BagAclUpdateManyWithWhereWithoutBagInput[]
    deleteMany?: BagAclScalarWhereInput | BagAclScalarWhereInput[]
  }

  export type Recipe_bagsUncheckedUpdateManyWithoutBagNestedInput = {
    create?: XOR<Recipe_bagsCreateWithoutBagInput, Recipe_bagsUncheckedCreateWithoutBagInput> | Recipe_bagsCreateWithoutBagInput[] | Recipe_bagsUncheckedCreateWithoutBagInput[]
    connectOrCreate?: Recipe_bagsCreateOrConnectWithoutBagInput | Recipe_bagsCreateOrConnectWithoutBagInput[]
    upsert?: Recipe_bagsUpsertWithWhereUniqueWithoutBagInput | Recipe_bagsUpsertWithWhereUniqueWithoutBagInput[]
    createMany?: Recipe_bagsCreateManyBagInputEnvelope
    set?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    disconnect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    delete?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    connect?: Recipe_bagsWhereUniqueInput | Recipe_bagsWhereUniqueInput[]
    update?: Recipe_bagsUpdateWithWhereUniqueWithoutBagInput | Recipe_bagsUpdateWithWhereUniqueWithoutBagInput[]
    updateMany?: Recipe_bagsUpdateManyWithWhereWithoutBagInput | Recipe_bagsUpdateManyWithWhereWithoutBagInput[]
    deleteMany?: Recipe_bagsScalarWhereInput | Recipe_bagsScalarWhereInput[]
  }

  export type TiddlersUncheckedUpdateManyWithoutBagNestedInput = {
    create?: XOR<TiddlersCreateWithoutBagInput, TiddlersUncheckedCreateWithoutBagInput> | TiddlersCreateWithoutBagInput[] | TiddlersUncheckedCreateWithoutBagInput[]
    connectOrCreate?: TiddlersCreateOrConnectWithoutBagInput | TiddlersCreateOrConnectWithoutBagInput[]
    upsert?: TiddlersUpsertWithWhereUniqueWithoutBagInput | TiddlersUpsertWithWhereUniqueWithoutBagInput[]
    createMany?: TiddlersCreateManyBagInputEnvelope
    set?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    disconnect?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    delete?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    connect?: TiddlersWhereUniqueInput | TiddlersWhereUniqueInput[]
    update?: TiddlersUpdateWithWhereUniqueWithoutBagInput | TiddlersUpdateWithWhereUniqueWithoutBagInput[]
    updateMany?: TiddlersUpdateManyWithWhereWithoutBagInput | TiddlersUpdateManyWithWhereWithoutBagInput[]
    deleteMany?: TiddlersScalarWhereInput | TiddlersScalarWhereInput[]
  }

  export type BagAclUncheckedUpdateManyWithoutBagNestedInput = {
    create?: XOR<BagAclCreateWithoutBagInput, BagAclUncheckedCreateWithoutBagInput> | BagAclCreateWithoutBagInput[] | BagAclUncheckedCreateWithoutBagInput[]
    connectOrCreate?: BagAclCreateOrConnectWithoutBagInput | BagAclCreateOrConnectWithoutBagInput[]
    upsert?: BagAclUpsertWithWhereUniqueWithoutBagInput | BagAclUpsertWithWhereUniqueWithoutBagInput[]
    createMany?: BagAclCreateManyBagInputEnvelope
    set?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    disconnect?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    delete?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    connect?: BagAclWhereUniqueInput | BagAclWhereUniqueInput[]
    update?: BagAclUpdateWithWhereUniqueWithoutBagInput | BagAclUpdateWithWhereUniqueWithoutBagInput[]
    updateMany?: BagAclUpdateManyWithWhereWithoutBagInput | BagAclUpdateManyWithWhereWithoutBagInput[]
    deleteMany?: BagAclScalarWhereInput | BagAclScalarWhereInput[]
  }

  export type BagsCreateNestedOneWithoutAclInput = {
    create?: XOR<BagsCreateWithoutAclInput, BagsUncheckedCreateWithoutAclInput>
    connectOrCreate?: BagsCreateOrConnectWithoutAclInput
    connect?: BagsWhereUniqueInput
  }

  export type BagsUpdateOneRequiredWithoutAclNestedInput = {
    create?: XOR<BagsCreateWithoutAclInput, BagsUncheckedCreateWithoutAclInput>
    connectOrCreate?: BagsCreateOrConnectWithoutAclInput
    upsert?: BagsUpsertWithoutAclInput
    connect?: BagsWhereUniqueInput
    update?: XOR<XOR<BagsUpdateToOneWithWhereWithoutAclInput, BagsUpdateWithoutAclInput>, BagsUncheckedUpdateWithoutAclInput>
  }

  export type FieldsCreateNestedManyWithoutTiddlerInput = {
    create?: XOR<FieldsCreateWithoutTiddlerInput, FieldsUncheckedCreateWithoutTiddlerInput> | FieldsCreateWithoutTiddlerInput[] | FieldsUncheckedCreateWithoutTiddlerInput[]
    connectOrCreate?: FieldsCreateOrConnectWithoutTiddlerInput | FieldsCreateOrConnectWithoutTiddlerInput[]
    createMany?: FieldsCreateManyTiddlerInputEnvelope
    connect?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
  }

  export type BagsCreateNestedOneWithoutTiddlersInput = {
    create?: XOR<BagsCreateWithoutTiddlersInput, BagsUncheckedCreateWithoutTiddlersInput>
    connectOrCreate?: BagsCreateOrConnectWithoutTiddlersInput
    connect?: BagsWhereUniqueInput
  }

  export type FieldsUncheckedCreateNestedManyWithoutTiddlerInput = {
    create?: XOR<FieldsCreateWithoutTiddlerInput, FieldsUncheckedCreateWithoutTiddlerInput> | FieldsCreateWithoutTiddlerInput[] | FieldsUncheckedCreateWithoutTiddlerInput[]
    connectOrCreate?: FieldsCreateOrConnectWithoutTiddlerInput | FieldsCreateOrConnectWithoutTiddlerInput[]
    createMany?: FieldsCreateManyTiddlerInputEnvelope
    connect?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
  }

  export type FieldsUpdateManyWithoutTiddlerNestedInput = {
    create?: XOR<FieldsCreateWithoutTiddlerInput, FieldsUncheckedCreateWithoutTiddlerInput> | FieldsCreateWithoutTiddlerInput[] | FieldsUncheckedCreateWithoutTiddlerInput[]
    connectOrCreate?: FieldsCreateOrConnectWithoutTiddlerInput | FieldsCreateOrConnectWithoutTiddlerInput[]
    upsert?: FieldsUpsertWithWhereUniqueWithoutTiddlerInput | FieldsUpsertWithWhereUniqueWithoutTiddlerInput[]
    createMany?: FieldsCreateManyTiddlerInputEnvelope
    set?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    disconnect?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    delete?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    connect?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    update?: FieldsUpdateWithWhereUniqueWithoutTiddlerInput | FieldsUpdateWithWhereUniqueWithoutTiddlerInput[]
    updateMany?: FieldsUpdateManyWithWhereWithoutTiddlerInput | FieldsUpdateManyWithWhereWithoutTiddlerInput[]
    deleteMany?: FieldsScalarWhereInput | FieldsScalarWhereInput[]
  }

  export type BagsUpdateOneRequiredWithoutTiddlersNestedInput = {
    create?: XOR<BagsCreateWithoutTiddlersInput, BagsUncheckedCreateWithoutTiddlersInput>
    connectOrCreate?: BagsCreateOrConnectWithoutTiddlersInput
    upsert?: BagsUpsertWithoutTiddlersInput
    connect?: BagsWhereUniqueInput
    update?: XOR<XOR<BagsUpdateToOneWithWhereWithoutTiddlersInput, BagsUpdateWithoutTiddlersInput>, BagsUncheckedUpdateWithoutTiddlersInput>
  }

  export type FieldsUncheckedUpdateManyWithoutTiddlerNestedInput = {
    create?: XOR<FieldsCreateWithoutTiddlerInput, FieldsUncheckedCreateWithoutTiddlerInput> | FieldsCreateWithoutTiddlerInput[] | FieldsUncheckedCreateWithoutTiddlerInput[]
    connectOrCreate?: FieldsCreateOrConnectWithoutTiddlerInput | FieldsCreateOrConnectWithoutTiddlerInput[]
    upsert?: FieldsUpsertWithWhereUniqueWithoutTiddlerInput | FieldsUpsertWithWhereUniqueWithoutTiddlerInput[]
    createMany?: FieldsCreateManyTiddlerInputEnvelope
    set?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    disconnect?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    delete?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    connect?: FieldsWhereUniqueInput | FieldsWhereUniqueInput[]
    update?: FieldsUpdateWithWhereUniqueWithoutTiddlerInput | FieldsUpdateWithWhereUniqueWithoutTiddlerInput[]
    updateMany?: FieldsUpdateManyWithWhereWithoutTiddlerInput | FieldsUpdateManyWithWhereWithoutTiddlerInput[]
    deleteMany?: FieldsScalarWhereInput | FieldsScalarWhereInput[]
  }

  export type TiddlersCreateNestedOneWithoutFieldsInput = {
    create?: XOR<TiddlersCreateWithoutFieldsInput, TiddlersUncheckedCreateWithoutFieldsInput>
    connectOrCreate?: TiddlersCreateOrConnectWithoutFieldsInput
    connect?: TiddlersWhereUniqueInput
  }

  export type TiddlersUpdateOneRequiredWithoutFieldsNestedInput = {
    create?: XOR<TiddlersCreateWithoutFieldsInput, TiddlersUncheckedCreateWithoutFieldsInput>
    connectOrCreate?: TiddlersCreateOrConnectWithoutFieldsInput
    upsert?: TiddlersUpsertWithoutFieldsInput
    connect?: TiddlersWhereUniqueInput
    update?: XOR<XOR<TiddlersUpdateToOneWithWhereWithoutFieldsInput, TiddlersUpdateWithoutFieldsInput>, TiddlersUncheckedUpdateWithoutFieldsInput>
  }

  export type UsersCreateNestedManyWithoutRolesInput = {
    create?: XOR<UsersCreateWithoutRolesInput, UsersUncheckedCreateWithoutRolesInput> | UsersCreateWithoutRolesInput[] | UsersUncheckedCreateWithoutRolesInput[]
    connectOrCreate?: UsersCreateOrConnectWithoutRolesInput | UsersCreateOrConnectWithoutRolesInput[]
    connect?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
  }

  export type UsersUncheckedCreateNestedManyWithoutRolesInput = {
    create?: XOR<UsersCreateWithoutRolesInput, UsersUncheckedCreateWithoutRolesInput> | UsersCreateWithoutRolesInput[] | UsersUncheckedCreateWithoutRolesInput[]
    connectOrCreate?: UsersCreateOrConnectWithoutRolesInput | UsersCreateOrConnectWithoutRolesInput[]
    connect?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
  }

  export type UsersUpdateManyWithoutRolesNestedInput = {
    create?: XOR<UsersCreateWithoutRolesInput, UsersUncheckedCreateWithoutRolesInput> | UsersCreateWithoutRolesInput[] | UsersUncheckedCreateWithoutRolesInput[]
    connectOrCreate?: UsersCreateOrConnectWithoutRolesInput | UsersCreateOrConnectWithoutRolesInput[]
    upsert?: UsersUpsertWithWhereUniqueWithoutRolesInput | UsersUpsertWithWhereUniqueWithoutRolesInput[]
    set?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    disconnect?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    delete?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    connect?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    update?: UsersUpdateWithWhereUniqueWithoutRolesInput | UsersUpdateWithWhereUniqueWithoutRolesInput[]
    updateMany?: UsersUpdateManyWithWhereWithoutRolesInput | UsersUpdateManyWithWhereWithoutRolesInput[]
    deleteMany?: UsersScalarWhereInput | UsersScalarWhereInput[]
  }

  export type UsersUncheckedUpdateManyWithoutRolesNestedInput = {
    create?: XOR<UsersCreateWithoutRolesInput, UsersUncheckedCreateWithoutRolesInput> | UsersCreateWithoutRolesInput[] | UsersUncheckedCreateWithoutRolesInput[]
    connectOrCreate?: UsersCreateOrConnectWithoutRolesInput | UsersCreateOrConnectWithoutRolesInput[]
    upsert?: UsersUpsertWithWhereUniqueWithoutRolesInput | UsersUpsertWithWhereUniqueWithoutRolesInput[]
    set?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    disconnect?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    delete?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    connect?: UsersWhereUniqueInput | UsersWhereUniqueInput[]
    update?: UsersUpdateWithWhereUniqueWithoutRolesInput | UsersUpdateWithWhereUniqueWithoutRolesInput[]
    updateMany?: UsersUpdateManyWithWhereWithoutRolesInput | UsersUpdateManyWithWhereWithoutRolesInput[]
    deleteMany?: UsersScalarWhereInput | UsersScalarWhereInput[]
  }

  export type SessionsCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput> | SessionsCreateWithoutUserInput[] | SessionsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionsCreateOrConnectWithoutUserInput | SessionsCreateOrConnectWithoutUserInput[]
    createMany?: SessionsCreateManyUserInputEnvelope
    connect?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
  }

  export type RolesCreateNestedManyWithoutUsersInput = {
    create?: XOR<RolesCreateWithoutUsersInput, RolesUncheckedCreateWithoutUsersInput> | RolesCreateWithoutUsersInput[] | RolesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: RolesCreateOrConnectWithoutUsersInput | RolesCreateOrConnectWithoutUsersInput[]
    connect?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
  }

  export type SessionsUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput> | SessionsCreateWithoutUserInput[] | SessionsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionsCreateOrConnectWithoutUserInput | SessionsCreateOrConnectWithoutUserInput[]
    createMany?: SessionsCreateManyUserInputEnvelope
    connect?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
  }

  export type RolesUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<RolesCreateWithoutUsersInput, RolesUncheckedCreateWithoutUsersInput> | RolesCreateWithoutUsersInput[] | RolesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: RolesCreateOrConnectWithoutUsersInput | RolesCreateOrConnectWithoutUsersInput[]
    connect?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type SessionsUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput> | SessionsCreateWithoutUserInput[] | SessionsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionsCreateOrConnectWithoutUserInput | SessionsCreateOrConnectWithoutUserInput[]
    upsert?: SessionsUpsertWithWhereUniqueWithoutUserInput | SessionsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionsCreateManyUserInputEnvelope
    set?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    disconnect?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    delete?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    connect?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    update?: SessionsUpdateWithWhereUniqueWithoutUserInput | SessionsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionsUpdateManyWithWhereWithoutUserInput | SessionsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionsScalarWhereInput | SessionsScalarWhereInput[]
  }

  export type RolesUpdateManyWithoutUsersNestedInput = {
    create?: XOR<RolesCreateWithoutUsersInput, RolesUncheckedCreateWithoutUsersInput> | RolesCreateWithoutUsersInput[] | RolesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: RolesCreateOrConnectWithoutUsersInput | RolesCreateOrConnectWithoutUsersInput[]
    upsert?: RolesUpsertWithWhereUniqueWithoutUsersInput | RolesUpsertWithWhereUniqueWithoutUsersInput[]
    set?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    disconnect?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    delete?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    connect?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    update?: RolesUpdateWithWhereUniqueWithoutUsersInput | RolesUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: RolesUpdateManyWithWhereWithoutUsersInput | RolesUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: RolesScalarWhereInput | RolesScalarWhereInput[]
  }

  export type SessionsUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput> | SessionsCreateWithoutUserInput[] | SessionsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionsCreateOrConnectWithoutUserInput | SessionsCreateOrConnectWithoutUserInput[]
    upsert?: SessionsUpsertWithWhereUniqueWithoutUserInput | SessionsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionsCreateManyUserInputEnvelope
    set?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    disconnect?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    delete?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    connect?: SessionsWhereUniqueInput | SessionsWhereUniqueInput[]
    update?: SessionsUpdateWithWhereUniqueWithoutUserInput | SessionsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionsUpdateManyWithWhereWithoutUserInput | SessionsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionsScalarWhereInput | SessionsScalarWhereInput[]
  }

  export type RolesUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<RolesCreateWithoutUsersInput, RolesUncheckedCreateWithoutUsersInput> | RolesCreateWithoutUsersInput[] | RolesUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: RolesCreateOrConnectWithoutUsersInput | RolesCreateOrConnectWithoutUsersInput[]
    upsert?: RolesUpsertWithWhereUniqueWithoutUsersInput | RolesUpsertWithWhereUniqueWithoutUsersInput[]
    set?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    disconnect?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    delete?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    connect?: RolesWhereUniqueInput | RolesWhereUniqueInput[]
    update?: RolesUpdateWithWhereUniqueWithoutUsersInput | RolesUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: RolesUpdateManyWithWhereWithoutUsersInput | RolesUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: RolesScalarWhereInput | RolesScalarWhereInput[]
  }

  export type UsersCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutSessionsInput
    connect?: UsersWhereUniqueInput
  }

  export type UsersUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutSessionsInput
    upsert?: UsersUpsertWithoutSessionsInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutSessionsInput, UsersUpdateWithoutSessionsInput>, UsersUncheckedUpdateWithoutSessionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumPermissionFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[]
    notIn?: $Enums.Permission[]
    not?: NestedEnumPermissionFilter<$PrismaModel> | $Enums.Permission
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumPermissionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Permission | EnumPermissionFieldRefInput<$PrismaModel>
    in?: $Enums.Permission[]
    notIn?: $Enums.Permission[]
    not?: NestedEnumPermissionWithAggregatesFilter<$PrismaModel> | $Enums.Permission
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPermissionFilter<$PrismaModel>
    _max?: NestedEnumPermissionFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type Recipe_bagsCreateWithoutRecipeInput = {
    position: number
    with_acl?: boolean
    load_modules?: boolean
    bag: BagsCreateNestedOneWithoutRecipe_bagsInput
  }

  export type Recipe_bagsUncheckedCreateWithoutRecipeInput = {
    bag_id: string
    position: number
    with_acl?: boolean
    load_modules?: boolean
  }

  export type Recipe_bagsCreateOrConnectWithoutRecipeInput = {
    where: Recipe_bagsWhereUniqueInput
    create: XOR<Recipe_bagsCreateWithoutRecipeInput, Recipe_bagsUncheckedCreateWithoutRecipeInput>
  }

  export type Recipe_bagsCreateManyRecipeInputEnvelope = {
    data: Recipe_bagsCreateManyRecipeInput | Recipe_bagsCreateManyRecipeInput[]
  }

  export type RecipeAclCreateWithoutRecipeInput = {
    role_id: string
    permission: $Enums.Permission
  }

  export type RecipeAclUncheckedCreateWithoutRecipeInput = {
    acl_id?: number
    role_id: string
    permission: $Enums.Permission
  }

  export type RecipeAclCreateOrConnectWithoutRecipeInput = {
    where: RecipeAclWhereUniqueInput
    create: XOR<RecipeAclCreateWithoutRecipeInput, RecipeAclUncheckedCreateWithoutRecipeInput>
  }

  export type RecipeAclCreateManyRecipeInputEnvelope = {
    data: RecipeAclCreateManyRecipeInput | RecipeAclCreateManyRecipeInput[]
  }

  export type Recipe_bagsUpsertWithWhereUniqueWithoutRecipeInput = {
    where: Recipe_bagsWhereUniqueInput
    update: XOR<Recipe_bagsUpdateWithoutRecipeInput, Recipe_bagsUncheckedUpdateWithoutRecipeInput>
    create: XOR<Recipe_bagsCreateWithoutRecipeInput, Recipe_bagsUncheckedCreateWithoutRecipeInput>
  }

  export type Recipe_bagsUpdateWithWhereUniqueWithoutRecipeInput = {
    where: Recipe_bagsWhereUniqueInput
    data: XOR<Recipe_bagsUpdateWithoutRecipeInput, Recipe_bagsUncheckedUpdateWithoutRecipeInput>
  }

  export type Recipe_bagsUpdateManyWithWhereWithoutRecipeInput = {
    where: Recipe_bagsScalarWhereInput
    data: XOR<Recipe_bagsUpdateManyMutationInput, Recipe_bagsUncheckedUpdateManyWithoutRecipeInput>
  }

  export type Recipe_bagsScalarWhereInput = {
    AND?: Recipe_bagsScalarWhereInput | Recipe_bagsScalarWhereInput[]
    OR?: Recipe_bagsScalarWhereInput[]
    NOT?: Recipe_bagsScalarWhereInput | Recipe_bagsScalarWhereInput[]
    recipe_id?: StringFilter<"Recipe_bags"> | string
    bag_id?: StringFilter<"Recipe_bags"> | string
    position?: IntFilter<"Recipe_bags"> | number
    with_acl?: BoolFilter<"Recipe_bags"> | boolean
    load_modules?: BoolFilter<"Recipe_bags"> | boolean
  }

  export type RecipeAclUpsertWithWhereUniqueWithoutRecipeInput = {
    where: RecipeAclWhereUniqueInput
    update: XOR<RecipeAclUpdateWithoutRecipeInput, RecipeAclUncheckedUpdateWithoutRecipeInput>
    create: XOR<RecipeAclCreateWithoutRecipeInput, RecipeAclUncheckedCreateWithoutRecipeInput>
  }

  export type RecipeAclUpdateWithWhereUniqueWithoutRecipeInput = {
    where: RecipeAclWhereUniqueInput
    data: XOR<RecipeAclUpdateWithoutRecipeInput, RecipeAclUncheckedUpdateWithoutRecipeInput>
  }

  export type RecipeAclUpdateManyWithWhereWithoutRecipeInput = {
    where: RecipeAclScalarWhereInput
    data: XOR<RecipeAclUpdateManyMutationInput, RecipeAclUncheckedUpdateManyWithoutRecipeInput>
  }

  export type RecipeAclScalarWhereInput = {
    AND?: RecipeAclScalarWhereInput | RecipeAclScalarWhereInput[]
    OR?: RecipeAclScalarWhereInput[]
    NOT?: RecipeAclScalarWhereInput | RecipeAclScalarWhereInput[]
    acl_id?: IntFilter<"RecipeAcl"> | number
    role_id?: StringFilter<"RecipeAcl"> | string
    permission?: EnumPermissionFilter<"RecipeAcl"> | $Enums.Permission
    recipe_id?: StringFilter<"RecipeAcl"> | string
  }

  export type RecipesCreateWithoutAclInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
    recipe_bags?: Recipe_bagsCreateNestedManyWithoutRecipeInput
  }

  export type RecipesUncheckedCreateWithoutAclInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
    recipe_bags?: Recipe_bagsUncheckedCreateNestedManyWithoutRecipeInput
  }

  export type RecipesCreateOrConnectWithoutAclInput = {
    where: RecipesWhereUniqueInput
    create: XOR<RecipesCreateWithoutAclInput, RecipesUncheckedCreateWithoutAclInput>
  }

  export type RecipesUpsertWithoutAclInput = {
    update: XOR<RecipesUpdateWithoutAclInput, RecipesUncheckedUpdateWithoutAclInput>
    create: XOR<RecipesCreateWithoutAclInput, RecipesUncheckedCreateWithoutAclInput>
    where?: RecipesWhereInput
  }

  export type RecipesUpdateToOneWithWhereWithoutAclInput = {
    where?: RecipesWhereInput
    data: XOR<RecipesUpdateWithoutAclInput, RecipesUncheckedUpdateWithoutAclInput>
  }

  export type RecipesUpdateWithoutAclInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
    recipe_bags?: Recipe_bagsUpdateManyWithoutRecipeNestedInput
  }

  export type RecipesUncheckedUpdateWithoutAclInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
    recipe_bags?: Recipe_bagsUncheckedUpdateManyWithoutRecipeNestedInput
  }

  export type BagsCreateWithoutRecipe_bagsInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    tiddlers?: TiddlersCreateNestedManyWithoutBagInput
    acl?: BagAclCreateNestedManyWithoutBagInput
  }

  export type BagsUncheckedCreateWithoutRecipe_bagsInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    tiddlers?: TiddlersUncheckedCreateNestedManyWithoutBagInput
    acl?: BagAclUncheckedCreateNestedManyWithoutBagInput
  }

  export type BagsCreateOrConnectWithoutRecipe_bagsInput = {
    where: BagsWhereUniqueInput
    create: XOR<BagsCreateWithoutRecipe_bagsInput, BagsUncheckedCreateWithoutRecipe_bagsInput>
  }

  export type RecipesCreateWithoutRecipe_bagsInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
    acl?: RecipeAclCreateNestedManyWithoutRecipeInput
  }

  export type RecipesUncheckedCreateWithoutRecipe_bagsInput = {
    recipe_id?: string
    recipe_name: string
    description: string
    owner_id?: string | null
    plugin_names: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: boolean
    skip_core?: boolean
    acl?: RecipeAclUncheckedCreateNestedManyWithoutRecipeInput
  }

  export type RecipesCreateOrConnectWithoutRecipe_bagsInput = {
    where: RecipesWhereUniqueInput
    create: XOR<RecipesCreateWithoutRecipe_bagsInput, RecipesUncheckedCreateWithoutRecipe_bagsInput>
  }

  export type BagsUpsertWithoutRecipe_bagsInput = {
    update: XOR<BagsUpdateWithoutRecipe_bagsInput, BagsUncheckedUpdateWithoutRecipe_bagsInput>
    create: XOR<BagsCreateWithoutRecipe_bagsInput, BagsUncheckedCreateWithoutRecipe_bagsInput>
    where?: BagsWhereInput
  }

  export type BagsUpdateToOneWithWhereWithoutRecipe_bagsInput = {
    where?: BagsWhereInput
    data: XOR<BagsUpdateWithoutRecipe_bagsInput, BagsUncheckedUpdateWithoutRecipe_bagsInput>
  }

  export type BagsUpdateWithoutRecipe_bagsInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    tiddlers?: TiddlersUpdateManyWithoutBagNestedInput
    acl?: BagAclUpdateManyWithoutBagNestedInput
  }

  export type BagsUncheckedUpdateWithoutRecipe_bagsInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    tiddlers?: TiddlersUncheckedUpdateManyWithoutBagNestedInput
    acl?: BagAclUncheckedUpdateManyWithoutBagNestedInput
  }

  export type RecipesUpsertWithoutRecipe_bagsInput = {
    update: XOR<RecipesUpdateWithoutRecipe_bagsInput, RecipesUncheckedUpdateWithoutRecipe_bagsInput>
    create: XOR<RecipesCreateWithoutRecipe_bagsInput, RecipesUncheckedCreateWithoutRecipe_bagsInput>
    where?: RecipesWhereInput
  }

  export type RecipesUpdateToOneWithWhereWithoutRecipe_bagsInput = {
    where?: RecipesWhereInput
    data: XOR<RecipesUpdateWithoutRecipe_bagsInput, RecipesUncheckedUpdateWithoutRecipe_bagsInput>
  }

  export type RecipesUpdateWithoutRecipe_bagsInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
    acl?: RecipeAclUpdateManyWithoutRecipeNestedInput
  }

  export type RecipesUncheckedUpdateWithoutRecipe_bagsInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    recipe_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    plugin_names?: PrismaJson.Recipes_plugin_names
    skip_required_plugins?: BoolFieldUpdateOperationsInput | boolean
    skip_core?: BoolFieldUpdateOperationsInput | boolean
    acl?: RecipeAclUncheckedUpdateManyWithoutRecipeNestedInput
  }

  export type Recipe_bagsCreateWithoutBagInput = {
    position: number
    with_acl?: boolean
    load_modules?: boolean
    recipe: RecipesCreateNestedOneWithoutRecipe_bagsInput
  }

  export type Recipe_bagsUncheckedCreateWithoutBagInput = {
    recipe_id: string
    position: number
    with_acl?: boolean
    load_modules?: boolean
  }

  export type Recipe_bagsCreateOrConnectWithoutBagInput = {
    where: Recipe_bagsWhereUniqueInput
    create: XOR<Recipe_bagsCreateWithoutBagInput, Recipe_bagsUncheckedCreateWithoutBagInput>
  }

  export type Recipe_bagsCreateManyBagInputEnvelope = {
    data: Recipe_bagsCreateManyBagInput | Recipe_bagsCreateManyBagInput[]
  }

  export type TiddlersCreateWithoutBagInput = {
    revision_id?: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
    fields?: FieldsCreateNestedManyWithoutTiddlerInput
  }

  export type TiddlersUncheckedCreateWithoutBagInput = {
    revision_id?: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
    fields?: FieldsUncheckedCreateNestedManyWithoutTiddlerInput
  }

  export type TiddlersCreateOrConnectWithoutBagInput = {
    where: TiddlersWhereUniqueInput
    create: XOR<TiddlersCreateWithoutBagInput, TiddlersUncheckedCreateWithoutBagInput>
  }

  export type TiddlersCreateManyBagInputEnvelope = {
    data: TiddlersCreateManyBagInput | TiddlersCreateManyBagInput[]
  }

  export type BagAclCreateWithoutBagInput = {
    role_id: string
    permission: $Enums.Permission
  }

  export type BagAclUncheckedCreateWithoutBagInput = {
    acl_id?: number
    role_id: string
    permission: $Enums.Permission
  }

  export type BagAclCreateOrConnectWithoutBagInput = {
    where: BagAclWhereUniqueInput
    create: XOR<BagAclCreateWithoutBagInput, BagAclUncheckedCreateWithoutBagInput>
  }

  export type BagAclCreateManyBagInputEnvelope = {
    data: BagAclCreateManyBagInput | BagAclCreateManyBagInput[]
  }

  export type Recipe_bagsUpsertWithWhereUniqueWithoutBagInput = {
    where: Recipe_bagsWhereUniqueInput
    update: XOR<Recipe_bagsUpdateWithoutBagInput, Recipe_bagsUncheckedUpdateWithoutBagInput>
    create: XOR<Recipe_bagsCreateWithoutBagInput, Recipe_bagsUncheckedCreateWithoutBagInput>
  }

  export type Recipe_bagsUpdateWithWhereUniqueWithoutBagInput = {
    where: Recipe_bagsWhereUniqueInput
    data: XOR<Recipe_bagsUpdateWithoutBagInput, Recipe_bagsUncheckedUpdateWithoutBagInput>
  }

  export type Recipe_bagsUpdateManyWithWhereWithoutBagInput = {
    where: Recipe_bagsScalarWhereInput
    data: XOR<Recipe_bagsUpdateManyMutationInput, Recipe_bagsUncheckedUpdateManyWithoutBagInput>
  }

  export type TiddlersUpsertWithWhereUniqueWithoutBagInput = {
    where: TiddlersWhereUniqueInput
    update: XOR<TiddlersUpdateWithoutBagInput, TiddlersUncheckedUpdateWithoutBagInput>
    create: XOR<TiddlersCreateWithoutBagInput, TiddlersUncheckedCreateWithoutBagInput>
  }

  export type TiddlersUpdateWithWhereUniqueWithoutBagInput = {
    where: TiddlersWhereUniqueInput
    data: XOR<TiddlersUpdateWithoutBagInput, TiddlersUncheckedUpdateWithoutBagInput>
  }

  export type TiddlersUpdateManyWithWhereWithoutBagInput = {
    where: TiddlersScalarWhereInput
    data: XOR<TiddlersUpdateManyMutationInput, TiddlersUncheckedUpdateManyWithoutBagInput>
  }

  export type TiddlersScalarWhereInput = {
    AND?: TiddlersScalarWhereInput | TiddlersScalarWhereInput[]
    OR?: TiddlersScalarWhereInput[]
    NOT?: TiddlersScalarWhereInput | TiddlersScalarWhereInput[]
    revision_id?: StringFilter<"Tiddlers"> | string
    bag_id?: StringFilter<"Tiddlers"> | string
    title?: StringFilter<"Tiddlers"> | string
    is_deleted?: BoolFilter<"Tiddlers"> | boolean
    attachment_hash?: StringNullableFilter<"Tiddlers"> | string | null
  }

  export type BagAclUpsertWithWhereUniqueWithoutBagInput = {
    where: BagAclWhereUniqueInput
    update: XOR<BagAclUpdateWithoutBagInput, BagAclUncheckedUpdateWithoutBagInput>
    create: XOR<BagAclCreateWithoutBagInput, BagAclUncheckedCreateWithoutBagInput>
  }

  export type BagAclUpdateWithWhereUniqueWithoutBagInput = {
    where: BagAclWhereUniqueInput
    data: XOR<BagAclUpdateWithoutBagInput, BagAclUncheckedUpdateWithoutBagInput>
  }

  export type BagAclUpdateManyWithWhereWithoutBagInput = {
    where: BagAclScalarWhereInput
    data: XOR<BagAclUpdateManyMutationInput, BagAclUncheckedUpdateManyWithoutBagInput>
  }

  export type BagAclScalarWhereInput = {
    AND?: BagAclScalarWhereInput | BagAclScalarWhereInput[]
    OR?: BagAclScalarWhereInput[]
    NOT?: BagAclScalarWhereInput | BagAclScalarWhereInput[]
    acl_id?: IntFilter<"BagAcl"> | number
    bag_id?: StringFilter<"BagAcl"> | string
    role_id?: StringFilter<"BagAcl"> | string
    permission?: EnumPermissionFilter<"BagAcl"> | $Enums.Permission
  }

  export type BagsCreateWithoutAclInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    recipe_bags?: Recipe_bagsCreateNestedManyWithoutBagInput
    tiddlers?: TiddlersCreateNestedManyWithoutBagInput
  }

  export type BagsUncheckedCreateWithoutAclInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    recipe_bags?: Recipe_bagsUncheckedCreateNestedManyWithoutBagInput
    tiddlers?: TiddlersUncheckedCreateNestedManyWithoutBagInput
  }

  export type BagsCreateOrConnectWithoutAclInput = {
    where: BagsWhereUniqueInput
    create: XOR<BagsCreateWithoutAclInput, BagsUncheckedCreateWithoutAclInput>
  }

  export type BagsUpsertWithoutAclInput = {
    update: XOR<BagsUpdateWithoutAclInput, BagsUncheckedUpdateWithoutAclInput>
    create: XOR<BagsCreateWithoutAclInput, BagsUncheckedCreateWithoutAclInput>
    where?: BagsWhereInput
  }

  export type BagsUpdateToOneWithWhereWithoutAclInput = {
    where?: BagsWhereInput
    data: XOR<BagsUpdateWithoutAclInput, BagsUncheckedUpdateWithoutAclInput>
  }

  export type BagsUpdateWithoutAclInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    recipe_bags?: Recipe_bagsUpdateManyWithoutBagNestedInput
    tiddlers?: TiddlersUpdateManyWithoutBagNestedInput
  }

  export type BagsUncheckedUpdateWithoutAclInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    recipe_bags?: Recipe_bagsUncheckedUpdateManyWithoutBagNestedInput
    tiddlers?: TiddlersUncheckedUpdateManyWithoutBagNestedInput
  }

  export type FieldsCreateWithoutTiddlerInput = {
    field_name: string
    field_value: string
  }

  export type FieldsUncheckedCreateWithoutTiddlerInput = {
    field_name: string
    field_value: string
  }

  export type FieldsCreateOrConnectWithoutTiddlerInput = {
    where: FieldsWhereUniqueInput
    create: XOR<FieldsCreateWithoutTiddlerInput, FieldsUncheckedCreateWithoutTiddlerInput>
  }

  export type FieldsCreateManyTiddlerInputEnvelope = {
    data: FieldsCreateManyTiddlerInput | FieldsCreateManyTiddlerInput[]
  }

  export type BagsCreateWithoutTiddlersInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    recipe_bags?: Recipe_bagsCreateNestedManyWithoutBagInput
    acl?: BagAclCreateNestedManyWithoutBagInput
  }

  export type BagsUncheckedCreateWithoutTiddlersInput = {
    bag_id?: string
    bag_name: string
    description: string
    owner_id?: string | null
    recipe_bags?: Recipe_bagsUncheckedCreateNestedManyWithoutBagInput
    acl?: BagAclUncheckedCreateNestedManyWithoutBagInput
  }

  export type BagsCreateOrConnectWithoutTiddlersInput = {
    where: BagsWhereUniqueInput
    create: XOR<BagsCreateWithoutTiddlersInput, BagsUncheckedCreateWithoutTiddlersInput>
  }

  export type FieldsUpsertWithWhereUniqueWithoutTiddlerInput = {
    where: FieldsWhereUniqueInput
    update: XOR<FieldsUpdateWithoutTiddlerInput, FieldsUncheckedUpdateWithoutTiddlerInput>
    create: XOR<FieldsCreateWithoutTiddlerInput, FieldsUncheckedCreateWithoutTiddlerInput>
  }

  export type FieldsUpdateWithWhereUniqueWithoutTiddlerInput = {
    where: FieldsWhereUniqueInput
    data: XOR<FieldsUpdateWithoutTiddlerInput, FieldsUncheckedUpdateWithoutTiddlerInput>
  }

  export type FieldsUpdateManyWithWhereWithoutTiddlerInput = {
    where: FieldsScalarWhereInput
    data: XOR<FieldsUpdateManyMutationInput, FieldsUncheckedUpdateManyWithoutTiddlerInput>
  }

  export type FieldsScalarWhereInput = {
    AND?: FieldsScalarWhereInput | FieldsScalarWhereInput[]
    OR?: FieldsScalarWhereInput[]
    NOT?: FieldsScalarWhereInput | FieldsScalarWhereInput[]
    revision_id?: StringFilter<"Fields"> | string
    field_name?: StringFilter<"Fields"> | string
    field_value?: StringFilter<"Fields"> | string
  }

  export type BagsUpsertWithoutTiddlersInput = {
    update: XOR<BagsUpdateWithoutTiddlersInput, BagsUncheckedUpdateWithoutTiddlersInput>
    create: XOR<BagsCreateWithoutTiddlersInput, BagsUncheckedCreateWithoutTiddlersInput>
    where?: BagsWhereInput
  }

  export type BagsUpdateToOneWithWhereWithoutTiddlersInput = {
    where?: BagsWhereInput
    data: XOR<BagsUpdateWithoutTiddlersInput, BagsUncheckedUpdateWithoutTiddlersInput>
  }

  export type BagsUpdateWithoutTiddlersInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    recipe_bags?: Recipe_bagsUpdateManyWithoutBagNestedInput
    acl?: BagAclUpdateManyWithoutBagNestedInput
  }

  export type BagsUncheckedUpdateWithoutTiddlersInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    bag_name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    owner_id?: NullableStringFieldUpdateOperationsInput | string | null
    recipe_bags?: Recipe_bagsUncheckedUpdateManyWithoutBagNestedInput
    acl?: BagAclUncheckedUpdateManyWithoutBagNestedInput
  }

  export type TiddlersCreateWithoutFieldsInput = {
    revision_id?: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
    bag: BagsCreateNestedOneWithoutTiddlersInput
  }

  export type TiddlersUncheckedCreateWithoutFieldsInput = {
    revision_id?: string
    bag_id: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
  }

  export type TiddlersCreateOrConnectWithoutFieldsInput = {
    where: TiddlersWhereUniqueInput
    create: XOR<TiddlersCreateWithoutFieldsInput, TiddlersUncheckedCreateWithoutFieldsInput>
  }

  export type TiddlersUpsertWithoutFieldsInput = {
    update: XOR<TiddlersUpdateWithoutFieldsInput, TiddlersUncheckedUpdateWithoutFieldsInput>
    create: XOR<TiddlersCreateWithoutFieldsInput, TiddlersUncheckedCreateWithoutFieldsInput>
    where?: TiddlersWhereInput
  }

  export type TiddlersUpdateToOneWithWhereWithoutFieldsInput = {
    where?: TiddlersWhereInput
    data: XOR<TiddlersUpdateWithoutFieldsInput, TiddlersUncheckedUpdateWithoutFieldsInput>
  }

  export type TiddlersUpdateWithoutFieldsInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
    bag?: BagsUpdateOneRequiredWithoutTiddlersNestedInput
  }

  export type TiddlersUncheckedUpdateWithoutFieldsInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    bag_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsersCreateWithoutRolesInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
    sessions?: SessionsCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutRolesInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
    sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutRolesInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutRolesInput, UsersUncheckedCreateWithoutRolesInput>
  }

  export type UsersUpsertWithWhereUniqueWithoutRolesInput = {
    where: UsersWhereUniqueInput
    update: XOR<UsersUpdateWithoutRolesInput, UsersUncheckedUpdateWithoutRolesInput>
    create: XOR<UsersCreateWithoutRolesInput, UsersUncheckedCreateWithoutRolesInput>
  }

  export type UsersUpdateWithWhereUniqueWithoutRolesInput = {
    where: UsersWhereUniqueInput
    data: XOR<UsersUpdateWithoutRolesInput, UsersUncheckedUpdateWithoutRolesInput>
  }

  export type UsersUpdateManyWithWhereWithoutRolesInput = {
    where: UsersScalarWhereInput
    data: XOR<UsersUpdateManyMutationInput, UsersUncheckedUpdateManyWithoutRolesInput>
  }

  export type UsersScalarWhereInput = {
    AND?: UsersScalarWhereInput | UsersScalarWhereInput[]
    OR?: UsersScalarWhereInput[]
    NOT?: UsersScalarWhereInput | UsersScalarWhereInput[]
    user_id?: StringFilter<"Users"> | string
    username?: StringFilter<"Users"> | string
    email?: StringFilter<"Users"> | string
    password?: StringFilter<"Users"> | string
    created_at?: DateTimeFilter<"Users"> | Date | string
    last_login?: DateTimeNullableFilter<"Users"> | Date | string | null
  }

  export type SessionsCreateWithoutUserInput = {
    session_id: string
    created_at?: Date | string
    last_accessed: Date | string
    session_key?: string | null
  }

  export type SessionsUncheckedCreateWithoutUserInput = {
    session_id: string
    created_at?: Date | string
    last_accessed: Date | string
    session_key?: string | null
  }

  export type SessionsCreateOrConnectWithoutUserInput = {
    where: SessionsWhereUniqueInput
    create: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput>
  }

  export type SessionsCreateManyUserInputEnvelope = {
    data: SessionsCreateManyUserInput | SessionsCreateManyUserInput[]
  }

  export type RolesCreateWithoutUsersInput = {
    role_id?: string
    role_name: string
    description?: string | null
  }

  export type RolesUncheckedCreateWithoutUsersInput = {
    role_id?: string
    role_name: string
    description?: string | null
  }

  export type RolesCreateOrConnectWithoutUsersInput = {
    where: RolesWhereUniqueInput
    create: XOR<RolesCreateWithoutUsersInput, RolesUncheckedCreateWithoutUsersInput>
  }

  export type SessionsUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionsWhereUniqueInput
    update: XOR<SessionsUpdateWithoutUserInput, SessionsUncheckedUpdateWithoutUserInput>
    create: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput>
  }

  export type SessionsUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionsWhereUniqueInput
    data: XOR<SessionsUpdateWithoutUserInput, SessionsUncheckedUpdateWithoutUserInput>
  }

  export type SessionsUpdateManyWithWhereWithoutUserInput = {
    where: SessionsScalarWhereInput
    data: XOR<SessionsUpdateManyMutationInput, SessionsUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionsScalarWhereInput = {
    AND?: SessionsScalarWhereInput | SessionsScalarWhereInput[]
    OR?: SessionsScalarWhereInput[]
    NOT?: SessionsScalarWhereInput | SessionsScalarWhereInput[]
    session_id?: StringFilter<"Sessions"> | string
    created_at?: DateTimeFilter<"Sessions"> | Date | string
    last_accessed?: DateTimeFilter<"Sessions"> | Date | string
    session_key?: StringNullableFilter<"Sessions"> | string | null
    user_id?: StringFilter<"Sessions"> | string
  }

  export type RolesUpsertWithWhereUniqueWithoutUsersInput = {
    where: RolesWhereUniqueInput
    update: XOR<RolesUpdateWithoutUsersInput, RolesUncheckedUpdateWithoutUsersInput>
    create: XOR<RolesCreateWithoutUsersInput, RolesUncheckedCreateWithoutUsersInput>
  }

  export type RolesUpdateWithWhereUniqueWithoutUsersInput = {
    where: RolesWhereUniqueInput
    data: XOR<RolesUpdateWithoutUsersInput, RolesUncheckedUpdateWithoutUsersInput>
  }

  export type RolesUpdateManyWithWhereWithoutUsersInput = {
    where: RolesScalarWhereInput
    data: XOR<RolesUpdateManyMutationInput, RolesUncheckedUpdateManyWithoutUsersInput>
  }

  export type RolesScalarWhereInput = {
    AND?: RolesScalarWhereInput | RolesScalarWhereInput[]
    OR?: RolesScalarWhereInput[]
    NOT?: RolesScalarWhereInput | RolesScalarWhereInput[]
    role_id?: StringFilter<"Roles"> | string
    role_name?: StringFilter<"Roles"> | string
    description?: StringNullableFilter<"Roles"> | string | null
  }

  export type UsersCreateWithoutSessionsInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
    roles?: RolesCreateNestedManyWithoutUsersInput
  }

  export type UsersUncheckedCreateWithoutSessionsInput = {
    user_id?: string
    username: string
    email: string
    password: string
    created_at?: Date | string
    last_login?: Date | string | null
    roles?: RolesUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UsersCreateOrConnectWithoutSessionsInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
  }

  export type UsersUpsertWithoutSessionsInput = {
    update: XOR<UsersUpdateWithoutSessionsInput, UsersUncheckedUpdateWithoutSessionsInput>
    create: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutSessionsInput, UsersUncheckedUpdateWithoutSessionsInput>
  }

  export type UsersUpdateWithoutSessionsInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    roles?: RolesUpdateManyWithoutUsersNestedInput
  }

  export type UsersUncheckedUpdateWithoutSessionsInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    roles?: RolesUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type Recipe_bagsCreateManyRecipeInput = {
    bag_id: string
    position: number
    with_acl?: boolean
    load_modules?: boolean
  }

  export type RecipeAclCreateManyRecipeInput = {
    acl_id?: number
    role_id: string
    permission: $Enums.Permission
  }

  export type Recipe_bagsUpdateWithoutRecipeInput = {
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
    bag?: BagsUpdateOneRequiredWithoutRecipe_bagsNestedInput
  }

  export type Recipe_bagsUncheckedUpdateWithoutRecipeInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type Recipe_bagsUncheckedUpdateManyWithoutRecipeInput = {
    bag_id?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type RecipeAclUpdateWithoutRecipeInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type RecipeAclUncheckedUpdateWithoutRecipeInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type RecipeAclUncheckedUpdateManyWithoutRecipeInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type Recipe_bagsCreateManyBagInput = {
    recipe_id: string
    position: number
    with_acl?: boolean
    load_modules?: boolean
  }

  export type TiddlersCreateManyBagInput = {
    revision_id?: string
    title: string
    is_deleted: boolean
    attachment_hash?: string | null
  }

  export type BagAclCreateManyBagInput = {
    acl_id?: number
    role_id: string
    permission: $Enums.Permission
  }

  export type Recipe_bagsUpdateWithoutBagInput = {
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
    recipe?: RecipesUpdateOneRequiredWithoutRecipe_bagsNestedInput
  }

  export type Recipe_bagsUncheckedUpdateWithoutBagInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type Recipe_bagsUncheckedUpdateManyWithoutBagInput = {
    recipe_id?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    with_acl?: BoolFieldUpdateOperationsInput | boolean
    load_modules?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TiddlersUpdateWithoutBagInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
    fields?: FieldsUpdateManyWithoutTiddlerNestedInput
  }

  export type TiddlersUncheckedUpdateWithoutBagInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
    fields?: FieldsUncheckedUpdateManyWithoutTiddlerNestedInput
  }

  export type TiddlersUncheckedUpdateManyWithoutBagInput = {
    revision_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    is_deleted?: BoolFieldUpdateOperationsInput | boolean
    attachment_hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BagAclUpdateWithoutBagInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type BagAclUncheckedUpdateWithoutBagInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type BagAclUncheckedUpdateManyWithoutBagInput = {
    acl_id?: IntFieldUpdateOperationsInput | number
    role_id?: StringFieldUpdateOperationsInput | string
    permission?: EnumPermissionFieldUpdateOperationsInput | $Enums.Permission
  }

  export type FieldsCreateManyTiddlerInput = {
    field_name: string
    field_value: string
  }

  export type FieldsUpdateWithoutTiddlerInput = {
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
  }

  export type FieldsUncheckedUpdateWithoutTiddlerInput = {
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
  }

  export type FieldsUncheckedUpdateManyWithoutTiddlerInput = {
    field_name?: StringFieldUpdateOperationsInput | string
    field_value?: StringFieldUpdateOperationsInput | string
  }

  export type UsersUpdateWithoutRolesInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionsUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutRolesInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateManyWithoutRolesInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SessionsCreateManyUserInput = {
    session_id: string
    created_at?: Date | string
    last_accessed: Date | string
    session_key?: string | null
  }

  export type SessionsUpdateWithoutUserInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionsUncheckedUpdateWithoutUserInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionsUncheckedUpdateManyWithoutUserInput = {
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    last_accessed?: DateTimeFieldUpdateOperationsInput | Date | string
    session_key?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RolesUpdateWithoutUsersInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RolesUncheckedUpdateWithoutUsersInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RolesUncheckedUpdateManyWithoutUsersInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}