import { customElement, JSXElement, addstyles } from "@tiddlywiki/jsx-lit";
import css from "./app.inline.css";
declare global {
  interface MyCustomElements {
    'mws-app': JSX.SimpleAttrs<{}, App>;
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

type Mode = "create edit" | "edit";
type ModalMode = "create" | "edit";
type AdminRecord = Record<string, string>;
type ItemsByTab = Record<TabId, AdminRecord[]>;

interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  mode?: Mode;
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
  items: AdminRecord[];
}

interface ModalState {
  tabId: TabId;
  mode: ModalMode;
  draft: AdminRecord;
  index?: number;
}

const tabs: TabDefinition[] = [
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
      { key: "slug", label: "Slug", type: "string", mode: "create edit" },
      { key: "displayName", label: "Display name", type: "string", mode: "create edit" },
      { key: "description", label: "Description", type: "text", mode: "create edit" },
      { key: "templateId", label: "Template", type: "autocomplete", mode: "create edit" },
      {
        key: "parameters",
        label: "Parameters",
        type: "json-editor",
        mode: "create edit",
        architecture: "Writes to the wiki record parameters JSON. It only holds values the selected template leaves unbound, then those values are merged with template definition data during compilation.",
      },
      {
        key: "effectiveRoutingPreview",
        label: "Effective routing preview",
        type: "structured-preview",
        architecture: "Read-only explanation of compiled routing. It is built from merged template definition plus wiki parameters and shows readonly bags, writable prefix rules, longest-prefix selection, and the empty-string default target.",
      },
      {
        key: "effectiveBagOrder",
        label: "Effective bag order",
        type: "table",
        architecture: "Read-only projection of compiled recipe-bag rows in the same top-to-bottom order the resolver uses for reads.",
      },
      {
        key: "effectivePluginSet",
        label: "Effective plugin set",
        type: "table",
        architecture: "Read-only projection of the resolved plugin rows that will actually be used by the wiki page and preload path.",
      },
      {
        key: "recipePermissions",
        label: "Recipe permissions",
        type: "permission-table",
        mode: "create edit",
        architecture: "Edits permission rows on the wiki definition itself. These govern access to the wiki surface separately from bag-level read and write rights.",
      },
      {
        key: "compileValidation",
        label: "Compile validation",
        type: "validation-report",
        architecture: "Read-only validation and compilation result across template, parameters, bag references, plugin references, and routing invariants.",
      },
      {
        key: "titleResolutionPreview",
        label: "Title resolution preview",
        type: "resolver-preview",
        mode: "edit",
        architecture: "Diagnostic resolver output for a title entered by the user: computed write target, current read source, visible bag stack, and current writability.",
      },
    ],
    items: [
      {
        slug: "engineering-hub",
        displayName: "Engineering Hub",
        templateName: "Workspace Template",
        defaultWritableBag: "bag-engineering-main",
        readonlyBagCount: "3",
        prefixRuleCount: "4",
        pluginCount: "6",
        lastCompiledAt: "2026-06-24 09:14",
        statusFlags: "compiled, writable",
        description: "Shared engineering wiki with namespace routing for specs, drafts, and user notes.",
        templateId: "tmpl-workspace",
        parameters: '{\n  "userPartitionPrefix": "Users/alex/",\n  "channel": "stable"\n}',
        effectiveRoutingPreview: "Read stack: bag-engineering-main > bag-shared-specs > bag-shared-archive. Prefixes: Docs/ -> bag-docs, Drafts/ -> bag-drafts, Users/ -> bag-user-space, default -> bag-engineering-main.",
        effectiveBagOrder: "1. bag-engineering-main\n2. bag-docs\n3. bag-drafts\n4. bag-user-space\n5. bag-shared-specs\n6. bag-shared-archive",
        effectivePluginSet: "core@5.3.7\nworkspace-shell@2.4.0\nteam-presets@1.8.3\nsearch-tools@0.9.2",
        recipePermissions: "admin:C_admin\neditors:B_write\nviewers:A_read",
        compileValidation: "Valid. 6 bags resolved, 4 plugin versions pinned, 0 missing references.",
        titleResolutionPreview: "Enter a title to preview resolver output.",
      },
      {
        slug: "plugin-lab",
        displayName: "Plugin Lab",
        templateName: "Plugin Sandbox",
        defaultWritableBag: "bag-plugin-lab",
        readonlyBagCount: "2",
        prefixRuleCount: "2",
        pluginCount: "8",
        lastCompiledAt: "2026-06-23 18:02",
        statusFlags: "compiled, review needed",
        description: "Sandbox for draft plugin work and package previews.",
        templateId: "tmpl-plugin-sandbox",
        parameters: '{\n  "channel": "draft"\n}',
        effectiveRoutingPreview: "Read stack: bag-plugin-lab > bag-plugin-base > bag-plugin-archive. Prefixes: Plugins/ -> bag-plugin-lab, default -> bag-plugin-lab.",
        effectiveBagOrder: "1. bag-plugin-lab\n2. bag-plugin-base\n3. bag-plugin-archive",
        effectivePluginSet: "core@5.3.7\nplugin-devtools@0.4.0-draft\nsyntax-tools@1.1.0",
        recipePermissions: "admin:C_admin\nplugin-authors:B_write\nqa:A_read",
        compileValidation: "Valid with warnings. 1 draft plugin reference pending publish.",
        titleResolutionPreview: "Enter a title to preview resolver output.",
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
      { key: "name", label: "Name", type: "string", mode: "create edit" },
      { key: "description", label: "Description", type: "text", mode: "create edit" },
      {
        key: "definition",
        label: "Definition",
        type: "json-editor",
        mode: "create edit",
        architecture: "Writes the template definition JSON. This is the template-side source of truth for readonly bags plus writable prefix-to-bag mapping before wiki parameters are merged in.",
      },
      { key: "readonlyBags", label: "Readonly bags", type: "search-multiselect", mode: "create edit" },
      {
        key: "writablePrefixBags",
        label: "Writable prefix bags",
        type: "key-value-table",
        mode: "create edit",
        architecture: "Edits the prefix-to-bag routing table that compilation turns into writable routing metadata. Longest prefix wins, and the empty string row is the fallback write target.",
      },
      {
        key: "defaultWritableBag",
        label: "Default writable bag",
        type: "reference",
        architecture: "Read-only convenience projection of the writablePrefixBags row whose prefix is the empty string.",
      },
      {
        key: "openParameters",
        label: "Open parameters",
        type: "parameter-list",
        architecture: "Read-only description of which values the template leaves for each wiki to provide in its parameters JSON.",
      },
      {
        key: "dependentWikis",
        label: "Dependent wikis",
        type: "relationship-table",
        architecture: "Read-only relationship view listing all wikis that reference this template and will be revalidated or recompiled if it changes.",
      },
      {
        key: "recompileAffectedWikis",
        label: "Recompile affected wikis",
        type: "action",
        mode: "edit",
        architecture: "Action surface that reruns validation and replaces derived rows for every wiki pointing at the current template.",
      },
      {
        key: "validationResult",
        label: "Validation result",
        type: "validation-report",
        architecture: "Read-only summary of whether the definition can compile cleanly against current bag and plugin references.",
      },
    ],
    items: [
      {
        name: "Workspace Template",
        description: "General-purpose workspace wiki with namespace-based write routing.",
        readonlyBagsSummary: "shared-specs, shared-archive, policy",
        writablePrefixSummary: "Docs/, Drafts/, Users/, default",
        openParameterSummary: "userPartitionPrefix, channel",
        dependentWikiCount: "12",
        lastUpdatedAt: "2026-06-24 08:40",
        validationStatus: "valid",
        definition: '{\n  "readonlyBags": ["bag-shared-specs", "bag-shared-archive", "bag-policy"],\n  "writablePrefixBags": {\n    "Docs/": "bag-docs",\n    "Drafts/": "bag-drafts",\n    "Users/": "bag-user-space",\n    "": "bag-engineering-main"\n  }\n}',
        readonlyBags: "bag-shared-specs\nbag-shared-archive\nbag-policy",
        writablePrefixBags: "Docs/ -> bag-docs\nDrafts/ -> bag-drafts\nUsers/ -> bag-user-space\n(empty) -> bag-engineering-main",
        defaultWritableBag: "bag-engineering-main",
        openParameters: "userPartitionPrefix\nchannel",
        dependentWikis: "engineering-hub\nrelease-room\nteam-alpha",
        recompileAffectedWikis: "Recompile 12 wikis",
        validationResult: "Valid. All referenced bags exist and writable fallback is present.",
      },
      {
        name: "Plugin Sandbox",
        description: "Draft-heavy workspace for plugin authoring and review.",
        readonlyBagsSummary: "plugin-base, plugin-archive",
        writablePrefixSummary: "Plugins/, default",
        openParameterSummary: "channel",
        dependentWikiCount: "3",
        lastUpdatedAt: "2026-06-23 16:27",
        validationStatus: "warning",
        definition: '{\n  "readonlyBags": ["bag-plugin-base", "bag-plugin-archive"],\n  "writablePrefixBags": {\n    "Plugins/": "bag-plugin-lab",\n    "": "bag-plugin-lab"\n  }\n}',
        readonlyBags: "bag-plugin-base\nbag-plugin-archive",
        writablePrefixBags: "Plugins/ -> bag-plugin-lab\n(empty) -> bag-plugin-lab",
        defaultWritableBag: "bag-plugin-lab",
        openParameters: "channel",
        dependentWikis: "plugin-lab\nqa-preview\nextension-workbench",
        recompileAffectedWikis: "Recompile 3 wikis",
        validationResult: "Warning. Draft plugin channels are allowed but not publish-stable.",
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
      { key: "name", label: "Name", type: "string", mode: "create edit" },
      { key: "description", label: "Description", type: "text", mode: "create edit" },
      {
        key: "permissions",
        label: "Permissions",
        type: "permission-table",
        mode: "create edit",
        architecture: "Edits bag permission rows. These rows are consulted directly by the resolver when deciding who can read from or write to the storage container.",
      },
      {
        key: "referencedByTemplates",
        label: "Referenced by templates",
        type: "relationship-table",
        architecture: "Read-only relationship view derived from authored template definition JSON that mentions this bag in readonly or writable routing positions.",
      },
      {
        key: "referencedByWikis",
        label: "Referenced by wikis",
        type: "relationship-table",
        architecture: "Read-only relationship view derived from compiled recipe-bag rows, reflecting the effective runtime routing topology.",
      },
      {
        key: "routingRoles",
        label: "Routing roles",
        type: "summary-list",
        architecture: "Derived routing summary classifying how this bag participates across compiled wikis, such as readonly layer, writable prefix target, or default fallback.",
      },
      { key: "tiddlerCount", label: "Tiddler count", type: "number" },
      {
        key: "recentActivity",
        label: "Recent activity",
        type: "activity-feed",
        architecture: "Read-only operational summary built from recent tiddler event rows for this bag.",
      },
    ],
    items: [
      {
        name: "bag-engineering-main",
        description: "Primary write target for engineering wiki content.",
        usedByCount: "9",
        readonlyUsageCount: "0",
        writableUsageCount: "9",
        defaultUsageCount: "9",
        permissionSummary: "admin, editors, viewers",
        tiddlerCount: "1284",
        lastActivityAt: "2026-06-24 09:12",
        permissions: "admin:C_admin\neditors:B_write\nviewers:A_read",
        referencedByTemplates: "Workspace Template\nProject Hub",
        referencedByWikis: "engineering-hub\nrelease-room\ninfra-notes",
        routingRoles: "default writable target\nwritable prefix target",
        recentActivity: "09:12 save Docs/Release-Checklist\n09:03 save Drafts/Q3-Plan\n08:55 delete Temp/Scratch",
      },
      {
        name: "bag-shared-specs",
        description: "Readonly canonical specs consumed across multiple workspaces.",
        usedByCount: "14",
        readonlyUsageCount: "14",
        writableUsageCount: "0",
        defaultUsageCount: "0",
        permissionSummary: "admin, editors, viewers",
        tiddlerCount: "436",
        lastActivityAt: "2026-06-22 14:05",
        permissions: "admin:C_admin\neditors:A_read\nviewers:A_read",
        referencedByTemplates: "Workspace Template\nPolicy Reader",
        referencedByWikis: "engineering-hub\nproduct-roadmap\nteam-alpha",
        routingRoles: "readonly layer",
        recentActivity: "2026-06-22 14:05 save Specs/Auth-Contract\n2026-06-21 11:40 save Specs/Client-Cache",
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
      { key: "name", label: "Name", type: "string", mode: "create edit" },
      { key: "version", label: "Version", type: "version", mode: "create edit" },
      { key: "status", label: "Status", type: "select", mode: "create edit" },
      { key: "description", label: "Description", type: "text", mode: "create edit" },
      {
        key: "assetsMetadata",
        label: "Assets metadata",
        type: "metadata-table",
        architecture: "Read-only metadata projection from the stored plugin version and its packaged payload, showing the concrete assets and identity facts consumed by the renderer and plugin cache.",
      },
      {
        key: "usedByWikis",
        label: "Used by wikis",
        type: "relationship-table",
        architecture: "Read-only relationship view derived from compiled recipe-plugin rows, showing exact effective usage of this version.",
      },
      {
        key: "draftOf",
        label: "Draft of",
        type: "reference",
        architecture: "Read-only lineage pointer from a draft plugin to the published version it branched from or intends to replace.",
      },
      {
        key: "publishFromDraft",
        label: "Publish from draft",
        type: "action",
        mode: "edit",
        architecture: "Action surface that promotes a draft state into a concrete version usable by compiled wiki plugin rows.",
      },
    ],
    items: [
      {
        name: "workspace-shell",
        version: "2.4.0",
        status: "published",
        usageCount: "11",
        updatedAt: "2026-06-20 13:44",
        description: "Shared shell chrome, navigation, and layout helpers for workspace wikis.",
        assetsMetadata: "package: workspace-shell\njs: 3 bundles\ncss: 1 asset\nicons: 12",
        usedByWikis: "engineering-hub\nrelease-room\nteam-alpha",
        draftOf: "none",
        publishFromDraft: "No draft promotion available",
      },
      {
        name: "plugin-devtools",
        version: "0.4.0-draft",
        status: "draft",
        usageCount: "2",
        updatedAt: "2026-06-24 07:15",
        description: "Draft developer tooling for plugin workbench and inspection views.",
        assetsMetadata: "package: plugin-devtools\njs: 2 bundles\ncss: 0 assets\nflags: draft",
        usedByWikis: "plugin-lab\nqa-preview",
        draftOf: "plugin-devtools@0.3.5",
        publishFromDraft: "Publish as 0.4.0",
      },
    ],
  },
];

function getTab(tabId: TabId): TabDefinition {
  return tabs.find((tab) => tab.id === tabId) ?? tabs[0];
}

function getInitialItems(): ItemsByTab {
  return {
    wikis: tabs.find((tab) => tab.id === "wikis")!.items.map((item) => ({ ...item })),
    templates: tabs.find((tab) => tab.id === "templates")!.items.map((item) => ({ ...item })),
    bags: tabs.find((tab) => tab.id === "bags")!.items.map((item) => ({ ...item })),
    plugins: tabs.find((tab) => tab.id === "plugins")!.items.map((item) => ({ ...item })),
  };
}

function getFieldKeys(tab: TabDefinition): string[] {
  return Array.from(new Set([
    ...tab.columns.map((column) => column.key),
    ...tab.fields.map((field) => field.key),
  ]));
}

function createDraft(tab: TabDefinition, source?: AdminRecord): AdminRecord {
  return getFieldKeys(tab).reduce<AdminRecord>((draft, key) => {
    draft[key] = source?.[key] ?? "";
    return draft;
  }, {});
}

function isEditable(field: FieldDefinition, mode: ModalMode): boolean {
  if (!field.mode) return false;
  return field.mode === "create edit" || (field.mode === "edit" && mode === "edit");
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

function formatFieldValue(value: string | undefined): string {
  return value && value.trim() ? value : "—";
}

@addstyles(css)
@customElement("mws-app")
export class App extends JSXElement {
  // don't use shadow dom. allows inheriting main.css styles.
  useLightDOM: boolean = true;

  protected render() {
    const [activeTab, setActiveTab] = this.useState<TabId>("wikis");
    const [itemsByTab, setItemsByTab] = this.useState<ItemsByTab>(() => getInitialItems());
    const [modalState, setModalState] = this.useState<ModalState | null>(null);

    const currentTab = getTab(activeTab);
    const currentItems = itemsByTab[activeTab];
    const selectedTab = modalState ? getTab(modalState.tabId) : null;

    const openItem = (tabId: TabId, index: number) => {
      const tab = getTab(tabId);
      const item = itemsByTab[tabId][index];
      if (!item) return;
      setActiveTab(tabId);
      setModalState({
        tabId,
        mode: "edit",
        index,
        draft: createDraft(tab, item),
      });
    };

    const openCreate = (tabId: TabId) => {
      const tab = getTab(tabId);
      setActiveTab(tabId);
      setModalState({
        tabId,
        mode: "create",
        draft: createDraft(tab),
      });
    };

    const closeModal = () => setModalState(null);

    const updateDraft = (fieldKey: string, value: string) => {
      setModalState((state) => state
        ? { ...state, draft: { ...state.draft, [fieldKey]: value } }
        : state);
    };

    const saveDraft = () => {
      if (!modalState) return;
      setItemsByTab((current) => {
        const nextItems = [...current[modalState.tabId]];
        if (modalState.mode === "edit" && modalState.index !== undefined) {
          nextItems[modalState.index] = { ...modalState.draft };
        } else {
          nextItems.unshift({ ...modalState.draft });
        }
        return { ...current, [modalState.tabId]: nextItems };
      });
      closeModal();
    };

    const renderFieldEditor = (field: FieldDefinition, value: string) => {
      const inputId = `field-${field.key}`;

      if (!modalState) return null;

      switch (field.type) {
        case "string":
        case "version":
          return <input id={inputId} class="field-input" type="text" value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLInputElement).value)} />;
        case "number":
          return <input id={inputId} class="field-input" type="number" value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLInputElement).value)} />;
        case "text":
          return <textarea id={inputId} class="field-textarea" rows={4} value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
        case "json-editor":
        case "permission-table":
        case "key-value-table":
        case "parameter-list":
          return <textarea id={inputId} class="field-textarea is-code" rows={8} value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
        case "search-multiselect":
        case "summary-list":
        case "relationship-table":
        case "activity-feed":
        case "metadata-table":
        case "table":
          return <textarea id={inputId} class="field-textarea is-code" rows={6} value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
        case "select": {
          const options = getSelectOptions(field, itemsByTab);
          return (
            <select id={inputId} class="field-select" value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLSelectElement).value)}>
              <option value="">Select…</option>
              {options.map((option) => <option value={option}>{option}</option>)}
            </select>
          );
        }
        case "autocomplete": {
          const datalistId = `${inputId}-options`;
          const options = getAutocompleteOptions(field, itemsByTab);
          return (
            <>
              <input id={inputId} class="field-input" type="text" value={value} list={datalistId} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLInputElement).value)} />
              <datalist id={datalistId}>
                {options.map((option) => <option value={option} />)}
              </datalist>
            </>
          );
        }
        case "action":
          return <button type="button" class="ghost-button" onclick={() => updateDraft(field.key, `Triggered at ${new Date().toLocaleTimeString()}`)}>{formatFieldValue(value) === "—" ? field.label : value}</button>;
        default:
          return <textarea id={inputId} class="field-textarea" rows={5} value={value} oninput={(event) => updateDraft(field.key, (event.currentTarget as HTMLTextAreaElement).value)} />;
      }
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
              <strong>15</strong>
            </article>
            <article>
              <span>Templates</span>
              <strong>4</strong>
            </article>
            <article>
              <span>Bags</span>
              <strong>22</strong>
            </article>
            <article>
              <span>Plugins</span>
              <strong>19</strong>
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
              <small>{tab.items.length} items</small>
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
              <p>Click any row to inspect its edit surface and derived architecture fields.</p>
            </div>
            <div class="toolbar-actions">
              <button class="ghost-button" type="button" onclick={() => openCreate(currentTab.id)}>{getCreateLabel(currentTab.id)}</button>
              <button class="ghost-button" type="button" onclick={() => openItem(currentTab.id, 0)}>Open featured item</button>
            </div>
          </div>

          <div class="list-grid list-grid-header">
            {currentTab.columns.map((column) => (
              <div class="list-cell list-head">{column.label}</div>
            ))}
          </div>

          <div class="list-body">
            {currentItems.map((item, index) => (
              <button class="list-grid list-row" type="button" onclick={() => openItem(currentTab.id, index)}>
                {currentTab.columns.map((column) => (
                  <div class="list-cell">{formatFieldValue(item[column.key])}</div>
                ))}
              </button>
            ))}
          </div>
        </section>

        {modalState && selectedTab ? (
          <div class="modal-shell" onclick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}>
            <section class="modal-card" role="dialog" aria-modal="true" aria-label={`${selectedTab.label} details`}>
              <header class="modal-header">
                <div>
                  <p class="eyebrow">{selectedTab.eyebrow}</p>
                  <h3>{modalState.mode === "create" ? `New ${selectedTab.label.slice(0, -1)}` : getPrimaryValue(selectedTab, modalState.draft)}</h3>
                  <p>{selectedTab.description}</p>
                </div>
                <button class="close-button" type="button" onclick={closeModal} aria-label="Close details">×</button>
              </header>

              <div class="modal-layout">
                <aside class="field-index">
                  <h4>{modalState.mode === "create" ? "Create fields" : "Edit fields"}</h4>
                  <p class="field-index-copy">Editable fields render as inputs. Derived fields remain read-only so authored state stays separate from compiled state.</p>
                  <ul>
                    {selectedTab.fields.map((field) => (
                      <li>
                        <span>{field.label}</span>
                        <small>{isEditable(field, modalState.mode) ? `${field.type} · editable` : `${field.type} · derived`}</small>
                      </li>
                    ))}
                  </ul>
                </aside>

                <div class="field-stack">
                  {selectedTab.fields.map((field) => (
                    <article class="field-card">
                      <header class="field-card-header">
                        <div>
                          <h4>{field.label}</h4>
                          <p>{field.key}</p>
                        </div>
                        <div class="field-badges">
                          <span class="badge badge-type">{field.type}</span>
                          {field.mode ? <span class="badge badge-mode">{field.mode}</span> : null}
                        </div>
                      </header>

                      {isEditable(field, modalState.mode) ? (
                        <div class="field-editor">
                          <label class="field-label" for={`field-${field.key}`}>{field.label}</label>
                          {renderFieldEditor(field, modalState.draft[field.key] ?? "")}
                        </div>
                      ) : (
                        <div class="field-value">
                          <pre>{formatFieldValue(modalState.draft[field.key])}</pre>
                        </div>
                      )}

                      {field.architecture ? (
                        <div class="field-architecture">
                          <strong>Architecture</strong>
                          <p>{field.architecture}</p>
                        </div>
                      ) : null}
                    </article>
                  ))}

                  <footer class="modal-actions">
                    <button class="ghost-button" type="button" onclick={closeModal}>Cancel</button>
                    <button class="primary-button" type="button" onclick={saveDraft}>{modalState.mode === "create" ? `Save ${selectedTab.label.slice(0, -1)}` : "Save changes"}</button>
                  </footer>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    );
  }
}
