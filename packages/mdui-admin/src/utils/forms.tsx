/**
 * Forms UI Library - Built on mdui components
 * Class-based FormState + FormsComp web component
 */
import { customElement, property, state } from "lit/decorators.js";
import { JSXElement } from './JSXElement';
import EventEmitter from "events";
import forms_inline_css from "./forms.inline.css";
import { addstyles } from "./addstyles";
import { style as textFieldStyle } from "mdui/components/text-field/style";
import Dropzone from "dropzone";
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
// ────────────────────────────────────────────────────────────────────────────
// Field descriptor types
// ────────────────────────────────────────────────────────────────────────────

export interface FieldCallbacks {
  /** If provided, field is only shown/validated when this returns true */
  active?: (values: Record<string, any>) => boolean;
  /** Returns an error string if invalid, undefined if valid */
  valid?: (value: any, values: Record<string, any>) => string | undefined;
  /** Default/reset value for this field */
  default?: any;
}

export interface TextFieldDescriptor extends FieldCallbacks {
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

export interface SelectOption { value: string; label: string; disabled?: boolean; }
export interface RadioOption { value: string; label: string; disabled?: boolean; }

export interface SelectDescriptor extends FieldCallbacks {
  _type: 'select';
  label: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  style?: string;
}

export interface CheckboxDescriptor extends FieldCallbacks {
  _type: 'checkbox';
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupDescriptor extends FieldCallbacks {
  _type: 'radio';
  label: string;
  options: RadioOption[];
  disabled?: boolean;
  helperText?: string;
  style?: string;
}

export interface SwitchDescriptor extends FieldCallbacks {
  _type: 'switch';
  label: string;
  description?: string;
  disabled?: boolean;
  style?: string;
}

export interface FileUploadDescriptor extends FieldCallbacks {
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

export interface MultiSelectDescriptor extends FieldCallbacks {
  _type: 'multiselect';
  label: string;
  suggestions: string[];
  placeholder?: string;
  style?: string;
}

export interface CustomRenderDescriptor extends FieldCallbacks {
  _type: 'custom';
  render: (values: Record<string, any>) => JSX.Element;
  style?: string;
}

export interface DividerDescriptor extends FieldCallbacks {
  _type: 'divider';
  style?: string;
}

export interface SectionHeaderDescriptor extends FieldCallbacks {
  _type: 'sectionheader';
  title: string;
  description?: string;
}

export type FieldDescriptor =
  | TextFieldDescriptor
  | SelectDescriptor
  | CheckboxDescriptor
  | RadioGroupDescriptor
  | SwitchDescriptor
  | FileUploadDescriptor
  | MultiSelectDescriptor
  | CustomRenderDescriptor
  | DividerDescriptor
  | SectionHeaderDescriptor;

// ────────────────────────────────────────────────────────────────────────────
// FormStateOptions
// ────────────────────────────────────────────────────────────────────────────

export interface FormStateOptions {
  title?: string;
  onCancel?: () => void;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** String or callback returning a string */
  submitLabel?: string | (() => string);
  cancelLabel?: string | (() => string);
}

// ────────────────────────────────────────────────────────────────────────────
// FormState
// ────────────────────────────────────────────────────────────────────────────

export class FormState<T extends Record<string, any> = Record<string, any>> {
  private _values: Record<string, any>;
  private _errors: Record<string, string | undefined> = {};

  public events = new EventEmitter<{
    change: [];
  }>();

  constructor(
    public readonly fields: Record<string, FieldDescriptor>,
    public readonly options: FormStateOptions = {}
  ) {
    const defaults: Record<string, any> = {};
    for (const [key, field] of Object.entries(fields)) {
      if (field.default !== undefined) defaults[key] = field.default;
    }
    this._values = defaults;
  }

  get values(): T { return this._values as T; }
  get errors(): Record<string, string | undefined> { return this._errors; }

  getValue(key: string): any { return this._values[key]; }

  setValue(key: string, value: any) {
    this._values = { ...this._values, [key]: value };
    if (this._errors[key]) {
      const next = { ...this._errors };
      delete next[key];
      this._errors = next;
    }
    this.events.emit('change');
  }

  setValues(partial: Partial<T>) {
    this._values = { ...this._values, ...partial };
    this.events.emit('change');
  }

  setErrors(errors: Record<string, string | undefined>) {
    this._errors = { ...errors };
    this.events.emit('change');
  }

  resetValues() {
    const defaults: Record<string, any> = {};
    for (const [key, field] of Object.entries(this.fields)) {
      defaults[key] = field.default !== undefined ? field.default : undefined;
    }
    this._values = defaults;
    this._errors = {};
    this.events.emit('change');
  }

  validate(): boolean {
    const newErrors: Record<string, string | undefined> = {};
    for (const [key, field] of Object.entries(this.fields)) {
      if (field.active && !field.active(this._values)) continue;
      if (field.valid) {
        const error = field.valid(this._values[key], this._values);
        if (error) newErrors[key] = error;
      }
    }
    this._errors = newErrors;
    this.events.emit('change');
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit() {
    if (this.validate() && this.options.onSubmit) {
      await this.options.onSubmit(this._values as T);
    }
  }

  get submitLabel(): string {
    const lbl = this.options.submitLabel;
    return typeof lbl === 'function' ? lbl() : (lbl ?? 'Save');
  }

  get cancelLabel(): string {
    const lbl = this.options.cancelLabel;
    return typeof lbl === 'function' ? lbl() : (lbl ?? 'Cancel');
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
          {(field as CustomRenderDescriptor).render(this._values)}
        </div>
      ))}</>;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Static field factory methods
  // ──────────────────────────────────────────────────────────────────────────

