import { Subject, Subscription } from 'rxjs';

export type ValidationErrors = Record<string, unknown>;

export type Validator<Value> = (value: Value) => ValidationErrors | null;

export class FormControl<Value> {
  private parentControl: FormControl<any> | null = null;
  private readonly valueChanges = new Subject<Value>();
  private ownDisabled = false;
  private ownTouched = false;
  private ownDirty = false;
  validators: Validator<Value>[] = [];
  validatorErrors: ValidationErrors | null = null;

  constructor(private currentValue: Value) { }

  get parent(): FormControl<any> | null {
    return this.parentControl;
  }

  protected get childControls(): readonly FormControl<any>[] {
    return [];
  }

  get disabled(): boolean {
    return this.ownDisabled || (this.parent?.disabled ?? false);
  }

  disable(callNotify: boolean = true): void {
    if (!this.ownDisabled) {
      this.ownDisabled = true;
      this.emitDisabledChange();
    }
    if (callNotify) this.parent?.notify();
  }

  enable(callNotify: boolean = true): void {
    if (this.ownDisabled) {
      this.ownDisabled = false;
      this.emitDisabledChange();
    }
    if (callNotify) this.parent?.notify();
  }

  private emitDisabledChange(): void {
    this.emitValueChange();
    for (const control of this.childControls) {
      control.emitDisabledChange();
    }
  }

  get touched(): boolean {
    return this.ownTouched || this.childControls.some((control) => control.touched);
  }

  markAsTouched(callNotify: boolean = true): void {
    this.ownTouched = true;
    if (callNotify) this.notify();
  }

  markAsUntouched(callNotify: boolean = true): void {
    this.ownTouched = false;
    for (const control of this.childControls) {
      control.markAsUntouched(false);
    }
    if (callNotify) this.notify();
  }

  get dirty(): boolean {
    return this.ownDirty || this.childControls.some((control) => control.dirty);
  }

  markAsDirty(callNotify: boolean = true): void {
    this.ownDirty = true;
    if (callNotify) this.notify();
  }

  markAsPristine(callNotify: boolean = true): void {
    this.ownDirty = false;
    for (const control of this.childControls) {
      control.markAsPristine(false);
    }
    if (callNotify) this.notify();
  }

  protected adoptControls(controls: readonly FormControl<any>[]): void {
    const seen = new Set<FormControl<any>>();
    for (const control of controls) {
      if (seen.has(control)) throw new Error("The same control cannot be added more than once.");
      if (control.parent) throw new Error("The control already has a parent.");
      for (let ancestor: FormControl<any> | null = this; ancestor; ancestor = ancestor.parent) {
        if (ancestor === control) throw new Error("A control cannot contain itself or an ancestor.");
      }
      seen.add(control);
    }
    for (const control of controls) {
      control.parentControl = this;
    }
  }

  protected releaseControl(control: FormControl<any>): void {
    control.parentControl = null;
  }

  indexOf(_control: FormControl<any>): string | number | null {
    return null;
  }

  checkValidity(): boolean {
    if (this.disabled) {
      this.validatorErrors = null;
      return true;
    }
    const value = this.value;
    const errors: ValidationErrors = {};
    for (const validator of this.validators) {
      Object.assign(errors, validator(value));
    }
    this.validatorErrors = Object.keys(errors).length ? errors : null;
    return this.validatorErrors === null;
  }

  subscribe(callback: (value: Value) => void): Subscription {
    return this.valueChanges.subscribe(callback);
  }

  protected emitValueChange(): void {
    this.valueChanges.next(this.value);
  }

  notify(): void {
    this.emitValueChange();
    this.parent?.notify();
  }

  get value(): Value {
    return this.currentValue;
  }

  setValue(value: Value, callNotify: boolean = true): void {
    this.currentValue = value;
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
  }
}

export type FormGroupControls<Value extends object> = {
  [Key in keyof Value]-?: FormControl<Value[Key]>;
};

/** Removing a required control can make the runtime value incomplete without changing its static type. */
export class FormGroup<Value extends object> extends FormControl<Value> {
  readonly controls: FormGroupControls<Value>;
  childrenErrors: Partial<Record<keyof Value, ValidationErrors | null>> = {};

  constructor(controls: FormGroupControls<Value>) {
    super(FormGroup.readValue(controls));
    this.controls = { ...controls };
    this.adoptControls((Object.keys(this.controls) as (keyof Value)[]).map((key) => this.controls[key]));
  }

