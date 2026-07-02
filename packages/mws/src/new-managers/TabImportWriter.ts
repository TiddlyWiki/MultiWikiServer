import { SendError } from "@tiddlywiki/server";
import { RecipeDefinition, TemplateDefinition } from "./tab-routes";
import {
  CompiledRecipeBagInput,
  type UpsertBagInput,
  type UpsertRecipeInput,
  type UpsertRoleInput,
  type UpsertTemplateInput,
  type UpsertUserInput,
} from "./wiki-contract";
import { Prisma } from "@tiddlywiki/mws-prisma";
import { mapGetInit, thrower } from "./wiki-utils";
import { IdString, KeyString, TabId } from "@mws/admin-vanilla/src/definition/tabs";


export type ImportedRoleRows = Awaited<ReturnType<PrismaTxnClient["roles"]["findMany"]>>;
export type ImportedUserRows = Awaited<ReturnType<PrismaTxnClient["users"]["findMany"]>>;
export type ImportedBagRows = Awaited<ReturnType<PrismaTxnClient["bag"]["findMany"]>>;
export type ImportedRecipeRows = Awaited<ReturnType<PrismaTxnClient["recipe"]["findMany"]>>;
export type ImportedTemplateRow = {
  id: string;
  name: string;
  definition: PrismaJson.Template_definition;
  type: string
};

export function indexImportedRolesByName(rows: ImportedRoleRows) {
  return new Map(rows.map((role) => [role.role_name, role]));
}

export function indexImportedUsersByUsername(rows: ImportedUserRows) {
  return new Map(rows.map((user) => [user.username, user]));
}

export function indexImportedBagsByName(rows: ImportedBagRows) {
  return new Map(rows.map((bag) => [bag.name, bag]));
}

export function indexImportedRecipesBySlug(rows: ImportedRecipeRows) {
  return new Map(rows.map((recipe) => [recipe.slug, recipe]));
}

export function indexImportedTemplatesByName(rows: ImportedTemplateRow[]) {
  return new Map(rows.map((template) => [template.name, template]));
}

/*

basically I'm making everything on the server as consistent and repeatable 
as I possibly can across tabs. this is critical for bugs and maintenance. 
AI is good for designing a great idea, but its an absolute nightmare to 
maintain and update. So I'm going through manually and locking everything 
down with Typescript types and deduplicating as much code as I possibly can.

*/

type PrismaModalKeys = Prisma.TypeMap["meta"]["modelProps"]
type PrismaScalarKeys<Modal extends PrismaModalKeys> =
  keyof PrismaTxnClient[Modal][symbol]["types"]["payload"]["scalars"];

export abstract class PerClassImportWriter<Modal extends PrismaModalKeys> {
  constructor(
    protected tx: PrismaTxnClient,
    private tabid: TabId,
    private modal: Modal,
    private name: PrismaScalarKeys<Modal>,
    private id: PrismaScalarKeys<Modal>,
    protected initStore: boolean,
  ) {

  }

  async checkExisting(id: IdString, name: KeyString) {
    if (id) {
      const existing = await (this.tx[this.modal] as any).findUnique({
        where: { [this.id]: id },
        select: { [this.id]: true, [this.name]: true }
      });
      if (!existing)
        throw new Error("existing wiki not found");
      if (existing[this.name] !== name)
        await this.rename([[existing[this.name], name]]);
    }

  }

  async rename(renames: [KeyString, KeyString][]) {
    await Promise.all(renames.map(([oldName, newName]) =>
      (this.tx[this.modal] as any).update({
        where: { [this.name]: oldName },
        data: { [this.name]: newName }
      })));
  }
  /** Maps names to ids */
  async getNameMapper(names?: readonly KeyString[]) {
    return this.mapRowsToNameKey(await this.getMapperFunc({ names }))
  }
  /** Maps ids to names */
  async getIdMapper(ids?: readonly IdString[]) {
    return this.mapRowsToIdKey(await this.getMapperFunc({ ids }))
  }

