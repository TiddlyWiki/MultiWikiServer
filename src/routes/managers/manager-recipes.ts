import { z, ZodTypeAny } from "zod";
import { BaseKeyMap, BaseManager, BaseManagerMap, } from "../BaseManager";


/*
You must have admin permission on a bag to add it to a recipe because it is an implicit ACL operation. 
https://crates.io/crates/indradb


I'm also wondering if the system could be improved slightly by thinking of it more in terms of bag layers. 

- Each layer could be writable or readonly. A tiddler from a readonly layer could not be overwritten unless there is a writable layer above it to put it in. 
- Different layers could be given a more complicated set of permissions. Maybe admins can edit the template or system namespace, users can only edit their own pages in the user namespace, etc. 
- Our current system is multiple readonly bag layers, with a single writable bag layer at the top. 
- The simplest recipe is one writable bag layer. 

Nothing should be happening to tiddlers in a bag unless they're in a writable layer of the recipe you're accessing them through. 



*/


function TestDecorator<This, T extends ZodTypeAny>(zod: T) {
  return function (
    target: (this: This, input: z.infer<T>) => void,
    context: ClassMethodDecoratorContext<This, (input: z.infer<T>) => void>
  ) {
    console.log("TestDecorator", target, context);

  }
}

export const RecipeKeyMap: BaseKeyMap<RecipeManager, true> = {
  index_json: true,
  bag_create: true,
  bag_update: true,
  bag_upsert: true,
  bag_delete: true,
  recipe_create: true,
  recipe_update: true,
  recipe_upsert: true,
  recipe_delete: true,

}

export type RecipeManagerMap = BaseManagerMap<RecipeManager>;

export class RecipeManager extends BaseManager {

  index_json = this.ZodRequest(z => z.undefined(), async () => {

    const { isAdmin, user_id, username } = this.user ?? {};

    const OR = this.checks.getBagWhereACL({ permission: "READ", user_id, });

    const bagList = await this.prisma.bags.findMany({
      include: {
        _count: {
          select: {
            acl: {
              where: {
                permission: "ADMIN",
                role: { users: { some: { user_id } } }
              }
            }
          }
        },
        owner: { select: { username: true } }
      },
      where: isAdmin ? {} : { OR }
    });

    const recipeList = await this.prisma.recipes.findMany({
      include: {
        owner: { select: { username: true } },
        recipe_bags: {
          select: { bag_id: true, position: true, with_acl: true, },
          orderBy: { position: "asc" }
        }
      },
      where: isAdmin ? {} : { recipe_bags: { every: { bag: { OR } } } }
    });

    const userList = !isAdmin ? null : await this.prisma.users.findMany({
      select: { user_id: true, username: true, email: true, roles: true, last_login: true, created_at: true }
    });

    return {
      bagList,
      recipeList,
      isAdmin,
      user_id,
      userList,
      username,
      firstGuestUser: !!this.firstGuestUser,
      isLoggedIn: !!this.user,
      allowAnonReads: this.config.allowAnonReads,
      allowAnonWrites: this.config.allowAnonWrites,
    }
  });

