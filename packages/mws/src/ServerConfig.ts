import { zod } from "@tiddlywiki/server";
import { existsSync, readFileSync, openSync } from "fs";
import { join } from "path";
import * as JSON5 from "json5";
import { fileSystemMountsSchema } from "./new-managers";

const routeRootSchema = zod.string().regex(
  /^\/.*[^/]$/,
  "Route roots must start with '/' and must not end with '/'"
);
const optionalRouteRootSchema = routeRootSchema.or(zod.literal(""));

const serverConfigSchema = zod.object({
  routeRoots: zod.object({
    assets: routeRootSchema.default("/$assets"),
    cache: routeRootSchema.default("/$cache"),
    recipe: routeRootSchema.default("/$recipe"),
    admin: routeRootSchema.default("/admin"),
    wiki: optionalRouteRootSchema.default("/wiki"),
    static: optionalRouteRootSchema.default("/static"),
    tw5: routeRootSchema.default("/tw5"),
  }).superRefine(
    ({ wiki: wikiRoot, static: staticRoot }, context) => {
      if (wikiRoot && (wikiRoot === staticRoot)) {
        context.addIssue({
          code: "custom",
          message: "Wiki and static route roots must differ when non-empty",
          path: [wikiRoot && !staticRoot ? "wiki" : "static"],
        });
      }
    }
  ).prefault({}),
  staticMounts: fileSystemMountsSchema.prefault(process.env.DEVSERVER ? [{
    folderPath: "./test", webPath: "/test", putSaver: true
  }] : []),
  demandHTTPS: zod.boolean().default(false).describe([
    "Requires all requests to fulfill one of three criteria:",
    "- Recieved through an HTTPS listener",
    "- Recieved through an HTTP listener with --secure set",
    "- Contains the headers sec-fetch-dest and sec-fetch-mode",
    "",
    "This does not absolutely guarantee that HTTPS is in use, ",
    "since a request made outside a browser can manually set those headers. ",
    "",
    "Requests made by third-party tools may need to add those headers manually. ",
    "See pageSecurityLevel for more information. ",
  ].join("\n")),
  denyCrossPageScriptingAttacks: zod.boolean().default(false).describe([
    "Setting this to true requires HTTPS or localhost in the URL (it uses sec-fetch-* headers).",
    "",
    "In TiddlyWiki, users are able to write Javascript which other users are forced to run when they load the page. This lets them write code which executes with the permissions of the user reading the page. If that user is an admin, they have full access to everything on the admin dashboard, including changing permissions for the attacking user or content they were never given permission to read.",
    "",
    "To combat this, MWS uses standard HTTP features to isolate pages. However, these features require HTTPS to be enabled, which is not the primary use case of MWS. Therefore setting this property to false will cause most pages to not work without HTTPS.",
    "",
    "Setting up HTTPS is generally quite simple. You can generate a HTTPS cert and key and then specify them in your listen parameters. It's a little harder if you aren't using a public domain name.",
  ].join("\n")),
}).prefault({});

export function loadConfigSync(wikiPath: string) {
  const cfgPath = join(wikiPath, "config.json");
  return serverConfigSchema.parse(
    existsSync(cfgPath)
      ? JSON5.parse(readFileSync(cfgPath, "utf8"))
      : undefined
  );
}

