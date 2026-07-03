import { customElement, JSXElement, addstyles, state } from "@tiddlywiki/jsx-lit";
import css from "./app.inline.css";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";
import closeIcon from "@material-symbols/svg-400/outlined/close.svg";
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
  PermissionRow,
  AdminRecordStore,
  WikiAdminRecord,
  WritablePrefixRow,
  getSectionHeading,
  TemplateTypes,
  IdString,
  KeyString,
  KeyFields
} from "./definition/tabs";

import { adminStorage, createDraft, findTemplateRecordForWikiRecord, getEmptyItems, jsonReviver } from "./definition/store";
import { definitely, is } from "./definition/utils";


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


export type AdminRecord = { id: IdString; };

type PermissionLevel = "A_read" | "B_write" | "C_admin";
type RecipePermissionLevel = "A_read" | "B_write";
type ModalMode = "create" | "edit";

type ModalState = {
  [K in TabId]: {
    tabId: K;
    mode: ModalMode;
    draft: AdminRecordStore[K][number];
    /** The unedited original the draft was from. */
    saved: AdminRecordStore[K][number];
    resolverTitle: string;
    operationMessages: Record<string, string>;
    pendingRows: Record<string, number>;
    transientPermissionRows: Record<string, PermissionRow[]>;
    loading?: boolean;
  };
}[TabId];

type ModalStateForTab<T extends TabId> = Extract<ModalState, { tabId: T }>;

export interface PerTabFieldState {
  readonly tabId: TabId;
  readonly mode: ModalMode;
  readonly draft: AdminRecord;
  readonly saved: AdminRecord;
  readonly resolverTitle: string;
  readonly operationMessages: Record<string, string>;
  readonly pendingRows: Record<string, number>;
  readonly transientPermissionRows: Record<string, PermissionRow[]>;
  readonly loading?: boolean;
}

interface PerTabStore {
  readonly fieldState: PerTabFieldState | null;
  readonly selectedTab: TabDefinition | null;
  readonly itemsByTab: AdminRecordStore;
  readonly displayedStorageError: string;
  readonly isModalLoading: boolean;
  readonly isSaving: boolean;
  readonly isOpeningItem: boolean;
  readonly isOpen: boolean;
  readonly isBusy: boolean;
  readonly clearStorageError: () => void;
  readonly closeModal: () => void;
  readonly openCreate: (tabId: TabId) => void;
  readonly openItem: (tabId: TabId, recordId: IdString) => Promise<void>;
  readonly saveDraft: () => Promise<void>;
  readonly updateDraft: DraftChangeHandler;
  readonly updatePendingRows: PendingRowsChangeHandler;
  readonly updateTransientPermissionRows: PermissionRowsChangeHandler;
  readonly updateResolverTitle: ResolverTitleChangeHandler;
  readonly triggerOperation: OperationTriggerHandler;
}

interface AppStoreState {
  activeTab: TabId;
  itemsByTab: AdminRecordStore;
  isLoadingData: boolean;
  storageError: string;
}

interface PerTabStoreState {
  modalState: ModalState | null;
  isOpeningItem: boolean;
  isSaving: boolean;
  storageError: string;
}

interface PerTabStoreDependencies {
  getItemsByTab(): AdminRecordStore;
  replaceItemsByTab(itemsByTab: AdminRecordStore): void;
  setActiveTab(tabId: TabId): void;
  requestUpdate(): void;
}

interface UpdateHost {
  requestUpdate(): void;
}

export interface AdminStorage {
  loadAll(): Promise<AdminRecordStore>;
  read<T extends TabId>(tabId: T, id: IdString): Promise<AdminRecordStore[T][number] | null>;
  save<T extends TabId>(tabId: T, record: AdminRecordStore[T][number]): Promise<AdminRecordStore[T]>;
}

export type DraftChangeHandler<T = unknown> = (fieldKey: string, value: T) => void;
export type PendingRowsChangeHandler = (fieldKey: string, updater: (count: number) => number) => void;
export type PermissionRowsChangeHandler = (fieldKey: string, rows: PermissionRow[]) => void;
export type ResolverTitleChangeHandler = (value: string) => void;
export type OperationTriggerHandler = (fieldKey: string, message: string) => void;

/** The subset of FieldEditorContext that the readonly renderers need. */
interface ReadonlyFieldContext<T = unknown> {
  field: FieldDefinition;
  value: T;
  itemsByTab?: AdminRecordStore;
}


