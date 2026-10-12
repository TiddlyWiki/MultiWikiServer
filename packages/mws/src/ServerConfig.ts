import { zod } from "@tiddlywiki/server";
import { existsSync, readFileSync, openSync } from "fs";
import { join } from "path";
import * as JSON5 from "json5";

const routeRootSchema = zod.string().regex(
  /^\/.*[^/]$/,
  "Route roots must start with '/' and must not end with '/'"
);

const serverConfigSchema = zod.object({
  routeRoots: zod.object({
    cache: routeRootSchema.default("/$cache"),
    recipe: routeRootSchema.default("/recipe"),
    admin: routeRootSchema.default("/admin"),
    wiki: routeRootSchema.default("/wiki"),
    static: routeRootSchema.default("/static"),
    tw5: routeRootSchema.default("/tw5"),
  }).prefault({}),
}).prefault({});

export function loadConfigSync(wikiPath: string) {
  const cfgPath = join(wikiPath, "config.json");
  return serverConfigSchema.parse(
    existsSync(cfgPath)
      ? JSON5.parse(readFileSync(cfgPath, "utf8"))
      : undefined
  );
}
