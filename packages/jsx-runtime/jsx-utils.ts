
export class PromiseSubject<T> implements Promise<T> {
  #p: Promise<T>;
  #r!: (value: T | PromiseLike<T>) => void;
  #c!: (reason?: any) => void;
  constructor() {
    let r, c;
    this.#p = new Promise((resolve, reject) => {
      r = resolve;
      c = reject;
    });
    this.#r = r!;
    this.#c = c!;
  }
  resolve(value: T | PromiseLike<T>) {
    this.#r(value);
  }
  reject(reason?: any) {
    this.#c(reason);
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.#p.then(onfulfilled, onrejected);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.#p.catch(onrejected);
  }
  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.#p.finally(onfinally);
  }

  [Symbol.toStringTag] = "PromiseSubject";

}

export interface HybridRef<T> {
  (value: T): void;
  current: T | undefined;
  value: T | undefined;
  readonly callbacks: ((value: T) => void)[];
  readonly next: PromiseSubject<T>;
  readonly current_: PromiseSubject<T>;
}

export const createHybridRef = <T>(init: T): HybridRef<T> => {
  const action = (target: HybridRef<T>, value: T) => {
    target.current = value;
    target.callbacks.forEach(cb => { try { cb(value) } catch (e) { console.error(e); } });
    target.next.resolve(value);
    (target as MutableForced<typeof target>).next = new PromiseSubject();
    if (value != null) {
      (target as MutableForced<typeof target>).current_ = new PromiseSubject();
      target.current_.resolve(value);
    }
  }
  return new Proxy<HybridRef<T>>(Object.seal({
    current: init,
    next: new PromiseSubject<T>(),
    current_: new PromiseSubject<T>(),
    callbacks: [],
  }) as any, {
    apply(target, _thisArg, [value]) {
      action(target, value);
    },
    get(target, prop, _receiver) {
      if (prop === "current" || prop === "value") {
        return target.current;
      }
      if (prop === "next") {
        return target.next;
      }
      if (prop === "current_") {
        return target.current_;
      }
      if (prop === "callbacks") {
        return target.callbacks;
      }
      return undefined;
    },
    set(target, prop, value, _receiver) {
      if (prop === "current" || prop === "value") {
        action(target, value);
        return true;
      }
      return false;
    },
  });
};

export function is<T>(a: any, b: boolean): a is T { return b; }
export function truthy<T>(value: T | null | undefined | "" | 0 | false | void): value is T {
  return value !== null && value !== undefined;
}

export type MaybeArray<T> = T | T[];
export type MaybeArrayDeep<T> = T | MaybeArrayDeep<T>[];

export type MutableForced<T> = T extends null | boolean | string | number | undefined ? T : MutableForcedObject<T>;
export type MutableForcedObject<T> = { -readonly [K in keyof T]: MutableForced<T[K]>; };