/**
 * Forms UI Library - Built on mdui components
 * Provides reusable form field components with validation support using class-based approach
 */

export interface FieldOptions {
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  helperText?: string;
  style?: string;
}

export interface TextFieldOptions extends FieldOptions {
  rows?: number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxOptions extends FieldOptions {
  description?: string;
}

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Form Builder Class
 * Instantiate this with your values/errors getters and setters, then use the methods
 */
export class FormBuilder<T extends Record<string, any>> {
  constructor(
    private getValues: () => T,
    private setValues: (values: T) => void,
    private getErrors: () => Record<string, string | undefined>,
    private setErrors: (errors: Record<string, string | undefined>) => void
  ) {}

  private handleChange(key: keyof T, newValue: any) {
    const values = this.getValues();
    this.setValues({ ...values, [key]: newValue });
    
    const errors = this.getErrors();
    const error = errors[key as string];
    if (error) {
      const newErrors = { ...errors };
      delete newErrors[key as string];
      this.setErrors(newErrors);
    }
  }

  /**
   * Text Field Component
   */
  TextField(
    key: keyof T & string,
    label: string,
    options: TextFieldOptions = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const value = values[key] as string || '';
    const error = errors[key];

    return (
      <mdui-text-field
        label={label}
        variant="outlined"
        type={options.type || 'text'}
        required={options.required}
        disabled={options.disabled}
        readonly={options.readonly}
        value={value}
        placeholder={options.placeholder}
        maxlength={options.maxLength}
        minlength={options.minLength}
        pattern={options.pattern}
        oninput={(e) => this.handleChange(key, (e.target as HTMLInputElement).value)}
        style={options.style || "width: 100%; margin-bottom: 16px;"}
        rows={options.rows}
        helper={error || options.helperText}
        webjsx-attr-error-text={error || ''}
      />
    );
  }

  /**
   * Textarea Field Component
   */
  TextArea(
    key: keyof T & string,
    label: string,
    rows: number = 3,
    options: FieldOptions = {}
  ): JSX.Element {
    return this.TextField(key, label, { ...options, rows });
  }

  /**
   * Select/Dropdown Component
   */
  Select(
    key: keyof T & string,
    label: string,
    options: SelectOption[],
    fieldOptions: FieldOptions = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const value = values[key] as string || '';
    const error = errors[key];

    return (
      <div style={fieldOptions.style || "width: 100%; margin-bottom: 16px;"}>
        <mdui-select
          label={label}
          variant="outlined"
          required={fieldOptions.required}
          disabled={fieldOptions.disabled}
          value={value}
          onchange={(e) => this.handleChange(key, (e.target as any).value)}
        >
          {options.map(opt => (
            <mdui-menu-item value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </mdui-menu-item>
          ))}
        </mdui-select>
        {(error || fieldOptions.helperText) && (
          <div 
            class="md-typescale-body-small" 
            style={`margin-top: 4px; margin-left: 16px; color: var(--mdui-color-${error ? 'error' : 'on-surface-variant'});`}
          >
            {error || fieldOptions.helperText}
          </div>
        )}
      </div>
    );
  }

  /**
   * Checkbox Component
   */
  Checkbox(
    key: keyof T & string,
    label: string,
    options: CheckboxOptions = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const checked = values[key] as boolean || false;
    const error = errors[key];

    return (
      <div style={options.style || "margin-bottom: 16px;"}>
        <mdui-checkbox
          checked={checked}
          disabled={options.disabled}
          onchange={(e) => this.handleChange(key, (e.target as HTMLInputElement).checked)}
        >
          {label}
        </mdui-checkbox>
        {options.description && (
          <div class="md-typescale-body-small" style="margin-left: 32px; margin-top: 4px; color: var(--mdui-color-on-surface-variant);">
            {options.description}
          </div>
        )}
        {error && (
          <div class="md-typescale-body-small" style="margin-left: 32px; margin-top: 4px; color: var(--mdui-color-error);">
            {error}
          </div>
        )}
      </div>
    );
  }

  /**
   * Radio Group Component
   */
  RadioGroup(
    key: keyof T & string,
    label: string,
    options: RadioOption[],
    fieldOptions: FieldOptions = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const value = values[key] as string || '';
    const error = errors[key];

    return (
      <div style={fieldOptions.style || "margin-bottom: 24px;"}>
        <div class="md-typescale-body-medium" style="margin-bottom: 8px;">{label}</div>
        <mdui-radio-group 
          value={value} 
          onchange={(e) => this.handleChange(key, (e.target as any).value)}
        >
          {options.map(opt => (
            <mdui-radio value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </mdui-radio>
          ))}
        </mdui-radio-group>
        {(error || fieldOptions.helperText) && (
          <div 
            class="md-typescale-body-small" 
            style={`margin-top: 8px; color: var(--mdui-color-${error ? 'error' : 'on-surface-variant'});`}
          >
            {error || fieldOptions.helperText}
          </div>
        )}
      </div>
    );
  }

