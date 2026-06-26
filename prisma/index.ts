import type { Prisma } from "./client/client.ts";
export * from "./client/client.ts";
export * from "./types.ts";

declare global {
  namespace PrismaJson {

    /** A tiddler's fields and body, stored as a single JSON column. */
    type Tiddler_fields = Record<string, string>;

    /** A single bound parameter value. Bag/plugin params are ids; string params are strings. */
    type ParameterValue = string | string[];

    /** Bound parameter values on a template (the parameter set is fixed at creation). */
    type Template_parameters = Record<string, ParameterValue>;

    /** Wiki-level parameter values supplying what the template left open. */
    type Recipe_parameters = Record<string, ParameterValue>;

    type RecipeBag_info = {};
    type Template_type = "simpleV1" | "prefixV1";



  }
}

declare global {


  /** 
   * This primarily makes sure that positional arguments are used correctly
   * (so you can't switch a title and bag_name around).
   * 
   * If you assign the wrong value (like `5 as PrismaField<"Bags", "bag_name">`), 
   * this will result in a type error on the as keyword, allowing you to catch incorrect types quickly.
  */
  type PrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>> =
    // manually map foriegn keys to their corresponding primary key so comparisons work
    // this should remove the need for any global helper functions to convert between types.

    // I've tried to prevent this from being flattened, but I can't figure out how.
    // It doesn't really matter, just annoying.
    (
      [T, K] extends ["Tiddler", "bag_id"] ? PrismaField<"Bag", "id"> :
      [T, K] extends ["TiddlerEvent", "bag_id"] ? PrismaField<"Bag", "id"> :
      [T, K] extends ["BagPermission", "bag_id"] ? PrismaField<"Bag", "id"> :
      [T, K] extends ["BagPermission", "role_id"] ? PrismaField<"Roles", "role_id"> :
      [T, K] extends ["Recipe", "template_id"] ? PrismaField<"Template", "id"> :
      [T, K] extends ["RecipePermission", "recipe_id"] ? PrismaField<"Recipe", "id"> :
      [T, K] extends ["RecipePermission", "role_id"] ? PrismaField<"Roles", "role_id"> :
      [T, K] extends ["RecipeBag", "recipe_id"] ? PrismaField<"Recipe", "id"> :
      [T, K] extends ["RecipeBag", "bag_id"] ? PrismaField<"Bag", "id"> :
      [T, K] extends ["RecipePlugin", "recipe_id"] ? PrismaField<"Recipe", "id"> :
      [T, K] extends ["Session", "user_id"] ? PrismaField<"Users", "user_id"> :
      IsEnum<PrismaPayloadScalars<T>[K], true, false> extends true ? PrismaPayloadScalars<T>[K] :
      (PrismaPayloadScalars<T>[K] & { __prisma_table?: T, __prisma_field?: K })
    ) | (null extends PrismaPayloadScalars<T>[K] ? null : never);


  type IsEnum<T, A, B> = T extends string ? string extends T ? B : A : B
  type PrismaPayloadScalars<T extends Prisma.ModelName>
    = Prisma.TypeMap["model"][T]["payload"]["scalars"];

  function castPrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>, V>(a: Map<PrismaField<T, K>, V>): Map<PrismaPayloadScalars<T>[K], V>;
  function castPrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>, V>(a: Map<V, PrismaField<T, K>>): Map<V, PrismaPayloadScalars<T>[K]>;
  function castPrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>>(a: PrismaField<T, K>[]): PrismaPayloadScalars<T>[K][];
  function castPrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>>(a: PrismaField<T, K>[]): PrismaPayloadScalars<T>[K][];
  function castPrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>>(a: PrismaField<T, K>): PrismaPayloadScalars<T>[K];

}
export { };

global.castPrismaField = (e: any) => e;
