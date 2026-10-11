
import * as crypto from "crypto";
import * as path from "path";
import { mapGetInit } from "../new-managers/wiki-utils";
import { FileHandle, open, readdir, readFile, stat } from "fs/promises";
import { importPlugins } from "./importPlugins";
import { existsSync } from "fs";
import { TiddlerFields } from "tiddlywiki";
import { SendError } from "@tiddlywiki/server";

function pluginHashesFactory(wikiPath: string) {
  const tiddlerHashesStore = new Map<string, TiddlerHasher>();
  function pluginHashes(arrayString: string) {
    return mapGetInit(
      tiddlerHashesStore, arrayString,
      () => new TiddlerHasher(arrayString, path.join(wikiPath, "cache")),
    );
  }
  pluginHashes.toJSON = () => {
    return Object.fromEntries(tiddlerHashesStore.entries());
  };
  pluginHashes.toArray = () => {
    return Array.from(tiddlerHashesStore.entries());
  }
  return pluginHashes;
}

export type PluginHashes = ART<typeof pluginHashesFactory>;

export class PluginCache {

  pluginHashes: PluginHashes;

  constructor(
    public wikiPath: string,
    public cacheArrayStrings: readonly string[],
    public versions: string[],
  ) {
    this.pluginHashes = pluginHashesFactory(wikiPath);
  }

  pluginPaths = new DeepMap<[version: string, title: string], [path: string]>();
  pluginPathsInfo = new Map<string, { version: string; title: string; path: string; name: string; desc: string; }>();
  get pluginsList() { return Array.from(this.pluginPathsInfo.values()) }
  get latestVersion() { return this.versions.slice(-1)[0]; }

  versionFromTemplate(version: string | null | undefined) {
    /* @deprecated - version 0.2 */
    if (version?.startsWith("tw5-")) version = version.slice(4);
    return version || this.latestVersion;
  }

  getHashForTitle(version: string, preloader: string, title: string) {
    const path = this.pluginPaths.get(version, title);
    return path && this.pluginHashes(preloader)?.get(path);
  }

  async assertTitleHashes(preloader: string, version: string, titles: string[]) {
    for (const title of titles) {
      const relPath = this.pluginPaths.get(version, title);
      if (!relPath)
        throw new Error("unable to find plugin path for plugin: " + title);
      const hasher = this.pluginHashes(preloader);
      if (!hasher.get(relPath))
        await hasher.hashPluginFromFile(relPath);
    }
  }
  async assertPathHashes(preloader: string, paths: string[]) {
    for (const relPath of paths) {
      const hasher = this.pluginHashes(preloader);
      if (!hasher.get(relPath))
        await hasher.hashPluginFromFile(relPath);
    }
  }

  async readTW5Docs(version: string) {
    if (!(await readdir(path.resolve(this.wikiPath, "cache", "tiddlywiki"))).includes(version))
      throw new SendError("TW5DOCS_NOT_FOUND", 404, null);
    const tw5DocsPath = path.resolve(this.wikiPath, "cache", "tiddlywiki", version, "docs.json");
    if (!existsSync(tw5DocsPath))
      throw new SendError("TW5DOCS_NOT_FOUND", 404, null)
    return JSON.parse(await readFile(tw5DocsPath, "utf8")) as {
      plugins: string[];
      tiddlers: TiddlerFields[];
      version: string;
    };
  }

}

export class TiddlerHasher {
  get prefix() { return Buffer.from(`${this.arrayString}(`, "utf8") }
  get suffix() { return Buffer.from(`);`, "utf8"); }
  /** map of title to hash */
  private tiddlerHashes = new Map<string, string>();
  toJSON() { return Object.fromEntries(this.tiddlerHashes.entries()); }
  constructor(public arrayString: string, private cachePath: string) { }

  get(relPath: string) {
    return this.tiddlerHashes.get(relPath);
  }

  hashPluginFromBufferSync(relPath: string, json: Buffer) {
    const hash = crypto.createHash("sha384")
      .update(this.prefix)
      .update(json)
      .update(this.suffix)
      .digest("base64");
    this.tiddlerHashes.set(relPath, "sha384-" + hash);
    return hash;
  }
  async hashPluginFromFile(relPath: string) {
    const hasher = crypto.createHash("sha384");
    const jsonPath = path.join(this.cachePath, relPath, "plugin.json");
    if (!existsSync(jsonPath)) throw new FileNotFoundError(jsonPath);
    hasher.update(this.prefix);
    await createFileChunkHasher(jsonPath, hasher, 512 * 1024)
    hasher.update(this.suffix);
    const hash = hasher.digest("base64");
    this.tiddlerHashes.set(relPath, "sha384-" + hash);
  }
}

