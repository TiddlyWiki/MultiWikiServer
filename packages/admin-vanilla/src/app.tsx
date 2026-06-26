import { customElement, JSXElement, addstyles, state } from "@tiddlywiki/jsx-lit";
import css from "./app.inline.css";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";
import {
  DataStore,
  getAllTabs,
  getTab,
  TabId,
  ColumnDefinition,
  FieldDefinition,
  FieldGroupDefinition,
  FieldSection,
  FieldType,
  Mode,
  TabDefinition
} from "./definition/tabs";
import { is } from "@tiddlywiki/jsx-runtime";

export function definitely<T>(a: any): asserts a is T { }

export function ok<T>(value: T | null | undefined | "" | 0 | false, message?: string): asserts value is T {
  if (!value) throw new Error(message ?? `AssertionError: ${value}`);
}



function mapGetInit<K, V>(map: Map<K, V>, key: K, init: () => V): V {
  if (!map.has(key)) {
    let val = init();
    map.set(key, val);
    return val;
  } else {
    return map.get(key) as V;
  }
}


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

type ModalMode = "create" | "edit";
interface AdminValue {
  __admin_value_string__: string;
  __admin_value_parsed__: any;
}
type AdminRecord = Record<string, string> & { id: string; };
type ItemsByTab = Record<TabId, AdminRecord[]>;

type PermissionLevel = "A_read" | "B_write" | "C_admin";
type RecipePermissionLevel = "A_read" | "B_write";

type WikiDataStore = DataStore["wikis"][number];
type TemplateDataStore = DataStore["templates"][number];
type BagDataStore = DataStore["bags"][number];
type PluginDataStore = DataStore["plugins"][number];
type RoleDataStore = DataStore["roles"][number];
type UserDataStore = DataStore["users"][number];

interface WikiAdminRecord extends WikiDataStore {
  templateName: string;
  defaultWritableBag: string;
  readonlyBagCount: string;
  prefixRuleCount: string;
  pluginCount: string;
  effectiveBagOrder: string;
  effectivePluginSet: string;
  compileValidation: string;
  lastCompiledAt: string;
  statusFlags: string;
}

interface TemplateAdminRecord extends TemplateDataStore {
  defaultWritableBag: string;
  readonlyBagsSummary: string;
  writablePrefixSummary: string;
  dependentWikis: string;
  dependentWikiCount: string;
  lastUpdatedAt: string;
  validationStatus: string;
  validationReport: string;
}

interface BagAdminRecord extends BagDataStore {
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

interface PluginAdminRecord extends PluginDataStore {
  assetsMetadata: string;
  usedByWikis: string;
  usageCount: string;
  draftOf: string;
  updatedAt: string;
}

interface RoleAdminRecord extends RoleDataStore {
}

interface UserAdminRecord extends UserDataStore {
  confirmPassword: string;
}

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


interface ModalState {
  tabId: TabId;
  mode: ModalMode;
  draft: AdminRecord;
  resolverTitle: string;
  operationMessages: Record<string, string>;
  pendingRows: Record<string, number>;
  transientPermissionRows: Record<string, PermissionRow[]>;
  loading?: boolean;
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



function formatPrefixSummary(value: string): string {
  const rows = mappingRowsCodec.parse(value);
  return rows.map((row) => row.left || "default").join(", ");
}

function summarizePermissionRoles(value: string): string {
  return permissionRowsCodec.parse(value).map((row) => row.role).filter(Boolean).join(", ");
}

function deriveBagRecords(items: DataStore, templates: TemplateAdminRecord[], wikis: WikiAdminRecord[]): BagAdminRecord[] {
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
    lineListCodec.parse(template.readonlyBags ?? "").forEach((bagName) => addUsage(templateReadonlyUsage, bagName, templateName));
  }

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    const templateRecord = findTemplateRecordForWikiRecord(wiki, { ...items, templates, wikis });
    const effectiveReadonlyBags = uniqueLines([
      ...lineListCodec.parse(templateRecord?.readonlyBags ?? ""),
      ...lineListCodec.parse(wiki.readonlyBags ?? ""),
    ]);
    effectiveReadonlyBags.forEach((bagName) => addUsage(wikiReadonlyUsage, bagName, wikiName));

    const prefixRows = mappingRowsCodec.parse(wiki.writablePrefixBags ?? "");
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

function derivePluginRecords(items: DataStore, templates: TemplateAdminRecord[], wikis: WikiAdminRecord[]): PluginAdminRecord[] {
  const pluginUsage = new Map<string, Set<string>>();

  const addUsage = (pluginName: string, wikiName: string) => {
    if (!pluginName || !wikiName) return;
    const next = pluginUsage.get(pluginName) ?? new Set<string>();
    next.add(wikiName);
    pluginUsage.set(pluginName, next);
  };

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    lineListCodec.parse(wiki.effectivePluginSet ?? "").forEach((pluginValue) => {
      const pluginName = pluginValue.split("@")[0]?.trim() ?? pluginValue.trim();
      addUsage(pluginName, wikiName);
    });
  }

