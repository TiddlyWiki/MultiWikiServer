import { customElement, JSXElement, addstyles, state, property } from "@tiddlywiki/jsx-lit";
import css from "./app.inline.css";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";


// import icon1 from "@material-symbols/svg-400/{style}/{icon}.svg" // (Unfilled)
// import icon2 from "@material-symbols/svg-400/{style}/{icon}-fill.svg" // (Filled)
// <MaterialSymbol icon={icon1} />
@customElement("material-symbol")
export class MaterialSymbol extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: {
    icon: string;
  }

  protected render() {
    this.innerHTML = this.props.icon;
    return JSXElement.DO_NOT_RENDER;
  }
}

type TabId = "wikis" | "templates" | "bags" | "plugins";
type FieldType =
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
  | "parameter-list"
  | "relationship-table"
  | "action"
  | "summary-list"
  | "number"
  | "activity-feed"
  | "version"
  | "select"
  | "metadata-table";

type Mode = "create" | "create edit" | "edit" | "";
type ModalMode = "create" | "edit";
type AdminRecord = Record<string, string>;
type ItemsByTab = Record<TabId, AdminRecord[]>;
type FieldSection = "authored" | "runtime" | "operations";
type PermissionLevel = "A_read" | "B_write" | "C_admin";
type RecipePermissionLevel = "A_read" | "B_write";

interface MappingRow {
  left: string;
  right: string;
}

interface PermissionRow {
  role: string;
  level: PermissionLevel;
}

interface KeyValueRow {
  key: string;
  value: string;
}

interface FieldGroupDefinition {
  title?: string;
  description?: string;
  keys: string[];
  headerFieldKey?: string;
  disabledWhenHeaderOff?: boolean;
  footerDescriptionFromHeader?: boolean;
  width?: "half" | "full";
  layout?: "grid" | "stack";
}

const halfWidth = "half" as const;
const fullWidth = "full" as const;
const stackLayout = "stack" as const;

interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  section?: FieldSection;
  mode: Mode;
  description?: string;
  architecture?: string;
}

interface ColumnDefinition {
  key: string;
  label: string;
}

interface TabDefinition {
  id: TabId;
  label: string;
  eyebrow: string;
  description: string;
  columns: ColumnDefinition[];
  fields: FieldDefinition[];
}

interface ModalState {
  tabId: TabId;
  mode: ModalMode;
  draft: AdminRecord;
  resolverTitle: string;
  operationMessages: Record<string, string>;
  pendingRows: Record<string, number>;
  transientPermissionRows: Record<string, PermissionRow[]>;
  loading?: boolean;
  recordId?: string;
}

interface AdminStorage {
  loadAll(): Promise<ItemsByTab>;
  read(tabId: TabId, id: string): Promise<AdminRecord | null>;
  save(tabId: TabId, record: AdminRecord): Promise<AdminRecord[]>;
}

type DraftChangeHandler = (fieldKey: string, value: string) => void;
type PendingRowsChangeHandler = (fieldKey: string, updater: (count: number) => number) => void;
type PermissionRowsChangeHandler = (fieldKey: string, rows: PermissionRow[]) => void;
type ResolverTitleChangeHandler = (value: string) => void;
type OperationTriggerHandler = (fieldKey: string, message: string) => void;

interface ReadonlyFieldProps {
  field: FieldDefinition;
  value: string;
  itemsByTab?: ItemsByTab;
}

interface FieldEditorProps {
  field: FieldDefinition;
  value: string;
  disabled?: boolean;
  modalState: ModalState;
  itemsByTab: ItemsByTab;
  onDraftChange: DraftChangeHandler;
  onPendingRowsChange: PendingRowsChangeHandler;
  onTransientPermissionRowsChange: PermissionRowsChangeHandler;
  onResolverTitleChange: ResolverTitleChangeHandler;
  onTriggerOperation: OperationTriggerHandler;
}

interface FieldBlockProps extends FieldEditorProps {
  modalMode: ModalMode;
  useCardTitle?: boolean;
}

interface SidebarReadonlyFieldProps {
  field: FieldDefinition;
  draft: AdminRecord;
}

interface MissingDependencyLine {
  value: string;
  missing: boolean;
}

interface SidebarSectionProps {
  title: string;
  content: JSX.Element;
}

interface ToggleFieldProps {
  field: FieldDefinition;
  value: string;
  onDraftChange: DraftChangeHandler;
  headerOnly?: boolean;
}

interface RecordModalProps {
  selectedTab: TabDefinition;
  modalState: ModalState;
  itemsByTab: ItemsByTab;
  isModalLoading: boolean;
  isSaving: boolean;
  isOpeningItem: boolean;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: DraftChangeHandler;
  onPendingRowsChange: PendingRowsChangeHandler;
  onTransientPermissionRowsChange: PermissionRowsChangeHandler;
  onResolverTitleChange: ResolverTitleChangeHandler;
  onTriggerOperation: OperationTriggerHandler;
}

const bagPermissionLevels: PermissionLevel[] = ["A_read", "B_write", "C_admin"];
const recipePermissionLevels: RecipePermissionLevel[] = ["A_read", "B_write"];

const tabs = [
  {
    id: "wikis",
    label: "Wikis",
    eyebrow: "Addressable pages",
    description: "Final wiki instances built from a template plus per-wiki parameters. The list shows the compiled posture; the popup shows authored inputs and derived routing output together.",
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
    ],
    fields: [
      { key: "slug", label: "Slug", type: "string", section: "authored", mode: "create edit" },
      { key: "displayName", label: "Display name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
      { key: "templateId", label: "Template", type: "autocomplete", section: "authored", mode: "create" },
      { key: "readonlyBags", label: "Readonly bags", type: "search-multiselect", section: "authored", mode: "create edit" },
      { key: "plugins", label: "Plugins", type: "search-multiselect", section: "authored", mode: "create edit" },
      {
        key: "writablePrefixBags",
        label: "Writable prefix bags",
        type: "key-value-table",
        section: "authored",
        mode: "create edit",
        architecture: "Edits the wiki-level prefix-to-bag routing table that drives write target selection. Longest prefix wins, and the empty string row is the fallback write target.",
      },
      {
        key: "parameters",
        label: "Parameters",
        type: "json-editor",
        section: "authored",
        mode: "create edit",
        architecture: "Writes to the wiki record parameters JSON. It only holds values the selected template leaves unbound, then those values are merged with template definition data during compilation.",
      },
      {
        key: "effectiveBagOrder",
        label: "Effective bags",
        type: "table",
        section: "runtime",
        mode: "",
        architecture: "Read-only projection of compiled recipe-bag rows in the same top-to-bottom order the resolver uses for reads.",
      },
      {
        key: "effectivePluginSet",
        label: "Effective plugin set",
        type: "table",
        section: "runtime",
        mode: "",
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
        mode: "edit",
        architecture: "Diagnostic resolver output for a title entered by the user: computed prefix match and authored write target selection only. Read answers and final write permission would require live server state.",
      },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    eyebrow: "Routing blueprints",
    description: "Reusable recipe definitions that bind part of the routing model and leave the rest for wikis. The popup combines authored definition data with dependency and validation views.",
    columns: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "readonlyBagsSummary", label: "Readonly bags" },
      { key: "writablePrefixSummary", label: "Writable prefixes" },
      { key: "openParameterSummary", label: "Open parameters" },
      { key: "dependentWikiCount", label: "Dependent wikis" },
      { key: "lastUpdatedAt", label: "Updated" },
      { key: "validationStatus", label: "Validation" },
    ],
    fields: [
      { key: "name", label: "Name", type: "string", section: "authored", mode: "create edit" },
      { key: "description", label: "Description", type: "text", section: "authored", mode: "create edit" },
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
        type: "reference",
        section: "runtime",
        mode: "",
        architecture: "Read-only convenience projection of the writablePrefixBags row whose prefix is the empty string.",
      },
      {
        key: "openParameters",
        label: "Open parameters",
        type: "parameter-list",
        section: "runtime",
        mode: "",
        architecture: "Read-only description of which values the template leaves for each wiki to provide in its parameters JSON.",
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
        key: "validationResult",
        label: "Validation result",
        type: "validation-report",
        section: "runtime",
        mode: "",
        architecture: "Read-only summary of whether the definition can compile cleanly against current bag and plugin references.",
      },
    ],
  },
  {
    id: "bags",
    label: "Bags",
    eyebrow: "Storage containers",
    description: "Concrete tiddler storage with role-based access control. The list emphasizes usage footprint; the popup separates bag permissions from routing relationships.",
    columns: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "usedByCount", label: "Used by" },
      { key: "readonlyUsageCount", label: "Readonly" },
      { key: "writableUsageCount", label: "Writable" },
      { key: "defaultUsageCount", label: "Default" },
      { key: "permissionSummary", label: "Permissions" },
      { key: "tiddlerCount", label: "Tiddlers" },
      { key: "lastActivityAt", label: "Last activity" },
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
      { key: "tiddlerCount", label: "Tiddler count", type: "number", section: "runtime", mode: "", },
      {
        key: "recentActivity",
        label: "Recent activity",
        type: "activity-feed",
        section: "runtime",
        mode: "",
        architecture: "Read-only operational summary built from recent tiddler event rows for this bag.",
      },
    ],
  },
  {
    id: "plugins",
    label: "Plugins",
    eyebrow: "Versioned assets",
    description: "Separately versioned plugins compiled into each wiki’s resolved plugin set. The popup focuses on lineage, metadata, and effective usage.",
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
  },
] as const satisfies TabDefinition[];


type StoredTabRecord<T extends TabDefinition> = { id: string } & Partial<Record<t2a<T>[T["id"]][number], string>>;

type DataStore = {
  wikis: Record<string, StoredTabRecord<(typeof tabs)[0]>>;
  templates: Record<string, StoredTabRecord<(typeof tabs)[1]>>;
  bags: Record<string, StoredTabRecord<(typeof tabs)[2]>>;
  plugins: Record<string, StoredTabRecord<(typeof tabs)[3]>>;
};

type t2<T> = T extends [infer F extends TabDefinition, ...infer R] ? [t2a<F>, ...t2<R>]
  : T extends [infer F extends TabDefinition] ? [t2a<F>] : [];

type t3<T> = T extends [infer F extends FieldDefinition, ...infer R] ? [t3a<F>, ...t3<R>]
  : T extends [infer F extends FieldDefinition] ? [t3a<F>] : [];