  recipe_create = this.ZodRequest(z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.object({ bag_name: z.string(), with_acl: z.boolean() })),
    owner_id: z.prismaField("Recipes", "owner_id", "number", true).optional(),
    isCreate: z.literal(true).default(true),
  }), async (input) => {
    return await this.recipeCreateOrUpdate(input);
  });
  recipe_update = this.ZodRequest(z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.object({ bag_name: z.string(), with_acl: z.boolean() })),
    owner_id: z.prismaField("Recipes", "owner_id", "number", true).optional(),
    isCreate: z.literal(false).default(false),
  }), async (input) => {
    return await this.recipeCreateOrUpdate(input);
  });

  recipe_upsert = this.ZodRequest(z => z.object({
    recipe_name: z.string(),
    description: z.string(),
    bag_names: z.array(z.object({ bag_name: z.string(), with_acl: z.boolean() })),
    owner_id: z.prismaField("Recipes", "owner_id", "number", true).optional(),
    isCreate: z.boolean(),
  }), async (input) => {
    return await this.recipeCreateOrUpdate(input);
  });


  bag_create = this.ZodRequest(z => z.object({
    bag_name: z.string(),
    description: z.string(),
    owner_id: z.prismaField("Bags", "owner_id", "number", true).optional(),
    isCreate: z.literal(true).default(true),
  }), async (input) => {
    return await this.bagCreateOrUpdate(input);
  });

  bag_update = this.ZodRequest(z => z.object({
    bag_name: z.string(),
    description: z.string(),
    owner_id: z.prismaField("Bags", "owner_id", "number", true).optional(),
    isCreate: z.literal(false).default(false),
  }), async (input) => {
    return await this.bagCreateOrUpdate(input);
  });

  bag_upsert = this.ZodRequest(z => z.object({
    bag_name: z.string(),
    description: z.string(),
    owner_id: z.prismaField("Bags", "owner_id", "number", true).optional(),
    isCreate: z.boolean(),
  }), async (input) => {
    return await this.bagCreateOrUpdate(input);
  });

  async recipeCreateOrUpdate({ bag_names, description, owner_id, recipe_name, isCreate }: {
    recipe_name: string,
    description: string,
    bag_names: { bag_name: string, with_acl: boolean }[],
    owner_id?: number | null,
    isCreate: boolean,
  }) {
    const existing = await this.prisma.recipes.findUnique({
      where: { recipe_name },
    });

    this.assertCreateOrUpdate({ type: "recipe", isCreate, owner_id, existing, });

    const { isAdmin, user_id } = this.user;

    const OR = this.checks.getWhereACL({ permission: "ADMIN", user_id, });

    const bags = new Map(
      await this.prisma.bags.findMany({
        where: { bag_name: { in: bag_names.map(e => e.bag_name) } },
      }).then(bags => bags.map(bag => [bag.bag_name as string, bag]))
    );

    const missing = bag_names.filter(e => !bags.has(e.bag_name));
    if (missing.length) throw "Some bags not found: " + JSON.stringify(missing);

    const bagsAcl = new Map(
      await this.prisma.bags.findMany({
        where: { bag_name: { in: bag_names.map(e => e.bag_name) }, OR },
      }).then(bags => bags.map(bag => [bag.bag_name as string, bag]))
    );

    const createBags = bag_names.map((bag, position) => ({
      bag_id: bags.get(bag.bag_name)!.bag_id,
      with_acl: bagsAcl && bagsAcl.has(bag.bag_name) && bag.with_acl,
      position,
    }));

    if (existing) {
      await this.prisma.recipes.update({
        where: { recipe_name },
        data: {
          description,
          owner_id: isAdmin ? owner_id : undefined,
          recipe_bags: {
            deleteMany: {},
          }
        }
      });
      await this.prisma.recipes.update({
        where: { recipe_name },
        data: {
          recipe_bags: {
            create: createBags
          }
        }
      });
      return existing;
    } else {

      return await this.prisma.recipes.create({
        data: {
          recipe_name,
          description,
          recipe_bags: { create: createBags },
          owner_id: isAdmin ? owner_id : user_id
        },
      });
    }
  }

  async bagCreateOrUpdate({ bag_name, description, owner_id, isCreate }: {
    bag_name: string,
    description: string,
    owner_id?: number | null,
    isCreate: boolean,
  }) {
    const existing = await this.prisma.bags.findUnique({
      where: { bag_name },
      select: { owner_id: true }
    });

    this.assertCreateOrUpdate({ type: "bag", isCreate, owner_id, existing });

    const { isAdmin, user_id } = this.user;

    return await this.prisma.bags.upsert({
      where: { bag_name },
      update: {
        description,
        owner_id: isAdmin ? owner_id : undefined //undefined leaves the value as-is
      },
      create: {
        bag_name,
        description,
        owner_id: isAdmin ? owner_id : user_id
      },
    });

  }


  assertCreateOrUpdate({
    existing, isCreate, owner_id, type
  }: {
    isCreate: boolean,
    owner_id?: number | null,
    existing: { owner_id: PrismaField<"Users", "user_id"> | null } | null
    type: "recipe" | "bag"
  }): asserts this is { user: { isAdmin: boolean, user_id: number } } {
    // check user_id just to be safe because we depend on it for an additional check here and elsewhere
    if (!this.user || !this.user.user_id)
      throw "User not authenticated";

    const { isAdmin, user_id } = this.user;

    if (!isAdmin && owner_id !== undefined)
      throw "owner_id is only valid for admins";

    if (existing && isCreate)
      throw `A ${type} with this name already exists`;

    if (existing && !isAdmin && existing.owner_id !== user_id)
      throw `User does not own the ${type} and is not an admin`;

  }

  recipe_delete = this.ZodRequest(z => z.object({
    recipe_name: z.string(),
  }), async ({ recipe_name }) => {

    if (!this.user) throw "User not authenticated";

    const recipe = await this.prisma.recipes.findUnique({
      where: { recipe_name },
    });

    if (!recipe) throw "Recipe not found";

    const { isAdmin, user_id } = this.user;

    if (!isAdmin && recipe.owner_id !== user_id)
      throw "User does not own the recipe and is not an admin";

    await this.prisma.recipes.delete({
      where: { recipe_name }
    });

    return null;
  });

  bag_delete = this.ZodRequest(z => z.object({
    bag_name: z.string(),
  }), async ({ bag_name }) => {

    if (!this.user) throw "User not authenticated";

    const bag = await this.prisma.bags.findUnique({
      where: { bag_name },
      include: { _count: { select: { tiddlers: true } } }
    });

    if (!bag) throw "Bag not found";

    const { isAdmin, user_id } = this.user;

    if (!isAdmin && bag.owner_id !== user_id)
      throw "User does not own the bag and is not an admin";

    if (bag._count.tiddlers)
      throw "Bag has tiddlers added and can no longer be deleted.";

    await this.prisma.bags.delete({
      where: { bag_name }
    });

    return null;
  });

  // async acl_list() {

  //   if (!this.authenticatedUser) throw "User not authenticated";

  //   const recipe = await this.prisma.recipes.findUnique({
  //     where: { recipe_name },
  //     include: { recipe_bags: { include: { bag: { include: { acl: true } } } } },
  //   });

  //   if (!recipe) throw "Recipe not found";

  //   const permissions = Object.keys(this.store.permissions);

  //   const roles = await this.prisma.roles.findMany();

  //   return {
  //     recipe,
  //     permissions,
  //     roles,
  //   }
  // }

  // async acl_create() {

  //   // This ensures that the user attempting to create the ACL has permission to do so
  //   if (!this.authenticatedUser) throw "User not authenticated";

  //   const { isAdmin, user_id } = this.authenticatedUser;

  //   const bag = await this.prisma.bags.findUnique({
  //     where: { bag_name },
  //     include: { acl: true, }
  //   });

  //   if (!bag) throw "Bag not found";

  //   const isOwner = bag.owner_id === user_id;

  //   if (!isOwner && !isAdmin) throw "User is not the bag owner or an admin";

  //   const aclExists = bag.acl.some(acl => acl.role_id === role_id && acl.permission === permission);

  //   if (aclExists) throw "ACL already exists";

  //   await this.prisma.acl.create({
  //     data: { bag_id: bag.bag_id, role_id, permission }
  //   });

  //   return null;
  // }

  // async acl_delete() {
  //   if (!this.authenticatedUser) throw "User not authenticated";

  //   const acl = await this.prisma.acl.findUnique({ where: { acl_id }, include: { bag: true } });

  //   if (!acl) throw "ACL not found";

  //   const { isAdmin, user_id } = this.authenticatedUser;

  //   const isOwner = acl.bag.owner_id === user_id;

  //   if (!isOwner && !isAdmin) throw "User is not the bag owner or an admin";

  //   await this.prisma.acl.delete({ where: { acl_id } });

  //   return null;

  // }

  // async bag_create() {

  //   if (!this.authenticatedUser) throw "User not authenticated";

  //   if (!this.authenticatedUser.isAdmin && !owned) throw "User is not an admin and cannot create a bag that is not owned";

  //   const bag = await this.prisma.bags.create({
  //     data: {
  //       bag_name,
  //       description,
  //       owner_id: owned ? this.authenticatedUser.user_id : null
  //     },
  //   });

  //   return bag;
  // }
  // async bag_delete() {
  //   const bag = await authorizeBagOwner(this, bag_name);

  //   const hasTiddlers = await this.prisma.tiddlers.count({
  //     where: { bag_id: bag.bag_id }
  //   });

  //   if (hasTiddlers) throw "Bag is not empty";

  //   await this.prisma.bags.delete({
  //     where: { bag_id: bag.bag_id }
  //   });

  //   return null;
  // }
  // async bagList() {

  //   const bags = await this.prisma.bags.findMany({
  //     select: {
  //       bag_id: true,
  //       bag_name: true,
  //       description: true,
  //     }
  //   });

  //   return bags;
  // }
  // async bag_edit() {
  //   const bag = await authorizeBagOwner(this, bag_name);

  //   await this.prisma.bags.update({
  //     where: { bag_id: bag.bag_id },
  //     data: { description }
  //   });

  //   return null;
  // }

  // /** Authorizes owner-level access and returns the bag. */
  // async authorizeBagOwner(bag_name: string) {
  //   if (!this.authenticatedUser) throw "User not authenticated";

  //   const bag = await this.prisma.bags.findUnique({
  //     where: { bag_name },
  //     select: {
  //       bag_id: true,
  //       owner_id: true,
  //     }
  //   });

  //   if (!bag) throw "Bag not found";

  //   const { isAdmin, user_id } = this.authenticatedUser;

  //   const isOwner = bag.owner_id === user_id;

  //   if (!isOwner && !isAdmin) throw "User is not the bag owner or an admin";
  //   return bag;
  // }

  // async recipe_create() {

  //   if (!this.authenticatedUser) throw "User not authenticated";

  //   if (!this.authenticatedUser.isAdmin && !owned) throw "User is not an admin and cannot create a recipe that is not owned";

  //   const bags = await this.prisma.bags.findMany({
  //     where: { bag_name: { in: bag_names } },
  //     include: { acl: true }
  //   });

  //   const recipe = await this.prisma.recipes.create({
  //     data: {
  //       recipe_name,
  //       description,
  //       recipe_bags: { create: bags.map((bag, position) => ({ bag_id: bag.bag_id, position })) },
  //       owner_id: owned ? this.authenticatedUser.user_id : null
  //     },
  //   });

  //   return recipe;
  // }

}