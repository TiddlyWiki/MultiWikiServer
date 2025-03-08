import { ApiStateObject } from "../../StateObject";
import { makeEndpoint } from "./_index";

export const serverIndexJson = makeEndpoint({
  zodRequest: z => z.undefined(),
  handler: async (state) => {

    const { OR } = state.getBagWhereACL("READ");

    const { isAdmin, user_id, username } = state.authenticatedUser ?? { isAdmin: false, user_id: 0, username: "(anon)" };

    const bagList = await state.prisma.bags.findMany({
      include: {
        _count: {
          select: {
            acl: { where: { permission: "ADMIN", role: { users: { some: { user_id } } } } }
          }
        }
      },
      where: { OR }
    });

    const recipeList = await state.prisma.recipes.findMany({
      include: { recipe_bags: { select: { bag_id: true, position: true, } } },
      where: { recipe_bags: { every: { bag: { OR } } } }
    });

    return {
      bagList,
      recipeList,
      isAdmin,
      user_id,
      username,
      firstGuestUser: !!state.firstGuestUser,
      allowReads: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined"),
      allowWrites: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined"),
    }
  },
  zodResponse: z => z.object({
    bagList: z.any(),
    recipeList: z.any(),
    authUser: z.authUser().nullable(),
    firstGuestUser: z.boolean(),
    allowReads: z.boolean(),
    allowWrites: z.boolean(),
  }),
})