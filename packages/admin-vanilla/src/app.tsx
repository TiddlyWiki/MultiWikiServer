import { customElement, JSXElement, addstyles, state } from "@tiddlywiki/jsx-lit";
import css from "./app.inline.css";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";
import {
  getAllTabs,
  getTab,
  TabId,
  ColumnDefinition,
  FieldDefinition,
  FieldGroupDefinition,
  FieldSection,
  FieldType,
  Mode,
  TabDefinition,
  TabDef,
  PermissionRow,
  AdminRecordStore,
  DataStore,
  TemplateAdminRecord,
  WikiAdminRecord,
  BagAdminRecord,
  PluginAdminRecord,
  MappingRow,
  RoleAdminRecord,
  UserAdminRecord,
  Reference,
  getSectionHeading,
  TemplateTypes
} from "./definition/tabs";

import { InMemoryAdminStorage } from "./definition/store";

export function definitely<T>(a: any): asserts a is T { }

export function ok<T>(value: T | null | undefined | "" | 0 | false, message?: string): asserts value is T {
  if (!value) throw new Error(message ?? `AssertionError: ${value}`);
}

export function is<T>(a: any, b: boolean): a is T { return b; }

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
// <MaterialSymbol icon={icon} />
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


export type AdminRecord = { id: string; };

type PermissionLevel = "A_read" | "B_write" | "C_admin";
type RecipePermissionLevel = "A_read" | "B_write";
type ModalMode = "create" | "edit";

interface ModalState {
  tabId: TabId;
  mode: ModalMode;
  draft: AdminRecord;
  /** The unedited original the draft was from. */
  saved: AdminRecord;
  resolverTitle: string;
  operationMessages: Record<string, string>;
  pendingRows: Record<string, number>;
  transientPermissionRows: Record<string, PermissionRow[]>;
  loading?: boolean;
}

export interface AdminStorage {
  loadAll(): Promise<AdminRecordStore>;
  read(tabId: TabId, id: string): Promise<AdminRecord | null>;
  save(tabId: TabId, record: AdminRecord): Promise<AdminRecord[]>;
}

type DraftChangeHandler<T = unknown> = (fieldKey: string, value: T) => void;
type PendingRowsChangeHandler = (fieldKey: string, updater: (count: number) => number) => void;
type PermissionRowsChangeHandler = (fieldKey: string, rows: PermissionRow[]) => void;
type ResolverTitleChangeHandler = (value: string) => void;
type OperationTriggerHandler = (fieldKey: string, message: string) => void;

/** The subset of FieldEditorContext that the readonly renderers need. */
interface ReadonlyFieldContext<T = unknown> {
  field: FieldDefinition;
  value: T;
  itemsByTab?: AdminRecordStore;
}


interface FieldEditorInput<T = unknown> extends ReadonlyFieldContext<T> {
  saved?: T;
  disabled?: boolean;
  modalState: ModalState;
  itemsByTab: AdminRecordStore;
  onDraftChange: DraftChangeHandler<T>;
  onPendingRowsChange: PendingRowsChangeHandler;
  onTransientPermissionRowsChange: PermissionRowsChangeHandler;
  onResolverTitleChange: ResolverTitleChangeHandler;
  onTriggerOperation: OperationTriggerHandler;
}


interface FieldBlockProps extends FieldEditorInput {
  modalMode: ModalMode;
  useCardTitle?: boolean;
}


/** FieldEditorInput plus the derived inputId, shared by the per-type render functions. */
interface FieldEditorContext<T = unknown> extends FieldEditorInput<T> {
  inputId: string;
}

interface MissingDependencyLine {
  value: string;
  missing: boolean;
}

interface SidebarSectionProps {
  title: string;
  content: JSX.Node;
}

interface ToggleFieldProps {
  field: FieldDefinition;
  value: unknown;
  onDraftChange: DraftChangeHandler;
  headerOnly?: boolean;
}

interface RecordModalProps {
  selectedTab: TabDefinition;
  modalState: ModalState;
  itemsByTab: AdminRecordStore;
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


export function isServerField(mode: Mode) {
  return ["create", "create edit", "edit", "server"].includes(mode);
}
function isAuthoredField(mode: Mode) {
  return ["create", "create edit", "edit"].includes(mode);
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

// TODO: fold into tabs variable
function getSelectOptions(field: FieldDefinition, itemsByTab: AdminRecordStore): string[] {
  if (field.key === "status") return ["draft", "published", "archived"];
  if (field.key === "requiredPluginsEnabled" || field.key === "customHtmlEnabled") return ["enabled", "disabled"];
  if (field.key === "templateRef") {
    return Array.from(new Set(itemsByTab.templates.map((item) => item.name).filter(Boolean)));
  }
  return [];
}


function summarizePermissionRoles(value: readonly PermissionRow<string>[]): string {
  return value.map((row) => row.role).filter(Boolean).join(", ");
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
    template.readonlyBags.forEach((bagName) => addUsage(templateReadonlyUsage, bagName, templateName));
  }

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    const templateRecord = findTemplateRecordForWikiRecord(wiki, { ...items, templates, wikis });
    const effectiveReadonlyBags = uniqueLines([
      ...wiki.readonlyBags ?? [],
      ...templateRecord?.readonlyBags ?? [],
    ]);
    effectiveReadonlyBags.forEach((bagName) => addUsage(wikiReadonlyUsage, bagName, wikiName));

    const prefixRows = wiki.writablePrefixBags;
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
      permissionSummary: summarizePermissionRoles(bag.permissions),
      referencedByTemplates: referencedByTemplates.join("\n"),
      referencedByWikis: Array.from(allUsingWikis).join("\n"),
      routingRoles: routingRoles.join("\n"),
    };
  });
}

