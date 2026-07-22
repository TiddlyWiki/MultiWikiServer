
import * as fs from "fs";
import * as path from "path";
import { TW } from "tiddlywiki";
import { importPlugins } from "./importPlugins";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import { dist_resolve, truthy } from "@tiddlywiki/server";
import { Readable, Writable } from "stream";
import { x as extractTar } from 'tar'
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import { bootTiddlyWiki } from "../services/tiddlywiki";
import { Debug } from "@prisma/client/runtime/client";
export * from "./importPlugins";

export type WikiPluginCache = ART<typeof startupCache>;

const debug = Debug("mws:cache");

interface TW5RegistryInfo {
  _id: string;
  _rev: string;
  _etag?: string | null;
  _modified?: string | null;
  versions: Record<string, any>;
  "dist-tags": { latest: string; };
}

async function getTW5Path(wikiPath: string) {
  if (!fs.existsSync(path.resolve(wikiPath, "tw5"))) {
    throw new Error("You need to run update-tiddlywiki first");
  }
  const folders = (await Promise.all((await readdir(path.resolve(wikiPath, "tw5"))).map(async e => {
    const s = await stat(path.resolve(wikiPath, "tw5", e));
    if (!s.isDirectory()) return;
    const t = /^tw5-5\.([0-9]+)\.([0-9]+)(.*)/.exec(e);
    if (!t) return;
    const [, minor, patch, extra] = t;
    return { minor, patch, extra };
  }))).filter(truthy).sort((a, b) => {
    return +a.minor - +b.minor
      || +a.patch - +b.patch
      || a.extra.localeCompare(b.extra);
  });

  if (!folders.length) {
    console.log(folders.map(e => `tw5-5.${e.minor}.${e.patch}${e.extra}`));
    throw new Error("No valid tiddlywiki folder found");
  }
  const e = folders.pop()!;
  return path.resolve(wikiPath, "tw5", `tw5-5.${e.minor}.${e.patch}${e.extra}`);
}

export async function bootDefaultTiddlyWiki(wikiPath: string) {
  const { TiddlyWiki } = require(path.resolve(await getTW5Path(wikiPath), "boot/boot.js"));
  return await bootTiddlyWiki(wikiPath, TiddlyWiki);
}

export async function startupCache(wikiPath: string, cacheArrayStrings: readonly string[]) {
  const cachePath = path.resolve(wikiPath, "cache");
  fs.mkdirSync(cachePath, { recursive: true });
  const $tw = await bootDefaultTiddlyWiki(wikiPath);

  const pkg = JSON.parse(fs.readFileSync(dist_resolve("../package.json"), "utf8"));
  Object.seal(cacheArrayStrings);
  // we only need the client since we don't load plugins server-side
  const {
    tiddlerFiles: pluginFiles,
    tiddlerHashes: pluginHashes,
    pluginsList
  } = await importPlugins(
    path.join($tw.boot.corePath, ".."),
    cachePath,
    "client",
    $tw,
    pkg.version,
    cacheArrayStrings
  );

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
    /** `(arrayString: string): TiddlerHasher;` */
    pluginHashes,
    /** Map of "title" to `relative("/wiki/cache", dirname("plugin.json"))`. Reverse of filePlugins. */
    pluginFiles,
    /** Map of `relative("/wiki/cache", dirname("plugin.json"))` to "title". Reverse of pluginFiles. */
    filePlugins: new Map([...pluginFiles.entries()].map(e => e.reverse() as [string, string])),
    /** List of plugins saved in the cache. */
    pluginsList,
    /** List of plugins generally required to make MWS work. */
    requiredPlugins,
    /** The actual path of "/wiki/cache" */
    cachePath,
    /** Template "preloadFunction" values which are gzipped at startup and saved to disk to save CPU cycles per request. */
    cacheArrayStrings,
  };
}
