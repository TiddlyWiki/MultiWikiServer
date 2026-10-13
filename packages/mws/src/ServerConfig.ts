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
    recipe: routeRootSchema.default("/recipe"),
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
  staticMounts: fileSystemMountsSchema.prefault([]),
}).prefault({});

export function loadConfigSync(wikiPath: string) {
  const cfgPath = join(wikiPath, "config.json");
  return serverConfigSchema.parse(
    existsSync(cfgPath)
      ? JSON5.parse(readFileSync(cfgPath, "utf8"))
      : undefined
  );
}
