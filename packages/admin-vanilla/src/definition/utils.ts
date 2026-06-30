export function definitely<T>(a: any): asserts a is T { }

export function ok<T>(value: T | null | undefined | "" | 0 | false, message?: string): asserts value is T {
  if (!value) throw new Error(message ?? `AssertionError: ${value}`);
}

export function is<T>(a: any, b: boolean): a is T { return b; }

export function mapGetInit<K, V>(map: Map<K, V>, key: K, init: () => V): V {
  if (!map.has(key)) {
    let val = init();
    map.set(key, val);
    return val;
  } else {
    return map.get(key) as V;
  }
}
