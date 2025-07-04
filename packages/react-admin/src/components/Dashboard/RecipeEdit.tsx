import React, { PropsWithChildren, useCallback, useMemo } from 'react';
import { IndexJson, ok, Refresher, SelectField, serverRequest, useIndexJson } from '../../helpers';
import {
  Autocomplete, Checkbox, DialogContent, DialogTitle, Divider, FormControlLabel, FormHelperText, IconButton, Stack, TextField,
  useMediaQuery, useTheme

} from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import WithACL from '@mui/icons-material/GppGood';
import WithoutACL from '@mui/icons-material/GppBadOutlined';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';


import * as forms from "angular-forms-only";
import { EventEmitter, useObservable } from '../../helpers';
import { onChange, onChecked, OwnerSelection, sortBagNames } from './Shared';
import { createDialogForm, FormDialogSubmitButton, useFormDialogForm } from '../../forms';

export interface Recipe {
  recipe_name: string;
  description: string;
  owner_id?: string | null;
  bag_names: { bag_name: string, with_acl: boolean }[];
  plugin_names: string[];
  skip_required_plugins: boolean;
  skip_core: boolean;
}

export const useRecipeEditForm = createDialogForm({
  create: (value: Recipe | null) => {
    const form = new forms.FormGroup({
      recipe_name: new forms.FormControl(value?.recipe_name ?? "", {
        nonNullable: true, validators: [forms.Validators.required]
      }),
      description: new forms.FormControl(value?.description ?? "", {
        nonNullable: true, validators: [forms.Validators.required]
      }),
      owner_id: new forms.FormControl<string | null>(value?.owner_id ?? null, {
        nonNullable: true
      }),
      bag_names: new forms.FormArray<ReturnType<typeof RecipeBagRow>>(
        !value ? [RecipeBagRow({ bag_name: "", with_acl: false })] : value.bag_names.map(e => RecipeBagRow(e)),
        { validators: [forms.Validators.required] }
      ),
      plugin_names: new forms.FormControl<string[]>(value?.plugin_names ?? [], {
        nonNullable: true, validators: [],
      }),
      skip_required_plugins: new forms.FormControl<boolean>(value?.skip_required_plugins ?? false, {
        nonNullable: true,
      }),
      skip_core: new forms.FormControl<boolean>(value?.skip_core ?? false, {
        nonNullable: true,
      }),
    });
    if (value) form.controls.recipe_name.disable();
    return form;
  },
  render: ({ form: recipeForm, indexJson: [indexJson, globalRefresh], value, update }) => {
    const isCreate = value === null;
    const theme = useTheme();
    const isAdmin = indexJson.isAdmin;
    return <>
      {!isCreate && <h2>Recipe: {value?.recipe_name}</h2>}
      {isCreate && <TextField
        label="Recipe Name"
        value={recipeForm.controls.recipe_name.value}
        onChange={onChange(recipeForm.controls.recipe_name)}
        disabled={recipeForm.controls.recipe_name.disabled}
        helperText={recipeForm.controls.recipe_name.disabled && "Recipe name cannot be changed."}
      />}
      <TextField
        label="Description"
        value={recipeForm.controls.description.value}
        onChange={onChange(recipeForm.controls.description)}
      />
      <OwnerSelection
        type="recipe"
        isCreate={isCreate}
        control={recipeForm.controls.owner_id}
      />
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <h2>Bags</h2>
        <IconButton sx={{ color: theme.palette.primary.main }}
          onClick={() => {
            recipeForm.controls.bag_names.insert(0, RecipeBagRow({ bag_name: "", with_acl: false }));
            recipeForm.controls.bag_names.markAsDirty();
          }}
        >
          <Add />
        </IconButton>
      </Stack>
      {recipeForm.controls.bag_names.controls.map((bagRow, index) => (
        <RecipeBagRowComponent
          key={JSON.stringify(bagRow.value.bag_name)}
          bagRow={bagRow}
          bag_names={indexJson.bagList.map(e => e.bag_name)}
          onMoveUp={index > 0 ? () => {
            recipeForm.controls.bag_names.removeAt(index);
            recipeForm.controls.bag_names.insert(index - 1, bagRow);
            recipeForm.controls.bag_names.markAsDirty();
          } : undefined}
          onMoveDown={index < recipeForm.controls.bag_names.length - 1 ? () => {
            recipeForm.controls.bag_names.removeAt(index);
            recipeForm.controls.bag_names.insert(index + 1, bagRow);
            recipeForm.controls.bag_names.markAsDirty();
          } : undefined}
          onRemove={recipeForm.controls.bag_names.length > 1 ? () => {
            recipeForm.controls.bag_names.removeAt(index);
            recipeForm.controls.bag_names.markAsDirty();
          } : undefined} />
      ))}
      <h2>Client Plugins</h2>
      <SelectField
        title="Roles"
        multiple
        control={recipeForm.controls.plugin_names}
        options={indexJson.clientPlugins.map(e => ({ value: e, label: e }))}
      />
      <Divider />
      <Stack direction="column" justifyContent="stretch" alignItems="stretch" spacing={0}>
        <h2>Required Plugins</h2>
        <p>These plugins are always included even if no other client plugins are set.</p>
        <ul>{indexJson.corePlugins.map(e => <li>{e}</li>)}</ul>
        <p>The plugins are required for the wiki to save properly. The themes are provided as a default fallback in case nothing else is availabe.</p>
        <Stack direction="row" alignItems="center">
          <Checkbox
            checked={recipeForm.controls.skip_required_plugins.value}
            onChange={onChecked(recipeForm.controls.skip_required_plugins)}
            disabled={recipeForm.controls.skip_required_plugins.disabled}
          />
          <span>Skip Required Plugins</span>
        </Stack>
        <FormHelperText sx={{ marginBlock: 0 }}>Don't include required plugins.</FormHelperText>
      </Stack>
      <Divider />
      <Stack direction="column" justifyContent="stretch" alignItems="stretch" spacing={0}>
        <h2>TiddlyWiki Core</h2>
        <p>
          The TiddlyWiki core is the heart of your wiki. Obviously the only reason
          to disable this is if you want to write a completely new core from scratch.
        </p>
        <Stack direction="row" alignItems="center">
          <Checkbox
            checked={recipeForm.controls.skip_core.value}
            onChange={onChecked(recipeForm.controls.skip_core)}
            disabled={recipeForm.controls.skip_core.disabled}
          />
          <span>Skip The Core!</span>
        </Stack>
        <FormHelperText sx={{ marginBlock: 0 }}>Don't include the core.</FormHelperText>
      </Stack>
      <FormDialogSubmitButton
        onSubmit={async () => {
          const formData = recipeForm.value;
          console.log(formData, isCreate);

          if (!isAdmin) formData.owner_id = undefined;
          else if (formData.owner_id === "") formData.owner_id = null;

          if (formData.bag_names?.length === 0) throw "Recipe must have at least one bag.";
          if (recipeForm.invalid) { console.log(recipeForm.errors); throw recipeForm.errors; }

          const recipe_name = isCreate ? formData.recipe_name : value.recipe_name;
        
          ok(recipe_name);
          ok(formData.description);
          ok(formData.bag_names);
          ok(formData.plugin_names);
          
          const { plugin_names, skip_required_plugins = false, skip_core = false } = formData;

          const { recipe_id } = await serverRequest.recipe_create_or_update({
            recipe_name,
            description: formData.description,
            owner_id: formData.owner_id,
            bag_names: formData.bag_names.map(({ bag_name, with_acl = false }) =>
              (ok(bag_name), { bag_name, with_acl })
            ),
            plugin_names,
            skip_required_plugins,
            skip_core,
            create_only: isCreate,
          });

          const newJson = await globalRefresh();
          const newRecipe = newJson.recipeList.find(e => e.recipe_id === recipe_id);
          if (newRecipe) update({
            ...newRecipe,
            bag_names: newRecipe.recipe_bags.map(rb => ({
              bag_name: indexJson.getBag(rb.bag_id)?.bag_name ?? "",
              with_acl: rb.with_acl,
            })),
          });
          return `Recipe ${isCreate ? "created" : "updated"} successfully. `
            + `${newRecipe ? "Refreshed." : "Refresh to see changes."}`;
        }}
      />
    </>;
  }
});