type t2a<T extends TabDefinition> = { [K in T["id"]]: t3<T["fields"]> };
type t3a<T extends FieldDefinition> = T["mode"] extends "" ? never : T["key"];

function getStoredFieldKeys(tab: TabDefinition): string[] {
  return tab.fields.filter((field) => Boolean(field.mode)).map((field) => field.key);
}

function pruneStoredRecord(tabId: TabId, record: AdminRecord, fallbackOrdinal?: number): AdminRecord {
  const tab = getTab(tabId);
  const storedFieldKeys = getStoredFieldKeys(tab);
  const pruned = storedFieldKeys.reduce<AdminRecord>((nextRecord, key) => {
    nextRecord[key] = record[key] ?? "";
    return nextRecord;
  }, {});
  pruned.id = record.id || String(fallbackOrdinal ?? 0);
  return pruned;
}

function toItemArray(tabId: TabId, records: Record<string, AdminRecord>): AdminRecord[] {
  return Object.entries(records)
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId, undefined, { numeric: true }))
    .map(([id, record]) => ({ ...record, id }));
}

function toItemsByTab(store: DataStore): ItemsByTab {
  return {
    wikis: toItemArray("wikis", store.wikis),
    templates: toItemArray("templates", store.templates),
    bags: toItemArray("bags", store.bags),
    plugins: toItemArray("plugins", store.plugins),
  };
}

function toDataStore(items: ItemsByTab): DataStore {
  const mapTab = (tabId: TabId, records: AdminRecord[]) => Object.fromEntries(
    records.map((record, ordinal) => {
      const storedRecord = pruneStoredRecord(tabId, record, ordinal);
      const id = storedRecord.id || String(ordinal);
      return [id, { ...storedRecord, id }];
    }),
  );

  return {
    wikis: mapTab("wikis", items.wikis),
    templates: mapTab("templates", items.templates),
    bags: mapTab("bags", items.bags),
    plugins: mapTab("plugins", items.plugins),
  };
}

function getTab(tabId: TabId): TabDefinition {
  return tabs.find((tab) => tab.id === tabId) ?? tabs[0];
}

function formatPrefixSummary(value: string): string {
  const rows = parseMappingRows(value);
  return rows.map((row) => row.left || "default").join(", ");
}

function buildTemplateDependentWikiMap(wikis: AdminRecord[], templates: AdminRecord[]): Map<string, string[]> {
  const templateNameByKey = new Map(templates.map((template) => [normalizeLookupKey(template.name), template.name] as const));
  const map = new Map<string, string[]>();

  for (const wiki of wikis) {
    const key = normalizeLookupKey(wiki.templateId || wiki.templateName);
    const templateName = templateNameByKey.get(key);
    if (!templateName) continue;
    const next = map.get(templateName) ?? [];
    next.push(wiki.slug || wiki.displayName || wiki.templateId || "");
    map.set(templateName, next.filter(Boolean));
  }

  return map;
}

function summarizePermissionRoles(value: string): string {
  return parsePermissionRows(value).map((row) => row.role).filter(Boolean).join(", ");
}

function deriveBagRecords(items: ItemsByTab, templates: AdminRecord[], wikis: AdminRecord[]): AdminRecord[] {
  const templateReadonlyUsage = new Map<string, Set<string>>();
  const wikiReadonlyUsage = new Map<string, Set<string>>();
  const wikiWritableUsage = new Map<string, Set<string>>();
  const wikiDefaultUsage = new Map<string, Set<string>>();

  const addUsage = (map: Map<string, Set<string>>, bagName: string, recordName: string) => {
    if (!bagName || !recordName) return;
    const next = map.get(bagName) ?? new Set<string>();
    next.add(recordName);
    map.set(bagName, next);
  };

  for (const template of templates) {
    const templateName = template.name ?? "";
    parseLineList(template.readonlyBags ?? "").forEach((bagName) => addUsage(templateReadonlyUsage, bagName, templateName));
  }

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    const templateRecord = findTemplateRecordForDraft(wiki, { ...items, templates, wikis });
    const effectiveReadonlyBags = uniqueLines([
      ...parseLineList(templateRecord?.readonlyBags ?? ""),
      ...parseLineList(wiki.readonlyBags ?? ""),
    ]);
    effectiveReadonlyBags.forEach((bagName) => addUsage(wikiReadonlyUsage, bagName, wikiName));

    const prefixRows = parseMappingRows(wiki.writablePrefixBags ?? "");
    prefixRows.forEach((row) => addUsage(wikiWritableUsage, row.right, wikiName));
    const defaultBag = prefixRows.find((row) => row.left === "")?.right ?? "";
    addUsage(wikiDefaultUsage, defaultBag, wikiName);
  }

  return items.bags.map((bag) => {
    const name = bag.name ?? "";
    const referencedByTemplates = Array.from(templateReadonlyUsage.get(name) ?? []);
    const referencedByWikis = Array.from(wikiReadonlyUsage.get(name) ?? new Set<string>());
    const writableByWikis = Array.from(wikiWritableUsage.get(name) ?? new Set<string>());
    const defaultByWikis = Array.from(wikiDefaultUsage.get(name) ?? new Set<string>());
    const routingRoles = uniqueLines([
      referencedByWikis.length ? "readonly layer" : "",
      writableByWikis.length ? "writable prefix target" : "",
      defaultByWikis.length ? "default writable target" : "",
    ]);
    const allUsingWikis = new Set<string>([
      ...referencedByWikis,
      ...writableByWikis,
      ...defaultByWikis,
    ]);

    return {
      ...bag,
      usedByCount: String(allUsingWikis.size),
      readonlyUsageCount: String(referencedByWikis.length),
      writableUsageCount: String(writableByWikis.length),
      defaultUsageCount: String(defaultByWikis.length),
      permissionSummary: summarizePermissionRoles(bag.permissions ?? ""),
      referencedByTemplates: referencedByTemplates.join("\n"),
      referencedByWikis: Array.from(allUsingWikis).join("\n"),
      routingRoles: routingRoles.join("\n"),
    };
  });
}

function derivePluginRecords(items: ItemsByTab, templates: AdminRecord[], wikis: AdminRecord[]): AdminRecord[] {
  const pluginUsage = new Map<string, Set<string>>();

  const addUsage = (pluginName: string, wikiName: string) => {
    if (!pluginName || !wikiName) return;
    const next = pluginUsage.get(pluginName) ?? new Set<string>();
    next.add(wikiName);
    pluginUsage.set(pluginName, next);
  };

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    parseLineList(wiki.effectivePluginSet ?? "").forEach((pluginValue) => {
      const pluginName = pluginValue.split("@")[0]?.trim() ?? pluginValue.trim();
      addUsage(pluginName, wikiName);
    });
  }

  return items.plugins.map((plugin) => {
    const usedByWikis = Array.from(pluginUsage.get(plugin.name ?? "") ?? []);
    return {
      ...plugin,
      usedByWikis: usedByWikis.join("\n"),
      usageCount: String(usedByWikis.length),
    };
  });
}

function deriveItems(items: ItemsByTab): ItemsByTab {
  const templates = items.templates.map((template) => syncRecord("templates", template, items));
  const templateContext: ItemsByTab = { ...items, templates };
  const wikis = items.wikis.map((wiki) => syncRecord("wikis", wiki, templateContext));
  const dependentWikiMap = buildTemplateDependentWikiMap(wikis, templates);

  const normalizedTemplates = templates.map((template) => {
    const dependentWikis = dependentWikiMap.get(template.name) ?? [];
    const readonlyBags = parseLineList(template.readonlyBags ?? "");
    const prefixRows = parseMappingRows(template.writablePrefixBags ?? "");
    const openParameters = parseLineList(template.openParameters ?? "");
    return {
      ...template,
      readonlyBagsSummary: readonlyBags.join(", "),
      writablePrefixSummary: formatPrefixSummary(template.writablePrefixBags ?? ""),
      openParameterSummary: openParameters.join(", "),
      dependentWikis: dependentWikis.join("\n"),
      dependentWikiCount: String(dependentWikis.length),
      defaultWritableBag: prefixRows.find((row) => row.left === "")?.right ?? "",
    };
  });

  const derivedContext: ItemsByTab = {
    ...items,
    templates: normalizedTemplates,
    wikis,
  };

  return {
    ...derivedContext,
    bags: deriveBagRecords(derivedContext, normalizedTemplates, wikis),
    plugins: derivePluginRecords(derivedContext, normalizedTemplates, wikis),
  };
}

