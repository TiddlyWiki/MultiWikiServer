/**
 * Forms UI Library - Built on mdui components
 * Class-based FormState + FormsComp web component
 */
import { customElement, property, state } from "lit/decorators.js";
import { JSXElement } from '@tiddlywiki/jsx-lit';
import EventEmitter from "events";
import forms_inline_css from "./forms.inline.css";
import { addstyles } from "@tiddlywiki/jsx-lit";
import { style as textFieldStyle } from "mdui/components/text-field/style";
// import Dropzone from "dropzone";
import { createHybridRef, HybridRef } from "@tiddlywiki/jsx-runtime";
import { Observable, Subscription, isObservable } from "rxjs";
import { PopupContainer } from "../components/mdui-popup";
import { DataStore } from "../services/data.service";
// ────────────────────────────────────────────────────────────────────────────
// Field descriptor types
// ────────────────────────────────────────────────────────────────────────────

export interface FieldCallbacks<T, A> {
  /** If provided, field is only shown/validated when this returns true */
  active?: (values: A) => boolean;
  /** Returns an error string if invalid, undefined if valid */
  valid?: (value: T, values: A) => string | undefined;
  /** Default/reset value for this field */
  default?: any;
}

type Row = { id: string; }

export interface TextFieldDescriptor<T extends Row> extends FieldCallbacks<string, T> {
  _type: 'text';
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  helperText?: string;
  style?: string;
  rows?: number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface Option { value: string; label: string; disabled?: boolean; }

export interface SelectDescriptor<T extends Row> extends FieldCallbacks<string, T> {
  _type: 'select';
  label: string;
  options: Option[] | Observable<Option[]>;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  style?: string;
}

export interface CheckboxDescriptor<T extends Row> extends FieldCallbacks<boolean, T> {
  _type: 'checkbox';
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupDescriptor<T extends Row> extends FieldCallbacks<string, T> {
  _type: 'radio';
  label: string;
  options: Option[] | Observable<Option[]>;
  disabled?: boolean;
  helperText?: string;
  style?: string;
}

export interface SwitchDescriptor<T extends Row> extends FieldCallbacks<boolean, T> {
  _type: 'switch';
  label: string;
  description?: string;
  disabled?: boolean;
  style?: string;
}

export interface FileUploadDescriptor<T extends Row> extends FieldCallbacks<File | null, T> {
  _type: 'file';
  id: string;
  label: string;
  accept?: string;
  helperText?: string;
  style?: string;
  // options: Dropzone.DropzoneOptions;
  // onInit?: (dropzone: Dropzone) => void;
  onFileChange?: (file: File | null) => void | Promise<void>;
}

export interface MultiSelectDescriptor<T extends Row> extends FieldCallbacks<string[], T> {
  _type: 'multiselect';
  label: string;
  suggestions: Option[] | Observable<Option[]>;
  placeholder?: string;
  style?: string;
}

export interface CustomRenderDescriptor<T extends Row> extends FieldCallbacks<any, T> {
  _type: 'custom';
  render: (values: Record<string, any>) => JSX.Element;
  style?: string;
}

export interface DividerDescriptor<T extends Row> extends FieldCallbacks<never, T> {
  _type: 'divider';
  style?: string;
}

export interface SectionHeaderDescriptor<T extends Row> extends FieldCallbacks<never, T> {
  _type: 'sectionheader';
  title: string;
  description?: string;
}

export type FieldDescriptor<T extends Row> =
  | TextFieldDescriptor<T>
  | SelectDescriptor<T>
  | CheckboxDescriptor<T>
  | RadioGroupDescriptor<T>
  | SwitchDescriptor<T>
  | FileUploadDescriptor<T>
  | MultiSelectDescriptor<T>
  | CustomRenderDescriptor<T>
  | DividerDescriptor<T>
  | SectionHeaderDescriptor<T>;

// ────────────────────────────────────────────────────────────────────────────
// FormStateOptions
// ────────────────────────────────────────────────────────────────────────────

export interface FormStateOptions<V extends Row> {
  store: DataStore<V>,
  idKey: string;
  onInit?: (item: V | undefined) => void | Promise<void>;
  onCancel?: () => void;
  onSubmit?: (values: V) => void | Promise<void>;
  /** String or callback returning a string */
  submitLabel?: string | (() => string);
  /** String or callback returning a string */
  cancelLabel?: string | (() => string);
  /** String or callback returning a string */
  formTitle?: string | (() => string);
  listTitle: JSX.Node;
  listDescription?: JSX.Node;
  listEmptyText?: JSX.Node;
  createItemLabel?: JSX.Node;
  renderListItem(item: V): JSX.Element;
}

// ────────────────────────────────────────────────────────────────────────────
// FormState
// ────────────────────────────────────────────────────────────────────────────
type FormValues = Record<string, any>;
type FormErrors = Partial<Record<string, string | undefined>>;
type SKey<T> = Extract<keyof T, string>;

export class FormMaker<T extends Row> {

