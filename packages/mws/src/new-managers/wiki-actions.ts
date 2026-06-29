import type { DataStore, MappingRow, PermissionRow, Reference } from "@mws/admin-vanilla/src/definition/tabs";
import { ServerRequest } from "@tiddlywiki/server";

type IWikiRow = DataStore["wikis"][number];
type ITemplateRow = DataStore["templates"][number];
type IBagRow = DataStore["bags"][number];
type IPluginRow = DataStore["plugins"][number];
type IUserRow = DataStore["users"][number];
type IRoleRow = DataStore["roles"][number];


type TemplateDefinition = Omit<
  ITemplateRow,
  | "id"
  | "lastUpdatedAt"
  | "templatePermissions"
  | "dependentWikis"
>;

type RecipeDefinition = Omit<
  IWikiRow,
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
  ImportBagInput as SeedBagInput,
  ImportRecipeInput as SeedRecipeInput,
  ImportRoleInput as SeedRoleInput,
  ImportTemplateInput as SeedTemplateInput,
  ImportUserInput as SeedUserInput,
} from "./wiki-contract";
export {
  importBags as importSeedBags,
  importRecipes as importSeedRecipes,
  importRoles as importSeedRoles,
  importTemplates as importSeedTemplates,
  importUsers as importSeedUsers,
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
  abstract recipePermissions: readonly PermissionRow<string>[];
}


abstract class TemplateRow implements ITemplateRow {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract plugins: readonly string[];
  abstract readonlyBags: readonly string[];
  abstract writablePrefixBags: readonly MappingRow[];
  abstract lastUpdatedAt: string;
  abstract requiredPluginsEnabled: boolean;
  abstract templatePermissions: readonly PermissionRow<string>[];
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
  abstract permissions: readonly PermissionRow<string>[];
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
  abstract roleId: string;

}

abstract class UserRow implements IUserRow {
  abstract id: string;
  abstract username: string;
  abstract email: string;
  abstract userRoles: readonly string[];
  abstract password: string;
}


export type TabId = "wikis" | "templates" | "bags" | "plugins" | "roles" | "users";

type PermissionValue = "A_read" | "B_write" | "C_admin";

function parseLineList(value: string): string[] {
  if (!value.trim()) return [];
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean);
}

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

function toMappingRows(obj: Record<string, string>): MappingRow[] {
  return Object.entries(obj).map(([left, right]) => ({ left, right }));
}

function parsePluginReference(pluginValue: string) {
  const trimmed = pluginValue.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex > 0) {
    return {
      name: trimmed.slice(0, atIndex),
      version: trimmed.slice(atIndex + 1) || "",
    };
  }
  return { name: trimmed, version: "" };
}

async function getRoleIdsByName(prisma: PrismaTxnClient, roleNames: readonly string[]): Promise<Map<string, string>> {
  const uniqueRoleNames = Array.from(new Set(roleNames.map((name) => name.trim()).filter(Boolean)));
  const rows = await prisma.roles.findMany({
    where: { role_name: { in: uniqueRoleNames } },
    select: { role_id: true, role_name: true },
  });
  return new Map(rows.map((row) => [row.role_name, row.role_id]));
}

async function getBagIdsByName(prisma: PrismaTxnClient, bagNames: string[]): Promise<Map<string, string>> {
  const uniqueBagNames = Array.from(new Set(bagNames.map((name) => name.trim()).filter(Boolean)));
  const rows = await prisma.bag.findMany({
    where: { name: { in: uniqueBagNames } },
    select: { id: true, name: true },
  });
  return new Map(rows.map((row) => [row.name, row.id]));
}

async function saveWikiRow(prisma: PrismaTxnClient, data: IWikiRow): Promise<string> {
  const templateRef = data.templateRef;
  if (!templateRef) throw new Error("wiki template reference is required");
  const authoredWritableRows = normalizePrefixRows(data.writablePrefixBags);
  const effectiveWritableRows = normalizePrefixRows(data.effectiveWritableBags);
  const effectiveReadonlyBags = normalizeLineList(data.effectiveReadonlyBags);
  const recipePermissions = normalizePermissions(data.recipePermissions);
  const authoredDefinition: PrismaJson.Recipe_definition = {
    displayName: data.displayName,
    description: data.description,
    readonlyBags: normalizeLineList(data.readonlyBags),
    writablePrefixBags: authoredWritableRows,
    plugins: normalizeLineList(data.plugins),
  };

  const permissionRoleIds = await getRoleIdsByName(prisma, recipePermissions.map((row) => row.role));
  const compiledBagNames = [
    ...effectiveWritableRows.map((row) => row.right),
    ...effectiveReadonlyBags,
  ];
  const bagIdsByName = await getBagIdsByName(prisma, compiledBagNames);
  const existing = data.id ? await prisma.recipe.findUnique({ where: { id: data.id }, select: { id: true } }) : null;

  const recipe = existing
    ? await prisma.recipe.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        template_id: templateRef.id,
        definition: authoredDefinition,
        plugins: normalizeLineList(data.effectivePluginSet),
      },
      select: { id: true },
    })
    : await prisma.recipe.create({
      data: {
        slug: data.slug,
        template_id: templateRef.id,
        definition: authoredDefinition,
        plugins: normalizeLineList(data.effectivePluginSet),
      },
      select: { id: true },
    });

  await prisma.recipePermission.deleteMany({ where: { recipe_id: recipe.id } });
  if (recipePermissions.length) {
    await Promise.all(recipePermissions.map((row) => prisma.recipePermission.create({
      data: {
        recipe_id: recipe.id,
        role_id: permissionRoleIds.get(row.role) ?? row.role,
        level: row.level as "A_read" | "B_write",
      },
    })));
  }

  await prisma.recipeBag.deleteMany({ where: { recipe_id: recipe.id } });
  const compiledRows = [
    ...effectiveWritableRows.map((row, index) => ({
      bagName: row.right,
      priority: index,
      is_writable: true,
      prefix: row.left,
    })),
    ...effectiveReadonlyBags.map((bagName, index) => ({
      bagName,
      priority: effectiveWritableRows.length + index,
      is_writable: false,
      prefix: "",
    })),
  ];
  if (compiledRows.length) {
    await Promise.all(compiledRows.map((row) => prisma.recipeBag.create({
      data: {
        recipe_id: recipe.id,
        bag_id: bagIdsByName.get(row.bagName) ?? row.bagName,
        priority: row.priority,
        is_writable: row.is_writable,
        prefix: row.prefix,
      },
    })));
  }

  return recipe.id;
}

