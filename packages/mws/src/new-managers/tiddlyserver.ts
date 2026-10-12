import { SendError, ServerRequest, zod } from "@tiddlywiki/server";
import { randomBytes } from "node:crypto";
import { constants, createWriteStream } from "node:fs";
import { chmod, FileHandle, lstat, open, realpath, rename, rm } from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { hashFile } from "../plugin-cache/PluginCache";

const DEFAULT_MAX_PUT_BYTES = 64 * 1024 * 1024;

export interface PutSaverOptions {
  maxBytes?: number;
  requireIfMatch?: boolean;
}

interface ResolvedPutSaverOptions {
  maxBytes: number;
  requireIfMatch: boolean;
}

export interface FileSystemMount {
  webPath: string;
  folderPath: string;
  putSaver?: boolean | PutSaverOptions;
}

export type FileSystemMounts = FileSystemMount[];

const putSaverOptionsSchema = zod.strictObject({
  maxBytes: zod.number().refine(Number.isSafeInteger, { message: "maxBytes must be a safe integer" }).positive().optional(),
  requireIfMatch: zod.boolean().optional(),
});

const fileSystemMountSchema = zod.strictObject({
  webPath: zod.string().refine(
    path => path === "/" || (
      path.startsWith("/")
      && !path.endsWith("/")
      && !path.includes("//")
      && !!splitRequestPath(path)?.length
    ),
    { message: "webPath must be an absolute normalized URL path" },
  ),
  folderPath: zod.string().min(1),
  putSaver: zod.union([zod.boolean(), putSaverOptionsSchema]).optional(),
});

export const fileSystemMountsSchema = zod.array(fileSystemMountSchema).refine(
  mounts => new Set(mounts.map(mount => mount.webPath)).size === mounts.length,
  { message: "webPath values must be unique" },
);

export function validateFileSystemMounts(mounts: unknown): FileSystemMounts {
  return fileSystemMountsSchema.parse(mounts);
}

export interface ResolvedFileSystemMount {
  root: string;
  path: string;
  putSaver: ResolvedPutSaverOptions | null;
}

function resolvePutSaverOptions(
  options: FileSystemMount["putSaver"],
  webPath: string,
): ResolvedPutSaverOptions | null {
  if (!options) return null;
  const { maxBytes = DEFAULT_MAX_PUT_BYTES, requireIfMatch = true } = typeof options === "object" ? options : {};

  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0)
    throw new Error(`${webPath}.putSaver.maxBytes must be a positive safe integer`);
  if (typeof requireIfMatch !== "boolean")
    throw new Error(`${webPath}.putSaver.requireIfMatch must be a boolean`);

  return {
    maxBytes,
    requireIfMatch,
  };
}

function splitRequestPath(requestPath: string): string[] | null {
  try {
    const segments = requestPath
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);
    return segments.every(segment =>
      segment !== "."
      && segment !== ".."
      && !segment.includes("\0")
      && !segment.includes("/")
      && !segment.includes("\\")
    ) ? segments : null;
  } catch {
    return null;
  }
}



export function resolveFileSystemMount(
  mounts: FileSystemMounts,
  requestPath: string,
): ResolvedFileSystemMount | null {
  const segments = splitRequestPath(requestPath);
  if (!segments) return null;

  const matches = mounts
    .map(mount => ({ mount, segments: splitRequestPath(mount.webPath) }))
    .filter((entry): entry is { mount: FileSystemMount; segments: string[] } => !!entry.segments)
    .filter(entry => entry.segments.every((segment, index) => segments[index] === segment))
    .sort((a, b) => b.segments.length - a.segments.length);
  const match = matches[0];
  if (!match) return null;

  const root = resolve(match.mount.folderPath);
  const path = resolve(root, ...segments.slice(match.segments.length));
  const pathFromRoot = relative(root, path);
  if (pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot))
    return null;

  return {
    root,
    path,
    putSaver: resolvePutSaverOptions(match.mount.putSaver, match.mount.webPath),
  };
}