function derivePluginRecords(items: DataStore, templates: TemplateAdminRecord[], wikis: WikiAdminRecord[]): PluginAdminRecord[] {
  const pluginUsage = new Map<string, Set<string>>();

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    wiki.effectivePluginSet.forEach((pluginValue) => {
      const pluginName = pluginValue.split("@")[0]?.trim() ?? pluginValue.trim();
      if (!pluginName || !wikiName) return;
      mapGetInit(pluginUsage, pluginName, () => new Set<string>()).add(wikiName);
    });
  }

  return items.plugins.map((plugin) => {
    const usedByWikis = Array.from(pluginUsage.get(plugin.name ?? "") ?? []);
    return {
      ...plugin as unknown as PluginAdminRecord,
      usedByWikis,
      usageCount: String(usedByWikis.length),
    };
  });
}


function syncWikiRecord(draft: DataStore["wikis"][number], data: DataStore) {
  const templateRecord = findTemplateRecordForWikiRecord(draft, data);
  const templateReadonlyBags = templateRecord ? templateRecord.readonlyBags : [];
  const templatePlugins = templateRecord ? templateRecord.plugins : [];
  const wikiReadonlyBags = draft.readonlyBags;
  const wikiPlugins = draft.readonlyBags;

  const mergedReadonlyBags = uniqueLines([...wikiReadonlyBags, ...templateReadonlyBags]);
  const mergedPlugins = buildEffectivePluginSet({
    previousEffectivePlugins: (draft as WikiAdminRecord).effectivePluginSet,
    templatePlugins,
    wikiPlugins,
    corePluginsEnabled: !!templateRecord?.requiredPluginsEnabled,
  });
  const writablePrefixBags = draft.writablePrefixBags

  const defaultWritableBag = writablePrefixBags.find((row) => row.left === "")?.right ?? "";
  const prefixRuleCount = String(writablePrefixBags.length);
  const readableBagOrder = buildEffectiveBagStack({
    writablePrefixBags,
    templateReadonlyBags,
    wikiReadonlyBags,
  });
  const missingBags = readableBagOrder.filter((bagName) => !data.availableBagNames.has(bagName));
  const missingPlugins = mergedPlugins.filter((pluginName) => !data.availablePluginNames.has(pluginName));
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
    templateName: templateRecord?.name ?? draft.templateRef?.name ?? "",
    defaultWritableBag,
    readonlyBagCount: String(mergedReadonlyBags.length),
    prefixRuleCount,
    pluginCount: String(mergedPlugins.length),
    compileValidation,
    statusFlags,
    missingBags: lineListCodec.stringify(missingBags),
    missingPlugins: lineListCodec.stringify(missingPlugins),
    titleResolutionPreview: "",
  } satisfies WikiAdminRecord;
}

function deriveItems(items: DataStore): AdminRecordStore {
  items.availableBagNames = new Set(items.bags.map((bag) => bag.name).filter(Boolean));
  items.availablePluginNames = new Set(items.plugins.map((plugin) => plugin.name).filter(Boolean));
  const wikis = items.wikis.map((wiki) => syncWikiRecord(wiki, items));
  const dependentWikiMap = new Map<string, string[]>();
  for (const wiki of wikis) {
    const id = wiki.templateRef?.id;
    mapGetInit(dependentWikiMap, id, () => []).push(wiki.slug || wiki.displayName);
  }

  const templates = items.templates.map((template) => {
    const dependentWikis = dependentWikiMap.get(template.id) ?? [];
    const readonlyBags = template.readonlyBags
    const prefixRows = template.writablePrefixBags
    return {
      ...template,
      readonlyBagsSummary: readonlyBags.join(", "),
      dependentWikis: dependentWikis.join("\n"),
      dependentWikiCount: String(dependentWikis.length),
      defaultWritableBag: prefixRows.find((row) => row.left === "")?.right ?? "",
      validationReport: "placeholder",
      validationStatus: "placeholder",
      lastUpdatedAt: new Date().toISOString(),
    } satisfies TemplateAdminRecord;
    // lastUpdatedAt, validationStatus, validationReport
  });

  const users = items.users.map(e => ({
    ...e,
    confirmPassword: "",
  }))

  return {
    ...items,
    templates,
    wikis,
    users,
    bags: deriveBagRecords(items, templates, wikis),
    plugins: derivePluginRecords(items, templates, wikis),
  } as unknown as AdminRecordStore;
}

function getEmptyItems(): AdminRecordStore {
  return {
    availableBagNames: new Set(),
    availablePluginNames: new Set(),
    wikis: [],
    templates: [],
    bags: [],
    plugins: [],
    roles: [],
    users: [],
  };
}



