export function mapGetInit<K, V>(map: Map<K, V>, key: K, init: () => V): V {
  if (!map.has(key)) {
    let val = init();
    map.set(key, val);
    return val;
  } else {
    return map.get(key) as V;
  }
}

export function thrower(error: any): never { throw error; }