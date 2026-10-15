import { IdString, zod } from "@/server";


export type BagPermissionLevel = | "A_read" | "B_write" | "C_admin";


export type PageId = "wikis" | "templates" | "bags" | "roles" | "users";

export interface WritablePrefixRow {
  prefix: string;
  bagName: string;
}

export interface BagPermissionRow {
  role: string;
  level: BagPermissionLevel;
}
export interface PermissionRow<Level extends string = string> {
  role: string;
  level: Level;
}
export type TemplateTypes = "simpleV1";

export interface IWikiLoad extends IWikiSave {
  lastCompiledAt: string;
  effectiveWritableBags: WritablePrefixRow[];
  effectiveReadonlyBags: string[];
  effectivePluginSet: string[];
}

export interface ITemplateLoad extends ITemplateSave {
  lastUpdatedAt: string;
}

export type IBagLoad = IBagSave;
export type IUserLoad = IUserSave;
export type IRoleLoad = IRoleSave;

export interface ExtraServerStuff {
  availablePlugins: { name: string; description: string; }[];
}
export interface DataStore extends ExtraServerStuff {
  wikis: IWikiLoad[];
  templates: ITemplateLoad[];
  bags: IBagLoad[];
  users: IUserLoad[];
  roles: IRoleLoad[];
}

export interface IWikiSave extends RecipeDefinition {
  id: IdString;
  slug: string;
  templateName: string;
  recipeUsers: string[];
  recipeAdmins: string[];
}
export interface ITemplateSave extends TemplateDefinition {
  id: IdString;
  name: string;
  templateUsers: string[];
  templateAdmins: string[];
}

export interface IBagSave {
  id: IdString;
  description: string;
  name: string;
  bagPermissions: BagPermissionRow[];
}

export interface IUserSave {
  id: IdString;
  username: string;
  email: string;
  userRoles: string[];
  resetCode: string;
}

export interface IRoleSave {
  id: IdString;
  description: string;
  name: string;
}

export interface DataSave {
  wikis: IWikiSave[],
  templates: ITemplateSave[],
  bags: IBagSave[],
  users: IUserSave[],
  roles: IRoleSave[],
}


interface TemplateSharedDefinition {
  description: string;
  readonlyBags: string[];
  plugins: string[];
  writablePrefixBags: WritablePrefixRow[];
}

export interface TemplateDefinition extends TemplateSharedDefinition {
  type: TemplateTypes;
  requiredPluginsEnabled: boolean;
  externalStore: boolean;
  externalPlugins: boolean;
  twVersion: string | null;
  customHtmlEnabled: boolean;
  htmlContent: string;
  injectionFunction: string;
  injectionLocation: string;
};

export interface RecipeDefinition extends TemplateSharedDefinition {
  displayName: string;
}


import * as TabDataZod from "./TabDataZod";

const checkUniquePrefixes = (
  data: { writablePrefixBags: WritablePrefixRow[] },
  context: zod.RefinementCtx,
) => {
  const prefixes = new Set<string>();
  data.writablePrefixBags.forEach((row, index) => {
    if (!row.bagName.trim()) return;
    if (prefixes.has(row.prefix)) {
      context.addIssue({
        code: "custom",
        message: "Writable prefixes must be unique, including the default prefix.",
        path: ["writablePrefixBags", index, "prefix"],
      });
    }
    prefixes.add(row.prefix);
  });
};

export const zodWikiDataSaveSchema = TabDataZod.iWikiSaveSchema
  .superRefine(checkUniquePrefixes)
  .refine(data => data.templateName.trim().length > 0, {
    message: "Template name is required.",
    path: ["templateName"],
  })
  .refine(data => data.slug.trim().length > 0, {
    message: "Slug is required.",
    path: ["slug"],
  })
  .refine(data => !data.slug.startsWith("/"), {
    message: "Slug must not start with a forward slash.",
    path: ["slug"],
  })
  .refine(data => data.displayName.trim().length > 0, {
    message: "Display name is required.",
    path: ["displayName"],
  });
export const zodTemplateDataSaveSchema = TabDataZod.iTemplateSaveSchema
  .superRefine(checkUniquePrefixes)
  .refine(data => data.name.trim().length > 0, {
    message: "Template name is required.",
    path: ["templateName"],
  })
  .superRefine((
    data,
    context: zod.RefinementCtx,
  ) => {
    if (!data.customHtmlEnabled) return;
    const trimmedContent = data.htmlContent.trim();
    if (!trimmedContent.length) {
      context.addIssue({
        code: "custom",
        message: "HTML Content is required.",
        path: ["htmlContent"],
      });
    }
    if (!data.injectionFunction.trim().length) {
      context.addIssue({
        code: "custom",
        message: "Injection function is required.",
        path: ["injectionFunction"],
      });
    }
    const trimmedLocation = data.injectionLocation.trim()
    if (!trimmedLocation.length) {
      context.addIssue({
        code: "custom",
        message: "Injection marker is required.",
        path: ["injectionLocation"],
      });
    }
    if (trimmedLocation && trimmedContent && trimmedContent.indexOf(trimmedLocation) === -1) {
      context.addIssue({
        code: "custom",
        message: "HTML content does not contain injection marker.",
        path: ["htmlContent"],
      });
      context.addIssue({
        code: "custom",
        message: "HTML content does not contain injection marker.",
        path: ["injectionLocation"],
      });
    }
  });
export const zodBagDataSaveSchema = TabDataZod.iBagSaveSchema
  .refine(data => data.name.trim().length > 0, {
    message: "Bag name is required.",
    path: ["name"],
  });
export const zodRoleDataSaveSchema = TabDataZod.iRoleSaveSchema
  .refine(data => data.name.trim().length > 0, {
    message: "Role name is required.",
    path: ["name"],
  });
export const zodUserDataSaveSchema = TabDataZod.iUserSaveSchema
  .refine(data => data.username.trim().length > 0, {
    message: "Username is required.",
    path: ["username"],
  });