  getMapperFunc({ ids, names }: { ids?: readonly IdString[], names?: readonly KeyString[] }) {
    return (this.tx[this.modal] as any).findMany({
      ...(ids ? { where: { [this.id]: { in: Array.from(new Set(ids)) } } } : {}),
      ...(names ? { where: { [this.name]: { in: Array.from(new Set(names)) } } } : {}),
      select: { [this.id]: true, [this.name]: true },
    });
  }

  mapRowsToIdKey(rows: any[]) {
    return recordKeyMapper(new Map(rows.map((row: any) => [row[this.id] as any as IdString, new KeyString(row[this.name])])), this.tabid)
  }

  mapRowsToNameKey(rows: any[]) {
    return recordKeyMapper(new Map(rows.map((row: any) => [row[this.name] as any as KeyString, new IdString(row[this.id])])), this.tabid);
  }

  abstract upsert(rows: unknown[]): Promise<unknown[]>;
}

// #region ROLES
export class RoleImportWriter extends PerClassImportWriter<"roles"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "users", "roles", "role_name", "role_id", initStore)
  }

  async upsert(roles: UpsertRoleInput[]) {
    this.validateProtectedRoles(roles);
    return Promise.all(roles.map((role) => this.tx.roles.upsert({
      where: { role_name: KeyString.cast(role.name) },
      update: { description: role.description },
      create: { role_name: KeyString.cast(role.name), description: role.description },
    })));
  }


  private validateProtectedRoles(roles: UpsertRoleInput[]) {
    if (!this.initStore) {
      if (roles.some((entry) => entry.name === "ADMIN"))
        throw new Error("Cannot modify protected rows.");
      if (roles.some((entry) => entry.name === "USER"))
        throw new Error("Cannot modify protected rows.");
    }
  }

}

// #region USERS
export class UserImportWriter extends PerClassImportWriter<"users"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "users", "users", "username", "user_id", initStore)
  }

  async upsert(users: UpsertUserInput[]) {
    return Promise.all(users.map((user) => {
      const roleLinks = user.roleIds.map((roleId) => ({ role_id: IdString.cast(roleId) }));
      return this.tx.users.upsert({
        where: { username: KeyString.cast(user.username) },
        update: {
          email: user.email,
          roles: { set: roleLinks },
        },
        create: {
          username: KeyString.cast(user.username),
          email: user.email,
          password: "",
          roles: { connect: roleLinks },
        },
      });
    }));
  }
}

// #region BAGS

