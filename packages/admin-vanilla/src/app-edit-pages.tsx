import { customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import addIcon from "@material-symbols/svg-400/outlined/add.svg";
import deleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import { CurrentSection, EditorField, PageCard, PageSection } from "./app-shell";
import type { EditPageModel } from "./app-shell";
import { MaterialSymbol } from "./material-symbol";
import type { DataStore } from "@tiddlywiki/mws/src";


export interface WritablePrefixRow {
  prefix: string;
  bagName: string;
}

export interface PermissionRow<Level extends string = string> {
  role: string;
  level: Level;
}

type Wiki = DataStore["wikis"][number];
type Template = DataStore["templates"][number];
type Bag = DataStore["bags"][number];
type User = DataStore["users"][number];
type Role = DataStore["roles"][number];

type PageId = "wikis" | "templates" | "bags" | "roles" | "users";

interface EditorLookups {
  bags: readonly string[];
  plugins: readonly string[];
  templates: readonly string[];
  roles: readonly string[];
  versions: readonly string[];
}

interface TextInputProps {
  inputId: string;
  value?: string | null;
  type?: "text" | "email";
  multiline?: boolean;
  code?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: readonly string[];
  label?: string;
}

@customElement("mws-edit-text-input")
export class EditTextInput extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: TextInputProps;

  protected render() {
    const { inputId, value = "", type = "text", multiline, code, disabled, placeholder, options, label } = this.props;
    const currentValue = value ?? "";
    if (multiline) return <textarea id={inputId} class={code ? "field-textarea is-code" : "field-textarea"}
      rows={code ? 10 : 4} disabled={disabled} aria-label={label} placeholder={placeholder}
      ref={(element) => { if (element.value !== currentValue) element.value = currentValue; }} />;
    return <>
      <input id={inputId} class="field-input" type={type} value={currentValue} disabled={disabled}
        aria-label={label} placeholder={placeholder} list={options?.length ? `${inputId}-options` : undefined}
        ref={(element) => { if (element.value !== currentValue) element.value = currentValue; }} />
      {options?.length ? <datalist id={`${inputId}-options`}>
        {options.map((option) => <option value={option} />)}
      </datalist> : null}
    </>;
  }
}

interface ToggleProps {
  inputId: string;
  label: string;
  checked: boolean;
}

@customElement("mws-edit-toggle")
export class EditToggle extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: ToggleProps;

  protected render() {
    const { inputId, label, checked } = this.props;
    return <label class="header-switch" for={inputId}>
      <input id={inputId} class="header-switch-input" type="checkbox" checked={checked} disabled aria-label={label}
        ref={(element) => { element.checked = checked; }} />
      <span class={checked ? "header-switch-track is-checked" : "header-switch-track"} aria-hidden="true">
        <span class="header-switch-thumb"></span>
      </span>
    </label>;
  }
}

function rowActions(label: string) {
  return <button class="row-action-button editor-row-action" type="button" disabled aria-label={`Remove ${label}`} title={`Remove ${label}`}>
    <MaterialSymbol icon={deleteIcon} />
  </button>;
}

function addRow(label: string) {
  return <button class="ghost-button editor-row-action" type="button" disabled>
    <MaterialSymbol icon={addIcon} /> Add {label}
  </button>;
}

interface StringListProps {
  inputId: string;
  label: string;
  value: readonly string[];
  options: readonly string[];
}

@customElement("mws-edit-string-list")
export class EditStringList extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: StringListProps;

  protected render() {
    const { inputId, label, value, options } = this.props;
    return <div class="row-editor-stack">
      {(value.length ? value : [""]).map((entry, index) => <div class="row-editor-row">
        <EditTextInput inputId={`${inputId}-${index}`} value={entry} placeholder={label} label={label} options={options} />
        {rowActions(label)}
      </div>)}
      {addRow(label)}
    </div>;
  }
}

interface PrefixListProps {
  inputId: string;
  value: readonly WritablePrefixRow[];
  bags: readonly string[];
}

