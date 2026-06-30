import { RecipeDefinition, TemplateDefinition } from "./wiki-actions";
import {
  ImportCompiledRecipeBagInput,
  type ImportBagInput,
  type ImportRecipeInput,
  type ImportRoleInput,
  type ImportTemplateInput,
  type ImportUserInput,
} from "./wiki-contract";

export type ImportedRoleRows = Awaited<ReturnType<PrismaTxnClient["roles"]["findMany"]>>;
export type ImportedUserRows = Awaited<ReturnType<PrismaTxnClient["users"]["findMany"]>>;
export type ImportedBagRows = Awaited<ReturnType<PrismaTxnClient["bag"]["findMany"]>>;
export type ImportedRecipeRows = Awaited<ReturnType<PrismaTxnClient["recipe"]["findMany"]>>;
export type ImportedTemplateRow = {
  id: string;
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
  return new Map(rows.map((template) => [template.definition.name, template]));
}

type RecipeCompilationInput = Omit<ImportRecipeInput, "templateId" | "plugins" | "compiledBags">;

export class WikiImportWriter {

  constructor(
    private readonly tx: PrismaTxnClient,
    private readonly initStore: boolean,
  ) { }

  async importRoles(roles: ImportRoleInput[]) {
    this.validateProtectedRoles(roles);
    return Promise.all(roles.map((role) => this.tx.roles.upsert({
      where: { role_name: role.role_name },
      update: { description: role.description },
      create: { role_name: role.role_name, description: role.description },
    })));
  }

  async importUsers(users: ImportUserInput[]) {
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

  async importBags(bags: ImportBagInput[]) {
    const bagRows = await Promise.all(bags.map((bag) => this.tx.bag.upsert({
      where: { name: bag.name },
      update: { description: bag.description },
      create: { name: bag.name, description: bag.description },
    })));

    await Promise.all(bags.map((bag, index) => this.replaceBagPermissions(bag, bagRows[index].id)));
    return bagRows;
  }

  private async replaceBagPermissions(bag: ImportBagInput, bagId: string) {
    await this.tx.bagPermission.deleteMany({ where: { bag_id: bagId } });
    await Promise.all(bag.permissions.map(({ roleId, level }) => this.tx.bagPermission.create({
      data: {
        bag_id: bagId,
        role_id: roleId,
        level,
      },
    })));
  }

  async importTemplates(templates: ImportTemplateInput[]) {
    this.validateProtectedTemplates(templates);
    const existingTemplates = await this.tx.template.findMany({
      select: { id: true, definition: true },
    });
    const templateIdByName = new Map<string, string>();
    for (const template of existingTemplates) {
      templateIdByName.set(template.definition.name, template.id);
    }

    const templateRows = await Promise.all(templates.map((template) => {
      const existingTemplateId = templateIdByName.get(template.definition.name);
      const data = {
        name: template.definition.name,
        type: template.type,
        definition: template.definition,
      };
      return existingTemplateId
        ? this.tx.template.update({
          where: { id: existingTemplateId },
          data,
          select: { id: true, definition: true, type: true },
        })
        : this.tx.template.create({
          data,
          select: { id: true, definition: true, type: true },
        });
    }));
    return templateRows;
  }

  async importRecipes(recipes: ImportRecipeInput[]) {
    const recipeRows = await Promise.all(recipes.map((recipe) => this.tx.recipe.upsert({
      where: { slug: recipe.slug },
      update: {
        definition: recipe.definition,
        template_id: recipe.templateId,
        plugins: recipe.plugins,
      },
      create: {
        slug: recipe.slug,
        definition: recipe.definition,
        template_id: recipe.templateId,
        plugins: recipe.plugins,
      },
    })));

    await Promise.all(recipes.map((recipe, index) => this.replaceRecipePermissions(recipe, recipeRows[index].id)));
    await Promise.all(recipes.map((recipe, index) => this.replaceRecipeBags(recipe, recipeRows[index].id)));
    this.logRecipes(recipeRows);
    return recipeRows;
  }

  private async replaceRecipePermissions(recipe: ImportRecipeInput, recipeId: string) {
    await this.tx.recipePermission.deleteMany({
      where: { recipe_id: recipeId },
    });
    await Promise.all(recipe.permissions.map((permission) => this.tx.recipePermission.create({
      data: {
        recipe_id: recipeId,
        role_id: permission.roleId,
        level: permission.level,
      },
    })));
  }

  private async replaceRecipeBags(recipe: ImportRecipeInput, recipeId: string) {
    await this.tx.recipeBag.deleteMany({
      where: { recipe_id: recipeId },
    });

    for (const row of recipe.compiledBags) {
      await this.tx.recipeBag.create({
        data: {
          recipe_id: recipeId,
          bag_id: row.bagId,
          priority: row.priority,
          is_writable: row.isWritable,
          prefix: row.prefix,
        },
      });
    }
  }

  async compileRecipeSimpleV1(
    recipeDefinition: RecipeDefinition,
    templateDefinition: TemplateDefinition
  ): Promise<{ bags: ImportCompiledRecipeBagInput[], plugins: string[] }> {
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
          } satisfies ImportCompiledRecipeBagInput)),
        ...readonlyBags
          .map((e, i) => ({
            bagId: bagLookup.get(e)!.id,
            isWritable: false,
            priority: i + writablePrefixBags.length,
            prefix: "",
          } satisfies ImportCompiledRecipeBagInput))
      ],
    }
  }

  private validateProtectedRoles(roles: ImportRoleInput[]) {
    if (!this.initStore) {
      if (roles.some((entry) => entry.role_name === "ADMIN"))
        throw new Error("Seed data cannot modify protected rows.");
      if (roles.some((entry) => entry.role_name === "USER"))
        throw new Error("Seed data cannot modify protected rows.");
    }
  }

  private validateProtectedTemplates(templates: ImportTemplateInput[]) {
    if (!this.initStore && templates.some((entry) => entry.definition.name === "Blank Template"))
      throw new Error("Seed data cannot modify protected rows.");
  }

  private logRecipes(recipeRows: ImportedRecipeRows) {
    recipeRows.forEach((recipe) => {
      console.log(`/wiki/${recipe.slug}`);
    });
  }
}

export function importRoles(prisma: PrismaEngineClient, roles: ImportRoleInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new WikiImportWriter(tx, initStore);
    return importer.importRoles(roles);
  });
}

export function importUsers(prisma: PrismaEngineClient, users: ImportUserInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new WikiImportWriter(tx, initStore);
    return importer.importUsers(users);
  });
}

export function importBags(prisma: PrismaEngineClient, bags: ImportBagInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new WikiImportWriter(tx, initStore);
    return importer.importBags(bags);
  });
}

export function importTemplates(prisma: PrismaEngineClient, templates: ImportTemplateInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new WikiImportWriter(tx, initStore);
    return importer.importTemplates(templates);
  });
}

export function importRecipes(prisma: PrismaEngineClient, recipes: ImportRecipeInput[], initStore = false) {
  return prisma.$transaction(async (tx) => {
    const importer = new WikiImportWriter(tx, initStore);
    return importer.importRecipes(recipes);
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

