import { ApiStateObject } from "../../StateObject";
import { makeEndpoint } from "./_index";

export const serverIndexJson = makeEndpoint({
  zodRequest: z => z.undefined(),
  handler: async (state) => {
    // Get the bag and recipe information
    const bagList = await state.prisma.bags.findMany({
      include: {
        recipe_bags: { select: { recipe: true, position: true } },
        acl: { include: { role: true } }
      },
      where: state.getBagWhereACL("READ")
    });

    const { isAdmin, user_id, username } = state.authenticatedUser ?? {}

    return {
      bagList,
      authUser: state.authenticatedUser ? { isAdmin, user_id, username } : null,
      firstGuestUser: !!state.firstGuestUser,
      allowReads: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined"),
      allowWrites: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined"),

    }
  },
  zodResponse: z => z.object({
    bagList: z.any(),
    authUser: z.authUser().nullable(),
    firstGuestUser: z.boolean(),
    allowReads: z.boolean(),
    allowWrites: z.boolean(),
  }),
})