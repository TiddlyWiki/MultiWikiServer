import { PropsWithChildren, useCallback } from 'react';
import { Checkbox, DialogContent, DialogTitle, FormControlLabel, Stack, TextField } from "@mui/material";
import * as forms from "angular-forms-only";
import {
  EventEmitter,
  IndexJson, serverRequest, useIndexJson, ok,
  Refresher
} from '../../helpers';
import { onChange, onChecked, OwnerSelection } from './Shared';
import { createDialogForm, FormDialogSubmitButton } from '../../forms';


export const useBagEditForm = createDialogForm({
  create: (value: IndexJson["bagList"][number] | null) => {
    console.log(value);
    const form = new forms.FormGroup({
      bag_name: new forms.FormControl(value?.bag_name ?? "", {
        nonNullable: true, validators: [forms.Validators.required]
      }),
      description: new forms.FormControl(value?.description ?? "", {
        nonNullable: true, validators: [forms.Validators.required]
      }),
      is_plugin: new forms.FormControl<boolean>(value?.is_plugin ?? false),
      owner_id: new forms.FormControl<string | null>(value?.owner_id ?? null),
    });
    if (value) form.controls.bag_name.disable();
    return form;
  },
  render: ({ form: bagForm, value, indexJson: [indexJson, globalRefresh], update }) => {
    const isCreate = value === null;
    return <>
      {!isCreate && <h2>Bag: {value?.bag_name}</h2>}
      {isCreate && <TextField
        label="Bag Name"
        value={bagForm.controls.bag_name.value}
        onChange={onChange(bagForm.controls.bag_name)}
        disabled={bagForm.controls.bag_name.disabled}
        helperText={bagForm.controls.bag_name.disabled && "Bag name cannot be changed."}
      />}
      <TextField
        label="Description"
        value={bagForm.controls.description.value}
        onChange={onChange(bagForm.controls.description)}
        disabled={bagForm.controls.description.disabled}
      />
      <FormControlLabel
        label="Plugin Bag: This bag should be rendered as a plugin."
        control={<Checkbox
          checked={bagForm.controls.is_plugin.value ?? false}
          onChange={onChecked(bagForm.controls.is_plugin)}
          disabled={bagForm.controls.is_plugin.disabled}
        />}
      />
      <OwnerSelection isCreate={isCreate} control={bagForm.controls.owner_id} />
      <FormDialogSubmitButton
        onSubmit={async () => {

          const formData = bagForm.value;
          console.log(formData, isCreate);
          const isAdmin = indexJson.isAdmin;

          if (!isAdmin) formData.owner_id = undefined;
          else if (!formData.owner_id) formData.owner_id = null;
          if (bagForm.invalid) { console.log(bagForm.errors); throw bagForm.errors; }


          const bag_name = isCreate ? formData.bag_name : value.bag_name;
          ok(bag_name);
          ok(formData.description);

          const { bag_id } = await serverRequest.bag_upsert({
            bag_name,
            description: formData.description,
            owner_id: isAdmin ? formData.owner_id : undefined,
            is_plugin: formData.is_plugin ?? false,
            isCreate,
          });

          const newJson = await globalRefresh();
          const newBag = newJson.bagList.find(e => e.bag_id === bag_id);
          if (newBag) update(newBag);
          return `Bag ${isCreate ? "created" : "updated"} successfully. `
            + `${newBag ? "Refreshed." : "Refresh to see changes."}`;

        }}
      />
    </>
  }
})
