const utf8 = new TextEncoder()

class Base64Encoder {
  encode(buf: ArrayBuffer | Uint8Array) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    if (typeof bytes.toBase64 === 'function') {
      return bytes.toBase64({ alphabet: 'base64url', omitPadding: true })
    }
    let s = ''
    for (let i = 0, CHUNK = 0x8000; i < bytes.length; i += CHUNK) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[])
    }
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  decode(str: string) {
    if (typeof Uint8Array.fromBase64 === 'function') {
      return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'strict' })
    }
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))

    // const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    // const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    // const bin = atob(padded) // can't throw after the regex and length checks
    // const bytes = new Uint8Array(bin.length)
    // for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  }
}


export const b64 = new Base64Encoder()


export class SignData {

  // Import raw key bytes (or a secret string) as an HMAC key
  static async importKey(secret: string | Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
    const raw = typeof secret === 'string' ? b64.decode(secret) : secret
    return crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
  }

  constructor(private key: CryptoKey) { }

  async encode(message: string) {
    return b64.encode(await crypto.subtle.sign('HMAC', this.key, utf8.encode(message)))
  }
  async decode(message: string, signature: string) {
    try {
      return await crypto.subtle.verify('HMAC', this.key, b64.decode(signature), utf8.encode(message))
    } catch (e) {
      return false;
    }
  }
}



// Usage
// const key = await importKey(crypto.getRandomValues(new Uint8Array(32)))
// const sig = await sign('hello world', key)
// console.log(await verify('hello world', sig, key))   // true
// console.log(await verify('hello world!', sig, key))  // false

declare global {

  interface Uint8Array<TArrayBuffer extends ArrayBufferLike> {
    /**
     * Converts the `Uint8Array` to a base64-encoded string.
     * @param options If provided, sets the alphabet and padding behavior used.
     * @returns A base64-encoded string.
     */
    toBase64?(
      options?: {
        alphabet?: "base64" | "base64url" | undefined;
        omitPadding?: boolean | undefined;
      },
    ): string;

    /**
     * Sets the `Uint8Array` from a base64-encoded string.
     * @param string The base64-encoded string.
     * @param options If provided, specifies the alphabet and handling of the last chunk.
     * @returns An object containing the number of bytes read and written.
     * @throws {SyntaxError} If the input string contains characters outside the specified alphabet, or if the last
     * chunk is inconsistent with the `lastChunkHandling` option.
     */
    setFromBase64?(
      string: string,
      options?: {
        alphabet?: "base64" | "base64url" | undefined;
        lastChunkHandling?: "loose" | "strict" | "stop-before-partial" | undefined;
      },
    ): {
      read: number;
      written: number;
    };

    /**
     * Converts the `Uint8Array` to a base16-encoded string.
     * @returns A base16-encoded string.
     */
    toHex?(): string;

    /**
     * Sets the `Uint8Array` from a base16-encoded string.
     * @param string The base16-encoded string.
     * @returns An object containing the number of bytes read and written.
     */
    setFromHex?(string: string): {
      read: number;
      written: number;
    };
  }

  interface Uint8ArrayConstructor {
    /**
     * Creates a new `Uint8Array` from a base64-encoded string.
     * @param string The base64-encoded string.
     * @param options If provided, specifies the alphabet and handling of the last chunk.
     * @returns A new `Uint8Array` instance.
     * @throws {SyntaxError} If the input string contains characters outside the specified alphabet, or if the last
     * chunk is inconsistent with the `lastChunkHandling` option.
     */
    fromBase64?(
      string: string,
      options?: {
        alphabet?: "base64" | "base64url" | undefined;
        lastChunkHandling?: "loose" | "strict" | "stop-before-partial" | undefined;
      },
    ): Uint8Array<ArrayBuffer>;

    /**
     * Creates a new `Uint8Array` from a base16-encoded string.
     * @returns A new `Uint8Array` instance.
     */
    fromHex?(
      string: string,
    ): Uint8Array<ArrayBuffer>;
  }
}