  TextField(opts: Omit<TextFieldDescriptor<T>, '_type'>): TextFieldDescriptor<T> {
    return { _type: 'text', ...opts };
  }

  TextArea(opts: Omit<TextFieldDescriptor<T>, '_type' | 'type'>): TextFieldDescriptor<T> {
    return { _type: 'text', rows: 3, ...opts };
  }

  Select(opts: Omit<SelectDescriptor<T>, '_type'>): SelectDescriptor<T> {
    return { _type: 'select', ...opts };
  }

  Checkbox(opts: Omit<CheckboxDescriptor<T>, '_type'>): CheckboxDescriptor<T> {
    return { _type: 'checkbox', ...opts };
  }

  RadioGroup(opts: Omit<RadioGroupDescriptor<T>, '_type'>): RadioGroupDescriptor<T> {
    return { _type: 'radio', ...opts };
  }

  Switch(opts: Omit<SwitchDescriptor<T>, '_type'>): SwitchDescriptor<T> {
    return { _type: 'switch', ...opts };
  }

  FileUpload(opts: Omit<FileUploadDescriptor<T>, '_type' | 'id'>): FileUploadDescriptor<T> {
    return { _type: 'file', id: `file-${Math.random().toString(36).slice(2, 9)}`, ...opts };
  }

  MultiSelect(opts: Omit<MultiSelectDescriptor<T>, '_type'>): MultiSelectDescriptor<T> {
    return { _type: 'multiselect', ...opts };
  }

  CustomRender(
    render: (values: Record<string, any>) => JSX.Element,
    opts: Omit<CustomRenderDescriptor<T>, '_type' | 'render'> = {}
  ): CustomRenderDescriptor<T> {
    return { _type: 'custom', render, ...opts };
  }

  Divider(opts: Omit<DividerDescriptor<T>, '_type'> = {}): DividerDescriptor<T> {
    return { _type: 'divider', ...opts };
  }