  return items.plugins.map((plugin) => {
    const usedByWikis = Array.from(pluginUsage.get(plugin.name ?? "") ?? []);
    return {
      ...plugin as unknown as PluginAdminRecord,
      usedByWikis: usedByWikis.join("\n"),
      usageCount: String(usedByWikis.length),
    };
  });
}


function syncWikiRecord(draft: DataStore["wikis"][number], itemsByTab: DataStore) {
  const normalizedWritablePrefixBags = editableMappingRowsCodec.normalize(draft.writablePrefixBags ?? "");
  const templateRecord = findTemplateRecordForWikiRecord(draft, itemsByTab);
  const templateReadonlyBags = templateRecord ? lineListCodec.parse(templateRecord.readonlyBags ?? "") : [];
  const templatePlugins = templateRecord ? lineListCodec.parse(templateRecord.plugins ?? "") : [];
  const wikiReadonlyBags = lineListCodec.parse(draft.readonlyBags ?? "");
  const wikiPlugins = lineListCodec.parse(draft.plugins ?? "");
  const mergedReadonlyBags = uniqueLines([...templateReadonlyBags, ...wikiReadonlyBags]);
  const mergedPlugins = buildEffectivePluginSet({
    previousEffectivePlugins: lineListCodec.parse((draft as WikiAdminRecord).effectivePluginSet ?? ""),
    templatePlugins,
    wikiPlugins,
    corePluginsEnabled: templateRecord?.requiredPluginsEnabled !== "disabled",
  });
  const prefixRows = mappingRowsCodec.parse(normalizedWritablePrefixBags);
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
    templateName: templateRecord?.name ?? draft.templateId ?? "",
    defaultWritableBag,
    readonlyBagCount: String(mergedReadonlyBags.length),
    prefixRuleCount,
    pluginCount: String(mergedPlugins.length),
    effectiveBagOrder: readableBagOrder.map((bag, index) => `${index + 1}. ${bag}`).join("\n"),
    effectivePluginSet: mergedPlugins.join("\n"),
    compileValidation,
    statusFlags,
  } satisfies WikiAdminRecord;
}

function syncTemplateRecord(draft: DataStore["templates"][number]) {
  const normalizedWritablePrefixBags = editableMappingRowsCodec.normalize(draft.writablePrefixBags ?? "");

  const readonlyBags = (draft.readonlyBags ?? "")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);



  const writablePrefixBags = Object.fromEntries(editableMappingRowsCodec.parse(normalizedWritablePrefixBags)
    .map(e => [e.left, e.right]));

  const prefixSummary = Object.keys(writablePrefixBags).map((prefix) => prefix || "default").join(", ");
  const defaultWritableBag = writablePrefixBags[""] ?? "";

  return {
    ...draft,
    writablePrefixBags: normalizedWritablePrefixBags,
    readonlyBagsSummary: readonlyBags.join(", "),
    writablePrefixSummary: prefixSummary,
    defaultWritableBag,
  } // intentionally partial
}

function deriveItems(items: DataStore): ItemsByTab {
  const partialTemplates = items.templates.map((template) => syncTemplateRecord(template));
  const wikis = items.wikis.map((wiki) => syncWikiRecord(wiki, { ...items, templates: partialTemplates }));
  const dependentWikiMap = new Map<string, string[]>();
  for (const wiki of wikis) {
    mapGetInit(dependentWikiMap, wiki.templateId, () => []).push(wiki.slug || wiki.displayName);
  }

  const templates = partialTemplates.map((template) => {
    const dependentWikis = dependentWikiMap.get(template.id) ?? [];
    const readonlyBags = lineListCodec.parse(template.readonlyBags ?? "");
    const prefixRows = mappingRowsCodec.parse(template.writablePrefixBags ?? "");
    return {
      ...template,
      readonlyBagsSummary: readonlyBags.join(", "),
      writablePrefixSummary: formatPrefixSummary(template.writablePrefixBags ?? ""),
      dependentWikis: dependentWikis.join("\n"),
      dependentWikiCount: String(dependentWikis.length),
      defaultWritableBag: prefixRows.find((row) => row.left === "")?.right ?? "",
      validationReport: "placeholder",
      validationStatus: "placeholder",
      lastUpdatedAt: new Date().toISOString(),
    } satisfies TemplateAdminRecord;
    // lastUpdatedAt, validationStatus, validationReport
  });

  return {
    ...items,
    templates,
    wikis,
    bags: deriveBagRecords(items, templates, wikis),
    plugins: derivePluginRecords(items, templates, wikis),
  } as unknown as ItemsByTab;
}

function getEmptyItems(): ItemsByTab {
  return {
    wikis: [],
    templates: [],
    bags: [],
    plugins: [],
    roles: [],
    users: [],
  };
}



class InMemoryAdminStorage<T extends Record<TabId, any[]>> implements AdminStorage {
  private data!: DataStore;
  constructor(
    private deriveItems: (data: DataStore) => T
  ) {

  }

  public async loadAll(): Promise<T> {
    this.data = await (await fetch(pathPrefix + "/admin/store")).json()
    return this.cloneItems(this.deriveItems(this.data));
  }
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }
  private cloneItems(items: T): T {
    return {
      wikis: items.wikis.map((item) => ({ ...item })),
      templates: items.templates.map((item) => ({ ...item })),
      bags: items.bags.map((item) => ({ ...item })),
      plugins: items.plugins.map((item) => ({ ...item })),
      roles: items.roles.map((item) => ({ ...item })),
      users: items.users.map((item) => ({ ...item })),
    } as T;
  }

  public async read(tabId: TabId, id: string): Promise<AdminRecord | null> {
    if (!this.data) await this.loadAll();
    else await this.wait(300);
    const item = this.deriveItems(this.data)[tabId].find((record) => record.id === id);
    return item ? { ...item } : null;
  }

  public async save(tabId: TabId, record: AdminRecord): Promise<AdminRecord[]> {
    if (!this.data) await this.loadAll();
    else await this.wait(300);
    const currentTabRecords = this.data[tabId];
    const storedRecord = this.pruneStoredRecord(tabId, record, currentTabRecords.length);
    const id = storedRecord.id;
    const index = this.data[tabId].findIndex(e => e.id === id);
    if (index > -1)
      this.data[tabId][index] = storedRecord as any;
    else
      this.data[tabId].push(storedRecord as any);
    this.data = { ...this.data, [tabId]: [...this.data[tabId]] };
    return this.deriveItems(this.data)[tabId].map((item) => ({ ...item }));
  }

  private pruneStoredRecord(tabId: TabId, record: AdminRecord, fallbackOrdinal?: number): AdminRecord {
    const tab = getTab(tabId);
    const storedFieldKeys = this.getStoredFieldKeys(tab);
    const pruned = storedFieldKeys.reduce<AdminRecord>((nextRecord, key) => {
      nextRecord[key] = record[key] ?? "";
      return nextRecord;
    }, { id: record.id || String(fallbackOrdinal ?? 0) });
    return pruned;
  }
  private getStoredFieldKeys(tab: TabDefinition): string[] {
    return tab.fields.filter((field) => ["create", "create edit", "edit"].includes(field.mode)).map((field) => field.key);
  }
}


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
  }, { id: source?.id || "" });

  if (!source && tab.id === "templates") {
    const draft2: TemplateAdminRecord = draft as any;
    draft2.requiredPluginsEnabled = "enabled";
    draft2.customHtmlEnabled = "disabled";
    draft2.injectionArray = "$tw.preloadTiddlers";
  }

  return draft;
}

