import React, { useMemo } from 'react';
import { useIndexJson } from '../../helpers/utils';
import { Checkbox, FormControlLabel } from "@mui/material";
import * as forms from "angular-forms-only";
import { SelectField, useObservable } from '../../helpers';



export const sortBagNames = (a: string, b: string) =>
  (+a.startsWith("$:/") - +b.startsWith("$:/"))
  || a.localeCompare(b);



export function OwnerSelection({ isCreate, control }: { isCreate: boolean; control: forms.FormControl<string | null>; }): React.ReactNode {
  const [indexJson] = useIndexJson();
  useObservable(control.valueChanges);

  const ownerOptions = useMemo(() => (
    indexJson.userListAdmin || indexJson.userListUser || []
  )?.map(e => ({
    label: e.username,
    value: e.user_id
  })), [indexJson.userListAdmin]);

  // this has to be after the hook, although it would only change if 
  // the user's admin status changes, and they would probably refresh the page anyway
  if (!indexJson.isAdmin || !indexJson.userListAdmin) return null;

  if (isCreate) return (
    <FormControlLabel
      label="Admin option: Make yourself the owner."
      control={<Checkbox
        value={control.value}
        onChange={(event) => control.setValue(event.target.checked ? indexJson.user_id! : null)}
        disabled={control.disabled}
      />}
    />
  );

  if (ownerOptions) return (
    <SelectField
      title="Owner"
      control={control}
      options={ownerOptions}
    />
  );

}


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
