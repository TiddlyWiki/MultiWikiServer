import { mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { TiddlyWiki } from "tiddlywiki";

import { Commander } from "./commands-new";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { createStrictAwaitProxy } from "./utils";
import { Router } from "./router";



export async function bootTiddlyWiki(commands: boolean, wikiPath: string, router: Router) {

  const $tw = TiddlyWiki() as any;

  $tw.utils.eachAsync = eachAsync;

  $tw.boot.boot = async () => {
    // Initialise crypto object
    $tw.crypto = new $tw.utils.Crypto();
    // Initialise password prompter
    if ($tw.browser && !$tw.node) {
      $tw.passwordPrompt = new $tw.utils.PasswordPrompt();
    }
    // Preload any encrypted tiddlers
    await new Promise(resolve => $tw.boot.decryptEncryptedTiddlers(resolve));

    // $tw.boot.startup();
    await new Promise(callback => {
      const options = { callback };
      $tw.boot.initStartup(options);
      // the contentTypeInfo object is created during initStartup
      router.config.contentTypeInfo = $tw.config.contentTypeInfo;
      $tw.boot.loadStartup(options);
      $tw.boot.execStartup(options);
    });

  };

  // creating a new tiddler with the same title as a shadow tiddler
  // prevents the shadow tiddler from defining modules

  $tw.preloadTiddler({ title: "$:/core/modules/commander.js" })
  $tw.modules.define("$:/core/modules/commander.js", "global", {
    Commander: class Commander2 extends Commander {
      router: Router;
      get $tw() { return $tw; }
      get outputPath() { return resolve($tw.boot.wikiPath, $tw.config.wikiOutputSubDir); }
      constructor(...args: ConstructorParameters<typeof Commander>) {
        super(...args);
        this.router = router;
      }
    }
  });

  $tw.preloadTiddler({ title: "$:/plugins/tiddlywiki/multiwikiserver/startup.js" })
  $tw.modules.define("$:/plugins/tiddlywiki/multiwikiserver/startup.js", "startup", {
    name: "multiwikiserver",
    platforms: ["node"],
    after: ["load-modules"],
    before: ["story", "commands"],
    synchronous: false,
    startup: (callback: () => void) => Promise.resolve().then(async () => {

    }).then(callback)
  });

  // tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]
  $tw.boot.argv = [
    "++plugins/client",
    "++plugins/server",
    "++src/commands",
    wikiPath,
    "--mws-render-tiddler",
    ...commands ? [
      "--mws-load-plugin-bags",
      "--mws-load-wiki-folder","./editions/multiwikidocs","mws-docs", "MWS Documentation from https://mws.tiddlywiki.com","mws-docs","MWS Documentation from https://mws.tiddlywiki.com",
      "--mws-load-wiki-folder","./node_modules/tiddlywiki/editions/tw5.com","docs", "TiddlyWiki Documentation from https://tiddlywiki.com","docs","TiddlyWiki Documentation from https://tiddlywiki.com",
      "--mws-load-wiki-folder","./node_modules/tiddlywiki/editions/dev","dev","TiddlyWiki Developer Documentation from https://tiddlywiki.com/dev","dev-docs", "TiddlyWiki Developer Documentation from https://tiddlywiki.com/dev",
      "--mws-load-wiki-folder","./node_modules/tiddlywiki/editions/tour","tour","TiddlyWiki Interactive Tour from https://tiddlywiki.com","tour", "TiddlyWiki Interactive Tour from https://tiddlywiki.com",
      // "--build", "load-mws-demo-data",
    ] : []
  ];

  await $tw.boot.boot();

  console.log("booted");

  return $tw;

}