  SectionHeader(opts: Omit<SectionHeaderDescriptor<T>, '_type'>): SectionHeaderDescriptor<T> {
    return { _type: 'sectionheader', ...opts };
  }
}

/**
 * FormState manages form values, errors, and validation logic.
 * 
 * @example
 * new FormState((F: FormMaker<Plugin>) => ({
 *   // fields
 * }), {
 *   // options
 * });
 */
export class FormState<
  T extends Record<string, FieldDescriptor<any>>,
  V extends Row
> {
  private _values: V;
  private _errors: FormErrors = {};

  public events = new EventEmitter<{
    change: [];
  }>();
  public readonly fields: T;

  constructor(
    fielder: (x: FormMaker<V>) => T,
    public readonly options: FormStateOptions<V>
  ) {
    this.fields = fielder(new FormMaker()) as T;
    const defaults = {} as V;
    for (const [key, field] of Object.entries(this.fields)) {
      if (field.default !== undefined) defaults[key as keyof V] = field.default;
    }
    this._values = defaults;
  }

  get values() { return this._values; }
  get errors() { return this._errors; }

  getValue(key: keyof V): V[keyof V] { return this._values[key]; }

  setValue(key: keyof V, value: V[keyof V]) {
    this._values = { ...this._values, [key]: value };
    if (this._errors[key as string]) {
      const next = { ...this._errors };
      delete next[key as string];
      this._errors = next;
    }
    this.events.emit('change');
  }

  setValues(partial: Partial<V>) {
    this._values = { ...this._values, ...partial };
    this.events.emit('change');
  }

  setErrors(errors: FormErrors) {
    this._errors = { ...errors };
    this.events.emit('change');
  }

  resetValues() {
    const defaults = {} as V;
    for (const [key, field] of Object.entries(this.fields)) {
      defaults[key as keyof V] = field.default !== undefined ? field.default : undefined;
    }
    this._values = defaults;
    this._errors = {};
    this.events.emit('change');
  }

  validate(): boolean {
    const newErrors: Partial<Record<string, string | undefined>> = {};
    for (const [key, field] of Object.entries(this.fields)) {
      if (field.active && !field.active(this._values)) continue;
      if (field.valid) {
        const value = this._values[key as keyof V];
        // this is never because functions use & instead of |
        const error = field.valid(value as never, this._values);
        if (error) newErrors[key as string] = error;
      }
    }
    this._errors = newErrors;
    this.events.emit('change');
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit() {
    if (this.validate() && this.options.onSubmit) {
      await this.options.onSubmit(this._values);

    }
  }

  get formTitle(): string {
    const title = this.options.formTitle;
    return typeof title === 'function' ? title() : (title ?? '');
  }

  get submitLabel(): string {
    const lbl = this.options.submitLabel;
    return typeof lbl === 'function' ? lbl() : (lbl ?? 'Save');
  }

  get cancelLabel(): string {
    const lbl = this.options.cancelLabel;
    return typeof lbl === 'function' ? lbl() : (lbl ?? 'Cancel');
  }

  /** This gets rendered in the ItemStorePage, not the FormsComp */
  renderPopup() {
    const title = this.formTitle
    const submitLabel = this.submitLabel;
    const cancelLabel = this.cancelLabel;
    return (
      <mdui-forms-popup>
        <display-content slot="title">
          {title}
        </display-content>
        <display-content slot="fields">
          <FormsComp state={this}>
            {this.renderSlots()}
          </FormsComp>
        </display-content>
        <display-content slot="actions">
          <mdui-button variant="text" onclick={() => this.options?.onCancel?.()}>
            {cancelLabel}
          </mdui-button>
          <mdui-button variant="filled" onclick={() => this.handleSubmit()}>
            {submitLabel}
          </mdui-button>
        </display-content>
      </mdui-forms-popup>
    )
  }

  /**
   * Renders slot-projection wrappers for custom fields only.
   * Each wrapper targets the matching named slot inside FormsComp.
   * Non-custom fields are rendered directly by FormsComp.
   */
  renderSlots(): JSX.Node {
    return <>{Object.entries(this.fields)
      .filter(([, field]) => field._type === 'custom' && (!field.active || field.active(this._values)))
      .map(([key, field]) => (
        <div slot={`custom-${key}`} style="display:contents;">
          {(field as CustomRenderDescriptor<any>).render(this._values)}
        </div>
      ))}</>;
  }

}

// ────────────────────────────────────────────────────────────────────────────
// FormsComp - web component wrapper
// ────────────────────────────────────────────────────────────────────────────

declare global {
  interface MyCustomElements {
    'mws-forms-comp': JSX.SimpleAttrs<{}, FormsComp<any>>;
  }
}

@addstyles(forms_inline_css)
@customElement('mws-forms-comp')
export class FormsComp<T extends Record<string, FieldDescriptor<any>>> extends JSXElement {
  @state() accessor props!: {
    state: FormState<T, any>;
  };

  connectedCallback() {
    super.connectedCallback();
    // Subscriptions are created lazily in _renderSelect on first render.
    // Re-subscribe any that were cleaned up on disconnect.
    this.requestUpdate();
  }

  protected render(): JSX.Node {
    if (!this.props.state) return <></>;
    const fields = Object.entries(this.props.state.fields);
    this.useKey(fields.map(([key]) => key).join(','));
    return <>
      {fields.map(([key, field]) =>
        this._renderField(key as SKey<T>, field)
      )}
    </>;

  }

  // ──────────────────────────────────────────────────────────────────────────
  // Field renderers
  // ──────────────────────────────────────────────────────────────────────────

  private _renderField(key: SKey<T>, field: FieldDescriptor<any>): JSX.Element {
    const value = this.props.state.values[key];
    const error = this.props.state.errors[key];
    const onChange = (v: any) => this.props.state.setValue(key, v);

    switch (field._type) {
      case 'text':
        return this._renderTextField(field, value, error, onChange);
      case 'select':
        return this._renderSelect(field, key, value, error, onChange);
      case 'checkbox':
        return this._renderCheckbox(field, value, onChange);
      case 'radio':
        return this._renderRadio(field, key, value, error, onChange);
      case 'switch':
        return this._renderSwitch(field, value, onChange);
      case 'file':
        return this._renderFile(field, value, error, onChange);
      case 'multiselect':
        return this._renderMultiSelect(field, key, value, error, onChange);
      case 'divider':
        return <mdui-divider class="field-divider" style={field.style} />;
      case 'sectionheader':
        return this._renderSectionHeader(field);
      case 'custom':
        return <slot name={`custom-${key}`}></slot>;
      default: {
        const t: never = field;
        return <></>;
      }
    }
  }

  isFieldActive(field: FieldDescriptor<any>) {
    return !field.active || !!field.active(this.props.state.values);
  }

  private _renderTextField(
    field: TextFieldDescriptor<any>,
    value: any,
    error: string | undefined,
    onChange: (v: any) => void
  ): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    return (
      <mdui-text-field
        class="field-text"
        style={field.style}
        label={field.label}
        variant="outlined"
        type={field.type || 'text'}
        required={field.required}
        disabled={field.disabled}
        readonly={field.readonly}
        value={value ?? ''}
        placeholder={field.placeholder}
        maxlength={field.maxLength}
        minlength={field.minLength}
        pattern={field.pattern}
        oninput={(e) => onChange((e.target as HTMLInputElement).value)}
        rows={field.rows}
        helper={error || field.helperText}
        webjsx-attr-error-text={error || ''}
      />
    );
  }

  private _renderSelect(field: SelectDescriptor<any>, key: string, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;

    const options = this.useObservableListMemo(field.options, key);

    return (
      <div class="field-select-wrapper" style={field.style}>
        <mdui-select
          label={field.label}
          variant="outlined"
          required={field.required}
          disabled={field.disabled}
          value={value ?? ''}
          onchange={(e) => onChange((e.target as any).value)}
        >
          {options.map(opt => (
            <mdui-menu-item value={opt.value} disabled={opt.disabled}>{opt.label}</mdui-menu-item>
          ))}
        </mdui-select>
        {(error || field.helperText) && (
          <div class={`field-helper${error ? ' field-helper--error' : ''}`}>
            {error || field.helperText}
          </div>
        )}
      </div>
    );
  }

  private _renderCheckbox(field: CheckboxDescriptor<any>, value: any, onChange: (v: any) => void): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    return (
      <div>
        <mdui-checkbox
          checked={!!value}
          disabled={field.disabled}
          onchange={(e) => onChange((e.target as HTMLInputElement).checked)}
        >
          {field.label}
        </mdui-checkbox>
        {field.description && (
          <div class="field-checkbox-description">{field.description}</div>
        )}
      </div>
    );
  }