interface FieldEditorInput<T = unknown> extends ReadonlyFieldContext<T> {
  saved?: T;
  disabled?: boolean;
  fieldState: PerTabFieldState;
  itemsByTab: AdminRecordStore;
  onDraftChange: DraftChangeHandler<T>;
  onPendingRowsChange: PendingRowsChangeHandler;
  onTransientPermissionRowsChange: PermissionRowsChangeHandler;
  onResolverTitleChange: ResolverTitleChangeHandler;
  onTriggerOperation: OperationTriggerHandler;
}


interface FieldBlockProps {
  field: FieldDefinition;
  value: unknown;
  saved?: unknown;
  disabled?: boolean;
  useCardTitle?: boolean;
  store: PerTabStore;
}


/** FieldEditorInput plus the derived inputId, shared by the per-type render functions. */
export interface FieldEditorContext<T = unknown> extends FieldEditorInput<T> {
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
  value: boolean;
  onDraftChange: DraftChangeHandler<boolean>;
  headerOnly?: boolean;
}

interface RecordModalProps {
  store: PerTabStore;
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
  if (field.key === "templateName") {
    return Array.from(new Set(itemsByTab.templates.map((item) => item.name.toString()).filter(Boolean)));
  }
  return [];
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
    return Array.from(new Set(itemsByTab.bags.map((item) => item.name.toString()).filter(Boolean)));
  }
  if (fieldKey === "plugins") {
    return Array.from(new Set(itemsByTab.plugins.map((item) => item.name.toString()).filter(Boolean)));
  }
  if (fieldKey === "userRoles") {
    return Array.from(new Set(itemsByTab.roles.map((item) => item.name.toString()).filter(Boolean)));
  }
  if (fieldKey === "permissions" || fieldKey === "recipePermissions") {
    return Array.from(new Set([
      ...itemsByTab.bags.flatMap((item) => item.permissions.map((row) => row.role.toString())),
      ...itemsByTab.wikis.flatMap((item) => item.recipePermissions.map((row) => row.role.toString())),
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


export function uniqueLines(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildEffectivePrefixObject(writablePrefixBags: (readonly WritablePrefixRow[])[]): readonly WritablePrefixRow[] {
  const result: Record<string, string> = {};
  for (const list of writablePrefixBags) {
    for (const row of list) {
      if (typeof row.prefix !== "string" || typeof row.bagName !== "string")
        throw new Error("Expects an object of { prefix: string; bagName: string; }.")
      result[row.prefix] ??= row.bagName;
    }
  }
  return Object.entries(result)
    .map(([prefix, bagName]) => ({ prefix, bagName: new KeyString(bagName) }))
    .sort((a, b) => b.prefix.length - a.prefix.length);
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
    return JSON.parse(JSON.stringify(value), jsonReviver);
  }

  public stringify(value: PermissionRow[]): PermissionRow[] {
    return JSON.parse(JSON.stringify(value), jsonReviver);
  }
}

export const lineListCodec = new LineListCodec();
export const permissionRowsCodec = new PermissionRowsCodec();


function formatStorageErrorForDisplay(storageError: string): string {
  if (!storageError) return storageError;

  try {
    const parsed = JSON.parse(storageError) as {
      reason?: unknown;
      status?: unknown;
      details?: { prettyErrors?: unknown };
    };
    const hasReason = typeof parsed.reason === "string";
    const hasStatus = typeof parsed.status === "number" || typeof parsed.status === "string";
    const prettyText = typeof parsed.details?.prettyErrors === "string"
      ? parsed.details.prettyErrors
      : "";

    if (hasReason && hasStatus && prettyText.trim()) return prettyText;
  } catch {
    // Keep the original storage error text when it's not valid JSON.
  }

  return storageError;
}

// #region - AppStore

class PerTabStoreImpl implements PerTabStore {
  private readonly state: PerTabStoreState = {
    modalState: null,
    isOpeningItem: false,
    isSaving: false,
    storageError: "",
  };

  constructor(
    private readonly storage: AdminStorage,
    private readonly deps: PerTabStoreDependencies,
  ) { }

  public get fieldState(): PerTabFieldState | null {
    return this.state.modalState as PerTabFieldState | null;
  }

  public get selectedTab(): TabDefinition | null {
    return this.fieldState ? getTab(this.fieldState.tabId) : null;
  }

  public get itemsByTab(): AdminRecordStore {
    return this.deps.getItemsByTab();
  }

  public get displayedStorageError(): string {
    return formatStorageErrorForDisplay(this.state.storageError);
  }

  public get isModalLoading(): boolean {
    return Boolean(this.fieldState?.loading);
  }

  public get isSaving(): boolean {
    return this.state.isSaving;
  }

  public get isOpeningItem(): boolean {
    return this.state.isOpeningItem;
  }

  public get isOpen(): boolean {
    return Boolean(this.fieldState);
  }

  public get isBusy(): boolean {
    return this.isOpeningItem || this.isSaving;
  }

  public readonly clearStorageError = () => {
    if (!this.state.storageError) return;
    this.patchState({ storageError: "" });
  };

  public readonly closeModal = () => {
    if (!this.state.modalState) return;
    this.patchState({ modalState: null });
  };

  public readonly openCreate = (tabId: TabId) => {
    const draft = this.createDraftFor(tabId);
    this.deps.setActiveTab(tabId);
    this.patchState({
      modalState: this.createModalState(tabId, "create", draft, draft, false),
    });
  };

  public readonly openItem = async (tabId: TabId, recordId: IdString) => {
    const emptyDraft = this.createDraftFor(tabId);
    this.deps.setActiveTab(tabId);
    this.patchState({
      storageError: "",
      modalState: this.createModalState(tabId, "edit", emptyDraft, emptyDraft, true),
      isOpeningItem: true,
    });

    const item = await this.storage.read(tabId, recordId).catch((error) => {
      this.patchState({
        storageError: error instanceof Error ? error.message : "Failed to load record details.",
      });
      return null;
    });

    this.patchState({ isOpeningItem: false });
    if (!item) {
      this.closeModal();
      return;
    }

    const draft = this.createDraftFor(tabId, item);
    this.patchState({
      modalState: this.createModalState(tabId, "edit", draft, draft, false),
    });
  };

  public readonly updateDraft: DraftChangeHandler = (fieldKey, value) => {
    const modalState = this.state.modalState;
    if (!modalState) return;

    if (fieldKey === KeyFields[modalState.tabId] && typeof value === "string") {
      value = new KeyString(value);
    }

    const nextDraft = { ...modalState.draft } as typeof modalState.draft;
    (nextDraft as unknown as Record<string, unknown>)[fieldKey] = value;

    this.patchState({
      modalState: {
        ...modalState,
        draft: nextDraft,
      } as ModalState,
    });
  };

  public readonly updatePendingRows: PendingRowsChangeHandler = (fieldKey, updater) => {
    const modalState = this.state.modalState;
    if (!modalState) return;

    const nextCount = Math.max(0, updater(modalState.pendingRows[fieldKey] ?? 0));
    this.patchState({
      modalState: {
        ...modalState,
        pendingRows: {
          ...modalState.pendingRows,
          [fieldKey]: nextCount,
        },
      },
    });
  };

  public readonly updateTransientPermissionRows: PermissionRowsChangeHandler = (fieldKey, rows) => {
    const modalState = this.state.modalState;
    if (!modalState) return;

    this.patchState({
      modalState: {
        ...modalState,
        transientPermissionRows: {
          ...modalState.transientPermissionRows,
          [fieldKey]: rows,
        },
      },
    });
  };

  public readonly updateResolverTitle: ResolverTitleChangeHandler = (value) => {
    const modalState = this.state.modalState;
    if (!modalState) return;
    this.patchState({
      modalState: { ...modalState, resolverTitle: value },
    });
  };

  public readonly triggerOperation: OperationTriggerHandler = (fieldKey, message) => {
    const modalState = this.state.modalState;
    if (!modalState) return;
    this.patchState({
      modalState: {
        ...modalState,
        operationMessages: {
          ...modalState.operationMessages,
          [fieldKey]: message,
        },
      },
    });
  };

  public readonly saveDraft = async () => {
    const snapshot = this.state.modalState;
    if (!snapshot) return;

    this.patchState({
      storageError: "",
      isSaving: true,
    });

    const savedTabItems = await this.storage.save(
      snapshot.tabId,
      snapshot.draft,
    ).catch((error) => {
      this.patchState({
        storageError: error instanceof Error ? error.message : "Failed to save record.",
      });
      return null;
    });

    this.patchState({ isSaving: false });
    if (!savedTabItems) return;

    this.deps.replaceItemsByTab({
      ...this.itemsByTab,
      [snapshot.tabId]: savedTabItems,
    } as AdminRecordStore);
    this.patchState({ modalState: null });
  };

  private createDraftFor<T extends TabId>(tabId: T, source?: AdminRecordStore[T][number]): AdminRecordStore[T][number] {
    return createDraft(getTab(tabId), source) as AdminRecordStore[T][number];
  }

  private createModalState<T extends TabId>(
    tabId: T,
    mode: ModalMode,
    draft: AdminRecordStore[T][number],
    saved: AdminRecordStore[T][number],
    loading: boolean,
  ): ModalStateForTab<T> {
    return {
      tabId,
      mode,
      draft,
      saved,
      resolverTitle: "Docs/Welcome",
      operationMessages: {},
      pendingRows: {},
      transientPermissionRows: {},
      loading,
    } as ModalStateForTab<T>;
  }

  private patchState(patch: Partial<PerTabStoreState>): void {
    Object.assign(this.state, patch);
    this.deps.requestUpdate();
  }
}

class AppStore {
  public readonly state: AppStoreState = {
    activeTab: "wikis",
    itemsByTab: getEmptyItems(),
    isLoadingData: true,
    storageError: "",
  };

  public readonly perTabStore: PerTabStore;

  private hasLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(
    private readonly host: UpdateHost,
    private readonly storage: AdminStorage,
  ) {
    this.perTabStore = new PerTabStoreImpl(storage, {
      getItemsByTab: () => this.state.itemsByTab,
      replaceItemsByTab: (itemsByTab) => this.patchState({ itemsByTab }),
      setActiveTab: (tabId) => this.setActiveTab(tabId),
      requestUpdate: () => this.host.requestUpdate(),
    });
  }

  public get currentTab(): TabDefinition {
    return getTab(this.state.activeTab);
  }

  public get activeTabItems(): AdminRecordStore[TabId] {
    return this.state.itemsByTab[this.state.activeTab];
  }

  public get isListInteractionDisabled(): boolean {
    return this.perTabStore.isBusy;
  }

  public ensureLoaded(): Promise<void> {
    if (this.hasLoaded) return Promise.resolve();
    if (!this.loadPromise) {
      this.loadPromise = this.loadAllInternal().finally(() => {
        this.loadPromise = null;
      });
    }
    return this.loadPromise;
  }

  public readonly setActiveTab = (tabId: TabId) => {
    if (tabId === this.state.activeTab) return;
    this.patchState({ activeTab: tabId });
  };

  public readonly openCreate = (tabId: TabId) => {
    this.perTabStore.openCreate(tabId);
  };

  public readonly openItem = async (tabId: TabId, recordId: IdString) => {
    await this.perTabStore.openItem(tabId, recordId);
  };

  private async loadAllInternal(): Promise<void> {
    this.patchState({
      isLoadingData: true,
      storageError: "",
    });

    try {
      const loadedItems = await this.storage.loadAll();
      this.hasLoaded = true;
      this.patchState({
        itemsByTab: loadedItems,
        isLoadingData: false,
      });
    } catch (error) {
      this.patchState({
        storageError: error instanceof Error ? error.message : "Failed to load admin records.",
        isLoadingData: false,
      });
    }
  }

  private patchState(patch: Partial<AppStoreState>): void {
    Object.assign(this.state, patch);
    this.host.requestUpdate();
  }
}

// #region - renders

function formatFieldValue(value: any): string {
  if (typeof value === "string"
    || value instanceof IdString
    || value instanceof KeyString)
    return value.trim() || "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    if (typeof value[0] === "string")
      return value.join("\n"); // value.length ?  : "—";
    if (typeof value[0] === "object") {
      if (typeof value[0].prefix === "string")
        return value.map(e => `${e.prefix}: ${e.bagName}`).join("\n");
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
          return item.slug ? `${pathPrefix}/wiki/${encodeURIComponent(item.slug.toString())}` : null;
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

function renderTextInputField(ctx: FieldEditorContext, type: "text" | "number" | "password") {
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
  return renderLinesList(value, field.key, itemsByTab)
}

function renderLinesList(value: readonly string[], key: string, itemsByTab?: AdminRecordStore) {
  const missingCheck =
    itemsByTab ?
      key === "effectiveReadonlyBags" ? new Set(Array.from(itemsByTab.availableBagNames, e => e.toString())) :
        key === "effectivePluginSet" ? itemsByTab.availablePluginNames :
          null : null;
  const lines = value.map(line => ({ line, missing: missingCheck && !missingCheck.has(line), }));
  return <ul class="value-list">{lines.map(({ line, missing }) => <li>
    {line.split("/").map((e, i, a) => <>{e}{(i !== a.length - 1) ? "/" : ""}<wbr /></>)}
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


function renderFieldEditor(input: FieldEditorInput) {
  const ctx: FieldEditorContext = { ...input, inputId: `field-${input.field.key}` };
  return getFieldHandler(ctx.field.type).renderEditor(ctx);
}

// #region field handlers

export abstract class FieldTypeHandler<T = unknown> {

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

class PasswordInputFieldHandler extends StringFieldTypeHandler {
  public override renderEditor(ctx: FieldEditorContext) {
    return renderTextInputField(ctx, "password");
  }

  public override renderSidebar(): JSX.Node {
    return null;
  }
}

class ConfirmPasswordFieldHandler extends StringFieldTypeHandler {
  public override renderEditor(ctx: FieldEditorContext<string>) {
    const { field, value, disabled, fieldState, inputId, onDraftChange, onTriggerOperation } = ctx;
    definitely<string>(value);
    const confirmationValue = fieldState.operationMessages[field.key] ?? "";
    const hasConfirmation = Boolean(confirmationValue);
    const hasMismatch = hasConfirmation && confirmationValue !== value;

    return (
      <div class="row-editor-stack">
        <input
          id={inputId}
          class="field-input"
          type="password"
          value={value}
          disabled={disabled}
          placeholder="Enter password"
          ref={(element) => {
            if (element.value !== value) element.value = value;
          }}
          oninput={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).value)}
        />
        <input
          id={`${inputId}-confirm`}
          class="field-input"
          type="password"
          value={confirmationValue}
          disabled={disabled}
          placeholder="Confirm password"
          ref={(element) => {
            if (element.value !== confirmationValue) element.value = confirmationValue;
          }}
          oninput={(event) => onTriggerOperation(field.key, (event.currentTarget as HTMLInputElement).value)}
        />
        {hasConfirmation ? <p class="field-helper">{hasMismatch ? "Passwords do not match yet." : "Passwords match."}</p> : null}
      </div>
    );
  }

  public override renderSidebar(): JSX.Node {
    return null;
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
    const { field, value, disabled, fieldState, itemsByTab, inputId, onDraftChange, onPendingRowsChange } = ctx;
    if (typeof value === "string") {
      console.log(ctx);
      throw new Error("value is a string");
    }
    const editableLines = value;
    const pendingRowCount = fieldState.pendingRows[field.key] ?? 0;
    const lookupOptions = getLookupOptions(field.key, itemsByTab);
    const itemLabel = field.key === "plugins"
      ? "plugin"
      : field.key === "userRoles"
        ? "role id"
        : "bag";
    const templateRecord = is<WikiAdminRecord>(fieldState.draft, fieldState.tabId === "wikis")
      ? findTemplateRecordForWikiRecord(fieldState.draft, itemsByTab as AdminRecordStore) : undefined;
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
        {field.key === "readonlyBags" && fieldState.tabId === "wikis" && templateRecord ? (
          <div class="field-callout">
            <p>Readonly bags from template</p>
            <ul class="value-list">
              {templateReadonlyBagLines.length ? templateReadonlyBagLines.map((bag) => <li>{bag.toString()}</li>) : <li>No template readonly bags</li>}
            </ul>
          </div>
        ) : null}
        {field.key === "plugins" && fieldState.tabId === "wikis" && templateRecord ? (
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
    const { field, disabled, fieldState, itemsByTab, inputId, onDraftChange, onTransientPermissionRowsChange } = ctx;
    definitely<readonly PermissionRow[]>(ctx.value);
    const permissionRows = ctx.value;
    const lookupOptions = getLookupOptions(field.key, itemsByTab);
    const availableLevels = getPermissionLevelsForField(field.key);
    const transientPermissionRows = fieldState.transientPermissionRows[field.key] ?? [];
    const displayedPermissionRows = permissionRows.length || transientPermissionRows.length
      ? [...permissionRows, ...transientPermissionRows]
      : [{ role: new KeyString(""), level: availableLevels[0] as PermissionLevel }];

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
              currentValue: row.role.toString(),
              placeholder: "Role",
              options: lookupOptions,
              disabled: ctx.disabled,
              onInput: (nextValue) => {
                const nextRows = [...displayedPermissionRows];
                nextRows[index] = { ...row, role: new KeyString(nextValue) };
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
        <button type="button" class="ghost-button" disabled={disabled} onclick={() =>
          onTransientPermissionRowsChange(field.key, [...transientPermissionRows, {
            role: new KeyString(""), level: availableLevels[0] as PermissionLevel
          }])}>Add permission</button>
      </div>
    );
  }
}

const defaultPrefixPill = <div class="prefix-bag-sidebar-pill">default</div>;
class PrefixTableFieldHandler extends FieldTypeHandler<WritablePrefixRow[]> {
  constructor() {
    super();
  }

  public initCreate(): WritablePrefixRow[] {
    return [];
  }

  public override renderSidebar(ctx: ReadonlyFieldContext<WritablePrefixRow[]>): JSX.Node {
    return <dl class="prefix-bag-sidebar">
      {ctx.value.map(e => <>
        <dt class="prefix-bag-sidebar-term">{e.prefix ? <span class="prefix-bag-sidebar-prefix">"{e.prefix}"</span> : defaultPrefixPill}</dt>
        <dd class="prefix-bag-sidebar-value">{e.bagName.toString()}</dd>
      </>)}
    </dl>
  }

  public override renderEditor(ctx: FieldEditorContext) {
    const { field, value, disabled, fieldState, itemsByTab, inputId, onDraftChange, onPendingRowsChange } = ctx;
    const forDisplay = field.mode === "server";
    definitely<WritablePrefixRow[]>(value);
    const mappingRows = value;
    const pendingRowCount = fieldState.pendingRows[field.key] ?? 0;
    const lookupOptions = getLookupOptions(field.key, itemsByTab);
    const displayedMappingRows = mappingRows.length
      ? [...mappingRows, ...Array.from({ length: pendingRowCount }, () => ({ prefix: "", bagName: new KeyString("") }))]
      : [{ prefix: "", bagName: new KeyString("") }, ...Array.from({ length: pendingRowCount }, () => ({ prefix: "", bagName: new KeyString("") }))];
    const templateRecord = is<WikiAdminRecord>(fieldState.draft, fieldState.tabId === "wikis")
      ? findTemplateRecordForWikiRecord(fieldState.draft, itemsByTab) : undefined;
    const inheritedRoutingRows = fieldState.tabId === "wikis" && templateRecord ? templateRecord.writablePrefixBags : [];

    if (forDisplay) {
      return this.displayMappingRows(displayedMappingRows)
    }
    return (
      <div class="row-editor-stack">
        {displayedMappingRows.map((row, index) => (
          <div class="row-editor-row row-editor-row-wide">
            <div class="prefix-input-shell">
              <input class={this.hasTrimMismatch(row.prefix) ? "field-input is-invalid" : "field-input"}
                type="text"
                value={row.prefix}
                placeholder="Prefix, leave blank for default"
                aria-invalid={this.hasTrimMismatch(row.prefix) ? "true" : undefined}
                title={this.hasTrimMismatch(row.prefix) ? "Prefix has leading or trailing whitespace. Is this intentional?" : undefined}
                disabled={disabled}
                oninput={(event) => {
                  const element = event.currentTarget as HTMLInputElement;
                  const hadStoredRow = index < mappingRows.length;
                  const nextRows = mappingRows.length ? [...mappingRows] : [{ prefix: "", bagName: "" }];
                  nextRows[index] = { ...row, prefix: element.value };
                  onDraftChange(field.key, nextRows);
                  if (!hadStoredRow && (element.value || row.bagName.trim())) onPendingRowsChange(field.key, (count) => count - 1);
                }} ref={(element) => {
                  if (element.value !== row.prefix) element.value = row.prefix;
                }} />
              {this.hasTrimMismatch(row.prefix) ? <span
                class="prefix-input-alert missing-marker"
                aria-label="Prefix has leading or trailing whitespace"
                title="Prefix has leading or trailing whitespace. Is this intentional?"
              ><MaterialSymbol icon={warningIcon} /></span> : null}
            </div>
            {renderSearchableInput({
              id: `${inputId}-${index}-target`,
              currentValue: row.bagName.toString(),
              placeholder: "Target bag",
              options: lookupOptions,
              disabled: ctx.disabled,
              onInput: (nextValue) => {
                const hadStoredRow = index < mappingRows.length;
                const nextRows = mappingRows.length ? [...mappingRows] : [{ prefix: "", bagName: "" }];
                nextRows[index] = { ...row, bagName: nextValue };
                onDraftChange(field.key, nextRows);
                if (!hadStoredRow && (row.prefix || nextValue.trim())) onPendingRowsChange(field.key, (count) => count - 1);
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
  private displayMappingRows(displayedMappingRows: readonly WritablePrefixRow[]) {
    return <table class="value-table">
      {displayedMappingRows.map((row) => (
        <tr>
          <td>{row.prefix ? <code>{'"' + row.prefix + '"'}</code> : defaultPrefixPill}</td>
          <td>{row.bagName.toString()}</td>
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

class AutocompleteFieldHandler extends FieldTypeHandler<string | null> {
  constructor() {
    super();
  }

  public initCreate(): string | null {
    return null;
  }

  renderSidebar(ctx: ReadonlyFieldContext<string | null>) {
    return ctx.value ?? "";
  }

  public override renderEditor(ctx: FieldEditorContext<string | null>) {
    const { field, value, disabled, itemsByTab, inputId, onDraftChange } = ctx;
    const datalistId = `${inputId}-options`;
    const optionMap = new Map(itemsByTab.templates.map(e => [e.name, e.id]))
    const oninput = (event: InputEvent & {
      currentTarget: HTMLInputElement;
      target: Element;
    }) => {
      const name = event.currentTarget.value;
      if (!name) return event.preventDefault();
      onDraftChange(field.key, name);
    }
    return (
      <>
        <input id={inputId} class="field-input" type="text" value={value ?? ""} disabled={disabled}
          ref={(element) => {
            if (value && element.value !== value) element.value = value;
          }}
          list={datalistId}
          oninput={oninput}
        />
        <datalist id={datalistId}>
          {Array.from(optionMap.keys(), (option) => <option value={option.toString()} />)}
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
    const targets = draft.effectiveWritableBags.filter((row) => row.bagName).sort((a, b) => b.prefix.length - a.prefix.length);
    const writeTarget = normalizedTitle
      ? (targets.find((target) => target.prefix && normalizedTitle.startsWith(target.prefix)) ?? targets.find((target) => target.prefix === ""))
      : undefined;
    return {
      title: normalizedTitle,
      writeTo: writeTarget?.bagName.toString() ?? "No writable target",
      matchedPrefix: writeTarget ? (writeTarget.prefix || "default") : "none",
    };
  }


  public override renderEditor(ctx: FieldEditorContext) {
    const { fieldState, inputId, onResolverTitleChange } = ctx;
    definitely<WikiAdminRecord>(fieldState.draft);
    const preview = this.computeResolverPreview(fieldState.draft, fieldState.resolverTitle);
    return (
      <div class="tool-panel resolver-tool">
        <label class="field-label" for={inputId}>Title to test</label>
        <input id={inputId} class="field-input" type="text" value={fieldState.resolverTitle} ref={(element) => {
          if (element.value !== fieldState.resolverTitle) element.value = fieldState.resolverTitle;
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
    return renderLinesList(lines, ctx.field.key, ctx.itemsByTab);
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
const enterPasswordFieldHandler = new PasswordInputFieldHandler();
const confirmPasswordFieldHandler = new ConfirmPasswordFieldHandler();
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

export const fieldTypeHandlers = {
  "string": textInputFieldHandler,
  "version": textInputFieldHandler,
  "number": numberInputFieldHandler,
  "text": textareaFieldHandler,
  "enter-password": enterPasswordFieldHandler,
  "confirm-password": confirmPasswordFieldHandler,
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

export function getFieldHandler(fieldType: FieldType): FieldTypeHandler {
  return fieldTypeHandlers[fieldType] ?? fallbackFieldHandler;
}

// #region field block

@customElement("mws-field-block")
class FieldBlockElement<T> extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: FieldBlockProps;

  protected render() {
    const { field, useCardTitle, value, saved: savedValue, store } = this.props;
    const fieldState = store.fieldState;
    if (!fieldState) return null;

    const modalMode = fieldState.mode;
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
          definitely<boolean>(value),
          <ToggleFieldElement field={field} value={value} onDraftChange={store.updateDraft} />
        ) : (
          <div class="field-editor">
            {!useCardTitle ? <label class="field-label" for={`field-${field.key}`}>{field.label}</label> : null}
            {field.description ? <p class="field-helper">{field.description}</p> : null}
            {renderFieldEditor({
              field,
              value,
              saved: savedValue,
              disabled,
              fieldState,
              itemsByTab: store.itemsByTab,
              onDraftChange: store.updateDraft,
              onPendingRowsChange: store.updatePendingRows,
              onTransientPermissionRowsChange: store.updateTransientPermissionRows,
              onResolverTitleChange: store.updateResolverTitle,
              onTriggerOperation: store.triggerOperation,
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
    const checked = value === true;

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
            onchange={(event) => onDraftChange(field.key, (event.currentTarget as HTMLInputElement).checked)}
          />
          <span class={checked ? "header-switch-track is-checked" : "header-switch-track"} aria-hidden="true">
            <span class="header-switch-thumb"></span>
          </span>
        </label>
      </div>
    );
  }
}

// #region tab detail

@customElement("mws-record-modal")
class RecordModalElement extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: RecordModalProps;

  protected render() {
    const { store } = this.props;
    const { selectedTab, fieldState } = store;
    if (!selectedTab || !fieldState) return null;

    const itemsByTab = store.itemsByTab;
    const storageError = store.displayedStorageError;
    const isModalLoading = store.isModalLoading;
    const isSaving = store.isSaving;
    const isOpeningItem = store.isOpeningItem;
    const onClose = store.closeModal;
    const onSave = store.saveDraft;
    const onDraftChange = store.updateDraft;
    const onPendingRowsChange = store.updatePendingRows;
    const onTransientPermissionRowsChange = store.updateTransientPermissionRows;
    const onResolverTitleChange = store.updateResolverTitle;
    const onTriggerOperation = store.triggerOperation;
    const onClearStorageError = store.clearStorageError;

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
            <div class="modal-title">
              <p class="eyebrow">{selectedTab.eyebrow}</p>
              <h3>{isModalLoading ? `Loading ${selectedTab.label.slice(0, -1).toLowerCase()}...` : fieldState.mode === "create" ? `New ${selectedTab.label.slice(0, -1)}` : getPrimaryValue(selectedTab, fieldState.draft)}</h3>
              <p>{isModalLoading ? "Fetching record details from async storage before rendering the form." : selectedTab.description}</p>
            </div>
            <div class="close-button" onclick={onClose} aria-label="Close details">
              <MaterialSymbol icon={closeIcon} />
            </div>
          </header>

          {isModalLoading ? (
            <div class="modal-loading-shell">
              <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
              <p class="modal-loading-copy">Loading {selectedTab.label.toLowerCase()} details...</p>
            </div>
          ) : (
            <div class="modal-layout">
              <aside class="field-index modal-sidebar">
                {sidebarFields.map(field => sidebarField(field, fieldState.draft, fieldState.saved, itemsByTab))}
              </aside>

              <div class="field-stack modal-main">
                {([
                  ["authored", authoredFields],
                  ["runtime", runtimeFields],
                  ["operations", operationFields],
                ] as [FieldSection, FieldDefinition[]][]).map(([section, fields]) => {
                  if (!fields.length) return null;
                  const heading = getSectionHeading(section, fieldState.mode);
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
                          const groupDisabled = Boolean(group.disabledWhenHeaderOff && headerField && (getAdminRecordValue(headerField, fieldState.draft) ?? "disabled") !== "enabled");
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
                                    value={getAdminRecordValue(headerField, fieldState.draft) ?? ""}
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
                                    value={getAdminRecordValue(field, fieldState.draft)}
                                    saved={getAdminRecordValue(field, fieldState.saved)}
                                    disabled={groupDisabled}
                                    useCardTitle={groupFields.length === 1}
                                    store={store}
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

                {fieldState.tabId !== "plugins"
                  ? <footer class="modal-actions">
                    <button class="ghost-button" type="button" onclick={onClose} disabled={isSaving}>Cancel</button>
                    <button class="primary-button" type="button" onclick={onSave} disabled={isSaving || isOpeningItem}>{isSaving ? "Saving..." : fieldState.mode === "create" ? `Save ${selectedTab.label.slice(0, -1)}` : "Save changes"}</button>
                  </footer>
                  : <footer class="modal-actions">
                    <button class="ghost-button" type="button" onclick={onClose} disabled={isSaving}>Close</button>
                  </footer>}
              </div>
            </div>
          )}

          {storageError ? (
            <footer class="modal-header" role="alert" aria-live="polite">
              <pre style="white-space: break-spaces;">{storageError}</pre>
              <button class="error-close-button" type="button" onclick={onClearStorageError} aria-label="Dismiss error message">
                <MaterialSymbol icon={closeIcon} />
              </button>
            </footer>
          ) : null}
        </section>
      </div>
    );
  }
}

// #region tab main


@addstyles(css)
@customElement("mws-app")
export class App extends JSXElement {
  // don't use shadow dom. allows inheriting main.css styles.
  useLightDOM: boolean = true;

  private readonly store = new AppStore(this, adminStorage);

  constructor() {
    super()
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.store.ensureLoaded();
  }

  protected render() {
    const store = this.store;
    const { activeTab, itemsByTab, isLoadingData } = store.state;
    const perTabStore = store.perTabStore;
    const currentTab = store.currentTab;
    const activeTabItems = store.activeTabItems;
    const isListInteractionDisabled = store.isListInteractionDisabled;

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
              <span>Users</span>
              <strong>{itemsByTab.users.length}</strong>
            </article>
          </div>
        </header>

        <nav class="tab-strip" aria-label="Admin sections">
          {getAllTabs().map((tab) => (
            <button
              class={tab.id === activeTab ? "tab-button is-active" : "tab-button"}
              onclick={() => store.setActiveTab(tab.id)}
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
                onclick={() => store.openCreate(currentTab.id)}
                disabled={isLoadingData || perTabStore.isOpeningItem || perTabStore.isSaving}
              >{getCreateLabel(currentTab)}</button>
            </div>
          </div>

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
                  if (!isListInteractionDisabled) void store.openItem(currentTab.id, item.id);
                }}
                onkeydown={(event) => {
                  if (isListInteractionDisabled) return;
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  void store.openItem(currentTab.id, item.id);
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

        {perTabStore.isOpen ? (
          <RecordModalElement
            store={perTabStore}
          />
        ) : null}
      </div>
    );
  }
}


