import {
  DataSave,
  DataStore,
  IdString,

  WritablePrefixRow,
  PermissionRow,
  TabId,
  TemplateTypes,
  buildTabZodObject
} from "@mws/admin-vanilla/src/definition/tabs";
import {
  checkData,
  SendError,
  ServerRequest,
  Z2,
  zod,
  zodRoute
} from "@tiddlywiki/server";
import {
  BagImportWriter,
  DEFAULT_TEMPLATE,
  RecipeImportWriter,
  RoleImportWriter,
  TemplateImportWriter,
  UserImportWriter
} from "./TabUpserts";
import {
  BagPermissionLevel,
  RecipePermissionLevel
} from "@tiddlywiki/mws-prisma";
import {
  CompiledRecipeBagInput,
  UpsertTemplateInput
} from "./wiki-contract";
import { createHash } from "crypto";
import { debuglog } from "util";
import { Debug } from "@prisma/client/runtime/client";



type IRecipeRow = DataStore["wikis"][number];
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
  | "templateName"
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
  type ImportedBagRows,
  type ImportedRecipeRows,
  type ImportedRoleRows,
  type ImportedTemplateRow,
  type ImportedUserRows,
} from "./TabUpserts";


// #region abstracts

function normalizeLineList<T extends string | string | IdString>(values: readonly T[]): T[] {
  return values.map((entry) => entry.trim() as T).filter(Boolean);
}

function normalizePrefixRows(rows: readonly WritablePrefixRow[]): WritablePrefixRow[] {
  return rows
    .map((row) => ({ prefix: row.prefix, bagName: row.bagName.trim() }))
    .filter((row) => row.bagName)
    .sort((a, b) => b.prefix.length - a.prefix.length);
}

function normalizePermissions<Level extends string>(rows: readonly PermissionRow<Level>[]): PermissionRow<Level>[] {
  return rows
    .map((row) => ({ role: row.role.trim(), level: row.level }))
    .filter((row) => row.role);
}


abstract class TabDataAdapter<TAB extends TabId> {
  constructor(protected user: ServerRequest["user"]) { }
  abstract saveRow(prisma: PrismaTxnClient, data: DataSave[TAB][number]): Promise<DataStore[TAB][number]>;
  // roles aren't connected to data tables so they can be swapped out for SSO
  abstract getList(prisma: PrismaTxnClient, roles: (key: IdString) => string): Promise<DataStore[TAB]>;
}
// #region Recipe
export class RecipeDataAdapter extends TabDataAdapter<"wikis"> {

  async saveRow(prisma: PrismaTxnClient, data: DataSave["wikis"][number]): Promise<DataStore["wikis"][number]> {
    if (data.slug.startsWith("$")) throw new Error("recipe slug may not start with a dollar sign.");

    const importer = new RecipeImportWriter(prisma, false);
    if (!data.templateName) throw new Error("wiki template reference is required");
    const template = await prisma.template.findUnique({ where: { name: data.templateName } });
    if (!template) throw new Error("wiki template not found");

    const authoredDefinition: PrismaJson.Recipe_definition = {
      displayName: data.displayName,
      description: data.description,
      readonlyBags: normalizeLineList(data.readonlyBags),
      writablePrefixBags: normalizePrefixRows(data.writablePrefixBags),
      plugins: normalizeLineList(data.plugins),
    };

    await importer.checkExisting(data.id, data.slug, this.user);

    const { bags, plugins } = importer.compileRecipeSimpleV1(
      authoredDefinition,
      template.definition
    );

    const recipePermissions = normalizePermissions(data.recipePermissions);
    const roles = await getRolesMapper(prisma, recipePermissions.map((row) => row.role));

    const [[id, lastCompiledAt]] = await importer.upsert([{
      slug: data.slug,
      templateId: new IdString(template.id),
      compiledBags: bags,
      plugins: plugins,
      definition: authoredDefinition,
      permissions: recipePermissions.map(row => ({
        level: row.level,
        role_id: roles(row.role),
        role_name: row.role,
      })),
    }]);

    return this.buildResponse({
      id: new IdString(id),
      slug: data.slug,
      definition: authoredDefinition,
      templateName: template.name,
      lastCompiledAt,
      allbags: bags,
      plugins,
      recipePermissions,
    });

  }

  private buildResponse({ definition, plugins, allbags, id, slug, templateName, lastCompiledAt, recipePermissions }: {
    id: IdString;
    slug: string;
    lastCompiledAt: Date;
    definition: RecipeDefinition;
    allbags: CompiledRecipeBagInput[];
    plugins: string[];
    recipePermissions: PermissionRow<RecipePermissionLevel>[];
    templateName: string;
  }) {
    const effectivePluginSet = plugins;
    const effectiveReadonlyBags = allbags
      .filter(e => !e.isWritable)
      .map((row) => row.bagName);
    const effectiveWritableBags = allbags
      .filter((row) => row.isWritable)
      .sort((a, b) => b.prefix.length - a.prefix.length)
      .map((row) => ({ prefix: row.prefix, bagName: row.bagName }));

    return {
      ...definition,
      id,
      slug,
      templateName,
      lastCompiledAt: lastCompiledAt.toISOString(),
      recipePermissions,
      effectiveWritableBags,
      effectiveReadonlyBags,
      effectivePluginSet,
    };
  }

