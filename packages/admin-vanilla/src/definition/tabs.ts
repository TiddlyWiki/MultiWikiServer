import {
  BagPermissionLevel,
  RecipePermissionLevel,
  TemplatePermissionLevel
} from "@tiddlywiki/mws-prisma";
import { zod as z } from "@tiddlywiki/server/src/Z2";


const halfWidth = "half" as const;
const fullWidth = "full" as const;
const stackLayout = "stack" as const;

export type TabId = "wikis" | "templates" | "bags" | "plugins" | "roles" | "users";


export interface FieldGroupDefinition {
  title?: string;
  description?: string;
  keys: string[];
  headerFieldKey?: string;
  disabledWhenHeaderOff?: boolean;
  footerDescriptionFromHeader?: boolean;
  width?: "half" | "full";
  layout?: "grid" | "stack";
}

export type FieldSection = "authored" | "runtime" | "operations";


export type FieldType =
  | "template-type"
  | "string"
  | "text"
  | "enter-password"
  | "confirm-password"
  | "search"
  // | "json-editor"
  | "structured-preview"
  | "table"
  | "permission-table"
  | "validation-report"
  | "resolver-preview"
  | "search-multiselect"
  | "prefix-table"
  // | "reference"
  // | "reference-list"
  | "parameter-list"
  | "relationship-table"
  // | "action"
  | "summary-list"
  | "number"
  | "activity-feed"
  | "version"
  | "select"
  | "metadata-table";

export type Mode = "create" | "create edit" | "edit" | "edit temp" | "create temp" | "create edit temp" | "server" | "";


export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  mode: Mode;
  section?: FieldSection;
  description?: string;
  architecture?: string;
}

export interface ColumnDefinition {
  key: string;
  label: string;
}

export interface TabDefinition {
  id: TabId;
  label: string;
  createLabel: string;
  eyebrow: string;
  description: string;
  columns: ColumnDefinition[];
  sidebarDisplay: string[];
  fields: FieldDefinition[];
  fieldGroups?: Partial<Record<FieldSection, FieldGroupDefinition[]>>;
}

