import { createContext, useContext, useCallback, useMemo, useState, PropsWithChildren, ReactNode } from "react";
import * as forms from "angular-forms-only";
import { ButtonAwait, UseIndexJson, useIndexJson } from "../helpers";
import { useObservable } from "../helpers";
import { Alert, Autocomplete, Button, Dialog, DialogContent, DialogProps, DialogTitle, Stack, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";
// import InputMask from "@mona-health/react-input-mask";
// import ReactInputMaskInner from "@mona-health/react-input-mask";


// export function FormBlock<T, F extends forms.AbstractControl>({
//   createForm,
//   value,
//   children,
// }: PropsWithChildren<{
//   value: T | null,
//   createForm: (value: T | null) => F
// }>) {

//   const form = useMemo(() => value === undefined ? null : createForm(value), [value]);
//   useObservable(form?.valueChanges);
//   useObservable(form?.statusChanges);

//   const indexJson = useIndexJson();
//   return (

//     <FormDialogFormContext.Provider value={{
//       form, value,
//       onClose: () => { },
//       onRefresh: () => { form?.reset() },
//       indexJson
//     }}>
//       <Stack
//         component="div" spacing={4} paddingBlockStart={2}
//         direction="column" justifyContent="flex-start" alignItems="stretch"
//       >
//         {form && children}
//       </Stack>
//     </FormDialogFormContext.Provider>
//   );

// }


export * from "./FormDialog";

export function onChange<T>(formControl: forms.FormControl<T>) {
  return (event: { target: { value: T } }) => {
    formControl.setValue(event.target.value);
    formControl.markAsDirty();
  }
}

export function onChecked(formControl: forms.FormControl<boolean | null>) {
  return (event: any, checked: boolean) => {
    formControl.setValue(checked);
    formControl.markAsDirty();
  }
}


interface FormSelectFieldBaseProps<V> {
  label?: string
  loading?: boolean
  sx?: SxProps<Theme>
  options: { value: V, label: string }[],
  onSearchChange?: (value: string) => void
}

export interface FormSelectFieldMultipleProps<V> extends FormSelectFieldBaseProps<V> {
  required?: boolean
  multiple: true
  control: forms.AbstractControl<V[]>
}
export interface FormSelectFieldRequiredProps<V> extends FormSelectFieldBaseProps<V> {
  required: true
  multiple?: false
  control: forms.AbstractControl<V>
}
export interface FormSelectFieldOptionalProps<V> extends FormSelectFieldBaseProps<V> {
  required?: false
  multiple?: false
  control: forms.AbstractControl<V | null>
}
export interface FormSelectFieldRuntimeProps<V> extends FormSelectFieldBaseProps<V> {
  required?: boolean
  multiple?: boolean
  control: forms.AbstractControl<V | null | V[]>
}
export function FormSelectField<V>(props: PropsWithChildren<FormSelectFieldMultipleProps<V>>): ReactNode;
export function FormSelectField<V>(props: PropsWithChildren<FormSelectFieldRequiredProps<V>>): ReactNode;
export function FormSelectField<V>(props: PropsWithChildren<FormSelectFieldOptionalProps<V>>): ReactNode;
export function FormSelectField<V>({
  label, required, multiple, sx, control, options, loading, onSearchChange
}: PropsWithChildren<FormSelectFieldRuntimeProps<V>>): ReactNode {

  useObservable(control.valueChanges);
  useObservable(control.statusChanges);

  const valueMap = useMemo(() => new Map(options.map((e) => [e.value, e])), [options]);
  const valueInner = useMemo(() =>
    multiple ? (control.value as V[]).map(e => valueMap.get(e))
      : (control.value && valueMap.get(control.value as any))
    , [control.value, multiple, valueMap]);

  return <Autocomplete
    sx={sx}
    options={options}
    disableClearable={required}
    renderInput={(params) => <TextField
      error={control.touched && control.invalid}
      required={required}
      {...params}
      onChange={onSearchChange ? (event) => onSearchChange(event.target.value) : undefined}
      label={label}
    />}
    multiple={multiple}
    onBlur={() => control.markAsTouched()}
    value={valueInner as any}
    loading={loading}
    isOptionEqualToValue={(option, value) => option.value === value.value}
    onChange={(event, value) => {
      if (multiple)
        control.setValue((value as { value: V, label: string }[]).map(e => e.value) as any);
      else
        control.setValue(value && value.value);
      control.markAsDirty();
    }}
  />

}




export interface FormTextFieldProps extends Omit<TextFieldProps, "value" | "onChange" | "disabled"> {
  control: forms.FormControl<string | null>;
}
export function FormTextField({ control, ...rest }: FormTextFieldProps) {

  return <TextField
    {...rest}
    value={control.value}
    onChange={onChange(control)}
    disabled={control.disabled}
    error={control.touched && control.invalid || rest.error}
    onBlur={(e) => { control.markAsTouched(); rest.onBlur?.(e); }}
  />
}


