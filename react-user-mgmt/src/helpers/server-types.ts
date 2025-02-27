import { Prisma } from "@prisma/client";
import { proxy } from "./prisma-proxy";


type PrismaField<T extends Prisma.ModelName, K extends keyof PrismaPayloadScalars<T>> =
  // manually map foriegn keys to their corresponding primary key so comparisons work
  [T, K] extends ["acl", "role_id"] ? PrismaField<"roles", "role_id"> :
  [T, K] extends ["acl", "permission_id"] ? PrismaField<"permissions", "permission_id"> :
  [T, K] extends ["user_roles", "role_id"] ? PrismaField<"roles", "role_id"> :
  (PrismaPayloadScalars<T>[K] & { __prisma_table: T, __prisma_field: K })
  | (null extends PrismaPayloadScalars<T>[K] ? null : never);
type PrismaPayloadScalars<T extends Prisma.ModelName>
  = Prisma.TypeMap["model"][T]["payload"]["scalars"]


// at some point I'll probably replace this with a direct reference to the server types
const listBags = proxy.bags.findMany({
  select: {
    bag_id: true,
    bag_name: true,
    description: true,
    accesscontrol: true,
  },
  orderBy: {
    bag_name: "asc"
  }
});

export type ListBagsResult = Awaited<typeof listBags>;

const listRecipes = proxy.recipes.findMany({
  select: {
    recipe_name: true,
    recipe_id: true,
    description: true,
    owner_id: true,
    recipe_bags: { select: { bag: { select: { bag_name: true } } } }
  },
  orderBy: {
    recipe_name: "asc"
  }
}).then(recipes => recipes.map(recipe => ({
  ...recipe,
  recipe_bags: undefined,
  bag_names: recipe.recipe_bags.map(e => e.bag.bag_name),
  has_acl_access: true,
})));

export type ListRecipesResult = Awaited<typeof listRecipes>;

export interface IndexJson {
  "bag-list": ListBagsResult,
  "recipe-list": ListRecipesResult,
  username: string;
  "user-is-admin": boolean | null;
  "first-guest-user": boolean;
  "show-anon-config": boolean;
  "user-is-logged-in": boolean;
  user: {
    user_id: PrismaField<"users", "user_id">;
    recipe_owner_id: PrismaField<"recipes", "owner_id"> & {};
    isAdmin: boolean;
    username: string;
    sessionId: PrismaField<"sessions", "session_id">;
  } | null;
  "has-profile-access": boolean;
  allowReads: boolean;
  allowWrites: boolean;
};