const tabs = {
  wikis: {
    id: "wikis",
    label: "Wikis",
    createLabel: "Create wiki",
    eyebrow: "Your thoughts",
    description: "Final wiki instances built from a template plus per-wiki customizations.",
    columns: [
      { key: "slug", label: "Slug" },
      { key: "displayName", label: "Display name" },
      { key: "templateName", label: "Template" },
      { key: "defaultWritableBag", label: "Default bag" },
      { key: "readonlyBagCount", label: "Readonly bags" },
      { key: "prefixRuleCount", label: "Prefix rules" },
      { key: "pluginCount", label: "Plugins" },
      { key: "lastCompiledAt", label: "Compiled" },
      { key: "statusFlags", label: "Status" },
      // { key: "compileValidation", label: "Validation" }
    ],
    fields: [
      { key: "slug", label: "Slug", type: "string", section: "authored", mode: "create edit" },
      { key: "displayName", label: "Display name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      { key: "templateName", label: "Template", type: "search", section: "authored", mode: "create" },
      { key: "readonlyBags", label: "Readonly bags", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "plugins", label: "Plugins", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "lastCompiledAt", label: "Compiled", type: "string", section: "runtime", mode: "server" },
      {
        key: "writablePrefixBags",
        label: "Writable prefix bags",
        type: "prefix-table",
        section: "authored",
        mode: "create edit",
        architecture: "Edits the wiki-level prefix-to-bag routing table that drives write target selection. Longest prefix wins, and the empty string row is the fallback write target.",
      },
      {
        key: "effectiveWritableBags",
        label: "Effective writable bags",
        type: "prefix-table",
        section: "runtime",
        mode: "server",
        architecture: "Read-only projection of compiled recipe-bag rows in the same slice of the pie order the resolver uses for writes.",
      },
      {
        key: "effectiveReadonlyBags",
        label: "Effective readonly bags",
        type: "table",
        section: "runtime",
        mode: "server",
        architecture: "Read-only projection of compiled recipe-bag rows in the same top-to-bottom order the resolver uses for reads.",
      },
      {
        key: "effectivePluginSet",
        label: "Effective plugin set",
        type: "table",
        section: "runtime",
        mode: "server",
        architecture: "Read-only projection of the resolved plugin rows that will actually be used by the wiki page and preload path.",
      },
      {
        key: "recipePermissions",
        label: "Recipe permissions",
        type: "permission-table",
        section: "authored",
        mode: "create edit",
        architecture: "Edits permission rows on the wiki definition itself. These govern access to the wiki surface separately from bag-level read and write rights.",
      },
      {
        key: "compileValidation",
        label: "Compile validation",
        type: "validation-report",
        section: "runtime",
        mode: "",
        architecture: "Read-only validation and compilation result across template, parameters, bag references, plugin references, and routing invariants.",
      },
      {
        key: "titleResolutionPreview",
        label: "Title routing test",
        type: "resolver-preview",
        section: "operations",
        mode: "edit temp",
        architecture: "Diagnostic resolver output for a title entered by the user: computed prefix match and authored write target selection only. Read answers and final write permission would require live server state.",
      },
    ],
    fieldGroups: {
      authored: [
        { title: "Wiki identity", description: "Name the wiki, describe it, and choose the template that provides its base routing model.", keys: ["slug", "displayName", "description", "templateName"], width: fullWidth, layout: stackLayout },
        { title: "Writable routing", description: "Define the write targets for title prefixes, including the default fallback bag. The resolver matches prefixes from longest to shortest, so most specific prefix gets the tiddler.", keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", description: "Add wiki-specific readonly bags on top of anything inherited from the template.", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", description: "Add wiki-specific plugins on top of the template plugin set.", keys: ["plugins"], width: halfWidth },
        { title: "Access", description: "Control who can access the wiki surface itself. Bag access is handled separately on the participating bags.", keys: ["recipePermissions"], width: fullWidth },
      ],
      runtime: [
        // { title: "Computed Write Prefix", description: "", keys: ["effectiveWritableBags"], width: fullWidth },
        // { title: "Computed Bag Order", description: "", keys: ["effectiveReadonlyBags"], width: halfWidth },
        // { title: "Computed Plugin Set", description: "", keys: ["effectivePluginSet"], width: halfWidth },
        // { title: "Compilation status", description: "Validation and compilation outcome for the current authored state.", keys: ["compileValidation"], width: fullWidth },
      ],
      operations: [
        {
          title: "Title routing test",
          description: "Test a title against the wiki's current prefix rules to see which bag would receive writes.",
          keys: ["titleResolutionPreview"],
          width: fullWidth,
        },
      ],
    },
    sidebarDisplay: [
      "displayName",
      "slug",
      "templateName",
      "effectiveWritableBags",
      "effectiveReadonlyBags",
      "effectivePluginSet",
    ]
  },
  templates: {
    id: "templates",
    label: "Templates",
    createLabel: "Create template",
    eyebrow: "Wiki Blueprints",
    description: "Reusable recipe definitions. Changes made to a template apply to every wiki using it.",
    columns: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "readonlyBagsSummary", label: "Readonly bags" },
      // { key: "writablePrefixSummary", label: "Writable prefixes" },
      { key: "dependentWikiCount", label: "Dependent wikis" },
      { key: "lastUpdatedAt", label: "Updated" },
      { key: "validationStatus", label: "Validation" },
    ],
    fields: [
      { key: "type", label: "Type", type: "template-type", section: "authored", mode: "create" },
      { key: "name", label: "Name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      { key: "lastUpdatedAt", label: "Updated", type: "string", section: "runtime", mode: "server" },
      {
        key: "writablePrefixBags",
        label: "Writable prefix bags",
        type: "prefix-table",
        section: "authored",
        mode: "create edit",
        architecture: "Edits the template-level prefix-to-bag routing table that wikis inherit first. Longest prefix wins, and the empty string row is the fallback write target when no wiki-level override matches.",
      },
      { key: "readonlyBags", label: "Readonly bags", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "plugins", label: "Plugins", type: "search-multiselect", section: "authored", mode: "create edit" },
      {
        key: "requiredPluginsEnabled",
        label: "Required plugins",
        type: "select",
        section: "authored",
        mode: "create edit",
        description: "Core plugins enable wiki sync functionality. Disable them for vanilla wikis or custom sync implementations.",
      },
      {
        key: "templatePermissions",
        label: "Template permissions",
        type: "permission-table",
        section: "authored",
        mode: "create edit",
        architecture: "Grants permission to view or change this template. Wikis using this template grant their roles an implicit view permission for the selected template.",
      },
      {
        key: "customHtmlEnabled",
        label: "Custom HTML shell",
        type: "select",
        section: "authored",
        mode: "create edit",
        description: "Enable custom HTML shell settings when this template should serve authored HTML instead of the default page shell.",
      },
      {
        key: "htmlContent",
        label: "HTML content",
        type: "text",
        section: "authored",
        mode: "create edit",
        description: "Store the raw HTML that will be served for this template. All HTTP endpoints still work, but any boot, library, or raw markup tiddlers must be included here manually.",
      },
      {
        key: "injectionArray",
        label: "Injection array",
        type: "string",
        section: "authored",
        mode: "create edit",
        description: "Name of the JavaScript array to push tiddlers onto, for example $tw.preloadTiddlers.",
      },
      {
        key: "injectionLocation",
        label: "Injection marker",
        type: "string",
        section: "authored",
        mode: "create edit",
        description: "Inject the tiddlers before this string in the HTML file. It must not be inside a script tag, for example <!-- INJECT STORE TIDDLERS HERE -->.",
      },
      {
        key: "defaultWritableBag",
        label: "Default writable bag",
        type: "string",
        section: "runtime",
        mode: "",
        architecture: "Read-only convenience projection of the writablePrefixBags row whose prefix is the empty string.",
      },
      {
        key: "dependentWikis",
        label: "Dependent wikis",
        type: "relationship-table",
        section: "runtime",
        mode: "",
        architecture: "Read-only relationship view listing all wikis that reference this template and will be revalidated or recompiled if it changes.",
      },
      {
        key: "validationReport",
        label: "Validation result",
        type: "validation-report",
        section: "runtime",
        mode: "",
        architecture: "Read-only summary of whether the definition can compile cleanly against current bag and plugin references.",
      },
    ],
    fieldGroups: {
      authored: [
        { title: "Template basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
        { title: "Writable routing", description: "Define the write targets for title prefixes, including the default fallback bag. The resolver matches prefixes from longest to shortest, so most specific prefix gets the tiddler.", keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", keys: ["plugins", "requiredPluginsEnabled"], width: halfWidth, layout: stackLayout },
        { title: "Permissions", keys: ["templatePermissions"], width: fullWidth, layout: stackLayout },
        { title: "Custom HTML shell", keys: ["htmlContent", "injectionArray", "injectionLocation"], headerFieldKey: "customHtmlEnabled", disabledWhenHeaderOff: true, width: fullWidth, layout: stackLayout },
      ],
      runtime: [
        // { keys: ["defaultWritableBag"], width: halfWidth },
        // { keys: ["dependentWikis"], width: halfWidth },
        // { keys: ["validationReport"], width: halfWidth },
      ],
    },
    sidebarDisplay: [
      "name",
      "description",
      "dependentWikiCount",
    ]
  },
  bags: {
    id: "bags",
    label: "Bags",
    createLabel: "Create bag",
    eyebrow: "Tiddler Storage",
    description: "Concrete tiddler storage with role-based access control.",
    columns: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "usedByCount", label: "Used by" },
      { key: "readonlyUsageCount", label: "Readonly" },
      { key: "writableUsageCount", label: "Writable" },
      { key: "defaultUsageCount", label: "Default" },
      { key: "permissionSummary", label: "Permissions" },
      // { key: "tiddlerCount", label: "Tiddlers" },
      // { key: "lastActivityAt", label: "Last activity" },
    ],
    fields: [
      { key: "name", label: "Name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      {
        key: "permissions",
        label: "Permissions",
        type: "permission-table",
        section: "authored",
        mode: "create edit",
        architecture: "Edits bag permission rows. These rows are consulted directly by the resolver when deciding who can read from or write to the storage container.",
      },
      {
        key: "referencedByTemplates",
        label: "Referenced by templates",
        type: "relationship-table",
        section: "runtime",
        mode: "",
        architecture: "Read-only relationship view derived from authored template definition JSON that mentions this bag in readonly or writable routing positions.",
      },
      {
        key: "referencedByWikis",
        label: "Referenced by wikis",
        type: "relationship-table",
        section: "runtime",
        mode: "",
        architecture: "Read-only relationship view derived from compiled recipe-bag rows, reflecting the effective runtime routing topology.",
      },
      {
        key: "routingRoles",
        label: "Routing roles",
        type: "summary-list",
        section: "runtime",
        mode: "",
        architecture: "Derived routing summary classifying how this bag participates across compiled wikis, such as readonly layer, writable prefix target, or default fallback.",
      },
      // { key: "tiddlerCount", label: "Tiddler count", type: "number", section: "runtime", mode: "", },
      // {
      //   key: "recentActivity",
      //   label: "Recent activity",
      //   type: "activity-feed",
      //   section: "runtime",
      //   mode: "",
      //   architecture: "Read-only operational summary built from recent tiddler event rows for this bag.",
      // },
    ],
    fieldGroups: {
      authored: [
        { title: "Bag basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
        { keys: ["permissions"], width: fullWidth },
      ],
      runtime: [
        { keys: ["referencedByTemplates"], width: halfWidth },
        { keys: ["referencedByWikis"], width: halfWidth },
        // { keys: ["routingRoles"], width: halfWidth },
        // { keys: ["tiddlerCount"], width: halfWidth },
        // { keys: ["recentActivity"], width: fullWidth },
      ],
    },
    sidebarDisplay: [
      "name",
      "description",
      "referencedByTemplates",
      "referencedByWikis",
    ]
  },
  plugins: {
    id: "plugins",
    label: "Plugins",
    createLabel: "Create plugin",
    eyebrow: "Managed Assets",
    description: "Separately versioned plugins compiled into each wiki’s resolved plugin set. Still work in progress.",
    columns: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "pluginPath", label: "Plugin Path" },
      { key: "usageCount", label: "Usage" },
    ],
    fields: [
      { key: "name", label: "Name", type: "string", section: "authored", mode: "server" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "server" },
      { key: "pluginPath", label: "Path", type: "string", section: "authored", mode: "server" },
      { key: "usageCount", label: "Wiki Count", type: "number", section: "runtime", mode: "" },
      { key: "usedByWikis", label: "Active Wikis", type: "table", section: "runtime", mode: "" },
    ],
    fieldGroups: {
      runtime: [
        { title: "Used in", description: "List of wikis this plugin is used in. Only includes templates that are in use.", keys: ["usedByWikis"], width: fullWidth, layout: "grid" },
      ],
    },
    sidebarDisplay: [
      "name",
      "description",
      "usageCount",
      "pluginPath",
    ],
  },
  roles: {
    id: "roles",
    label: "Roles",
    createLabel: "Create role",
    eyebrow: "Access profiles",
    description: "Named access profiles that can be assigned to user accounts.",
    columns: [
      { key: "name", label: "Role name" },
      { key: "description", label: "Role description" },
    ],
    fields: [
      { key: "name", label: "Role name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Role description", type: "text", section: "authored", mode: "create edit" },
    ],
    fieldGroups: {
      authored: [
        { title: "Role basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
      ],
    },
    sidebarDisplay: ["name", "description"],
  },
  users: {
    id: "users",
    label: "Users",
    createLabel: "Create user",
    eyebrow: "Account logins",
    description: "User accounts with assigned roles.",
    columns: [
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
    ],
    fields: [
      { key: "username", label: "Username", type: "string", section: "authored", mode: "create edit" },
      { key: "email", label: "Email", type: "string", section: "authored", mode: "create edit" },
      { key: "userRoles", label: "Roles", type: "search-multiselect", section: "authored", mode: "create edit" },
      // { key: "password", label: "Password", type: "string", section: "authored", mode: "create edit" },
      // { key: "confirmPassword", label: "Confirm password", type: "string", section: "authored", mode: "create edit temp" },
    ],
    fieldGroups: {
      authored: [
        { title: "User identity", keys: ["username", "email"], width: fullWidth, layout: stackLayout },
        { title: "Roles", description: "Assign one or more role ids to this user account.", keys: ["userRoles"], width: halfWidth },
        { title: "Credentials", keys: ["password", "confirmPassword"], width: halfWidth, layout: stackLayout },
      ],
    },
    sidebarDisplay: [
      "username",
      "email",
      "userRoles",
    ]
  },
} as const satisfies Record<string, TabDefinition>;