  private _renderRadio(field: RadioGroupDescriptor<any>, key: string, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    const options = this.useObservableListMemo(field.options, key); // Use label as key for options list memoization
    return (
      <div class="field-radio-wrapper" style={field.style}>
        <div class="field-radio-label">{field.label}</div>
        <mdui-radio-group
          value={value ?? ''}
          onchange={(e) => onChange((e.target as any).value)}
        >
          {options.map(opt => (
            <mdui-radio value={opt.value} disabled={opt.disabled}>{opt.label}</mdui-radio>
          ))}
        </mdui-radio-group>
        {(error || field.helperText) && (
          <div class={`field-radio-helper${error ? ' field-radio-helper--error' : ''}`}>
            {error || field.helperText}
          </div>
        )}
      </div>
    );
  }

  private _renderSwitch(field: SwitchDescriptor<any>, value: any, onChange: (v: any) => void): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    return (
      <div class="field-switch-wrapper" style={field.style}>
        <div class="field-switch-row">
          <label
            class="field-switch-label"
            onclick={(e) => {
              const sw = (e.target as HTMLElement).nextElementSibling as any;
              if (sw && !field.disabled) {
                sw.checked = !sw.checked;
                sw.dispatchEvent(new Event('change'));
              }
            }}
          >
            {field.label}
          </label>
          <mdui-switch
            checked={!!value}
            disabled={field.disabled}
            onchange={(e) => onChange((e.target as HTMLInputElement).checked)}
          />
        </div>
        {field.description && (
          <div class="field-switch-description">{field.description}</div>
        )}
      </div>
    );
  }

