import { AdminRecord, DraftChangeHandler, lineListCodec, OperationTriggerHandler, PendingRowsChangeHandler, PermissionRowsChangeHandler, permissionRowsCodec, PerTabFieldState, ResolverTitleChangeHandler } from "../app";
import { MaterialSymbol } from "../material-symbol";
import { AdminRecordStore, FieldDefinition, FieldType, IdString, KeyString, PermissionRow, TabId, WikiAdminRecord, WritablePrefixRow } from "./tabs";
import { definitely, is } from "./utils";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";
import closeIcon from "@material-symbols/svg-400/outlined/close.svg";
import accountCircleIcon from "@material-symbols/svg-400/outlined/account_circle.svg";
import { findTemplateRecordForWikiRecord } from "./store";
import { zod as z } from "@tiddlywiki/server/src/Z2";



interface FieldEditorContext<T = unknown> extends ReadonlyFieldContext<T> {
  inputId: string;
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

export function renderFieldEditor(ctx: FieldEditorContext<unknown>) {
  return (fieldTypeRenderEditors as any)[ctx.field.type](ctx);
}

/** The subset of FieldEditorContext that the readonly renderers need. */
interface ReadonlyFieldContext<T = unknown> {
  field: FieldDefinition;
  value: T;
  itemsByTab?: AdminRecordStore;
}

export function renderFieldSidebar(ctx: ReadonlyFieldContext) {
  return (fieldTypeRenderSidebars as any)[ctx.field.type](ctx);
  // sidebarFields.map(
  //   )
  // const t = field => 
  // renderFieldSidebar({
  // title: field.label,
  // content: renderSidebar

  // renderSidebar({
  //   field, value, itemsByTab
  // })
  // })

  // {(sidebarField(field, fieldState.draft, fieldState.saved, itemsByTab))}
}


type PermissionLevel = "A_read" | "B_write";

function getPermissionLevelsForField(fieldKey: string): string[] {
  return fieldKey === "bagPermissions" ? ["A_read", "B_write", "C_admin"] : ["A_read", "B_write"];
}

function formatPermissionLevel(level: string): string {
  return level.replace(/^[A-Z]_/, "");
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

export function formatFieldValue(value: any): string {
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

function renderSelectField(ctx: FieldEditorContext<boolean>) {
  const { field, value, disabled, inputId, onDraftChange } = ctx;
  definitely<boolean>(value);
  return (
    <select id={inputId} class="field-select" disabled={disabled} onchange={(event) => onDraftChange(field.key, (event.currentTarget as HTMLSelectElement).value === "true")}>
      <option value="true" selected={value}>Enabled</option>
      <option value="false" selected={!value}>Disabled</option>
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

function renderConfirmPasswordFieldEditor(ctx: FieldEditorContext<any>) {
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

function renderSearchMultiselectFieldSidebar(ctx: ReadonlyFieldContext<any>): JSX.Node {
  definitely<readonly string[]>(ctx.value);
  return <ul>
    {ctx.value.map((entry) => <li>{entry}</li>)}
  </ul>;
}

function renderSearchMultiselectFieldEditor(ctx: FieldEditorContext<any>) {
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

function renderPermissionTableFieldEditor(ctx: FieldEditorContext<any>) {
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

const defaultPrefixPill = <div class="prefix-bag-sidebar-pill">default</div>;

function hasPrefixTrimMismatch(value: string): boolean {
  return value.trim() !== value;
}

function renderPrefixMappingRows(displayedMappingRows: readonly WritablePrefixRow[]) {
  return <table class="value-table">
    {displayedMappingRows.map((row) => (
      <tr>
        <td>{row.prefix ? <code>{'"' + row.prefix + '"'}</code> : defaultPrefixPill}</td>
        <td>{row.bagName.toString()}</td>
      </tr>
    ))}
  </table>;
}

function renderPrefixTableFieldSidebar(ctx: ReadonlyFieldContext<any>): JSX.Node {
  definitely<WritablePrefixRow[]>(ctx.value);
  return <dl class="prefix-bag-sidebar">
    {ctx.value.map((entry) => <>
      <dt class="prefix-bag-sidebar-term">{entry.prefix ? <span class="prefix-bag-sidebar-prefix">"{entry.prefix}"</span> : defaultPrefixPill}</dt>
      <dd class="prefix-bag-sidebar-value">{entry.bagName.toString()}</dd>
    </>)}
  </dl>;
}

function renderPrefixTableFieldEditor(ctx: FieldEditorContext<any>) {
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
    return renderPrefixMappingRows(displayedMappingRows);
  }
  return (
    <div class="row-editor-stack">
      {displayedMappingRows.map((row, index) => (
        <div class="row-editor-row row-editor-row-wide">
          <div class="prefix-input-shell">
            <input class={hasPrefixTrimMismatch(row.prefix) ? "field-input is-invalid" : "field-input"}
              type="text"
              value={row.prefix}
              placeholder="Prefix, leave blank for default"
              aria-invalid={hasPrefixTrimMismatch(row.prefix) ? "true" : undefined}
              title={hasPrefixTrimMismatch(row.prefix) ? "Prefix has leading or trailing whitespace. Is this intentional?" : undefined}
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
            {hasPrefixTrimMismatch(row.prefix) ? <span
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
          {renderPrefixMappingRows(buildEffectivePrefixObject([mappingRows, inheritedRoutingRows]))}
        </div>
      ) : null}
    </div>
  );
}

function renderAutocompleteFieldSidebar(ctx: ReadonlyFieldContext<any>) {
  return ctx.value ?? "";
}

function renderAutocompleteFieldEditor(ctx: FieldEditorContext<any>) {
  const { field, value, disabled, itemsByTab, inputId, onDraftChange } = ctx;
  const datalistId = `${inputId}-options`;
  const optionMap = new Map(itemsByTab.templates.map((entry) => [entry.name, entry.id]));

  return (
    <>
      <input id={inputId} class="field-input" type="text" value={value ?? ""} disabled={disabled}
        ref={(element) => {
          if (value && element.value !== value) element.value = value;
        }}
        list={datalistId}
        oninput={(event) => {
          const name = event.currentTarget.value;
          if (!name) return event.preventDefault();
          onDraftChange(field.key, name);
        }}
      />
      <datalist id={datalistId}>
        {Array.from(optionMap.keys(), (option) => <option value={option.toString()} />)}
      </datalist>
    </>
  );
}

function computeResolverPreview(draft: WikiAdminRecord, title: string) {
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

function renderResolverPreviewFieldEditor(ctx: FieldEditorContext<any>) {
  const { fieldState, inputId, onResolverTitleChange } = ctx;
  definitely<WikiAdminRecord>(fieldState.draft);
  const preview = computeResolverPreview(fieldState.draft, fieldState.resolverTitle);
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

function renderValueListFieldSidebar(ctx: ReadonlyFieldContext<any>) {
  const lines = typeof ctx.value === "string"
    ? lineListCodec.parse(ctx.value)
    : ctx.value as readonly string[];
  return renderLinesList(lines, ctx.field.key, ctx.itemsByTab);
}

type FieldTypeRenderEditor = ((ctx: FieldEditorContext<any>) => JSX.Node) | null;
type FieldTypeRenderSidebar = ((ctx: ReadonlyFieldContext<any>) => JSX.Node) | null;



export const fieldTypeRenderEditors = {
  "string": (ctx) => renderTextInputField(ctx, "text"),
  "version": (ctx) => renderTextInputField(ctx, "text"),
  "number": (ctx) => renderTextInputField(ctx, "number"),
  "text": (ctx) => renderTextareaField(ctx, 4),
  "enter-password": (ctx) => renderTextInputField(ctx, "password"),
  "confirm-password": renderConfirmPasswordFieldEditor,
  "search-multiselect": renderSearchMultiselectFieldEditor,
  "permission-table": renderPermissionTableFieldEditor,
  "prefix-table": renderPrefixTableFieldEditor,
  "select": renderSelectField,
  "search": renderAutocompleteFieldEditor,
  "resolver-preview": renderResolverPreviewFieldEditor,
  "parameter-list": renderValueListFieldSidebar,
  "relationship-table": renderValueListFieldSidebar,
  "summary-list": renderValueListFieldSidebar,
  "activity-feed": renderActivityFeedField,
  "metadata-table": renderMetadataTableField,
  "table": renderTableField,
  "structured-preview": renderCalloutField,
  "validation-report": renderCalloutField,
  "template-type": (ctx) => null,
} satisfies Record<FieldType, FieldTypeRenderEditor>;

export const fieldTypeRenderSidebars = {
  "string": renderPreField,
  "version": renderPreField,
  "number": renderPreField,
  "text": renderPreField,
  "enter-password": () => null,
  "confirm-password": () => null,
  "search-multiselect": renderSearchMultiselectFieldSidebar,
  "permission-table": () => null,
  "prefix-table": renderPrefixTableFieldSidebar,
  "select": () => null,
  "search": renderAutocompleteFieldSidebar,
  "resolver-preview": () => null,
  "parameter-list": renderValueListFieldSidebar,
  "relationship-table": renderValueListFieldSidebar,
  "summary-list": renderValueListFieldSidebar,
  "activity-feed": renderActivityFeedField,
  "metadata-table": renderMetadataTableField,
  "table": renderTableField,
  "structured-preview": renderCalloutField,
  "validation-report": renderCalloutField,
  "template-type": () => null,
} satisfies Record<FieldType, FieldTypeRenderSidebar>;
