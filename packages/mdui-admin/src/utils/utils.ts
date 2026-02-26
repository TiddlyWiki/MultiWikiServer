import EventEmitter from "events";

export function is<T>(a: any, b: any): a is T { return !!b; }

export const stopPropagation = (e: Event) => { e.stopPropagation(); };
export const preventDefault = (e: Event) => { e.preventDefault(); };
export function get24HourDefault() {
  const { hour12 } = Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions();
  return hour12 === false;
}

const BASE64_PREFIX = "data:application/octet-stream;base64,";

export async function bytesToBase64(bytes: Uint8Array<ArrayBuffer>, type = "application/octet-stream") {
  return await new Promise<string>((resolve, reject) => {
    const reader = Object.assign(new FileReader(), {
      onload: () => resolve((reader.result as string).slice(BASE64_PREFIX.length)),
      onerror: () => reject(reader.error),
    });
    reader.readAsDataURL(new Blob([bytes], { type }));
  });
}

export async function base64ToBytes(base64: string) {
  const res = await fetch(BASE64_PREFIX + base64);
  return new Uint8Array(await res.arrayBuffer());
}

export function base64ToBytesSync(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

export function bytesToBase64Sync(bytes: Uint8Array) {
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
  return btoa(binString);
}


export function postAndRedirect(url: string, data: Record<string, string>) {

  const form = document.createElement('form');
  form.method = 'POST'; // Set the method to POST
  form.action = url; // Set the action URL
  form.style.display = 'none';

  for (const [key, value] of Object.entries(data)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export async function try_catch<T>(cb: () => Promise<T>) {
  try {
    return await cb();
  } catch (e) {
    throw e;
  }
}

interface TryResultExtra<T> {
  unwrapOrElse<U>(cb: (e: any) => U): T | U;
  unwrapOrElseAwait<U>(cb: (e: any) => Promise<U>): Promise<T | U>;
}

type TryResultType<T> =
  | TryResultExtra<T> & { success: true; result: T; error: undefined }
  | TryResultExtra<T> & { success: false; result: undefined; error: any }

export class TryResult<T> {
  constructor(public success: boolean, public error?: any, public result?: T) { }
  *[Symbol.iterator]() {
    yield this.success;
    yield this.error;
    yield this.result;
  }
  unwrapOrElse<U>(cb: (e: any) => U): T | U {
    if (this.success) return this.result as T;
    else return cb(this.error);
  }
  unwrapOrElseAwait = async <U>(cb: (e: any) => Promise<U>): Promise<T | U> => {
    if (this.success) return this.result as T;
    else return await cb(this.error);
  }
  static async try<T>(cb: () => Promise<T>): Promise<TryResultType<T>> {
    try {
      const result = await cb();
      return new TryResult(true, undefined, result) as TryResultType<T>;
    } catch (e) {
      return new TryResult(false, e) as TryResultType<T>;
    }
  }
  static async from<T>(cb: T): Promise<TryResultType<Awaited<T>>> {
    try {
      const result = await cb;
      return new TryResult(true, undefined, result) as TryResultType<Awaited<T>>;
    } catch (e) {
      return new TryResult(false, e) as TryResultType<Awaited<T>>;
    }
  }
}