  async getList(prisma: PrismaTxnClient, roles: (key: IdString) => string) {

    const recipes = await prisma.recipe.findMany({
      where: this.user.isAdmin ? undefined : { permissions: { some: { role_id: { in: this.user.roles.map(e => e.role_id) } } } },
      select: {
        id: true,
        slug: true,
        definition: true,
        plugins: true,
        template_id: true,
        compiledAt: true,
        permissions: {
          select: {
            level: true,
            role_id: true,
          },
        },
        recipe_bags: {
          select: {
            bag_id: true,
            priority: true,
            is_writable: true,
            prefix: true,
          },
        },
      },
    });

    // these are connected but I figured this could result in simpler queries
    // it could also lend itself better to future changes
    const templates = await new TemplateImportWriter(prisma, false).getIdMapper();
    const bags = await new BagImportWriter(prisma, false).getIdMapper();

    return recipes.map((recipe): IRecipeRow => {
      recipe.recipe_bags.sort(e => e.priority);
      return this.buildResponse({
        allbags: recipe.recipe_bags.map(e => ({
          bagName: bags(new IdString(e.bag_id)),
          isWritable: e.is_writable,
          prefix: e.prefix,
          priority: e.priority,
        })),
        definition: recipe.definition,
        id: new IdString(recipe.id),
        slug: recipe.slug,
        lastCompiledAt: recipe.compiledAt,
        plugins: recipe.plugins,
        recipePermissions: recipe.permissions.map(e => ({
          level: e.level,
          role: roles(new IdString(e.role_id)),
        })),
        templateName: templates(new IdString(recipe.template_id)),
      });
    })
  }

}

// #region Template

export class TemplateDataAdapter extends TabDataAdapter<"templates"> {
  async saveRow(prisma: PrismaTxnClient, data: DataSave["templates"][number]): Promise<DataStore["templates"][number]> {
    const importer = new TemplateImportWriter(prisma, false);
    await importer.checkExisting(data.id, data.name, this.user);
    // roles aren't connected to data tables so they can be swapped out for SSO
    const roleIds = await getRolesMapper(prisma, data.templatePermissions.map((row) => row.role));
    let template: UpsertTemplateInput;
    const isDefault = data.name === DEFAULT_TEMPLATE;
    if (isDefault) {
      const existing = await prisma.template.findUnique({ where: { name: DEFAULT_TEMPLATE } });
      if (!existing) throw new Error("could not find the default template");
      template = {
        name: DEFAULT_TEMPLATE,
        definition: {
          ...existing.definition,
          externalPlugins: data.externalPlugins,
          externalStore: data.externalStore,
        },
        permissions: data.templatePermissions.map(e => ({ level: e.level, role_id: roleIds(e.role), })),
      }
    } else {
      template = {
        name: data.name,
        definition: {
          type: "simpleV1",
          description: data.description,
          readonlyBags: normalizeLineList(data.readonlyBags),
          writablePrefixBags: normalizePrefixRows(data.writablePrefixBags),
          plugins: normalizeLineList(data.plugins),
          externalPlugins: data.externalPlugins,
          externalStore: data.externalStore,
          requiredPluginsEnabled: data.requiredPluginsEnabled,
          customHtmlEnabled: data.customHtmlEnabled,
          htmlContent: data.htmlContent,
          injectionFunction: data.injectionFunction,
          injectionLocation: data.injectionLocation,
        },
        permissions: data.templatePermissions.map(e => ({ level: e.level, role_id: roleIds(e.role), })),
      };
    }

    const [{ id: template_id, updated }] = await importer.upsert([template]);
    if (!isDefault) {
      const recipes = await prisma.recipe.findMany({
        where: { template_id },
        include: { permissions: true }
      });

      const importerRecipe = new RecipeImportWriter(prisma, false);

      for (const recipe of recipes) {
        const compiled = importerRecipe.compileRecipeSimpleV1(
          recipe.definition,
          template.definition,
        );

        await importerRecipe.upsert([{
          slug: recipe.slug,
          templateId: new IdString(template_id),
          compiledBags: compiled.bags,
          plugins: compiled.plugins,
          definition: recipe.definition,
          permissions: recipe.permissions.map(row => ({
            level: row.level,
            role_id: new IdString(row.role_id),
          })),
        }]);
      }
    }

    const roleNames = await new RoleImportWriter(prisma, false).getIdMapper();
    return {
      ...template.definition,
      id: new IdString(template_id),
      name: data.name,
      type: "simpleV1",
      lastUpdatedAt: updated.toISOString(),
      templatePermissions: template.permissions.map(e => ({
        level: e.level,
        role: roleNames(e.role_id),
      })),
    };
  }