export const KeyFields = {
  bags: "name",
  plugins: "name",
  roles: "name",
  templates: "name",
  users: "username",
  wikis: "slug",
} satisfies { [K in keyof typeof tabs]: typeof tabs[K]["fields"][number]["key"] }

export function getTab(tabId: TabId): TabDefinition {
  return tabs[tabId];
}
export function getAllTabs(): TabDefinition[] {
  return Object.values(tabs);
}

export type TabDef = typeof tabs;


export function getSectionHeading(section: FieldSection, mode: "create" | "edit"): { title: string; copy: string; } | null {
  switch (section) {
    case "authored": return null;
    case "runtime": return {
      title: "Current server state",
      copy: "These values come from the current server state. Changes you make on this page are not reflected here until you click save.",
    };
    case "operations": return {
      title: "Operations and diagnostics",
      copy: "",
    };
    default: throw new Error("Section heading not implemented for " + section);
  }

}



type StoredTabRecord<D extends TabDefinition, T> = Pick<T, TabFieldKeys<D, "" | "create edit temp" | "create temp" | "edit temp"> & keyof T>;
type SavedTabRecord<D extends TabDefinition, T> = Pick<T, TabFieldKeys<D, "" | "create edit temp" | "create temp" | "edit temp" | "server"> & keyof T>;

