import type { DataSave, DataStore, MappingRow, PermissionRow, Reference, TemplateTypes } from "@mws/admin-vanilla/src/definition/tabs";
import { ServerRequest } from "@tiddlywiki/server";
import { BagImportWriter, RecipeImportWriter, RoleImportWriter, TemplateImportWriter, UserImportWriter } from "./wiki-import";
import { BagPermissionLevel } from "./wiki-contract";
import { RecipePermissionLevel } from "@tiddlywiki/mws-prisma";

type IWikiRow = DataStore["wikis"][number];
type ITemplateRow = DataStore["templates"][number];
type IBagRow = DataStore["bags"][number];
type IPluginRow = DataStore["plugins"][number];
type IUserRow = DataStore["users"][number];
type IRoleRow = DataStore["roles"][number];


export type TemplateDefinition = Omit<
  DataStore["templates"][number],
  | "id"
  | "name"
  | "lastUpdatedAt"
  | "templatePermissions"
  | "dependentWikis"
>;

export type RecipeDefinition = Omit<
  DataStore["wikis"][number],
  | "id"
  | "slug"
  | "templateRef"
  | "lastCompiledAt"
  | "recipePermissions"
  | "effectiveWritableBags"
  | "effectiveReadonlyBags"
  | "effectivePluginSet"
>;

declare global {
  namespace PrismaJson {
    type Template_definition = TemplateDefinition;
    type Recipe_definition = RecipeDefinition;
  }
}

export type {
  UpsertBagInput,
  UpsertRecipeInput,
  UpsertRoleInput,
  UpsertTemplateInput,
  UpsertUserInput,
} from "./wiki-contract";
export {
  importBags as importBags,
  importRecipes as importRecipes,
  importRoles as importRoles,
  importTemplates as importTemplates,
  importUsers as importUsers,
  indexImportedBagsByName,
  indexImportedRecipesBySlug,
  indexImportedRolesByName,
  indexImportedTemplatesByName,
  indexImportedUsersByUsername,
  type ImportedBagRows,
  type ImportedRecipeRows,
  type ImportedRoleRows,
  type ImportedTemplateRow,
  type ImportedUserRows,
} from "./wiki-import";




abstract class WikiRow implements IWikiRow {
  abstract id: string;
  abstract description: string;
  abstract plugins: readonly string[];
  abstract slug: string;
  abstract displayName: string;
  abstract lastCompiledAt: string;
  abstract templateRef: Reference | null;
  abstract readonlyBags: readonly string[];
  abstract writablePrefixBags: readonly MappingRow[];
  abstract effectiveWritableBags: readonly MappingRow[];
  abstract effectiveReadonlyBags: readonly string[];
  abstract effectivePluginSet: readonly string[];
  abstract recipePermissions: readonly PermissionRow<RecipePermissionLevel>[];
}


abstract class TemplateRow implements ITemplateRow {
  abstract id: string;
  abstract type: TemplateTypes;
  abstract name: string;
  abstract description: string;
  abstract plugins: readonly string[];
  abstract readonlyBags: readonly string[];
  abstract writablePrefixBags: readonly MappingRow[];
  abstract lastUpdatedAt: string;
  abstract requiredPluginsEnabled: boolean;
  abstract templatePermissions: readonly PermissionRow<RecipePermissionLevel>[];
  abstract customHtmlEnabled: boolean;
  abstract htmlContent: string;
  abstract injectionArray: string;
  abstract injectionLocation: string;
  abstract dependentWikis: string;

}

abstract class BagRow implements IBagRow {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract permissions: readonly PermissionRow<BagPermissionLevel>[];
}

abstract class PluginRow implements IPluginRow {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract pluginPath: string;
}

abstract class RoleRow implements IRoleRow {
  abstract id: string;
  abstract description: string;
  abstract name: string;

}

abstract class UserRow implements IUserRow {
  abstract id: string;
  abstract username: string;
  abstract email: string;
  abstract userRoles: readonly string[];
  abstract password: string;
}


export type TabId = "wikis" | "templates" | "bags" | "plugins" | "roles" | "users";

function normalizeLineList(values: readonly string[]): string[] {
  return values.map((entry) => entry.trim()).filter(Boolean);
}

function normalizePrefixRows(rows: readonly MappingRow[]): MappingRow[] {
  return rows
    .map((row) => ({ left: row.left, right: row.right.trim() }))
    .filter((row) => row.right);
}

