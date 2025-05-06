import "./routes/router";
import "./StateObject";
import "./streamer";
import "./global";
import * as opaque from "@serenity-kit/opaque";
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { bootTiddlyWiki } from "./tiddlywiki";
import { Commander } from "./commander";
import { createPasswordService } from "./services/PasswordService";
import { join } from "node:path";
import { startListeners } from "./listeners";
// import * as http2 from "http2";
export * from "./services/sessions";


export interface MWSConfigConfig {
  /** If true, allow users that aren't logged in to read. */
  readonly allowAnonReads?: boolean
  /** If true, allow users that aren't logged in to write. */
  readonly allowAnonWrites?: boolean
  /** If true, recipes will allow access to a user who does not have read access to all its bags. */
  readonly allowUnreadableBags?: boolean
  /** If true, files larger than `this * 1024` will be saved to disk alongside the database instead of in the database. */
  readonly saveLargeTextToFileSystem?: number;
  readonly enableGzip?: boolean
  readonly enableBrowserCache?: boolean
  /** The path prefix must start with a slash, and end without a slash */
  readonly pathPrefix?: string;
}


export interface SiteConfig extends MWSConfigConfig {
  wikiPath: string;
  attachmentSizeLimit: number;
  attachmentsEnabled: boolean;
  contentTypeInfo: Record<string, any>;
  saveLargeTextToFileSystem: never;
  storePath: string;
  /** 
   * The path prefix is a essentially folder mount point. 
   * 
   * It starts with a slash, and ends without a slash (`"/dev"`). 
   * 
   * If there is not a prefix, it is an empty string (`""`). 
   */
  pathPrefix: string;
}



interface NewConfig {
  listeners: { host: string; port: string; prefix: string; key: string; cert: string; }[];
  passwordKeyFile: string;
  wikiPath: string;
}

export default async function startServer() {

  await opaque.ready;

  const cli = process.argv.slice(2);
  const wikiPath = process.cwd();
  if (!existsSync(wikiPath)) throw "The wiki path does not exist";
  const passwordKeyFile = join(wikiPath, "passwords.key");

  if (typeof passwordKeyFile === "string"
    && passwordKeyFile
    && !existsSync(passwordKeyFile)
  ) {
    writeFileSync(passwordKeyFile, opaque.server.createSetup());
    console.log("Password master key created at", passwordKeyFile);
  }

  const passwordMasterKey = readFileSync(passwordKeyFile, "utf8").trim();

  const $tw = await bootTiddlyWiki(wikiPath);
  const pw = await createPasswordService(passwordMasterKey);

  const commander = new Commander(wikiPath, $tw, pw);

  await commander.init();

  if (commander.setupRequired && cli[0] !== "--init-store" && cli[0] !== "--load-archive") {
    console.log("MWS setup required. Please run either init-store or load-archive");
    process.exit(1);
  }

  if (cli[0] === "--listen")
    await startListeners(cli, commander);
  else
    await commander.execute(cli);

}
