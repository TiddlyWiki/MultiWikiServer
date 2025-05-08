
import * as path from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import { PasswordService } from "./services/PasswordService";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { TW } from "tiddlywiki";
import { dist_resolve } from "./utils";
import * as commander from "commander";
import { commands, divider } from "./commands";
import { ok } from "node:assert";
import { SqliteAdapter } from "./db/sqlite-adapter";
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
  description: string;
  arguments: [string, string][];
  options?: [string, string][];
  internal?: boolean;
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
  // namedParameterMode?: boolean;
  // mandatoryParameters?: string[];
}

export interface SiteConfig {
  /** If true, allow users that aren't logged in to read. */
  readonly allowAnonReads?: boolean
  /** If true, allow users that aren't logged in to write. */
  readonly allowAnonWrites?: boolean
  /** If true, recipes will allow access to a user who does not have read access to all its bags. */
  readonly allowUnreadableBags?: boolean

  readonly enableGzip?: boolean
  readonly enableBrowserCache?: boolean

  wikiPath: string;
  attachmentSizeLimit: number;
  attachmentsEnabled: boolean;
  contentTypeInfo: Record<string, any>;
  storePath: string;

}

// move the startup logic into a separate class
class StartupCommander {
  fieldModules;
  constructor(
    public wikiPath: string,
    public $tw: TW,
    public PasswordService: PasswordService,
  ) {

    this.fieldModules = $tw.Tiddler.fieldModules;

    this.storePath = path.resolve(this.wikiPath, "store");
    this.cachePath = path.resolve(this.wikiPath, "cache");
    this.databasePath = path.resolve(this.storePath, "database.sqlite");

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
      storePath: this.storePath,
      contentTypeInfo: $tw.config.contentTypeInfo,
      enableBrowserCache: true,
      enableGzip: true,
      attachmentsEnabled: false,
      attachmentSizeLimit: 100 * 1024, // 100 KB
    };

    this.adapter = new SqliteAdapter(this.databasePath);
    this.engine = new PrismaClient({ log: ["info", "warn", "query"], datasourceUrl: "file:" + this.databasePath });

  }

  async init() {
    await this.adapter.init();
    this.setupRequired = false;
    const users = await this.engine.users.count();
    if (!users) { this.setupRequired = true; }

  }

  storePath: string;
  databasePath: string;
  cachePath: string;

  adapter!: SqliteAdapter;
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
  /** Signals that database setup is required. May be set to false by any qualified setup command. */
  setupRequired: boolean = true;
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
    wikiPath: string,
    $tw: TW,
    PasswordService: PasswordService,
  ) {
    super(wikiPath, $tw, PasswordService);
    this.nextToken = 0;
    this.verbose = false;
  }

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
    this.setPromise();
    this.commandTokens = commandTokens;
    this.executeNextCommand();
    return this.promise;
  }
  setPromise() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.callback = (err: any) => {
        if (err) this.$tw.utils.error("Error: " + err);
        err ? reject(err) : resolve();
      };
    });
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

    // if (commandName !== divider.info.name)
    //   console.log("Commander executing", commandName, params);


    // Parse named parameters if required
    // const paramsIfMandetory = params;
    if (typeof params === "string") { this.callback(params); return; }

    new Promise<any>(async (resolve) => {
      const { Command, info } = command!;
      try {
        c = new Command(params, this, info.synchronous ? undefined : resolve);
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

  getHelpInfo() {

    const program = new commander.Command();
    const pkg = JSON.parse(readFileSync(dist_resolve("../package.json"), "utf-8"));

    const mainHelp = "Usage: mws [options] [commands]\n\n" + program
      .name("mws")
      .description(pkg.description)
      .option("--password-key-file <string>", "path to the password master key, changing this invalidates all passwords")
      .option("--wiki-path <string>", "path to the data folder")
      .option("--listen [options...]", "listener options, cannot be specified alongside commands (multiple --listen allowed)")
      .configureHelp({
        helpWidth: 100
      })
      .helpOption(false)
      .enablePositionalOptions()
      .passThroughOptions()
      .helpInformation()
      .split("\n").slice(2).join("\n");

    const listenHelp = program.command("--listen")
      .option("--host=<string>", "the host string, passed directly to NodeJS")
      .option("--port=<number>", "the port number, defaults to env.PORT, or 8080. \nUse 0 to let Node find a random port.")
      .option("--prefix=<string>", "the URL pathname this listener is mounted at, must begin with a slash")
      .option("--key=<string>", "HTTPS private key, relative to current directory")
      .option("--cert=<string>", "HTTPS public certificate, relative to current directory")
      .action((options, command) => { console.log(options, command.parent.opts()); })
      .helpOption(false)
      .configureHelp({
        styleOptionTerm(str: string) {
          if (str.startsWith("--")) return str.slice(2);
          return str;
        },
        helpWidth: 90
      })
      .helpInformation()
      .split('\n').slice(3).map(e => "    " + e).join('\n')

    const lines = [];
    lines.push(mainHelp);
    lines.push(listenHelp);
    lines.push("Commands:")


    lines.push(
      Object.keys(commands)
        .map(key => {
          const c = commands[key]!;
          if (c.info.internal) return;
          if (c.info.name === "help") return;
          const command = program.command(c.info.name);
          command.description(c.info.description);
          c.info.arguments.forEach(([name, description]) => {
            command.argument(name, description);
          });
          c.info.options?.forEach(([name, description]) => {
            command.option("--" + name + "=<string>", description);
          });

          command.action((...args) => { });
          command.helpOption(false);
          command.configureHelp({
            styleOptionTerm(str: string) {
              if (str.startsWith("--")) return str.slice(2);
              return str;
            },
            helpWidth: 90
          });
          const lines: string[] = [];
          lines.push(c.info.description);
          lines.push("");
          lines.push(`Usage:  --${c.info.name} ${c.info.arguments.map(e => `<${e[0]}>`).join(" ")} ${c.info.options?.length ? "[options]" : ""}`);
          lines.push(command.helpInformation().split('\n').slice(3).join('\n'));
          return lines.join("\n");
        })
        .filter(e => e)
        .map(e => "─".repeat(100) + "\n" + e)
        .join("\n")
    );



    return lines.join("\n");
  }

}

