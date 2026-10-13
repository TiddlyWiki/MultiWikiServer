import { IdString } from "@/server";


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
