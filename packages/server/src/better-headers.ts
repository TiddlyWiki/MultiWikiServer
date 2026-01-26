import {
  Accept,
  AcceptEncoding,
  AcceptLanguage,
  CacheControl,
  ContentDisposition,
  ContentRange,
  ContentType,
  IfMatch,
  IfNoneMatch,
  Range,
  SetCookie,
  Vary,
  IfRange,
} from "@remix-run/headers";


import * as http from "http";
import * as http2 from "http2";
import { is } from "./utils";

interface SuperHeadersMap {
  "accept"?: Accept
  "accept-encoding"?: AcceptEncoding
  "accept-language"?: AcceptLanguage
  "cache-control"?: CacheControl
  "content-disposition"?: ContentDisposition
  "content-range"?: ContentRange
  "content-type"?: ContentType
  "cookie": BetterCookie
  "if-match"?: IfMatch
  "if-none-match"?: IfNoneMatch
  "range"?: Range
  "set-cookie"?: SetCookie
  "vary"?: Vary
}

type NormalHeaders = {
  [k in keyof http.IncomingHttpHeaders as (
    string extends k ? never : k extends keyof SuperHeadersMap ? never : k
  )]?: http.IncomingHttpHeaders[k]
}

export interface BetterHeadersData extends SuperHeadersMap, NormalHeaders { }
/**
 * A class that provides enhanced functionality for handling HTTP headers.
 * 
 * Always ignores the four http2 headers: :scheme, :method, :path, :authority
 */
export class BetterHeaders {
  headers: BetterHeadersData;
  constructor(headers: http.IncomingHttpHeaders | http2.IncomingHttpHeaders | [string, string][] | Headers) {
    this.headers = {} as any;
    if (headers instanceof Headers)
      for (let [key, value] of headers.entries())
        this.initHeader(key, value);
    else if (Array.isArray(headers))
      for (let [key, value] of headers)
        this.initHeader(key, value);
    else
      for (let [key, value] of Object.entries(headers))
        this.initHeader(key, value);
    
    if(!this.headers.cookie)
      this.headers.cookie = new BetterCookie();
  }
  initHeader(key: string, value: string | string[] | undefined) {
    key = key.toLowerCase();
    if ([":scheme", ":method", ":path", ":authority"].includes(key)) return;
    if (key === "set-cookie") {
      const existing = this.headers[key];
      const newvalue = Array.isArray(value) ? value : [value];
      if (existing === undefined) {
        this.headers[key] = newvalue.map(v => new SetCookie(v));
      } else {
        (existing as SetCookie[]).push(...newvalue.map(v => new SetCookie(v)));
      }
    } else if ((this.headers as any)[key]) {
      console.warn(new Error(`Header ${key} is already set`).stack);
    } else if (typeof value !== "string") {
      console.warn(new Error(`Header ${key} is not a string`).stack);
    } else if (is<keyof SuperHeadersMap>(key, key in superHeaderClasses)) {
      (this.headers as any)[key] = new superHeaderClasses[key](value);
    } else {
      (this.headers as any)[key] = value;
    }
  }
  get<T extends string & keyof BetterHeadersData>(key: T): BetterHeadersData[T];
  get(key: string): string | undefined;
  get(key: string) { return this.headers[key as keyof BetterHeadersData]; }
  * entries(): IterableIterator<[string, string | string[] | undefined]> {
    for (const [key, value] of Object.entries(this.headers)) {
      if (value === undefined) continue;
      if (key in superHeaderClasses) {
        if (key === "set-cookie") {
          yield [key, (value as SetCookie[]).map(v => v.toString())];
        } else {
          yield [key, (value as any).toString()];
        }
      } else {
        yield [key, value as any];
      }
    }
  }
  *[Symbol.iterator](): IterableIterator<[string, string | string[] | undefined]> {
    yield* this.entries();
  }
  toObject(): http.IncomingHttpHeaders {
    const obj: http.IncomingHttpHeaders = {};
    for (const [key, value] of Object.entries(this.headers)) {
      if (value === undefined) continue;
      if (key in superHeaderClasses) {
        if (key === "set-cookie") {
          obj[key] = (value as SetCookie[]).map(v => v.toString());
        } else {
          obj[key] = (value as any).toString();
        }
      } else {
        obj[key] = value as any;
      }
    }
    return obj;
  }
}

export class BetterCookie extends URLSearchParams {
  constructor(cookieString?: string) {
    super();
    if (cookieString) {
      const pairs = cookieString.split(/;\s*/);
      for (const pair of pairs) {
        const eqIdx = pair.indexOf("=");
        if (eqIdx === -1) continue;
        const name = pair.slice(0, eqIdx).trim();
        const value = pair.slice(eqIdx + 1).trim();
        this.append(name, value);
      }
    }
  }
  /**
   * Returns the string representation of the header value.
   *
   * @returns The header value as a string
   */
  toString(): string {
    let pairs: string[] = []

    for (let [name, value] of this) {
      pairs.push(`${name}=${quote(value)}`)
    }

    return pairs.join('; ')
  }
  /**
   * Parse a Cookie header value.
   *
   * @param value The header value (string, init object, or null)
   * @returns A Cookie instance (empty if null)
   */
  static from(value: string | Iterable<[string, string]> | Record<string, string> | null): BetterCookie {
    let header = new BetterCookie()

    if (value !== null) {
      if (typeof value === 'string') {
        let params = BetterCookie.parseParams(value)
        for (let [name, val] of params) {
          header.append(name, val ?? '')
        }
      } else if (isIterable(value)) {
        for (let [name, val] of value) {
          header.append(name, val)
        }
      } else {
        for (let name of Object.getOwnPropertyNames(value)) {
          header.append(name, value[name])
        }
      }
    }

    return header
  }

  static parseParams(
    input: string,
    delimiter: ';' | ',' = ';',
  ): [string, string | undefined][] {
    // This parser splits on the delimiter and unquotes any quoted values
    // like `filename="the\\ filename.txt"`.
    let parser =
      delimiter === ';'
        ? /(?:^|;)\s*([^=;\s]+)(\s*=\s*(?:"((?:[^"\\]|\\.)*)"|((?:[^;]|\\\;)+))?)?/g
        : /(?:^|,)\s*([^=,\s]+)(\s*=\s*(?:"((?:[^"\\]|\\.)*)"|((?:[^,]|\\\,)+))?)?/g

    let params: [string, string | undefined][] = []

    let match
    while ((match = parser.exec(input)) !== null) {
      let key = match[1].trim()

      let value: string | undefined
      if (match[2]) {
        value = (match[3] || match[4] || '').replace(/\\(.)/g, '$1').trim()
      }

      params.push([key, value])
    }

    return params
  }
}

function quote(value: string): string {
  if (value.includes('"') || value.includes(';') || value.includes(' ')) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return value
}

function isIterable<T>(value: any): value is Iterable<T> {
  return value != null && typeof value[Symbol.iterator] === 'function'
}



const superHeaderClasses: { [K in keyof SuperHeadersMap]-?: { new(value: string): SuperHeadersMap[K] } } = {
  "accept": Accept,
  "accept-encoding": AcceptEncoding,
  "accept-language": AcceptLanguage,
  "cache-control": CacheControl,
  "content-disposition": ContentDisposition,
  "content-range": ContentRange,
  "content-type": ContentType,
  "cookie": BetterCookie,
  "if-match": IfMatch,
  "if-none-match": IfNoneMatch,
  "range": Range,
  "set-cookie": SetCookie,
  "vary": Vary,
}