type TabFieldKeys<T extends TabDefinition, M extends Mode> = {
  [K in keyof TabDef]: MapFieldDefinitions<T["fields"], M>[number] | "id"
}[keyof TabDef];

type MapFieldDefinitions<T, M extends Mode> =
  T extends [infer F extends FieldDefinition, ...infer R] ? [FilterServerFields<F, M>, ...MapFieldDefinitions<R, M>] :
  T extends [infer F extends FieldDefinition] ? [FilterServerFields<F, M>] : [];

type FilterServerFields<T extends FieldDefinition, M extends Mode> =
  T["mode"] extends M ? never : T["key"];

export interface AdminRecordStore {
  wikis: WikiAdminRecord[];
  templates: TemplateAdminRecord[];
  bags: BagAdminRecord[];
  plugins: PluginAdminRecord[];
  roles: RoleAdminRecord[];
  users: UserAdminRecord[];
  availableBagNames: Set<string>;
  availablePluginNames: Set<string>;
}

export interface DataStore {
  wikis: StoredTabRecord<TabDef["wikis"], WikiAdminRecord>[];
  templates: StoredTabRecord<TabDef["templates"], TemplateAdminRecord>[];
  bags: StoredTabRecord<TabDef["bags"], BagAdminRecord>[];
  plugins: StoredTabRecord<TabDef["plugins"], PluginAdminRecord>[];
  roles: StoredTabRecord<TabDef["roles"], RoleAdminRecord>[];
  users: StoredTabRecord<TabDef["users"], UserAdminRecord>[];
  availableBagNames: Set<string>;
  availablePluginNames: Set<string>;
};