async function saveTemplateRow(prisma: PrismaTxnClient, data: ITemplateRow): Promise<string> {
  const writableRows = normalizePrefixRows(data.writablePrefixBags);
  const existing = data.id ? await prisma.template.findUnique({ where: { id: data.id }, select: { id: true, type: true, definition: true } }) : null;
  const definition: PrismaJson.Template_definition = {
    name: data.name,
    description: data.description,
    readonlyBags: normalizeLineList(data.readonlyBags),
    writablePrefixBags: writableRows,
    plugins: normalizeLineList(data.plugins),
    requiredPluginsEnabled: data.requiredPluginsEnabled,
    customHtmlEnabled: data.customHtmlEnabled,
    htmlContent: data.htmlContent,
    injectionArray: data.injectionArray,
    injectionLocation: data.injectionLocation,
  };

  const template = existing
    ? await prisma.template.update({
      where: { id: data.id },
      data: { definition },
      select: { id: true },
    })
    : await prisma.template.create({
      data: {
        type: "prefixV1",
        definition,
      },
      select: { id: true },
    });

  return template.id;
}

async function saveBagRow(prisma: PrismaTxnClient, data: IBagRow): Promise<string> {
  const permissions = normalizePermissions(data.permissions);
  const userRolesByName = await getRoleIdsByName(prisma, permissions.map((row) => row.role));
  const existing = data.id ? await prisma.bag.findUnique({ where: { id: data.id }, select: { id: true } }) : null;
  const bag = existing
    ? await prisma.bag.update({
      where: { id: data.id },
      data: { name: data.name, description: data.description },
      select: { id: true },
    })
    : await prisma.bag.create({
      data: { name: data.name, description: data.description },
      select: { id: true },
    });

  await prisma.bagPermission.deleteMany({ where: { bag_id: bag.id } });
  if (permissions.length) {
    await Promise.all(permissions.map((row) => prisma.bagPermission.create({
      data: {
        bag_id: bag.id,
        role_id: userRolesByName.get(row.role) ?? row.role,
        level: row.level as PermissionValue,
      },
    })));
  }
  return bag.id;
}

async function saveRoleRow(prisma: PrismaTxnClient, data: IRoleRow): Promise<string> {
  const existing = data.id ? await prisma.roles.findUnique({ where: { role_id: data.id }, select: { role_id: true } }) : null;
  const role = existing
    ? await prisma.roles.update({
      where: { role_id: data.id },
      data: { role_name: data.roleId, description: data.description || null },
      select: { role_id: true },
    })
    : await prisma.roles.create({
      data: { role_name: data.roleId, description: data.description || null },
      select: { role_id: true },
    });
  return role.role_id;
}

async function saveUserRow(prisma: PrismaTxnClient, data: IUserRow): Promise<string> {
  const roleNames = data.userRoles;
  const userRolesByName = await getRoleIdsByName(prisma, roleNames);
  const roleLinks = roleNames.map((roleName) => ({ role_id: userRolesByName.get(roleName) ?? roleName }));
  const existing = data.id ? await prisma.users.findUnique({ where: { user_id: data.id }, select: { user_id: true } }) : null;
  const user = existing
    ? await prisma.users.update({
      where: { user_id: data.id },
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        roles: { set: roleLinks },
      },
      select: { user_id: true },
    })
    : await prisma.users.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        roles: { connect: roleLinks },
      },
      select: { user_id: true },
    });
  return user.user_id;
}

async function savePluginRow(_prisma: PrismaTxnClient, _data: IPluginRow): Promise<string> {
  throw new Error("Plugin admin save is not implemented in the database-backed admin path.");
}

export async function doAdminDataOp(prisma: PrismaTxnClient, pluginCache: ServerRequest["pluginCache"], op: "save", tab: TabId, data: any) {
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
  const templateNameById = new Map(templates.map((template) => [template.id, template.definition.name]));

  const templateRows: ITemplateRow[] = templates.map((template) => {
    const definition = template.definition;
    return {
      id: template.id,
      name: definition.name,
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
      dependentWikis: JSON.stringify(template.recipes.map((recipe) => ({ id: recipe.id, name: recipe.slug }))),
    };
  });

  const wikiRows: IWikiRow[] = recipes.map((recipe) => {
    const definition = recipe.definition;
    const effectivePluginSet = Array.isArray(recipe.plugins) ? recipe.plugins.map(String) : [];
    const effectiveReadonlyBags = recipe.recipe_bags.filter(e => !e.is_writable).map((row) => row.bag.name);
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
      templateRef: { id: recipe.template_id, name: templateNameById.get(recipe.template_id) ?? recipe.template_id },
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
    roleId: role.role_name,
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
