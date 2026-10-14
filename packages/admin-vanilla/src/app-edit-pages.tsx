import { customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import addIcon from "@material-symbols/svg-400/outlined/add.svg";
import deleteIcon from "@material-symbols/svg-400/outlined/delete.svg";
import {
  CurrentSection, EditorField, PageCard, PageSection,
} from "./app-shell";
import type { EditPageModel } from "./app-shell";
import { MaterialSymbol } from "./material-symbol";
import { FormArray, FormControl, FormGroup } from "./app-forms";
import { PageId, WritablePrefixRow, DataStore, IdString } from "@/server";
import { createBagForm, createRoleForm, createTemplateForm, createUserForm, createWikiForm, permissionControl, prefixControl } from "./app-edit-forms";

type Wiki = DataStore["wikis"][number];
type Template = DataStore["templates"][number];
type Bag = DataStore["bags"][number];
type User = DataStore["users"][number];
type Role = DataStore["roles"][number];
type BagPermission = Bag["bagPermissions"][number];

interface EditorLookups {
  bags: readonly string[];
  plugins: readonly string[];
  templates: readonly string[];
  roles: readonly string[];
  versions: readonly string[];
}

interface TextInputProps {
  inputId: string;
  control: FormControl<string>;
  type?: "text" | "email" | "password";
  autocomplete?: JSX.IntrinsicElements["input"]["autocomplete"];
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
    const {
      inputId, control,
      type = "text",
      multiline, code,
      placeholder, options,
      label, autocomplete,
    } = this.props;
    this.useEffect(() => control.subscribe(() => this.requestUpdate()),
      [control]);
    const currentValue = control.value;
    const disabled = this.props.disabled || control.disabled;
    const oninput = (event: Event) => {
      if (disabled) return;
      control.markAsDirty(false);
      control.setValue((event.currentTarget as
        HTMLInputElement | HTMLTextAreaElement).value);
    };
    const onblur = () => control.markAsTouched();
    if (multiline) return <textarea
      id={inputId}
      class={code ? "field-textarea is-code" : "field-textarea"}
      rows={code ? 10 : 4} disabled={disabled} aria-label={label}
      placeholder={placeholder}
      oninput={oninput} onblur={onblur}
      ref={(element) => {
        if (element.value !== currentValue) element.value = currentValue;
      }}
    />;
    return <>
      <input
        id={inputId} class="field-input" type={type}
        value={currentValue} disabled={disabled}
        autocomplete={autocomplete}
        aria-label={label} placeholder={placeholder}
        list={options?.length ? `${inputId}-options` : undefined}
        oninput={oninput} onblur={onblur}
        ref={(element) => {
          if (element.value !== currentValue) element.value = currentValue;
        }}
      />
      {options?.length ? <datalist id={`${inputId}-options`}>
        {options.map((option) => <option value={option} />)}
      </datalist> : null}
    </>;
  }
}

interface ToggleProps {
  inputId: string;
  label: string;
  control: FormControl<boolean>;
}

@customElement("mws-edit-toggle")
export class EditToggle extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: ToggleProps;

  protected render() {
    const { inputId, label, control } = this.props;
    this.useEffect(() => control.subscribe(() => this.requestUpdate()),
      [control]);
    const checked = control.value;
    return <label
      class="header-switch" for={inputId}>
      <input
        id={inputId} class="header-switch-input" type="checkbox"
        checked={checked} disabled={control.disabled} aria-label={label}
        onchange={(event) => {
          if (control.disabled) return;
          control.markAsDirty(false);
          control.setValue(event.currentTarget.checked);
        }}
        onblur={() => control.markAsTouched()}
        ref={(element) => { element.checked = checked; }}
      />
      <span
        aria-hidden="true"
        class={checked ? "header-switch-track is-checked" : "header-switch-track"}>
        <span class="header-switch-thumb"></span>
      </span>
    </label>;
  }
}

function rowActions(label: string, disabled: boolean, onRemove: () => void) {
  return <button
    class="row-action-button editor-row-action" type="button"
    disabled={disabled} onclick={onRemove}
    aria-label={`Remove ${label}`} title={`Remove ${label}`}>
    <MaterialSymbol icon={deleteIcon} />
  </button>;
}