async function openMountedTarget(path: string): Promise<FileHandle | null> {
  return open(path, constants.O_RDONLY | constants.O_NOFOLLOW).catch(error => {
    if (error?.code === "ENOENT") return null;
    if (error?.code === "ELOOP")
      throw new SendError("ACCESS_DENIED", 403, { reason: "Mounted targets may not be symbolic links" });
    throw error;
  });
}

async function resolveMountRoot(rootPath: string): Promise<string> {
  const root = await realpath(rootPath);
  if (!(await lstat(root)).isDirectory())
    throw new Error(`Filesystem mount root is not a directory: ${rootPath}`);
  return root;
}

export async function serveStaticFile(
  state: ServerRequest<"ignore">,
  mount: ResolvedFileSystemMount,
): Promise<typeof STREAM_ENDED> {
  const root = await resolveMountRoot(mount.root);
  const target = await openMountedTarget(mount.path);
  if (!target) return state.sendEmpty(404);

  try {
    const stat = await target.stat();
    const path = await realpath(mount.path);
    if (!isWithinRoot(root, path))
      throw new SendError("ACCESS_DENIED", 403, { reason: "Mounted path resolves outside its root" });

    const etag = stat.isFile() ? await makeEtag(target) : undefined;

    if (!sameFile(stat, await lstat(path)))
      return state.sendEmpty(409);

    return state.sendFile(200, {
      ...(etag ? { etag } : {}),
      "x-api-access-type": "file",
    }, {
      root: mount.root,
      reqpath: relative(mount.root, mount.path) || ".",
    });
  } finally {
    await target.close().catch(() => undefined);
  }
}

function assertSameOrigin(state: ServerRequest): void {
  const origin = state.headers.get("origin");
  const referer = state.headers.get("referer");
  const fetchSite = state.headers.get("sec-fetch-site");
  const requestOrigin = `${state.assumeHTTPS ? "https" : "http"}://${state.host}`;
  const requestPath = state.pathPrefix + state.urlInfo.pathname;

  try {
    if (fetchSite && fetchSite !== "same-origin")
      throw new Error();
    if (!origin || new URL(origin).origin !== new URL(requestOrigin).origin)
      throw new Error();
    const source = new URL(referer ?? "");
    if (source.origin !== new URL(requestOrigin).origin || source.pathname !== requestPath)
      throw new Error();
  } catch {
    throw new SendError("ACCESS_DENIED", 403, { reason: "PUT source does not match the request URL" });
  }
}

function isWithinRoot(root: string, path: string): boolean {
  const pathFromRoot = relative(root, path);
  return pathFromRoot !== ".." && !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
}

async function makeEtag(file: FileHandle): Promise<string> {
  return `"sha384-${await hashFile(file)}"`;
}

function checkIfMatch(state: ServerRequest, etag: string, required: boolean): "accept" | "missing" | "stale" {
  const ifMatch = state.headers.get("if-match")?.toString();
  if (!ifMatch) return required ? "missing" : "accept";
  return ifMatch.split(",").map(value => value.trim()).some(value => value === "*" || value === etag)
    ? "accept"
    : "stale";
}

function sameFile(a: ART<typeof lstat>, b: ART<typeof lstat>): boolean {
  return a.dev === b.dev
    && a.ino === b.ino
    && a.size === b.size
    && a.mtimeMs === b.mtimeMs
    && a.ctimeMs === b.ctimeMs;
}

class PutSizeLimit extends Transform {
  private bytes = 0;

  constructor(private readonly maxBytes: number) {
    super();
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null, data?: Buffer) => void) {
    this.bytes += chunk.length;
    if (this.bytes > this.maxBytes)
      callback(new PutTooLargeError());
    else
      callback(null, chunk);
  }
}

class PutTooLargeError extends Error {
  constructor() {
    super("PUT request body exceeds the configured limit");
  }
}

