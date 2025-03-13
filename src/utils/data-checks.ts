import { Prisma } from "@prisma/client";
import { truthy } from "./utils";


export class DataChecks {
  allowAnonReads;
  allowAnonWrites;
  constructor(options: { allowAnonReads?: boolean, allowAnonWrites?: boolean }) {
    this.allowAnonReads = options.allowAnonReads;
    this.allowAnonWrites = options.allowAnonWrites;
  }

  okTiddlerFields(tiddlerFields: Record<string, any>) {
    ok(tiddlerFields.title, 'title must not be empty');
    Object.entries(tiddlerFields).forEach(([key, value]) => {
      if (typeof value === "undefined" || value === null) return;
      ok(typeof value === "string", `tiddler fields must be a string, ${key} is ${typeof value}`);
    });
  }

  okBagName(bagName: PrismaField<"Bags", "bag_name">) {
    ok(typeof bagName === "string", 'bagName must be a string');
    ok(bagName, 'bagName must not be empty');
  }

  okRecipeName(recipeName: PrismaField<"Recipes", "recipe_name">) {
    ok(typeof recipeName === "string", 'recipeName must be a string');
    ok(recipeName, 'recipeName must not be empty');
  }

  okUserID(userID: PrismaField<"Users", "user_id">) {
    ok(typeof userID === "number", 'userID must be a number');
    ok(userID > 0, 'userID must be greater than zero');
  }

  okTiddlerTitle(tiddlerTitle: string): asserts tiddlerTitle is PrismaField<"Tiddlers", "title"> {
    ok(typeof tiddlerTitle === "string", 'tiddler title must be a string');
    ok(tiddlerTitle, 'tiddler title must not be empty');
  }

  okEntityType(entityType: EntityType) {
    ok(entityType === "bag" || entityType === "recipe", "Invalid entity type: " + entityType);
  }

  okEntityName(entityName: EntityName<EntityType>) {
    ok(typeof entityName === "string", 'entityName must be a string');
    ok(entityName, 'entityName must not be empty');
  }

  okSessionID(sessionID: string): asserts sessionID is PrismaField<"Sessions", "session_id"> {
    ok(typeof sessionID === "string", 'sessionID must be a string');
    ok(sessionID, 'sessionID must not be empty');
  }

  isPermissionName = <T extends string>(e: T): e is T & ACLPermissionName => {
    const test = e as ACLPermissionName;
    switch (test) {
      case "ADMIN":
      case "READ":
      case "WRITE":
        return true;
      default: {
        const _: never = test;
        return false;
      }
    }
  }

  permissions: { [K in ACLPermissionName]: K } = { READ: "READ", WRITE: "WRITE", ADMIN: "ADMIN", };

  isEntityType = (x: any): x is "recipe" | "bag" => ["recipe", "bag"].includes(x);

  entityTypes: { [K in EntityType]: K } = { recipe: "recipe", bag: "bag" };


  getBagWhereACL({ recipe_id, permission, user_id = 0 }: {
    /** Recipe ID can be provided as an extra restriction */
    recipe_id?: number,
    permission: ACLPermissionName,
    user_id?: number,
  }) {

    const OR = this.getWhereACL({ permission, user_id });

    return ([
      // all system bags are allowed to be read by any user
      permission === "READ" && { bag_name: { startsWith: "$:/" } },
      ...OR,
      // admin permission doesn't get inherited 
      permission === "ADMIN" ? undefined : {
        recipe_bags: {
          some: {
            // check if we're in position 0 (for write) or any position (for read)
            position: permission === "WRITE" ? 0 : undefined,
            // of a recipe that the user has permission to read or write
            recipe: { OR },
            // if the connection was created with admin permissions
            with_acl: true,
            // for the specific recipe, if provided
            recipe_id,
          }
        }
      }
    ] satisfies (Prisma.BagsWhereInput | undefined | null | false)[]).filter(truthy)

  }
  getWhereACL({ permission, user_id }: {
    permission: ACLPermissionName,
    user_id?: number,
  }) {
    const { allowAnonReads, allowAnonWrites } = this;
    const anonRead = allowAnonReads && permission === "READ";
    const anonWrite = allowAnonWrites && permission === "WRITE";
    const allowAnon = anonRead || anonWrite;
    const allperms = ["READ", "WRITE", "ADMIN"] as const;
    const index = allperms.indexOf(permission);
    if (index === -1) throw new Error("Invalid permission");
    const checkPerms = allperms.slice(index);

    return ([
      // allow unowned for any user (conditional for anon reads)
      (user_id || allowAnon) && { acl: { none: {} }, owner_id: null },
      // allow owner for user 
      user_id && { owner_id: user_id },
      // allow acl for user 
      user_id && {
        acl: {
          some: {
            permission: { in: checkPerms },
            role: { users: { some: { user_id } } }
          }
        }
      },
      user_id && {
        acl: {
          some: {
            permission: { in: checkPerms },
            role: { users: { some: { user_id } } }
          }
        }
      },

    ] satisfies (Prisma.RecipesWhereInput | Prisma.BagsWhereInput | undefined | null | false | 0)[]
    ).filter(truthy)
  }



}



/**
## assumptions about prisma that should be tested

```
return await this.engine.acl.findMany({
  where: {
    entity_name: entityName,
    entity_type: entityType,
    // if permission_name is undefined, will prisma 
    // include records without a permission connection?
    // ChatGPT 03-mini-high doesn't think so.
    permission: { permission_name } 
  },
});
```
*/
declare let _dataChecks: any;