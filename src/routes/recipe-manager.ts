import { Readable } from "stream";
import { StateObject } from "../StateObject";
import { TiddlerFields } from "../store/new-sql-tiddler-database";
import { z, ZodType, ZodTypeAny } from "zod";
import { Z2, ZodAssert } from "../zodAssert";
import { ZodInput, Validate } from 'ts-zod-decorators';
import { AllowedMethod } from "../router";
import { BaseManager } from "./BaseManager";

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


export type RecipeManagerMap = {
  [K in keyof RecipeManager]: RecipeManager[K] extends (input: any) => any ? RecipeManager[K] : never;
}

export class RecipeManager extends BaseManager {
  


  index_json = this.ZodRequest(z => z.undefined(), async () => {

    const { OR } = this.state.getBagWhereACL("READ");

    const { isAdmin, user_id, username } = this.state.authenticatedUser ?? { isAdmin: false, user_id: 0, username: "(anon)" };

    const bagList = await this.prisma.bags.findMany({
      include: {
        _count: {
          select: {
            acl: { where: { permission: "ADMIN", role: { users: { some: { user_id } } } } }
          }
        }
      },
      where: { OR }
    });

    const recipeList = await this.prisma.recipes.findMany({
      include: { recipe_bags: { select: { bag_id: true, position: true, } } },
      where: { recipe_bags: { every: { bag: { OR } } } }
    });

    return {
      bagList,
      recipeList,
      isAdmin,
      user_id,
      username,
      firstGuestUser: !!this.state.firstGuestUser,
      isLoggedIn: !!this.state.authenticatedUser,
      allowAnonReads: false,
      allowAnonWrites: false,
    }
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