function addRow(label: string, disabled: boolean, onAdd: () => void) {
  return <button
    class="ghost-button editor-row-action" type="button"
    disabled={disabled} onclick={onAdd}>
    <MaterialSymbol icon={addIcon} /> Add {label}
  </button>;
}

interface StringListProps {
  inputId: string;
  label: string;
  control: FormArray<string>;
  options: readonly string[];
}

const rowKeys = new WeakMap<FormControl<any>, symbol>();

function rowKey(control: FormControl<any>): symbol {
  let key = rowKeys.get(control);
  if (!key) {
    key = Symbol();
    rowKeys.set(control, key);
  }
  return key;
}

function removeRow<Value>(control: FormArray<Value>, index: number): void {
  if (control.disabled) return;
  control.markAsDirty(false);
  control.removeAt(index);
}

function appendRow<Value>(
  control: FormArray<Value>, row: FormControl<Value>,
): void {
  if (control.disabled) return;
  control.markAsDirty(false);
  control.addControl(row);
}

@customElement("mws-edit-string-list")
export class EditStringList extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: StringListProps;

  protected render() {
    const { inputId, label, control, options } = this.props;
    this.useEffect(() => control.subscribe(() => this.requestUpdate()),
      [control]);
    return <div class="row-editor-stack">
      {control.controls.map((entry, index) =>
        <div class="row-editor-row" key={rowKey(entry)}>
          <EditTextInput
            inputId={`${inputId}-${index}`} control={entry}
            placeholder={label} label={label} options={options}
          />
          {rowActions(label, control.disabled, () => removeRow(control, index))}
        </div>)}
      {addRow(label, control.disabled,
        () => appendRow(control, new FormControl("")))}
    </div>;
  }
}

interface PrefixListProps {
  inputId: string;
  control: FormArray<WritablePrefixRow>;
  bags: readonly string[];
}


@customElement("mws-edit-prefix-list")
export class EditPrefixList extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: PrefixListProps;

  protected render() {
    const { inputId, control, bags } = this.props;
    this.useEffect(() => control.subscribe(() => this.requestUpdate()),
      [control]);
    return <div class="row-editor-stack">
      {control.controls.map((entry, index) => {
        const row = entry as FormGroup<WritablePrefixRow>;
        return <div
          class="row-editor-row row-editor-row-wide"
          key={rowKey(row)}
        >
          <div class="prefix-input-shell">
            <EditTextInput
              inputId={`${inputId}-${index}-prefix`}
              control={row.controls.prefix} label="Title prefix"
              placeholder="Prefix, leave blank for default"
            />
          </div>
          <EditTextInput
            inputId={`${inputId}-${index}-bag`}
            control={row.controls.bagName} label="Target bag"
            placeholder="Target bag" options={bags}
          />
          {rowActions("prefix rule", control.disabled,
            () => removeRow(control, index))}
        </div>;
      })}
      {addRow("prefix rule", control.disabled,
        () => appendRow(control, prefixControl()))}
    </div>;
  }
}

interface PermissionListProps {
  control: FormArray<BagPermission>;
  roles: readonly string[];
}


@customElement("mws-edit-permission-level")
export class EditPermissionLevel extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: { control: FormControl<BagPermission["level"]> };

  protected render() {
    const { control } = this.props;
    this.useEffect(() => control.subscribe(() => this.requestUpdate()),
      [control]);
    return <select
      class="field-select" aria-label="Permission level"
      disabled={control.disabled}
      onchange={(event) => {
        if (control.disabled) return;
        control.markAsDirty(false);
        control.setValue(event.currentTarget.value as BagPermission["level"]);
      }}
      onblur={() => control.markAsTouched()}
      ref={(element) => { element.value = control.value; }}>
      <option value="A_read" selected={control.value === "A_read"}>read</option>
      <option value="B_write" selected={control.value === "B_write"}>write</option>
      <option value="C_admin" selected={control.value === "C_admin"}>admin</option>
    </select>;
  }
}

@customElement("mws-edit-permission-list")
export class EditPermissionList extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: PermissionListProps;

  protected render() {
    const { control, roles } = this.props;
    this.useEffect(() => control.subscribe(() => this.requestUpdate()),
      [control]);
    return <div class="row-editor-stack">
      {control.controls.map((entry, index) => {
        const row = entry as FormGroup<BagPermission>;
        return <div
          key={rowKey(row)}
          class="row-editor-row row-editor-row-wide row-editor-row-permission">
          <EditTextInput
            inputId={`bag-permission-${index}-role`}
            control={row.controls.role} label="Role" placeholder="Role"
            options={roles}
          />
          <EditPermissionLevel control={row.controls.level} />
          {rowActions("permission", control.disabled,
            () => removeRow(control, index))}
        </div>;
      })}
      {addRow("permission", control.disabled,
        () => appendRow(control, permissionControl()))}
    </div>;
  }
}