export class BagImportWriter extends PerClassImportWriter<"bag"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "bags", "bag", "name", "id", initStore)
  }

  async rename(renames: [KeyString, KeyString][]) {
    const renamesMap = new Map(renames);
    const bags = await this.tx.bag.findMany({
      where: { name: { in: Array.from(renamesMap.keys(), e => IdString.cast(e)) } },
      include: { recipe_bags: { select: { recipe: { select: { id: true, template_id: true } } } }, }
    });

    const recipesInvolved = new Map<string, Set<string>>();
    const templatesInvolved = new Map<string, Set<string>>();

    bags.forEach(bag => {
      bag.recipe_bags.forEach(rb => {
        mapGetInit(recipesInvolved, bag.name, () => new Set()).add(rb.recipe.id);
        mapGetInit(templatesInvolved, bag.name, () => new Set()).add(rb.recipe.template_id);
      });
    });

    const recipesToEdit = Array.from(new Set(Array.from(recipesInvolved.values(), e => [...e]).flat()));

    const recipes = await this.tx.recipe.findMany({
      where: { id: { in: recipesToEdit } }
    });

    for (const recipe of recipes) {
      recipe.definition.writablePrefixBags.forEach(e => {
        const newName = renamesMap.get(e.bagName);
        if (newName !== undefined) e.bagName = newName;
      });
      recipe.definition.readonlyBags
        = recipe.definition.readonlyBags
          .map(e => renamesMap.get(e) ?? e);
      await this.tx.recipe.update({
        where: { id: recipe.id },
        data: { definition: recipe.definition },
      })
    }

    const templatesToEdit = Array.from(new Set(Array.from(templatesInvolved.values(), e => [...e]).flat()));

    const templates = await this.tx.template.findMany({
      where: { id: { in: templatesToEdit } }
    });

    for (const template of templates) {
      template.definition.writablePrefixBags.forEach(e => {
        const newName = renamesMap.get(e.bagName);
        if (newName !== undefined) e.bagName = newName;
      });
      template.definition.readonlyBags
        = template.definition.readonlyBags
          .map(e => renamesMap.get(e) ?? e);
      await this.tx.template.update({
        where: { id: template.id },
        data: { definition: template.definition },
      });
    }

  }

  async upsert(bags: UpsertBagInput[]) {
    const bagRows = await Promise.all(bags.map((bag) => this.tx.bag.upsert({
      where: { name: KeyString.cast(bag.name) },
      update: {
        description: bag.description,
        permissions: {
          deleteMany: {},
          create: bag.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
        }
      },
      create: {
        name: KeyString.cast(bag.name),
        description: bag.description,
        permissions: {
          create: bag.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
        }
      },
      select: { id: true, _count: { select: { permissions: true } } },
    })));

    for (let i = 0; i < bags.length; i++) {
      if (bagRows[i]._count.permissions !== bags[i].permissions.length)
        throw new Error("Permissions length did not match");
    }

    return bagRows;
  }
}


// #region TEMPLATES
export class TemplateImportWriter extends PerClassImportWriter<"template"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "templates", "template", "name", "id", initStore)
  }

  /** 
   * Saving a template without an id will always create one if the name does not exist 
   * and modify it if it does exist. 
   * You must include the existing id if you want to rename a template.
   */
  async upsert(templates: UpsertTemplateInput[]) {
    const defaultName = "Blank Template";

    const templateRows = await Promise.all(templates.map((template) => {

      if (!this.initStore && template.name === defaultName)
        throw new Error("Cannot modify the blank template.");

      const name = KeyString.cast(template.name);
      const type = template.definition.type;
      const definition = template.definition;

      return this.tx.template.upsert({
        create: {
          name,
          type,
          definition,
          permissions: {
            create: template.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
          }
        },
        update: {
          name,
          type,
          definition,
          permissions: {
            deleteMany: {},
            create: template.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
          }
        },
        // prevents the template type from changing if it exists
        where: { name, type },
        select: { id: true, updated: true }
      });

    }));

    return templateRows;
  }
}


// #region RECIPES