function createDraft(tab: TabDefinition, source?: AdminRecord): AdminRecord {
  const draft: any = {};
  for (const field of tab.fields) {
    const value = source
      ? getAdminRecordValue(field, source)
      : getFieldHandler(field.type).initCreate();
    setAdminRecordValue(field, draft, value, true);
  }

  if (!source && tab.id === "templates") {
    const draft2: TemplateAdminRecord = draft as any;
    draft2.requiredPluginsEnabled = true;
    draft2.customHtmlEnabled = false;
    draft2.injectionArray = "$tw.preloadTiddlers";
  }

  return draft;
}

function getPrimaryValue(tab: TabDefinition, item: AdminRecord): string {
  const primary = tab.columns[0] ?? tab.fields[0];
  return formatFieldValue(getAdminRecordValue(primary, item));
}

function getCreateLabel(tab: TabDefinition): string {
  return tab.createLabel;
}


function getLookupOptions(fieldKey: string, itemsByTab: AdminRecordStore): string[] {
  if (fieldKey === "readonlyBags" || fieldKey === "writablePrefixBags") {
    return Array.from(new Set(itemsByTab.bags.map((item) => item.name).filter(Boolean)));
  }
  if (fieldKey === "plugins") {
    return Array.from(new Set(itemsByTab.plugins.map((item) => item.name).filter(Boolean)));
  }
  if (fieldKey === "userRoles") {
    return Array.from(new Set(itemsByTab.roles.map((item) => item.name).filter(Boolean)));
  }
  if (fieldKey === "permissions" || fieldKey === "recipePermissions") {
    return Array.from(new Set([
      ...itemsByTab.bags.flatMap((item) => item.permissions.map((row) => row.role)),
      ...itemsByTab.wikis.flatMap((item) => item.recipePermissions.map((row) => row.role)),
    ].filter(Boolean)));
  }
  return [];
}

function getPermissionLevelsForField(fieldKey: string): PermissionLevel[] | RecipePermissionLevel[] {
  return fieldKey === "recipePermissions" ? recipePermissionLevels : bagPermissionLevels;
}

function formatPermissionLevel(level: string): string {
  return level.replace(/^[A-Z]_/, "");
}

function getFieldSection(field: FieldDefinition): FieldSection {
  return field.section ?? (isAuthoredField(field.mode) ? "authored" : "runtime");
}

function getSectionFields(tab: TabDefinition, section: FieldSection): FieldDefinition[] {
  // if (tab.id === "wikis" && section === "runtime") return [];
  // if (tab.id === "templates" && section === "runtime") return [];
  if (!tab.fieldGroups?.[section]?.length) return [];
  return tab.fields.filter((field) => {
    return getFieldSection(field) === section;
  });
}

function getSidebarFields(tab: TabDefinition) {
  const keys = new Set(tab.sidebarDisplay);
  return tab.fields.filter(e => keys.has(e.key));
}

function getFieldGroups(tab: TabDefinition, section: FieldSection, fields: FieldDefinition[]): FieldGroupDefinition[] {
  const fallback = fields.map((field) => ({ keys: [field.key], width: "half" as const }));

  const configuredGroups = tab.fieldGroups?.[section];
  if (!configuredGroups) return fallback;

  return configuredGroups.filter((group) => group.keys.some((key) => fields.some((field) => field.key === key)));
}

function findTemplateRecordForWikiRecord(draft: DataStore["wikis"][number], itemsByTab: DataStore) {
  const id = draft.templateRef?.id;
  return itemsByTab.templates.find((template) => id === template.id);
}

