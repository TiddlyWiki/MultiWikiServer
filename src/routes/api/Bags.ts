import { ApiStateObject } from "../../StateObject";
import { DataChecks } from "../../store/data-checks";
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

export const serverListACL = makeEndpoint({
  zodRequest: z => z.object({
    recipe_name: z.prismaField("Recipes", "recipe_name", "string", false),
    // bag_name: z.prismaField("Bags", "bag_name", "string", false),
  }),
  handler: async (state, { recipe_name }) => {
    if (!state.authenticatedUser) throw "User not authenticated";

    const recipe = await state.prisma.recipes.findUnique({
      where: { recipe_name },
      include: { recipe_bags: { include: { bag: { include: { acl: true } } } } },
    });

    if (!recipe) throw "Recipe not found";

    const permissions = Object.keys(state.store.permissions);

    const roles = await state.prisma.roles.findMany();

    return {
      recipe,
      permissions,
      roles,
    }

  },
  zodResponse: z => z.any(),
  // zodResponse: z => z.object({
  //   roles: z.array(z.object({
  //     role_id: z.number(),
  //     role_name: z.string(),
  //     description: z.string().nullable(),
  //   })),
  //   recipe: z.object({
  //     recipe_id: z.number(),
  //     recipe_name: z.string(),
  //   }),
  //   bag: z.object({
  //     bag_id: z.number(),
  //     bag_name: z.string(),
  //   }),
  //   recipeAclRecords: z.array(z.object({
  //     acl_id: z.number(),
  //     entity_name: z.string(),
  //     entity_type: z.string(),
  //     permission: z.string(),
  //     role_id: z.number(),
  //     role: z.object({
  //       role_id: z.number(),
  //       role_name: z.string(),
  //       description: z.string().nullable(),
  //     }).optional(),
  //   })),
  //   bagAclRecords: z.array(z.object({
  //     acl_id: z.number(),
  //     entity_name: z.string(),
  //     entity_type: z.string(),
  //     permission: z.string(),
  //     role_id: z.number(),
  //     role: z.object({
  //       role_id: z.number(),
  //       role_name: z.string(),
  //       description: z.string().nullable(),
  //     }).optional(),
  //   })),
  //   permissions: z.array(z.string()),
  // }),
});

export const serverCreateACL = makeEndpoint({
  zodRequest: z => z.object({
    bag_name: z.prismaField("Bags", "bag_name", "string", false),
    role_id: z.prismaField("Roles", "role_id", "number", false),
    permission: z.prismaField("Acl", "permission", "string", false)
      .refine(checks.isPermissionName, { message: "Invalid permission name" }),
  }),
  handler: async (state, { bag_name, role_id, permission, }) => {

    // This ensures that the user attempting to create the ACL has permission to do so
    if (!state.authenticatedUser) throw "User not authenticated";

    const { isAdmin, user_id } = state.authenticatedUser;

    const bag = await state.prisma.bags.findUnique({
      where: { bag_name },
      include: { acl: true, }
    });

    if (!bag) throw "Bag not found";

    const isOwner = bag.owner_id === user_id;

    if (!isOwner && !isAdmin) throw "User is not the bag owner or an admin";

    const aclExists = bag.acl.some(acl => acl.role_id === role_id && acl.permission === permission);

    if (aclExists) throw "ACL already exists";

    await state.prisma.acl.create({
      data: { bag_id: bag.bag_id, role_id, permission }
    });

    return null;
  },
  zodResponse: z => z.null(),
});

export const serverDeleteACL = makeEndpoint({
  zodRequest: z => z.object({
    acl_id: z.prismaField("Acl", "acl_id", "number", false),
  }),
  handler: async (state, { acl_id, }) => {
    if (!state.authenticatedUser) throw "User not authenticated";

    const acl = await state.prisma.acl.findUnique({ where: { acl_id }, include: { bag: true } });

    if (!acl) throw "ACL not found";

    const { isAdmin, user_id } = state.authenticatedUser;

    const isOwner = acl.bag.owner_id === user_id;

    if (!isOwner && !isAdmin) throw "User is not the bag owner or an admin";

    await state.prisma.acl.delete({ where: { acl_id } });

    return null;

  },
  zodResponse: z => z.null(),
});