@customElement("mws-edit-prefix-list")
export class EditPrefixList extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: PrefixListProps;

  protected render() {
    const { inputId, value, bags } = this.props;
    return <div class="row-editor-stack">
      {(value.length ? value : [{ prefix: "", bagName: "" }]).map((row, index) => <div class="row-editor-row row-editor-row-wide">
        <div class="prefix-input-shell">
          <EditTextInput inputId={`${inputId}-${index}-prefix`} value={row.prefix} label="Title prefix" placeholder="Prefix, leave blank for default" />
        </div>
        <EditTextInput inputId={`${inputId}-${index}-bag`} value={row.bagName} label="Target bag" placeholder="Target bag" options={bags} />
        {rowActions("prefix rule")}
      </div>)}
      {addRow("prefix rule")}
    </div>;
  }
}

interface PermissionListProps {
  value: readonly PermissionRow[];
  roles: readonly string[];
}

@customElement("mws-edit-permission-list")
export class EditPermissionList extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: PermissionListProps;

  protected render() {
    const { value, roles } = this.props;
    return <div class="row-editor-stack">
      {(value.length ? value : [{ role: "", level: "A_read" }]).map((row, index) => <div class="row-editor-row row-editor-row-wide row-editor-row-permission">
        <EditTextInput inputId={`bag-permission-${index}-role`} value={row.role} label="Role" placeholder="Role" options={roles} />
        <select class="field-select" aria-label="Permission level" disabled>
          <option value="A_read" selected={row.level === "A_read"}>read</option>
          <option value="B_write" selected={row.level === "B_write"}>write</option>
          <option value="C_admin" selected={row.level === "C_admin"}>admin</option>
        </select>
        {rowActions("permission")}
      </div>)}
      {addRow("permission")}
    </div>;
  }
}

function textField(inputId: string, title: string, value?: string | null, extra: Partial<TextInputProps> = {}) {
  return <EditorField title={title} inputId={inputId} renderContent={() => <EditTextInput {...extra} inputId={inputId} value={value} />} />;
}

function stringList(inputId: string, label: string, value: readonly string[] = [], options: readonly string[] = []) {
  return <EditStringList inputId={inputId} label={label} value={value} options={options} />;
}

export function renderWikiEditor(value: Partial<Wiki>, lookups: EditorLookups, mode: "create" | "edit") {
  return <PageSection renderContent={() => <>
    <PageCard title="Basic info" width="full" layout="stack" renderContent={() => <>
      {textField("wiki-slug", "Slug", value.slug)}
      {textField("wiki-display-name", "Display name", value.displayName)}
      {textField("wiki-description", "Description", value.description, { multiline: true })}
      {textField("wiki-template", "Template", value.templateName, { options: lookups.templates, disabled: mode === "edit" })}
    </>} />
    <PageCard title="Writable bags" width="full" description="Tiddlers use the longest matching prefix; unmatched titles use the default bag."
      renderContent={() => <EditPrefixList inputId="wiki-routing" value={value.writablePrefixBags ?? []} bags={lookups.bags} />} />
    <PageCard title="Readonly bags" description="Checked after the writable bag matching the title prefix."
      renderContent={() => stringList("wiki-readonly", "Bag name", value.readonlyBags, lookups.bags)} />
    <PageCard title="Plugins" renderContent={() => stringList("wiki-plugins", "Plugin name", value.plugins, lookups.plugins)} />
    <PageCard title="Recipe users" description="Roles permitted to open this wiki. Bag permissions still apply."
      renderContent={() => stringList("wiki-users", "Role name", value.recipeUsers, lookups.roles)} />
    <PageCard title="Recipe admins" description="Roles permitted to edit this wiki's settings."
      renderContent={() => stringList("wiki-admins", "Role name", value.recipeAdmins, lookups.roles)} />
  </>} />;
}

