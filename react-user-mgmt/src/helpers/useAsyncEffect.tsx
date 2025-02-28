import { useEffect, useRef, useState } from "react";


const catcher: (point: "factory" | "mount" | "unmount" | "cancel", error: unknown) => unknown =
  (point, error) => { console.log(point, error); };


/**
 * Hook to run an async effect on mount and another on unmount. 
 * 
 * Note that if the calling render throws, the mount will not run. 
 * 
 * Loading initializes true.
 * 
 * From https://marmelab.com/blog/2023/01/11/use-async-effect-react.html
 */
export function useAsyncEffect<RES, ARGS extends readonly any[]>(
  this: void,
  /** The normal effect callback which is called asyncly. If the component unmounts before this is called, nothing further happens. */
  mount: () => Promise<RES>,
  /** The unmount callback is called immediately after mount if the component unmounts during mount, but only if mount succeeded. */
  unmount: () => Promise<void> = async () => { },
  /** The cancel callback is called if the component unmounts while mount is still running. */
  cancel: () => Promise<void> = async () => { },
  /** 
   * The dependancies array passed to useEffect which triggers mount and unmount. 
   * The default is an empty array 
   */
  deps: ARGS = [] as any as ARGS,
): UseAsyncEffectResult<RES, unknown> {

  // const stacker = new Error("useAsyncEffect render stack");
  // track whether the using component instance is still active. 
  const componentActive = useRef(false);
  const [loading, setLoading] = useState(true);
  const [promise, setPromise] = useState(new PromiseSubject<RES>());
  const [error, setError] = useState<unknown>();
  const [result, setResult] = useState<RES>();

  useEffect(() => {
    // this keeps track of whether the component using this effect is still mounted. 
    // the useRef gets discarded when the component gets reset, same as an empty deps array in useEffect
    componentActive.current = true;
    return () => { componentActive.current = false; };
  }, []);

  useEffect(() => {
    // console.log(activeState.mount === mount);
    let depsChanged = false;
    let mountStarted = false;
    let mountFinished = false;
    let mountSucceeded = false;
    let mountFailed = false;

    (async () => {
      await Promise.resolve(); // wait for the initial cleanup in Strict mode - avoids double mutation
      // console.log("useAsyncEffect", componentActive.current, depsChanged, deps)
      if (!componentActive.current || depsChanged) { return; }

      setLoading(true);

      try {
        mountStarted = true;
        const result = await mount();
        promise.resolve(result);
        mountSucceeded = true;
        if (componentActive.current && !depsChanged) {
          setError(undefined);
          setResult(result);
          setLoading(false);
        } else {
          // Component was unmounted before the mount callback finished, cancel it
          unmount()
        }
      } catch (error: unknown) {
        if (!componentActive.current) return;
        mountFailed = true;
        catcher("mount", error);
        setLoading(false);
        setError(error);
        promise.reject(error);
      } finally {
        mountFinished = true;
      }
    })();

    return () => {
      depsChanged = true;
      (async () => {
        if (mountSucceeded) {
          try {
            await unmount();
            if (!componentActive.current) return;
            setResult(undefined);
          } catch (error) {
            if (!componentActive.current) return;
            catcher("unmount", error);
          }
        } else if (mountStarted && !mountFailed) {
          try {
            await cancel();
          } catch (error) {
            if (!componentActive.current) return;
            catcher("cancel", error);
          }
        }
      })();
      setPromise(new PromiseSubject<RES>());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // return useMemo(() => ({ result, error, loading }), [result, error, loading,]);
  return { error, loading, result, promise }
};

interface UseAsyncEffectResult<R, E> {
  /** If the effect fails to run, this will not be changed */
  result: R | undefined;
  /** If the effect runs successfully, this will be set to null. */
  error: E | undefined;

  loading: boolean;

  promise: PromiseSubject<R>;
}


class PromiseSubject<T> extends Promise<T> {
  #resolve!: (value: T | PromiseLike<T>) => void;
  #reject!: (reason?: any) => void;
  #done: boolean = false;
  public get done(): boolean { return this.#done; }
  constructor(executor?: PromiseSubject<T>);
  constructor(executor?: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void);
  constructor(executor?: ((resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) | PromiseSubject<T>) {
    let _resolve: any, _reject: any;
    super((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
      if (typeof executor === "function") executor(resolve, reject);
    });
    this.resolve = _resolve;
    this.reject = _reject;
    if (executor instanceof Promise) executor.then(e => this.resolve(e));
  }
  resolve(a: T) {
    if (this.#done) return;
    this.#done = true;
    this.#resolve(a);
  }
  reject(a: any) {
    if (this.#done) return;
    this.#done = true;
    this.#reject(a);
  }
}