export async function saveMountedFile(
  state: ServerRequest<"stream">,
  mount: ResolvedFileSystemMount,
): Promise<typeof STREAM_ENDED> {
  // Only same-origin pages may save, and only when PUT is explicitly enabled for the mount.
  assertSameOrigin(state);
  if (!mount.putSaver)
    throw new SendError("ACCESS_DENIED", 403, { reason: "PUT saver is disabled for this mount" });
  // Reject a declared oversized body before reading it; the stream is limited again below.
  const contentLength = Number(state.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > mount.putSaver.maxBytes)
    return state.sendEmpty(413);

  // Resolve the configured root and open the target without following a final symlink.
  const root = await resolveMountRoot(mount.root);
  const target = await openMountedTarget(mount.path);
  if (!target) return state.sendEmpty(404);

  try {
    // Verify the opened target is a regular file that resolves inside the configured root.
    const stat = await target.stat();
    const path = await realpath(mount.path);
    if (!isWithinRoot(root, path))
      throw new SendError("ACCESS_DENIED", 403, { reason: "Mounted path resolves outside its root" });
    if (!stat.isFile()) {
      return state.sendEmpty(405);
    }

    // make sure we're still working with the same file
    if (!sameFile(stat, await lstat(path)))
      return state.sendEmpty(409);


    // Compute the validator from a stable snapshot, then enforce the client's precondition.
    const etag = await makeEtag(target);
    const ifMatch = checkIfMatch(state, etag, mount.putSaver.requireIfMatch);
    if (ifMatch !== "accept") {
      return state.sendEmpty(ifMatch === "missing" ? 428 : 412);
    }

    // Ensure the temporary file will be created beside the target and still inside the root.
    const parent = await realpath(dirname(path));
    if (!isWithinRoot(root, parent)) {
      throw new SendError("ACCESS_DENIED", 403, { reason: "Mounted file parent resolves outside its root" });
    }
    const extension = extname(path);
    const temporaryPath = resolve(
      parent,
      `.${basename(path, extension)}.${randomBytes(18).toString("base64url")}${extension}`,
    );

    // make sure we're still working with the same file
    if (!sameFile(stat, await lstat(path)))
      return state.sendEmpty(409);


    try {
      const body = state.readStream();
      if (!body) return state.sendEmpty(400);
      // Stream to a new file with an enforced byte limit, preserving the target's permissions.
      await pipeline(
        body,
        new PutSizeLimit(mount.putSaver.maxBytes),
        createWriteStream(temporaryPath, { flags: "wx", mode: stat.mode & 0o777 }),
      );
      await chmod(temporaryPath, stat.mode & 0o777);
      const temporaryFile = await open(temporaryPath, constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        await temporaryFile.sync();
        const savedEtag = await makeEtag(temporaryFile);

        // Replace atomically only if neither the target nor its parent changed during the upload.
        const [latest, latestParent] = await Promise.all([lstat(path), realpath(dirname(path))]);
        if (!sameFile(stat, latest) || latestParent !== parent)
          return state.sendEmpty(412);
        await rename(temporaryPath, path);

        return state.sendEmpty(200, {
          etag: savedEtag,
          "x-api-access-type": "file",
        });
      } finally {
        await temporaryFile.close();
      }
    } catch (error) {
      if (error instanceof PutTooLargeError)
        return state.sendEmpty(413);
      throw error;
    } finally {
      await rm(temporaryPath, { force: true }).catch(() => undefined);
    }
  } finally {
    await target.close().catch(() => undefined);
  }
}

export async function fileSystemMountHandler(
  state: ServerRequest<"stream"> | ServerRequest<"ignore">,
  mounts: FileSystemMounts,
  path: string
): Promise<typeof STREAM_ENDED> {
  const mount = resolveFileSystemMount(mounts, path);
  if (!mount) return state.sendEmpty(404);

  switch (state.method) {
    case "GET":
    case "HEAD":
      return serveStaticFile(state as ServerRequest<"ignore">, mount);
    case "PUT":
      return saveMountedFile(state as ServerRequest<"stream">, mount);
    case "OPTIONS":
      return state.sendEmpty(204, {
        allow: mount.putSaver ? "GET, HEAD, PUT, OPTIONS" : "GET, HEAD, OPTIONS",
        ...(mount.putSaver ? { dav: "tw5/put" } : {}),
      });
    default:
      return state.sendEmpty(405);
  }
}