function isEditable(field: FieldDefinition, mode: ModalMode): boolean {
  if (!field.mode) return false;
  if (field.mode === "create edit") return true;
  if (field.mode === "create") return mode === "create";
  if (field.mode === "edit") return mode === "edit";
  if (field.mode === "create edit temp") return true;
  if (field.mode === "create temp") return mode === "create";
  if (field.mode === "edit temp") return mode === "edit";
  if (field.mode === "server") return false;
  const t: never = field.mode;
  return false;
}

function getPrimaryValue(tab: TabDefinition, item: AdminRecord): string {
  const primaryKey = tab.columns[0]?.key ?? tab.fields[0]?.key;
  return formatFieldValue(item[primaryKey]);
}

function getCreateLabel(tab: TabDefinition): string {
  return tab.createLabel;
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
  if (fieldKey === "roleIds") {
    return Array.from(new Set(itemsByTab.roles.map((item) => item.roleId).filter(Boolean)));
  }
  if (fieldKey === "permissions" || fieldKey === "recipePermissions") {
    return Array.from(new Set([
      ...itemsByTab.bags.flatMap((item) => permissionRowsCodec.parse(item.permissions ?? "").map((row) => row.role)),
      ...itemsByTab.wikis.flatMap((item) => permissionRowsCodec.parse(item.recipePermissions ?? "").map((row) => row.role)),
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

  const lines = lineListCodec.parse(value);
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

function getSectionSummary(section: FieldSection, tabId?: TabId): string {
  if (section === "authored") return "";
  if (tabId === "bags" && section === "runtime") return "";
  if (section === "runtime") return "Resolved outputs";
  return "Actions";
}

function getFieldGroups(tab: TabDefinition, section: FieldSection, fields: FieldDefinition[]): FieldGroupDefinition[] {
  const fallback = fields.map((field) => ({ keys: [field.key], width: "half" as const }));

  const configuredGroups = tab.fieldGroups?.[section];
  if (!configuredGroups) return fallback;

  return configuredGroups.filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
}

function getSummaryColumns(tab: TabDefinition): ColumnDefinition[] {
  return tab.columns.slice(0, 6);
}

function findTemplateRecordForWikiRecord(draft: DataStore["wikis"][number], itemsByTab: DataStore | ItemsByTab) {
  return itemsByTab.templates.find((template) => draft.templateId === template.id);
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
  const prefixRows = mappingRowsCodec.parse(writablePrefixBags);
  const defaultTargets = prefixRows.filter((row) => row.left === "").map((row) => row.right);
  const prefixedTargets = prefixRows.filter((row) => row.left !== "").map((row) => row.right);
  return uniqueLines([
    ...defaultTargets,
    ...prefixedTargets,
    ...wikiReadonlyBags,
    ...templateReadonlyBags,
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
    ...wikiPlugins,
    ...templatePlugins,
    ...requiredPlugins,
    ...corePlugins,
  ]);
}

class LineListCodec {
  public parse(value: string): string[] {
    if (!value.trim()) return [];
    return value.split("\n").map((entry) => entry.trim()).filter(Boolean);
  }

  public stringify(lines: string[]): string {
    return lines.map((line) => line.trim()).filter(Boolean).join("\n");
  }
}

class MappingRowsCodec {
  public parse(value: string): MappingRow[] {
    return JSON.parse(value);
  }

  public stringify(rows: MappingRow[]): string {
    return JSON.stringify(rows.map(e => ({ left: e.left.trim(), right: e.right.trim() })));
  }
}
/** This class is used for actual editors so we can type spaces in the field. */
class EditableMappingRowsCodec {
  public parse(value: string): MappingRow[] {
    return JSON.parse(value);
  }

  public stringify(rows: MappingRow[]): string {
    return JSON.stringify(rows);
  }

  public normalize(value: string): string {
    return mappingRowsCodec.stringify(this.parse(value));
  }
}

class PermissionRowsCodec {
  public parse(value: string): PermissionRow[] {
    return JSON.parse(value);
    return value.split("\n").map((entry) => entry.trim()).filter(Boolean).map((row) => {
      const [role, levelText] = row.split(":").map((part) => part?.trim() ?? "");
      const allPermissionLevels = [...bagPermissionLevels];
      const level = allPermissionLevels.includes(levelText as PermissionLevel) ? levelText as PermissionLevel : "A_read";
      return { role, level };
    });
  }

  public stringify(rows: PermissionRow[]): string {
    return JSON.stringify(rows);
    return rows
      .map((row) => ({ role: row.role.trim(), level: row.level }))
      .filter((row) => row.role)
      .map((row) => `${row.role}:${row.level}`)
      .join("\n");
  }
}

class JsonObjectRowsCodec {
  public parse(value: string): KeyValueRow[] {
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

  public stringify(rows: KeyValueRow[]): string {
    const next = rows.reduce<Record<string, string>>((acc, row) => {
      const key = row.key.trim();
      if (!key) return acc;
      acc[key] = row.value;
      return acc;
    }, {});
    return JSON.stringify(next, null, 2);
  }
}

const lineListCodec = new LineListCodec();
const mappingRowsCodec = new MappingRowsCodec();
const editableMappingRowsCodec = new EditableMappingRowsCodec();
const permissionRowsCodec = new PermissionRowsCodec();
const jsonObjectRowsCodec = new JsonObjectRowsCodec();

function computeResolverPreview(draft: AdminRecord, title: string) {
  const normalizedTitle = title.trim();
  const targets = mappingRowsCodec.parse(draft.writablePrefixBags ?? "").filter((row) => row.right).sort((a, b) => b.left.length - a.left.length);
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
  return lineListCodec.parse(value ?? "").length;
}

function getSidebarFacts(tabId: TabId, draft: AdminRecord): Array<{ label: string; value: string; }>;
function getSidebarFacts(tabId: TabId, draft: unknown): Array<{ label: string; value: string; }> {
  if (tabId === "wikis") {
    definitely<WikiAdminRecord>(draft);
    return [
      { label: "Template", value: formatFieldValue(draft.templateName || draft.templateId) },
      { label: "Default bag", value: formatFieldValue(draft.defaultWritableBag) },
      { label: "Compiled", value: formatFieldValue(draft.lastCompiledAt) },
    ];
  }

  if (tabId === "templates") {
    definitely<TemplateAdminRecord>(draft);
    return [
      { label: "Readonly bags", value: String(countValueLines(draft.readonlyBags)) },
      { label: "Prefix rules", value: String(mappingRowsCodec.parse(draft.writablePrefixBags ?? "").length || 0) },
      { label: "Default bag", value: formatFieldValue(draft.defaultWritableBag) },
      { label: "Plugins", value: String(countValueLines(draft.plugins)) },
      { label: "Validation", value: formatFieldValue(draft.validationStatus || draft.validationReport) },
    ];
  }

  if (tabId === "bags") {
    definitely<BagAdminRecord>(draft);
    return [
      { label: "Permission roles", value: String(permissionRowsCodec.parse(draft.permissions ?? "").length || 0) },
      { label: "Referenced by templates", value: String(countValueLines(draft.referencedByTemplates)) },
      { label: "Referenced by wikis", value: String(countValueLines(draft.referencedByWikis)) },
      { label: "Routing roles", value: String(countValueLines(draft.routingRoles)) },
      // { label: "Tiddlers", value: formatFieldValue(draft.tiddlerCount) },
      // { label: "Last activity", value: formatFieldValue(draft.lastActivityAt) },
    ];
  }

  if (tabId === "plugins") {
    definitely<PluginAdminRecord>(draft);
    return [
      { label: "Version", value: formatFieldValue(draft.version) },
      { label: "Status", value: formatFieldValue(draft.status) },
      { label: "Used by wikis", value: String(countValueLines(draft.usedByWikis)) },
      { label: "Usage count", value: formatFieldValue(draft.usageCount) },
      { label: "Draft of", value: formatFieldValue(draft.draftOf) },
      { label: "Updated", value: formatFieldValue(draft.updatedAt) },
    ];
  }

  if (tabId === "roles") {
    definitely<RoleAdminRecord>(draft);
    return [
      { label: "Role name", value: formatFieldValue(draft.roleId) },
      { label: "Description", value: formatFieldValue(draft.description) },
    ];
  }

  if (tabId === "users") {
    definitely<UserAdminRecord>(draft);
    return [
      { label: "Username", value: formatFieldValue(draft.username) },
      { label: "Email", value: formatFieldValue(draft.email) },
      { label: "Assigned roles", value: String(countValueLines(draft.roleIds)) },
    ];
  }

  { const t: never = tabId; return []; }

}

interface FieldEditorInput {
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

/** FieldEditorInput plus the derived inputId, shared by the per-type render functions. */
interface FieldEditorContext extends FieldEditorInput {
  inputId: string;
}

function renderSearchableInput(ctx: FieldEditorContext, { id, currentValue, placeholder, options, onInput }: {
  id: string;
  currentValue: string;
  placeholder: string;
  options: string[];
  onInput: (nextValue: string) => void;
}) {
  const datalistId = `${id}-options`;
  return (
    <>
      <input
        id={id}
        class="field-input"
        type="text"
        value={currentValue}
        disabled={ctx.disabled}
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
}

function renderTextInputField(ctx: FieldEditorContext, type: "text" | "number") {
  const { field, value, disabled, inputId, onDraftChange } = ctx;
  return <input id={inputId} class="field-input" type={type} value={value} ref={(element) => {
    if (element.value !== value) element.value = value;
  }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).value)} />;
}

function renderTextareaField(ctx: FieldEditorContext, rows: number, extraClass = "") {
  const { field, value, disabled, inputId, onDraftChange } = ctx;
  const className = extraClass ? `field-textarea ${extraClass}` : "field-textarea";
  return <textarea id={inputId} class={className} rows={rows} ref={(element) => {
    if (element.value !== value) element.value = value;
  }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
}

function renderParametersEditor(ctx: FieldEditorContext) {
  const { field, disabled, modalState, value, onDraftChange, onPendingRowsChange } = ctx;
  const parameterRows = jsonObjectRowsCodec.parse(value);
  const pendingRowCount = modalState.pendingRows[field.key] ?? 0;
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
            onDraftChange(field.key, jsonObjectRowsCodec.stringify(nextRows));
            if (!hadStoredRow && (element.value.trim() || row.value.trim())) onPendingRowsChange(field.key, (count) => count - 1);
          }} ref={(element) => {
            if (element.value !== row.key) element.value = row.key;
          }} />
          <input class="field-input" type="text" value={row.value} placeholder="Value" disabled={disabled} oninput={(event) => {
            const element = event.currentTarget as HTMLInputElement;
            const hadStoredRow = index < parameterRows.length;
            const nextRows = parameterRows.length ? [...parameterRows] : [{ key: "", value: "" }];
            nextRows[index] = { ...row, value: element.value };
            onDraftChange(field.key, jsonObjectRowsCodec.stringify(nextRows));
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
            onDraftChange(field.key, jsonObjectRowsCodec.stringify(nextRows));
          }}>Remove</button>
        </div>
      ))}
      <button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>Add parameter</button>
    </div>
  );
}

function renderSearchMultiselectField(ctx: FieldEditorContext) {
  const { field, value, disabled, modalState, itemsByTab, inputId, onDraftChange, onPendingRowsChange } = ctx;
  const editableLines = lineListCodec.parse(value);
  const pendingRowCount = modalState.pendingRows[field.key] ?? 0;
  const lookupOptions = getLookupOptions(field.key, itemsByTab);
  const itemLabel = field.key === "plugins"
    ? "plugin"
    : field.key === "roleIds"
      ? "role id"
      : "bag";
  const templateRecord = is<WikiAdminRecord>(modalState.draft, modalState.tabId === "wikis")
    ? findTemplateRecordForWikiRecord(modalState.draft, itemsByTab) : undefined;
  const templateReadonlyBagLines = field.key === "readonlyBags" && templateRecord
    ? lineListCodec.parse(templateRecord.readonlyBags ?? "") : [];
  const templatePluginLines = field.key === "plugins" && templateRecord
    ? lineListCodec.parse(templateRecord.plugins ?? "") : [];
  const templateCorePluginsEnabled = templateRecord?.requiredPluginsEnabled !== "disabled";

  const updateLineValueAt = (index: number, nextValue: string) => {
    const lines = lineListCodec.parse(value);
    const hadStoredRow = index < lines.length;
    while (lines.length <= index) lines.push("");
    lines[index] = nextValue;
    onDraftChange(field.key, lineListCodec.stringify(lines));
    if (!hadStoredRow && nextValue.trim()) onPendingRowsChange(field.key, (count) => count - 1);
  };

  const removeLineValueAt = (index: number) => {
    const lines = lineListCodec.parse(value);
    if (index >= lines.length) {
      onPendingRowsChange(field.key, (count) => count - 1);
      return;
    }
    lines.splice(index, 1);
    onDraftChange(field.key, lineListCodec.stringify(lines));
  };

  const displayedLines = editableLines.length
    ? [...editableLines, ...Array.from({ length: pendingRowCount }, () => "")]
    : ["", ...Array.from({ length: pendingRowCount }, () => "")];
  return (
    <div class="row-editor-stack">
      {displayedLines.map((line, index) => (
        <div class="row-editor-row">
          {renderSearchableInput(ctx, {
            id: `${inputId}-${index}`,
            currentValue: line,
            placeholder: `${itemLabel.charAt(0).toUpperCase()}${itemLabel.slice(1)} name`,
            options: lookupOptions,
            onInput: (nextValue) => updateLineValueAt(index, nextValue),
          })}
          <button type="button" class="row-action-button" disabled={disabled} onclick={() => removeLineValueAt(index)}>Remove</button>
        </div>
      ))}
      <button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>{`Add ${itemLabel}`}</button>
      {field.key === "readonlyBags" && modalState.tabId === "wikis" && templateRecord ? (
        <div class="field-callout">
          <p>Readonly bags from template</p>
          <ul class="value-list">
            {templateReadonlyBagLines.length ? templateReadonlyBagLines.map((bag) => <li>{bag}</li>) : <li>No template readonly bags</li>}
          </ul>
        </div>
      ) : null}
      {field.key === "plugins" && modalState.tabId === "wikis" && templateRecord ? (
        <div class="field-callout">
          <p>Plugins from template</p>
          <ul class="value-list">
            {templatePluginLines.map((plugin) => <li>{plugin}</li>)}
            {templateCorePluginsEnabled ? <li>core plugins</li> : <li>core plugins disabled</li>}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function renderPermissionTableField(ctx: FieldEditorContext) {
  const { field, value, disabled, modalState, itemsByTab, inputId, onDraftChange, onTransientPermissionRowsChange } = ctx;
  const permissionRows = permissionRowsCodec.parse(value);
  const lookupOptions = getLookupOptions(field.key, itemsByTab);
  const availableLevels = getPermissionLevelsForField(field.key);
  const transientPermissionRows = modalState.transientPermissionRows[field.key] ?? [];
  const displayedPermissionRows = permissionRows.length || transientPermissionRows.length
    ? [...permissionRows, ...transientPermissionRows]
    : [{ role: "", level: availableLevels[0] as PermissionLevel }];

  const persistPermissionRows = (rows: PermissionRow[]) => {
    const persistedRows = rows.filter((row) => row.role.trim());
    const nextTransientRows = rows.filter((row) => !row.role.trim());
    onDraftChange(field.key, permissionRowsCodec.stringify(persistedRows));
    onTransientPermissionRowsChange(field.key, nextTransientRows);
  };

  return (
    <div class="row-editor-stack">
      {displayedPermissionRows.map((row, index) => (
        <div key={`${field.key}-permission-${index}`} class="row-editor-row row-editor-row-wide row-editor-row-permission">
          {renderSearchableInput(ctx, {
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

function renderKeyValueTableField(ctx: FieldEditorContext) {
  const { field, value, disabled, modalState, itemsByTab, inputId, onDraftChange, onPendingRowsChange } = ctx;
  const mappingRows = editableMappingRowsCodec.parse(value);
  const pendingRowCount = modalState.pendingRows[field.key] ?? 0;
  const lookupOptions = getLookupOptions(field.key, itemsByTab);
  const displayedMappingRows = mappingRows.length
    ? [...mappingRows, ...Array.from({ length: pendingRowCount }, () => ({ left: "", right: "" }))]
    : [{ left: "", right: "" }, ...Array.from({ length: pendingRowCount }, () => ({ left: "", right: "" }))];
  const templateRecord = is<WikiAdminRecord>(modalState.draft, modalState.tabId === "wikis")
    ? findTemplateRecordForWikiRecord(modalState.draft, itemsByTab) : undefined;
  const inheritedRoutingRows = field.key === "writablePrefixBags" && modalState.tabId === "wikis" && templateRecord
    ? mappingRowsCodec.parse(templateRecord.writablePrefixBags ?? "")
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
              onDraftChange(field.key, editableMappingRowsCodec.stringify(nextRows));
              if (!hadStoredRow && (element.value.trim() || row.right.trim())) onPendingRowsChange(field.key, (count) => count - 1);
            }} ref={(element) => {
              if (element.value !== row.left) element.value = row.left;
            }} />
            {hasTrimMismatch(row.left) ? <span class="prefix-input-alert missing-marker" aria-label="Prefix has leading or trailing whitespace" title="Prefix cannot start or end with whitespace."><MaterialSymbol icon={warningIcon} /></span> : null}
          </div>
          {renderSearchableInput(ctx, {
            id: `${inputId}-${index}-target`,
            currentValue: row.right,
            placeholder: "Target bag",
            options: lookupOptions,
            onInput: (nextValue) => {
              const hadStoredRow = index < mappingRows.length;
              const nextRows = mappingRows.length ? [...mappingRows] : [{ left: "", right: "" }];
              nextRows[index] = { ...row, right: nextValue };
              onDraftChange(field.key, editableMappingRowsCodec.stringify(nextRows));
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
            onDraftChange(field.key, editableMappingRowsCodec.stringify(nextRows));
          }}>Remove</button>
        </div>
      ))}
      <button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>Add prefix rule</button>
      {inheritedRoutingRows.length ? (
        <div class="field-callout">
          <p>Writable bags inherited from template:</p>
          <ul class="value-list">
            {inheritedRoutingRows.map((row) => (
              <li>
                {row.left ? row.left : <span class="pill-value pill-value-small">default</span>} {"->"} {row.right}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function renderSelectField(ctx: FieldEditorContext) {
  const { field, value, disabled, itemsByTab, inputId, onDraftChange } = ctx;
  const options = getSelectOptions(field, itemsByTab);
  return (
    <select id={inputId} class="field-select" disabled={disabled} onchange={(event) => onDraftChange(field.key, (event.currentTarget as HTMLSelectElement).value)}>
      <option value="" selected={!value}>Select...</option>
      {options.map((option) => <option value={option} selected={option === value}>{option}</option>)}
    </select>
  );
}

function renderAutocompleteField(ctx: FieldEditorContext) {
  const { field, value, disabled, itemsByTab, inputId, onDraftChange } = ctx;
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

function renderActionField(ctx: FieldEditorContext) {
  const { field, value, modalState, onTriggerOperation } = ctx;
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
}

function renderResolverPreviewField(ctx: FieldEditorContext) {
  const { modalState, inputId, onResolverTitleChange } = ctx;
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

// --- Readonly (non-editable) field renderers, moved from ReadonlyFieldElement ---

/** The subset of FieldEditorContext that the readonly renderers need. */
interface ReadonlyFieldContext {
  field: FieldDefinition;
  value: string;
  itemsByTab?: ItemsByTab;
}

function renderReferenceField(ctx: ReadonlyFieldContext) {
  return <div class="pill-value">{formatFieldValue(ctx.value)}</div>;
}

function renderValueListField(ctx: ReadonlyFieldContext) {
  const lines = lineListCodec.parse(ctx.value);
  return <ul class="value-list">{lines.map((line) => <li>{line}</li>)}</ul>;
}

function renderActivityFeedField(ctx: ReadonlyFieldContext) {
  const lines = lineListCodec.parse(ctx.value);
  return <ul class="timeline-list">{lines.map((line) => <li>{line}</li>)}</ul>;
}

function renderMetadataTableField(ctx: ReadonlyFieldContext) {
  const lines = lineListCodec.parse(ctx.value);
  return <dl class="meta-list">{lines.map((line) => {
    const [key, ...rest] = line.split(":");
    return <><dt>{key}</dt><dd>{rest.join(":").trim()}</dd></>;
  })}</dl>;
}

function renderTableField(ctx: ReadonlyFieldContext) {
  const { field, value, itemsByTab } = ctx;
  const lines = lineListCodec.parse(value);
  const missingDependencyLines = getMissingDependencyLines(field, value, itemsByTab);
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
}

function renderCalloutField(ctx: ReadonlyFieldContext) {
  return <div class="field-callout"><p>{formatFieldValue(ctx.value)}</p></div>;
}

function renderPreField(ctx: ReadonlyFieldContext) {
  return (
    <div class="field-value">
      <pre>{formatFieldValue(ctx.value)}</pre>
    </div>
  );
}

abstract class BaseFieldTypeHandler {
  protected constructor(public readonly fieldTypes: readonly FieldType[]) { }

  public renderEditor(ctx: FieldEditorContext) {
    return renderTextareaField(ctx, 5);
  }

  public renderSidebar(ctx: ReadonlyFieldContext) {
    return renderPreField(ctx);
  }
}

abstract class FieldTypeHandler<T> extends BaseFieldTypeHandler {

  public abstract parse(item: string): T;

  public abstract stringify(item: T): string;

  public renderEditor(ctx: FieldEditorContext) {
    return renderTextareaField(ctx, 5);
  }

  public renderSidebar(ctx: ReadonlyFieldContext) {
    return renderPreField(ctx);
  }
}

abstract class StringFieldTypeHandler extends FieldTypeHandler<string> {

  public parse(item: string): string { return item; }

  public stringify(item: string): string { return item; }

  public renderEditor(ctx: FieldEditorContext) {
    return renderTextareaField(ctx, 5);
  }

  public renderSidebar(ctx: ReadonlyFieldContext) {
    return renderPreField(ctx);
  }
}

class TextInputFieldHandler extends StringFieldTypeHandler {
  constructor(fieldTypes: readonly FieldType[], private readonly inputType: "text" | "number") {
    super(fieldTypes);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderTextInputField(ctx, this.inputType);
  }
}

class TextareaFieldHandler extends StringFieldTypeHandler {
  constructor(fieldTypes: readonly FieldType[], private readonly rows: number, private readonly extraClass = "") {
    super(fieldTypes);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderTextareaField(ctx, this.rows, this.extraClass);
  }
}

class JsonEditorFieldHandler extends FieldTypeHandler<KeyValueRow[]> {
  constructor() {
    super(["json-editor"]);
  }

  public parse(value: string) {
    return jsonObjectRowsCodec.parse(value);
  }

  public stringify(rows: KeyValueRow[]) {
    return jsonObjectRowsCodec.stringify(rows);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return ctx.field.key === "parameters" ? renderParametersEditor(ctx) : renderTextareaField(ctx, 8, "is-code");
  }
}

class SearchMultiselectFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super(["search-multiselect"]);
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderSearchMultiselectField(ctx);
  }
}

class PermissionTableFieldHandler extends FieldTypeHandler<PermissionRow[]> {
  constructor() {
    super(["permission-table"]);
  }

  public parse(value: string) {
    return permissionRowsCodec.parse(value);
  }

  public stringify(rows: PermissionRow[]) {
    return permissionRowsCodec.stringify(rows);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderPermissionTableField(ctx);
  }
}

class KeyValueTableFieldHandler extends FieldTypeHandler<MappingRow[]> {
  constructor() {
    super(["key-value-table"]);
  }

  public parse(value: string) {
    return editableMappingRowsCodec.parse(value);
  }

  public stringify(rows: MappingRow[]) {
    return editableMappingRowsCodec.stringify(rows);
  }

  public normalize(value: string) {
    return editableMappingRowsCodec.normalize(value);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderKeyValueTableField(ctx);
  }
}

class SelectFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super(["select"]);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderSelectField(ctx);
  }
}

class AutocompleteFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super(["autocomplete"]);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderAutocompleteField(ctx);
  }
}

class ActionFieldHandler extends BaseFieldTypeHandler {
  constructor() {
    super(["action"]);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderActionField(ctx);
  }
}

class ResolverPreviewFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super(["resolver-preview"]);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderResolverPreviewField(ctx);
  }
}

class ReferenceFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super(["reference"]);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    return renderReferenceField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderReferenceField(ctx);
  }
}

class ValueListFieldHandler extends FieldTypeHandler<string[]> {
  constructor(fieldTypes: readonly FieldType[]) {
    super(fieldTypes);
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    return renderValueListField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderValueListField(ctx);
  }
}

class ActivityFeedFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super(["activity-feed"]);
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    return renderActivityFeedField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderActivityFeedField(ctx);
  }
}

class MetadataTableFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super(["metadata-table"]);
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    return renderMetadataTableField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderMetadataTableField(ctx);
  }
}

class TableFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super(["table"]);
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    return renderTableField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderTableField(ctx);
  }
}

class CalloutFieldHandler extends BaseFieldTypeHandler {
  constructor(fieldTypes: readonly FieldType[]) {
    super(fieldTypes);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    return renderCalloutField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderCalloutField(ctx);
  }
}

class FallbackFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super([]);
  }
}

