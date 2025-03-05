import { DataChecks } from "../../store/data-checks";
import { makeEndpoint } from "./_index";

const checks = new DataChecks();

export const serverListACL = makeEndpoint({
  zodRequest: z => z.object({
    // recipe_name: z.prismaField("Recipes", "recipe_name", "string", false),
    bag_name: z.prismaField("Bags", "bag_name", "string", false),
  }),
  handler: async (state, { bag_name }) => {

    if (!state.authenticatedUser) throw "User not authenticated";

    const bag = await state.prisma.bags.findUnique({ where: { bag_name } });
    if (!bag) throw "Bag not found";

    var bagAclRecords = await state.prisma.bags.findUnique({
      include: { acl: { include: { role: true } } },
      where: {
        bag_name,
        OR: state.getBagWhereACL("ADMIN").OR,
      }
    });

    var roles = await state.store.sql.listRoles();

    if (!bagAclRecords) {
      throw "User does not have permission to view ACL records for this recipe";
    }

    const bagAclRecords2 = bagAclRecords.acl.map(record => {
      var role = roles.find(role => role.role_id === record.role_id);
      // var permission = permissions.find(perm => perm.permission_id === record.permission_id);
      return ({
        ...record,
        role,
        role_name: role?.role_name,
        role_description: role?.description,
      })
    });
    return {
      roles,
      bag,
      bagAclRecords: bagAclRecords2,
      permissions: Object.keys(state.store.permissions),
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