export class RecipeImportWriter extends PerClassImportWriter<"recipe"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "wikis", "recipe", "slug", "id", initStore)
  }


  async upsert(recipes: UpsertRecipeInput[]) {

    const upserter = async (recipe: UpsertRecipeInput, compiledAt: Date) => {
      recipe.compiledBags.sort((a, b) => a.priority - b.priority)
      return await this.tx.recipe.upsert({
        where: { slug: recipe.slug as string },
        update: {
          definition: recipe.definition,
          template_id: recipe.templateId as KeyString as string,
          plugins: recipe.plugins,
          compiledAt,
          recipe_bags: {
            deleteMany: {},
            create: recipe.compiledBags.map(e => ({
              bag: { connect: { name: e.bagName as string } },
              is_writable: e.isWritable,
              prefix: e.prefix,
              priority: e.priority,
            }))
          },
          permissions: {
            deleteMany: {},
            create: recipe.permissions.map(e => ({ level: e.level, role_id: e.role_id as string }))
          }
        },
        create: {
          slug: KeyString.cast(recipe.slug),
          definition: recipe.definition,
          template_id: IdString.cast(recipe.templateId),
          plugins: recipe.plugins,
          compiledAt,
          recipe_bags: {
            create: recipe.compiledBags.map(e => ({
              bag: { connect: { name: KeyString.cast(e.bagName) } },
              is_writable: e.isWritable,
              prefix: e.prefix,
              priority: e.priority,
            })),
          },
          permissions: {
            create: recipe.permissions.map(e => ({ level: e.level, role_id: e.role_id as string }))
          }
        },
        select: {
          id: true,
          _count: { select: { permissions: true, recipe_bags: true } },
        }
      });
    }
    const results: [string, Date][] = [];
    for (const recipe of recipes) {
      const compiledAt = new Date();
      const row = await upserter(recipe, compiledAt);
      // if either of these ever throws, it is very likely because 
      // having deleteMany and create in the same nested operation 
      // is undocumented but appears to work.
      if (recipe.permissions.length !== row._count.permissions)
        throw new Error("Permissions length did not match");
      if (recipe.compiledBags.length !== row._count.recipe_bags)
        throw new Error("Compiled bags length did not match");
      results.push([row.id, compiledAt]);
    }

    return results;

  }
  // #region COMPILE
  compileRecipeSimpleV1(
    recipeDefinition: RecipeDefinition,
    templateDefinition: TemplateDefinition
  ): { bags: CompiledRecipeBagInput[], plugins: string[] } {
    // Set takes the order of first appearance.
    const plugins = Array.from(new Set([
      ...recipeDefinition.plugins,
      ...templateDefinition.plugins,
    ]));
    const readonlyBags = Array.from(new Set([
      ...recipeDefinition.readonlyBags,
      ...templateDefinition.readonlyBags,
    ]));
    // Object spread takes the last occurance of a value.
    const writablePrefixBags = Object.entries({
      ...toMappingObject(templateDefinition.writablePrefixBags),
      ...toMappingObject(recipeDefinition.writablePrefixBags),
    })
      .sort(([a], [b]) => b.length - a.length)
      .map(([prefix, bagName]) => ({ prefix, bagName }));

    return {
      plugins,
      bags: [
        ...writablePrefixBags
          .map((e, i) => ({
            // bagId: bagLookup.get(e.bagName)!.id,
            bagName: e.bagName,
            isWritable: true,
            priority: i,
            prefix: e.prefix,
          } satisfies CompiledRecipeBagInput)),
        ...readonlyBags
          .map((e, i) => ({
            // bagId: bagLookup.get(e)!.id,
            bagName: e,
            isWritable: false,
            priority: i + writablePrefixBags.length,
            prefix: "",
          } satisfies CompiledRecipeBagInput))
      ],
    }
  }



}
// #region OTHER

export function importRoles(prisma: PrismaEngineClient, roles: UpsertRoleInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new RoleImportWriter(tx, initStore);
    return importer.upsert(roles);
  });
}

export function importUsers(prisma: PrismaEngineClient, users: UpsertUserInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new UserImportWriter(tx, initStore);
    return importer.upsert(users);
  });
}

export function importBags(prisma: PrismaEngineClient, bags: UpsertBagInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new BagImportWriter(tx, initStore);
    return importer.upsert(bags);
  });
}

export function importTemplates(prisma: PrismaEngineClient, templates: UpsertTemplateInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new TemplateImportWriter(tx, initStore);
    return importer.upsert(templates);
  });
}

export function importRecipes(prisma: PrismaEngineClient, recipes: UpsertRecipeInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new RecipeImportWriter(tx, initStore);
    return importer.upsert(recipes);
  });
}

export function toMappingRows(obj: Record<string, string>) {
  return Object.entries(obj).map(([prefix, bagName]) => ({ prefix, bagName }));
}

export function toMappingObject(rows: readonly { prefix: string; bagName: KeyString }[]) {
  return Object.fromEntries(rows.map(({ prefix, bagName }) => [prefix, bagName]));
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}


function recordKeyMapper<K extends String, T>(map: Map<K, T>, table: TabId): (key: K) => T {
  return key => map.get(key) ?? thrower(new SendError("RECORD_KEY_NOT_FOUND", 400, { table, name: key.toString() }))
}