  private _renderFile(field: FileUploadDescriptor<any>, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    const handleChange = async (file: File | null) => {
      onChange(file);
      if (field.onFileChange) await field.onFileChange(file);
    };
    // const dropzone = createHybridRef<HTMLElement>(e => {
    //   if (!e) return;
    //   const dz = new Dropzone(e, field.options);
    //   field.onInit?.(dz);
    // });
    return <mdui-field variant="outlined">
      <div class="field-file-label">{field.label}</div>
      {field.helperText && !error && (
        <div class="field-file-helper">{field.helperText}</div>
      )}
      {error && <div class="field-file-error">{error}</div>}
      <input
        id={field.id}
        class="field-file-input"
        type="file"
        accept={field.accept}
        onchange={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0] || null;
          handleChange(file);
        }}
      />
      {value && (
        <div class="field-file-selected">Selected: {(value as File).name}</div>
      )}
    </mdui-field>
  }

  private _renderMultiSelect(field: MultiSelectDescriptor<any>, key: string, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    const items: string[] = Array.isArray(value) ? value : [];
    const suggestions = this.useObservableListMemo(field.suggestions, key); // Use label as key for suggestions list memoization
    return (
      <div class="field-multiselect-wrapper" style={field.style}>
        <mdui-select
          ref={(e: any) => { if (e) e.value = items; }}
          label={field.label}
          multiple
          variant="outlined"
          onchange={(e) => onChange((e.target as any).value as string[])}
        >
          {suggestions.map(s => (
            <mdui-menu-item value={s.value}>{s.label}</mdui-menu-item>
          ))}
        </mdui-select>
        {error && <div class="field-multiselect-error">{error}</div>}
      </div>
    );
  }

  private _renderSectionHeader(field: SectionHeaderDescriptor<any>): JSX.Element {
    if (!this.isFieldActive(field)) return <></>;
    return (
      <div>
        <div class="field-section-title">{field.title}</div>
        {field.description && (
          <div class="field-section-description">{field.description}</div>
        )}
      </div>
    );
  }

  private useObservableListMemo<T>(options: T[] | Observable<T[]>, key: string): T[] {

    const state = this.useMemo(() => createHybridRef<{
      subs: Subscription[];
      list: T[];
    }>(), []);

    this.useCallback(() => {
      state.current = { subs: [], list: [] }
      if (isObservable(options)) {
        const sub = options.subscribe(list => {
          if (!state.current) return;
          state.current.list = list;
          this.requestUpdate();
        });
        state.current.subs.push(sub);
      } else {
        state.current.list = options;
      }
      return () => {
        if (!state.current) return;
        state.current.subs.forEach(s => s.unsubscribe());
        state.current.subs = [];
      }
    }, [key, options]);

    return state.current?.list ?? [];

  }

}


// ────────────────────────────────────────────────────────────────────────────
// Validation Utilities
// ────────────────────────────────────────────────────────────────────────────

export const Validators = {
  required: (message = 'This field is required') => (value: string): string | undefined =>
    value?.trim() ? undefined : message,

  email: (message = 'Invalid email address') => (value: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? undefined : message;
  },

  minLength: (min: number, message?: string) => (value: string): string | undefined =>
    value.length >= min ? undefined : message || `Minimum ${min} characters required`,

  maxLength: (max: number, message?: string) => (value: string): string | undefined =>
    value.length <= max ? undefined : message || `Maximum ${max} characters allowed`,

  minItems: (min: number, message?: string) => (items: any[]): string | undefined =>
    items.length >= min ? undefined : message || `At least ${min} items required`,
};


declare global {
  interface MyCustomElements {
    "mdui-field": JSX.SimpleAttrs<{
      label: string;
      "supporting"?: boolean;
      "has-value"?: boolean;
      variant: "outlined" | "filled" | "standard";
    }, any>;
  }
}

@addstyles(textFieldStyle.toString())
@customElement("mdui-field")
export class FieldWrapper extends JSXElement {
  @property() accessor label: string = "";
  @property({ type: Boolean }) accessor supporting: boolean = false;
  @property({ type: Boolean }) accessor "has-value": boolean = false;