  async getList(prisma: PrismaTxnClient, roles: (key: IdString) => string) {
    const templates = await prisma.template.findMany({
      where: this.user.isAdmin ? undefined : { permissions: { some: { role_id: { in: this.user.roles.map(e => e.role_id) } } } },
      select: {
        id: true,
        name: true,
        definition: true,
        type: true,
        updated: true,
        recipes: {
          select: {
            id: true,
            slug: true,
          },
        },
        permissions: {
          select: {
            level: true,
            role_id: true,
          }
        }
      },
      orderBy: { id: "asc" },
    });

    return templates.map((template): ITemplateRow => {
      return {
        ...template.definition,
        id: new IdString(template.id),
        name: template.name,
        type: "simpleV1",
        lastUpdatedAt: template.updated.toISOString(),
        templatePermissions: template.permissions.map(e => ({
          level: e.level,
          role: roles(new IdString(e.role_id)),
        })),
      };
    });
  }
}

// #region Bag

export class BagDataAdapter extends TabDataAdapter<"bags"> {

  async saveRow(prisma: PrismaTxnClient, data: DataSave["bags"][number]): Promise<DataStore["bags"][number]> {
    const importer = new BagImportWriter(prisma, false);
    await importer.checkExisting(data.id, data.name, this.user);
    const permissions = normalizePermissions(data.bagPermissions);
    const roles = await getRolesMapper(prisma, permissions.map(e => e.role));

    const [bag] = await importer.upsert([{
      name: data.name,
      description: data.description,
      permissions: data.bagPermissions.map(e => ({
        role_id: roles(e.role),
        level: e.level as BagPermissionLevel
      }))
    }]);

    return {
      id: new IdString(bag.id),
      name: data.name,
      description: data.description,
      bagPermissions: data.bagPermissions,
    }
  }
  async getList(prisma: PrismaTxnClient, roles: (key: IdString) => string): Promise<DataStore["bags"]> {

    const bags = await prisma.bag.findMany({
      where: this.user.isAdmin ? undefined : { permissions: { some: { role_id: { in: this.user.roles.map(e => e.role_id) } } } },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          select: {
            level: true,
            role_id: true,
          },
        },
      },
    });

    return bags.map((bag) => ({
      id: new IdString(bag.id),
      name: bag.name,
      description: bag.description,
      bagPermissions: bag.permissions.map((row) => ({
        role: roles(new IdString(row.role_id)),
        level: row.level,
      })),
    }));
  }
}

async function getRolesMapper(prisma: PrismaTxnClient, roles: readonly string[]) {
  return await new RoleImportWriter(prisma, false).getNameMapper(roles);
}

// #region Role

export class RoleDataAdapter extends TabDataAdapter<"roles"> {
  async saveRow(prisma: PrismaTxnClient, data: DataSave["roles"][number]): Promise<DataStore["roles"][number]> {

    const importer = new RoleImportWriter(prisma, false);
    await importer.checkExisting(data.id, data.name, this.user);

    const [role] = await importer.upsert([{
      description: data.description,
      name: data.name,
    }]);

    return {
      id: new IdString(role.role_id),
      name: role.role_name,
      description: role.description ?? "",
    }
  }
  // roles aren't connected to data tables so they can be swapped out for SSO
  async getList(prisma: PrismaTxnClient): Promise<DataStore["roles"]> {
    const roles = await prisma.roles.findMany({
      select: {
        role_id: true,
        role_name: true,
        description: true,
      },
    });
    return roles.map((role) => ({
      id: new IdString(role.role_id),
      name: role.role_name,
      description: role.description ?? "",
    }));

  }
}

// #region User
export class UserDataAdapter extends TabDataAdapter<"users"> {
  async saveRow(prisma: PrismaTxnClient, data: DataSave["users"][number]): Promise<DataStore["users"][number]> {

    const importer = new UserImportWriter(prisma, false);
    await importer.checkExisting(data.id, data.username, this.user);

    const normalizedUserRoles = normalizeLineList(data.userRoles).map((role) => role);
    const rolesMapper = await getRolesMapper(prisma, normalizedUserRoles);
    const roleLinks = normalizedUserRoles.map(e => rolesMapper(e));

    const [user] = await importer.upsert([{
      username: data.username,
      email: data.email,
      roleIds: roleLinks,
      resetCode: data.resetCode || null,
    }])

    return {
      id: new IdString(user.user_id),
      username: user.username,
      email: user.email,
      resetCode: user.resetCode ?? "",
      userRoles: normalizedUserRoles
    }
  }
  // roles aren't connected to data tables so they can be swapped out for SSO
  async getList(prisma: PrismaTxnClient, roles: (key: IdString) => string): Promise<DataStore["users"]> {
    if (!this.user.isAdmin) return [];
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        resetCode: true,
        roles: {
          select: {
            role_name: true,
          },
          orderBy: { role_name: "asc" },
        },
      },
      orderBy: { username: "asc" },
    })
    return users.map((user) => ({
      id: new IdString(user.user_id),
      username: user.username,
      email: user.email,
      userRoles: user.roles.map((role) => role.role_name),
      resetCode: user.resetCode || "",
    }));
  }
}

