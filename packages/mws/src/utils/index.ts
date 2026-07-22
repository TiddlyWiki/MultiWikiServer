
// export * from "./data-checks";

import { Readable } from "stream";

/** Accepts a mix of Buffer and Readable, emitting their contents in order, returning a Readable */
export function readableBuffers(sources: (Readable | Buffer)[]) {
  return Readable.from(async function* () {
    for (const src of sources) {
      if (Buffer.isBuffer(src)) yield src;
      else yield* src;
    }
  }(), { objectMode: false })
}