function uniqueLines(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildEffectivePrefixObject(writablePrefixBags: (readonly MappingRow[])[]): readonly MappingRow[] {
  const result: Record<string, string> = {};
  for (const list of writablePrefixBags) {
    for (const row of list) {
      if (typeof row.left !== "string" || typeof row.right !== "string")
        throw new Error("Expects an object of { left: string; right: string; }.")
      result[row.left] ??= row.right;
    }
  }
  return Object.entries(result).map(([left, right]) => ({ left, right })).sort((a, b) => b.left.length - a.left.length);
}

function buildEffectiveBagStack({
  writablePrefixBags: prefixRows,
  templateReadonlyBags,
  wikiReadonlyBags,
}: {
  writablePrefixBags: readonly MappingRow[];
  templateReadonlyBags: readonly string[];
  wikiReadonlyBags: readonly string[];
}): string[] {
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
  previousEffectivePlugins: readonly string[];
  templatePlugins: readonly string[];
  wikiPlugins: readonly string[];
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

class PermissionRowsCodec {
  public parse(value: PermissionRow[]): PermissionRow[] {
    return JSON.parse(JSON.stringify(value));
    // return value.split("\n").map((entry) => entry.trim()).filter(Boolean).map((row) => {
    //   const [role, levelText] = row.split(":").map((part) => part?.trim() ?? "");
    //   const allPermissionLevels = [...bagPermissionLevels];
    //   const level = allPermissionLevels.includes(levelText as PermissionLevel) ? levelText as PermissionLevel : "A_read";
    //   return { role, level };
    // });
  }

  public stringify(value: PermissionRow[]): PermissionRow[] {
    return JSON.parse(JSON.stringify(value));
    // return rows
    //   .map((row) => ({ role: row.role.trim(), level: row.level }))
    //   .filter((row) => row.role)
    //   .map((row) => `${row.role}:${row.level}`)
    //   .join("\n");
  }
}

const lineListCodec = new LineListCodec();
const permissionRowsCodec = new PermissionRowsCodec();



function formatFieldValue(value: any): string {
  if (typeof value === "string")
    return value && value.trim() ? value : "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    if (typeof value[0] === "string")
      return value.join("\n"); // value.length ?  : "—";
    if (typeof value[0] === "object") {
      if (typeof value[0].left === "string")
        return value.map(e => `${e.left}: ${e.right}`).join("\n");
      if (typeof value[0].name === "string")
        return value.map(e => `${e.name}`).join("\n");
    }
  }
  console.error("value is not supported", value)
  throw new Error("value is not supported");
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

type ListColumnLinkMapper = (item: AdminRecord) => string | null;

function getListColumnLinkMappers(tabId: TabId): Partial<Record<string, ListColumnLinkMapper>> {
  switch (tabId) {
    case "wikis":
      return {
        slug: (item) => {
          definitely<WikiAdminRecord>(item);
          return item.slug ? `${pathPrefix}/wiki/${encodeURIComponent(item.slug)}` : null;
        },
      };
    case "templates":
    case "bags":
    case "plugins":
    case "roles":
    case "users":
      return {};
    default: {
      const exhaustive: never = tabId;
      return exhaustive;
    }
  }
}

function getListColumnLink(tabId: TabId, columnKey: string, item: AdminRecord): string | null {
  const mapper = getListColumnLinkMappers(tabId)[columnKey];
  return mapper ? mapper(item) : null;
}

function renderSearchableInput({ id, currentValue, placeholder, options, onInput, disabled }: {
  id: string;
  currentValue: string;
  placeholder: string;
  options: string[];
  onInput: (nextValue: string) => void;
  disabled: boolean | undefined;
}) {
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
}

function renderTextInputField(ctx: FieldEditorContext, type: "text" | "number") {
  const { field, value, disabled, inputId, onDraftChange } = ctx;
  definitely<string>(value);
  return <input id={inputId} class="field-input" type={type} value={value} ref={(element) => {
    if (element.value !== value) element.value = value;
  }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).value)} />;
}

function renderTextareaField(ctx: FieldEditorContext, rows: number, extraClass = "") {
  const { field, value, disabled, inputId, onDraftChange } = ctx;
  definitely<string>(value);
  const className = extraClass ? `field-textarea ${extraClass}` : "field-textarea";
  return <textarea id={inputId} class={className} rows={rows} ref={(element) => {
    if (element.value !== value) element.value = value;
  }} disabled={disabled} oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
}

function renderSelectField(ctx: FieldEditorContext) {
  const { field, value, disabled, itemsByTab, inputId, onDraftChange } = ctx;
  definitely<string>(value);
  const options = getSelectOptions(field, itemsByTab);
  return (
    <select id={inputId} class="field-select" disabled={disabled} onchange={(event) => onDraftChange(field.key, (event.currentTarget as HTMLSelectElement).value)}>
      <option value="" selected={!value}>Select...</option>
      {options.map((option) => <option value={option} selected={option === value}>{option}</option>)}
    </select>
  );
}

function renderActivityFeedField(ctx: ReadonlyFieldContext<readonly string[]>) {
  const lines = ctx.value;
  return <ul class="timeline-list">{lines.map((line) => <li>{line}</li>)}</ul>;
}

function renderMetadataTableField(ctx: ReadonlyFieldContext<readonly string[]>) {
  const lines = ctx.value;
  return <dl class="meta-list">{lines.map((line) => {
    const [key, ...rest] = line.split(":");
    return <><dt>{key}</dt><dd>{rest.join(":").trim()}</dd></>;
  })}</dl>;
}

function renderTableField(ctx: ReadonlyFieldContext) {
  const { field, value, itemsByTab } = ctx;
  definitely<readonly string[]>(value);
  const missingCheck =
    itemsByTab ?
      field.key === "effectiveReadonlyBags" ? itemsByTab.availableBagNames :
        field.key === "effectivePluginSet" ? itemsByTab.availablePluginNames :
          null : null;
  const lines = value.map(line => ({ line, missing: missingCheck && !missingCheck.has(line), }));
  return <ul class="value-list">{lines.map(({ line, missing }) => <li>
    {line}
    {missing ? <span class="missing-marker" aria-label="Missing dependency" title="Missing dependency"><MaterialSymbol icon={warningIcon} /></span> : null}
  </li>)}</ul>;
}

function renderCalloutField(ctx: ReadonlyFieldContext) {
  definitely<string>(ctx.value);
  return <div class="field-callout"><p>{formatFieldValue(ctx.value)}</p></div>;
}

function renderPreField(ctx: ReadonlyFieldContext) {
  definitely<string>(ctx.value);
  return (
    <div class="field-value">
      <pre>{formatFieldValue(ctx.value)}</pre>
    </div>
  );
}

abstract class FieldTypeHandler<T = unknown> {

  public abstract initCreate(): T;

  public renderEditor(ctx: FieldEditorContext<any>): JSX.Node {
    return renderTextareaField(ctx, 5);
  }

  public renderSidebar(ctx: ReadonlyFieldContext): JSX.Node {
    if (typeof ctx.value !== "string") console.log(ctx);
    return (
      <div class="field-value">
        <pre>{formatFieldValue(ctx.value)}</pre>
      </div>
    );
  }
}