const fieldTypeHandlers: BaseFieldTypeHandler[] = [
  new TextInputFieldHandler(["string", "version"], "text"),
  new TextInputFieldHandler(["number"], "number"),
  new TextareaFieldHandler(["text"], 4),
  new JsonEditorFieldHandler(),
  new SearchMultiselectFieldHandler(),
  new PermissionTableFieldHandler(),
  new KeyValueTableFieldHandler(),
  new SelectFieldHandler(),
  new AutocompleteFieldHandler(),
  new ActionFieldHandler(),
  new ResolverPreviewFieldHandler(),
  new ReferenceFieldHandler(),
  new ValueListFieldHandler(["parameter-list", "relationship-table", "summary-list"]),
  new ActivityFeedFieldHandler(),
  new MetadataTableFieldHandler(),
  new TableFieldHandler(),
  new CalloutFieldHandler(["structured-preview", "validation-report"]),
];

const fallbackFieldHandler = new FallbackFieldHandler();

const fieldHandlerByType = new Map<FieldType, BaseFieldTypeHandler>(
  fieldTypeHandlers.flatMap((handler) => handler.fieldTypes.map((fieldType) => [fieldType, handler] as const)),
);

function getFieldHandler(fieldType: FieldType): BaseFieldTypeHandler {
  return fieldHandlerByType.get(fieldType) ?? fallbackFieldHandler;
}

