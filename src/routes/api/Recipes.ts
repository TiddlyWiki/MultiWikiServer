import { ApiStateObject } from "../../StateObject";
import { makeEndpoint } from "./_index";

export const serverCreateRecipe = makeEndpoint({
  zodRequest: z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.string()),
    owned: z.boolean(),
  }),
  handler: async (state, { recipe_name, description, bag_names, owned }) => {

    if (!state.authenticatedUser) throw "User not authenticated";

    if (!state.authenticatedUser.isAdmin && !owned) throw "User is not an admin and cannot create a recipe that is not owned";

    const bags = await state.prisma.bags.findMany({
      where: { bag_name: { in: bag_names } },
      include: { acl: true }
    });

    const recipe = await state.prisma.recipes.create({
      data: {
        recipe_name,
        description,
        recipe_bags: { create: bags.map((bag, position) => ({ bag_id: bag.bag_id, position })) },
        owner_id: owned ? state.authenticatedUser.user_id : null
      },
    });

    return recipe;
  },
  zodResponse: z => z.any(),
});