import { registerZodRoutes, SiteConfig, zodManage, RouterKeyMap, RouterRouteMap } from "../router";
import { DataChecks } from "../../utils";
import { AuthUser } from "../../services/SessionManager";

// https://crates.io/crates/indradb


export const RecipeKeyMap: RouterKeyMap<RecipeManager, true> = {
  index_json: true,

  bag_create: true,
  bag_update: true,
  bag_upsert: true,
  bag_delete: true,
  bag_acl_update: true,

  recipe_create: true,
  recipe_update: true,
  recipe_upsert: true,
  recipe_delete: true,
  recipe_acl_update: true,

}

export type RecipeManagerMap = RouterRouteMap<RecipeManager>;

export class RecipeManager {

  static defineRoutes(root: rootRoute, config: SiteConfig) {
    registerZodRoutes(root, new RecipeManager(config), Object.keys(RecipeKeyMap));
  }

  checks: DataChecks;

  constructor(private config: SiteConfig) {
    const { allowAnonReads, allowAnonWrites } = config;
    this.checks = new DataChecks({ allowAnonReads, allowAnonWrites })
  }

  index_json = zodManage(z => z.undefined(), async (state, prisma) => {

    const { isAdmin, user_id, username, role_ids } = state.user;

    const OR = this.checks.getBagWhereACL({ permission: "READ", user_id, role_ids });

    const bagList = await prisma.bags.findMany({
      include: {
        _count: isAdmin ? undefined : {
          select: {
            acl: {
              where: {
                permission: "ADMIN",
                role_id: { in: role_ids }
              }
            }
          }
        },
        acl: true,
      },
      where: isAdmin ? undefined : { OR }
    });

    const recipeList = await prisma.recipes.findMany({
      include: {
        recipe_bags: {
          select: { bag_id: true, position: true, with_acl: true, },
          orderBy: { position: "asc" }
        },
        acl: true,
        _count: isAdmin ? undefined : {
          select: {
            acl: {
              where: {
                permission: "ADMIN",
                role_id: { in: role_ids }
              }
            }
          }
        },
      },
      where: isAdmin ? undefined : { recipe_bags: { every: { bag: { OR } } } }
    });

    const userListUser = !isAdmin && await prisma.users.findMany({
      select: { user_id: true, username: true }
    });

    const userListAdmin = !!isAdmin && await prisma.users.findMany({
      select: { user_id: true, username: true, email: true, roles: true, last_login: true, created_at: true }
    });

    const roleList = await prisma.roles.findMany();

    return {
      bagList,
      recipeList,
      isAdmin,
      user_id,
      userListUser,
      userListAdmin,
      roleList,
      username,
      isLoggedIn: state.user.isLoggedIn,
      allowAnonReads: state.config.allowAnonReads,
      allowAnonWrites: state.config.allowAnonWrites,
    }
  });

