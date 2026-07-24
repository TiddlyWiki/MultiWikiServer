import {
  BagPermissionLevel,
  RecipePermissionLevel,
  TemplatePermissionLevel
} from "@tiddlywiki/mws-prisma";
import { zod as z } from "@tiddlywiki/server/src/Z2";


const halfWidth = "half" as const;
const fullWidth = "full" as const;
const stackLayout = "stack" as const;

export type TabId = "wikis" | "templates" | "bags" | "roles" | "users";


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
  | "switch"
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


export class IdString extends String {
  static cast(val: IdString): string { return val.toString(); }
  static prefix = "IdString____";
  name = "IdString" as const;
  constructor(value: string) { super(value); }
  toJSON() { return IdString.prefix + this.valueOf(); }
}

const stringLikeFieldShape = z.union([z.string(), z.instanceof(IdString)]);

export const fieldTypeZodShapes = {
  "template-type": z.enum(["simpleV1"]),
  "string": z.string(),
  "text": z.string(),
  "enter-password": z.string(),
  "confirm-password": z.string(),
  "search": z.string(),
  "structured-preview": z.string(),
  "table": z.string().array(),
  "permission-table": z.array(z.object({
    role: z.string(),
    level: z.string(),
  })),
  "validation-report": z.string(),
  "resolver-preview": z.string(),
  "search-multiselect": z.string().array(),
  "prefix-table": z.array(z.object({
    prefix: z.string(),
    bagName: z.string(),
  })),
  "parameter-list": z.string().array(),
  "relationship-table": z.string().array(),
  "summary-list": z.string().array(),
  "number": z.string(),
  "activity-feed": z.string().array(),
  "version": z.string(),
  "select": z.string(),
  "switch": z.boolean(),
  "metadata-table": z.string().array(),
} satisfies Record<FieldType, any>;

export type FieldZodType<T extends FieldType = FieldType> = z.infer<(typeof fieldTypeZodShapes)[T]>;

export const fieldTypeCreateFactories = {
  "template-type": () => "simpleV1",
  "string": () => "",
  "text": () => "",
  "enter-password": () => "",
  "confirm-password": () => "",
  "search": () => "",
  "switch": () => false,
  "structured-preview": () => "",
  "table": () => [],
  "permission-table": () => [],
  "validation-report": () => "",
  "resolver-preview": () => "",
  "search-multiselect": () => [],
  "prefix-table": () => [],
  "parameter-list": () => [],
  "relationship-table": () => [],
  "summary-list": () => [],
  "number": () => "",
  "activity-feed": () => [],
  "version": () => "",
  "select": () => "",
  "metadata-table": () => [],
} satisfies { [K in FieldType]: () => FieldZodType<K> };



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