function getInitialItems(): ItemsByTab {

  const sampleStoreData: DataStore = {
    wikis: {
      "0": {
        id: "0",
        slug: "engineering-hub",
        displayName: "Engineering Hub",
        description: "Shared engineering wiki with namespace routing for specs, drafts, and user notes.",
        templateId: "Workspace Template",
        readonlyBags: "",
        plugins: "",
        writablePrefixBags: "Docs/ -> bag-docs\nDrafts/ -> bag-drafts\nUsers/ -> bag-user-space\n(empty) -> bag-engineering-main",
        parameters: '{\n  "userPartitionPrefix": "Users/alex/",\n  "channel": "stable"\n}',
        recipePermissions: "editors:B_write\nviewers:A_read",
        titleResolutionPreview: "Enter a title to preview resolver output.",
      },
      "1": {
        id: "1",
        slug: "plugin-lab",
        displayName: "Plugin Lab",
        description: "Sandbox for draft plugin work and package previews.",
        templateId: "Plugin Sandbox",
        readonlyBags: "",
        plugins: "",
        writablePrefixBags: "Plugins/ -> bag-plugin-lab\n(empty) -> bag-plugin-lab",
        parameters: '{\n  "channel": "draft"\n}',
        recipePermissions: "plugin-authors:B_write\nqa:A_read",
        titleResolutionPreview: "Enter a title to preview resolver output.",
      },
    },
    templates: {
      "0": {
        id: "0",
        name: "Workspace Template",
        description: "General-purpose workspace wiki with namespace-based write routing.",
        readonlyBags: "bag-shared-specs\nbag-shared-archive\nbag-policy",
        writablePrefixBags: "Docs/ -> bag-docs\nDrafts/ -> bag-drafts\nUsers/ -> bag-user-space\n(empty) -> bag-engineering-main",
        plugins: "workspace-shell\nteam-presets\nsearch-tools",
        requiredPluginsEnabled: "enabled",
        customHtmlEnabled: "disabled",
        htmlContent: "",
        injectionArray: "$tw.preloadTiddlers",
        injectionLocation: "",
      },
      "1": {
        id: "1",
        name: "Plugin Sandbox",
        description: "Draft-heavy workspace for plugin authoring and review.",
        readonlyBags: "bag-plugin-base\nbag-plugin-archive",
        writablePrefixBags: "Plugins/ -> bag-plugin-lab\n(empty) -> bag-plugin-lab",
        plugins: "plugin-devtools\nsyntax-tools\nworkspace-shell",
        requiredPluginsEnabled: "disabled",
        customHtmlEnabled: "enabled",
        htmlContent: "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Plugin Sandbox</title>\n</head>\n<body>\n  <!-- INJECT STORE TIDDLERS HERE -->\n</body>\n</html>",
        injectionArray: "$tw.preloadTiddlers",
        injectionLocation: "<!-- INJECT STORE TIDDLERS HERE -->",
      },
    },
    bags: {
      "0": {
        id: "0",
        name: "bag-engineering-main",
        description: "Primary write target for engineering wiki content.",
        permissions: "admin:C_admin\neditors:B_write\nviewers:A_read",
      },
      "1": {
        id: "1",
        name: "bag-shared-specs",
        description: "Readonly canonical specs consumed across multiple workspaces.",
        permissions: "admin:C_admin\neditors:A_read\nviewers:A_read",
      },
    },
    plugins: {
      "0": {
        id: "0",
        name: "workspace-shell",
        version: "2.4.0",
        status: "published",
        description: "Shared shell chrome, navigation, and layout helpers for workspace wikis.",
        publishFromDraft: "No draft promotion available",
      },
      "1": {
        id: "1",
        name: "plugin-devtools",
        version: "0.4.0-draft",
        status: "draft",
        description: "Draft developer tooling for plugin workbench and inspection views.",
        publishFromDraft: "Publish as 0.4.0",
      },
    },
  };

  return cloneItems(deriveItems(toItemsByTab(sampleStoreData)));
}

function getEmptyItems(): ItemsByTab {
  return {
    wikis: [],
    templates: [],
    bags: [],
    plugins: [],
  };
}

