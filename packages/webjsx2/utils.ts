/**
 * Reference type for DOM nodes.
 * Can be either a callback function or an object with a current property.
 * The object type is just Element so it can be used with any type of DOM Element.
 */
export type Ref<T extends Element = Element> = FunctionRef<T> | ObjectRef<T>;
export type ObjectRef<T> = { current: T; };
export type FunctionRef<T extends Element = Element> = (node: T | null) => void;
export interface HybridRef<T extends Element = Element> extends Function {
  (node: T | null): void;
  current: T | null;
}
export const createHybridRef = <T extends Element>(callback?: (e: T | null) => void): HybridRef<T> => {
  return new Proxy<HybridRef<T>>(Object.seal({ current: null }) as any, {
    apply(target, _thisArg, [node]) {
      target.current = node;
      callback?.(node);
    },
    get(target, prop, _receiver) {
      if (prop === "current") {
        return target.current;
      }
      return undefined;
    },
    set(target, prop, value, _receiver) {
      if (prop === "current") {
        target.current = value;
        callback?.(value);
        return true;
      }
      return false;
    }
  });
};
export function is<T>(a: any, b: boolean): a is T { return b; }
export function truthy<T>(value: T | null | undefined | "" | 0 | false | void): value is T {
  return value !== null && value !== undefined;
}