  /**
   * Switch Component
   */
  Switch(
    key: keyof T & string,
    label: string,
    options: CheckboxOptions = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const checked = values[key] as boolean || false;
    const error = errors[key];

    return (
      <div style={options.style || "margin-bottom: 16px;"}>
        <mdui-switch
          checked={checked}
          disabled={options.disabled}
          onchange={(e) => this.handleChange(key, (e.target as HTMLInputElement).checked)}
        >
          {label}
        </mdui-switch>
        {options.description && (
          <div class="md-typescale-body-small" style="margin-left: 48px; margin-top: 4px; color: var(--mdui-color-on-surface-variant);">
            {options.description}
          </div>
        )}
        {error && (
          <div class="md-typescale-body-small" style="margin-left: 48px; margin-top: 4px; color: var(--mdui-color-error);">
            {error}
          </div>
        )}
      </div>
    );
  }

  /**
   * File Upload Component
   */
  FileUpload(
    key: keyof T & string,
    label: string,
    options: {
      accept?: string;
      helperText?: string;
      style?: string;
      onFileChange?: (file: File | null) => Promise<void> | void;
    } = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const currentFile = values[key] as File | null;
    const error = errors[key];

    const handleFileSelect = async (file: File | null) => {
      this.handleChange(key, file);
      if (options.onFileChange) {
        await options.onFileChange(file);
      }
    };

    return (
      <div style={options.style || "margin-bottom: 24px;"}>
        <div class="md-typescale-body-medium" style="margin-bottom: 8px;">{label}</div>
        {options.helperText && !error && (
          <div class="md-typescale-body-small" style="margin-bottom: 12px; color: var(--mdui-color-on-surface-variant);">
            {options.helperText}
          </div>
        )}
        {error && (
          <div class="md-typescale-body-small" style="margin-bottom: 12px; color: var(--mdui-color-error);">
            {error}
          </div>
        )}
        <input
          type="file"
          accept={options.accept}
          onchange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            handleFileSelect(file);
          }}
          style="margin-bottom: 8px;"
        />
        {currentFile && (
          <div class="md-typescale-body-small" style="color: var(--mdui-color-primary);">
            Selected: {currentFile.name}
          </div>
        )}
      </div>
    );
  }

  /**
   * Editable List Component (for reorderable/removable items)
   */
  EditableList(
    key: keyof T & string,
    title: string,
    options: {
      placeholder?: string;
      style?: string;
      minItems?: number;
    } = {}
  ): JSX.Element {
    const values = this.getValues();
    const errors = this.getErrors();
    const items = values[key] as string[] || [];
    const error = errors[key];
    const minItems = options.minItems || 1;

    const renderListItem = (value: string, index: number) => {
      const canMoveUp = index > 0;
      const canMoveDown = index < items.length - 1;
      const canRemove = items.length > minItems;

      return (
        <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start;">
          <mdui-text-field
            variant="outlined"
            placeholder={options.placeholder || 'Enter value'}
            value={value}
            oninput={(e) => {
              const newItems = [...items];
              newItems[index] = (e.target as HTMLInputElement).value;
              this.handleChange(key, newItems);
            }}
            style="flex: 1;"
          />
          <mdui-button-icon
            disabled={!canMoveUp}
            onclick={() => {
              if (!canMoveUp) return;
              const newItems = [...items];
              [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
              this.handleChange(key, newItems);
            }}
          >
            <mdui-icon name="arrow_upward"></mdui-icon>
          </mdui-button-icon>
          <mdui-button-icon
            disabled={!canMoveDown}
            onclick={() => {
              if (!canMoveDown) return;
              const newItems = [...items];
              [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
              this.handleChange(key, newItems);
            }}
          >
            <mdui-icon name="arrow_downward"></mdui-icon>
          </mdui-button-icon>
          <mdui-button-icon
            disabled={!canRemove}
            onclick={() => {
              if (!canRemove) return;
              this.handleChange(key, items.filter((_, i) => i !== index));
            }}
          >
            <mdui-icon name="remove"></mdui-icon>
          </mdui-button-icon>
        </div>
      );
    };

    return (
      <div style={options.style || "margin-bottom: 24px;"}>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="md-typescale-title-medium">{title}</div>
          <mdui-button-icon
            onclick={() => this.handleChange(key, [...items, ''])}
          >
            <mdui-icon name="add"></mdui-icon>
          </mdui-button-icon>
        </div>
        {error && (
          <div class="md-typescale-body-small" style="color: var(--mdui-color-error); margin-bottom: 8px;">
            {error}
          </div>
        )}
        {items.map((item, index) => renderListItem(item, index))}
      </div>
    );
  }

  /**
   * Section Divider
   */
  static Divider(style?: string): JSX.Element {
    return <mdui-divider style={style || "margin: 24px 0;"}></mdui-divider>;
  }

  /**
   * Section Header
   */
  static SectionHeader(
    title: string,
    description?: string,
    style?: string
  ): JSX.Element {
    return (
      <div style={style || "margin-bottom: 16px;"}>
        <div class="md-typescale-title-medium" style="margin-bottom: 8px;">
          {title}
        </div>
        {description && (
          <div class="md-typescale-body-small" style="color: var(--mdui-color-on-surface-variant);">
            {description}
          </div>
        )}
      </div>
    );
  }

  /**
   * Form Actions (Cancel/Submit buttons)
   */
  static FormActions(
    onCancel: () => void,
    onSubmit: () => void,
    options: {
      cancelLabel?: string;
      submitLabel?: string;
      submitDisabled?: boolean;
      submitLoading?: boolean;
      style?: string;
    } = {}
  ): JSX.Element {
    return (
      <div style={options.style || "display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;"}>
        <mdui-button variant="text" onclick={onCancel}>
          {options.cancelLabel || 'Cancel'}
        </mdui-button>
        <mdui-button 
          variant="filled" 
          onclick={onSubmit}
          disabled={options.submitDisabled}
          loading={options.submitLoading}
        >
          {options.submitLabel || 'Save'}
        </mdui-button>
      </div>
    );
  }
}

/**
 * Validation Utilities
 */
export const Validators = {
  required: (value: string, message = 'This field is required'): string | undefined => {
    return value.trim() ? undefined : message;
  },
  
  email: (value: string, message = 'Invalid email address'): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? undefined : message;
  },
  
  minLength: (min: number, message?: string) => (value: string): string | undefined => {
    return value.length >= min ? undefined : message || `Minimum ${min} characters required`;
  },
  
  maxLength: (max: number, message?: string) => (value: string): string | undefined => {
    return value.length <= max ? undefined : message || `Maximum ${max} characters allowed`;
  },
  
  pattern: (regex: RegExp, message = 'Invalid format') => (value: string): string | undefined => {
    return regex.test(value) ? undefined : message;
  },
  
  minItems: (min: number, message?: string) => (items: any[]): string | undefined => {
    return items.length >= min ? undefined : message || `At least ${min} items required`;
  }
};