export class FileNotFoundError extends Error {
  constructor(public filepath: string) {
    super("File not found: " + filepath);
  }
}

export interface PluginDefinition {
  path: string;
  oldPath: string;
  hashes: readonly string[];
  name: string;
  description: string;
  reportedVersion: string;
  title: string;
  pluginType: "plugin" | "theme" | "language";
  dependents: string;
  author: string;
  contentType: string | undefined;
  type: "system" | "installed";
  twVersion: string;
}



const defaultFileChunkSize = 64 * 1024;
/** Read a file, reusing the same buffer for every block to save GC. */
async function* createFileChunkReader<T extends { update: (buf: Buffer) => T }>(filepath: string, hasher: T, chunkSize?: number): AsyncGenerator<Buffer, void, undefined> {
  const s = await stat(filepath);
  const resolvedChunkSize = chunkSize ?? Math.max(s.blksize || 0, defaultFileChunkSize);
  if (!Number.isInteger(resolvedChunkSize) || resolvedChunkSize <= 0) {
    throw new RangeError("chunkSize must be a positive integer");
  }
  const fd = await open(filepath, "r");
  try {
    while (true) {
      const chunk = Buffer.allocUnsafe(resolvedChunkSize);
      const { bytesRead } = await fd.read(chunk, 0, resolvedChunkSize, null);
      if (bytesRead === 0) { return; }
      yield bytesRead === resolvedChunkSize ? chunk : chunk.subarray(0, bytesRead);
    }
  } finally {
    await fd.close();
  }
}


async function createFileChunkHasher<T extends { update: (buf: Buffer) => T }>(file: string | FileHandle, hasher: T, chunkSize?: number) {
  const s = typeof file === "string" ? await stat(file) : await file.stat();
  const resolvedChunkSize = chunkSize ?? Math.max(s.blksize || 0, defaultFileChunkSize);
  if (!Number.isInteger(resolvedChunkSize) || resolvedChunkSize <= 0) {
    throw new RangeError("chunkSize must be a positive integer");
  }
  const fd = typeof file === "string" ? await open(file, "r") : file;
  try {
    let position = 0;
    const chunk = Buffer.allocUnsafe(resolvedChunkSize);
    while (true) {
      const { bytesRead } = await fd.read(chunk, 0, resolvedChunkSize, position);
      if (bytesRead === 0) { return; }
      hasher.update(chunk.subarray(0, bytesRead));
      position += bytesRead;
    }
  } finally {
    if (typeof file === "string")
      await fd.close();
  }
}

/** Read a file, reusing the same buffer for every block to save GC. */
export async function hashFile(file: string | FileHandle) {
  const hasher = crypto.createHash("sha384");
  await createFileChunkHasher(file, hasher, 512 * 1024)
  return hasher.digest("base64");
}

class DeepMap<K extends any[], V extends [any]> {
  #map = new Map();
  clear(): void {
    this.#map.clear()
  }
  delete(...keys: K): boolean {
    let level = this.#map;
    for (let i = 0; i < keys.length; i++) {
      if (i < keys.length - 1)
        level = mapGetInit(level, keys[i], () => new Map());
      else
        return level.delete(keys[i]);
    }
    return false;
  }
  get(...keys: K): V[0] | undefined {
    let level = this.#map;
    for (let i = 0; i < keys.length; i++) {
      if (i < keys.length - 1)
        level = mapGetInit(level, keys[i], () => new Map());
      else
        return level.get(keys[i]);
    }
    return undefined;
  }
  has(...keys: K): boolean {
    let level = this.#map;
    for (let i = 0; i < keys.length; i++) {
      if (i < keys.length - 1)
        level = mapGetInit(level, keys[i], () => new Map());
      else
        return level.has(keys[i]);
    }
    return false;
  }
  set(...args: [...K, ...value: V]): this {
    let level = this.#map;
    const value = args.pop();
    for (let i = 0; i < args.length; i++) {
      if (i < args.length - 1)
        level = mapGetInit(level, args[i], () => new Map());
      else
        level.set(args[i], value);
    }
    return this;
  }
  getInit(...args: [...K, init: () => V[0]]): this {
    let level = this.#map;
    const init = args.pop() as () => V[0];
    for (let i = 0; i < args.length; i++) {
      if (i < args.length - 1)
        level = mapGetInit(level, args[i], () => new Map());
      else
        return mapGetInit(level, args[i], init);
    }
    throw new Error("This should never throw.");
  }
}
