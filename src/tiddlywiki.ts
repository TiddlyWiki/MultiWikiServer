import { mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { TiddlyWiki } from "tiddlywiki";
import { AttachmentStore } from "./store/attachments";
import { Commander } from "./commander";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { createStrictAwaitProxy } from "./helpers";
import { SqlTiddlerDatabase } from "./store/new-sql-tiddler-database";
import { SqlTiddlerStore } from "./store/new-sql-tiddler-store";


export async function bootTiddlyWiki(createTables: boolean, commands: boolean, wikiPath: string) {

  const $tw = TiddlyWiki() as any;

  $tw.utils.eachAsync = eachAsync;

  $tw.boot.boot = async function () {
    // Initialise crypto object
    $tw.crypto = new $tw.utils.Crypto();
    // Initialise password prompter
    if ($tw.browser && !$tw.node) {
      $tw.passwordPrompt = new $tw.utils.PasswordPrompt();
    }
    // Preload any encrypted tiddlers
    await new Promise(resolve => $tw.boot.decryptEncryptedTiddlers(resolve));

    // this part executes syncly
    await new Promise(resolve => $tw.boot.startup({ callback: resolve }));
  };



  // tiddlywiki [+<pluginname> | ++<pluginpath>] [<wikipath>] ...[--command ...args]
  $tw.boot.argv = [
    "++plugins/client",
    "++plugins/server",
    "++src/commands",
    wikiPath,
    ...commands ? [
      "--mws-load-plugin-bags",
      "--build", "load-mws-demo-data",
    ] : []
  ];

  const storePath = resolve(wikiPath, "store");
  $tw.mws = {};



  $tw.modules.define("$:/plugins/tiddlywiki/multiwikiserver/startup.js", "startup", {
    name: "multiwikiserver",
    platforms: ["node"],
    after: ["load-modules"],
    before: ["story", "commands"],
    synchronous: false,
    startup: (callback: () => void) => Promise.resolve().then(async () => {

      $tw.Commander = class Commander2 extends Commander {
        get $tw() { return $tw; }
        get outputPath() { return resolve(this.$tw.boot.wikiPath, this.$tw.config.wikiOutputSubDir); }
        constructor(...args: ConstructorParameters<typeof Commander>) {
          super(...args);
        }
      };

      // console.log($tw.config);

      $tw.mws.attachmentStore = new AttachmentStore(storePath, $tw.sjcl, $tw.config);

      if (commands) {



        const libsql = createClient({ url: "file:" + resolve(wikiPath, "store/database.sqlite") });
        // if (createTables) await libsql.executeMultiple(readFileSync("./prisma/schema.prisma.sql", "utf8"));
        if (createTables) await libsql.executeMultiple(readFileSync("./prisma/old-db.sql", "utf8"));
        libsql.execute("pragma synchronous=off");
        const adapter = new PrismaLibSQL(libsql)
        const engine = new PrismaClient({ adapter, log: ["error", "warn", "info"] });
        const sql = createStrictAwaitProxy(new SqlTiddlerDatabase(engine as any));
        $tw.mws.store = createStrictAwaitProxy(new SqlTiddlerStore(sql, $tw.mws.attachmentStore, $tw.wiki, $tw.config));

      }

    }).then(callback)
  });

  await $tw.boot.boot();

  if (commands) {
    $tw.mws.store.sql.engine.$disconnect();
    delete $tw.mws.store.sql.engine;
    delete $tw.mws.store.sql;
    delete $tw.mws.store;
  }
  console.log("booted");
  throw "cancel";
  return $tw;

}