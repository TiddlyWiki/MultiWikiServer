import { basename } from "path";
import EventEmitter from "events";
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { dist_resolve, RouteDef, ServerRequest, ServerRoute } from "@tiddlywiki/server";
import { serverEvents } from "@tiddlywiki/events";
import { bootDefaultTiddlyWiki } from "../plugin-cache";
import { TW } from "tiddlywiki";
import { ServerState } from "../ServerState";

export const registerDocsRoute = (rootRoute: ServerRoute, config: ServerState) => {

  if (config.enableDocsRoute) {
    const $tw = bootDefaultTiddlyWiki(config.wikiPath);
    mountTW5Route({
      $tw,
      rootRoute,
      mountPath: "/mws-docs",
      singleFile: false,
      args: [
        "+plugins/tiddlywiki/tiddlyweb",
        "+plugins/tiddlywiki/filesystem",
        dist_resolve("../editions/mws-docs"),
      ],
      variables: {
        rootTiddler: "$:/core/save/all",
      }
    })
  }
};

export function mountTW5Route({ $tw, rootRoute, mountPath, singleFile, args, variables }: {
  $tw: Promise<TW>;
  rootRoute: ServerRoute;
  /** The mount point of TW5, equivelant to pathPrefix. */
  mountPath: string;
  /** 
   * Mount the wiki main page as a file (no trailing slash), rather than a folder (trailing slash).
   * 
   * This changes relative paths within the folder (such as static files served by TW5 server routes).
   */
  singleFile: boolean;
  /** Command line arguments for the TW5 environment. */
  args: string[];
  /** Variables passed into the TW5 server */
  variables: Record<string, string>;
}) {

  const hooks = instanceTW5DataFolderNode({
    $tw,
    mountPath,
    singleFile,
    argv: args,
    variables,
  });

  rootRoute.defineRoute({
    method: ["OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE"],
    bodyFormat: "stream",
    path: new RegExp("^" + mountPath + "(/|$)"),
  }, async (state: ServerRequest) => {

    if (singleFile && state.urlInfo.pathname === mountPath + "/")
      throw state.redirect(mountPath);
    if (!singleFile && state.urlInfo.pathname === mountPath)
      throw state.redirect(mountPath + "/");

    // the streamer does NOT remove state.pathPrefix from streamer.req.url, only from streamer.url
    // const { req, res } = state;
    // regardless of singleFile, this has to end with a slash
    // if (req.url === state.pathPrefix + mountPath)
    //   req.url = state.pathPrefix + mountPath + "/";

    // const prom = new Promise((r, c) => res.on("finish", r).on("error", c));
    // hooks.emit("req", req, res, state.pathPrefix + mountPath);
    // return prom.then(() => STREAM_ENDED);
  });
}

function startNodeServer(){

}

export function instanceTW5DataFolderNode({
  $tw,
  mountPath,
  singleFile,
  argv,
  variables = {},
}: {
  $tw: Promise<TW>;
  mountPath: string;
  singleFile: boolean;
  argv: string[];
  variables?: Record<string, string>;
}) {
  if (!mountPath.startsWith("/") || mountPath.endsWith("/"))
    throw new Error("mountPath must start, and not end, with a slash.");

  const hooks = new EventEmitter<{
    req: [req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse, mount: string]
  }>();

  $tw.then($tw => {

    const last = basename(mountPath);

    $tw.preloadTiddler({
      title: "$:/config/tiddlyweb/host",
      // if the page url doesn't end with a slash, we have to include the basename here
      text: singleFile ? last + "/" : "",
    });

    $tw.boot.argv = argv;

    // Boot the TW5 app
    $tw.boot.boot(() => {
      const Server = $tw.modules.execute("$:/core/modules/server/server.js", "tw-routes.ts").Server;
      const twserver = new Server({
        wiki: $tw.wiki,
        variables,
        routes: [],
      });
      $tw.hooks.invokeHook("th-server-command-post-start", twserver, null, "mws");
      hooks.on("req", (req, res, pathPrefix) => {
        twserver.requestHandler(req, res, { pathPrefix } as any);
      });
    });
  });

  return hooks;

}