  protected override get childControls(): readonly FormControl<any>[] {
    return (Object.keys(this.controls) as (keyof Value)[]).map((key) => this.controls[key]);
  }

  override indexOf(control: FormControl<any>): string | null {
    return Object.keys(this.controls).find((key) => this.controls[key as keyof Value] === control) ?? null;
  }

  override checkValidity(): boolean {
    let valid = super.checkValidity();
    const entries = (Object.keys(this.controls) as (keyof Value)[]).map((key) => {
      const control = this.controls[key];
      if (!control.checkValidity()) valid = false;
      return [key, control.validatorErrors];
    });
    this.childrenErrors = Object.fromEntries(entries);
    return valid;
  }

  addControl<Key extends keyof Value>(key: Key, control: FormControl<Value[Key]>, callNotify: boolean = true): this {
    if (Object.prototype.hasOwnProperty.call(this.controls, key)) return this;
    this.adoptControls([control]);
    this.controls[key] = control;
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
    return this;
  }

  removeAt<Key extends keyof Value>(key: Key, callNotify: boolean = true): FormControl<Value[Key]> | null {
    if (!Object.prototype.hasOwnProperty.call(this.controls, key)) return null;
    const control = this.controls[key];
    delete this.controls[key];
    this.releaseControl(control);
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
    return control;
  }

  override get value(): Value {
    return FormGroup.readValue(this.controls);
  }

  override setValue(value: Required<Value>, callNotify: boolean = true): void {
    const keys = Object.keys(this.controls) as (keyof Value)[];
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        throw new Error(`The value must contain the key "${String(key)}".`);
      }
    }
    for (const key of keys) {
      this.controls[key].setValue(value[key], false);
    }
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
  }

  patchValue(value: Partial<Value>, callNotify: boolean = true): void {
    for (const key of Object.keys(value) as (keyof Value)[]) {
      if (Object.prototype.hasOwnProperty.call(this.controls, key)) {
        this.controls[key].setValue(value[key] as Value[typeof key], false);
      }
    }
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
  }

  private static readValue<Value extends object>(controls: FormGroupControls<Value>): Value {
    return Object.fromEntries(
      (Object.keys(controls) as (keyof Value)[]).map((key) => [key, controls[key].value])
    ) as Value;
  }
}

export class FormArray<Value> extends FormControl<Value[]> {
  readonly controls: FormControl<Value>[];
  childrenErrors: (ValidationErrors | null)[] = [];

  constructor(controls: readonly FormControl<Value>[]) {
    super(controls.map((control) => control.value));
    this.controls = [...controls];
    this.adoptControls(this.controls);
  }

  protected override get childControls(): readonly FormControl<any>[] {
    return this.controls;
  }

  override indexOf(control: FormControl<any>): number | null {
    const index = this.controls.findIndex((child) => child === control);
    return index === -1 ? null : index;
  }

  override checkValidity(): boolean {
    let valid = super.checkValidity();
    this.childrenErrors = this.controls.map((control) => {
      if (!control.checkValidity()) valid = false;
      return control.validatorErrors;
    });
    return valid;
  }

  addControl(control: FormControl<Value>, callNotify: boolean = true): this {
    this.adoptControls([control]);
    this.controls.push(control);
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
    return this;
  }

  removeAt(index: number, callNotify: boolean = true): FormControl<Value> | null {
    if (!Number.isInteger(index) || index < 0 || index >= this.controls.length) return null;
    const [control] = this.controls.splice(index, 1);
    this.releaseControl(control);
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
    return control;
  }

  reposition(oldIndex: number, newIndex: number, callNotify: boolean = true): this {
    if (!Number.isInteger(oldIndex) || oldIndex < 0 || oldIndex >= this.controls.length) return this;
    if (!Number.isInteger(newIndex) || newIndex < 0 || newIndex >= this.controls.length) return this;
    if (oldIndex === newIndex) return this;
    const [control] = this.controls.splice(oldIndex, 1);
    this.controls.splice(newIndex, 0, control);
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
    return this;
  }

  override get value(): Value[] {
    return this.controls.map((control) => control.value);
  }

  override setValue(value: Value[], callNotify: boolean = true): void {
    if (value.length !== this.controls.length) {
      throw new Error("The value must contain one entry for each array control.");
    }
    this.controls.forEach((control, index) => control.setValue(value[index], false));
    this.emitValueChange();
    if (callNotify) this.parent?.notify();
  }
}