export interface DataSave {
  wikis: SavedTabRecord<TabDef["wikis"], WikiAdminRecord>[];
  templates: SavedTabRecord<TabDef["templates"], TemplateAdminRecord>[];
  bags: SavedTabRecord<TabDef["bags"], BagAdminRecord>[];
  plugins: SavedTabRecord<TabDef["plugins"], PluginAdminRecord>[];
  roles: SavedTabRecord<TabDef["roles"], RoleAdminRecord>[];
  users: SavedTabRecord<TabDef["users"], UserAdminRecord>[];
  availableBagNames: Set<string>;
  availablePluginNames: Set<string>;
};
// #region Wiki
export interface WikiAdminRecord {
  // server fields
  id: IdString;
  slug: KeyString;
  displayName: string;
  description: string;
  templateName: KeyString | null;
  writablePrefixBags: readonly WritablePrefixRow[];
  readonlyBags: readonly KeyString[];
  plugins: readonly string[];
  recipePermissions: readonly PermissionRow<RecipePermissionLevel>[];
  // client field
  defaultWritableBag: KeyString;
  readonlyBagCount: string;
  prefixRuleCount: string;
  pluginCount: string;
  effectiveWritableBags: readonly WritablePrefixRow[];
  effectiveReadonlyBags: readonly KeyString[];
  effectivePluginSet: readonly string[];
  compileValidation: string;
  lastCompiledAt: string;
  statusFlags: string;
  missingBags: string;
  missingPlugins: string;
  titleResolutionPreview: string;
}

