import { PropsWithChildren, useCallback } from 'react';
import * as forms from "angular-forms-only";
import {
  EventEmitter,
  IndexJson, useIndexJson, SelectField,
  useObservable,
  serverRequest,
  ok
} from '../../helpers';
import { DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { onChange } from './shared';
import { createDialogForm, FormDialogSubmitButton } from '../../forms';

type User = Exclude<IndexJson["userListAdmin"], false>[number];
const useUserEditForm = createDialogForm({
  create: (value: User | null) => new forms.FormGroup({
    username: new forms.FormControl(value?.username ?? "", {
      nonNullable: true, validators: [forms.Validators.required]
    }),
    email: new forms.FormControl(value?.email ?? "", {
      nonNullable: true, validators: [forms.Validators.required]
    }),
    role_ids: new forms.FormControl(value?.roles.map(e => e.role_id) ?? [], {
      nonNullable: true, validators: [forms.Validators.required]
    }),
  }),
  render: ({ form, value, indexJson: [indexJson, globalRefresh], onReset: onRefresh }) => {
    const { roleList } = indexJson;
    return <>
      <TextField
        label="User Name"
        value={form.controls.username.value}
        onChange={onChange(form.controls.username)}
      />
      <TextField
        label="Email"
        value={form.controls.email.value}
        onChange={onChange(form.controls.email)}
      />
      <SelectField
        title="Roles"
        multiple
        control={form.controls.role_ids}
        options={roleList.map(e => ({ value: e.role_id, label: e.role_name }))}
      />
      <FormDialogSubmitButton
        onSubmit={async () => {
          const formData = form.value;
          const isCreate = value === null;
          console.log(formData, isCreate, value);

          if (form.invalid) { console.log(form.errors); throw form.errors; }
          if (!isCreate && !value) throw new Error("No value provided");

          ok(formData.username, "Username is required.");
          ok(formData.email, "Email is required.");
          ok(formData.role_ids?.length, "Role is required.");

          console.log("not implemented", formData)

          // const { role_id } = isCreate ? await serverRequest.user_create({
          //   ...formData,
          // }) : await serverRequest.user_update({
          //   user_id: value.user_id,
          //   ...formData,
          // });
          // const newJson = await globalRefresh();
          // const newUser = newJson.userListAdmin.find(e => e.user_id === role_id);
          // if (newUser) onRefresh(newUser);
          // return "";
          throw "not implemented";
        }}
      />
    </>;
  }
});
