

export class DataChecks {

  okTiddlerFields(tiddlerFields: Record<string, any>) {
    ok(tiddlerFields.title, 'title must not be empty');
    Object.entries(tiddlerFields).forEach(([key, value]) => {
      if (typeof value === "undefined" || value === null) return;
      ok(typeof value === "string", `tiddler fields must be a string, ${key} is ${typeof value}`);
    });
  }

  okBagName(bagName: PrismaField<"bags", "bag_name">) {
    ok(typeof bagName === "string", 'bagName must be a string');
    ok(bagName, 'bagName must not be empty');
  }

  okRecipeName(recipeName: PrismaField<"recipes", "recipe_name">) {
    ok(typeof recipeName === "string", 'recipeName must be a string');
    ok(recipeName, 'recipeName must not be empty');
  }

  okUserID(userID: PrismaField<"users", "user_id">) {
    ok(typeof userID === "number", 'userID must be a number');
    ok(userID > 0, 'userID must be greater than zero');
  }

  okTiddlerTitle(tiddlerTitle: string): asserts tiddlerTitle is PrismaField<"tiddlers", "title"> {
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

  okSessionID(sessionID: string): asserts sessionID is PrismaField<"sessions", "session_id"> {
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