function textField(
  inputId: string, title: string, control: FormControl<string>,
  extra: Partial<TextInputProps> & { description?: string } = {},
) {
  const { description, ...inputProps } = extra;
  return <EditorField
    title={title} description={description} inputId={inputId}
    renderContent={() => <EditTextInput
      {...inputProps}
      inputId={inputId} control={control} />} />;
}

function stringList(
  inputId: string, label: string, control: FormArray<string>,
  options: readonly string[] = [],
) {
  return <EditStringList
    inputId={inputId} label={label}
    control={control} options={options} />;
}



@customElement("mws-edit-custom-html-fields")
export class EditCustomHtmlFields extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: {
    enabled: FormControl<boolean>;
    htmlContent: FormControl<string>;
    injectionFunction: FormControl<string>;
    injectionLocation: FormControl<string>;
  };

  constructor() {
    super();
    this.style.display = "contents";
  }

  protected render() {
    const {
      enabled, htmlContent, injectionFunction, injectionLocation,
    } = this.props;
    this.useEffect(() => {
      const updateDisabled = () => {
        for (const control of [
          htmlContent, injectionFunction, injectionLocation,
        ]) {
          if (enabled.value) control.enable(false);
          else control.disable(false);
        }
      };
      updateDisabled();
      return enabled.subscribe(updateDisabled);
    }, [enabled, htmlContent, injectionFunction, injectionLocation]);
    return <>
      {textField("template-html", "HTML content", htmlContent, {
        multiline: true,
        code: true,
        description: "Store the raw HTML that will be served for this template. "
          + "All HTTP endpoints still work, but any boot, library, or raw "
          + "markup tiddlers must be included here manually.",
      })}
      {textField("template-injection-function", "Injection function",
        injectionFunction, {
        description: "Name of the JavaScript function to call with each "
          + "tiddler, for example $tw.preloadTiddler.",
      })}
      {textField("template-injection-location", "Injection marker",
        injectionLocation, {
        description: "Inject the tiddlers before this string in the HTML "
          + "file, for example <!-- INJECT STORE TIDDLERS HERE -->. "
          + "It must not be inside a script tag.",
      })}
    </>;
  }
}

@customElement("mws-edit-routing-preview")
export class EditRoutingPreview extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: { targets: readonly WritablePrefixRow[] };
  private titleControl = new FormControl("");

  protected render() {
    this.useEffect(() => this.titleControl.subscribe(() => this.requestUpdate()),
      [this.titleControl]);
    const title = this.titleControl.value.trim();
    const targets = this.props.targets.filter((row) => row.bagName)
      .sort((first, second) => second.prefix.length - first.prefix.length);
    const target = title
      ? targets.find((row) => row.prefix && title.startsWith(row.prefix))
      ?? targets.find((row) => row.prefix === "")
      : undefined;
    return <div class="tool-panel resolver-tool">
      <label class="field-label" for="wiki-routing-title">Title to test</label>
      <EditTextInput inputId="wiki-routing-title" control={this.titleControl} />
      <div class="resolver-grid">
        <div class="resolver-stat">
          <span>Matched prefix</span>
          <strong>{target ? target.prefix || "default" : "none"}</strong>
        </div>
        <div class="resolver-stat">
          <span>Write target</span>
          <strong>{target?.bagName ?? "No writable target"}</strong>
        </div>
      </div>
      <div class="field-callout">
        <p>{"Enter a title to preview how this wiki would route it."}</p>
      </div>
    </div>;
  }
}


