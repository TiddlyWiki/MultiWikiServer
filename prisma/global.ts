import type { Prisma } from "prisma-client";

declare global {
  namespace PrismaJson {
    type Recipes_plugin_names = string[];
    type Recipe_bags_partitioned_bags = {
      /** partitioned bags allow each user with write access to write to `${title_prefix}${username}` */
      title_prefix: string;
      /** 
       * everyone with acl read can read all tiddlers 
       * 
       * if this is false, admins can still do this, but they will be in a restricted readonly mode.
       */
      everyone_readable: boolean;
      /** 
       * everyone with acl write can write normal tiddlers.
       * 
       * site and entity admins can always do this.
       */
      normally_writable: boolean;
    }
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
      [T, K] extends ["Tiddlers", "bag_id"] ? PrismaField<"Bags", "bag_id"> :
      [T, K] extends ["Sessions", "user_id"] ? PrismaField<"Users", "user_id"> :
      [T, K] extends ["Recipe_bags", "bag_id"] ? PrismaField<"Bags", "bag_id"> :
      [T, K] extends ["Recipe_bags", "recipe_id"] ? PrismaField<"Recipes", "recipe_id"> :
      [T, K] extends ["Recipes", "owner_id"] ? PrismaField<"Users", "user_id"> :
      [T, K] extends ["Bags", "owner_id"] ? PrismaField<"Users", "user_id"> :
      (PrismaPayloadScalars<T>[K] & { __prisma_table: T, __prisma_field: K })
    ) | (null extends PrismaPayloadScalars<T>[K] ? null : never);

  type PrismaPayloadScalars<T extends Prisma.ModelName>
    = Prisma.TypeMap["model"][T]["payload"]["scalars"]
}