// #region savePlugin
async function savePluginRow(_prisma: PrismaTxnClient, _data: DataSave["plugins"][number]): Promise<string> {
  throw new Error("Plugin admin save is not implemented in the database-backed admin path.");
}


export const AdminSave = zodRoute({
  method: ["PUT"],
  path: "/admin/:op/:tab",
  bodyFormat: "json",
  securityChecks: { requestedWithHeader: true },
  zodPathParams: z => ({
    op: z.enum(["save"]),
    tab: z.enum(["wikis", "templates", "bags", "plugins", "users", "roles"] satisfies TabId[])
  }),
  zodRequestBody: z => z.any(),
  inner: async (state) => {
    state.assertReferer(["/"]);
    state.asserted = state.user.isLoggedIn;
    state.data = JSON.parse(JSON.stringify(state.data), (key: any, val: any) => {
      if (typeof val === "string" && val.startsWith(IdString.prefix))
        return new IdString(val.slice(IdString.prefix.length));
      // if (typeof val === "string" && val.startsWith("KeyString____"))
      //   return val.slice("KeyString____".length);
      return val;
    });

    checkData(state, () => buildTabZodObject(state.pathParams.tab, "DataSave"), new Error());

    const res = await state.$transaction(async prisma => {
      const { pathParams: { op, tab }, data } = state;
      if (op !== "save") throw new Error(`Unsupported admin operation: ${op}`);
      switch (tab) {
        case "wikis": {
          return await new RecipeDataAdapter(state.user).saveRow(prisma, data as IRecipeRow);
        }
        case "templates": {
          return await new TemplateDataAdapter(state.user).saveRow(prisma, data as ITemplateRow);
        }
        case "bags": {
          return await new BagDataAdapter(state.user).saveRow(prisma, data as IBagRow);
        }
        case "roles": {
          return await new RoleDataAdapter(state.user).saveRow(prisma, data as IRoleRow);
        }
        case "users": {
          return await new UserDataAdapter(state.user).saveRow(prisma, data as IUserRow);
        }
        case "plugins": return await savePluginRow(prisma, data as IPluginRow);
        default: {
          const _exhaustive: never = tab;
          throw new Error(`Unsupported admin tab: ${_exhaustive}`);
        }
      }
    });

    const { success, data: res2, error } = buildTabZodObject(state.pathParams.tab, "DataStore").safeParse(res);
    if (!success) console.log("Response validation: ", error);
    return res2;
  }
});

export const AdminLoad = zodRoute({
  method: ["GET"],
  path: "/admin/load",
  bodyFormat: "ignore",
  securityChecks: { requestedWithHeader: true },
  zodPathParams: z => ({}),
  inner: async (state) => {
    state.assertReferer(["/"]);
    state.asserted = state.user.isLoggedIn;
    const res = await state.$transaction(async prisma => {
      const roles = await new RoleImportWriter(prisma, false).getIdMapper();
      return {
        wikis: await new RecipeDataAdapter(state.user).getList(prisma, roles),
        templates: await new TemplateDataAdapter(state.user).getList(prisma, roles),
        bags: await new BagDataAdapter(state.user).getList(prisma, roles),
        plugins: state.pluginCache.pluginsList.map(e => ({
          id: new IdString(e.title),
          name: e.title,
          description: `${e.name}: ${e.description}`,
          pluginPath: e.path,
        } satisfies IPluginRow)),
        roles: await new RoleDataAdapter(state.user).getList(prisma),
        users: await new UserDataAdapter(state.user).getList(prisma, roles),
      };
    });
    const { success, data, error } = zod.object({
      wikis: buildTabZodObject("wikis", "DataStore").array(),
      templates: buildTabZodObject("templates", "DataStore").array(),
      bags: buildTabZodObject("bags", "DataStore").array(),
      plugins: buildTabZodObject("plugins", "DataStore").array(),
      roles: buildTabZodObject("roles", "DataStore").array(),
      users: buildTabZodObject("users", "DataStore").array(),
    }).safeParse(res);
    if (!success) throw error;
    return data;
  }
});
