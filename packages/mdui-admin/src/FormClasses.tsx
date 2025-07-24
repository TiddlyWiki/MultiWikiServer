import { css, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { TextField } from "mdui";
import { JSXElement } from "./JSXElement";

export type FormControlValue<T> = T extends FormControl<infer V> ? V : never;

export class FormControl<T> {


  constructor(public defaultValue: T) {
    this._value = defaultValue;
  }

  protected _value: T;
  get value(): T {
    return this._value;
  }

  setValue(value: T, emitChange = true) {
    this._value = value;
    if (emitChange) { this.emitValue(); }
  }

  private subscribers = new Set<(value: T) => void>();

  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.add(callback);
    return () => { this.subscribers.delete(callback) };
  }
  destroy(): void {
    this.subscribers.clear();
  }

  protected emitValue() {
    this.subscribers.forEach(subscriber => subscriber(this._value));
  }

}

export type FormGroupValue<T> = { [K in keyof T]: T[K] extends FormControl<infer V> ? V : never };

export class FormGroup<T extends Record<string, FormControl<any>>> extends FormControl<FormGroupValue<T>> {

  constructor(public controls: T) {
    super(Object.fromEntries(Object.entries(controls).map(([key, child]) => [key, child.defaultValue])) as FormGroupValue<T>);
  }

  private getValue(): FormGroupValue<T> {
    return Object.fromEntries(Object.entries(this.controls).map(([key, child]) => [key, child.value])) as FormGroupValue<T>;
  }

  onChange = (key: string, emitChange = true) => (value: T) => {
    this._value = this.getValue();
    if (emitChange) { this.emitValue(); }
  };


  destroy() {
    super.destroy();
    this.teardowns.forEach(teardown => teardown());
    this.teardowns.clear();
  }

  teardowns = new Map<string, () => void>();

  addControl<K extends string>(key: K, control: FormControl<any>, emitChange = true) {
    if (key in this.controls) {
      throw new Error(`Control with key "${key}" already exists.`);
    }
    this.controls[key] = control as T[K];
    this.teardowns.set(key, control.subscribe(this.onChange(key, emitChange)));
    this._value = this.getValue();
    if (emitChange) { this.emitValue(); }
  }

  setValue(value: FormGroupValue<T>, emitChange = true) {
    for (const key in this.controls) {
      if (key in value) {
        this.controls[key].setValue(value[key], false);
      } else {
        throw new Error(`Missing value for key: ${key}`);
      }
    }
    this._value = this.getValue();
    if (emitChange) { this.emitValue(); }
  }
  patchValue(value: Partial<FormGroupValue<T>>, emitChange = true) {
    for (const key in value) {
      if (key in this.controls) {
        this.controls[key].setValue(value[key], false);
      } else {
        throw new Error(`Invalid key: ${key}`);
      }
    }
    this._value = this.getValue();
    if (emitChange) { this.emitValue(); }
  }
}

export type FormArrayValue<T extends readonly FormControl<any>[]> =
  T extends [infer F extends FormControl<any>, ...infer R extends readonly FormControl<any>[]]
  ? [FormControlValue<F>, ...FormArrayValue<R>]
  : [];

export class FormArray<T extends FormControl<any>[]> extends FormControl<FormArrayValue<T>> {
  constructor(public controls: T) {
    super(controls.map(control => control.defaultValue) as FormArrayValue<T>);
  }

  private getValue(): FormArrayValue<T> {
    return this.controls.map(control => control.value) as FormArrayValue<T>;
  }

  destroy(): void {
    super.destroy();
    this.teardowns.forEach(teardown => teardown());
    this.teardowns.clear();
  }

  teardowns = new Map<string, () => void>();

  setValue(value: FormArrayValue<T>, emitChange = true) {
    if (value.length !== this.controls.length) {
      throw new Error(`Value length ${value.length} does not match controls length ${this.controls.length}`);
    }
    for (let i = 0; i < this.controls.length; i++) {
      this.controls[i].setValue(value[i], false);
    }
    this._value = this.getValue();
    if (emitChange) { this.emitValue(); }
  }
}

export interface FormFieldElement extends HTMLElement {
  name: string;
  control: FormControl<any>;
}

declare global { interface HTMLElementTagNameMap { 'form-field-group': FormFieldGroup; } }
@customElement('form-field-group')
export class FormFieldGroup extends JSXElement<{
  registerFormControl: CustomEvent<FormControl<any>>;
}> implements FormFieldElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @state()
  accessor name: string = "";

  @state()
  accessor control = new FormGroup({});

  private registerFormControl = (event: CustomEvent<FormControl<any>>) => {
    if (event.detail === this.control) return;
    event.stopPropagation();
    const control = event.detail;
    const target = event.target as FormFieldElement;
    this.control.addControl(target.name, control);
  };

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.dispatchEvent(new CustomEvent('registerFormControl', {
      detail: this.control,
      bubbles: true,
    }));
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('registerFormControl', this.registerFormControl);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('registerFormControl', this.registerFormControl);
    this.control.destroy();
    this.control = new FormGroup({});
  }


}
// type ElementProps2<T extends Node> = T["constructor"] extends { properties: infer P } ? P : never;
// type t2 = ElementProps2<FormField>;

declare global { interface HTMLElementTagNameMap { 'form-field': FormField; } }
@customElement('form-field')
export class FormField extends JSXElement<{
  registerFormControl: CustomEvent<FormControl<string>>;
}> {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @state() accessor variant: "outlined" | "filled" = "filled";

  @state() accessor name: string = "";

  @state() accessor label: string = "";

  @state() accessor emitOnInput: boolean = false;

  @state() accessor control = new FormControl<string>("");

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.dispatchEvent(new CustomEvent('registerFormControl', {
      detail: this.control,
      bubbles: true,
    }));
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.control.destroy();
    this.control = new FormControl<string>("");
  }

  protected render() {
    return <mdui-text-field
      onchange={(event) => {
        const target = event.target as TextField;
        this.control.setValue(target.value);
      }}
      oninput={(event) => {
        if (!this.emitOnInput) return;
        const target = event.target as TextField;
        this.control.setValue(target.value, false);
      }}
      variant={this.variant}
      label={this.label}
    ></mdui-text-field>;
  }
}