const writableRoutingDescription =
  "Define the write targets for title prefixes. " +
  "The resolver matches prefixes from longest to shortest, so most specific prefix gets the tiddler. " +
  "A tiddler will first be read from the single writable bag it matches, then from readonly bags, " +
  "other writable bags are ignored. The default bag catches any titles that don't match a prefix. ";

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
        architecture: "Edits the wiki-level prefix-to-bag routing table that drives write target selection. Longest prefix wins, and the empty string row is the fallback write target. A tiddler will only be read from the single write target it matches, after that the readonly bags are used, other write targets are ignored.",
      },
      {
        key: "effectiveWritableBags",
        label: "Current writable bags",
        type: "prefix-table",
        section: "runtime",
        mode: "server",
        architecture: "Read-only projection of compiled recipe-bag rows in the same slice of the pie order the resolver uses for writes.",
      },
      {
        key: "effectiveReadonlyBags",
        label: "Current readonly bags",
        type: "table",
        section: "runtime",
        mode: "server",
        architecture: "Read-only projection of compiled recipe-bag rows in the same top-to-bottom order the resolver uses for reads.",
      },
      {
        key: "effectivePluginSet",
        label: "Current plugin set",
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
        { title: "Writable routing", description: writableRoutingDescription, keys: ["writablePrefixBags"], width: fullWidth },
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
        label: "Include Required Plugins",
        type: "switch",
        section: "authored",
        mode: "create edit",
        description: "Core plugins enable wiki sync functionality. Disable them for vanilla wikis or custom sync implementations.",
      },
      {
        key: "externalStore",
        label: "External JS Store",
        type: "switch",
        section: "authored",
        mode: "create edit",
        description: "Loads the entire store, including plugins, via a script tag.",
      },
      {
        key: "externalPlugins",
        label: "Load Plugins via Script Tags",
        type: "switch",
        section: "authored",
        mode: "create edit",
        description: "Loads plugin JSON on the client via script tags, allowing the browser to cache plugins separate from the store.",
      },
      {
        key: "twVersion",
        label: "TiddlyWiki Version",
        type: "select",
        section: "authored",
        mode: "create edit",
        description: "TW5 version pinning.",

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
        type: "switch",
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
        key: "injectionFunction",
        label: "Injection function",
        type: "string",
        section: "authored",
        mode: "create edit",
        description: "Name of the JavaScript function to call with tiddlers, for example $tw.preloadTiddlers.",
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
        { title: "Writable routing", description: writableRoutingDescription, keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", keys: ["plugins", "requiredPluginsEnabled", "externalPlugins"], width: halfWidth, layout: stackLayout },
        { title: "Permissions", description: "Permissions for who can edit or use this template. Access to the template is required to apply it to a recipe, but not required to use that recipe.", keys: ["templatePermissions"], width: fullWidth, layout: stackLayout },
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
        key: "bagPermissions",
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
        { keys: ["bagPermissions"], width: fullWidth },
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
  // plugins: {
  //   id: "plugins",
  //   label: "Plugins",
  //   createLabel: "Create plugin",
  //   eyebrow: "Managed Assets",
  //   description: "Separately versioned plugins compiled into each wiki’s resolved plugin set. Still work in progress.",
  //   columns: [
  //     { key: "name", label: "Name" },
  //     { key: "description", label: "Description" },
  //     { key: "pluginPath", label: "Plugin Path" },
  //     { key: "usageCount", label: "Usage" },
  //   ],
  //   fields: [
  //     { key: "name", label: "Name", type: "string", section: "authored", mode: "server" },
  //     { key: "description", label: "Description", type: "text", section: "authored", mode: "server" },
  //     { key: "pluginPath", label: "Path", type: "string", section: "authored", mode: "server" },
  //     { key: "usageCount", label: "Wiki Count", type: "number", section: "runtime", mode: "" },
  //     { key: "usedByWikis", label: "Active Wikis", type: "table", section: "runtime", mode: "" },
  //   ],
  //   fieldGroups: {
  //     runtime: [
  //       { title: "Used in", description: "List of wikis this plugin is used in. Only includes templates that are in use.", keys: ["usedByWikis"], width: fullWidth, layout: "grid" },
  //     ],
  //   },
  //   sidebarDisplay: [
  //     "name",
  //     "description",
  //     "usageCount",
  //     "pluginPath",
  //   ],
  // },
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
  // #region users
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
      { key: "resetCode", label: "Reset Code", type: "string", section: "authored", mode: "create edit" },

      // { key: "password", label: "Password", type: "string", section: "authored", mode: "create edit" },
      // { key: "confirmPassword", label: "Confirm password", type: "string", section: "authored", mode: "create edit temp" },
    ],
    fieldGroups: {
      authored: [
        { title: "User identity", keys: ["username", "email"], width: fullWidth, layout: stackLayout },
        { title: "Roles", description: "Assign one or more role ids to this user account.", keys: ["userRoles"], width: halfWidth },
        { title: "Reset Code", description: "Allow the user to reset their password with this code.", keys: ["resetCode"], width: halfWidth },
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
  // plugins: "name",
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
type TabKeys<T extends TabDefinition> = MapFieldDefinitions<T["fields"], any>[number] | "id"
type FieldValueMap<T> = FieldValueMap2<{ [K in keyof T]: FieldZodType<Extract<T[K], { key: K; type: FieldType; }>["type"]> }>;
type FieldValueMap2<T> = { [K in keyof T]: T[K] extends Array<infer F> ? ReadonlyArray<F> : T[K] } & { id: IdString }


type StoredTabRecord<D extends TabDefinition, T> = Pick<T, TabFieldModeKeys<D, "" | "create edit temp" | "create temp" | "edit temp"> & keyof T>;
type SavedTabRecord<D extends TabDefinition, T> = Pick<T, TabFieldModeKeys<D, "" | "create edit temp" | "create temp" | "edit temp" | "server"> & keyof T>;

type TabFieldModeKeys<T extends TabDefinition, M extends Mode> = MapFieldDefinitions<T["fields"], M>[number] | "id"

type MapFieldDefinitions<T, M extends Mode> =
  T extends [infer F extends FieldDefinition, ...infer R] ? [FilterServerFields<F, M>, ...MapFieldDefinitions<R, M>] :
  T extends [infer F extends FieldDefinition] ? [FilterServerFields<F, M>] : [];

type FilterServerFields<T extends FieldDefinition, M extends Mode> =
  T["mode"] extends M ? never : T["key"];

type TupleWhere<T, W> =
  T extends [infer F, ...infer R]
  ? (F extends W ? F : never) | TupleWhere<R, W>
  : T extends [infer F extends W]
  ? (F extends W ? F : never)
  : never;

/** this ignores key string, which could be an issue */
export type Drafter<T extends { key: string; type: FieldType; }[]> = {
  [K in T[number]["key"]]:
  FieldZodType<TupleWhere<T, { key: K }>["type"]>
} & { id: IdString; }

export interface ExtraServerStuff {
  availablePlugins: { name: string; description: string; }[];
}
export interface ExtraClientStuff {
  availableBagNames: Set<string>;
  availablePluginNames: Set<string>;
}
// DataClient keeps the record interfaces in sync with the zod field types
export interface AdminRecordStore extends DataClient, ExtraClientStuff, ExtraServerStuff {
  wikis: WikiAdminRecord[];
  templates: TemplateAdminRecord[];
  bags: BagAdminRecord[];
  // plugins: PluginAdminRecord[];
  roles: RoleAdminRecord[];
  users: UserAdminRecord[];
}

type DataClient = {
  [K in keyof TabDef]: FieldValueMap<{
    [I in number & keyof TabDef[K]["fields"]as TabDef[K]["fields"][I]["key"]]: TabDef[K]["fields"][I]
  }>[]
}

export interface DataStore extends ExtraServerStuff {
  wikis: StoredTabRecord<TabDef["wikis"], WikiAdminRecord>[];
  templates: StoredTabRecord<TabDef["templates"], TemplateAdminRecord>[];
  bags: StoredTabRecord<TabDef["bags"], BagAdminRecord>[];
  // plugins: StoredTabRecord<TabDef["plugins"], PluginAdminRecord>[];
  roles: StoredTabRecord<TabDef["roles"], RoleAdminRecord>[];
  users: StoredTabRecord<TabDef["users"], UserAdminRecord>[];
};

export interface DataSave {
  wikis: SavedTabRecord<TabDef["wikis"], WikiAdminRecord>[];
  templates: SavedTabRecord<TabDef["templates"], TemplateAdminRecord>[];
  bags: SavedTabRecord<TabDef["bags"], BagAdminRecord>[];
  // plugins: SavedTabRecord<TabDef["plugins"], PluginAdminRecord>[];
  roles: SavedTabRecord<TabDef["roles"], RoleAdminRecord>[];
  users: SavedTabRecord<TabDef["users"], UserAdminRecord>[];
};
// #region Wiki
export interface WikiAdminRecord {
  // server fields
  id: IdString;
  slug: string;
  displayName: string;
  description: string;
  templateName: string;
  writablePrefixBags: readonly WritablePrefixRow[];
  readonlyBags: readonly string[];
  plugins: readonly string[];
  recipePermissions: readonly PermissionRow<RecipePermissionLevel>[];
  // client field
  defaultWritableBag: string;
  readonlyBagCount: string;
  prefixRuleCount: string;
  pluginCount: string;
  effectiveWritableBags: readonly WritablePrefixRow[];
  effectiveReadonlyBags: readonly string[];
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
  name: string;
  description: string;
  writablePrefixBags: readonly WritablePrefixRow[];
  readonlyBags: readonly string[];
  plugins: readonly string[];
  templatePermissions: readonly PermissionRow<TemplatePermissionLevel>[];
  requiredPluginsEnabled: boolean;
  externalStore: boolean;
  externalPlugins: boolean;
  twVersion: string;
  customHtmlEnabled: boolean;
  htmlContent: string;
  injectionFunction: string;
  injectionLocation: string;
  // client fields
  defaultWritableBag: string;
  readonlyBagsSummary: string;
  dependentWikis: readonly string[];
  dependentWikiCount: string;
  lastUpdatedAt: string;
  validationStatus: string;
  validationReport: string;
}
// #region Bag
export interface BagAdminRecord {
  id: IdString;
  name: string;
  description: string;
  bagPermissions: readonly PermissionRow<BagPermissionLevel>[];
  usedByCount: string;
  readonlyUsageCount: string;
  writableUsageCount: string;
  defaultUsageCount: string;
  permissionSummary: string;
  referencedByTemplates: readonly string[];
  referencedByWikis: readonly string[];
  routingRoles: readonly string[];
  // tiddlerCount: string;
  // lastActivityAt: string;
  // recentActivity: string;
}
// #region Plugin
export interface PluginAdminRecord {
  id: IdString;
  name: string;
  description: string;
  pluginPath: string;
  usageCount: string;
  usedByWikis: string[];
}
// #region Role
export interface RoleAdminRecord {
  id: IdString;
  name: string;
  description: string;
}
// #region User
export interface UserAdminRecord {
  id: IdString;
  username: string;
  email: string;
  resetCode: string;
  userRoles: readonly string[];
}

export interface WritablePrefixRow {
  prefix: string;
  bagName: string;
}

export interface PermissionRow<Level extends string = string> {
  role: string;
  level: Level;
}

export interface KeyValueRow {
  key: string;
  value: string;
}


// export class string extends String {
//   static cast(val: string): string { return val; }
//   static prefix = "KeyString____";
//   name = "KeyString" as const;
//   constructor(value: string) { super(value); }
//   toJSON() { return string.prefix + this.valueOf(); }
//   toString() { return super.toString(); }
// }


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
    .map((field) => [field.key, fieldTypeZodShapes[field.type]] as const);

  return z.object({
    id: stringLikeFieldShape,
    ...Object.fromEntries(fieldEntries),
  });
}