export function renderTemplateEditor(value: Partial<Template>, lookups: EditorLookups) {
  const customHtmlEnabled = value.customHtmlEnabled ?? false;
  return <PageSection renderContent={() => <>
    <PageCard title="Template basics" width="full" layout="stack" renderContent={() => <>
      {textField("template-name", "Name", value.name)}
      {textField("template-description", "Description", value.description, { multiline: true })}
      {textField("template-version", "TiddlyWiki version", value.twVersion, { options: lookups.versions, placeholder: "Site default" })}
    </>} />
    <PageCard title="Writable routing" width="full" description="The default bag catches titles that do not match a prefix."
      renderContent={() => <EditPrefixList inputId="template-routing" value={value.writablePrefixBags ?? []} bags={lookups.bags} />} />
    <PageCard title="Readonly bags" renderContent={() => stringList("template-readonly", "Bag name", value.readonlyBags, lookups.bags)} />
    <PageCard title="Plugins" layout="stack" renderContent={() => <>
      <EditorField renderContent={() => stringList("template-plugins", "Plugin name", value.plugins, lookups.plugins)} />
      <EditorField title="Include required plugins" inputId="template-required-plugins" renderContent={() => <EditToggle inputId="template-required-plugins" label="Include required plugins" checked={value.requiredPluginsEnabled ?? true} />} />
      <EditorField title="Enable plugin caching" inputId="template-external-plugins" renderContent={() => <EditToggle inputId="template-external-plugins" label="Enable plugin caching" checked={value.externalPlugins ?? false} />} />
      <EditorField title="External JS store" inputId="template-external-store" renderContent={() => <EditToggle inputId="template-external-store" label="External JS store" checked={value.externalStore ?? false} />} />
    </>} />
    <PageCard title="Template users" description="Roles permitted to select this template when creating a wiki."
      renderContent={() => stringList("template-users", "Role name", value.templateUsers, lookups.roles)} />
    <PageCard title="Template admins" description="Roles permitted to edit this template."
      renderContent={() => stringList("template-admins", "Role name", value.templateAdmins, lookups.roles)} />
    <PageCard title="Custom HTML shell" width="full" layout="stack"
      renderHeaderAction={() => <EditToggle inputId="template-custom-html" label="Custom HTML shell" checked={customHtmlEnabled} />}
      renderContent={() => <>
        {textField("template-html", "HTML content", value.htmlContent, { multiline: true, code: true, disabled: !customHtmlEnabled })}
        {textField("template-injection-function", "Injection function", value.injectionFunction ?? "$tw.preloadTiddlers", { disabled: !customHtmlEnabled })}
        {textField("template-injection-location", "Injection marker", value.injectionLocation, { disabled: !customHtmlEnabled })}
      </>} />
  </>} />;
}

export function renderBagEditor(value: Partial<Bag>, lookups: EditorLookups) {
  return <PageSection renderContent={() => <>
    <PageCard title="Bag basics" width="full" layout="stack" renderContent={() => <>
      {textField("bag-name", "Name", value.name)}
      {textField("bag-description", "Description", value.description, { multiline: true })}
    </>} />
    <PageCard title="Permissions" width="full" renderContent={() => <EditPermissionList value={value.bagPermissions ?? []} roles={lookups.roles} />} />
  </>} />;
}

export function renderRoleEditor(value: Partial<Role>) {
  return <PageSection renderContent={() => <PageCard title="Role basics" width="full" layout="stack" renderContent={() => <>
    {textField("role-name", "Role name", value.name)}
    {textField("role-description", "Role description", value.description, { multiline: true })}
  </>} />} />;
}

export function renderUserEditor(value: Partial<User>, lookups: EditorLookups) {
  return <PageSection renderContent={() => <>
    <PageCard title="User identity" width="full" layout="stack" renderContent={() => <>
      {textField("user-username", "Username", value.username)}
      {textField("user-email", "Email", value.email, { type: "email" })}
    </>} />
    <PageCard title="Roles" renderContent={() => stringList("user-roles", "Role name", value.userRoles, lookups.roles)} />
    <PageCard title="Reset code" description="Allows the user to reset their password."
      renderContent={() => textField("user-reset-code", "Reset code", value.resetCode)} />
  </>} />;
}

function currentText(title: string, value?: string | null) {
  return <CurrentSection title={title} renderContent={() => <div class="field-value"><pre>{value || "None"}</pre></div>} />;
}

function currentList(title: string, values: readonly string[]) {
  return <CurrentSection title={title} renderContent={() => values.length
    ? <ul class="value-list">{values.map((value) => <li>{value}</li>)}</ul>
    : <p>None</p>} />;
}

