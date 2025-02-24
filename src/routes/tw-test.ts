import { IParseTreeNode, IServerOptions, ITiddlyWiki, Server as ServerClass, Tiddler, TiddlyWiki, Widget } from "tiddlywiki";
import { Server } from "http";
import { rootRoute, Router } from "../router";

export function TWRoutes(parent: rootRoute) {
  const wikiRouter = new TWRouter();
  parent.defineRoute({
    useACL: {},
    method: ["OPTIONS", "GET", "HEAD", "POST", "PUT"],
    bodyFormat: "stream",
    path: /^\/test(\/|$)/,
    pathParams: ["final_slash"]
  }, async (state) => {
    zodAssert.pathParams(state, z => ({ final_slash: z.string().optional() }));
    if (!state.pathParams.final_slash) throw state.redirect(state.urlInfo.pathname + "/");
    // literally don't do this
    const { req, res } = (state as any).streamer;
    // options not required
    wikiRouter.twserver.requestHandler(req, res, {} as any);
  });
}

class TWRouter {
  $tw: ITiddlyWiki;
  twserver!: ServerClass;

  constructor() {
    this.$tw = TiddlyWiki();
    // tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]
    this.$tw.boot.argv = [
      "++plugins/client",
      "++plugins/server",
      "./editions/mws",
      "--mws-load-plugin-bags",
      "--build", "load-mws-demo-data",
      "--mws-listen", "port=5001", "host=::"
    ];
    this.$tw.boot.boot();

    // this.$tw.preloadTiddler({
    //   text: "$protocol$//$host$" + "/test/",
    //   title: "$:/config/tiddlyweb/host",
    // });
    // // Boot the TW5 app
    // this.$tw.boot.boot(() => {
    //   const Server = this.$tw.modules.execute("$:/core/modules/server/server.js", "router.ts").Server as typeof ServerClass;
    //   this.twserver = new Server({
    //     wiki: this.$tw.wiki,
    //     variables: {
    //       // do not use a trailing slash
    //       "path-prefix": "/test",
    //       "root-tiddler": "$:/core/save/all",
    //     },
    //     routes: [],
    //   });
    //   console.log(this.twserver.routes);
    //   ; (this.$tw.hooks as IHooks).invokeHook("th-server-command-post-start", this.twserver, null, "mws");
    // });

  }
}



interface IHooksKnown {
  "th-before-importing": [tiddler: Tiddler];
  "th-boot-tiddlers-loaded": [];
  "th-cancelling-tiddler": [event: unknown];
  "th-closing-tiddler": [event: unknown];
  "th-deleting-tiddler": [title: string];
  "th-editing-tiddler": [event: unknown];
  "th-importing-file": [props: { callback: Function; file: { name: string; path?: string }; isBinary: boolean; type: string }];
  "th-importing-tiddler": [tiddler: Tiddler];
  "th-make-tiddler-path": [fullPath: string, fullPath: string];
  "th-navigating": [event: unknown];
  "th-new-tiddler": [event: unknown];
  "th-opening-default-tiddlers-list": [storyList: string[]];
  "th-page-refreshed": [];
  "th-page-refreshing": [];
  "th-relinking-tiddler": [toTiddler: Tiddler, fromTiddler: Tiddler];
  "th-renaming-tiddler": [toTiddler: Tiddler, fromTiddler: Tiddler];
  "th-rendering-element": [parseTreeNodes: IParseTreeNode | null, widget: Widget];
  "th-saving-tiddler": [toTiddler: Tiddler, fromTiddler: Tiddler];
  "th-server-command-post-start": [server: ServerClass, nodeServer: Server, who: 'tiddlywiki'] | [server: ServerClass, nodeServer: null, who: 'mws'];
}
interface IHooks {
  /** Add hooks to the hashmap */
  addHook<K extends keyof IHooksKnown>(hookName: K, callback: (...arguments_: IHooksKnown[K]) => unknown): void;
  // addHook(hookName: string, callback: (...arguments_: unknown[]) => unknown): void;
  /**
   * Invoke the hook by key
   */
  invokeHook<K extends keyof IHooksKnown>(hookName: K, ...args: IHooksKnown[K]): void;
  // invokeHook(hookName: string, ...arguments_: unknown[]): void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  names: Record<string, Function[]>;
}