  render() {
    return (
      <div
        part="container"
        class={`container ${this["has-value"] ? 'has-value' : ''}`}
      >
        <div class="input-container">
          <slot class="input"></slot>
        </div>
        {this.supporting && (
          <div part="supporting" class="supporting">
            <slot name="supporting"></slot>
          </div>
        )}
      </div>
    );
  }
}

declare global {
  interface MyCustomElements {
    "mdui-forms-popup": JSX.SimpleAttrs<{}, FormsPopup>;
  }
}

@addstyles(`

:host {
  padding: 24px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
}

.fields {
  padding-top: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

`)
@customElement("mdui-forms-popup")
export class FormsPopup extends JSXElement {

  render() {
    return (<>
      <div part="title" class="title">
        <slot name="title"></slot>
      </div>
      <div part="fields" class="fields">
        <slot name="fields"></slot>
      </div>
      <div part="actions" class="actions">
        <slot name="actions"></slot>
      </div>
    </>);
  }
}

@addstyles(`
:host {
  display: contents; 
}
.list-title {
  margin-bottom: 16px; 
  font-size: 28px; 
  font-weight: 400; 
  line-height: 36px;
}
.list-description {
  color: var(--mdui-color-on-surface-variant);
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 20px;
}
.empty-list-text {
  padding: 24px; 
  text-align: center; 
  color: var(--mdui-color-on-surface-variant); 
  font-size: 14px; 
  line-height: 20px;
}
`)
@customElement("item-store-page")
export class ItemStorePage<T extends { id: string }, S> extends JSXElement {
  @state() accessor state!: S;

  @state() accessor props!: {
    create: () => FormState<any, any>;
  }

  forms!: FormState<any, any>;

  get store() { return this.forms.options.store; }

  async connectedCallback() {
    super.connectedCallback();
    console.log('connected', this.forms);
    if (!this.forms) this.forms = this.props.create.call(this);
    this.forms.events.on('change', () => this.requestUpdate());
    this.subs.add(() => {
      this.forms.events.off('change', () => this.requestUpdate())
    });
    this.subs.add(this.store.changes$.subscribe(items => {
      this.itemList = items;
    }));
    await this.store.loadAll();
  }

  @state() accessor itemList: T[] = [];
  @state() protected accessor showPopup = false;

  protected popupSource: HybridRef<HTMLElement> | null = null;
  protected newItemButton = createHybridRef<HTMLElement>();
  protected popup = createHybridRef<PopupContainer>();

  closePopup = () => {
    this.popup.current?.close(() => {
      this.showPopup = false;
      this.forms.resetValues();
    });
  };

  loadItemForEdit = (template: T, listref: HybridRef<HTMLElement>) => {
    this.forms.setValues(template);
    this.forms.setErrors({});
    this.forms.options.onInit?.(template);
    this.popupSource = listref;
    this.showPopup = true;
  };

  loadItemForCreate = () => {
    this.forms.resetValues();
    this.forms.setErrors({});
    this.forms.options.onInit?.(undefined);
    this.popupSource = this.newItemButton;
    this.showPopup = true;
  }

  doSave = async (values: Record<string, any>) => {
    try {
      await this.store.save(values[this.forms.options.idKey], values as T);
      this.closePopup();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  protected render() {
    return (
      <>
        <>
          <div style="padding: 24px;">
            <div class="list-title">
              {this.forms.options.listTitle}
            </div>

            {this.forms.options.listDescription && (
              <div class="list-description">
                {this.forms.options.listDescription || ''}
              </div>
            )}

            {this.itemList.length > 0 ? (
              <mdui-list>
                {this.itemList.map(template => this.forms.options.renderListItem(template))}
              </mdui-list>
            ) : (
              <div class="empty-list-text">
                {this.forms.options.listEmptyText || 'No items yet.'}
              </div>
            )}

            <mdui-button
              ref={this.newItemButton}
              variant="elevated"
              style="margin-top: 16px;"
              icon="add"
              onclick={() => { this.loadItemForCreate(); }}
            >
              {this.forms.options.createItemLabel || 'New Item'}
            </mdui-button>
          </div>
        </>

        {this.showPopup && (
          <PopupContainer
            ref={this.popup}
            source={this.popupSource?.current}
            cardStyle="width: 80vw; max-height: 80vh;"
            oncancel={this.closePopup}
          >
            {this.forms.renderPopup()}
          </PopupContainer>
        )}
      </>
    );
  }

}
