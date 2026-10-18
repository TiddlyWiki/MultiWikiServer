
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { TW } from "tiddlywiki";
import { createGzip } from "zlib";
import { stat, writeFile } from "fs/promises";
import { readableBuffers } from "../utils";
import { BodyFormat, checkPath, checkQueryKeys, dist_resolve, ServerRequest, ServerRoute, truthy } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { PassThrough, Readable } from "stream";
import { pipeline } from "stream/promises";
import { FileNotFoundError, hashFile, PluginHashes } from "./PluginCache";
import esr from "escape-string-regexp";
import { ServerState } from "../ServerState";

export const defaultPreloadFunction = "$tw.preloadTiddler";

export const registerCacheRoutes = (root: ServerRoute, config: ServerState) => {
  root.defineRoute({
    method: ["GET", "HEAD"],
    path: new RegExp("^" + esr(config.rootRoutes.cache) + "/(?<plugin>.*)/plugin\\.js$"),
    bodyFormat: "ignore",
  }, async (state: ServerRequest<BodyFormat, string, unknown>) => {
    checkPath(state, z => ({ plugin: z.string() }), new Error());
    checkQueryKeys(state, ["cb"], new Error());
    const arrayString = state.query.get("cb") ?? defaultPreloadFunction;

    const pluginFolder = path.resolve(config.wikiPath, "cache", state.pathParams.plugin);
    if (path.relative(path.resolve(config.wikiPath, "cache"), pluginFolder).startsWith(".."))
      throw new Error("Parent path access detected");

    await state.pluginCache.assertPathHashes(arrayString, [state.pathParams.plugin]).catch(e => {
      throw e instanceof FileNotFoundError ? state.sendEmpty(404, { "x-reason": "Plugin not found" }) : e;
    });

    const hasher = state.pluginCache.pluginHashes(arrayString);
    const hash = hasher.get(state.pathParams.plugin);
    if (!hash) throw state.sendEmpty(404, { "x-reason": "Plugin not found" });

    const etag = `"${hash}"`;

    // maxage covers preload, staleWhileRevalidate allows a second refresh to clear up stale data
    state.applyHeaders({
      contentType: "application/javascript",
      cacheControl: { public: true, maxAge: 6, staleWhileRevalidate: 86400 },
      etag,
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
};


export async function importPlugins(
  $tw: TW,
  wikiFolder: string,
  arrayStrings: readonly string[],
  pluginHashes: PluginHashes,
  mwsVersion: string,
) {

  const twFolder = path.join($tw.boot.corePath, "..");

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
    const pluginCode = path.relative(twFolder, oldPath);
    const relativePluginPath = path.join("tiddlywiki", $tw.version, pluginCode);
    return [oldPath, relativePluginPath] as const;
  });

  const mwsRelative = `mws/${mwsVersion}/client`;
  plugins.push([dist_resolve("../plugins/client"), mwsRelative] as const);

  const bootTiddlers = $tw.loadTiddlersFromPath($tw.boot.bootPath).map(e => e.tiddlers).flat();
  const bootFile = path.join(wikiFolder, "cache", "tiddlywiki", $tw.version, "boot.json");
  fs.mkdirSync(path.dirname(bootFile), { recursive: true });
  if (!fs.existsSync(bootFile))
    await writeFile(bootFile, JSON.stringify(bootTiddlers, null, 2));

  const { pluginInfoKeys, pluginsInfo } = await importPluginsInner(
    $tw,
    plugins,
    wikiFolder,
    arrayStrings,
    pluginHashes,
    mwsRelative,
    mwsVersion,
  );

  // fs.writeFileSync(path.join(wikiFolder, "cache", "tiddlywiki", $tw.version, "plugins.json"), JSON.stringify(pluginsList, null, 2));
  const pluginPaths = pluginsInfo.map(e => ({
    version: $tw.version,
    title: e.title,
    path: e.newPath,
    name: e.plugin.name,
    desc: e.plugin.description,
  }));

  return { pluginInfoKeys, pluginsInfo, pluginPaths };

}

async function importPluginsInner(
  $tw: TW,
  plugins: (readonly [oldPath: string, relPath: string])[],
  wikiFolder: string,
  arrayStrings: readonly string[],
  pluginHashes: PluginHashes,
  mwsRelative: string,
  mwsVersion: string,
) {
  const pluginInfoKeys = new Set<string>();
  const pluginsInfoMapper = async ([oldPath, relativePluginPath]: string[]) => {
    const plugin = $tw.loadPluginFolder(oldPath);
    Object.keys(plugin).forEach(e => pluginInfoKeys.add(e));
    const newPath = path.join(wikiFolder, "cache", relativePluginPath);
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

    const jsonFile = path.join(newPath, "plugin.json");
    const json = Buffer.from(JSON.stringify(plugin).replace(/<\//gi, "\\u003c/"), "utf8");
    const jsonHash = crypto.createHash("sha384").update(json).digest("base64");
    const writeFiles = !fs.existsSync(jsonFile) || await hashFile(jsonFile) !== jsonHash;

    if (writeFiles) {
      console.log("writing", jsonFile);
      await writeFile(jsonFile, json);
    }

    const hashes = await Promise.all(arrayStrings.map(async (arrayString, index) => {
      const hasher = pluginHashes(arrayString);
      const { prefix, suffix } = hasher;
      const gzpath = path.join(newPath, "plugin." + index + ".js.gz");
      const hash = hasher.hashPluginFromBufferSync(relativePluginPath.replaceAll("\\", "/"), json);
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

    return {
      title: plugin.title,
      hashes,
      plugin,
      newPath: relativePluginPath.replaceAll("\\", "/"),
      oldPath: path.relative(wikiFolder, oldPath).replaceAll("\\", "/"),
    };

  };
  const pluginsInfo: (ART<typeof pluginsInfoMapper> & {})[] = (await Readable.from(plugins).map(pluginsInfoMapper).toArray()).filter(truthy);

  return { pluginsInfo, pluginHashes, pluginInfoKeys }
}
