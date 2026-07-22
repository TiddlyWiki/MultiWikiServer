
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { TW } from "tiddlywiki";
import { createGzip } from "zlib";
import { mapGetInit } from "../new-managers";
import { open, readdir, stat } from "fs/promises";
import { WikiPluginCache } from ".";
import { readableBuffers } from "../utils";
import { BodyFormat, checkPath, checkQueryKeys, dist_resolve, ServerRequest } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { PassThrough, Readable } from "stream";
import { pipeline } from "stream/promises";

export const defaultPreloadFunction = "$tw.preloadTiddler";

serverEvents.on("mws.routes", (root, config) => {
  root.defineRoute({
    method: ["GET", "HEAD"],
    path: /^\/\$cache\/(?<plugin>.*)\/plugin\.js$/,
    bodyFormat: "ignore",
  }, async (state: ServerRequest<BodyFormat, string, unknown>) => {
    checkPath(state, z => ({ plugin: z.string() }), new Error());
    checkQueryKeys(state, ["cb"], new Error());
    const arrayString = state.query.get("cb") ?? defaultPreloadFunction;

    const pluginFolder = path.resolve(config.wikiPath, "cache", state.pathParams.plugin);
    if (path.relative(path.resolve(config.wikiPath, "cache"), pluginFolder).startsWith(".."))
      throw new Error("Parent path access detected");

    const plugin = state.pluginCache.filePlugins.get(state.pathParams.plugin);
    if (!plugin) throw state.sendEmpty(404, { "x-reason": "Plugin not found" });

    const hasher = state.pluginCache.pluginHashes(arrayString);
    await hasher.assertTitles(state.pluginCache, [plugin]);

    const etag = `"${hasher.get(plugin)}"`;

    // maxage covers preload, staleWhileRevalidate allows a second refresh to clear up stale data
    state.applyHeaders({
      contentType: "application/javascript",
      cacheControl: { public: true, maxAge: 6, staleWhileRevalidate: 86400 },
      etag
    });

    const match = state.headers.ifNoneMatch.has(etag);
    if (match) throw state.sendEmpty(304, { "x-reason": "Etag Match" });

    const accepts = ["gzip", "identity"].find(enc => state.headers.acceptEncoding.accepts(enc));

    const fileIndex = state.pluginCache.cacheArrayStrings.indexOf(arrayString);
    // setting this will disable the server gzip streaming so we save CPU cycles
    const useGzip = accepts === "gzip";

    const fileStream = fs.createReadStream(path.join(pluginFolder, "plugin.json"));

    const { prefix, suffix } = hasher;
    if (fileIndex === -1 || !useGzip) {
      state.writeHead(200, useGzip ? { contentEncoding: "gzip" } : {});
      await pipeline(
        readableBuffers([prefix, fileStream, suffix]),
        useGzip ? createGzip() : new PassThrough(),
        state.writer,
      );
      return STREAM_ENDED;
    } else {
      const pluginFile = pluginFolder + "/plugin." + fileIndex + ".js.gz";
      const s = await stat(pluginFile);
      return state.sendStream(200, {
        contentEncoding: "gzip",
        contentLength: s.size,
        vary: ["Accept-Encoding"],
      }, fs.createReadStream(pluginFile));
    }
  })
})