  recipe_create = zodManage(z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.object({ bag_name: z.string(), with_acl: z.boolean() })),
    owner_id: z.prismaField("Recipes", "owner_id", "number", true).optional(),
    isCreate: z.literal(true).default(true),
  }), async (state, prisma) => {
    return await this.recipeCreateOrUpdate(state.data, prisma, state.user);
  });
  recipe_update = zodManage(z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.object({ bag_name: z.string(), with_acl: z.boolean() })),
    owner_id: z.prismaField("Recipes", "owner_id", "number", true).optional(),
    isCreate: z.literal(false).default(false),
  }), async (state, prisma) => {
    return await this.recipeCreateOrUpdate(state.data, prisma, state.user);
  });

  recipe_upsert = zodManage(z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.object({ bag_name: z.string(), with_acl: z.boolean() })),
    owner_id: z.prismaField("Recipes", "owner_id", "number", true).optional(),
    isCreate: z.boolean(),
  }), async (state, prisma) => {
    return await this.recipeCreateOrUpdate(state.data, prisma, state.user);
  });

  bag_create = zodManage(z => z.object({
    bag_name: z.string(),
    description: z.string(),
    is_plugin: z.boolean(),
    owner_id: z.prismaField("Bags", "owner_id", "number", true).optional(),
    isCreate: z.literal(true).default(true),
  }), async (state, prisma) => {
    return await this.bagCreateOrUpdate(state.data, prisma, state.user);
  });

  bag_update = zodManage(z => z.object({
    bag_name: z.string(),
    description: z.string(),
    is_plugin: z.boolean(),
    owner_id: z.prismaField("Bags", "owner_id", "number", true).optional(),
    isCreate: z.literal(false).default(false),
  }), async (state, prisma) => {
    return await this.bagCreateOrUpdate(state.data, prisma, state.user);
  });

  bag_upsert = zodManage(z => z.object({
    bag_name: z.string(),
    description: z.string(),
    is_plugin: z.boolean(),
    owner_id: z.prismaField("Bags", "owner_id", "number", true).optional(),
    isCreate: z.boolean(),
  }), async (state, prisma) => {
    return await this.bagCreateOrUpdate(state.data, prisma, state.user);
  });

  async recipeCreateOrUpdate({ bag_names, description, owner_id, recipe_name, isCreate }: {
    recipe_name: string,
    description: string,
    bag_names: { bag_name: string, with_acl: boolean }[],
    owner_id?: number | null,
    isCreate: boolean,
  }, prisma: PrismaTxnClient, user: AuthUser) {
    const existing = await prisma.recipes.findUnique({ where: { recipe_name }, });

    this.assertCreateOrUpdate({ user, type: "recipe", isCreate, owner_id, existing, });

    const { isAdmin, user_id } = user;

    const OR = this.checks.getWhereACL({ permission: "ADMIN", user_id, });

    const bags = new Map(
      await prisma.bags.findMany({
        where: { bag_name: { in: bag_names.map(e => e.bag_name) } },
      }).then(bags => bags.map(bag => [bag.bag_name as string, bag]))
    );

    const missing = bag_names.filter(e => !bags.has(e.bag_name));
    if (missing.length) throw "Some bags not found: " + JSON.stringify(missing);

    const bagsAcl = new Map(
      await prisma.bags.findMany({
        where: { bag_name: { in: bag_names.map(e => e.bag_name) }, OR },
      }).then(bags => bags.map(bag => [bag.bag_name as string, bag]))
    );

    const createBags = bag_names.map((bag, position) => ({
      bag_id: bags.get(bag.bag_name)!.bag_id,
      with_acl: bagsAcl && bagsAcl.has(bag.bag_name) && bag.with_acl,
      position,
    }));

    if (existing) {
      await prisma.recipes.update({
        where: { recipe_name },
        data: {
          description,
          owner_id: isAdmin ? owner_id : undefined,
          recipe_bags: {
            deleteMany: {},
          }
        }
      });
      await prisma.recipes.update({
        where: { recipe_name },
        data: {
          recipe_bags: {
            create: createBags
          }
        }
      });
      return existing;
    } else {

      return await prisma.recipes.create({
        data: {
          recipe_name,
          description,
          recipe_bags: { create: createBags },
          owner_id: isAdmin ? owner_id : user_id
        },
      });
    }
  }

  async bagCreateOrUpdate({ bag_name, description, is_plugin, owner_id, isCreate }: {
    bag_name: string,
    description: string,
    is_plugin: boolean,
    owner_id?: number | null,
    isCreate: boolean,
  }, prisma: PrismaTxnClient, user: AuthUser) {
    const existing = await prisma.bags.findUnique({
      where: { bag_name },
      select: { owner_id: true }
    });

    this.assertCreateOrUpdate({ type: "bag", isCreate, owner_id, existing, user });

    const { isAdmin, user_id } = user;

    return await prisma.bags.upsert({
      where: { bag_name },
      update: {
        description,
        is_plugin,
        owner_id: isAdmin ? owner_id : undefined //undefined leaves the value as-is
      },
      create: {
        bag_name,
        description,
        is_plugin,
        owner_id: isAdmin ? owner_id : user_id
      },
    });

  }


  assertCreateOrUpdate({
    existing, isCreate, owner_id, type, user
  }: {
    user: AuthUser,
    isCreate: boolean,
    owner_id?: number | null,
    existing: { owner_id: PrismaField<"Users", "user_id"> | null } | null
    type: "recipe" | "bag"
  }) {
    // check user_id just to be safe because we depend on it for an additional check here and elsewhere
    // user_id 0 is also not a valid user_id and only used for anonymous users
    if (!user.isLoggedIn || !user.user_id)
      throw "User not authenticated";

    const { isAdmin, user_id } = user;

    if (!isAdmin && owner_id !== undefined)
      throw "owner_id is only valid for admins";

    if (existing && isCreate)
      throw `A ${type} with this name already exists`;

    if (existing && !isAdmin && existing.owner_id !== user_id)
      throw `User does not own the ${type} and is not an admin`;

  }

  recipe_delete = zodManage(z => z.object({
    recipe_name: z.string(),
  }), async (state, prisma) => {
    const { recipe_name } = state.data;

    if (!state.user.isLoggedIn) throw "User not authenticated";

    const recipe = await prisma.recipes.findUnique({
      where: { recipe_name },
    });

    if (!recipe) throw "Recipe not found";

    const { isAdmin, user_id } = state.user;

    if (!isAdmin && recipe.owner_id !== user_id)
      throw "User does not own the recipe and is not an admin";

    await prisma.recipes.delete({
      where: { recipe_name }
    });

    return null;
  });

  bag_delete = zodManage(z => z.object({
    bag_name: z.string(),
  }), async (state, prisma) => {
    const { bag_name } = state.data;

    if (!state.user.isLoggedIn) throw "User not authenticated";

    const bag = await prisma.bags.findUnique({
      where: { bag_name },
      include: { _count: { select: { tiddlers: true } } }
    });

    if (!bag) throw "Bag not found";

    const { isAdmin, user_id } = state.user;

    if (!isAdmin && bag.owner_id !== user_id)
      throw "User does not own the bag and is not an admin";

    if (bag._count.tiddlers)
      throw "Bag has tiddlers added and can no longer be deleted.";

    await prisma.bags.delete({
      where: { bag_name }
    });

    return null;
  });

  //   Partial<{
  //     role_id: number | null;
  //     permission: "READ" | "WRITE" | "ADMIN";
  // }>[]
  recipe_acl_update = zodManage(z => z.object({
    recipe_name: z.prismaField("Recipes", "recipe_name", "string"),
    acl: z.array(z.object({
      role_id: z.number().nullable(),
      permission: z.enum(["READ", "WRITE", "ADMIN"]),
    })),
  }), async (state, prisma) => {
    const { recipe_name, acl } = state.data;

    if (!state.user.isLoggedIn) throw "User not authenticated";

    const recipe = await prisma.recipes.findUnique({
      where: { recipe_name }
    });

    if (!recipe) throw "Recipe not found";

    const { isAdmin, user_id } = state.user;

    if (!isAdmin && recipe.owner_id !== user_id)
      throw "User does not own the recipe and is not an admin";

    const distinct = new Set(acl.map(acl => JSON.stringify([acl.role_id, acl.permission])));

    const { recipe_id } = recipe;

    await prisma.recipeAcl.deleteMany({
      where: { recipe_id }
    });

    await prisma.recipeAcl.createMany({
      data: Array.from(distinct).map(e => {
        const [role_id, permission] = JSON.parse(e);
        return { recipe_id, role_id, permission };
      })
    });

    return null;
  });

  bag_acl_update = zodManage(z => z.object({
    bag_name: z.prismaField("Bags", "bag_name", "string"),
    acl: z.array(z.object({
      role_id: z.number().nullable(),
      permission: z.enum(["READ", "WRITE", "ADMIN"]),
    })),
  }), async (state, prisma) => {
    const { bag_name, acl } = state.data;

    if (!state.user.isLoggedIn) throw "User not authenticated";

    const bag = await prisma.bags.findUnique({
      where: { bag_name },
      include: { acl: true }
    });

    if (!bag) throw "Bag not found";

    const { isAdmin, user_id } = state.user;

    if (!isAdmin && bag.owner_id !== user_id)
      throw "User does not own the bag and is not an admin";

    const distinct = new Set(acl.map(acl => JSON.stringify([acl.role_id, acl.permission])));

    const { bag_id } = bag;

    await prisma.bagAcl.deleteMany({
      where: { bag_id }
    });

    await prisma.bagAcl.createMany({
      data: Array.from(distinct).map(e => {
        const [role_id, permission] = JSON.parse(e);
        return { bag_id, role_id, permission };
      })
    });

    return null;
  });


}