import { BagPermissionLevel, RecipePermissionLevel, TemplatePermissionLevel } from "@tiddlywiki/mws-prisma";
import { RecipeDefinition, TemplateDefinition } from "./tab-routes";
import { IdString, KeyString, PermissionRow } from "@mws/admin-vanilla/src/definition/tabs";

export interface UpsertRoleInput {
  name: KeyString;
  description: string;
}

export interface UpsertUserInput {
  username: KeyString;
  email: string;
  /** these are the role ids, not the role names */
  roleIds: IdString[];
}

export interface ImportBagPermissionInput {
  role_id: IdString;
  level: BagPermissionLevel;
}

export interface UpsertBagInput {
  name: KeyString;
  description: string;
  permissions: PermissionInput<BagPermissionLevel>[];
}

export interface PermissionInput<Level> {
  role_id: IdString;
  level: Level;
}

export interface CompiledRecipeBagInput {
  // bagId: string;
  bagName: KeyString;
  priority: number;
  isWritable: boolean;
  prefix: string;
}

export interface UpsertRecipeInput {
  slug: KeyString;
  /** this is the primary key of the template, not the name */
  templateId: IdString;
  definition: RecipeDefinition;
  plugins: string[];
  compiledBags: CompiledRecipeBagInput[];
  permissions: PermissionInput<RecipePermissionLevel>[];
}


export interface UpsertTemplateInput {
  name: KeyString;
  definition: TemplateDefinition;
  permissions: PermissionInput<TemplatePermissionLevel>[];
}