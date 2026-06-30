import { BagPermissionLevel } from "@tiddlywiki/mws-prisma";
import { RecipeDefinition, TemplateDefinition } from "./wiki-actions";

export interface UpsertRoleInput {
  name: string;
  description: string;
}

export interface UpsertUserInput {
  username: string;
  email: string;
  password: string;
  /** these are the role ids, not the role names */
  roleIds: string[];
}

export interface ImportBagPermissionInput {
  role_id: string;
  level: BagPermissionLevel;
}

export interface UpsertBagInput {
  name: string;
  description: string;
  permissions: ImportBagPermissionInput[];
}


export interface RecipePermissionInput {
  role_id: string;
  level: "A_read" | "B_write";
}

export interface CompiledRecipeBagInput {
  bagId: string;
  priority: number;
  isWritable: boolean;
  prefix: string;
}

export interface UpsertRecipeInput {
  slug: string;
  /** this is the primary key of the template, not the name */
  templateId: string;
  definition: RecipeDefinition;
  plugins: string[];
  permissions: RecipePermissionInput[];
  compiledBags: CompiledRecipeBagInput[];
}


export interface UpsertTemplateInput extends TemplateDefinition {
  name: string;
}