export type TemplateTypes = "simpleV1";
// #region Template
export interface TemplateAdminRecord {
  // server fields
  id: IdString;
  type: TemplateTypes;
  name: KeyString;
  description: string;
  writablePrefixBags: readonly WritablePrefixRow[];
  readonlyBags: readonly KeyString[];
  plugins: readonly string[];
  templatePermissions: readonly PermissionRow<TemplatePermissionLevel>[];
  requiredPluginsEnabled: boolean;
  customHtmlEnabled: boolean;
  htmlContent: string;
  injectionArray: string;
  injectionLocation: string;
  // client fields
  defaultWritableBag: KeyString;
  readonlyBagsSummary: string;
  dependentWikis: string;
  dependentWikiCount: string;
  lastUpdatedAt: string;
  validationStatus: string;
  validationReport: string;
}
// #region Bag
export interface BagAdminRecord {
  id: IdString;
  name: KeyString;
  description: string;
  permissions: readonly PermissionRow<BagPermissionLevel>[];
  usedByCount: string;
  readonlyUsageCount: string;
  writableUsageCount: string;
  defaultUsageCount: string;
  permissionSummary: string;
  referencedByTemplates: string;
  referencedByWikis: string;
  routingRoles: string;
  // tiddlerCount: string;
  // lastActivityAt: string;
  // recentActivity: string;
}
// #region Plugin
export interface PluginAdminRecord {
  id: IdString;
  name: KeyString;
  description: string;
  pluginPath: string;
  usageCount: string;
  usedByWikis: KeyString[];
}
// #region Role
export interface RoleAdminRecord {
  id: IdString;
  name: KeyString;
  description: string;
}
// #region User
export interface UserAdminRecord {
  id: IdString;
  username: KeyString;
  email: string;
  userRoles: readonly string[];
}

export interface WritablePrefixRow {
  prefix: string;
  bagName: KeyString;
}

export interface PermissionRow<Level extends string = string> {
  role: KeyString;
  level: Level;
}

export interface KeyValueRow {
  key: string;
  value: string;
}


export class IdString extends String {
  static cast(val: IdString): string { return val.toString(); }
  static prefix = "IdString____";
  name = "IdString" as const;
  constructor(value: string) { super(value); }
  toJSON() { return IdString.prefix + this.valueOf(); }
}
export class KeyString extends String {
  static cast(val: KeyString): string { return val.toString(); }
  static prefix = "KeyString____";
  name = "KeyString" as const;
  constructor(value: string) { super(value); }
  toJSON() { return KeyString.prefix + this.valueOf(); }
}

const stringLikeFieldShape = z.union([z.string(), z.instanceof(String)]);
const stringListFieldShape = z.array(stringLikeFieldShape);
const writablePrefixRowFieldShape = z.object({
  prefix: z.string(),
  bagName: stringLikeFieldShape,
});
const permissionRowFieldShape = z.object({
  role: stringLikeFieldShape,
  level: z.string(),
});

export const fieldTypeZodShapes = {
  "template-type": z.enum(["simpleV1"]),
  "string": z.string(),
  "text": z.string(),
  "enter-password": z.string(),
  "confirm-password": z.string(),
  "search": z.union([stringLikeFieldShape, z.null()]),
  "structured-preview": z.string(),
  "table": stringListFieldShape,
  "permission-table": z.array(permissionRowFieldShape),
  "validation-report": z.string(),
  "resolver-preview": z.string(),
  "search-multiselect": stringListFieldShape,
  "prefix-table": z.array(writablePrefixRowFieldShape),
  "parameter-list": stringListFieldShape,
  "relationship-table": stringListFieldShape,
  "summary-list": stringListFieldShape,
  "number": z.string(),
  "activity-feed": stringListFieldShape,
  "version": z.string(),
  "select": z.boolean(),
  "metadata-table": stringListFieldShape,
} satisfies Record<FieldType, any>;

export type TabZodObjectFilter = "DataStore" | "DataSave";

function shouldIncludeFieldInTabZodObject(mode: Mode, filter?: TabZodObjectFilter): boolean {
  if (filter === "DataStore") {
    return mode !== "" && mode !== "create edit temp" && mode !== "create temp" && mode !== "edit temp";
  }
  if (filter === "DataSave") {
    return mode !== "" && mode !== "create edit temp" && mode !== "create temp" && mode !== "edit temp" && mode !== "server";
  }
  return true;
}

export function buildTabZodObject<T extends TabId>(tabId: T, filter?: TabZodObjectFilter) {
  const tab = tabs[tabId];
  const fieldEntries = tab.fields
    .filter((field) => shouldIncludeFieldInTabZodObject(field.mode, filter))
    .map((field) => [
      field.key,
      KeyFields[tabId] === field.key
        ? z.instanceof(KeyString)
        : fieldTypeZodShapes[field.type]
    ] as const);

  return z.object({
    id: stringLikeFieldShape,
    ...Object.fromEntries(fieldEntries),
  });
}