@customElement("mws-wiki-routing-preview")
export class WikiRoutingPreview extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: {
    routing: FormArray<WritablePrefixRow>;
    templateName: FormControl<string>;
    templates: readonly Template[];
  };

  protected render() {
    const { routing, templateName, templates } = this.props;
    this.useEffect(() => {
      const routingSubscription = routing.subscribe(() => this.requestUpdate());
      const templateSubscription = templateName.subscribe(() => this.requestUpdate());
      return () => {
        routingSubscription.unsubscribe();
        templateSubscription.unsubscribe();
      };
    }, [routing, templateName]);
    const template = templates.find((entry) => entry.name === templateName.value);
    const targets = new Map<string, string>();
    for (const row of [...template?.writablePrefixBags ?? [], ...routing.value]) {
      const bagName = row.bagName.trim();
      if (bagName) targets.set(row.prefix, bagName);
    }
    return <EditRoutingPreview
      targets={Array.from(targets, ([prefix, bagName]) => ({ prefix, bagName }))}
    />;
  }
}


export function renderWikiEditor(
  form: any, lookups: EditorLookups,
  templates: readonly Template[] = [],
) {
  const { controls } = form;
  return <>
    <PageSection
      renderContent={() => <>
        <PageCard
          title="Basic Info" width="full" layout="stack"
          renderContent={() => <>
            {textField("wiki-slug", "Slug", controls.slug)}
            {textField("wiki-display-name", "Display name", controls.displayName)}
            {textField("wiki-description", "Description", controls.description,
              { multiline: true })}
            {textField("wiki-template", "Template", controls.templateName,
              { options: lookups.templates })}
          </>}
        />
        <PageCard
          title="Writable bags" width="full"
          description={[
            "Each title uses the writable bag with the longest matching prefix. A blank prefix matches titles with no longer match.",
            "Writes go to that bag. Reads check that bag first, then the readonly bags if the tiddler isn’t found. Other writable bags aren’t checked.",
          ]}
          renderContent={() => <EditPrefixList
            inputId="wiki-routing"
            control={controls.writablePrefixBags} bags={lookups.bags}
          />}
        />
        <PageCard
          title="Readonly bags"
          description={"Checked when the tiddler is not in the writable bag matching the prefix."}
          renderContent={() => stringList("wiki-readonly", "Bag name",
            controls.readonlyBags, lookups.bags)}
        />
        <PageCard
          title="Plugins"
          description={"Add wiki-specific plugins on top of the template plugin set."}
          renderContent={() => stringList("wiki-plugins", "Plugin name",
            controls.plugins, lookups.plugins)}
        />
        <PageCard
          title="Recipe Users"
          description={"Users able to open this wiki, assuming they have read permission on every bag as well."}
          renderContent={() => stringList("wiki-users", "Role name",
            controls.recipeUsers, lookups.roles)}
        />
        <PageCard
          title="Recipe Admins"
          description="Users able to make changes on this page."
          renderContent={() => stringList("wiki-admins", "Role name",
            controls.recipeAdmins, lookups.roles)}
        />
      </>} />
    <PageSection
      title="Operations and diagnostics" renderContent={() =>
        <PageCard
          title="Title routing test" width="full"
          description={"Test a title against the wiki's proposed prefix rules to see which bag would receive writes."}
          renderContent={() => <WikiRoutingPreview
            routing={controls.writablePrefixBags}
            templateName={controls.templateName}
            templates={templates}
          />}
        />}
    />
  </>;
}




