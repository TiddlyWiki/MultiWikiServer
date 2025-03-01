import { filterAsync, mapAsync } from "../../helpers";
import { makeEndpoint } from "./api";

export const serverIndexJson = makeEndpoint({
  methodType: "READ",
  zodRequest: z => ({}),
  handler: async (state) => {
    // Get the bag and recipe information
    const bagList = await state.store.listBags(),
      recipeList = await state.store.listRecipes();

    // filter bags and recipies by user's read access from ACL
    const allowedRecipes = await filterAsync(recipeList, async recipe =>
      recipe.recipe_name.startsWith("$:/")
      || state.authenticatedUser?.isAdmin
      || state.authenticatedUser
      && await state.store.sql.hasRecipePermission(
        state.authenticatedUser.user_id,
        recipe.recipe_name,
        state.store.permissions.READ
      )
      || state.allowAnon && state.allowAnonReads
    );

    const allowedBags = await filterAsync(bagList, async bag =>
      bag.bag_name.startsWith("$:/")
      || state.authenticatedUser?.isAdmin
      || state.authenticatedUser && await state.store.sql.hasBagPermission(
        state.authenticatedUser.user_id,
        bag.bag_name,
        state.store.permissions.READ
      )
      || state.allowAnon && state.allowAnonReads
    );

    const allowedRecipesWithWrite = await mapAsync(allowedRecipes, async recipe => ({
      ...recipe,
      has_acl_access: state.authenticatedUser && (
        state.authenticatedUser.isAdmin
        || recipe.owner_id === state.authenticatedUser.recipe_owner_id
        || await state.store.sql.hasRecipePermission(
          state.authenticatedUser.user_id,
          recipe.recipe_name,
          state.store.permissions.WRITE
        )
      )
    }))

    // const variables = {
    //   // "page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-index",
    //   "bag-list": (allowedBags),
    //   "recipe-list": (allowedRecipesWithWrite),
    //   "username": state.authenticatedUser
    //     ? state.authenticatedUser.username
    //     : state.firstGuestUser
    //       ? "Anonymous User"
    //       : "Guest",
    //   "user-is-admin": !!(state.authenticatedUser && state.authenticatedUser.isAdmin),
    //   "first-guest-user": state.firstGuestUser,
    //   "show-anon-config": state.showAnonConfig,
    //   "user-is-logged-in": !!state.authenticatedUser,
    //   "user": state.authenticatedUser,
    //   "has-profile-access": !!state.authenticatedUser,
    //   allowReads: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined"),
    //   allowWrites: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined"),
    // };

    return {
      allowedBags,
      allowedRecipesWithWrite,
      authUser: state.authenticatedUser,
      firstGuestUser: state.firstGuestUser,
      allowReads: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined"),
      allowWrites: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined"),

    }
  },
  zodResponse: z => z.object({
    allowedBags: z.object({
      bag_id: z.prismaField("bags", "bag_id", "number"),
      bag_name: z.prismaField("bags", "bag_name", "string"),
      description: z.prismaField("bags", "description", "string"),
      accesscontrol: z.prismaField("bags", "accesscontrol", "string").nullable(),
    }).array(),
    allowedRecipesWithWrite: z.object({
      recipe_id: z.prismaField("recipes", "recipe_id", "number"),
      recipe_name: z.prismaField("recipes", "recipe_name", "string"),
      description: z.prismaField("recipes", "description", "string"),
      owner_id: z.prismaField("recipes", "owner_id", "number").nullable(),
      has_acl_access: z.boolean().nullable(),
      bag_names: z.prismaField("bags", "bag_name", "string").array(),
    }).array(),
    authUser: z.object({
      user_id: z.prismaField("users", "user_id", "number"),
      username: z.prismaField("users", "username", "string"),
      isAdmin: z.boolean(),
    }).nullable(),
    firstGuestUser: z.boolean(),
    allowReads: z.boolean(),
    allowWrites: z.boolean(),
  }),
})