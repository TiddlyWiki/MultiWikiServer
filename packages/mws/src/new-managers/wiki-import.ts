import { SendError, truthy } from "@tiddlywiki/server";
import { RecipeDefinition, TabId, TemplateDefinition } from "./wiki-actions";
import {
  CompiledRecipeBagInput,
  type UpsertBagInput,
  type UpsertRecipeInput,
  type UpsertRoleInput,
  type UpsertTemplateInput,
  type UpsertUserInput,
} from "./wiki-contract";
import { Prisma, RecipePermissionLevel } from "@tiddlywiki/mws-prisma";
import { mapGetInit, thrower } from "./wiki-utils";

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


type PrismaModalKeys = Prisma.TypeMap["meta"]["modelProps"]
type PrismaScalarKeys<Modal extends PrismaModalKeys> =
  keyof PrismaTxnClient[Modal][symbol]["types"]["payload"]["scalars"];

abstract class PerClassImportWriter<Modal extends PrismaModalKeys> {
  constructor(
    protected tx: PrismaTxnClient,
    private tabid: TabId,
    private modal: Modal,
    private name: PrismaScalarKeys<Modal>,
    private id: PrismaScalarKeys<Modal>,
    protected initStore: boolean,
  ) {

  }

  async checkExisting(id: string, name: string) {
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

  async rename(renames: [string, string][]) {
    await Promise.all(renames.map(([oldName, newName]) =>
      (this.tx[this.modal] as any).update({
        where: { [this.name]: oldName },
        data: { [this.name]: newName }
      })));
  }

  async getNameMapper(names: readonly string[]) {
    names = Array.from(new Set(names));
    const rows = await (this.tx[this.modal] as any).findMany({
      where: { [this.name]: { in: names.slice() } },
      select: { [this.id]: true, [this.name]: true },
    });
    return recordKeyMapper(new Map(rows.map((row: any) => [row[this.name], row[this.id]])), this.tabid);
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
      where: { role_name: role.name },
      update: { description: role.description },
      create: { role_name: role.name, description: role.description },
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
      const roleLinks = user.roleIds.map((roleId) => ({ role_id: roleId }));
      return this.tx.users.upsert({
        where: { username: user.username },
        update: {
          email: user.email,
          password: user.password,
          roles: { set: roleLinks },
        },
        create: {
          username: user.username,
          email: user.email,
          password: user.password,
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

  async rename(renames: [string, string][]) {
    const renamesMap = new Map(renames);
    const bags = await this.tx.bag.findMany({
      where: { name: { in: Array.from(renamesMap.keys()) } },
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
        const newName = renamesMap.get(e.right);
        if (newName !== undefined) e.right = newName;
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
        const newName = renamesMap.get(e.right);
        if (newName !== undefined) e.right = newName;
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
      where: { name: bag.name },
      update: {
        description: bag.description,
        permissions: {
          deleteMany: {},
          create: bag.permissions.map(e => ({
            level: e.level,
            role_id: e.role_id,
          })),
        }
      },
      create: {
        name: bag.name,
        description: bag.description,
        permissions: {
          create: bag.permissions.map(e => ({
            level: e.level,
            role_id: e.role_id,
          })),
        }
      },
      include: { permissions: true, }
    })));

    for (let i = 0; i < bags.length; i++) {
      for (let j = 0; j < bags[i].permissions.length; j++) {
        if (bagRows[i].permissions[j].role_id !== bags[i].permissions[j].role_id)
          throw new Error("Data partially saved but permissions did not save properly");
      }
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
  async upsert(definitions: UpsertTemplateInput[]) {
    const defaultName = "Blank Template";

    const templateRows = await Promise.all(definitions.map((definition) => {

      if (!this.initStore && definition.name === defaultName)
        throw new Error("Cannot modify the blank template.");

      const { name, type } = definition;

      definition.name = undefined as any;

      const data = { name, type, definition, };

      return this.tx.template.upsert({
        create: data,
        update: data,
        // prevents the template type from changing if it exists
        where: { name, type }
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

    const upserter = async (recipe: UpsertRecipeInput) => {
      return await this.tx.recipe.upsert({
        where: { slug: recipe.slug },
        update: {
          definition: recipe.definition,
          template_id: recipe.templateId,
          plugins: recipe.plugins,
          recipe_bags: {
            deleteMany: {},
            create: recipe.compiledBags.map(e => ({
              bag_id: e.bagId,
              is_writable: e.isWritable,
              prefix: e.prefix,
              priority: e.priority,
            }))
          },
          permissions: {
            deleteMany: {},
            create: recipe.permissions.map(e => ({
              level: e.level,
              role_id: e.role_id,
            }))
          }
        },
        create: {
          slug: recipe.slug,
          definition: recipe.definition,
          template_id: recipe.templateId,
          plugins: recipe.plugins,
          recipe_bags: {
            create: recipe.compiledBags.map(e => ({
              bag_id: e.bagId,
              is_writable: e.isWritable,
              prefix: e.prefix,
              priority: e.priority,
            })),
          },
          permissions: {
            create: recipe.permissions.map(e => ({
              level: e.level,
              role_id: e.role_id,
            }))
          }
        },
        include: {
          recipe_bags: true,
          permissions: true,
        }
      });
    }
    const results: ART<typeof upserter>[] = [];
    for (const recipe of recipes) {
      const row = await upserter(recipe);
      // if either of these ever throws, it is very likely because 
      // having deleteMany and create in the same nested operation is undefined behavior.
      for (let i = 0; i < recipe.permissions.length; i++) {
        if (row.permissions[i].role_id !== recipe.permissions[i].role_id)
          throw new Error("Data partially saved but permissions did not save properly");
      }
      for (let i = 0; i < recipe.compiledBags.length; i++) {
        if (row.recipe_bags[i].bag_id !== recipe.compiledBags[i].bagId)
          throw new Error("Data partially saved but compiledBags did not save properly");
      }
      results.push(row);
    }
    this.logRecipes(results);
    return results;

  }
  // #region COMPILE
  async compileRecipeSimpleV1(
    recipeDefinition: RecipeDefinition,
    templateDefinition: TemplateDefinition
  ): Promise<{ bags: CompiledRecipeBagInput[], plugins: string[] }> {
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

    const bagLookup = new Map((await this.tx.bag.findMany({
      where: {
        name: {
          in: [
            ...readonlyBags,
            ...writablePrefixBags.map(e => e.bagName)]
        }
      }
    })).map(e => [e.name, e]));

    const missingWritableBags = writablePrefixBags.filter(e => !bagLookup.has(e.bagName));
    const missingReadonlyBags = readonlyBags.filter(e => !bagLookup.has(e));

    if (missingWritableBags.length || missingReadonlyBags.length)
      throw new Error("Some bag names could not be found: " + JSON.stringify([...missingWritableBags, ...missingReadonlyBags]))

    return {
      plugins,
      bags: [
        ...writablePrefixBags
          .map((e, i) => ({
            bagId: bagLookup.get(e.bagName)!.id,
            isWritable: true,
            priority: i,
            prefix: e.prefix,
          } satisfies CompiledRecipeBagInput)),
        ...readonlyBags
          .map((e, i) => ({
            bagId: bagLookup.get(e)!.id,
            isWritable: false,
            priority: i + writablePrefixBags.length,
            prefix: "",
          } satisfies CompiledRecipeBagInput))
      ],
    }
  }

  // #region OTHER


  private logRecipes(recipeRows: ImportedRecipeRows) {
    recipeRows.forEach((recipe) => {
      console.log(`/wiki/${recipe.slug}`);
    });
  }
}


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
  return Object.entries(obj).map(([left, right]) => ({ left, right }));
}

export function toMappingObject(rows: readonly { left: string; right: string }[]) {
  return Object.fromEntries(rows.map(({ left, right }) => [left, right]));
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}


function recordKeyMapper(map: Map<string, string>, table: TabId): (key: string) => string {
  return key => map.get(key) ?? thrower(new SendError("RECORD_KEY_NOT_FOUND", 400, { table, name: key }))
}