function normalizePermissions<Level extends string>(rows: readonly PermissionRow<Level>[]): PermissionRow<Level>[] {
  return rows
    .map((row) => ({ role: row.role.trim(), level: row.level }))
    .filter((row) => row.role);
}
// #region saveWiki
export async function saveWikiRow(prisma: PrismaTxnClient, data: DataSave["wikis"][number]): Promise<string> {
  const importer = new RecipeImportWriter(prisma, false);
  const templateRef = data.templateRef;
  if (!templateRef) throw new Error("wiki template reference is required");
  const template = await prisma.template.findUnique({ where: { id: templateRef.id } });
  if (!template) throw new Error("wiki template not found");
  const authoredWritableRows = normalizePrefixRows(data.writablePrefixBags);
  const recipePermissions = normalizePermissions(data.recipePermissions);
  const authoredDefinition: PrismaJson.Recipe_definition = {
    displayName: data.displayName,
    description: data.description,
    readonlyBags: normalizeLineList(data.readonlyBags),
    writablePrefixBags: authoredWritableRows,
    plugins: normalizeLineList(data.plugins),
  };

  await importer.checkExisting(data.id, data.slug);

  const compiled = await importer.compileRecipeSimpleV1(
    authoredDefinition,
    template.definition
  );

  const permissionRolesMapper = await getRolesMapper(prisma, recipePermissions.map((row) => row.role));

  const [recipe] = await importer.upsert([{
    slug: data.slug,
    templateId: template.id,
    compiledBags: compiled.bags,
    plugins: compiled.plugins,
    definition: authoredDefinition,
    permissions: recipePermissions.map(row => ({
      level: row.level,
      role_id: permissionRolesMapper(row.role),
    })),
  }]);

  return recipe.id;
}
// #region saveTemplate
export async function saveTemplateRow(prisma: PrismaTxnClient, data: DataSave["templates"][number]): Promise<string> {
  const importer = new TemplateImportWriter(prisma, false);
  await importer.checkExisting(data.id, data.name);

  const [template] = await importer.upsert([{
    type: "simpleV1",
    name: data.name,
    description: data.description,
    readonlyBags: normalizeLineList(data.readonlyBags),
    writablePrefixBags: normalizePrefixRows(data.writablePrefixBags),
    plugins: normalizeLineList(data.plugins),
    requiredPluginsEnabled: data.requiredPluginsEnabled,
    customHtmlEnabled: data.customHtmlEnabled,
    htmlContent: data.htmlContent,
    injectionArray: data.injectionArray,
    injectionLocation: data.injectionLocation,
  }]);

  const recipes = await prisma.recipe.findMany({
    where: { template_id: template.id },
    include: { permissions: true }
  });

  const importerRecipe = new RecipeImportWriter(prisma, false);

  for (const recipe of recipes) {
    const compiled = await importerRecipe.compileRecipeSimpleV1(
      recipe.definition,
      template.definition
    );

    await importerRecipe.upsert([{
      slug: recipe.slug,
      templateId: template.id,
      compiledBags: compiled.bags,
      plugins: compiled.plugins,
      definition: recipe.definition,
      permissions: recipe.permissions.map(row => ({
        level: row.level,
        role_id: row.role_id,
      })),
    }]);
  }

  return template.id;
}
// #region saveBag
export async function saveBagRow(prisma: PrismaTxnClient, data: DataSave["bags"][number]): Promise<string> {
  const importer = new BagImportWriter(prisma, false);
  await importer.checkExisting(data.id, data.name);
  const permissions = normalizePermissions(data.permissions);
  const rolesMapper = await getRolesMapper(prisma, permissions.map(e => e.role))

  const [bag] = await importer.upsert([{
    name: data.name,
    description: data.description,
    permissions: data.permissions.map(e => ({
      role_id: rolesMapper(e.role),
      level: e.level as BagPermissionLevel
    }))
  }]);

  return bag.id;
}
async function getRolesMapper(prisma: PrismaTxnClient, roles: readonly string[]) {
  return await new RoleImportWriter(prisma, false).getNameMapper(roles);
}

// #region saveRole
export async function saveRoleRow(prisma: PrismaTxnClient, data: DataSave["roles"][number]) {
  const importer = new RoleImportWriter(prisma, false);
  await importer.checkExisting(data.id, data.name);

  const [role] = await importer.upsert([{
    description: data.description,
    name: data.name,
  }]);

  return role.role_id;

}
// #region saveUser
export async function saveUserRow(prisma: PrismaTxnClient, data: DataSave["users"][number]): Promise<string> {

  const importer = new UserImportWriter(prisma, false);
  await importer.checkExisting(data.id, data.username);

  const rolesMapper = await getRolesMapper(prisma, data.userRoles);
  const roleLinks = data.userRoles.map(e => rolesMapper(e));

  const [user] = await importer.upsert([{
    username: data.username,
    email: data.email,
    password: data.password,
    roleIds: roleLinks,
  }])

  return user.user_id;
}
// #region savePlugin
async function savePluginRow(_prisma: PrismaTxnClient, _data: DataSave["plugins"][number]): Promise<string> {
  throw new Error("Plugin admin save is not implemented in the database-backed admin path.");
}

export async function doAdminDataOp(
  prisma: PrismaTxnClient,
  pluginCache: ServerRequest["pluginCache"],
  op: "save",
  tab: TabId,
  data: any
) {
  if (op !== "save") throw new Error(`Unsupported admin operation: ${op}`);

  let id: string;
  switch (tab) {
    case "wikis": id = await saveWikiRow(prisma, data as IWikiRow); break;
    case "templates": id = await saveTemplateRow(prisma, data as ITemplateRow); break;
    case "bags": id = await saveBagRow(prisma, data as IBagRow); break;
    case "roles": id = await saveRoleRow(prisma, data as IRoleRow); break;
    case "users": id = await saveUserRow(prisma, data as IUserRow); break;
    case "plugins": id = await savePluginRow(prisma, data as IPluginRow); break;
    default: {
      const _exhaustive: never = tab;
      throw new Error(`Unsupported admin tab: ${_exhaustive}`);
    }
  }

  const store = await getAdminDataStore(prisma, pluginCache);
  const saved = store[tab].find((row) => row.id === id);
  if (!saved) throw new Error(`Saved ${tab} row not found: ${id}`);
  return saved;
}

