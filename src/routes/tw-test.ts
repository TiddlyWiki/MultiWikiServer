import EventEmitter from "events";
import { rootRoute, SiteConfig } from "./router";
import { TiddlyWiki, TW } from "tiddlywiki";
import { StateObject } from "../StateObject";
import { basename } from "path/posix";


export function DocsRoute(parent: rootRoute, mountPath: string, singleFile: boolean) {
  const $tw = TiddlyWiki();
  const last = basename(mountPath);

  $tw.preloadTiddler({
    title: "$:/config/tiddlyweb/host",
    // if the page url doesn't end with a slash, we have to include the basename here
    text: singleFile ? last + "/" : "",
  });
  // tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]
  $tw.boot.argv = [
    "+plugins/tiddlywiki/tiddlyweb",
    "+plugins/tiddlywiki/filesystem",
    // relative to editions/mws, which is the dev datafolder
    "../mws-docs",
  ];

  const hooks = new EventEmitter();

  // Boot the TW5 app
  $tw.boot.boot(() => {
    const Server = $tw.modules.execute("$:/core/modules/server/server.js", "tw-test.ts").Server;
    const twserver = new Server({
      wiki: $tw.wiki,
      variables: {
        // path prefix gets set per-request
        "path-prefix": "",
        "root-tiddler": "$:/core/save/all",
      },
      routes: [],
    });
    $tw.hooks.invokeHook("th-server-command-post-start", twserver, null, "mws");
    hooks.on("req", (req, res, pathPrefix) => {
      twserver.requestHandler(req, res, { pathPrefix } as any);
    })
  });

  parent.defineRoute({
    method: ["OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE"],
    bodyFormat: "stream",
    path: new RegExp("^" + mountPath + "(/|$)"),
    pathParams: []
  }, async (state) => {

    // eventually this will be optional because either method could be desired
    // especially when importing from an existing single-file folder structure
    if (singleFile && state.urlInfo.pathname === mountPath + "/")
      throw state.redirect(mountPath);
    if (!singleFile && state.urlInfo.pathname === mountPath)
      throw state.redirect(mountPath + "/");

    // the streamer does NOT remove state.pathPrefix from streamer.req.url, only from streamer.url
    // @ts-expect-error because streamer is private
    const { req, res } = state.streamer;
    // regardless of singleFile, this has to end with a slash
    if (req.url === state.pathPrefix + mountPath)
      req.url = state.pathPrefix + mountPath + "/";

    const prom = new Promise((r, c) => res.on("finish", r).on("error", c));
    hooks.emit("req", req, res, state.pathPrefix + mountPath);
    return prom;
  });
}

