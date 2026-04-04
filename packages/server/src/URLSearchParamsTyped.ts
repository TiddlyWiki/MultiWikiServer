// export interface ZodRouteDef<
//   M extends AllowedMethod,
//   B extends BodyFormat,
//   P extends Record<string, z.ZodTypeAny>,
//   Q extends Record<string, z.ZodTypeAny>,
//   T extends z.ZodTypeAny,
//   R extends JsonValue
// > {
//   zodRequestBody?: B extends "string" | "json" | "www-form-urlencoded" ? (z: Z2) => T : undefined;
// }
/**
 * The **`URLSearchParams`** interface defines utility methods to work with the query string of a URL.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams)
 */
export interface URLSearchParamsTyped<T extends Record<never, string>> {
  /**
   * The **`size`** read-only property of the URLSearchParams interface indicates the total number of search parameter entries.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/size)
   */
  readonly size: number;
  /**
   * The **`append()`** method of the URLSearchParams interface appends a specified key/value pair as a new search parameter.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/append)
   */
  append<K extends string & keyof T>(name: K, value: T[K]): void;
  /**
   * The **`delete()`** method of the URLSearchParams interface deletes specified parameters and their associated value(s) from the list of all search parameters.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/delete)
   */
  delete<K extends string & keyof T>(name: K, value?: T[K]): void;
  /**
   * The **`get()`** method of the URLSearchParams interface returns the first value associated to the given search parameter.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/get)
   */
  get<K extends string & keyof T>(name: K): T[K] | null;
  /**
   * The **`getAll()`** method of the URLSearchParams interface returns all the values associated with a given search parameter as an array.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/getAll)
   */
  getAll<K extends string & keyof T>(name: K): T[K][];
  /**
   * The **`has()`** method of the URLSearchParams interface returns a boolean value that indicates whether the specified parameter is in the search parameters.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/has)
   */
  has<K extends string & keyof T>(name: K, value?: T[K]): boolean;
  /**
   * The **`set()`** method of the URLSearchParams interface sets the value associated with a given search parameter to the given value.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/set)
   */
  set<K extends string & keyof T>(name: K, value: T[K]): void;
  /**
   * The **`URLSearchParams.sort()`** method sorts all key/value pairs contained in this object in place and returns `undefined`.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/sort)
   */
  sort(): void;
  toString(): string;
  forEach(callbackfn: (value: T[string & keyof T], key: string & keyof T, parent: URLSearchParamsTyped<T>) => void, thisArg?: any): void;
  [Symbol.iterator](): URLSearchParamsIterator<[string & keyof T, T[string & keyof T]]>;
  /** Returns an array of key, value pairs for every entry in the search params. */
  entries(): URLSearchParamsIterator<[string & keyof T, T[string & keyof T]]>;
  /** Returns a list of keys in the search params. */
  keys(): URLSearchParamsIterator<string & keyof T>;
  /** Returns a list of values in the search params. */
  values(): URLSearchParamsIterator<T[string & keyof T]>;
}
