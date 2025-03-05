import { ApiStateObject } from "../../StateObject";
import { makeEndpoint } from "./_index";

export const serverCreateBag = makeEndpoint({
  zodRequest: z => z.object({
    bag_name: z.string(),
    description: z.string(),
    owned: z.boolean(),
  }),
  handler: async (state, { bag_name, description, owned }) => {

    if (!state.authenticatedUser) throw "User not authenticated";

    if (!state.authenticatedUser.isAdmin && !owned) throw "User is not an admin and cannot create a bag that is not owned";

    const bag = await state.prisma.bags.create({
      data: {
        bag_name,
        description,
        owner_id: owned ? state.authenticatedUser.user_id : null
      },
    });

    return bag;
  },
  zodResponse: z => z.any(),
});




export const serverDeleteBag = makeEndpoint({
  zodRequest: z => z.object({
    bag_name: z.string(),
  }),
  handler: async (state, { bag_name }) => {
    const bag = await authorizeBagOwner(state, bag_name);

    const hasTiddlers = await state.prisma.tiddlers.count({
      where: { bag_id: bag.bag_id }
    });

    if (hasTiddlers) throw "Bag is not empty";

    await state.prisma.bags.delete({
      where: { bag_id: bag.bag_id }
    });

    return null;
  },
  zodResponse: z => z.null(),
});


export const serverListBags = makeEndpoint({
  zodRequest: z => z.undefined(),
  handler: async (state) => {

    const bags = await state.prisma.bags.findMany({
      select: {
        bag_id: true,
        bag_name: true,
        description: true,
      }
    });

    return bags;
  },
  zodResponse: z => z.any(),
});


export const serverEditBag = makeEndpoint({
  zodRequest: z => z.object({
    bag_name: z.string(),
    description: z.string(),
  }),
  handler: async (state, { bag_name, description }) => {
    const bag = await authorizeBagOwner(state, bag_name);

    await state.prisma.bags.update({
      where: { bag_id: bag.bag_id },
      data: { description }
    });

    return null;
  },
  zodResponse: z => z.null(),
});

/** Authorizes owner-level access and returns the bag. */
async function authorizeBagOwner(state: ApiStateObject, bag_name: string) {
  if (!state.authenticatedUser) throw "User not authenticated";

  const bag = await state.prisma.bags.findUnique({
    where: { bag_name },
    select: {
      bag_id: true,
      owner_id: true,
    }
  });

  if (!bag) throw "Bag not found";

  const { isAdmin, user_id } = state.authenticatedUser;

  const isOwner = bag.owner_id === user_id;

  if (!isOwner && !isAdmin) throw "User is not the bag owner or an admin";
  return bag;
}
