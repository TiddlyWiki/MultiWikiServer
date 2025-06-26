import { useCallback, useMemo } from 'react';
import { serverRequest, truthy } from '../../helpers/utils';
import {
  Avatar, IconButton, Link, ListItem, ListItemAvatar, ListItemText,
  Stack, useTheme
} from "@mui/material";
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import * as forms from "angular-forms-only";
import { MissingFavicon, SelectField, useObservable } from '../../helpers';
import { createDialogForm, FormDialogSubmitButton } from '../../forms';

export type EntityACL = {
  type: "recipe" | "bag";
  id: string;
  name: string;
  description: string;
  owner_id: string | null;
  acl: ACL[];
}


type ACL = { role_id: string | null, permission: "READ" | "WRITE" | "ADMIN" };

const ACLRow = (value: ACL | null) => new forms.FormGroup({
  role_id: new forms.FormControl<string | null>(value?.role_id ?? null, { nonNullable: true, validators: [forms.Validators.required] }),
  permission: new forms.FormControl<"READ" | "WRITE" | "ADMIN">(value?.permission ?? "READ", { nonNullable: true, validators: [forms.Validators.required] }),
});
export const useACLEditForm = createDialogForm({
  title: "Edit ACL",
  create: (entity: EntityACL | null) => new forms.FormArray(entity?.acl?.map(e => ACLRow(e)) ?? []),
  render: ({ form, value, indexJson: [indexJson, globalRefresh], update }) => {
    const theme = useTheme();

    const roleOptions = useMemo(() => indexJson.roleList.map(e => ({
      label: e.role_name,
      value: e.role_id
    })), [indexJson.roleList]);

    const getOwner = useCallback((owner_id: string | null): string => {
      if (owner_id === null) return "System";
      return (indexJson.userListAdmin || indexJson.userListUser || [])
        .find(e => e.user_id === owner_id)?.username ?? "Unknown";
    }, [indexJson]);

    useObservable(form.valueChanges);

    return <>

      {value && <ListItem>
        <ListItemAvatar>
          <Avatar src={`/${value.type}s/${encodeURIComponent(value.name)}/tiddlers/%24%3A%2Ffavicon.ico`}>
            <MissingFavicon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<>
            <Link href={`/wiki/${encodeURIComponent(value.name)}`}>{value.name}</Link>
            {value.owner_id && <span> (by {getOwner(value.owner_id)})</span>}
          </>}
          secondary={value.description}
        />
      </ListItem>}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <h3>ACL</h3>
        <IconButton
          sx={{ color: theme.palette.primary.main }}
          onClick={() => {
            form.insert(0, ACLRow({ role_id: null, permission: "READ" } as any));
            form.markAsDirty();
          }}
        >
          <Add />
        </IconButton>
      </Stack>
      {form.controls.map((acl, i) => (
        <Stack direction="row" spacing={2}>
          <SelectField
            sx={{ flexGrow: 0.75 }}
            required
            title="Select Role"
            control={acl.controls.role_id}
            options={roleOptions}
          />
          <SelectField
            sx={{ flexGrow: 0.25 }}
            required
            options={PermissionOptions}
            title="Permission"
            control={acl.controls.permission}
          />
          <IconButton onClick={() => {
            form.removeAt(i);
            form.markAsDirty();
          }} sx={{ color: theme.palette.error.main }}>
            <Remove />
          </IconButton>
        </Stack>
      ))}
      <FormDialogSubmitButton
        onSubmit={async () => {
          if (!value) return "Error: No value";
          console.log(form.value);

          if (value.type === "bag") {
            await serverRequest.bag_acl_update({
              bag_name: value.name,
              acl: form.value.map(e => e.role_id && e.permission && ({
                role_id: e.role_id,
                permission: e.permission
              })).filter(truthy)
            });
            const newJson = await globalRefresh();
            const newBag = newJson.bagList.find(e => e.bag_id === value.id);
            if (newBag) update({
              type: "bag",
              id: newBag.bag_id,
              name: newBag.bag_name,
              description: newBag.description,
              owner_id: newBag.owner_id,
              acl: newBag.acl
            });
            return `Bag ACL updated successfully. `
              + `${newBag ? "Refreshed." : "Refresh to see changes."}`;
          } else {
            await serverRequest.recipe_acl_update({
              recipe_name: value.name,
              acl: form.value.map(e => e.role_id && e.permission && ({
                role_id: e.role_id,
                permission: e.permission
              })).filter(truthy)
            });
            const newJson = await globalRefresh();
            const newRecipe = newJson.recipeList.find(e => e.recipe_id === value.id);
            if (newRecipe) update({
              type: "recipe",
              id: newRecipe.recipe_id,
              name: newRecipe.recipe_name,
              description: newRecipe.description,
              owner_id: newRecipe.owner_id,
              acl: newRecipe.acl
            });
            return `Recipe ACL updated successfully. `
              + `${newRecipe ? "Refreshed." : "Refresh to see changes."}`;
          }
        }}
      />

    </>;
  }
});


const PermissionOptions = (["READ", "WRITE", "ADMIN"] as const).map(e => ({ value: e, label: e }));


function EntityACLInner() {

}