export async function getAdminDataStore(prisma: PrismaTxnClient, pluginCache: ServerRequest["pluginCache"]) {
  const [templates, recipes, bags, roles, users] = await Promise.all([
    prisma.template.findMany({
      select: {
        id: true,
        name: true,
        definition: true,
        recipes: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.recipe.findMany({
      select: {
        id: true,
        slug: true,
        definition: true,
        plugins: true,
        template_id: true,
        permissions: {
          select: {
            level: true,
            role_id: true,
          },
          orderBy: { role_id: "asc" },
        },
        recipe_bags: {
          select: {
            bag_id: true,
            priority: true,
            is_writable: true,
            prefix: true,
            bag: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ priority: "asc" }, { prefix: "desc" }],
        },
      },
      orderBy: { slug: "asc" },
    }),
    prisma.bag.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          select: {
            level: true,
            role_id: true,
          },
          orderBy: { role_id: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.roles.findMany({
      select: {
        role_id: true,
        role_name: true,
        description: true,
      },
      orderBy: { role_name: "asc" },
    }),
    prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        password: true,
        roles: {
          select: {
            role_name: true,
          },
          orderBy: { role_name: "asc" },
        },
      },
      orderBy: { username: "asc" },
    }),
  ]);

  const roleNameById = new Map(roles.map((role) => [role.role_id, role.role_name]));
  const templateNameById = new Map(templates.map((template) => [template.id, template.name]));

  const templateRows = templates.map((template): ITemplateRow => {
    const definition = template.definition;
    return {
      id: template.id,
      name: template.name,
      type: "simpleV1",
      description: definition.description,
      readonlyBags: definition.readonlyBags,
      writablePrefixBags: definition.writablePrefixBags,
      plugins: definition.plugins,
      lastUpdatedAt: "",
      requiredPluginsEnabled: definition.requiredPluginsEnabled,
      templatePermissions: [],
      customHtmlEnabled: definition.customHtmlEnabled,
      htmlContent: definition.htmlContent,
      injectionArray: definition.injectionArray,
      injectionLocation: definition.injectionLocation,
      // dependentWikis: JSON.stringify(template.recipes.map((recipe) => ({ id: recipe.id, name: recipe.slug }))),
    };
  });

  const wikiRows: IWikiRow[] = recipes.map((recipe) => {
    const definition = recipe.definition;
    const effectivePluginSet = recipe.plugins;
    const effectiveReadonlyBags = recipe.recipe_bags
      .filter(e => !e.is_writable)
      .map((row) => row.bag.name);
    const effectiveWritableBags = recipe.recipe_bags
      .filter((row) => row.is_writable)
      .sort((a, b) => b.prefix.length - a.prefix.length)
      .map((row) => ({ left: row.prefix, right: row.bag.name }));
    const permissions = recipe.permissions.map((row) => ({
      role: roleNameById.get(row.role_id) ?? row.role_id,
      level: row.level,
    }));
    const definitionWritableBags = [...definition.writablePrefixBags]
      .sort((a, b) => b.left.length - a.left.length);
    return {
      id: recipe.id,
      slug: recipe.slug,
      displayName: definition.displayName,
      description: definition.description,
      templateRef: {
        id: recipe.template_id,
        name: templateNameById.get(recipe.template_id) ?? ""
      },
      writablePrefixBags: definitionWritableBags,
      readonlyBags: definition.readonlyBags,
      plugins: definition.plugins,
      lastCompiledAt: "",
      recipePermissions: permissions,
      effectiveWritableBags,
      effectiveReadonlyBags,
      effectivePluginSet,
    };
  });

  const bagRows: IBagRow[] = bags.map((bag) => ({
    id: bag.id,
    name: bag.name,
    description: bag.description,
    permissions: bag.permissions.map((row) => ({
      role: roleNameById.get(row.role_id) ?? row.role_id,
      level: row.level,
    })),
  }));

  const roleRows: IRoleRow[] = roles.map((role) => ({
    id: role.role_id,
    name: role.role_name,
    description: role.description ?? "",
  }));

  const userRows: IUserRow[] = users.map((user) => ({
    id: user.user_id,
    username: user.username,
    email: user.email,
    userRoles: user.roles.map((role) => role.role_name),
    password: user.password,
  }));

  return {
    wikis: wikiRows,
    templates: templateRows,
    bags: bagRows,
    plugins: pluginCache.pluginsList.map(e => ({
      id: e.title,
      name: e.title,
      description: `${e.name}: ${e.description}`,
      pluginPath: e.path,
    } satisfies IPluginRow)),
    roles: roleRows,
    users: userRows,
  };
}

