import * as forms from "angular-forms-only";

export function onChange<T>(formControl: forms.FormControl<T>) {
  return (event: { target: { value: T } }) => {
    formControl.setValue(event.target.value);
    formControl.markAsDirty();
  }
}