abstract class StringFieldTypeHandler extends FieldTypeHandler<string> {

  public initCreate(): string {
    return "";
  }

  public parse(item: string): string { return item; }

  public stringify(item: string): string { return item; }

  public renderEditor(ctx: FieldEditorContext<any>) {
    return renderTextareaField(ctx, 5);
  }

}

class TemplateTypeFieldHandler extends FieldTypeHandler<TemplateTypes> {
  public initCreate() {
    return "simpleV1" as const;
  }

  public renderEditor(ctx: FieldEditorContext<any>): JSX.Node {
    return null;
  }
  public renderSidebar(ctx: ReadonlyFieldContext): JSX.Node {
    return null;
  }


}

class TextInputFieldHandler extends StringFieldTypeHandler {
  constructor(private readonly inputType: "text" | "number") {
    super();
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderTextInputField(ctx, this.inputType);
  }
}

class TextareaFieldHandler extends StringFieldTypeHandler {
  constructor(private readonly rows: number, private readonly extraClass = "") {
    super();
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderTextareaField(ctx, this.rows, this.extraClass);
  }
}

class SearchMultiselectFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super();
  }

  public initCreate(): string[] {
    return [];
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext<readonly string[]>): JSX.Node {
    return <ul>
      {ctx.value.map(e => <li>{e}</li>)}
    </ul>
  }

  public override renderEditor(ctx: FieldEditorContext<readonly string[]>) {
    const { field, value, disabled, modalState, itemsByTab, inputId, onDraftChange, onPendingRowsChange } = ctx;
    if (typeof value === "string") {
      console.log(ctx);
      throw new Error("value is a string");
    }
    const editableLines = value;
    const pendingRowCount = modalState.pendingRows[field.key] ?? 0;
    const lookupOptions = getLookupOptions(field.key, itemsByTab);
    const itemLabel = field.key === "plugins"
      ? "plugin"
      : field.key === "userRoles"
        ? "role id"
        : "bag";
    const templateRecord = is<WikiAdminRecord>(modalState.draft, modalState.tabId === "wikis")
      ? findTemplateRecordForWikiRecord(modalState.draft, itemsByTab as AdminRecordStore) : undefined;
    const templateReadonlyBagLines = field.key === "readonlyBags" && templateRecord ? templateRecord.readonlyBags : [];
    const templatePluginLines = field.key === "plugins" && templateRecord ? templateRecord.plugins : [];
    const templateCorePluginsEnabled = Boolean(templateRecord?.requiredPluginsEnabled);

    const updateLineValueAt = (index: number, nextValue: string) => {
      const lines = value.slice();
      const hadStoredRow = index < lines.length;
      while (lines.length <= index) lines.push("");
      lines[index] = nextValue;
      onDraftChange(field.key, lines);
      if (!hadStoredRow && nextValue.trim()) onPendingRowsChange(field.key, (count) => count - 1);
    };

    const removeLineValueAt = (index: number) => {
      const lines = value.slice();
      if (index >= lines.length) {
        onPendingRowsChange(field.key, (count) => count - 1);
        return;
      }
      lines.splice(index, 1);
      onDraftChange(field.key, lines);
    };

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
              placeholder: `${itemLabel.charAt(0).toUpperCase()}${itemLabel.slice(1)} name`,
              options: lookupOptions,
              onInput: (nextValue) => updateLineValueAt(index, nextValue),
              disabled: ctx.disabled
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
}

class PermissionTableFieldHandler extends FieldTypeHandler<readonly PermissionRow[]> {
  constructor() {
    super();
  }

  public initCreate(): PermissionRow<string>[] {
    return [];
  }