/**
 * Dispatches readonly field types to their renderers. Used both by the
 * ReadonlyFieldElement custom element and (for the duplicated types) by
 * renderFieldEditor.
 */
function renderFieldSidebar(ctx: ReadonlyFieldContext) {
  return getFieldHandler(ctx.field.type).renderSidebar(ctx);
}

function renderFieldEditor(input: FieldEditorInput) {
  const ctx: FieldEditorContext = { ...input, inputId: `field-${input.field.key}` };
  return getFieldHandler(ctx.field.type).renderEditor(ctx);
}

@customElement("mws-field-block")
class FieldBlockElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: FieldBlockProps;

  protected render() {
    const { field, modalMode, useCardTitle, value, modalState } = this.props;
    const editable = isEditable(field, modalMode);
    const disabled = Boolean(this.props.disabled) || !editable;
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
            {renderFieldEditor({
              field,
              value,
              disabled,
              modalState,
              itemsByTab: this.props.itemsByTab,
              onDraftChange: this.props.onDraftChange,
              onPendingRowsChange: this.props.onPendingRowsChange,
              onTransientPermissionRowsChange: this.props.onTransientPermissionRowsChange,
              onResolverTitleChange: this.props.onResolverTitleChange,
              onTriggerOperation: this.props.onTriggerOperation,
            })}
          </div>
        )}
      </div>
    );
  }
}

