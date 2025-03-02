import { DataChecks } from "../../store/data-checks";
import { makeEndpoint } from "./api";

const checks = new DataChecks();

export const serverListACL = makeEndpoint({
  methodType: "READ",
  zodRequest: z => ({
    recipe_name: z.prismaField("recipes", "recipe_name", "string"),
    bag_name: z.prismaField("bags", "bag_name", "string"),
  }),
  handler: async (state) => {
    if (!state.authenticatedUser && !state.firstGuestUser) throw "User not authenticated";

    const { recipe_name: recipeName, bag_name: bagName } = state.reqData;

    const recipe = await state.prisma.recipes.findUnique({ where: { recipe_name: recipeName } });
    if (!recipe) throw "Recipe not found";

    const bag = await state.prisma.bags.findUnique({ where: { bag_name: bagName } });
    if (!bag) throw "Bag not found";

    const bagInRecipe = await state.prisma.recipe_bags.findUnique({
      where: { recipe_id_bag_id: { bag_id: bag.bag_id, recipe_id: recipe.recipe_id } }
    });

    if (!bagInRecipe) throw "Recipe does not contain bag";

    var recipeAclRecords = await state.prisma.acl.findMany({
      where: { entity_type: "recipe", entity_name: recipeName },
      include: { role: true }
    });
    var bagAclRecords = await state.prisma.acl.findMany({
      where: { entity_type: "bag", entity_name: bagName },
      include: { role: true }
    });

    var roles = await state.store.sql.listRoles();

    // This ensures that the user attempting to view the ACL management page has permission to do so
    async function canContinue() {
      if (state.firstGuestUser) return true;
      if (!state.authenticatedUser) return false;
      if (state.authenticatedUser.isAdmin) return true;
      if (recipeAclRecords.length === 0) return false;
      return await state.store.sql.hasRecipePermission(
        state.authenticatedUser.user_id, recipeName, "ADMIN");
    }

    if (!await canContinue()) {
      throw "User does not have permission to view ACL records for this recipe";
    }

    // Enhance ACL records with role and permission details
    const recipeAclRecords2 = recipeAclRecords.map(record => {
      var role = roles.find(role => role.role_id === record.role_id);
      // var permission = permissions.find(perm => perm.permission_id === record.permission_id);
      return ({
        ...record,
        role,
        role_name: role?.role_name,
        role_description: role?.description,
      })
    });

    const bagAclRecords2 = bagAclRecords.map(record => {
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
      recipe,
      bag,
      recipeAclRecords: recipeAclRecords2,
      bagAclRecords: bagAclRecords2,
      permissions: Object.keys(state.store.permissions),
    }

  },
  zodResponse: z => z.object({
    roles: z.array(z.object({
      role_id: z.number(),
      role_name: z.string(),
      description: z.string().nullable(),
    })),
    recipe: z.object({
      recipe_id: z.number(),
      recipe_name: z.string(),
    }),
    bag: z.object({
      bag_id: z.number(),
      bag_name: z.string(),
    }),
    recipeAclRecords: z.array(z.object({
      acl_id: z.number(),
      entity_name: z.string(),
      entity_type: z.string(),
      permission: z.string(),
      role_id: z.number(),
      role: z.object({
        role_id: z.number(),
        role_name: z.string(),
        description: z.string().nullable(),
      }).optional(),
    })),
    bagAclRecords: z.array(z.object({
      acl_id: z.number(),
      entity_name: z.string(),
      entity_type: z.string(),
      permission: z.string(),
      role_id: z.number(),
      role: z.object({
        role_id: z.number(),
        role_name: z.string(),
        description: z.string().nullable(),
      }).optional(),
    })),
    permissions: z.array(z.string()),
  }),
});

export const serverCreateACL = makeEndpoint({
  methodType: "WRITE",
  zodRequest: z => ({
    entity_type: z.enum(["recipe", "bag"]),
    entity_name: z.string().min(1),
    role_id: z.prismaField("roles", "role_id", "number"),
    permission: z.prismaField("acl", "permission", "string")
      .refine(checks.isPermissionName, { message: "Invalid permission name" }),
  }),
  handler: async (state) => {

    // This ensures that the user attempting to create the ACL has permission to do so
    if (!state.authenticatedUser) throw "User not authenticated";

    const {
      entity_type,
      entity_name,
      role_id,
      permission,
    } = state.reqData;

    const { isAdmin, user_id } = state.authenticatedUser;

    const entity = await state.store.sql.getEntityByName(entity_type, entity_name);

    if (!entity.value) throw "Entity not found";

    const isOwner = entity.value.owner_id === user_id;

    if (!isOwner && !isAdmin) throw "User is not an admin or owner of the entity";

    const aclExists = !!await state.prisma.acl.count({
      where: { entity_name, entity_type, role_id, permission, }
    });

    if (aclExists) throw "ACL already exists";

    await state.prisma.acl.create({
      data: { entity_name, entity_type, role_id, permission, }
    });

    return null;
  },
  zodResponse: z => z.null(),
});

export const serverDeleteACL = makeEndpoint({
  methodType: "WRITE",
  zodRequest: z => ({
    acl_id: z.prismaField("acl", "acl_id", "number"),
    entity_type: z.string().refine(isEntityType).describe("entity_type must be 'recipe' or 'bag'"),
    entity_name: z.prismaField("acl", "entity_name", "string"),
  }),
  handler: async (state) => {
    if (!state.authenticatedUser) throw "User not authenticated";

    const {
      acl_id,
      entity_type,
      entity_name,
    } = state.reqData;

    const entity = await state.store.sql.getEntityByName(entity_type, entity_name);
    if (!entity.value) throw "Entity not found";

    const { isAdmin, user_id } = state.authenticatedUser;
    const isOwner = entity.value.owner_id === user_id;
    if (!isOwner && !isAdmin) throw "User is not an admin or owner of the entity";

    await state.prisma.acl.delete({ where: { acl_id } });

  },
  zodResponse: z => z.void(),
});