interface RecipeBagRow {
  bag_name: string;
  with_acl: boolean;
}
const RecipeBagRow = (value: RecipeBagRow) => new forms.FormGroup({
  bag_name: new forms.FormControl(value.bag_name, { nonNullable: true, validators: [forms.Validators.required] }),
  with_acl: new forms.FormControl(value.with_acl, { nonNullable: true }),
});


function RecipeBagRowComponent({ bag_names, bagRow, onMoveDown, onMoveUp, onRemove }: {
  bag_names: string[],
  bagRow: ReturnType<typeof RecipeBagRow>,
  onMoveUp: (() => void) | undefined,
  onMoveDown: (() => void) | undefined
  onRemove: (() => void) | undefined
}) {
  useObservable(bagRow.valueChanges);
  const theme = useTheme();
  const doubleRow = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Stack direction={doubleRow ? "column" : "row"} spacing={0}>
      <Autocomplete
        sx={{ flexGrow: 1 }}
        options={bag_names.sort(sortBagNames)}
        renderInput={(params) => <TextField error={!bagRow.value.bag_name} required {...params} label="Bag Name" />}
        value={bagRow.value.bag_name}
        onChange={(event, bag_name) => {
          bagRow.controls.bag_name.setValue(bag_name ?? "");
          bagRow.controls.bag_name.markAsDirty();
        }}
      />
      <Stack direction="row" spacing={0}>
        <Checkbox
          disabled={bagRow.value.bag_name?.startsWith("$:/")}
          checkedIcon={<WithACL />}
          icon={<WithoutACL />}
          defaultChecked={bagRow.value.with_acl}
          color="primary"
          title="With ACL"
          value={bagRow.value.with_acl}
          onChange={(event, with_acl) => {
            console.log(with_acl);
            bagRow.controls.with_acl.setValue(with_acl);
            bagRow.controls.with_acl.markAsDirty();
          }}
        />
        <IconButton disabled={!onMoveUp} onClick={onMoveUp}>
          <ArrowUpward />
        </IconButton>
        <IconButton disabled={!onMoveDown} onClick={onMoveDown}>
          <ArrowDownward />
        </IconButton>
        <IconButton disabled={!onRemove} onClick={onRemove} sx={{ color: theme.palette.error.main }}>
          <Remove />
        </IconButton>
      </Stack>
    </Stack>
  );
}





