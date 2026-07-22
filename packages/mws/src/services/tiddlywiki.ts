import { TiddlyWiki } from "tiddlywiki";
import { ok } from "node:assert";
import { dist_resolve } from "@tiddlywiki/server";

declare module "tiddlywiki" {
  interface TWUtils {
    eachAsync: (array: any[], callback: (item: any, index: number) => Promise<void>) => Promise<void>;
  }
  interface TWBoot {

  }
}

export async function bootTiddlyWiki(wikiPath: string, TiddlyWiki: typeof import("tiddlywiki").TiddlyWiki) {

  const $tw = TiddlyWiki();

  // disable the default commander.

  // creating a new tiddler with the same title as a shadow tiddler
  // prevents the shadow tiddler from defining modules

  $tw.preloadTiddler({ title: "$:/core/modules/commander.js" })
  $tw.modules.define("$:/core/modules/commander.js", "global", {
    Commander: { initCommands: function () { } },
  });

  $tw.preloadTiddler({ title: "$:/core/modules/startup/commands.js" })
  $tw.modules.define("$:/core/modules/startup/commands.js", "startup", {
    name: "commands",
    platforms: ["node"],
    after: ["story"],
    synchronous: true,
    startup: () => { },
  });


  // tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]
  $tw.boot.argv = [
    "++" + dist_resolve("../plugins/server"),
    wikiPath, // this should be inert
  ];

  await new Promise<void>(resolve => $tw.boot.boot(resolve));

  // this makes sure boot followed the node path
  ok(!$tw.boot.tasks.readBrowserTiddlers, "TiddlyWiki boot thinks we're in a browser");

  // grab library tiddlers from plugins and load them as regular tiddlers so they get rendered.
  // we can safely do this because we only load our own plugins here.
  const titles = $tw.wiki.filterTiddlers("[all[shadows]is[system]type[application/javascript]library[yes]]");
  titles.forEach(title => { $tw.wiki.addTiddler($tw.wiki.getTiddler(title)!); })

  return $tw;

}