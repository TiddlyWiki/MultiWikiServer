import type { DataStore, MappingRow, PermissionRow, Reference } from "@mws/admin-vanilla/src/definition/tabs";
import { PrismaClient } from "@tiddlywiki/mws-prisma";

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

type Template_type = "simpleV1";

declare global {
  namespace PrismaJson {
    type Template_definition = TemplateDefinition;
    type Recipe_definition = RecipeDefinition;
  }
}




export type SeedPermissionLevel = "A_read" | "B_write" | "C_admin";

export interface SeedRoleInput {
  role_name: string;
  description: string;
}

export interface SeedUserInput {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface SeedBagPermissionInput {
  roleName: string;
  level: SeedPermissionLevel;
}

export interface SeedBagInput {
  name: string;
  description: string;
  permissions: SeedBagPermissionInput[];
}

export interface SeedTemplateInput {
  key: string;
  type: Template_type;
  definition: {
    name: string;
    description: string;
    readonlyBags: string[];
    writablePrefixBags: Record<string, string>;
    plugins: string[];
    requiredPluginsEnabled: boolean;
    customHtmlEnabled: boolean;
    htmlContent: string;
    injectionArray: string;
    injectionLocation: string;
  };
}

export interface SeedRecipePermissionInput {
  roleName: string;
  level: "A_read" | "B_write";
}

export interface SeedCompiledRecipeBagInput {
  bagName: string;
  priority: number;
  isWritable: boolean;
  prefix: string;
}

export interface SeedRecipeInput {
  slug: string;
  templateKey: string;
  definition: {
    displayName: string;
    description: string;
    readonlyBags: string[];
    writablePrefixBags: Record<string, string>;
    plugins: string[];
  };
  plugins: string[];
  permissions: SeedRecipePermissionInput[];
  compiledBags: SeedCompiledRecipeBagInput[];
}

export interface SeedWikiInput {
  roles: SeedRoleInput[];
  users: SeedUserInput[];
  bags: SeedBagInput[];
  templates: SeedTemplateInput[];
  recipes: SeedRecipeInput[];
}

const SAMPLE_WIKI_DATA: SeedWikiInput = {
  roles: [
    { role_name: "admin", description: "Full administrative access across the mock multi-wiki surface." },
    { role_name: "editor", description: "Can edit routine authored configuration and content." },
    { role_name: "viewer", description: "Read-only access to published wiki content." },
    { role_name: "plugin-authors", description: "Can edit plugin-lab wiki content and related assets." },
    { role_name: "qa", description: "Can review plugin-lab wiki content." },
  ],
  users: [
    {
      username: "alex",
      email: "alex@example.com",
      password: "",
      roles: ["admin", "editor"],
    },
    {
      username: "sam",
      email: "sam@example.com",
      password: "",
      roles: ["editor"],
    },
  ],
  bags: [
    {
      name: "bag-engineering-main",
      description: "Primary write target for engineering wiki content.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "B_write" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-shared-specs",
      description: "Readonly canonical specs consumed across multiple workspaces.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "A_read" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-shared-archive",
      description: "Readonly archive content available to workspace-style wikis.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "A_read" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-policy",
      description: "Shared policy and governance content layered into workspace wikis.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "A_read" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-docs",
      description: "Writable namespace target for Docs/ titles.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "B_write" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-drafts",
      description: "Writable namespace target for Drafts/ titles.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "B_write" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-user-space",
      description: "Writable namespace target for user-authored personal notes.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "editor", level: "B_write" }, { roleName: "viewer", level: "A_read" }],
    },
    {
      name: "bag-plugin-base",
      description: "Readonly shared base content for plugin workspaces.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "plugin-authors", level: "A_read" }, { roleName: "qa", level: "A_read" }],
    },
    {
      name: "bag-plugin-archive",
      description: "Readonly historical plugin review content.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "plugin-authors", level: "A_read" }, { roleName: "qa", level: "A_read" }],
    },
    {
      name: "bag-plugin-lab",
      description: "Primary write target for plugin lab content.",
      permissions: [{ roleName: "admin", level: "C_admin" }, { roleName: "plugin-authors", level: "B_write" }, { roleName: "qa", level: "A_read" }],
    },
  ],
  templates: [
    {
      key: "workspace-template",
      type: "simpleV1",
      definition: {
        name: "Workspace Template",
        description: "General-purpose workspace wiki with namespace-based write routing.",
        readonlyBags: ["bag-shared-specs", "bag-shared-archive", "bag-policy"],
        writablePrefixBags: {
          "Docs/": "bag-docs",
          "Users/": "bag-user-space",
        },
        plugins: [],
        requiredPluginsEnabled: true,
        customHtmlEnabled: false,
        htmlContent: "",
        injectionArray: "$tw.preloadTiddlers",
        injectionLocation: "",
      },
    },
    {
      key: "plugin-template",
      type: "simpleV1",
      definition: {
        name: "Plugin Sandbox",
        description: "Draft-heavy workspace for plugin authoring and review.",
        readonlyBags: ["bag-plugin-base", "bag-plugin-archive"],
        writablePrefixBags: {
          "Plugins/": "bag-plugin-lab",
          "": "bag-plugin-lab",
        },
        plugins: [],
        requiredPluginsEnabled: false,
        customHtmlEnabled: true,
        htmlContent: "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Plugin Sandbox</title>\n</head>\n<body>\n  <!-- INJECT STORE TIDDLERS HERE -->\n</body>\n</html>",
        injectionArray: "$tw.preloadTiddlers",
        injectionLocation: "<!-- INJECT STORE TIDDLERS HERE -->",
      },
    },
  ],
  recipes: [
    {
      slug: "engineering-hub",
      templateKey: "workspace-template",
      definition: {
        displayName: "Engineering Hub",
        description: "Shared engineering wiki with namespace routing for specs, drafts, and user notes.",
        readonlyBags: [],
        writablePrefixBags: {
          "Drafts/": "bag-drafts",
          "": "bag-engineering-main",
        },
        plugins: [],
      },
      plugins: [],
      permissions: [
        { roleName: "editor", level: "B_write" },
        { roleName: "viewer", level: "A_read" },
      ],
      compiledBags: [
        { bagName: "bag-drafts", priority: 0, isWritable: true, prefix: "Drafts/" },
        { bagName: "bag-user-space", priority: 1, isWritable: true, prefix: "Users/" },
        { bagName: "bag-docs", priority: 2, isWritable: true, prefix: "Docs/" },
        { bagName: "bag-engineering-main", priority: 3, isWritable: true, prefix: "" },
        { bagName: "bag-shared-specs", priority: 4, isWritable: false, prefix: "" },
        { bagName: "bag-shared-archive", priority: 5, isWritable: false, prefix: "" },
        { bagName: "bag-policy", priority: 6, isWritable: false, prefix: "" },
      ],
    },
    {
      slug: "plugin-lab",
      templateKey: "plugin-template",
      definition: {
        displayName: "Plugin Lab",
        description: "Sandbox for draft plugin work and package previews.",
        readonlyBags: [],
        writablePrefixBags: {
          "Plugins/": "bag-plugin-lab",
          "": "bag-plugin-lab",
        },
        plugins: [],
      },
      plugins: [],
      permissions: [
        { roleName: "plugin-authors", level: "B_write" },
        { roleName: "qa", level: "A_read" },
      ],
      compiledBags: [
        { bagName: "bag-plugin-lab", priority: 0, isWritable: true, prefix: "Plugins/" },
        { bagName: "bag-plugin-lab", priority: 1, isWritable: true, prefix: "" },
        { bagName: "bag-plugin-base", priority: 2, isWritable: false, prefix: "" },
        { bagName: "bag-plugin-archive", priority: 3, isWritable: false, prefix: "" },
      ],
    },
  ],
};

export function createWikiSeedData(prisma: PrismaEngineClient, seedData: SeedWikiInput) {
  return prisma.$transaction(async (tx) => {
    const roleRows = await Promise.all(seedData.roles.map((role) => tx.roles.upsert({
      where: { role_name: role.role_name },
      update: { description: role.description },
      create: { role_name: role.role_name, description: role.description },
    })));

    const rolesByName = new Map(roleRows.map((role) => [role.role_name, role]));

    await Promise.all(seedData.users.map((user) => {
      const roleLinks = user.roles.map((roleName) => ({ role_id: rolesByName.get(roleName)!.role_id }));
      return tx.users.upsert({
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

    const bagRows = await Promise.all(seedData.bags.map((bag) => tx.bag.create({
      data: { name: bag.name, description: bag.description },
    })));

    const bagsByName = new Map(bagRows.map((bag) => [bag.name, bag]));

    const setBagPermission = async (bagName: string, permissionRows: SeedBagPermissionInput[]) => {
      const bag = bagsByName.get(bagName)!;
      await Promise.all(permissionRows.map(({ roleName, level }) => tx.bagPermission.create({
        data: {
          bag_id: bag.id,
          role_id: rolesByName.get(roleName)!.role_id,
          level,
        },
      })));
    };

    await Promise.all(seedData.bags.map((bag) => setBagPermission(bag.name, bag.permissions)));

    const templateRows = await Promise.all(seedData.templates.map((template) => tx.template.create({
      data: {
        type: template.type,
        definition: {
          ...template.definition,
          writablePrefixBags: toMappingRows(template.definition.writablePrefixBags),
        },
      },
    })));

    const templatesByKey = new Map(seedData.templates.map((template, index) => [template.key, templateRows[index]]));

    const recipeRows = await Promise.all(seedData.recipes.map((recipe) => tx.recipe.create({
      data: {
        slug: recipe.slug,
        definition: {
          ...recipe.definition,
          writablePrefixBags: toMappingRows(recipe.definition.writablePrefixBags),
        },
        template_id: templatesByKey.get(recipe.templateKey)!.id,
        plugins: recipe.plugins,
      },
    })));

    const recipesBySlug = new Map(recipeRows.map((recipe) => [recipe.slug, recipe]));

    await Promise.all(seedData.recipes.flatMap((recipe) => recipe.permissions.map((permission) => tx.recipePermission.create({
      data: {
        recipe_id: recipesBySlug.get(recipe.slug)!.id,
        role_id: rolesByName.get(permission.roleName)!.role_id,
        level: permission.level,
      },
    }))));

    const compiledRecipeBags = seedData.recipes.flatMap((recipe) => recipe.compiledBags.map((row) => ({
      recipeId: recipesBySlug.get(recipe.slug)!.id,
      bagName: row.bagName,
      priority: row.priority,
      isWritable: row.isWritable,
      prefix: row.prefix,
    })));

    for (const row of compiledRecipeBags) {
      await tx.recipeBag.create({
        data: {
          recipe_id: row.recipeId,
          bag_id: bagsByName.get(row.bagName)!.id,
          priority: row.priority,
          is_writable: row.isWritable,
          prefix: row.prefix,
        },
      });
    }

    recipeRows.forEach((recipe) => {
      console.log(`/wiki/${recipe.slug}`);
    });

    return {
      bags: bagRows,
      templates: templateRows,
      recipes: recipeRows,
    };
  });
}

export function createSampleWiki(prisma: PrismaEngineClient) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.recipe.findMany({ select: { slug: true } });
    if (existing.length) {
      existing.map((recipe) => { console.log("wiki", recipe.slug); });
      return true;
    }
    return false;
  }).then((hasExistingRecipes) => {
    if (hasExistingRecipes) return;
    return createWikiSeedData(prisma, SAMPLE_WIKI_DATA);
  });
}




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
  abstract version: string;
  abstract description: string;
  abstract name: string;
  abstract status: string;
  abstract publishFromDraft: string;

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
  const existing = data.id ? await prisma.template.findUnique({ where: { id: data.id }, select: { id: true, type: true } }) : null;
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

export async function doAdminDataOp(prisma: PrismaTxnClient, op: "save", tab: TabId, data: any) {
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

  const store = await getAdminDataStore(prisma);
  const saved = store[tab].find((row) => row.id === id);
  if (!saved) throw new Error(`Saved ${tab} row not found: ${id}`);
  return saved;
}

export async function getAdminDataStore(prisma: PrismaTxnClient) {
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

  const pluginUsage = new Map<string, Set<string>>();
  const pluginVersions = new Map<string, Set<string>>();
  const templateUsage = new Map<string, Set<string>>();

  const addPluginUsage = ({ pluginValue, wikiName, templateName }: {
    pluginValue: string;
    wikiName?: string;
    templateName?: string;
  }) => {
    const { name, version } = parsePluginReference(pluginValue);
    if (!name) return;

    if (wikiName) {
      const wikiSet = pluginUsage.get(name) ?? new Set<string>();
      wikiSet.add(wikiName);
      pluginUsage.set(name, wikiSet);
    }

    if (templateName) {
      const templateSet = templateUsage.get(name) ?? new Set<string>();
      templateSet.add(templateName);
      templateUsage.set(name, templateSet);
    }

    const versionSet = pluginVersions.get(name) ?? new Set<string>();
    versionSet.add(version || "unspecified");
    pluginVersions.set(name, versionSet);
  };

  for (const template of templateRows) {
    for (const pluginValue of template.plugins) {
      addPluginUsage({ pluginValue, templateName: template.name });
    }
  }

  for (const wiki of wikiRows) {
    const wikiName = wiki.slug || wiki.displayName || "";
    for (const pluginValue of wiki.effectivePluginSet) {
      addPluginUsage({ pluginValue, wikiName });
    }
  }

  const pluginRows: IPluginRow[] = Array.from(
    new Set([
      ...pluginUsage.keys(),
      ...templateUsage.keys(),
      ...pluginVersions.keys(),
    ])
  ).sort((a, b) => a.localeCompare(b)).map((pluginName) => {
    const usedByWikis = Array.from(pluginUsage.get(pluginName) ?? []).sort();
    const referencedByTemplates = Array.from(templateUsage.get(pluginName) ?? []).sort();
    const versions = Array.from(pluginVersions.get(pluginName) ?? []).sort();

    return {
      id: pluginName,
      name: pluginName,
      version: versions.find((version) => version !== "unspecified") ?? "",
      status: usedByWikis.length ? "active" : "referenced",
      description: referencedByTemplates.length
        ? `Referenced by templates: ${referencedByTemplates.join(", ")}`
        : "Derived from wiki and template plugin references.",
      publishFromDraft: "",
      assetsMetadata: [
        { key: "referenceCount", value: String(versions.length) },
        { key: "versions", value: versions.join(", ") },
        { key: "templates", value: referencedByTemplates.join(", ") },
      ].filter((row) => row.value).map((row) => `${row.key}: ${row.value}`).join("\n"),
      usedByWikis: usedByWikis.join("\n"),
      usageCount: String(usedByWikis.length),
      draftOf: "",
      updatedAt: "",
    };
  });

  return {
    wikis: wikiRows,
    templates: templateRows,
    bags: bagRows,
    plugins: pluginRows,
    roles: roleRows,
    users: userRows,
  };
}