  static TextField(opts: Omit<TextFieldDescriptor, '_type'>): TextFieldDescriptor {
    return { _type: 'text', ...opts };
  }

  static TextArea(opts: Omit<TextFieldDescriptor, '_type' | 'type'>): TextFieldDescriptor {
    return { _type: 'text', rows: 3, ...opts };
  }

  static Select(opts: Omit<SelectDescriptor, '_type'>): SelectDescriptor {
    return { _type: 'select', ...opts };
  }

  static Checkbox(opts: Omit<CheckboxDescriptor, '_type'>): CheckboxDescriptor {
    return { _type: 'checkbox', ...opts };
  }

  static RadioGroup(opts: Omit<RadioGroupDescriptor, '_type'>): RadioGroupDescriptor {
    return { _type: 'radio', ...opts };
  }

  static Switch(opts: Omit<SwitchDescriptor, '_type'>): SwitchDescriptor {
    return { _type: 'switch', ...opts };
  }

  static FileUpload(opts: Omit<FileUploadDescriptor, '_type' | 'id'>): FileUploadDescriptor {
    return { _type: 'file', id: `file-${Math.random().toString(36).slice(2, 9)}`, ...opts };
  }

  static MultiSelect(opts: Omit<MultiSelectDescriptor, '_type'>): MultiSelectDescriptor {
    return { _type: 'multiselect', ...opts };
  }

  static CustomRender(
    render: (values: Record<string, any>) => JSX.Element,
    opts: Omit<CustomRenderDescriptor, '_type' | 'render'> = {}
  ): CustomRenderDescriptor {
    return { _type: 'custom', render, ...opts };
  }

  static Divider(opts: Omit<DividerDescriptor, '_type'> = {}): DividerDescriptor {
    return { _type: 'divider', ...opts };
  }

  static SectionHeader(opts: Omit<SectionHeaderDescriptor, '_type'>): SectionHeaderDescriptor {
    return { _type: 'sectionheader', ...opts };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// FormsComp - web component wrapper
// ────────────────────────────────────────────────────────────────────────────

declare global {
  interface CustomElements {
    'mws-forms-comp': JSX.SimpleAttrs<{}, FormsComp>;
  }
}

@addstyles(forms_inline_css)
@customElement('mws-forms-comp')
export class FormsComp extends JSXElement {
  @state() accessor props!: {
    state: FormState;
    title?: string;
    children?: JSX.Node;
  };

  protected render(): JSX.Node {
    const { state } = this.props ?? {};

    const submitLabel = state?.submitLabel ?? 'Save';
    const cancelLabel = state?.cancelLabel ?? 'Cancel';
    const title = this.props?.title ?? state?.options?.title;

    return <>
      {state && Object.entries(state.fields)
        .filter(([, field]) => !field.active || field.active(state.values))
        .map(([key, field]) => this._renderField(state, key, field))}
    </>;

  }

  // ──────────────────────────────────────────────────────────────────────────
  // Field renderers
  // ──────────────────────────────────────────────────────────────────────────

  private _renderField(state: FormState, key: string, field: FieldDescriptor): JSX.Element {
    const value = state.values[key];
    const error = state.errors[key];
    const onChange = (v: any) => state.setValue(key, v);

    switch (field._type) {
      case 'text':
        return this._renderTextField(field, value, error, onChange);
      case 'select':
        return this._renderSelect(field, value, error, onChange);
      case 'checkbox':
        return this._renderCheckbox(field, value, onChange);
      case 'radio':
        return this._renderRadio(field, value, error, onChange);
      case 'switch':
        return this._renderSwitch(field, value, onChange);
      case 'file':
        return this._renderFile(field, value, error, onChange);
      case 'multiselect':
        return this._renderMultiSelect(field, value, error, onChange);
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

  private _renderTextField(field: TextFieldDescriptor, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
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

  private _renderSelect(field: SelectDescriptor, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
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
          {field.options.map(opt => (
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

  private _renderCheckbox(field: CheckboxDescriptor, value: any, onChange: (v: any) => void): JSX.Element {
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

  private _renderRadio(field: RadioGroupDescriptor, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
    return (
      <div class="field-radio-wrapper" style={field.style}>
        <div class="field-radio-label">{field.label}</div>
        <mdui-radio-group
          value={value ?? ''}
          onchange={(e) => onChange((e.target as any).value)}
        >
          {field.options.map(opt => (
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

  private _renderSwitch(field: SwitchDescriptor, value: any, onChange: (v: any) => void): JSX.Element {
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

  private _renderFile(field: FileUploadDescriptor, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
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

  private _renderMultiSelect(field: MultiSelectDescriptor, value: any, error: string | undefined, onChange: (v: any) => void): JSX.Element {
    const items: string[] = Array.isArray(value) ? value : [];
    return (
      <div class="field-multiselect-wrapper" style={field.style}>
        <mdui-select
          ref={(e: any) => { if (e) e.value = items; }}
          label={field.label}
          multiple
          variant="outlined"
          onchange={(e) => onChange((e.target as any).value as string[])}
        >
          {field.suggestions.map(s => (
            <mdui-menu-item value={s}>{s}</mdui-menu-item>
          ))}
        </mdui-select>
        {error && <div class="field-multiselect-error">{error}</div>}
      </div>
    );
  }

  private _renderSectionHeader(field: SectionHeaderDescriptor): JSX.Element {
    return (
      <div>
        <div class="field-section-title">{field.title}</div>
        {field.description && (
          <div class="field-section-description">{field.description}</div>
        )}
      </div>
    );
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
  interface CustomElements {
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
  interface CustomElements {
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
