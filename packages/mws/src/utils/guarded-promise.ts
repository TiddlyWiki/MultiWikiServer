/**
 * GuardedPromise: a Promise that logs a warning if nothing observes it
 * (await, .then, .catch, .finally) in the same synchronous turn it was created in.
 *
 * Usage:
 *   const p = guard(fetchUser(id), "fetchUser");
 *   await p;                 // fine
 *
 *   guard(save(), "save");   // logs: [save] was not awaited immediately
 */

export type GuardLogger = (message: string, origin: Error) => void;

const defaultLogger: GuardLogger = (message, origin) => {
  console.warn(message, "\n", origin.stack);
};

export class GuardedPromise<T> extends Promise<T> {
  // Derived promises (from .then/.catch/.finally) are plain Promises,
  // so only the original is guarded and chaining doesn't trigger new warnings.
  static override get [Symbol.species]() {
    return Promise;
  }

  #observed = false;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void,
    ) => void,
    label = "GuardedPromise",
    log: GuardLogger = defaultLogger,
  ) {
    super(executor);

    // Capture where the promise was created so the warning points at the culprit.
    const origin = new Error(`${label} created here`);

    // Two microtask hops: `await` on a Promise subclass doesn't call .then()
    // synchronously — it enqueues a job that does. A single hop would run before
    // that job and produce a false positive for a correct `await p`.
    queueMicrotask(() =>
      queueMicrotask(() => {
        if (!this.#observed) {
          log(`[${label}] was not awaited immediately`, origin);
        }
      }),
    );
  }

  // .catch() and .finally() both delegate to .then(), and so does await,
  // so this single override covers every way of observing the promise.
  override then<R1 = T, R2 = never>(
    onFulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    this.#observed = true;
    return super.then(onFulfilled, onRejected);
  }
}

/** Wrap an existing promise (or any thenable) in a guard. */
export function guard<T>(
  promise: PromiseLike<T>,
  label?: string,
  log?: GuardLogger,
): GuardedPromise<T> {
  return new GuardedPromise<T>((resolve, reject) => promise.then(resolve, reject), label, log);
}

/** Wrap an async function so every call returns a guarded promise. */
export function guarded<A extends unknown[], T>(
  fn: (...args: A) => PromiseLike<T>,
  label = fn.name || "anonymous",
  log?: GuardLogger,
): (...args: A) => GuardedPromise<T> {
  return (...args) => guard(fn(...args), label, log);
}