export async function importPlugins(
  twFolder: string,
  cacheFolder: string,
  type: string,
  $tw: TW,
  mwsVersion: string,
  arrayStrings: readonly string[]) {


  const readLevel = (d: string) => {
    return (fs.readdirSync(path.join(twFolder, d)))
      .filter(e => !$tw.boot.excludeRegExp.test(e))
      .map(e => path.join(d, e));
  };

  const plugins = [
    ...[
      ...[
        'plugins', 'themes'
      ].flatMap(readLevel),
      'languages'
    ].flatMap(readLevel),
    'core'
  ].map(e => {
    const oldPath = path.join(twFolder, e);
    const relativePluginPath = path.join("tiddlywiki", $tw.version, path.relative(twFolder, oldPath));
    return [oldPath, relativePluginPath] as const;
  });

  const mwsRelative = `mws/${mwsVersion}/client`;
  plugins.push([dist_resolve("../plugins/client"), mwsRelative] as const);

  const bootTiddlers = $tw.loadTiddlersFromPath($tw.boot.bootPath).map(e => e.tiddlers).flat();
  const bootFile = path.join(cacheFolder, "tiddlywiki", $tw.version, "boot.json");
  fs.mkdirSync(path.dirname(bootFile), { recursive: true });
  if (!fs.existsSync(bootFile))
    fs.writeFileSync(bootFile, JSON.stringify(bootTiddlers, null, 2));


  // it is recommended to add <link rel="preload" to the header since these cannot be deferred
  // <link rel="preload" href="main.js" as="script" integrity="..." crossorigin="anonymous" />
  // and recommended to specify the hashes for each file in their script tag. 
  // <cript
  //   src="https://example.com/example-framework.js"
  //   integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  //   crossorigin="anonymous"></script>
  // this needs to be added to the tiddlywiki file before the script tags
  // $tw = Object.create(null);
  // $tw.preloadTiddlers = $tw.preloadTiddlers || [];
  // $tw.preloadTiddler = function(fields) {
  //   $tw.preloadTiddlers.push(fields);
  // };
  const pluginInfoKeys = new Set<string>();
  const pluginsList: PluginDefinition[] = [];
  /** Map of "title" to "dirname of plugin.json relative to cache folder" */
  const tiddlerFiles = new Map<string, string>();
  const tiddlerHashesStore = new Map<string, TiddlerHasher>();
  function tiddlerHashes(arrayString: string) {
    return mapGetInit(tiddlerHashesStore, arrayString, () => new TiddlerHasher(arrayString));
  }
  tiddlerHashes.toJSON = () => {
    return Object.fromEntries(tiddlerHashesStore.entries());
  };

  await Readable.from(plugins).map(async ([oldPath, relativePluginPath]) => {
    const plugin = $tw.loadPluginFolder(oldPath);
    Object.keys(plugin).forEach(e => pluginInfoKeys.add(e));
    const newPath = path.join(cacheFolder, relativePluginPath);
    fs.mkdirSync(newPath, { recursive: true });
    if (!(plugin && plugin.title && plugin.text)) {
      console.log("Info: No plugin found at", oldPath);
      return;
    }
    if (relativePluginPath === mwsRelative) {
      plugin.version = mwsVersion;
    }

    Object.keys(plugin).forEach(e => {
      if (plugin[e] !== undefined && typeof plugin[e] !== "string") {
        // before, this was handled by the database making sure all field values were strings
        plugin[e] = `${plugin[e]}`;
        if (process.env.ENABLE_DEV_SERVER)
          console.log(`DEV: Tiddler ${plugin.title} field ${e} was not a string`);
      }
    });

    if (type === "server") {
      // this is for tiddlywiki itself to use, if desired
      plugin.tiddlers = JSON.parse(plugin.text).tiddlers;
      delete plugin.text;
      fs.writeFileSync(path.join(newPath, "plugin.info"), JSON.stringify(plugin));
    } else if (type === "client") {
      const jsonFile = path.join(newPath, "plugin.json");
      const json = Buffer.from(JSON.stringify(plugin).replace(/<\//gi, "\\u003c/"), "utf8");
      const jsonHash = crypto.createHash("sha384").update(json).digest("base64");
      const writeFiles = !fs.existsSync(jsonFile) || await hashFile(jsonFile) !== jsonHash;
      if (writeFiles) {
        console.log("writing", jsonFile);
        fs.writeFileSync(jsonFile, json);
      }

      const hashes = await Promise.all(arrayStrings.map(async (arrayString, index) => {
        const hasher = tiddlerHashes(arrayString);
        const { prefix, suffix } = hasher;
        const gzpath = path.join(newPath, "plugin." + index + ".js.gz");
        const hash = hasher.hashPluginFromBufferSync(plugin.title, json);
        if (writeFiles) {
          await pipeline(
            readableBuffers([prefix, json, suffix]),
            createGzip(),
            fs.createWriteStream(gzpath)
          ).catch(e => {
            console.log("Error writing file", gzpath, e);
          });
        }
        return hash;
      }));

      tiddlerFiles.set(plugin.title, relativePluginPath);

      pluginsList.push({
        path: relativePluginPath,
        hashes,
        name: plugin.name,
        description: plugin.description,
        reportedVersion: plugin.version,
        title: plugin.title,
        pluginType: plugin["plugin-type"],
        dependents: plugin.dependents,
        author: plugin.author,
        contentType: plugin.type,
        type: "system"
      });
    }
  }).toArray();

  fs.writeFileSync(path.join(cacheFolder, "tiddlywiki-plugins.json"), JSON.stringify(pluginsList, null, 2));

  return { tiddlerFiles, tiddlerHashes, pluginsList };

}




export class TiddlerHasher {
  static async assertTitleHashes(cache: WikiPluginCache, arrayString: string, titles: string[]) {
    const hasher = cache.pluginHashes(arrayString);
    await hasher.assertTitles(cache, titles);
  }
  get prefix() { return Buffer.from(`${this.arrayString}(`, "utf8") }
  get suffix() { return Buffer.from(`);`, "utf8"); }
  private tiddlerHashes = new Map<string, string>();
  toJSON() { return Object.fromEntries(this.tiddlerHashes.entries()); }
  constructor(public arrayString: string) { }
  async assertTitles(cache: WikiPluginCache, titles: string[]) {
    return await Promise.all(titles.map(async title => {
      const folder = cache.pluginFiles.get(title);
      if (!folder)
        throw new Error("unable to find plugin path for plugin: " + title);
      if (!this.get(title))
        await this.hashPluginFromFile(title, path.join(cache.cachePath, folder));
    }));
  }
  get(title: string) {
    return this.tiddlerHashes.get(title);
  }
  hashPluginFromBufferSync(title: string, json: Buffer) {
    const hash = crypto.createHash("sha384")
      .update(this.prefix)
      .update(json)
      .update(this.suffix)
      .digest("base64");
    this.tiddlerHashes.set(title, "sha384-" + hash);
    return hash;
  }
  async hashPluginFromFile(title: string, newPath: string) {
    const hasher = crypto.createHash("sha384");
    const jsonPath = path.join(newPath, "plugin.json");
    hasher.update(this.prefix);
    await createFileChunkHasher(jsonPath, hasher, 512 * 1024)
    hasher.update(this.suffix);
    const hash = hasher.digest("base64");
    this.tiddlerHashes.set(title, "sha384-" + hash);
  }
}

export interface PluginDefinition {
  path: string;
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

async function createFileChunkHasher<T extends { update: (buf: Buffer) => T }>(filepath: string, hasher: T, chunkSize?: number) {
  const s = await stat(filepath);
  const resolvedChunkSize = chunkSize ?? Math.max(s.blksize || 0, defaultFileChunkSize);
  if (!Number.isInteger(resolvedChunkSize) || resolvedChunkSize <= 0) {
    throw new RangeError("chunkSize must be a positive integer");
  }
  const fd = await open(filepath, "r");
  try {
    const chunk = Buffer.allocUnsafe(resolvedChunkSize);
    while (true) {
      const { bytesRead } = await fd.read(chunk, 0, resolvedChunkSize, null);
      if (bytesRead === 0) { return; }
      hasher.update(chunk.subarray(0, bytesRead));
    }
  } finally {
    await fd.close();
  }
}

/** Read a file, reusing the same buffer for every block to save GC. */
export async function hashFile(filepath: string) {
  const hasher = crypto.createHash("sha384");
  await createFileChunkHasher(filepath, hasher, 512 * 1024)
  return hasher.digest("base64");
}


