
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { TW } from "tiddlywiki";
import { createGzip, gzipSync } from "zlib";
import { BodyFormat, checkPath, checkQueryKeys, dist_resolve, SendFileOptions, ServerRequest } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { mapGetInit } from "../new-managers";
import { open, stat } from "fs/promises";

export const defaultPreloadFunction = "$tw.preloadTiddler";
export type WikiPluginCache = ART<typeof startupCache>;

export async function startupCache($tw: TW, cachePath: string, cacheArrayStrings: readonly string[]) {

  const pkg = JSON.parse(fs.readFileSync(dist_resolve("../package.json"), "utf8"));
  Object.seal(cacheArrayStrings);
  // we only need the client since we don't load plugins server-side
  const { tiddlerFiles: pluginFiles, tiddlerHashes: pluginHashes, pluginsList } =
    await importPlugins(
      path.join($tw.boot.corePath, ".."),
      cachePath,
      "client",
      $tw,
      pkg.version,
      cacheArrayStrings
    );

  const filePlugins = new Map([...pluginFiles.entries()].map(e => e.reverse() as [string, string]));

  const requiredPlugins = [
    "$:/plugins/mws/client",
    "$:/themes/tiddlywiki/snowwhite",
    "$:/themes/tiddlywiki/vanilla",
  ];

  const result = $tw.wiki.renderTiddler("text/plain", "$:/core/templates/tiddlywiki5.html", {
    variables: {
      // the boot and library tiddlers get rendered into the page
      // this list gets saved in the store array
      // we have to render at least one tiddler
      saveTiddlerFilter: "$:/SplashScreen"
    }
  });

  const filepath = path.resolve(cachePath, "tiddlywiki5.html")

  fs.writeFileSync(filepath, result);

  return {
    pluginFiles,
    pluginHashes,
    filePlugins,
    pluginsList,
    requiredPlugins,
    cachePath,
    cacheArrayStrings,
  };
}

serverEvents.on("mws.routes", (root, config) => {
  root.defineRoute({
    method: ["GET", "HEAD"],
    path: /^\/\$cache\/(?<plugin>.*)\/plugin\.js$/,
    bodyFormat: "ignore",
  }, async (state: ServerRequest<BodyFormat, string, unknown>) => {

    checkPath(state, z => ({ plugin: z.string() }), new Error());
    checkQueryKeys(state, ["cb"], new Error());
    const arrayString = state.query.get("cb") ?? defaultPreloadFunction;

    const plugin = state.pluginCache.filePlugins.get(state.pathParams.plugin);
    if (!plugin) throw state.sendEmpty(404, { "x-reason": "Plugin not found" });


    const hasher = state.pluginCache.pluginHashes(arrayString);
    await hasher.assertTitles(state.pluginCache, [plugin]);

    const etag = `"${hasher.get(plugin)}"`;

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
    if (fileIndex === -1) {
      const fileStream = fs.createReadStream(path.join(
        config.wikiPath, "cache", state.pathParams.plugin, "plugin.json"
      ));
      const { prefix, suffix } = hasher;
      state.writeHead(200, useGzip ? { contentEncoding: "gzip" } : {});
      state.writeFast(prefix);
      await state.pipeFrom(useGzip ? fileStream.pipe(createGzip()) : fileStream);
      state.writeFast(suffix);
      return state.end();
    } else {
      return state.sendFile(200, {}, {
        root: path.join(config.wikiPath, "cache"),
        reqpath: state.pathParams.plugin + "/plugin." + fileIndex + ".js",
        cacheControl: false,
        precompressed: useGzip,
      });
    }

  })
})

async function importPlugins(
  twFolder: string,
  cacheFolder: string,
  type: string,
  $tw: TW,
  mwsVersion: string,
  arrayStrings: readonly string[],
) {


  const readLevel = (d: string) => {
    return (fs.readdirSync(path.join(twFolder, d)))
      .filter(e => !$tw.boot.excludeRegExp.test(e))
      .map(e => path.join(d, e));
  }

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

  const pluginsList: PluginDefinition[] = [];
  const tiddlerFiles = new Map<string, string>();
  const tiddlerHashesStore = new Map<string, TiddlerHasher>();
  function tiddlerHashes(arrayString: string) {
    return mapGetInit(tiddlerHashesStore, arrayString, () => new TiddlerHasher(arrayString));
  }
  tiddlerHashes.toJSON = () => {
    return Object.fromEntries(tiddlerHashesStore.entries());
  }

  plugins.forEach(([oldPath, relativePluginPath]) => {
    const plugin = $tw.loadPluginFolder(oldPath);

    const newPath = path.join(cacheFolder, relativePluginPath);
    fs.mkdirSync(newPath, { recursive: true });
    if (plugin && plugin.title && plugin.text) {
      if (relativePluginPath === mwsRelative) {
        plugin.version = mwsVersion;
      }
      // need to compare sizes of various configurations

      // plugin.text = JSON.stringify(JSON.parse(plugin.text as string));
      Object.keys(plugin).forEach(e => {
        if (plugin[e] !== undefined && typeof plugin[e] !== "string") {
          // before, this was handled by the database making sure all field values were strings
          plugin[e] = `${plugin[e]}`;
          if (process.env.ENABLE_DEV_SERVER)
            console.log(`DEV: Tiddler ${plugin.title} field ${e} was not a string`)
        }
      });

      if (type === "server") {
        plugin.tiddlers = JSON.parse(plugin.text).tiddlers;
        delete plugin.text;
        fs.writeFileSync(path.join(newPath, "plugin.info"), JSON.stringify(plugin));
      } else if (type === "client") {
        const json = Buffer.from(JSON.stringify(plugin).replace(/<\//gi, "\\u003c/"), "utf8");
        fs.writeFileSync(path.join(newPath, "plugin.json"), json);
        const hashes = arrayStrings.map((arrayString, index) => {
          const hasher = tiddlerHashes(arrayString);
          const { prefix, suffix } = hasher;
          hasher.hashPluginFromBufferSync(plugin.title, json);
          const js = Buffer.concat([prefix, json, suffix]);
          fs.writeFileSync(path.join(newPath, "plugin." + index + ".js"), js);
          const hash = crypto.createHash("sha384").update(js).digest("base64");
          const gz = gzipSync(js, {});
          fs.writeFileSync(path.join(newPath, "plugin." + index + ".js.gz"), gz);
          return hash;
        });
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
    } else {
      console.log("Info: No plugin found at", oldPath);
    }
  });

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
    for await (const chunk of createFileChunkReader(jsonPath)) {
      hasher.update(chunk);
    }
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
async function* createFileChunkReader(filepath: string, chunkSize?: number): AsyncGenerator<Buffer, void, undefined> {
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