  public override renderEditor(ctx: FieldEditorContext<readonly PermissionRow[]>) {
    const { field, disabled, modalState, itemsByTab, inputId, onDraftChange, onTransientPermissionRowsChange } = ctx;
    definitely<readonly PermissionRow[]>(ctx.value);
    const permissionRows = ctx.value;
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
            {renderSearchableInput({
              id: `${inputId}-${index}-role`,
              currentValue: row.role,
              placeholder: "Role",
              options: lookupOptions,
              disabled: ctx.disabled,
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
}

class PrefixTableFieldHandler extends FieldTypeHandler<MappingRow[]> {
  constructor() {
    super();
  }

  public initCreate(): MappingRow[] {
    return [];
  }

  public override renderEditor(ctx: FieldEditorContext) {
    const { field, value, disabled, modalState, itemsByTab, inputId, onDraftChange, onPendingRowsChange } = ctx;
    const forDisplay = field.mode === "server";
    definitely<MappingRow[]>(value);
    const mappingRows = value;
    const pendingRowCount = modalState.pendingRows[field.key] ?? 0;
    const lookupOptions = getLookupOptions(field.key, itemsByTab);
    const displayedMappingRows = mappingRows.length
      ? [...mappingRows, ...Array.from({ length: pendingRowCount }, () => ({ left: "", right: "" }))]
      : [{ left: "", right: "" }, ...Array.from({ length: pendingRowCount }, () => ({ left: "", right: "" }))];
    const templateRecord = is<WikiAdminRecord>(modalState.draft, modalState.tabId === "wikis")
      ? findTemplateRecordForWikiRecord(modalState.draft, itemsByTab) : undefined;
    const inheritedRoutingRows = modalState.tabId === "wikis" && templateRecord ? templateRecord.writablePrefixBags : [];

    if (forDisplay) {
      return this.displayMappingRows(displayedMappingRows)
    }
    return (
      <div class="row-editor-stack">
        {displayedMappingRows.map((row, index) => (
          <div class="row-editor-row row-editor-row-wide">
            <div class="prefix-input-shell">
              <input class={this.hasTrimMismatch(row.left) ? "field-input is-invalid" : "field-input"}
                type="text"
                value={row.left}
                placeholder="Prefix, leave blank for default"
                aria-invalid={this.hasTrimMismatch(row.left) ? "true" : undefined}
                title={this.hasTrimMismatch(row.left) ? "Prefix has leading or trailing whitespace. Is this intentional?" : undefined}
                disabled={disabled}
                oninput={(event) => {
                  const element = event.currentTarget as HTMLInputElement;
                  const hadStoredRow = index < mappingRows.length;
                  const nextRows = mappingRows.length ? [...mappingRows] : [{ left: "", right: "" }];
                  nextRows[index] = { ...row, left: element.value };
                  onDraftChange(field.key, nextRows);
                  if (!hadStoredRow && (element.value || row.right.trim())) onPendingRowsChange(field.key, (count) => count - 1);
                }} ref={(element) => {
                  if (element.value !== row.left) element.value = row.left;
                }} />
              {this.hasTrimMismatch(row.left) ? <span
                class="prefix-input-alert missing-marker"
                aria-label="Prefix has leading or trailing whitespace"
                title="Prefix has leading or trailing whitespace. Is this intentional?"
              ><MaterialSymbol icon={warningIcon} /></span> : null}
            </div>
            {renderSearchableInput({
              id: `${inputId}-${index}-target`,
              currentValue: row.right,
              placeholder: "Target bag",
              options: lookupOptions,
              disabled: ctx.disabled,
              onInput: (nextValue) => {
                const hadStoredRow = index < mappingRows.length;
                const nextRows = mappingRows.length ? [...mappingRows] : [{ left: "", right: "" }];
                nextRows[index] = { ...row, right: nextValue };
                onDraftChange(field.key, nextRows);
                if (!hadStoredRow && (row.left || nextValue.trim())) onPendingRowsChange(field.key, (count) => count - 1);
              },
            })}
            {<button type="button" class="row-action-button" disabled={disabled} onclick={() => {
              if (index >= mappingRows.length) {
                onPendingRowsChange(field.key, (count) => count - 1);
                return;
              }
              const nextRows = mappingRows.length ? [...mappingRows] : [];
              nextRows.splice(index, 1);
              onDraftChange(field.key, nextRows);
            }}>Remove</button>}
          </div>
        ))}
        {<button type="button" class="ghost-button" disabled={disabled} onclick={() => onPendingRowsChange(field.key, (count) => count + 1)}>Add prefix rule</button>}
        {inheritedRoutingRows.length ? (
          <div class="field-callout">
            <p>Writable bags inherited from template:</p>
            {this.displayMappingRows(buildEffectivePrefixObject([mappingRows, inheritedRoutingRows]))}
          </div>
        ) : null}
      </div>
    );
  }
  private displayMappingRows(displayedMappingRows: readonly MappingRow[]) {
    return <table class="value-table">
      {displayedMappingRows.map((row) => (
        <tr>
          <td>{row.left ? <code>{'"' + row.left + '"'}</code> : <span class="pill-value pill-value-small">default</span>}</td>
          <td>{row.right}</td>
        </tr>
      ))}
    </table>;
  }

  private hasTrimMismatch(value: string): boolean {
    return value.trim() !== value;
  }
}

class SelectFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super();
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return renderSelectField(ctx);
  }
}

class AutocompleteFieldHandler extends FieldTypeHandler<Reference | null> {
  constructor() {
    super();
  }

  public initCreate(): Reference | null {
    return null;
  }

  renderSidebar(ctx: ReadonlyFieldContext<Reference | null>) {
    return ctx.value?.name ?? "";
  }

  public override renderEditor(ctx: FieldEditorContext<Reference | null>) {
    const { field, value, disabled, itemsByTab, inputId, onDraftChange } = ctx;
    const datalistId = `${inputId}-options`;
    const optionMap = new Map(itemsByTab.templates.map(e => [e.name, e.id]))
    const oninput = (event: InputEvent & {
      currentTarget: HTMLInputElement;
      target: Element;
    }) => {
      const name = event.currentTarget.value;
      const id = optionMap.get(name);
      if (!id) return event.preventDefault();
      onDraftChange(field.key, { id, name });
    }
    return (
      <>
        <input id={inputId} class="field-input" type="text" value={value?.name} disabled={disabled}
          ref={(element) => {
            if (value && element.value !== value.name) element.value = value.name;
          }}
          list={datalistId}
          oninput={oninput}
        />
        <datalist id={datalistId}>
          {Array.from(optionMap.keys(), (option) => <option value={option} />)}
        </datalist>
      </>
    );
  }
}

class ResolverPreviewFieldHandler extends StringFieldTypeHandler {
  constructor() {
    super();
  }

  private computeResolverPreview(draft: WikiAdminRecord, title: string) {
    const normalizedTitle = title.trim();
    const targets = draft.effectiveWritableBags.filter((row) => row.right).sort((a, b) => b.left.length - a.left.length);
    const writeTarget = normalizedTitle
      ? (targets.find((target) => target.left && normalizedTitle.startsWith(target.left)) ?? targets.find((target) => target.left === ""))
      : undefined;
    return {
      title: normalizedTitle,
      writeTo: writeTarget?.right ?? "No writable target",
      matchedPrefix: writeTarget ? (writeTarget.left || "default") : "none",
    };
  }


  public override renderEditor(ctx: FieldEditorContext) {
    const { modalState, inputId, onResolverTitleChange } = ctx;
    definitely<WikiAdminRecord>(modalState.draft);
    const preview = this.computeResolverPreview(modalState.draft, modalState.resolverTitle);
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
}

class ValueListFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super();
  }

  public initCreate(): string[] {
    return [];
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext) {
    // TODO: string should probably be a separate class 
    const lines = typeof ctx.value === "string"
      ? lineListCodec.parse(ctx.value)
      : ctx.value as readonly string[];
    return <ul class="value-list">{lines.map((line) => <li>{line}</li>)}</ul>;
  }

  public override renderEditor(ctx: FieldEditorContext) {
    return this.renderSidebar(ctx);
  }

}

class ActivityFeedFieldHandler extends FieldTypeHandler<readonly string[]> {
  constructor() {
    super();
  }

