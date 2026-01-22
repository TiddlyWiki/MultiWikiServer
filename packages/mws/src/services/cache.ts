
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { TW } from "tiddlywiki";
import { gzipSync } from "zlib";
import { BodyFormat, checkPath, dist_resolve, SendFileOptions, ServerRequest } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";


const prefix = Buffer.from(`$tw.preloadTiddler(`, "utf8");
const suffix = Buffer.from(`);`, "utf8");

export async function startupCache($tw: TW, cachePath: string) {

  const pkg = JSON.parse(fs.readFileSync(dist_resolve("../package.json"), "utf8"));

  // we only need the client since we don't load plugins server-side
  const { tiddlerFiles: pluginFiles, tiddlerHashes: pluginHashes } =
    await importPlugins(path.join($tw.boot.corePath, ".."), cachePath, "client", $tw, pkg.version);

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
    pluginFiles, pluginHashes, filePlugins,
    requiredPlugins, cachePath,
    prefix, suffix,
  };
}

serverEvents.on("mws.routes", (root, config) => {
  root.defineRoute({
    method: ["GET", "HEAD"],
    path: /^\/\$cache\/(?<plugin>.*)\/plugin\.js$/,
    bodyFormat: "ignore",
  }, async (state: ServerRequest<BodyFormat, string, unknown>) => {

    checkPath(state, z => ({ plugin: z.string() }), new Error());

    const plugin = state.pluginCache.filePlugins.get(state.pathParams.plugin);
    if (!plugin) throw state.sendEmpty(404, { "x-reason": "Plugin not found" });

    state.setHeader("Content-Type", "application/javascript");
    // state.setHeader("Cache-Control", "public, max-age=60");
    state.setHeader("Cache-Control", "public, max-age=6, stale-while-revalidate=86400");

    const etag = `"${state.pluginCache.pluginHashes.get(plugin)}"`;
    state.setHeader("Etag", etag);

    const match = state.headers.get("if-none-match")?.has(etag);
    if (match) throw state.sendEmpty(304, { "x-reason": "Etag Match" });

    const accepts = state.acceptsEncoding(["gzip", "identity"]);

    // setting this will disable the server gzip streaming so we save CPU cycles
    if (accepts === "gzip") {
      state.setHeader("Content-Encoding", "gzip");
      return state.sendFile(200, {}, {
        root: path.join(config.wikiPath, "cache"),
        reqpath: state.pathParams.plugin + "/plugin.js.gz",
        cacheControl: false,
      });
    } else {
      return state.sendFile(200, {}, {
        root: path.join(config.wikiPath, "cache"),
        reqpath: state.pathParams.plugin + "/plugin.js",
        cacheControl: false,
      });
    }

  })
})

async function importPlugins(twFolder: string, cacheFolder: string, type: string, $tw: TW, mwsVersion: string) {


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

  const pluginsList: any[] = [];
  const tiddlerFiles = new Map<string, string>();
  const tiddlerHashes = new Map<string, string>();

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
        const js = Buffer.concat([prefix, json, suffix]);
        fs.writeFileSync(path.join(newPath, "plugin.js"), js);
        const hash = crypto.createHash("sha384").update(js).digest("base64");
        const gz = gzipSync(js, {});
        fs.writeFileSync(path.join(newPath, "plugin.js.gz"), gz);
        tiddlerFiles.set(plugin.title, relativePluginPath);
        tiddlerHashes.set(plugin.title, "sha384-" + hash);
        pluginsList.push({ title: plugin.title, path: relativePluginPath, hash });
      }
    } else {
      console.log("Info: No plugin found at", oldPath);
    }
  });

  fs.writeFileSync(path.join(cacheFolder, "tiddlywiki-plugins.json"), JSON.stringify(pluginsList, null, 2));

  return { tiddlerFiles, tiddlerHashes };

}


export type CacheState = ART<typeof startupCache>;