export function renderTemplateEditor(
  form: any, lookups: EditorLookups,
) {
  const { controls } = form;
  return <PageSection
    renderContent={() => <>
      <PageCard
        title="Template basics" 
        width="full" 
        layout="stack"
        renderContent={() => <>
          {textField("template-name", "Name", controls.name)}
          {textField("template-description", "Description", controls.description,
            { multiline: true })}
          {textField("template-version", "TiddlyWiki Version", controls.twVersion, {
            options: lookups.versions,
            placeholder: "Site default",
            description: "TW5 version pinning. Leave blank to use site default.",
          })}
        </>}
      />
      <PageCard
        title="Writable routing" width="full"
        description={[
          "Each title uses the writable bag with the longest matching prefix. A blank prefix matches titles with no longer match.",
          "Writes go to that bag. Reads check that bag first, then the readonly bags if the tiddler isn’t found. Other writable bags aren’t checked.",
        ]}
        renderContent={() => <EditPrefixList
          inputId="template-routing"
          control={controls.writablePrefixBags}
          bags={lookups.bags}
        />}
      />
      <PageCard
        title="Bags"
        renderContent={() => stringList("template-readonly", "Bag name",
          controls.readonlyBags, lookups.bags)}
      />
      <PageCard
        title="Plugins" 
        layout="stack" 
        renderContent={() => <>
          <EditorField
            renderContent={() => stringList("template-plugins", "Plugin name",
              controls.plugins, lookups.plugins)}
          />
          <EditorField
            title="Include Required Plugins"
            inputId="template-required-plugins"
            description={"Core plugins enable wiki sync functionality. "
              + "Disabling removes the plugins, but does not disable the endpoints."}
            renderContent={() => <EditToggle
              inputId="template-required-plugins"
              label="Include Required Plugins"
              control={controls.requiredPluginsEnabled}
            />}
          />
          <EditorField
            title="Enable Plugin Caching"
            inputId="template-external-plugins"
            description={"Serves plugins separately, allowing the browser to "
              + "cache plugins separate from the store."}
            renderContent={() => <EditToggle
              inputId="template-external-plugins"
              label="Enable Plugin Caching"
              control={controls.externalPlugins}
            />}
          />
        </>}
      />
      <PageCard
        title="Template Users"
        description={"Users who can set this template on a recipe. "
          + "This only applies to the user creating the recipe."}
        renderContent={() => stringList("template-users", "Role name",
          controls.templateUsers, lookups.roles)}
      />
      <PageCard
        title="Template Admins"
        description={"Users able to make changes on this page. This affects "
          + "all recipes that use the template, regardless of any other "
          + "permissions."}
        renderContent={() => stringList("template-admins", "Role name",
          controls.templateAdmins, lookups.roles)}
      />
      <PageCard
        title="Custom HTML shell" 
        width="full" 
        layout="stack"
        description={"Enable custom HTML shell settings when this template "
          + "should serve authored HTML instead of the default page shell."}
        renderHeaderAction={() => <EditToggle
          inputId="template-custom-html"
          label="Custom HTML shell"
          control={controls.customHtmlEnabled}
        />}
        renderContent={() => <EditCustomHtmlFields
          enabled={controls.customHtmlEnabled} 
          htmlContent={controls.htmlContent}
          injectionFunction={controls.injectionFunction}
          injectionLocation={controls.injectionLocation}
        />}
      />
    </>}
  />;
}

export function renderBagEditor(
  form: any, lookups: EditorLookups,
) {
  const { controls } = form;
  return <PageSection
    renderContent={() => <>
      <PageCard
        title="Bag basics" 
        width="full" 
        layout="stack"
        renderContent={() => <>
          {textField("bag-name", "Name", controls.name)}
          {textField("bag-description", "Description", controls.description,
            { multiline: true })}
        </>}
      />
      <PageCard
        title="Permissions" width="full"
        description={["These are the operative permissions allowing users to read and write to this bag. A bag's presence in a recipe does not grant users of that recipe permission to read or write the bag."]}
        renderContent={() => <EditPermissionList
          control={controls.bagPermissions} 
          roles={lookups.roles}
        />}
      />
    </>}
  />;
}


export function renderRoleEditor(
  form: any,
) {
  return <PageSection
    renderContent={() =>
      <PageCard
        title="Role basics" 
        width="full" 
        layout="stack"
        renderContent={() => <>
          {textField("role-name", "Role name", form.controls.name)}
          {textField("role-description", "Role description",
            form.controls.description, { multiline: true })}
        </>}
      />}
  />;
}

export function renderUserEditor(
  form: any, lookups: EditorLookups,
) {
  const { controls } = form;
  return <PageSection
    renderContent={() => <>
      <PageCard
        title="User identity" 
        width="full" 
        layout="stack"
        renderContent={() => <>
          {textField("user-username", "Username", controls.username)}
          {textField("user-email", "Email", controls.email, { type: "email" })}
        </>}
      />
      <PageCard
        title="Roles"
        description="Assign one or more role ids to this user account."
        renderContent={() => stringList("user-roles", "Role name",
          controls.userRoles, lookups.roles)}
      />
      <PageCard
        title="Reset Code"
        description="Allow the user to reset their password with this code."
        renderContent={() => textField("user-reset-code", "Reset Code",
          controls.resetCode)}
      />
    </>}
  />;
}

function currentText(title: string, value?: string | null) {
  return <CurrentSection
    title={title}
    renderContent={() => <div class="field-value">
      <pre>{value || "None"}</pre>
    </div>}
  />;
}

