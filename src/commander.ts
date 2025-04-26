
import { SiteConfig } from "./routes/router";
import * as path from "node:path";

import { MWSConfig } from "./server";
import { Prisma, PrismaClient } from "@prisma/client";

import * as sessions from "./services/sessions";
import * as attacher from "./services/attachments";
import { PasswordService } from "./services/PasswordService";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { TiddlerFields, TW } from "tiddlywiki";
import { dist_resolve } from "./utils";
import { readdir, readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import type { SqlDriverAdapter, SqlMigrationAwareDriverAdapterFactory } from '@prisma/driver-adapter-utils';


import { commands, mws_listen, divider } from "./commands";
import { ok } from "node:assert";
export interface $TW {
  utils: any;
  wiki: any;
  config: any;
  boot: any;
  loadTiddlersFromPath: any;
  Tiddler: {
    // TW5-typed for some reason just types this as a record of modules, which is incorrect
    fieldModules: Record<string, {
      name: string;
      parse?: (value: any) => any;
      stringify?: (value: any) => string;
    }>;
  }
}

export interface CommandInfo {
  name: string;
  /** 
   * @default false
   * 
   * @description
   * 
   * - Regardless of the value of `synchronous`, the execute method is always awaited.
   * - Let `result` be any value thrown by the constructor or returned or thrown by the execute method. 
   * ```
   * synchronous: false
   * ```
   * - `result` is awaited (if result is not then-able, this has no effect).
   * - If `result` is truthy, the command is failed without waiting for the callback.
   * - If `result` is falsy, the command waits for the callback result.
   * - The callback value is NOT awaited. 
   * - if the callback value is truthy, the command is failed.
   * - if the callback value is falsy, the command is completed.
   * ```
   * synchronous: true
   * ```
   * - `result` is awaited (if result is not then-able, this has no effect).
   * - If `result` is truthy, the command is failed.
   * - If `result` is falsy, the command is completed.
   * 
   * - The callback is not available if `synchronous` is true. 
   * 
   */
  synchronous?: boolean;
  namedParameterMode?: boolean;
  mandatoryParameters?: string[];
}

// move the startup logic into a separate class
class StartupCommander {

  constructor(
    public config: MWSConfig,
    public $tw: TW,
    public PasswordService: PasswordService,
  ) {



    if (config.config?.pathPrefix) {
      ok(config.config.pathPrefix.startsWith("/"), "pathPrefix must start with a slash");
      ok(!config.config.pathPrefix.endsWith("/"), "pathPrefix must not end with a slash");
    }

    // console.log(config.wikiPath);
    // this is already resolved to the cwd.
    this.wikiPath = config.wikiPath;
    this.storePath = path.resolve(this.wikiPath, "store");
    this.databasePath = path.resolve(this.storePath, "database.sqlite");
    this.outputPath = path.resolve($tw.boot.wikiPath, $tw.config.wikiOutputSubDir);
    this.cachePath = path.resolve(this.wikiPath, "cache");

    if (!existsSync(this.storePath)) {
      mkdirSync(this.storePath, { recursive: true });
      this.setupRequired = true;
    }

    // using the libsql adapter because for some reason prisma was 
    // freezing when loading the system bag favicons.
    // the libsql adapter has an additional advantage of letting us specify pragma 
    // and also gives us more control over connections. 



    this.siteConfig = {
      wikiPath: this.wikiPath,
      allowAnonReads: !!config.config?.allowAnonReads,
      allowAnonWrites: !!config.config?.allowAnonWrites,
      allowUnreadableBags: !!config.config?.allowUnreadableBags,
      attachmentsEnabled: !!config.config?.saveLargeTextToFileSystem,
      attachmentSizeLimit: config.config?.saveLargeTextToFileSystem ?? 0,
      enableBrowserCache: !!config.config?.enableBrowserCache,
      enableGzip: !!config.config?.enableGzip,
      contentTypeInfo: $tw.config.contentTypeInfo,
      storePath: this.storePath,
      pathPrefix: config.config?.pathPrefix ?? "",
      saveLargeTextToFileSystem: undefined as never
    };

    this.SessionManager = config.SessionManager || sessions.SessionManager;
    this.AttachmentService = config.AttachmentService || attacher.AttachmentService;

  }

  async init() {
    try {
      //@ts-ignore - so we can still build if the adapter isn't installed
      const { PrismaBetterSQLite3 } = await import("@prisma/adapter-better-sqlite3");
      this.adapter = new PrismaBetterSQLite3({ url: "file:" + this.databasePath });
    } catch (e) {
      console.log("Failed to load better-sqlite3. Are you sure it's installed?");
      throw e;
    }

    this.engine = new PrismaClient({ log: ["info", "warn"], adapter: this.adapter, });

    this.setupRequired = false;
    const libsql = await this.adapter.connect();

    if (process.env.RUN_OLD_MWS_DB_SETUP_FOR_TESTING) {
      await libsql.executeScript(readFileSync(dist_resolve(
        "../prisma/migrations/20250406213424_init/migration.sql"
      ), "utf8"));
    }

    const tables = await libsql.queryRaw({
      sql: `SELECT tbl_name FROM sqlite_master WHERE type='table'`,
      args: [],
      argTypes: [],
    }).then(e => e?.rows as [string][] | undefined);

    const hasExisting = !!tables?.length;


    const hasMigrationsTable = !!tables?.length && !!tables?.some((e) => e[0] === "_prisma_migrations");
    if (!hasMigrationsTable) await this.createMigrationsTable(libsql);
    await this.checkMigrationsTable(libsql, hasExisting && !hasMigrationsTable);


    const users = await this.engine.users.count();
    if (!users) { this.setupRequired = true; }

    await libsql.dispose();
  }
  async createMigrationsTable(libsql: SqlDriverAdapter) {
    await libsql.executeScript(
      'CREATE TABLE "_prisma_migrations" (\n' +
      '    "id"                    TEXT PRIMARY KEY NOT NULL,\n' +
      '    "checksum"              TEXT NOT NULL,\n' +
      '    "finished_at"           DATETIME,\n' +
      '    "migration_name"        TEXT NOT NULL,\n' +
      '    "logs"                  TEXT,\n' +
      '    "rolled_back_at"        DATETIME,\n' +
      '    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,\n' +
      '    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0\n' +
      ')',
    )
  }
  async checkMigrationsTable(libsql: SqlDriverAdapter, migrateExisting: boolean) {

    const applied_migrations = new Set(
      await libsql.queryRaw({
        sql: `Select migration_name from _prisma_migrations`,
        args: [],
        argTypes: [],
      }).then(e => e.rows.map(e => e[0]))
    );

    const migrations = await readdir(dist_resolve("../prisma/migrations"));
    migrations.sort();

    const new_migrations = migrations.filter(m => !applied_migrations.has(m) && m !== "migration_lock.toml");
    if (!new_migrations.length) return;

    function generateChecksum(fileContent: string) {
      return createHash('sha256').update(fileContent).digest('hex');
    }

    console.log("New migrations found", new_migrations);

    for (const migration of new_migrations) {
      const migration_path = dist_resolve(`../prisma/migrations/${migration}/migration.sql`);
      if (!existsSync(migration_path)) continue;

      const fileContent = await readFile(migration_path, 'utf-8');
      // this is the hard-coded name of the first migration.
      if (migrateExisting && migration === "20250406213424_init") {
        console.log("Existing migration", migration, "is already applied");
      } else {
        console.log("Applying migration", migration);
        await libsql.executeScript(fileContent);
      }

      await libsql.executeRaw({
        sql: 'INSERT INTO _prisma_migrations (' +
          'id, migration_name, checksum, finished_at, logs, rolled_back_at, started_at, applied_steps_count' +
          ') VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [randomUUID(), migration, generateChecksum(fileContent), Date.now(), null, null, Date.now(), 1],
        argTypes: [], // this doesn't appear to be used at the moment
      });

    }
    console.log("Migrations applied", new_migrations);

  }
  wikiPath: string;
  storePath: string;
  databasePath: string;
  cachePath: string;

  adapter!: SqlMigrationAwareDriverAdapterFactory;
  engine!: PrismaClient<Prisma.PrismaClientOptions, never, {
    result: {
      // this types every output field with PrismaField
      [T in Uncapitalize<Prisma.ModelName>]: {
        [K in keyof PrismaPayloadScalars<Capitalize<T>>]: () => {
          compute: () => PrismaField<Capitalize<T>, K>
        }
      }
    },
    client: {},
    model: {},
    query: {},
  }>;

  $transaction<R>(
    fn: (prisma: Omit<Commander["engine"], ITXClientDenyList>) => Promise<R>,
    options?: {
      maxWait?: number,
      timeout?: number,
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  ): Promise<R> {
    // $transaction doesn't have the client extensions types,
    // but should have them available (were they not just types).
    return this.engine.$transaction(fn as (prisma: any) => Promise<any>, options);
  }


  siteConfig: SiteConfig;


  SessionManager: typeof sessions.SessionManager;
  AttachmentService: typeof attacher.AttachmentService;



  /** Signals that database setup is required. May be set to false by any qualified setup command. */
  setupRequired: boolean = true;
  outputPath: string;
}
/**
Parse a sequence of commands
  commandTokens: an array of command string tokens
  wiki: reference to the wiki store object
  streams: {output:, error:}, each of which has a write(string) method
  callback: a callback invoked as callback(err) where err is null if there was no error
*/
export class Commander extends StartupCommander {

  constructor(
    config: MWSConfig,
    $tw: TW,
    PasswordService: PasswordService,
  ) {
    super(config, $tw, PasswordService);
    this.nextToken = 0;
    this.verbose = false;

    const { listeners, onListenersCreated } = config;
    config.listeners = [];
    config.onListenersCreated = undefined;
    // there's nothing that can't be hacked in a Node process,
    // but this just makes it a little bit harder for the listeners to be read.
    // this can be replaced, but it only recieves the listeners via closure.
    this.create_mws_listen = (params: string[]) => {
      return new mws_listen.Command(params, this, listeners, onListenersCreated);
    }
  }

  create_mws_listen;
  /** 
   * The promise of the current execution. 
   * It is created and returned by execute, 
   * but also accessible here. 
   * 
   * After the promise is resolved, it will 
   * be available until execute is called again. 
   */
  promise!: Promise<void>;
  private callback!: (err?: any) => void;


  commandTokens!: string[];
  nextToken
  verbose

  static initCommands(moduleType?: string) {
    if (moduleType) throw new Error("moduleType is not implemented");
  }
  /*
  Add a string of tokens to the command queue
  */
  addCommandTokens(params: string[]) {
    if (this.verbose) console.log("Commander addCommandTokens", params);
    this.commandTokens.splice(this.nextToken, 0, ...params);
  }
  /*
  Execute the sequence of commands and invoke a callback on completion
  */
  execute(commandTokens: string[]) {
    console.log("Commander", commandTokens);
    this.commandTokens = commandTokens;
    this.promise = new Promise<void>((resolve, reject) => {
      this.callback = (err: any) => {
        if (err) this.$tw.utils.error("Error: " + err);
        err ? reject(err) : resolve();
      };
    });
    this.executeNextCommand();
    return this.promise;
  }
  /*
  Execute the next command in the sequence
  */
  executeNextCommand() {

    // Invoke the callback if there are no more commands
    if (this.nextToken >= this.commandTokens.length) {
      this.callback(null);
      return;
    }

    // Get and check the command token
    let commandName = this.commandTokens[this.nextToken++] as string;
    if (commandName.slice(0, 2) !== "--") {
      console.log(this.commandTokens);
      this.callback("Missing command: " + commandName);
      return;
    }

    commandName = commandName.slice(2); // Trim off the --

    // Get the command info
    var command = commands[commandName], c, err;
    if (!command) {
      this.callback("Unknown command: " + commandName);
      return;
    }

    // Accumulate the parameters to the command
    const nextCommand = this.commandTokens.findIndex((token, i) => i >= this.nextToken && token.startsWith("--"));
    const params = this.commandTokens.slice(this.nextToken, nextCommand === -1 ? undefined : nextCommand);
    this.nextToken = nextCommand === -1 ? this.commandTokens.length : nextCommand;

    if (commandName !== divider.info.name)
      console.log("Commander executing", commandName, params);


    // Parse named parameters if required
    const paramsIfMandetory = !command.info.mandatoryParameters ? params :
      this.extractNamedParameters(params, command.info.mandatoryParameters);
    if (typeof params === "string") { this.callback(params); return; }

    new Promise<any>(async (resolve) => {
      const { Command, info } = command!;
      try {
        c = info.name === "mws-listen"
          ? this.create_mws_listen(paramsIfMandetory)
          : new Command(paramsIfMandetory, this, info.synchronous ? undefined : resolve);
        err = await c.execute();
        if (err || info.synchronous) resolve(err);
      } catch (e) {
        resolve(e);
      }
    }).then((err: any) => {
      if (err) {
        console.log(err);
        this.callback(err);
      } else {
        this.executeNextCommand();
      }
    });

  }
  /*
  Given an array of parameter strings `params` in name=value format, and an array of mandatory parameter names in `mandatoryParameters`, returns a hashmap of values or a string if error
  */
  extractNamedParameters(params: string[], mandatoryParameters?: string[]) {
    mandatoryParameters = mandatoryParameters || [];
    var errors: any[] = [], paramsByName = Object.create(null);
    // Extract the parameters
    each(params, function (param: string) {
      var index = param.indexOf("=");
      if (index < 1) {
        errors.push("malformed named parameter: '" + param + "'");
      }
      paramsByName[param.slice(0, index)] = param.slice(index + 1).trim();
    });
    // Check the mandatory parameters are present
    each(mandatoryParameters, function (mandatoryParameter: string) {
      if (!hop(paramsByName, mandatoryParameter)) {
        errors.push("missing mandatory parameter: '" + mandatoryParameter + "'");
      }
    });
    // Return any errors
    if (errors.length > 0) {
      return errors.join(" and\n");
    } else {
      return paramsByName;
    }
  }
}

