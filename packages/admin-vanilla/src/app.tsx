import { customElement, JSXElement, addstyles, state } from "@tiddlywiki/jsx-lit";
import css from "./app.inline.css";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";
import closeIcon from "@material-symbols/svg-400/outlined/close.svg";
import accountCircleIcon from "@material-symbols/svg-400/outlined/account_circle.svg";
import { MaterialSymbol } from "./material-symbol";
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

import { adminStorage, createDraft, getEmptyItems, jsonReviver } from "./definition/store";
import { definitely, is } from "./definition/utils";
import { logout } from "./passwords";
import { fieldTypeRenderSidebars, formatFieldValue, renderFieldEditor, renderFieldSidebar } from "./definition/renders";


export type AdminRecord = { id: IdString; };

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

interface FieldBlockProps {
  field: FieldDefinition;
  value: unknown;
  saved?: unknown;
  disabled?: boolean;
  useCardTitle?: boolean;
  store: PerTabStore;
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

function getPrimaryValue(tab: TabDefinition, item: AdminRecord): string {
  const primary = tab.columns[0] ?? tab.fields[0];
  return formatFieldValue(getAdminRecordValue(primary, item));
}

function getCreateLabel(tab: TabDefinition): string {
  return tab.createLabel;
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



// #region - field block

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
        {useToggleEditor ? (
          definitely<boolean>(value),
          <ToggleFieldElement field={field} value={value} onDraftChange={store.updateDraft} />
        ) : (
          <div class="field-editor">
            {!useCardTitle ? <label class="field-label" for={`field-${field.key}`}>{field.label}</label> : null}
            {field.description ? <p class="field-helper">{field.description}</p> : null}
            {renderFieldEditor({
              inputId: `field-${field.key}`,
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
    content: renderFieldSidebar({
      field,
      value: getAdminRecordValue(field, saved),
      itemsByTab
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
              <h3>{isModalLoading
                ? `Loading ${selectedTab.label.slice(0, -1).toLowerCase()}...`
                : fieldState.mode === "create"
                  ? `New ${selectedTab.label.slice(0, -1)}`
                  : getPrimaryValue(selectedTab, fieldState.draft)}</h3>
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
                {sidebarFields.map(field => sidebarSection({
                  title: field.label,
                  content: renderFieldSidebar({
                    field,
                    value: getAdminRecordValue(field, fieldState.saved),
                    itemsByTab
                  })
                }))}
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
                          const groupDisabled = Boolean(group.disabledWhenHeaderOff && headerField && getAdminRecordValue(headerField, fieldState.draft) !== true);
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
  private readonly handleAccountMenuClick = (event: MouseEvent) => {
    const accountMenu = this.querySelector(".hero-account-menu");
    if (!(accountMenu instanceof HTMLDetailsElement) || !accountMenu.open) return;

    const target = event.target;
    if (target instanceof Node && accountMenu.contains(target)) return;
    accountMenu.open = false;
  };

  constructor() {
    super()
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this.handleAccountMenuClick, true);
    void this.store.ensureLoaded();
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this.handleAccountMenuClick, true);
    super.disconnectedCallback();
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
          <div class="hero-account-shell">
            <details class="hero-account-menu">
              <summary class="hero-account-trigger" aria-label="Open account menu">
                <span class="hero-account-name">admin</span>
                <span class="hero-account-icon" aria-hidden="true">
                  <MaterialSymbol icon={accountCircleIcon} />
                </span>
              </summary>
              <div class="hero-account-dropdown" role="menu" aria-label="Account options">
                <button
                  class="hero-account-action"
                  type="button"
                  role="menuitem"
                  onclick={() => {
                    // TODO: implement profile action.
                  }}
                >
                  Profile
                </button>
                <button
                  class="hero-account-action"
                  type="button"
                  role="menuitem"
                  onclick={logout}
                >
                  Logout
                </button>
              </div>
            </details>
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

function getListColumnLink(tabId: TabId, columnKey: string, item: AdminRecord): string | null {
  const mapper = getListColumnLinkMappers(tabId)[columnKey];
  return mapper ? mapper(item) : null;
}


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

type ListColumnLinkMapper = (item: AdminRecord) => string | null;
