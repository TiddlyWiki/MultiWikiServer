import { BagPermissionLevel, RecipePermissionLevel, TemplatePermissionLevel } from "@tiddlywiki/mws-prisma";
import { RecipeDefinition, TemplateDefinition } from "./TabDataAdapter";
import { DataStore, IdString, PermissionRow, TemplateTypes, WritablePrefixRow } from "@mws/admin-vanilla/src/definition/tabs";

export interface UpsertRoleInput {
  name: string;
  description: string;
}

export interface UpsertUserInput {
  username: string;
  email: string;
  /** these are the role ids, not the role names */
  roleIds: IdString[];
  resetCode: string | null;
}

export interface ImportBagPermissionInput {
  role_id: IdString;
  level: BagPermissionLevel;
}

export interface UpsertBagInput {
  name: string;
  description: string;
  permissions: PermissionInput<BagPermissionLevel>[];
}

export interface PermissionInput<Level> {
  role_id: IdString;
  level: Level;
}

export interface CompiledRecipeBagInput {
  // bagId: string;
  bagName: string;
  priority: number;
  isWritable: boolean;
  prefix: string;
}

export interface UpsertRecipeInput {
  slug: string;
  /** this is the primary key of the template, not the name */
  templateId: IdString;
  definition: RecipeDefinition;
  plugins: string[];
  compiledBags: CompiledRecipeBagInput[];
  permissions: PermissionInput<RecipePermissionLevel>[];
}


export interface UpsertTemplateInput {
  name: string;
  definition: TemplateDefinition;
  permissions: PermissionInput<TemplatePermissionLevel>[];
}



type IWikiRow = DataStore["wikis"][number];
type ITemplateRow = DataStore["templates"][number];
type IBagRow = DataStore["bags"][number];
type IPluginRow = DataStore["plugins"][number];
type IUserRow = DataStore["users"][number];
type IRoleRow = DataStore["roles"][number];



abstract class WikiRow implements IWikiRow {
  abstract id: IdString;
  abstract slug: string;
  abstract displayName: string;
  abstract description: string;
  abstract templateName: string | null;
  abstract lastCompiledAt: string;
  abstract writablePrefixBags: readonly WritablePrefixRow[];
  abstract readonlyBags: readonly string[];
  abstract plugins: readonly string[];
  abstract effectiveWritableBags: readonly WritablePrefixRow[];
  abstract effectiveReadonlyBags: readonly string[];
  abstract effectivePluginSet: readonly string[];
  abstract recipePermissions: readonly PermissionRow<RecipePermissionLevel>[];
}


abstract class TemplateRow implements ITemplateRow {
  abstract id: IdString;
  abstract type: TemplateTypes;
  abstract name: string;
  abstract description: string;
  abstract plugins: readonly string[];
  abstract readonlyBags: readonly string[];
  abstract writablePrefixBags: readonly WritablePrefixRow[];
  abstract lastUpdatedAt: string;
  abstract requiredPluginsEnabled: boolean;
  abstract templatePermissions: readonly PermissionRow<RecipePermissionLevel>[];
  abstract customHtmlEnabled: boolean;
  abstract htmlContent: string;
  abstract injectionFunction: string;
  abstract injectionLocation: string;
  abstract dependentWikis: string;

}

abstract class BagRow implements IBagRow {
  abstract id: IdString;
  abstract name: string;
  abstract description: string;
  abstract bagPermissions: readonly PermissionRow<BagPermissionLevel>[];
}

abstract class PluginRow implements IPluginRow {
  abstract id: IdString;
  abstract name: string;
  abstract description: string;
  abstract pluginPath: string;
}

abstract class RoleRow implements IRoleRow {
  abstract id: IdString;
  abstract description: string;
  abstract name: string;

}

abstract class UserRow implements IUserRow {
  abstract id: IdString;
  abstract username: string;
  abstract email: string;
  abstract userRoles: readonly string[];
  abstract password: string;
  abstract resetCode: string;
}
