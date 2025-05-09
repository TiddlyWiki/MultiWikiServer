import { PropsWithChildren, useCallback } from 'react';
import * as forms from "angular-forms-only";
import {
  EventEmitter,
  IndexJson, useIndexJson,
  serverRequest,
  ok
} from '../../helpers';
import { FormDialogSubmitButton, FormDialog, useFormDialogForm, createDialogForm, } from '../../forms';
import { DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { onChange } from './shared';

export const useRoleEditForm = createDialogForm({
  create: (value: IndexJson["roleList"][number] | null) => new forms.FormGroup({
    role_name: new forms.FormControl(value?.role_name ?? "", {
      nonNullable: true, validators: [forms.Validators.required]
    }),
    description: new forms.FormControl(value?.description ?? "", {
      nonNullable: true, validators: [forms.Validators.required]
    }),
  }),
  render: ({ form, value, indexJson: [, globalRefresh], onReset: onRefresh }) => {
    const isCreate = value === null;
    return <>
      {!isCreate && <h2>Role: {value?.role_name}</h2>}
      {isCreate && <TextField
        label="Role Name"
        value={form.controls.role_name.value}
        onChange={onChange(form.controls.role_name)}
      />}
      <TextField
        label="Description"
        value={form.controls.description.value}
        onChange={onChange(form.controls.description)}
      />
      <FormDialogSubmitButton
        onSubmit={async () => {
          const formData = form.value;

          console.log(formData, isCreate, value);

          if (form.invalid) { console.log(form.errors); throw form.errors; }
          if (!isCreate && !value) throw new Error("No value provided");

          const role_name = isCreate ? formData.role_name : value.role_name;
          const { description } = formData;

          ok(role_name);
          ok(description);

          const { role_id } = isCreate ? await serverRequest.role_create({
            role_name,
            description,
          }) : await serverRequest.role_update({
            role_id: value.role_id,
            role_name,
            description,
          });

          const newJson = await globalRefresh();
          const newRole = newJson.roleList.find(e => e.role_id === role_id);
          if (newRole) onRefresh();

          return `Role ${isCreate ? "created" : "updated"} successfully. `
            + `${newRole ? "Refreshed." : "Refresh to see changes."}`;

        }}
      />
    </>;
  }
})