function sidebarField(field: FieldDefinition, draft: AdminRecord, itemsByTab?: ItemsByTab) {
  return sidebarSection({
    title: field.label,
    content: renderFieldSidebar({ field, value: draft[field.key] ?? "", itemsByTab })
  })
}
function sidebarSection({ title, content }: SidebarSectionProps) {
  return (
    <div class="sidebar-section">
      <h4 class="sidebar-section-title">{title}</h4>
      <div class="sidebar-section-body">{content}</div>
    </div>
  );
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
    const baseNameFact = selectedTab.id === "templates" ? selectedTab.fields.find((field) => field.key === "name") ?? null : null;
    const descriptionFact = selectedTab.id === "templates" ? selectedTab.fields.find((field) => field.key === "description") ?? null : null;
    const dependentWikisFact = selectedTab.id === "templates" ? selectedTab.fields.find((field) => field.key === "dependentWikis") ?? null : null;
    // const genericSummaryFields = selectedTab.id !== "wikis" && selectedTab.id !== "templates"
    //   ? getSummaryColumns(selectedTab)
    //     .map((column) => selectedTab.fields.find((field) => field.key === column.key) ?? null)
    //     .filter((field): field is FieldDefinition => Boolean(field))
    //   : [];

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
                    {sidebarSection({
                      title: "Wiki status",
                      content: (
                        <dl class="summary-listing">
                          {sidebarFacts.map((fact) => (
                            <>
                              <dt>{fact.label}</dt>
                              <dd>{fact.value}</dd>
                            </>
                          ))}
                        </dl>
                      )
                    })}

                    {effectiveBagField ? sidebarField(effectiveBagField, modalState.draft, itemsByTab) : null}

                    {effectivePluginField ? sidebarField(effectivePluginField, modalState.draft, itemsByTab) : null}
                  </>
                ) : (
                  selectedTab.id === "templates" ? (
                    <>
                      {baseNameFact ? sidebarField(baseNameFact, modalState.draft, itemsByTab) : null}

                      {descriptionFact ? sidebarField(descriptionFact, modalState.draft, itemsByTab) : null}

                      {dependentWikisFact ? sidebarField(dependentWikisFact, modalState.draft, itemsByTab) : null}
                    </>
                  ) : (
                    <>
                      <dl class="summary-listing">
                        {sidebarFacts.map((fact) => (
                          <>
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                          </>
                        ))}
                      </dl>

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
                        {getFieldGroups(selectedTab, section, fields).map((group) => {
                          const groupFields = group.keys
                            .map((key) => fields.find((field) => field.key === key))
                            .filter((field): field is FieldDefinition => Boolean(field));
                          const headerField = group.headerFieldKey
                            ? fields.find((field) => field.key === group.headerFieldKey)
                            : undefined;
                          const groupDisabled = Boolean(group.disabledWhenHeaderOff && headerField && (modalState.draft[headerField.key] ?? "disabled") !== "enabled");
                          const headerDescription = group.description ?? (!group.footerDescriptionFromHeader ? headerField?.description : undefined) ?? getSectionSummary(section, selectedTab.id);
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

  constructor() {
    super()
  }

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
      const snapshot = modalState; // nah, ai be tripping
      setStorageError("");
      setIsSaving(true);
      const savedTabItems = await adminStorage.save(
        snapshot.tabId,
        snapshot.draft,
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
            <p class="eyebrow">Multi-wiki server administration</p>
            <h1 style="display:flex; gap: 1rem; align-items:center;">
              {/* <img src={pathPrefix + "/favicon.png"} style="width:2rem;height:2rem;" /> */}
              <span>MWS</span>
            </h1>
            <p class="hero-copy">All your thoughts, in as many places as you need them.</p>
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
          {getAllTabs().map((tab) => (
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
              <p>{isLoadingData
                ? "Loading…"
                : "Click any row to for more information."}</p>
            </div>
            <div class="toolbar-actions">
              <button
                class="ghost-button"
                type="button"
                onclick={() => openCreate(currentTab.id)}
                disabled={isLoadingData || isOpeningItem || isSaving}
              >{getCreateLabel(currentTab)}</button>
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
                <p>Loading {currentTab.label.toLowerCase()}…</p>
              </div>
            ) : activeTabItems.length ? activeTabItems.map((item) => (
              <button class="list-grid list-row" type="button" onclick={() => openItem(currentTab.id, item.id)} disabled={isOpeningItem || isSaving}>
                {currentTab.columns.map((column) => (
                  <div class="list-cell">{renderListCellValue(column.key, item[column.key])}</div>
                ))}
              </button>
            )) : (
              <div class="field-callout">
                <p>Create a {currentTab.label.toLowerCase()} to get started.</p>
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

const adminStorage: AdminStorage = new InMemoryAdminStorage(deriveItems);
