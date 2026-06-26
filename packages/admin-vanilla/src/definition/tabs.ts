
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
  | "string"
  | "text"
  | "autocomplete"
  | "json-editor"
  | "structured-preview"
  | "table"
  | "permission-table"
  | "validation-report"
  | "resolver-preview"
  | "search-multiselect"
  | "key-value-table"
  | "reference"
  | "reference-list"
  | "parameter-list"
  | "relationship-table"
  | "action"
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
  section?: FieldSection;
  mode: Mode;
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
  fields: FieldDefinition[];
  fieldGroups?: Partial<Record<FieldSection, FieldGroupDefinition[]>>;
}

const tabs = [
  {
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
      { key: "compileValidation", label: "Validation" }
    ],
    fields: [
      { key: "slug", label: "Slug", type: "string", section: "authored", mode: "create edit" },
      { key: "displayName", label: "Display name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      { key: "templateId", label: "Template", type: "autocomplete", section: "authored", mode: "create" },
      { key: "readonlyBags", label: "Readonly bags", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "plugins", label: "Plugins", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "lastCompiledAt", label: "Compiled", type: "string", section: "runtime", mode: "server" },
      {
        key: "writablePrefixBags",
        label: "Writable prefix bags",
        type: "key-value-table",
        section: "authored",
        mode: "create edit",
        architecture: "Edits the wiki-level prefix-to-bag routing table that drives write target selection. Longest prefix wins, and the empty string row is the fallback write target.",
      },
      {
        key: "effectiveWritableBags",
        label: "Effective writable bags",
        type: "key-value-table",
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
        { title: "Wiki identity", description: "Name the wiki, describe it, and choose the template that provides its base routing model.", keys: ["slug", "displayName", "description", "templateId"], width: fullWidth, layout: stackLayout },
        { title: "Writable routing", description: "Define the wiki-specific write targets for title prefixes, including the default fallback bag.", keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", description: "Add wiki-specific readonly bags on top of anything inherited from the template.", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", description: "Add wiki-specific plugins on top of the template plugin set.", keys: ["plugins"], width: halfWidth },
        { title: "Access", description: "Control who can access the wiki surface itself. Bag access is handled separately on the participating bags.", keys: ["recipePermissions"], width: fullWidth },
      ],
      runtime: [
        { title: "Computed Write Prefix", description: "", keys: ["effectiveWritableBags"], width: fullWidth },
        { title: "Computed Bag Order", description: "", keys: ["effectiveReadonlyBags"], width: halfWidth },
        { title: "Computed Plugin Set", description: "", keys: ["effectivePluginSet"], width: halfWidth },
        { title: "Compilation status", description: "Validation and compilation outcome for the current authored state.", keys: ["compileValidation"], width: fullWidth },
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
  },
  {
    id: "templates",
    label: "Templates",
    createLabel: "Create template",
    eyebrow: "Wiki Blueprints",
    description: "Reusable recipe definitions. Changes made to a template apply to every wiki using it.",
    columns: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "readonlyBagsSummary", label: "Readonly bags" },
      { key: "writablePrefixSummary", label: "Writable prefixes" },
      { key: "dependentWikiCount", label: "Dependent wikis" },
      { key: "lastUpdatedAt", label: "Updated" },
      { key: "validationStatus", label: "Validation" },
    ],
    fields: [
      { key: "name", label: "Name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      { key: "lastUpdatedAt", label: "Updated", type: "string", section: "runtime", mode: "server" },
      {
        key: "writablePrefixBags",
        label: "Writable prefix bags",
        type: "key-value-table",
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
        mode: "server",
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
        { title: "Writable routing", description: "Define the template-level default and prefix-based write targets that dependent wikis inherit before applying their own overrides.", keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", keys: ["plugins", "requiredPluginsEnabled"], width: halfWidth, layout: stackLayout },
        { title: "Custom HTML shell", keys: ["htmlContent", "injectionArray", "injectionLocation"], headerFieldKey: "customHtmlEnabled", disabledWhenHeaderOff: true, width: fullWidth, layout: stackLayout },
      ],
      runtime: [
        // { keys: ["defaultWritableBag"], width: halfWidth },
        // { keys: ["dependentWikis"], width: halfWidth },
        // { keys: ["validationReport"], width: halfWidth },
      ],
    },
  },
  {
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
        { keys: ["routingRoles"], width: halfWidth },
        { keys: ["tiddlerCount"], width: halfWidth },
        { keys: ["recentActivity"], width: fullWidth },
      ],
    },
  },
  {
    id: "plugins",
    label: "Plugins",
    createLabel: "Create plugin",
    eyebrow: "Managed Assets",
    description: "Separately versioned plugins compiled into each wiki’s resolved plugin set. Still work in progress.",
    columns: [
      { key: "name", label: "Name" },
      { key: "version", label: "Version" },
      { key: "status", label: "Status" },
      { key: "usageCount", label: "Usage" },
      { key: "updatedAt", label: "Updated" },
    ],
    fields: [
      { key: "name", label: "Name", type: "string", section: "authored", mode: "create edit" },
      { key: "version", label: "Version", type: "version", section: "authored", mode: "create edit" },
      { key: "status", label: "Status", type: "select", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      {
        key: "assetsMetadata",
        label: "Assets metadata",
        type: "metadata-table",
        section: "runtime",
        mode: "",
        architecture: "Read-only metadata projection from the stored plugin version and its packaged payload, showing the concrete assets and identity facts consumed by the renderer and plugin cache.",
      },
      {
        key: "usedByWikis",
        label: "Used by wikis",
        type: "relationship-table",
        section: "runtime",
        mode: "",
        architecture: "Read-only relationship view derived from compiled recipe-plugin rows, showing exact effective usage of this version.",
      },
      {
        key: "draftOf",
        label: "Draft of",
        type: "reference",
        section: "runtime",
        mode: "",
        architecture: "Read-only lineage pointer from a draft plugin to the published version it branched from or intends to replace.",
      },
      {
        key: "publishFromDraft",
        label: "Publish from draft",
        type: "action",
        section: "operations",
        mode: "edit",
        architecture: "Action surface that promotes a draft state into a concrete version usable by compiled wiki plugin rows.",
      },
    ],
    fieldGroups: {
      authored: [
        { title: "Plugin basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
        { title: "Release details", keys: ["version", "status"], width: halfWidth },
      ],
    },
  },
  {
    id: "roles",
    label: "Roles",
    createLabel: "Create role",
    eyebrow: "Access profiles",
    description: "Named access profiles that can be assigned to user accounts.",
    columns: [
      { key: "roleId", label: "Role name" },
      { key: "description", label: "Role description" },
    ],
    fields: [
      { key: "roleId", label: "Role name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Role description", type: "text", section: "authored", mode: "create edit" },
    ],
    fieldGroups: {
      authored: [
        { title: "Role basics", keys: ["roleId", "description"], width: fullWidth, layout: stackLayout },
      ],
    },
  },
  {
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
      { key: "roleIds", label: "Roles", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "password", label: "Password", type: "string", section: "authored", mode: "create edit" },
      { key: "confirmPassword", label: "Confirm password", type: "string", section: "authored", mode: "create edit temp" },
    ],
    fieldGroups: {
      authored: [
        { title: "User identity", keys: ["username", "email"], width: fullWidth, layout: stackLayout },
        { title: "Roles", description: "Assign one or more role ids to this user account.", keys: ["roleIds"], width: halfWidth },
        { title: "Credentials", keys: ["password", "confirmPassword"], width: halfWidth, layout: stackLayout },
      ],
    },
  },
] as const satisfies TabDefinition[];


type StoredTabRecord<T extends TabDefinition> = { id: string } & Record<t2a<T>[T["id"]][number], string>;

export type DataStore = {
  wikis: StoredTabRecord<(typeof tabs)[0]>[];
  templates: StoredTabRecord<(typeof tabs)[1]>[];
  bags: StoredTabRecord<(typeof tabs)[2]>[];
  plugins: StoredTabRecord<(typeof tabs)[3]>[];
  roles: StoredTabRecord<(typeof tabs)[4]>[];
  users: StoredTabRecord<(typeof tabs)[5]>[];
  availableBagNames: Set<string>;
  availablePluginNames: Set<string>;
};

type t2<T> = T extends [infer F extends TabDefinition, ...infer R] ? [t2a<F>, ...t2<R>]
  : T extends [infer F extends TabDefinition] ? [t2a<F>] : [];

type t3<T> = T extends [infer F extends FieldDefinition, ...infer R] ? [t3a<F>, ...t3<R>]
  : T extends [infer F extends FieldDefinition] ? [t3a<F>] : [];

type t2a<T extends TabDefinition> = { [K in T["id"]]: t3<T["fields"]> };
type t3a<T extends FieldDefinition> =
  T["mode"] extends "" ? never :
  T["mode"] extends "create edit temp" ? never :
  T["mode"] extends "create temp" ? never :
  T["mode"] extends "edit temp" ? never :
  T["key"];



export function getTab(tabId: TabId): TabDefinition {
  return tabs.find((tab) => tab.id === tabId) ?? tabs[0];
}
export function getAllTabs(): TabDefinition[] {
  return tabs;
}


export type IWikiRow = StoredTabRecord<(typeof tabs)[0]>;
export type ITemplateRow = StoredTabRecord<(typeof tabs)[1]>;
export type IBagRow = StoredTabRecord<(typeof tabs)[2]>;
export type IPluginRow = StoredTabRecord<(typeof tabs)[3]>;
export type IRoleRow = StoredTabRecord<(typeof tabs)[4]>;
export type IUserRow = StoredTabRecord<(typeof tabs)[5]>;
