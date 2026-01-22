import { MultipartPart } from "@mjackson/multipart-parser";
import { BodyFormat, JsonValue, SendError, tryParseJSON, UserError, zod, ZodRoute, ZodState } from "@tiddlywiki/server";
import { createHash, Hash } from "crypto";
import { createWriteStream, mkdirSync, rmSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { Writable } from "stream";
import { TiddlerFields } from "tiddlywiki";


export interface WikiRoute<
  M extends string,
  B extends BodyFormat,
  P extends Record<string, zod.ZodType<any, string | undefined>>,
  Q extends Record<string, zod.ZodType<any, string[] | undefined>>,
  T extends zod.ZodTypeAny,
  R extends JsonValue
> extends ZodRoute<M, B, P, Q, T, R> {
  routeType: "wiki" | "recipe" | "bag";
  routeName: string;
}

export const BAG_PREFIX = "/bag";
export const RECIPE_PREFIX = "/recipe";
export const WIKI_PREFIX = "/wiki";

export function parseTiddlerFields(input: string, ctype: string | undefined) {

  if (ctype?.startsWith("application/json"))
    return tryParseJSON<any>(input);

  if (ctype?.startsWith("application/x-mws-tiddler")) {
    //https://jsperf.app/mukuro
    // for a big text field (100k random characters)
    // splitting the string is 1000x faster!
    // but I don't really trust getFieldStringBlock 
    // because it doesn't check for fields with colon names
    // in fact, the behavior of the file system adapter when it 
    // encounters invalid field names is just to use JSON anyway.

    const headerEnd = input.indexOf("\n\n");
    if (headerEnd === -1) return tryParseJSON<any>(input);
    const header = input.slice(0, headerEnd);
    const body = input.slice(headerEnd + 2);

    const fields = tryParseJSON<any>(header);
    if (!fields) return undefined;
    fields.text = body;
    return fields;
  }
}


export async function recieveTiddlerMultipartUpload(state: ZodState<"POST", "stream", any, any, zod.ZodTypeAny>) {

  // Process the incoming data
  const inboxName = new Date().toISOString().replace(/:/g, "-");
  const inboxPath = resolve(state.config.storePath, "inbox", inboxName);
  mkdirSync(inboxPath, { recursive: true });

  const parts: MultipartPart[] = [];

  interface UploadPart2 {
    inboxFilename?: string;
    value?: string;
    hasher?: Hash;
    length: number;
    fileStream?: Writable;
    hash?: string;
  }

  const incomingParts = new WeakMap<MultipartPart, UploadPart2>();
  const inboxFiles = new WeakMap<MultipartPart, string>();
  const valueParts = new WeakMap<MultipartPart, string>();

  await state.readMultipartData({
    cbPartStart: async function (part) {
      const part2: UploadPart2 = {
        hasher: createHash("sha-256"),
        length: 0,
      };

      if (part.filename) {
        const inboxFilename = (parts.length).toString();
        const inboxFilename2 = resolve(inboxPath, inboxFilename);
        part2.fileStream = createWriteStream(inboxFilename2);
        inboxFiles.set(part, inboxFilename2);
      } else {
        part2.value = "";
      }

    },
    cbPartChunk: async function (part, chunk) {
      const part2 = incomingParts.get(part)!;
      if (part2.fileStream) {
        await new Promise<void>((res) => {
          part2.fileStream!.write(chunk) ? res() : part2.fileStream!.once("drain", () => res());
        });
      } else {
        const encoding = part.headers.get("content-type")?.charset || "utf8";
        if (!Buffer.isEncoding(encoding)) {
          throw new SendError("MULTIPART_INVALID_PART_ENCODING", 400, {
            partIndex: parts.length,
            partEncoding: encoding,
          });
        }
        part2.value! += chunk.toString(encoding as BufferEncoding);
      }
      part2.length += chunk.length;
      part2.hasher!.update(chunk);
    },
    cbPartEnd: async function (part) {
      const part2 = incomingParts.get(part)!;

      if (part2.fileStream) part2.fileStream.end();
      else valueParts.set(part, part2.value ?? "");

      part2.hash = part2.hasher!.digest("base64url");
      part2.fileStream = undefined;
      part2.hasher = undefined;
      incomingParts.delete(part);
      parts.push(part);
    },
  });

  const partFile = parts.find(part => part.name === "file-to-upload" && !!part.filename);

  if (!partFile) throw state.sendSimple(400, "Missing file to upload");

  const missingfilename = "File uploaded " + new Date().toISOString();

  const type = partFile.headers.get("content-type")?.mediaType;
  const tiddlerFields: TiddlerFields = { title: partFile.filename ?? missingfilename, type, };

  for (const part of parts) {
    const tiddlerFieldPrefix = "tiddler-field-";
    if (part.name?.startsWith(tiddlerFieldPrefix)) {
      const name = part.name.slice(tiddlerFieldPrefix.length);
      const value = valueParts.get(part)?.trim() ?? "";
      (tiddlerFields as any)[name] = value;
    }
  }

  const contentTypeInfo = state.config.getContentType(type);

  const file = await readFile(inboxFiles.get(partFile)!);

  tiddlerFields.text = file.toString(contentTypeInfo.encoding as BufferEncoding);

  rmSync(inboxPath, { recursive: true, force: true });

  return tiddlerFields;
}

export function rethrow<T>(cb: () => T, message: string) {
  try {
    return cb();
  } catch (e) {
    if (e instanceof UserError) throw e;
    throw new UserError(message);
  }
}