export function renderWikiCurrent(saved: Wiki) {
  return <>
    {currentText("Display name", saved.displayName)}
    {currentText("Slug", saved.slug)}
    {currentText("Template", saved.templateName)}
    <CurrentSection title="Current writable bags" renderContent={() => saved.effectiveWritableBags.length ? <dl class="prefix-bag-sidebar">
      {saved.effectiveWritableBags.map((row) => <>
        <dt class="prefix-bag-sidebar-term">{row.prefix ? <code>{JSON.stringify(row.prefix)}</code> : <span class="prefix-bag-sidebar-pill">default</span>}</dt>
        <dd class="prefix-bag-sidebar-value">{row.bagName}</dd>
      </>)}
    </dl> : <p>None</p>} />
    {currentList("Current readonly bags", saved.effectiveReadonlyBags)}
    {currentList("Current plugin set", saved.effectivePluginSet)}
    {currentText("Compiled", saved.lastCompiledAt)}
  </>;
}

export function renderTemplateCurrent(saved: Template, data: DataStore | null) {
  return <>
    {currentText("Name", saved.name)}
    {currentText("Description", saved.description)}
    {currentList("Dependent wikis", data?.wikis.filter((wiki) => wiki.templateName === saved.name).map((wiki) => wiki.slug) ?? [])}
  </>;
}

export function renderBagCurrent(saved: Bag, data: DataStore | null) {
  return <>
    {currentText("Name", saved.name)}
    {currentText("Description", saved.description)}
    {currentList("Referenced by templates", data?.templates.filter((template) => template.readonlyBags.includes(saved.name)
      || template.writablePrefixBags.some((row) => row.bagName === saved.name)).map((template) => template.name) ?? [])}
    {currentList("Referenced by wikis", data?.wikis.filter((wiki) => wiki.effectiveReadonlyBags.includes(saved.name)
      || wiki.effectiveWritableBags.some((row) => row.bagName === saved.name)).map((wiki) => wiki.slug) ?? [])}
  </>;
}

type EditPageRenders = Pick<EditPageModel, "renderCurrent" | "renderEditor">;

export function getEditPageRenders(tabId: PageId, data: DataStore | null, saved?: DataStore[PageId][number]): EditPageRenders {
  const lookups: EditorLookups = {
    bags: data?.bags.map((bag) => bag.name) ?? [],
    plugins: data?.availablePlugins.map((plugin) => plugin.name) ?? [],
    templates: data?.templates.map((template) => template.name) ?? [],
    roles: data?.roles.map((role) => role.name) ?? [],
    versions: embeddedServerResponse.tw5Versions,
  };
  switch (tabId) {
    case "wikis": {
      const wiki = saved as Wiki | undefined;
      return {
        renderCurrent: wiki ? () => renderWikiCurrent(wiki) : undefined,
        renderEditor: () => renderWikiEditor(wiki ?? {}, lookups, wiki ? "edit" : "create")
      };
    }
    case "templates": {
      const template = saved as Template | undefined;
      return {
        renderCurrent: template ? () => renderTemplateCurrent(template, data) : undefined,
        renderEditor: () => renderTemplateEditor(template ?? {}, lookups)
      };
    }
    case "bags": {
      const bag = saved as Bag | undefined;
      return {
        renderCurrent: bag ? () => renderBagCurrent(bag, data) : undefined,
        renderEditor: () => renderBagEditor(bag ?? {}, lookups)
      };
    }
    case "roles": {
      const role = saved as Role | undefined;
      return {
        renderCurrent: role ? () => <>
          {currentText("Name", role.name)}
          {currentText("Description", role.description)}
        </> : undefined,
        renderEditor: () => renderRoleEditor(role ?? {})
      };
    }
    case "users": {
      const user = saved as User | undefined;
      return {
        renderCurrent: user ? () => <>
          {currentText("Username", user.username)}
          {currentText("Email", user.email)}
          {currentList("Roles", user.userRoles)}
        </> : undefined,
        renderEditor: () => renderUserEditor(user ?? {}, lookups)
      };
    }
  }
}