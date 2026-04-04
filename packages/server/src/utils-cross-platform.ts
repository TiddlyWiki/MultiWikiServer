
export type jsonify<T> =
  T extends void ? undefined :
  T extends Promise<any> ? unknown :
  T extends Date ? string :
  // T extends Map<infer K, infer V> ? [jsonify<K>, jsonify<V>][] :
  // T extends Set<infer U> ? jsonify<U>[] :
  T extends string | number | boolean | null | undefined ? T :
  T extends [...any[]] ? number extends T["length"] ? jsonify<T[number]>[] : [...jsonifyTuple<T>] :
  T extends Array<infer U> ? jsonify<U>[] :
  T extends object ? { [K in keyof T as T[K] extends never ? never : K]: jsonify<T[K]> } :
  unknown;

export type RemoveNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

export type jsonifyTuple<T> = T extends [infer A, ...infer B] ? [jsonify<A>, ...jsonifyTuple<B>] : T extends [infer A] ? [jsonify<A>] : [];


export function is<T>(a: any, b: boolean): a is T { return b; }

export function tryParseJSON<T>(json: string): T | undefined {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}