  public initCreate(): string[] {
    return [];
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext<readonly string[]>) {
    return renderActivityFeedField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext<readonly string[]>) {
    return renderActivityFeedField(ctx);
  }
}

class MetadataTableFieldHandler extends FieldTypeHandler<readonly string[]> {
  constructor() {
    super();
  }

  public initCreate(): string[] {
    return [];
  }

  public parse(value: string) {
    return lineListCodec.parse(value);
  }

  public stringify(lines: string[]) {
    return lineListCodec.stringify(lines);
  }

  public override renderSidebar(ctx: ReadonlyFieldContext<readonly string[]>) {
    return renderMetadataTableField(ctx);
  }

  public override renderEditor(ctx: FieldEditorContext<readonly string[]>) {
    return renderMetadataTableField(ctx);
  }
}

class TableFieldHandler extends FieldTypeHandler<string[]> {
  constructor() {
    super();
  }

  public initCreate(): string[] {
    return [];
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

class CalloutFieldHandler extends FieldTypeHandler {
  constructor() {
    super();
  }

  public initCreate(): unknown {
    return "";
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
    super();
  }
}

const textInputFieldHandler = new TextInputFieldHandler("text");
const numberInputFieldHandler = new TextInputFieldHandler("number");
const textareaFieldHandler = new TextareaFieldHandler(4);
const searchMultiselectFieldHandler = new SearchMultiselectFieldHandler();
const permissionTableFieldHandler = new PermissionTableFieldHandler();
const prefixTableFieldHandler = new PrefixTableFieldHandler();
const selectFieldHandler = new SelectFieldHandler();
const autocompleteFieldHandler = new AutocompleteFieldHandler();
const resolverPreviewFieldHandler = new ResolverPreviewFieldHandler();
const valueListFieldHandler = new ValueListFieldHandler();
const activityFeedFieldHandler = new ActivityFeedFieldHandler();
const metadataTableFieldHandler = new MetadataTableFieldHandler();
const tableFieldHandler = new TableFieldHandler();
const calloutFieldHandler = new CalloutFieldHandler();
const templateTypeFieldHandler = new TemplateTypeFieldHandler();

const fieldTypeHandlers = {
  "string": textInputFieldHandler,
  "version": textInputFieldHandler,
  "number": numberInputFieldHandler,
  "text": textareaFieldHandler,
  "search-multiselect": searchMultiselectFieldHandler,
  "permission-table": permissionTableFieldHandler,
  "prefix-table": prefixTableFieldHandler,
  "select": selectFieldHandler,
  "search": autocompleteFieldHandler,
  "resolver-preview": resolverPreviewFieldHandler,
  "parameter-list": valueListFieldHandler,
  "relationship-table": valueListFieldHandler,
  "summary-list": valueListFieldHandler,
  "activity-feed": activityFeedFieldHandler,
  "metadata-table": metadataTableFieldHandler,
  "table": tableFieldHandler,
  "structured-preview": calloutFieldHandler,
  "validation-report": calloutFieldHandler,
  "template-type": templateTypeFieldHandler,
} satisfies Record<FieldType, FieldTypeHandler>;

const fallbackFieldHandler = new FallbackFieldHandler();

function getFieldHandler(fieldType: FieldType): FieldTypeHandler {
  return fieldTypeHandlers[fieldType] ?? fallbackFieldHandler;
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
    const { field, modalMode, useCardTitle, value, saved: savedValue, modalState } = this.props;
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
              saved: savedValue,
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

export function getAdminRecordValue(field: FieldDefinition | ColumnDefinition, draft: AdminRecord) {
  if (!(field.key in draft)) throw new Error("The field " + field.key + " is not defined in the draft record");
  return (draft as any)[field.key];
}
export function setAdminRecordValue(field: FieldDefinition | ColumnDefinition, draft: AdminRecord, value: unknown, init: boolean) {
  if (!init && !(field.key in draft)) throw new Error("The field " + field.key + " is not defined in the draft record");
  (draft as any)[field.key] = value;
}

function sidebarField(field: FieldDefinition, draft: AdminRecord, saved: AdminRecord, itemsByTab?: AdminRecordStore) {
  const value = getAdminRecordValue(field, saved);
  return sidebarSection({
    title: field.label,
    content: getFieldHandler(field.type).renderSidebar({
      field, value, itemsByTab
    })
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
    const sidebarFields = !isModalLoading ? getSidebarFields(selectedTab) : [];

    return (
      <div class="modal-shell" webjsx-attr-open onclick={(event) => {
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
                {sidebarFields.map(field => sidebarField(field, modalState.draft, modalState.saved, itemsByTab))}
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
                          const groupDisabled = Boolean(group.disabledWhenHeaderOff && headerField && (getAdminRecordValue(headerField, modalState.draft) ?? "disabled") !== "enabled");
                          const headerDescription = group.description ?? (!group.footerDescriptionFromHeader ? headerField?.description : undefined) ?? "";
                          const footerDescription = group.footerDescriptionFromHeader ? headerField?.description : undefined;
                          if (!groupFields.length) return null;

                          return (
                            <article class={group.width === "full" ? "field-card is-full" : "field-card"}>
                              <header class="field-card-header">
                                <div class="field-card-header-row">
                                  <h4>{group.title ?? (groupFields.length === 1 ? groupFields[0].label : groupFields.map((field) => field.label).join(" and "))}</h4>
                                  {headerField ? <ToggleFieldElement
                                    field={headerField}
                                    value={getAdminRecordValue(headerField, modalState.draft) ?? ""}
                                    onDraftChange={onDraftChange}
                                    headerOnly={true}
                                  /> : null}
                                </div>
                                {headerDescription ? <p>{headerDescription}</p> : null}
                              </header>

                              <div class={groupFields.length > 1 ? (group.layout === "stack" ? "composite-fields is-stack" : "composite-fields") : "single-field"}>
                                {groupFields.map((field) => (
                                  <FieldBlockElement
                                    field={field}
                                    value={getAdminRecordValue(field, modalState.draft)}
                                    saved={getAdminRecordValue(field, modalState.saved)}
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

                {modalState.tabId !== "plugins"
                  ? <footer class="modal-actions">
                    <button class="ghost-button" type="button" onclick={onClose} disabled={isSaving}>Cancel</button>
                    <button class="primary-button" type="button" onclick={onSave} disabled={isSaving || isOpeningItem}>{isSaving ? "Saving..." : modalState.mode === "create" ? `Save ${selectedTab.label.slice(0, -1)}` : "Save changes"}</button>
                  </footer>
                  : <footer class="modal-actions">
                    <button class="ghost-button" type="button" onclick={onClose} disabled={isSaving}>Close</button>
                  </footer>}
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
    const [itemsByTab, setItemsByTab] = this.useState<AdminRecordStore>(() => getEmptyItems());
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

      return () => { cancelled = true; };
    }, []);

    const currentTab = getTab(activeTab);
    const activeTabItems = itemsByTab[activeTab];
    const selectedTab = modalState ? getTab(modalState.tabId) : null;
    const isModalLoading = Boolean(modalState?.loading);
    const isListInteractionDisabled = isOpeningItem || isSaving;

    const openItem = async (tabId: TabId, recordId: string) => {
      const tab = getTab(tabId);
      setStorageError("");
      setActiveTab(tabId);
      setModalState({
        tabId,
        mode: "edit",
        draft: createDraft(tab),
        saved: createDraft(tab),
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
        saved: createDraft(tab, item),
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
        saved: createDraft(tab),
        resolverTitle: "Docs/Welcome",
        operationMessages: {},
        pendingRows: {},
        transientPermissionRows: {},
        loading: false,
      });
    };

    const closeModal = () => setModalState(null);

    const updateDraft = (fieldKey: string, value: unknown) => {
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
              <div
                class="list-grid list-row"
                role="button"
                tabindex={isListInteractionDisabled ? -1 : 0}
                aria-disabled={isListInteractionDisabled ? "true" : undefined}
                onclick={() => {
                  if (!isListInteractionDisabled) void openItem(currentTab.id, item.id);
                }}
                onkeydown={(event) => {
                  if (isListInteractionDisabled) return;
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  void openItem(currentTab.id, item.id);
                }}
              >
                {currentTab.columns.map((column) => (
                  <div class="list-cell">
                    {(() => {
                      const value = getAdminRecordValue(column, item);
                      const isFirstColumn = column.key === currentTab.columns[0]?.key;
                      const linkUrl = isFirstColumn ? getListColumnLink(currentTab.id, column.key, item) : null;

                      return typeof linkUrl === "string"
                        ? <a class="list-cell-link" href={linkUrl} onclick={(event) => event.stopPropagation()} onkeydown={(event) => event.stopPropagation()}>{renderListCellValue(column.key, value)}</a>
                        : renderListCellValue(column.key, value);
                    })()}
                  </div>
                ))}
              </div>
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