/**
 * Form State Manager
 */
export class FormState<T extends Record<string, any>> {
  private errors: Partial<Record<keyof T, string>> = {};
  private touched: Partial<Record<keyof T, boolean>> = {};
  
  constructor(
    private getValue: () => T,
    private setValue: (value: T) => void
  ) {}
  
  getFieldValue<K extends keyof T>(field: K): T[K] {
    return this.getValue()[field];
  }
  
  setFieldValue<K extends keyof T>(field: K, value: T[K]): void {
    this.setValue({ ...this.getValue(), [field]: value });
    this.touched[field] = true;
  }
  
  getFieldError<K extends keyof T>(field: K): string | undefined {
    return this.errors[field];
  }
  
  setFieldError<K extends keyof T>(field: K, error: string | undefined): void {
    if (error) {
      this.errors[field] = error;
    } else {
      delete this.errors[field];
    }
  }
  
  clearFieldError<K extends keyof T>(field: K): void {
    delete this.errors[field];
  }
  
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }
  
  validate<K extends keyof T>(
    field: K,
    validators: ((value: T[K]) => string | undefined)[]
  ): boolean {
    const value = this.getFieldValue(field);
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        this.setFieldError(field, error);
        return false;
      }
    }
    this.clearFieldError(field);
    return true;
  }
  
  validateAll(
    validationRules: Partial<Record<keyof T, ((value: any) => string | undefined)[]>>
  ): boolean {
    let isValid = true;
    for (const [field, validators] of Object.entries(validationRules)) {
      if (!this.validate(field as keyof T, validators as any)) {
        isValid = false;
      }
    }
    return isValid;
  }
}
