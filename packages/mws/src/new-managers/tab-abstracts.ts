import { DataStore, WritablePrefixRow, PermissionRow, TemplateTypes } from "@mws/admin-vanilla/src/definition/tabs";
import { BagPermissionLevel, RecipePermissionLevel } from "@tiddlywiki/mws-prisma";


type IWikiRow = DataStore["wikis"][number];
type ITemplateRow = DataStore["templates"][number];
type IBagRow = DataStore["bags"][number];
type IPluginRow = DataStore["plugins"][number];
type IUserRow = DataStore["users"][number];
type IRoleRow = DataStore["roles"][number];



abstract class WikiRow implements IWikiRow {
  abstract id: string;
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
  abstract id: string;
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
