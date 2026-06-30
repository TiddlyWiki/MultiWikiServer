import { RecipeDefinition, TemplateDefinition } from "./wiki-actions";

export type ImportPermissionLevel = "A_read" | "B_write" | "C_admin";

export interface ImportRoleInput {
  role_name: string;
  description: string;
}

export interface ImportUserInput {
  username: string;
  email: string;
  password: string;
  roleIds: string[];
}

export interface ImportBagPermissionInput {
  roleId: string;
  level: ImportPermissionLevel;
}

export interface ImportBagInput {
  name: string;
  description: string;
  permissions: ImportBagPermissionInput[];
}


export interface ImportRecipePermissionInput {
  roleId: string;
  level: "A_read" | "B_write";
}

export interface ImportCompiledRecipeBagInput {
  bagId: string;
  priority: number;
  isWritable: boolean;
  prefix: string;
}

export interface ImportRecipeInput {
  slug: string;
  templateId: string;
  definition: RecipeDefinition;
  plugins: string[];
  permissions: ImportRecipePermissionInput[];
  compiledBags: ImportCompiledRecipeBagInput[];
}


export interface ImportTemplateInput {
  type: "simpleV1";
  definition: TemplateDefinition;
}