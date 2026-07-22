import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { serverEvents } from "@tiddlywiki/events";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile, rename } from "node:fs/promises";
import * as path from "node:path";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { x as extractTar } from 'tar';


serverEvents.on("cli.register", (commands) => {
  commands[info.name] = { info, Command: UpdateTiddlyWikiCommand };
});

interface TW5RegistryInfo {
  _id: string;
  _rev: string;
  _etag?: string | null;
  _modified?: string | null;
  versions: Record<string, any>;
  "dist-tags": { latest: string; };
}

const info: CommandInfo = {
  name: "update-tiddlywiki",
  description: "Update TiddlyWiki to the latest version",
  arguments: [],
  options: [
    ["registry-url", "Download the tiddlywiki registry entry from this URL instead of NPM."],
    ["manual-tarball", "Path to a tarball file to manually extract instead of downloading. This runs the command entirely offline. The version will be extracted from the package.json file."],
  ],
  getHelp() {
    return [
      "",
      "This command does the following actions:",
      "- Download the registry entry from NPM.",
      "- Download the latest tarball specified in the registry.",
      "- Extract the tarball to a versioned directory.",
      "",
      "MWS will auto-detect and use the latest version on startup.",
    ].join("\n")
  },
};


export class UpdateTiddlyWikiCommand extends BaseCommand<[], {
  "registry-url"?: [string];
  "manual-tarball"?: [string];
}> {
  static info = info;

  wikiPath!: string;

  async execute() {
    // this gets called early, so it cannot expect the normal MWS config environment
    // from "cli.execute.before" in startup.ts. It cannot call other commands.
    await new UpdateTiddlyWiki(
      this.options["registry-url"]?.[0],
      this.options["manual-tarball"]?.[0]
    ).getLatestTiddlyWiki(this.wikiPath);
  }

}


export class UpdateTiddlyWiki {

  constructor(
    private registryUrl: string = "https://registry.npmjs.org/tiddlywiki",
    private manualTarball: string | null = null,
  ) {

  }

  /** This figures out if TiddlyWiki is compressed inside a folder */
  findPrefix(filenames: string[], prefix: string[]): string[] {
    const tops = new Set<string>();
    for (const e of filenames) {
      const parts = e.split("/").slice(prefix.length);
      tops.add(parts[0]);
    }
    if (tops.size === 1)
      return this.findPrefix(filenames, [...prefix, [...tops][0]]);
    else if (tops.has("boot") && tops.has("core"))
      return prefix;
    else
      throw new Error("extracted files don't make sense.");
  }

  async getLatestTiddlyWiki(wikiPath: string) {
    if (!wikiPath) throw new Error("wikiPath is required");
    await mkdir(path.resolve(wikiPath, "tw5"), { recursive: true });
    let tarballPath: string;
    if (this.manualTarball) {
      tarballPath = path.resolve(this.manualTarball);
      console.log("Extracting TiddlyWiki manually");
    } else {
      console.log("Fetching latest TiddlyWiki info...");
      const tw5Info = await this.getTiddlyWikiNPM(wikiPath);
      const latest = tw5Info["dist-tags"].latest;
      const latestInfo = tw5Info.versions[latest];
      tarballPath = path.resolve(wikiPath, "tw5", "tw5-" + latest + ".tgz");
      if (!existsSync(tarballPath)) {
        console.log("Fetching TiddlyWiki", latest, "tarball...");
        const download = await fetch(latestInfo.dist.tarball);
        await download.body!.pipeTo(Writable.toWeb(createWriteStream(tarballPath)));
      }
      console.log("TiddlyWiki download complete");
    }

    const filenames: string[] = [];
    const extractFolder = path.resolve(wikiPath, "tw5", "tw5-extract");
    await rm(extractFolder, { recursive: true, force: true });
    await mkdir(extractFolder, { recursive: true });
    await pipeline(
      createReadStream(tarballPath),
      createGunzip(),
      extractTar({
        C: extractFolder,
        onReadEntry: entry => filenames.push(entry.path),
      }),
    );

    const prefix = this.findPrefix(filenames, []);
    const extractFolder2 = path.resolve(wikiPath, "tw5", "tw5-extract", ...prefix);
    const { version } = JSON.parse(await readFile(path.resolve(extractFolder2, "package.json"), "utf8"));
    const newFolder = path.resolve(wikiPath, "tw5", "tw5-" + version);
    if (existsSync(newFolder))
      throw "the tw5/tw5-" + version + " folder already exists, the tarball was successfully extracted to tw5/tw5-extract.";
    await rename(extractFolder2, newFolder);
    await rm(extractFolder, { recursive: true, force: true });
    console.log("Tiddlywiki extracted to", path.relative(wikiPath, newFolder))

  }

  async getTiddlyWikiNPM(wikiPath: string): Promise<TW5RegistryInfo> {
    const registryFile = path.resolve(wikiPath, "tw5", "tw5-registry.json");
    const tw5info: TW5RegistryInfo | undefined
      = existsSync(registryFile) ? JSON.parse(await readFile(registryFile, "utf8")) : undefined;

    const res = await fetch(this.registryUrl, {
      headers: tw5info ? {
        ...tw5info._etag ? { "if-none-match": "W/" + tw5info._etag } : {},
        ...tw5info._modified ? { "if-modified-since": tw5info._modified } : {},
      } : {}
    });

    if (res.status === 304) {
      if (!tw5info) throw new Error("This error should never occur. Please include the stack trace in your report.");
      return tw5info;
    } else {
      const newJson = await res.json();
      newJson._etag = res.headers.get("if-none-match");
      newJson._modified = res.headers.get("if-modified-since");
      await writeFile(path.resolve(wikiPath, "tw5", "tw5-registry.json"), JSON.stringify(newJson, null, 2));
      return newJson;
    }
  }
}