function currentList(title: string, values: readonly string[]) {
  return <CurrentSection
    title={title}
    renderContent={() => values.length
      ? <ul class="value-list">{values.map((value) => <li>{value}</li>)}</ul>
      : <p>None</p>
    }
  />;
}

export function renderWikiCurrent(saved: Wiki) {
  return <>
    {currentText("Display name", saved.displayName)}
    {currentText("Slug", saved.slug)}
    {currentText("Template", saved.templateName)}
    <CurrentSection
      title="Current writable bags"
      renderContent={() => saved.effectiveWritableBags.length
        ? <dl class="prefix-bag-sidebar">
          {saved.effectiveWritableBags.map((row) => <>
            <dt class="prefix-bag-sidebar-term">{row.prefix
              ? <code>{JSON.stringify(row.prefix)}</code>
              : <span class="prefix-bag-sidebar-pill">default</span>}</dt>
            <dd class="prefix-bag-sidebar-value">{row.bagName}</dd>
          </>)}
        </dl> : <p>None</p>}
    />
    {currentList("Current readonly bags", saved.effectiveReadonlyBags)}
    {currentList("Current plugin set", saved.effectivePluginSet)}
  </>;
}

export function renderTemplateCurrent(saved: Template, data: DataStore | null) {
  return <>
    {currentText("Name", saved.name)}
    {currentText("Description", saved.description)}
    {currentList("Dependent wikis", data?.wikis
      .filter((wiki) => wiki.templateName === saved.name)
      .map((wiki) => wiki.slug) ?? [])}
  </>;
}

export function renderBagCurrent(saved: Bag, data: DataStore | null) {
  return <>
    {currentText("Name", saved.name)}
    {currentText("Description", saved.description)}
    {currentList("Referenced by templates", data?.templates
      .filter((template) => template.readonlyBags.includes(saved.name)
        || template.writablePrefixBags.some((row) => row.bagName === saved.name))
      .map((template) => template.name) ?? [])}
    {currentList("Referenced by wikis", data?.wikis
      .filter((wiki) => wiki.effectiveReadonlyBags.includes(saved.name)
        || wiki.effectiveWritableBags.some((row) => row.bagName === saved.name))
      .map((wiki) => wiki.slug) ?? [])}
  </>;
}

type EditPageRenders = Pick<
  EditPageModel, "renderCurrent" | "renderEditor"
> & {
  form: FormGroup<any>;
};

export function getEditPageRenders(
  tabId: PageId, data: any, saved?: any,
): EditPageRenders {
  const lookups: EditorLookups = {
    bags: data?.bags.map((bag: any) => bag.name) ?? [],
    plugins: data?.availablePlugins.map((plugin: any) => plugin.name) ?? [],
    templates: data?.templates.map((template: any) => template.name) ?? [],
    roles: data?.roles.map((role: any) => role.name) ?? [],
    versions: embeddedServerResponse.tw5Versions,
  };
  switch (tabId) {
    case "wikis": {
      const form = createWikiForm(saved ?? {}, saved ? "edit" : "create");
      return {
        form,
        renderCurrent: saved ? () => renderWikiCurrent(saved) : undefined,
        renderEditor: () => renderWikiEditor(form, lookups,
          data?.templates ?? [])
      };
    }
    case "templates": {
      const form = createTemplateForm(saved ?? {});
      return {
        form,
        renderCurrent: saved ? () => renderTemplateCurrent(saved, data) : undefined,
        renderEditor: () => renderTemplateEditor(form, lookups)
      };
    }
    case "bags": {
      const form = createBagForm(saved ?? {});
      return {
        form,
        renderCurrent: saved ? () => renderBagCurrent(saved, data) : undefined,
        renderEditor: () => renderBagEditor(form, lookups)
      };
    }
    case "roles": {
      const form = createRoleForm(saved ?? {});
      return {
        form,
        renderCurrent: saved ? () => <>
          {currentText("Name", saved.name)}
          {currentText("Description", saved.description)}
        </> : undefined,
        renderEditor: () => renderRoleEditor(form)
      };
    }
    case "users": {
      const form = createUserForm(saved ?? {});
      return {
        form,
        renderCurrent: saved ? () => <>
          {currentText("Username", saved.username)}
          {currentText("Email", saved.email)}
          {currentList("Roles", saved.userRoles)}
        </> : undefined,
        renderEditor: () => renderUserEditor(form, lookups)
      };
    }
  }
}