function cloneItems(items: ItemsByTab): ItemsByTab {
  return {
    wikis: items.wikis.map((item) => ({ ...item })),
    templates: items.templates.map((item) => ({ ...item })),
    bags: items.bags.map((item) => ({ ...item })),
    plugins: items.plugins.map((item) => ({ ...item })),
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

class InMemoryAdminStorage implements AdminStorage {
  constructor(private data: DataStore) {
    this.data = data;
  }

  public async loadAll(): Promise<ItemsByTab> {
    await wait(300);
    return cloneItems(deriveItems(toItemsByTab(this.data)));
  }

  public async read(tabId: TabId, id: string): Promise<AdminRecord | null> {
    await wait(300);
    const item = deriveItems(toItemsByTab(this.data))[tabId].find((record) => record.id === id);
    return item ? { ...item } : null;
  }

  public async save(tabId: TabId, record: AdminRecord): Promise<AdminRecord[]> {
    await wait(300);
    const currentTabRecords = toItemArray(tabId, this.data[tabId]);
    const storedRecord = pruneStoredRecord(tabId, record, currentTabRecords.length);
    const id = storedRecord.id;
    this.data = {
      ...this.data,
      [tabId]: {
        ...this.data[tabId],
        [id]: { ...storedRecord, id },
      },
    };
    return deriveItems(toItemsByTab(this.data))[tabId].map((item) => ({ ...item }));
  }
}

const adminStorage: AdminStorage = new InMemoryAdminStorage(toDataStore(getInitialItems()));

function getFieldKeys(tab: TabDefinition): string[] {
  return Array.from(new Set([
    "id",
    ...tab.columns.map((column) => column.key),
    ...tab.fields.map((field) => field.key),
  ]));
}

function createDraft(tab: TabDefinition, source?: AdminRecord): AdminRecord {
  const draft = getFieldKeys(tab).reduce<AdminRecord>((nextDraft, key) => {
    nextDraft[key] = source?.[key] ?? "";
    return nextDraft;
  }, {});

  if (!source && tab.id === "templates") {
    draft.type = "basic";
    draft.requiredPluginsEnabled = "enabled";
    draft.customHtmlEnabled = "disabled";
    draft.injectionArray = "$tw.preloadTiddlers";
  }

  return draft;
}

function isEditable(field: FieldDefinition, mode: ModalMode): boolean {
  if (!field.mode) return false;
  if (field.mode === "create edit") return true;
  if (field.mode === "create") return mode === "create";
  return field.mode === "edit" && mode === "edit";
}

function getPrimaryValue(tab: TabDefinition, item: AdminRecord): string {
  const primaryKey = tab.columns[0]?.key ?? tab.fields[0]?.key;
  return formatFieldValue(item[primaryKey]);
}

function getCreateLabel(tabId: TabId): string {
  switch (tabId) {
    case "wikis":
      return "Create wiki";
    case "templates":
      return "Create template";
    case "bags":
      return "Create bag";
    case "plugins":
      return "Create plugin";
  }
}

function getSelectOptions(field: FieldDefinition, itemsByTab: ItemsByTab): string[] {
  if (field.key === "status") return ["draft", "published", "archived"];
  if (field.key === "requiredPluginsEnabled" || field.key === "customHtmlEnabled") return ["enabled", "disabled"];
  if (field.key === "templateId") {
    return Array.from(new Set(itemsByTab.templates.map((item) => item.name).filter(Boolean)));
  }
  return [];
}

function getAutocompleteOptions(field: FieldDefinition, itemsByTab: ItemsByTab): string[] {
  if (field.key === "templateId") {
    return Array.from(new Set([
      ...itemsByTab.templates.map((item) => item.name),
      ...itemsByTab.wikis.map((item) => item.templateId),
    ].filter(Boolean)));
  }
  return [];
}

function getLookupOptions(fieldKey: string, itemsByTab: ItemsByTab): string[] {
  if (fieldKey === "templateId") return getAutocompleteOptions({ key: fieldKey } as FieldDefinition, itemsByTab);
  if (fieldKey === "readonlyBags" || fieldKey === "writablePrefixBags") {
    return Array.from(new Set(itemsByTab.bags.map((item) => item.name).filter(Boolean)));
  }
  if (fieldKey === "plugins") {
    return Array.from(new Set(itemsByTab.plugins.map((item) => item.name).filter(Boolean)));
  }
  if (fieldKey === "permissions" || fieldKey === "recipePermissions") {
    return Array.from(new Set([
      ...itemsByTab.bags.flatMap((item) => parsePermissionRows(item.permissions ?? "").map((row) => row.role)),
      ...itemsByTab.wikis.flatMap((item) => parsePermissionRows(item.recipePermissions ?? "").map((row) => row.role)),
    ].filter(Boolean)));
  }
  return [];
}

function getPermissionLevelsForField(fieldKey: string): PermissionLevel[] | RecipePermissionLevel[] {
  return fieldKey === "recipePermissions" ? recipePermissionLevels : bagPermissionLevels;
}

function getMissingDependencyLines(field: FieldDefinition, value: string, itemsByTab?: ItemsByTab): MissingDependencyLine[] | null {
  if (!itemsByTab) return null;
  if (field.key !== "effectiveBagOrder" && field.key !== "effectivePluginSet") return null;

  const lines = parseLineList(value);
  const availableNames = new Set(
    (field.key === "effectiveBagOrder" ? itemsByTab.bags : itemsByTab.plugins)
      .map((item) => item.name)
      .filter(Boolean),
  );

  return lines.map((line) => {
    const normalizedValue = field.key === "effectiveBagOrder"
      ? line.replace(/^\d+\.\s*/, "").trim()
      : line.split("@")[0]?.trim() ?? line.trim();

    return {
      value: line,
      missing: normalizedValue ? !availableNames.has(normalizedValue) : false,
    };
  });
}

function formatPermissionLevel(level: string): string {
  return level.replace(/^[A-Z]_/, "");
}

function getFieldSection(field: FieldDefinition): FieldSection {
  return field.section ?? (field.type === "action" ? "operations" : field.mode ? "authored" : "runtime");
}

function getSectionFields(tab: TabDefinition, section: FieldSection): FieldDefinition[] {
  if (tab.id === "wikis" && section === "runtime") return [];
  if (tab.id === "templates" && section === "runtime") return [];
  return tab.fields.filter((field) => {
    return getFieldSection(field) === section;
  });
}

function getSectionHeading(section: FieldSection, mode: ModalMode) {
  if (section === "authored") {
    return null;
  }
  if (section === "runtime") {
    return {
      title: "Resolved and derived state",
      copy: "These values come from compilation, relationships, or runtime projections. They explain what the system will do, not what the editor writes directly.",
    };
  }
  return {
    title: "Operations and diagnostics",
    copy: "These controls run checks or actions against the current record instead of defining stored configuration.",
  };
}

function getSectionSummary(section: FieldSection): string {
  if (section === "authored") return "";
  if (section === "runtime") return "Resolved outputs";
  return "Actions";
}

function getFieldGroups(tabId: TabId, section: FieldSection, fields: FieldDefinition[]): FieldGroupDefinition[] {
  const fallback = fields.map((field) => ({ keys: [field.key], width: "half" as const }));

  if (section === "authored") {
    if (tabId === "templates") {
      return [
        { title: "Template basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
        { title: "Writable routing", description: "Define the template-level default and prefix-based write targets that dependent wikis inherit before applying their own overrides.", keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", keys: ["plugins", "requiredPluginsEnabled"], width: halfWidth, layout: stackLayout },
        { title: "Custom HTML shell", keys: ["htmlContent", "injectionArray", "injectionLocation"], headerFieldKey: "customHtmlEnabled", disabledWhenHeaderOff: true, width: fullWidth, layout: stackLayout },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
    if (tabId === "wikis") {
      return [
        { title: "Wiki identity", description: "Name the wiki, describe it, and choose the template that provides its base routing model.", keys: ["slug", "displayName", "description", "templateId"], width: fullWidth, layout: stackLayout },
        { title: "Writable routing", description: "Define the wiki-specific write targets for title prefixes, including the default fallback bag.", keys: ["writablePrefixBags"], width: fullWidth },
        { title: "Bags", description: "Add wiki-specific readonly bags on top of anything inherited from the template.", keys: ["readonlyBags"], width: halfWidth },
        { title: "Plugins", description: "Add wiki-specific plugins on top of the template plugin set.", keys: ["plugins"], width: halfWidth },
        { title: "Access", description: "Control who can access the wiki surface itself. Bag access is handled separately on the participating bags.", keys: ["recipePermissions"], width: fullWidth },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
    if (tabId === "bags") {
      return [
        { title: "Bag basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
        { keys: ["permissions"], width: fullWidth },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
    if (tabId === "plugins") {
      return [
        { title: "Plugin basics", keys: ["name", "description"], width: fullWidth, layout: stackLayout },
        { title: "Release details", keys: ["version", "status"], width: halfWidth },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
  }

  if (section === "runtime") {
    if (tabId === "templates") {
      return [
        { keys: ["defaultWritableBag"], width: halfWidth },
        { keys: ["openParameters"], width: halfWidth },
        { keys: ["dependentWikis"], width: halfWidth },
        { keys: ["validationResult"], width: halfWidth },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
    if (tabId === "wikis") {
      return [
        { title: "Compilation status", description: "Validation and compilation outcome for the current authored state.", keys: ["compileValidation"], width: fullWidth },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
    if (tabId === "bags") {
      return [
        { keys: ["referencedByTemplates"], width: halfWidth },
        { keys: ["referencedByWikis"], width: halfWidth },
        { keys: ["routingRoles"], width: halfWidth },
        { keys: ["tiddlerCount"], width: halfWidth },
        { keys: ["recentActivity"], width: fullWidth },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
  }

  if (section === "operations") {
    if (tabId === "wikis") {
      return [
        {
          title: "Title routing test",
          description: "Test a title against the wiki's current prefix rules to see which bag would receive writes.",
          keys: ["titleResolutionPreview"],
          width: fullWidth,
        },
      ].filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
    }
  }

  return fallback;
}

function getSummaryColumns(tab: TabDefinition): ColumnDefinition[] {
  return tab.columns.slice(0, 6);
}

function normalizeLookupKey(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^tmpl-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findTemplateRecordForDraft(draft: AdminRecord, itemsByTab: ItemsByTab): AdminRecord | undefined {
  const lookupKeys = [draft.templateId, draft.templateName]
    .map((value) => normalizeLookupKey(value))
    .filter(Boolean);

  if (!lookupKeys.length) return undefined;

  return itemsByTab.templates.find((template) => lookupKeys.includes(normalizeLookupKey(template.name)));
}

function uniqueLines(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildEffectiveBagStack({
  writablePrefixBags,
  templateReadonlyBags,
  wikiReadonlyBags,
}: {
  writablePrefixBags: string;
  templateReadonlyBags: string[];
  wikiReadonlyBags: string[];
}): string[] {
  const prefixRows = parseMappingRows(writablePrefixBags);
  const defaultTargets = prefixRows.filter((row) => row.left === "").map((row) => row.right);
  const prefixedTargets = prefixRows.filter((row) => row.left !== "").map((row) => row.right);
  return uniqueLines([
    ...defaultTargets,
    ...prefixedTargets,
    ...templateReadonlyBags,
    ...wikiReadonlyBags,
  ]);
}

function buildEffectivePluginSet({
  previousEffectivePlugins,
  templatePlugins,
  wikiPlugins,
  corePluginsEnabled,
}: {
  previousEffectivePlugins: string[];
  templatePlugins: string[];
  wikiPlugins: string[];
  corePluginsEnabled: boolean;
}): string[] {
  const authoredPlugins = uniqueLines([...templatePlugins, ...wikiPlugins]);
  const runtimeManagedPlugins = previousEffectivePlugins.filter((plugin) => !authoredPlugins.includes(plugin));
  const corePlugins = corePluginsEnabled
    ? runtimeManagedPlugins.filter((plugin) => /core/i.test(plugin))
    : [];
  const requiredPlugins = runtimeManagedPlugins.filter((plugin) => !corePlugins.includes(plugin));

  return uniqueLines([
    ...corePlugins,
    ...requiredPlugins,
    ...templatePlugins,
    ...wikiPlugins,
  ]);
}

function syncRecord(tabId: TabId, draft: AdminRecord, itemsByTab: ItemsByTab): AdminRecord {
  if (tabId === "wikis") {
    const normalizedWritablePrefixBags = normalizeWritablePrefixBags(draft.writablePrefixBags ?? "");
    const templateRecord = findTemplateRecordForDraft(draft, itemsByTab);
    const templateReadonlyBags = templateRecord ? parseLineList(templateRecord.readonlyBags ?? "") : [];
    const templatePlugins = templateRecord ? parseLineList(templateRecord.plugins ?? "") : [];
    const wikiReadonlyBags = parseLineList(draft.readonlyBags ?? "");
    const wikiPlugins = parseLineList(draft.plugins ?? "");
    const mergedReadonlyBags = uniqueLines([...templateReadonlyBags, ...wikiReadonlyBags]);
    const mergedPlugins = buildEffectivePluginSet({
      previousEffectivePlugins: parseLineList(draft.effectivePluginSet ?? ""),
      templatePlugins,
      wikiPlugins,
      corePluginsEnabled: templateRecord?.requiredPluginsEnabled !== "disabled",
    });
    const prefixRows = parseMappingRows(normalizedWritablePrefixBags);
    const defaultWritableBag = prefixRows.find((row) => row.left === "")?.right ?? "";
    const prefixRuleCount = String(prefixRows.length);
    const readableBagOrder = buildEffectiveBagStack({
      writablePrefixBags: normalizedWritablePrefixBags,
      templateReadonlyBags,
      wikiReadonlyBags,
    });
    const availableBagNames = new Set(itemsByTab.bags.map((bag) => bag.name).filter(Boolean));
    const availablePluginNames = new Set(itemsByTab.plugins.map((plugin) => plugin.name).filter(Boolean));
    const missingBags = readableBagOrder.filter((bagName) => !availableBagNames.has(bagName));
    const missingPlugins = mergedPlugins.filter((pluginName) => !availablePluginNames.has(pluginName));
    const hasMissingDependencies = missingBags.length > 0 || missingPlugins.length > 0;
    const missingMessages = [
      missingBags.length ? `Missing bags: ${missingBags.join(", ")}` : "",
      missingPlugins.length ? `Missing plugins: ${missingPlugins.join(", ")}` : "",
    ].filter(Boolean);
    const compileValidation = hasMissingDependencies
      ? `Alert. ${missingMessages.join(". ")}.`
      : "Valid. All referenced bags and plugins are present.";
    const statusFlags = hasMissingDependencies ? "alert, missing dependencies" : "compiled, dependencies resolved";

    return {
      ...draft,
      writablePrefixBags: normalizedWritablePrefixBags,
      templateName: templateRecord?.name ?? draft.templateId,
      defaultWritableBag,
      readonlyBagCount: String(mergedReadonlyBags.length),
      prefixRuleCount,
      pluginCount: String(mergedPlugins.length),
      effectiveBagOrder: readableBagOrder.map((bag, index) => `${index + 1}. ${bag}`).join("\n"),
      effectivePluginSet: mergedPlugins.join("\n"),
      compileValidation,
      statusFlags,
    };
  }

  if (tabId !== "templates") return { ...draft };

  const normalizedWritablePrefixBags = normalizeWritablePrefixBags(draft.writablePrefixBags ?? "");

  const readonlyBags = draft.readonlyBags
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const prefixRows = normalizedWritablePrefixBags
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const writablePrefixBags = prefixRows.reduce<Record<string, string>>((acc, row) => {
    const [prefixText, bagText] = row.split("->").map((part) => part?.trim() ?? "");
    if (!bagText) return acc;
    const prefix = prefixText === "(empty)" ? "" : prefixText;
    acc[prefix] = bagText;
    return acc;
  }, {});

  const prefixSummary = Object.keys(writablePrefixBags).map((prefix) => prefix || "default").join(", ");
  const defaultWritableBag = writablePrefixBags[""] ?? "";

  return {
    ...draft,
    writablePrefixBags: normalizedWritablePrefixBags,
    definition: JSON.stringify({ readonlyBags, writablePrefixBags }, null, 2),
    readonlyBagsSummary: readonlyBags.join(", "),
    writablePrefixSummary: prefixSummary,
    defaultWritableBag,
  };
}

function parseLineList(value: string): string[] {
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean);
}

function serializeLineList(lines: string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join("\n");
}

function parseMappingRows(value: string): MappingRow[] {
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean).map((row) => {
    const [left, right] = row.split("->").map((part) => part?.trim() ?? "");
    return {
      left: left === "(empty)" ? "" : left,
      right,
    };
  });
}

function parseEditableMappingRows(value: string): MappingRow[] {
  return value.split("\n").map((entry) => {
    const separatorIndex = entry.indexOf("->");
    if (separatorIndex === -1) {
      return {
        left: entry,
        right: "",
      };
    }

    const left = entry.slice(0, separatorIndex).replace(/ $/, "");
    const right = entry.slice(separatorIndex + 2).replace(/^ /, "");

    return {
      left: left === "(empty)" ? "" : left,
      right: right.trim(),
    };
  }).filter((row) => row.left || row.right);
}

function serializeMappingRows(rows: MappingRow[]): string {
  return rows
    .map((row) => ({ left: row.left.trim(), right: row.right.trim() }))
    .filter((row) => row.left || row.right)
    .map((row) => `${row.left || "(empty)"} -> ${row.right}`)
    .join("\n");
}

function serializeEditableMappingRows(rows: MappingRow[]): string {
  return rows
    .map((row) => ({ left: row.left, right: row.right.trim() }))
    .filter((row) => row.left || row.right)
    .map((row) => `${row.left || "(empty)"} -> ${row.right}`)
    .join("\n");
}

function normalizeWritablePrefixBags(value: string): string {
  return serializeMappingRows(parseEditableMappingRows(value));
}

function parsePermissionRows(value: string): PermissionRow[] {
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean).map((row) => {
    const [role, levelText] = row.split(":").map((part) => part?.trim() ?? "");
    const allPermissionLevels = [...bagPermissionLevels];
    const level = allPermissionLevels.includes(levelText as PermissionLevel) ? levelText as PermissionLevel : "A_read";
    return { role, level };
  });
}

function serializePermissionRows(rows: PermissionRow[]): string {
  return rows
    .map((row) => ({ role: row.role.trim(), level: row.level }))
    .filter((row) => row.role)
    .map((row) => `${row.role}:${row.level}`)
    .join("\n");
}

function parseJsonObjectRows(value: string): KeyValueRow[] {
  try {
    const parsed = JSON.parse(value || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([key, entryValue]) => ({ key, value: String(entryValue) }));
    }
  } catch {
    // fall back to an empty structured editor if the JSON is not currently parseable
  }
  return [];
}

function serializeJsonObjectRows(rows: KeyValueRow[]): string {
  const next = rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    if (!key) return acc;
    acc[key] = row.value;
    return acc;
  }, {});
  return JSON.stringify(next, null, 2);
}

function parseBagOrder(value: string): string[] {
  return parseLineList(value).map((line) => line.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
}

function canWriteRecipe(value: string): boolean {
  return parseLineList(value).some((row) => row.includes(":B_write"));
}

function computeResolverPreview(draft: AdminRecord, title: string) {
  const normalizedTitle = title.trim();
  const targets = parseMappingRows(draft.writablePrefixBags ?? "").filter((row) => row.right).sort((a, b) => b.left.length - a.left.length);
  const writeTarget = normalizedTitle
    ? (targets.find((target) => target.left && normalizedTitle.startsWith(target.left)) ?? targets.find((target) => target.left === ""))
    : undefined;
  return {
    title: normalizedTitle,
    writeTo: writeTarget?.right ?? "No writable target",
    matchedPrefix: writeTarget ? (writeTarget.left || "default") : "none",
  };
}

function hasTrimMismatch(value: string): boolean {
  return value.trim() !== value;
}

function formatFieldValue(value: string | undefined): string {
  return value && value.trim() ? value : "—";
}

function renderListCellValue(columnKey: string, value: string | undefined) {
  const formattedValue = formatFieldValue(value);

  if (columnKey === "statusFlags" && value?.toLowerCase().includes("alert")) {
    return (
      <span class="missing-marker" aria-label={formattedValue} title={formattedValue}>
        <MaterialSymbol icon={warningIcon} />
      </span>
    );
  }

  return formattedValue;
}

function countValueLines(value: string | undefined): number {
  return parseLineList(value ?? "").length;
}

function getSidebarFacts(tabId: TabId, draft: AdminRecord): Array<{ label: string; value: string; }> {
  if (tabId === "wikis") {
    return [
      { label: "Template", value: formatFieldValue(draft.templateId || draft.templateName) },
      { label: "Default bag", value: formatFieldValue(draft.defaultWritableBag) },
      { label: "Compiled", value: formatFieldValue(draft.lastCompiledAt) },
    ];
  }

  if (tabId === "templates") {
    return [
      { label: "Readonly bags", value: String(countValueLines(draft.readonlyBags)) },
      { label: "Prefix rules", value: String(parseMappingRows(draft.writablePrefixBags ?? "").length || 0) },
      { label: "Default bag", value: formatFieldValue(draft.defaultWritableBag) },
      { label: "Plugins", value: String(countValueLines(draft.plugins)) },
      { label: "Validation", value: formatFieldValue(draft.validationStatus || draft.validationResult) },
    ];
  }

  if (tabId === "bags") {
    return [
      { label: "Permission roles", value: String(parsePermissionRows(draft.permissions ?? "").length || 0) },
      { label: "Referenced by templates", value: String(countValueLines(draft.referencedByTemplates)) },
      { label: "Referenced by wikis", value: String(countValueLines(draft.referencedByWikis)) },
      { label: "Routing roles", value: String(countValueLines(draft.routingRoles)) },
      { label: "Tiddlers", value: formatFieldValue(draft.tiddlerCount) },
      { label: "Last activity", value: formatFieldValue(draft.lastActivityAt) },
    ];
  }

  return [
    { label: "Version", value: formatFieldValue(draft.version) },
    { label: "Status", value: formatFieldValue(draft.status) },
    { label: "Used by wikis", value: String(countValueLines(draft.usedByWikis)) },
    { label: "Usage count", value: formatFieldValue(draft.usageCount) },
    { label: "Draft of", value: formatFieldValue(draft.draftOf) },
    { label: "Updated", value: formatFieldValue(draft.updatedAt) },
  ];
}

@customElement("mws-readonly-field")
class ReadonlyFieldElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: ReadonlyFieldProps;

  protected render() {
    const { field, value, itemsByTab } = this.props;
    const lines = parseLineList(value);
    const missingDependencyLines = getMissingDependencyLines(field, value, itemsByTab);

    switch (field.type) {
      case "reference":
        return <div class="pill-value">{formatFieldValue(value)}</div>;
      case "parameter-list":
      case "relationship-table":
      case "summary-list":
        return <ul class="value-list">{lines.map((line) => <li>{line}</li>)}</ul>;
      case "activity-feed":
        return <ul class="timeline-list">{lines.map((line) => <li>{line}</li>)}</ul>;
      case "metadata-table":
        return <dl class="meta-list">{lines.map((line) => {
          const [key, ...rest] = line.split(":");
          return <><dt>{key}</dt><dd>{rest.join(":").trim()}</dd></>;
        })}</dl>;
      case "table":
        if (missingDependencyLines) {
          if (missingDependencyLines.every((line) => /^\d+\./.test(line.value))) {
            return (
              <ol class="value-ordered-list dependency-list">
                {missingDependencyLines.map((line) => (
                  <li class={line.missing ? "is-missing" : ""}>
                    {line.value.replace(/^\d+\.\s*/, "")}
                    {line.missing ? <span class="missing-marker" aria-label="Missing dependency" title="Missing dependency"><MaterialSymbol icon={warningIcon} /></span> : null}
                  </li>
                ))}
              </ol>
            );
          }

          return (
            <ul class="value-list dependency-list">
              {missingDependencyLines.map((line) => (
                <li class={line.missing ? "is-missing" : ""}>
                  {line.value}
                  {line.missing ? <span class="missing-marker" aria-label="Missing dependency" title="Missing dependency"><MaterialSymbol icon={warningIcon} /></span> : null}
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\./.test(line))) {
          return <ol class="value-ordered-list">{lines.map((line) => <li>{line.replace(/^\d+\.\s*/, "")}</li>)}</ol>;
        }
        return <ul class="value-list">{lines.map((line) => <li>{line}</li>)}</ul>;
      case "structured-preview":
      case "validation-report":
        return <div class="field-callout"><p>{formatFieldValue(value)}</p></div>;
      default:
        return (
          <div class="field-value">
            <pre>{formatFieldValue(value)}</pre>
          </div>
        );
    }
  }
}

@customElement("mws-field-editor")
class FieldEditorElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: FieldEditorProps;

  protected render() {
    const {
      field,
      value,
      disabled,
      modalState,
      itemsByTab,
      onDraftChange,
      onPendingRowsChange,
      onTransientPermissionRowsChange,
      onResolverTitleChange,
      onTriggerOperation,
    } = this.props;

    const inputId = `field-${field.key}`;

    const updateLineValueAt = (index: number, nextValue: string) => {
      const lines = parseLineList(value);
      const hadStoredRow = index < lines.length;
      while (lines.length <= index) lines.push("");
      lines[index] = nextValue;
      onDraftChange(field.key, serializeLineList(lines));
      if (!hadStoredRow && nextValue.trim()) onPendingRowsChange(field.key, (count) => count - 1);
    };

    const removeLineValueAt = (index: number) => {
      const lines = parseLineList(value);
      if (index >= lines.length) {
        onPendingRowsChange(field.key, (count) => count - 1);
        return;
      }
      lines.splice(index, 1);
      onDraftChange(field.key, serializeLineList(lines));
    };

    const editableLines = parseLineList(value);
    const mappingRows = parseEditableMappingRows(value);
    const permissionRows = parsePermissionRows(value);
    const parameterRows = parseJsonObjectRows(value);
    const pendingRowCount = modalState.pendingRows[field.key] ?? 0;
    const lookupOptions = getLookupOptions(field.key, itemsByTab);
    const templateRecord = modalState.tabId === "wikis" ? findTemplateRecordForDraft(modalState.draft, itemsByTab) : undefined;
    const templateReadonlyBagLines = field.key === "readonlyBags" && templateRecord ? parseLineList(templateRecord.readonlyBags ?? "") : [];
    const templatePluginLines = field.key === "plugins" && templateRecord ? parseLineList(templateRecord.plugins ?? "") : [];
    const templateCorePluginsEnabled = templateRecord?.requiredPluginsEnabled !== "disabled";

    const renderSearchableInput = ({ id, currentValue, placeholder, options, onInput }: {
      id: string;
      currentValue: string;
      placeholder: string;
      options: string[];
      onInput: (nextValue: string) => void;
    }) => {
      const datalistId = `${id}-options`;
      return (
        <>
          <input
            id={id}
            class="field-input"
            type="text"
            value={currentValue}
            disabled={disabled}
            ref={(element) => {
              if (element.value !== currentValue) element.value = currentValue;
            }}
            placeholder={placeholder}
            list={options.length ? datalistId : undefined}
            oninput={(event) => onInput((event.currentTarget as HTMLInputElement).value)}
          />
          {options.length ? (
            <datalist id={datalistId}>
              {options.map((option) => <option value={option} />)}
            </datalist>
          ) : null}
        </>
      );
    };

    switch (field.type) {
      case "string":
      case "version":
        return <input id={inputId} class="field-input" type="text" value={value} ref={(element) => {
          if (element.value !== value) element.value = value;
        }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).value)} />;
      case "number":
        return <input id={inputId} class="field-input" type="number" value={value} ref={(element) => {
          if (element.value !== value) element.value = value;
        }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).value)} />;
      case "text":
        return <textarea id={inputId} class="field-textarea" rows={4} ref={(element) => {
          if (element.value !== value) element.value = value;
        }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
      case "json-editor":
        if (field.key === "parameters") {
          const displayedParameterRows = parameterRows.length
            ? [...parameterRows, ...Array.from({ length: pendingRowCount }, () => ({ key: "", value: "" }))]
            : [{ key: "", value: "" }, ...Array.from({ length: pendingRowCount }, () => ({ key: "", value: "" }))];
          return (
            <div class="row-editor-stack">
              <p class="field-helper">Enter only the per-wiki values the selected template leaves open.</p>
              {displayedParameterRows.map((row, index) => (
                <div class="row-editor-row row-editor-row-wide">
                  <input class="field-input" type="text" value={row.key} placeholder="Parameter name" disabled={disabled} oninput={(event) => {
                    const element = event.currentTarget as HTMLInputElement;
                    const hadStoredRow = index < parameterRows.length;
                    const nextRows = parameterRows.length ? [...parameterRows] : [{ key: "", value: "" }];
                    nextRows[index] = { ...row, key: element.value };
                    onDraftChange(field.key, serializeJsonObjectRows(nextRows));
                    if (!hadStoredRow && (element.value.trim() || row.value.trim())) onPendingRowsChange(field.key, (count) => count - 1);
                  }} ref={(element) => {
                    if (element.value !== row.key) element.value = row.key;
                  }} />
                  <input class="field-input" type="text" value={row.value} placeholder="Value" disabled={disabled} oninput={(event) => {
                    const element = event.currentTarget as HTMLInputElement;
                    const hadStoredRow = index < parameterRows.length;
                    const nextRows = parameterRows.length ? [...parameterRows] : [{ key: "", value: "" }];
                    nextRows[index] = { ...row, value: element.value };
                    onDraftChange(field.key, serializeJsonObjectRows(nextRows));
                    if (!hadStoredRow && (row.key.trim() || element.value.trim())) onPendingRowsChange(field.key, (count) => count - 1);
                  }} ref={(element) => {
                    if (element.value !== row.value) element.value = row.value;
                  }} />
                  <button type="button" class="row-action-button" disabled={disabled} onclick={() => {
                    if (index >= parameterRows.length) {
                      onPendingRowsChange(field.key, (count) => count - 1);
                      return;
                    }
                    const nextRows = parameterRows.length ? [...parameterRows] : [];
                    nextRows.splice(index, 1);
                    onDraftChange(field.key, serializeJsonObjectRows(nextRows));
                  }}>Remove</button>
                </div>
              ))}
              <button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>Add parameter</button>
            </div>
          );
        }
        return <textarea id={inputId} class="field-textarea is-code" rows={8} ref={(element) => {
          if (element.value !== value) element.value = value;
        }} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
      case "search-multiselect": {
        const displayedLines = editableLines.length
          ? [...editableLines, ...Array.from({ length: pendingRowCount }, () => "")]
          : ["", ...Array.from({ length: pendingRowCount }, () => "")];
        return (
          <div class="row-editor-stack">
            {displayedLines.map((line, index) => (
              <div class="row-editor-row">
                {renderSearchableInput({
                  id: `${inputId}-${index}`,
                  currentValue: line,
                  placeholder: field.key === "plugins" ? "Plugin name" : "Bag name",
                  options: lookupOptions,
                  onInput: (nextValue) => updateLineValueAt(index, nextValue),
                })}
                <button type="button" class="row-action-button" disabled={disabled} onclick={() => removeLineValueAt(index)}>Remove</button>
              </div>
            ))}
            <button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>{field.key === "plugins" ? "Add plugin" : "Add bag"}</button>
            {field.key === "readonlyBags" && modalState.tabId === "wikis" && templateRecord ? (
              <div class="field-callout">
                <p>Template readonly bags</p>
                <ul class="value-list">
                  {templateReadonlyBagLines.length ? templateReadonlyBagLines.map((bag) => <li>{bag}</li>) : <li>No template readonly bags</li>}
                </ul>
              </div>
            ) : null}
            {field.key === "plugins" && modalState.tabId === "wikis" && templateRecord ? (
              <div class="field-callout">
                <p>Template plugins</p>
                <ul class="value-list">
                  {templatePluginLines.map((plugin) => <li>{plugin}</li>)}
                  {templateCorePluginsEnabled ? <li>core plugins</li> : <li>core plugins disabled</li>}
                </ul>
              </div>
            ) : null}
          </div>
        );
      }
      case "permission-table": {
        const availableLevels = getPermissionLevelsForField(field.key);
        const transientPermissionRows = modalState.transientPermissionRows[field.key] ?? [];
        const displayedPermissionRows = permissionRows.length || transientPermissionRows.length
          ? [...permissionRows, ...transientPermissionRows]
          : [{ role: "", level: availableLevels[0] as PermissionLevel }];

        const persistPermissionRows = (rows: PermissionRow[]) => {
          const persistedRows = rows.filter((row) => row.role.trim());
          const nextTransientRows = rows.filter((row) => !row.role.trim());
          onDraftChange(field.key, serializePermissionRows(persistedRows));
          onTransientPermissionRowsChange(field.key, nextTransientRows);
        };

        return (
          <div class="row-editor-stack">
            {displayedPermissionRows.map((row, index) => (
              <div key={`${field.key}-permission-${index}`} class="row-editor-row row-editor-row-wide row-editor-row-permission">
                {renderSearchableInput({
                  id: `${inputId}-${index}-role`,
                  currentValue: row.role,
                  placeholder: "Role",
                  options: lookupOptions,
                  onInput: (nextValue) => {
                    const nextRows = [...displayedPermissionRows];
                    nextRows[index] = { ...row, role: nextValue };
                    persistPermissionRows(nextRows);
                  },
                })}
                <select class="field-select" onchange={(event) => {
                  if (disabled) return;
                  const nextRows = [...displayedPermissionRows];
                  nextRows[index] = { ...row, level: (event.currentTarget as HTMLSelectElement).value as PermissionLevel };
                  persistPermissionRows(nextRows);
                }} disabled={disabled}>
                  {availableLevels.map((level) => <option key={`${field.key}-${index}-${level}`} value={level} selected={level === row.level}>{formatPermissionLevel(level)}</option>)}
                </select>
                <button type="button" class="row-action-button" disabled={disabled} onclick={() => {
                  const nextRows = [...displayedPermissionRows];
                  nextRows.splice(index, 1);
                  persistPermissionRows(nextRows);
                }}>Remove</button>
              </div>
            ))}
            <button type="button" class="ghost-button" disabled={disabled} onclick={() => onTransientPermissionRowsChange(field.key, [...transientPermissionRows, { role: "", level: availableLevels[0] as PermissionLevel }])}>Add permission</button>
          </div>
        );
      }
      case "key-value-table": {
        const displayedMappingRows = mappingRows.length
          ? [...mappingRows, ...Array.from({ length: pendingRowCount }, () => ({ left: "", right: "" }))]
          : [{ left: "", right: "" }, ...Array.from({ length: pendingRowCount }, () => ({ left: "", right: "" }))];
        const templateRecord = modalState.tabId === "wikis" ? findTemplateRecordForDraft(modalState.draft, itemsByTab) : undefined;
        const inheritedRoutingRows = field.key === "writablePrefixBags" && modalState.tabId === "wikis" && templateRecord
          ? parseMappingRows(templateRecord.writablePrefixBags ?? "")
          : [];
        return (
          <div class="row-editor-stack">
            {displayedMappingRows.map((row, index) => (
              <div class="row-editor-row row-editor-row-wide">
                <div class="prefix-input-shell">
                  <input class={hasTrimMismatch(row.left) ? "field-input is-invalid" : "field-input"} type="text" value={row.left} placeholder="Prefix, leave blank for default" aria-invalid={hasTrimMismatch(row.left) ? "true" : undefined} title={hasTrimMismatch(row.left) ? "Prefix cannot start or end with whitespace." : undefined} disabled={disabled} oninput={(event) => {
                    const element = event.currentTarget as HTMLInputElement;
                    const hadStoredRow = index < mappingRows.length;
                    const nextRows = mappingRows.length ? [...mappingRows] : [{ left: "", right: "" }];
                    nextRows[index] = { ...row, left: element.value };
                    onDraftChange(field.key, serializeEditableMappingRows(nextRows));
                    if (!hadStoredRow && (element.value.trim() || row.right.trim())) onPendingRowsChange(field.key, (count) => count - 1);
                  }} ref={(element) => {
                    if (element.value !== row.left) element.value = row.left;
                  }} />
                  {hasTrimMismatch(row.left) ? <span class="prefix-input-alert missing-marker" aria-label="Prefix has leading or trailing whitespace" title="Prefix cannot start or end with whitespace."><MaterialSymbol icon={warningIcon} /></span> : null}
                </div>
                {renderSearchableInput({
                  id: `${inputId}-${index}-target`,
                  currentValue: row.right,
                  placeholder: "Target bag",
                  options: lookupOptions,
                  onInput: (nextValue) => {
                    const hadStoredRow = index < mappingRows.length;
                    const nextRows = mappingRows.length ? [...mappingRows] : [{ left: "", right: "" }];
                    nextRows[index] = { ...row, right: nextValue };
                    onDraftChange(field.key, serializeEditableMappingRows(nextRows));
                    if (!hadStoredRow && (row.left.trim() || nextValue.trim())) onPendingRowsChange(field.key, (count) => count - 1);
                  },
                })}
                <button type="button" class="row-action-button" disabled={disabled} onclick={() => {
                  if (index >= mappingRows.length) {
                    onPendingRowsChange(field.key, (count) => count - 1);
                    return;
                  }
                  const nextRows = mappingRows.length ? [...mappingRows] : [];
                  nextRows.splice(index, 1);
                  onDraftChange(field.key, serializeEditableMappingRows(nextRows));
                }}>Remove</button>
              </div>
            ))}
            <button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>Add prefix rule</button>
            {inheritedRoutingRows.length ? (
              <div class="field-callout">
                <p>Inherited routing</p>
                <ul class="value-list">
                  {inheritedRoutingRows.map((row) => <li>{`${row.left || "(default)"} -> ${row.right}`}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        );
      }
      case "select": {
        const options = getSelectOptions(field, itemsByTab);
        return (
          <select id={inputId} class="field-select" disabled={disabled} onchange={(event) => onDraftChange(field.key, (event.currentTarget as HTMLSelectElement).value)}>
            <option value="" selected={!value}>Select...</option>
            {options.map((option) => <option value={option} selected={option === value}>{option}</option>)}
          </select>
        );
      }
      case "autocomplete": {
        const datalistId = `${inputId}-options`;
        const options = getAutocompleteOptions(field, itemsByTab);
        return (
          <>
            <input id={inputId} class="field-input" type="text" value={value} disabled={disabled} ref={(element) => {
              if (element.value !== value) element.value = value;
            }} list={datalistId} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).value)} />
            <datalist id={datalistId}>
              {options.map((option) => <option value={option} />)}
            </datalist>
          </>
        );
      }
      case "action":
        return (
          <div class="tool-panel">
            <p class="field-helper">{formatFieldValue(value)}</p>
            <div class="tool-panel-actions">
              <button type="button" class="primary-button" onclick={() => onTriggerOperation(field.key, `Last run at ${new Date().toLocaleTimeString()}`)}>
                {field.key === "recompileAffectedWikis" ? "Run recompilation" : field.key === "publishFromDraft" ? "Publish draft" : field.label}
              </button>
              {modalState.operationMessages[field.key] ? <span class="tool-status">{modalState.operationMessages[field.key]}</span> : null}
            </div>
          </div>
        );
      case "resolver-preview": {
        const preview = computeResolverPreview(modalState.draft, modalState.resolverTitle);
        return (
          <div class="tool-panel resolver-tool">
            <label class="field-label" for={inputId}>Title to test</label>
            <input id={inputId} class="field-input" type="text" value={modalState.resolverTitle} ref={(element) => {
              if (element.value !== modalState.resolverTitle) element.value = modalState.resolverTitle;
            }} oninput={(event) => onResolverTitleChange((event.currentTarget as HTMLInputElement).value)} />
            <div class="resolver-grid">
              <div class="resolver-stat">
                <span>Matched prefix</span>
                <strong>{preview.matchedPrefix}</strong>
              </div>
              <div class="resolver-stat">
                <span>Write target</span>
                <strong>{preview.writeTo}</strong>
              </div>
            </div>
            <div class="field-callout">
              <p>{preview.title ? `Resolver would test the title against the longest matching prefix rule, then fall back to the default target if no explicit prefix matches. Final reads and write permission depend on live server state and are not shown here.` : `Enter a title to preview how this wiki would route it.`}</p>
            </div>
          </div>
        );
      }
      default:
        return <textarea id={inputId} class="field-textarea" rows={5} disabled={disabled} ref={(element) => {
          if (element.value !== value) element.value = value;
        }} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
    }
  }
}

@customElement("mws-field-block")
class FieldBlockElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: FieldBlockProps;

  protected render() {
    const { field, modalMode, useCardTitle, value, modalState } = this.props;
    const editable = isEditable(field, modalMode);
    const disabled = this.props.disabled ?? !editable;
    const useToggleEditor = editable && field.key === "requiredPluginsEnabled";

    return (
      <div class="field-block">
        {/* {!useCardTitle && !editable ? (
          <div class="field-block-header">
            <h5>{field.label}</h5>
          </div>
        ) : null} */}

        {useToggleEditor ? (
          <ToggleFieldElement field={field} value={value} onDraftChange={this.props.onDraftChange} />
        ) : (
          <div class="field-editor">
            {!useCardTitle ? <label class="field-label" for={`field-${field.key}`}>{field.label}</label> : null}
            {field.description ? <p class="field-helper">{field.description}</p> : null}
            <FieldEditorElement
              field={field}
              value={value}
              disabled={disabled}
              modalState={modalState}
              itemsByTab={this.props.itemsByTab}
              onDraftChange={this.props.onDraftChange}
              onPendingRowsChange={this.props.onPendingRowsChange}
              onTransientPermissionRowsChange={this.props.onTransientPermissionRowsChange}
              onResolverTitleChange={this.props.onResolverTitleChange}
              onTriggerOperation={this.props.onTriggerOperation}
            />
          </div>
        )}
      </div>
    );
  }
}

function sidebarField(field: FieldDefinition, draft: AdminRecord, itemsByTab?: ItemsByTab) {
  return <SidebarSectionElement title={field.label} content={<ReadonlyFieldElement field={field} value={draft[field.key] ?? ""} itemsByTab={itemsByTab} />} />;
}

@customElement("mws-sidebar-section")
class SidebarSectionElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: SidebarSectionProps;

  protected render() {
    const { title, content } = this.props;
    return (
      <>
        <h4>{title}</h4>
        <div class="sidebar-section-body">{content}</div>
      </>
    );
  }
}

@customElement("mws-toggle-field")
class ToggleFieldElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: ToggleFieldProps;

  protected render() {
    const { field, value, onDraftChange, headerOnly } = this.props;
    const checked = value === "enabled";

    return (
      <div class="toggle-field-row">
        {!headerOnly ? (
          <div class="toggle-field-copy">
            <strong>{field.label}</strong>
            {field.description ? <p>{field.description}</p> : null}
          </div>
        ) : null}
        <label class="header-switch" for={`header-${field.key}`}>
          <input
            id={`header-${field.key}`}
            class="header-switch-input"
            type="checkbox"
            checked={checked}
            ref={(element) => {
              if (element.checked !== checked) element.checked = checked;
            }}
            onchange={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).checked ? "enabled" : "disabled")}
          />
          <span class={checked ? "header-switch-track is-checked" : "header-switch-track"} aria-hidden="true">
            <span class="header-switch-thumb"></span>
          </span>
        </label>
      </div>
    );
  }
}

@customElement("mws-record-modal")
class RecordModalElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: RecordModalProps;

  protected render() {
    const {
      selectedTab,
      modalState,
      itemsByTab,
      isModalLoading,
      isSaving,
      isOpeningItem,
      onClose,
      onSave,
      onDraftChange,
      onPendingRowsChange,
      onTransientPermissionRowsChange,
      onResolverTitleChange,
      onTriggerOperation,
    } = this.props;

    const authoredFields = !isModalLoading ? getSectionFields(selectedTab, "authored") : [];
    const runtimeFields = !isModalLoading ? getSectionFields(selectedTab, "runtime") : [];
    const operationFields = !isModalLoading ? getSectionFields(selectedTab, "operations") : [];
    const sidebarFacts = !isModalLoading ? getSidebarFacts(modalState.tabId, modalState.draft) : [];
    const effectiveBagField = selectedTab.id === "wikis" ? selectedTab.fields.find((field) => field.key === "effectiveBagOrder") ?? null : null;
    const effectivePluginField = selectedTab.id === "wikis" ? selectedTab.fields.find((field) => field.key === "effectivePluginSet") ?? null : null;
    const baseNameField = selectedTab.id === "templates" ? selectedTab.fields.find((field) => field.key === "name") ?? null : null;
    const descriptionField = selectedTab.id === "templates" ? selectedTab.fields.find((field) => field.key === "description") ?? null : null;
    const dependentWikisField = selectedTab.id === "templates" ? selectedTab.fields.find((field) => field.key === "dependentWikis") ?? null : null;
    const genericSummaryFields = selectedTab.id !== "wikis" && selectedTab.id !== "templates"
      ? getSummaryColumns(selectedTab)
        .map((column) => selectedTab.fields.find((field) => field.key === column.key) ?? null)
        .filter((field): field is FieldDefinition => Boolean(field))
      : [];

    return (
      <div class="modal-shell" onclick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
        <section class="modal-card" role="dialog" aria-modal="true" aria-label={`${selectedTab.label} details`}>
          <header class="modal-header">
            <div>
              <p class="eyebrow">{selectedTab.eyebrow}</p>
              <h3>{isModalLoading ? `Loading ${selectedTab.label.slice(0, -1).toLowerCase()}...` : modalState.mode === "create" ? `New ${selectedTab.label.slice(0, -1)}` : getPrimaryValue(selectedTab, modalState.draft)}</h3>
              <p>{isModalLoading ? "Fetching record details from async storage before rendering the form." : selectedTab.description}</p>
            </div>
            <button class="close-button" type="button" onclick={onClose} aria-label="Close details">x</button>
          </header>

          {isModalLoading ? (
            <div class="modal-loading-shell">
              <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
              <p class="modal-loading-copy">Loading {selectedTab.label.toLowerCase()} details...</p>
            </div>
          ) : (
            <div class="modal-layout">
              <aside class="field-index modal-sidebar">
                {selectedTab.id === "wikis" ? (
                  <>
                    <SidebarSectionElement
                      title="Wiki status"
                      content={(
                        <dl class="summary-listing">
                          {sidebarFacts.map((fact) => (
                            <>
                              <dt>{fact.label}</dt>
                              <dd>{fact.value}</dd>
                            </>
                          ))}
                        </dl>
                      )}
                    />

                    {effectiveBagField ? sidebarField(effectiveBagField, modalState.draft, itemsByTab) : null}

                    {effectivePluginField ? sidebarField(effectivePluginField, modalState.draft, itemsByTab) : null}
                  </>
                ) : (
                  selectedTab.id === "templates" ? (
                    <>
                      {baseNameField ? sidebarField(baseNameField, modalState.draft, itemsByTab) : null}

                      {descriptionField ? sidebarField(descriptionField, modalState.draft, itemsByTab) : null}

                      {dependentWikisField ? sidebarField(dependentWikisField, modalState.draft, itemsByTab) : null}
                    </>
                  ) : (
                    <>
                      {genericSummaryFields.map((field) => (
                        sidebarField(field, modalState.draft, itemsByTab)
                      ))}

                      <SidebarSectionElement
                        title="Status"
                        content={(
                          <dl class="summary-listing">
                            {sidebarFacts.map((fact) => (
                              <>
                                <dt>{fact.label}</dt>
                                <dd>{fact.value}</dd>
                              </>
                            ))}
                          </dl>
                        )}
                      />
                    </>
                  )
                )}
              </aside>

              <div class="field-stack modal-main">
                {([
                  ["authored", authoredFields],
                  ["runtime", runtimeFields],
                  ["operations", operationFields],
                ] as [FieldSection, FieldDefinition[]][]).map(([section, fields]) => {
                  if (!fields.length) return null;
                  const heading = getSectionHeading(section, modalState.mode);
                  return (
                    <section class="modal-section">
                      {heading ? (
                        <header class="modal-section-header">
                          <div>
                            <h4>{heading.title}</h4>
                          </div>
                          <p>{heading.copy}</p>
                        </header>
                      ) : null}

                      <div class="section-field-grid">
                        {getFieldGroups(selectedTab.id, section, fields).map((group) => {
                          const groupFields = group.keys
                            .map((key) => fields.find((field) => field.key === key))
                            .filter((field): field is FieldDefinition => Boolean(field));
                          const headerField = group.headerFieldKey
                            ? fields.find((field) => field.key === group.headerFieldKey)
                            : undefined;
                          const groupDisabled = Boolean(group.disabledWhenHeaderOff && headerField && (modalState.draft[headerField.key] ?? "disabled") !== "enabled");
                          const headerDescription = group.description ?? (!group.footerDescriptionFromHeader ? headerField?.description : undefined) ?? getSectionSummary(section);
                          const footerDescription = group.footerDescriptionFromHeader ? headerField?.description : undefined;
                          if (!groupFields.length) return null;

                          return (
                            <article class={group.width === "full" ? "field-card is-full" : "field-card"}>
                              <header class="field-card-header">
                                <div class="field-card-header-row">
                                  <h4>{group.title ?? (groupFields.length === 1 ? groupFields[0].label : groupFields.map((field) => field.label).join(" and "))}</h4>
                                  {headerField ? <ToggleFieldElement field={headerField} value={modalState.draft[headerField.key] ?? ""} onDraftChange={onDraftChange} headerOnly={true} /> : null}
                                </div>
                                {headerDescription ? <p>{headerDescription}</p> : null}
                              </header>

                              <div class={groupFields.length > 1 ? (group.layout === "stack" ? "composite-fields is-stack" : "composite-fields") : "single-field"}>
                                {groupFields.map((field) => (
                                  <FieldBlockElement
                                    field={field}
                                    value={modalState.draft[field.key] ?? ""}
                                    modalState={modalState}
                                    modalMode={modalState.mode}
                                    disabled={groupDisabled}
                                    itemsByTab={itemsByTab}
                                    useCardTitle={groupFields.length === 1}
                                    onDraftChange={onDraftChange}
                                    onPendingRowsChange={onPendingRowsChange}
                                    onTransientPermissionRowsChange={onTransientPermissionRowsChange}
                                    onResolverTitleChange={onResolverTitleChange}
                                    onTriggerOperation={onTriggerOperation}
                                  />
                                ))}
                              </div>
                              {footerDescription ? <div class="field-card-footer-note"><p>{footerDescription}</p></div> : null}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                <footer class="modal-actions">
                  <button class="ghost-button" type="button" onclick={onClose} disabled={isSaving}>Cancel</button>
                  <button class="primary-button" type="button" onclick={onSave} disabled={isSaving || isOpeningItem}>{isSaving ? "Saving..." : modalState.mode === "create" ? `Save ${selectedTab.label.slice(0, -1)}` : "Save changes"}</button>
                </footer>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }
}

@addstyles(css)
@customElement("mws-app")
export class App extends JSXElement {
  // don't use shadow dom. allows inheriting main.css styles.
  useLightDOM: boolean = true;

  protected render() {
    const [activeTab, setActiveTab] = this.useState<TabId>("wikis");
    const [itemsByTab, setItemsByTab] = this.useState<ItemsByTab>(() => getEmptyItems());
    const [modalState, setModalState] = this.useState<ModalState | null>(null);
    const [isLoadingData, setIsLoadingData] = this.useState<boolean>(true);
    const [isOpeningItem, setIsOpeningItem] = this.useState<boolean>(false);
    const [isSaving, setIsSaving] = this.useState<boolean>(false);
    const [storageError, setStorageError] = this.useState<string>("");

    this.useEffect(() => {
      let cancelled = false;
      setIsLoadingData(true);
      setStorageError("");

      adminStorage.loadAll().then((loadedItems) => {
        if (cancelled) return;
        setItemsByTab(loadedItems);
        setIsLoadingData(false);
      }).catch((error) => {
        if (cancelled) return;
        setStorageError(error instanceof Error ? error.message : "Failed to load admin records.");
        setIsLoadingData(false);
      });

      return () => {
        cancelled = true;
      };
    }, []);

    const currentTab = getTab(activeTab);
    const activeTabItems = itemsByTab[activeTab];
    const selectedTab = modalState ? getTab(modalState.tabId) : null;
    const isModalLoading = Boolean(modalState?.loading);

    const openItem = async (tabId: TabId, recordId: string) => {
      const tab = getTab(tabId);
      setStorageError("");
      setActiveTab(tabId);
      setModalState({
        tabId,
        mode: "edit",
        recordId,
        draft: createDraft(tab),
        resolverTitle: "Docs/Welcome",
        operationMessages: {},
        pendingRows: {},
        transientPermissionRows: {},
        loading: true,
      });
      setIsOpeningItem(true);
      const item = await adminStorage.read(tabId, recordId).catch((error) => {
        setStorageError(error instanceof Error ? error.message : "Failed to load record details.");
        return null;
      });
      setIsOpeningItem(false);
      if (!item) {
        closeModal();
        return;
      }
      setModalState({
        tabId,
        mode: "edit",
        recordId,
        draft: createDraft(tab, item),
        resolverTitle: "Docs/Welcome",
        operationMessages: {},
        pendingRows: {},
        transientPermissionRows: {},
        loading: false,
      });
    };

    const openCreate = (tabId: TabId) => {
      const tab = getTab(tabId);
      setActiveTab(tabId);
      setModalState({
        tabId,
        mode: "create",
        draft: createDraft(tab),
        resolverTitle: "Docs/Welcome",
        operationMessages: {},
        pendingRows: {},
        transientPermissionRows: {},
        loading: false,
      });
    };

    const closeModal = () => setModalState(null);

    const updateDraft = (fieldKey: string, value: string) => {
      setModalState((state) => state
        ? { ...state, draft: { ...state.draft, [fieldKey]: value } }
        : state);
    };

    const updatePendingRows = (fieldKey: string, updater: (count: number) => number) => {
      setModalState((state) => {
        if (!state) return state;
        const nextCount = Math.max(0, updater(state.pendingRows[fieldKey] ?? 0));
        return {
          ...state,
          pendingRows: {
            ...state.pendingRows,
            [fieldKey]: nextCount,
          },
        };
      });
    };

    const updateTransientPermissionRows = (fieldKey: string, rows: PermissionRow[]) => {
      setModalState((state) => {
        if (!state) return state;
        return {
          ...state,
          transientPermissionRows: {
            ...state.transientPermissionRows,
            [fieldKey]: rows,
          },
        };
      });
    };

    const saveDraft = async () => {
      if (!modalState) return;
      const snapshot = modalState;
      const syncedDraft = syncRecord(snapshot.tabId, snapshot.draft, itemsByTab);
      setStorageError("");
      setIsSaving(true);
      const savedTabItems = await adminStorage.save(
        snapshot.tabId,
        syncedDraft,
      ).catch((error) => {
        setStorageError(error instanceof Error ? error.message : "Failed to save record.");
        return null;
      });
      setIsSaving(false);
      if (!savedTabItems) return;
      setItemsByTab((current) => ({ ...current, [snapshot.tabId]: savedTabItems }));
      closeModal();
    };

    const updateResolverTitle = (value: string) => {
      setModalState((state) => state ? { ...state, resolverTitle: value } : state);
    };

    const triggerOperation = (fieldKey: string, message: string) => {
      setModalState((state) => state
        ? { ...state, operationMessages: { ...state.operationMessages, [fieldKey]: message } }
        : state);
    };

    return (
      <div class="admin-shell">
        <header class="hero-panel">
          <div>
            <p class="eyebrow">Multi-wiki administration</p>
            <h1>Wiki model control room</h1>
            <p class="hero-copy">A data-first admin surface for wikis, templates, bags, and plugins. Lists expose effective state. Popup forms separate authored inputs from compiled outputs.</p>
          </div>
          <div class="hero-stats">
            <article>
              <span>Wikis</span>
              <strong>{itemsByTab.wikis.length}</strong>
            </article>
            <article>
              <span>Templates</span>
              <strong>{itemsByTab.templates.length}</strong>
            </article>
            <article>
              <span>Bags</span>
              <strong>{itemsByTab.bags.length}</strong>
            </article>
            <article>
              <span>Plugins</span>
              <strong>{itemsByTab.plugins.length}</strong>
            </article>
          </div>
        </header>

        <nav class="tab-strip" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              class={tab.id === activeTab ? "tab-button is-active" : "tab-button"}
              onclick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span>{tab.label}</span>
              <small>{itemsByTab[tab.id].length} items</small>
            </button>
          ))}
        </nav>

        <section class="section-header">
          <div>
            <p class="eyebrow">{currentTab.eyebrow}</p>
            <h2>{currentTab.label}</h2>
          </div>
          <p class="section-copy">{currentTab.description}</p>
        </section>

        <section class="list-panel">
          <div class="list-toolbar">
            <div>
              <strong>{currentTab.label} list</strong>
              <p>{isLoadingData ? "Loading records from simulated server storage." : "Click any row to inspect its edit surface and derived state."}</p>
            </div>
            <div class="toolbar-actions">
              <button class="ghost-button" type="button" onclick={() => openCreate(currentTab.id)} disabled={isLoadingData || isOpeningItem || isSaving}>{getCreateLabel(currentTab.id)}</button>
              <button class="ghost-button" type="button" onclick={() => activeTabItems[0] && openItem(currentTab.id, activeTabItems[0].id)} disabled={isLoadingData || isOpeningItem || isSaving || !activeTabItems.length}>Open featured item</button>
            </div>
          </div>

          {storageError ? (
            <div class="field-callout">
              <p>{storageError}</p>
            </div>
          ) : null}

          <div class="list-grid list-grid-header">
            {currentTab.columns.map((column) => (
              <div class="list-cell list-head">{column.label}</div>
            ))}
          </div>

          <div class="list-body">
            {isLoadingData ? (
              <div class="field-callout">
                <p>Loading {currentTab.label.toLowerCase()} from async storage…</p>
              </div>
            ) : activeTabItems.length ? activeTabItems.map((item) => (
              <button class="list-grid list-row" type="button" onclick={() => openItem(currentTab.id, item.id)} disabled={isOpeningItem || isSaving}>
                {currentTab.columns.map((column) => (
                  <div class="list-cell">{renderListCellValue(column.key, item[column.key])}</div>
                ))}
              </button>
            )) : (
              <div class="field-callout">
                <p>No {currentTab.label.toLowerCase()} are loaded in storage yet.</p>
              </div>
            )}
          </div>
        </section>

        {modalState && selectedTab ? (
          <RecordModalElement
            selectedTab={selectedTab}
            modalState={modalState}
            itemsByTab={itemsByTab}
            isModalLoading={isModalLoading}
            isSaving={isSaving}
            isOpeningItem={isOpeningItem}
            onClose={closeModal}
            onSave={saveDraft}
            onDraftChange={updateDraft}
            onPendingRowsChange={updatePendingRows}
            onTransientPermissionRowsChange={updateTransientPermissionRows}
            onResolverTitleChange={updateResolverTitle}
            onTriggerOperation={triggerOperation}
          />
        ) : null}
      </div>
    );
  }
}
