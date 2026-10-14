import { DataStore, IdString, WritablePrefixRow } from "@/server";
import { FormArray, FormControl, FormGroup } from "./app-forms";


type Wiki = DataStore["wikis"][number];
type Template = DataStore["templates"][number];
type Bag = DataStore["bags"][number];
type User = DataStore["users"][number];
type Role = DataStore["roles"][number];
type BagPermission = Bag["bagPermissions"][number];

export function permissionControl(
  row: BagPermission = { role: "", level: "A_read" },
): FormGroup<BagPermission> {
  return new FormGroup({
    role: new FormControl(row.role),
    level: new FormControl(row.level),
  });
}

export function prefixControl(
  row: WritablePrefixRow = { prefix: "", bagName: "" },
): FormGroup<WritablePrefixRow> {
  return new FormGroup({
    prefix: new FormControl(row.prefix),
    bagName: new FormControl(row.bagName),
  });
}

function stringControls(values: readonly string[] = []): FormArray<string> {
  return new FormArray(values.map((value) => new FormControl(value)));
}

export function createWikiForm(value: DataStore["wikis"][number], mode: "create" | "edit") {
  const form = new FormGroup<any>({
    id: new FormControl(value.id ?? new IdString("")),
    slug: new FormControl(value.slug ?? ""),
    displayName: new FormControl(value.displayName ?? ""),
    description: new FormControl(value.description ?? ""),
    templateName: new FormControl(value.templateName ?? ""),
    writablePrefixBags: new FormArray<WritablePrefixRow>(
      (value.writablePrefixBags ?? []).map(prefixControl)),
    readonlyBags: stringControls(value.readonlyBags),
    plugins: stringControls(value.plugins),
    recipeUsers: stringControls(value.recipeUsers),
    recipeAdmins: stringControls(value.recipeAdmins),
  });
  if (mode === "edit") form.controls.templateName.disable(false);
  return form;
}



export function createTemplateForm(value: DataStore["templates"][number]) {
  return new FormGroup<any>({
    id: new FormControl(value.id ?? new IdString("")),
    type: new FormControl(value.type ?? "simpleV1"),
    name: new FormControl(value.name ?? ""),
    description: new FormControl(value.description ?? ""),
    twVersion: new FormControl(value.twVersion ?? ""),
    writablePrefixBags: new FormArray<WritablePrefixRow>(
      (value.writablePrefixBags ?? []).map(prefixControl)),
    readonlyBags: stringControls(value.readonlyBags),
    plugins: stringControls(value.plugins),
    requiredPluginsEnabled: new FormControl(value.requiredPluginsEnabled ?? true),
    externalPlugins: new FormControl(value.externalPlugins ?? false),
    externalStore: new FormControl(value.externalStore ?? false),
    templateUsers: stringControls(value.templateUsers),
    templateAdmins: stringControls(value.templateAdmins),
    customHtmlEnabled: new FormControl(value.customHtmlEnabled ?? false),
    htmlContent: new FormControl(value.htmlContent ?? ""),
    injectionFunction: new FormControl(
      value.injectionFunction ?? "$tw.preloadTiddlers"),
    injectionLocation: new FormControl(value.injectionLocation ?? ""),
  });
}




export function createBagForm(value: DataStore["bags"][number]) {
  return new FormGroup<any>({
    id: new FormControl(value.id ?? new IdString("")),
    name: new FormControl(value.name ?? ""),
    description: new FormControl(value.description ?? ""),
    bagPermissions: new FormArray<BagPermission>(
      (value.bagPermissions ?? []).map(permissionControl)),
  });
}




export function createRoleForm(value: DataStore["roles"][number]) {
  return new FormGroup<any>({
    id: new FormControl(value.id ?? new IdString("")),
    name: new FormControl(value.name ?? ""),
    description: new FormControl(value.description ?? ""),
  });
}


export function createUserForm(value: DataStore["users"][number]) {
  return new FormGroup<any>({
    id: new FormControl(value.id ?? new IdString("")),
    username: new FormControl(value.username ?? ""),
    email: new FormControl(value.email ?? ""),
    userRoles: stringControls(value.userRoles),
    resetCode: new FormControl(value.resetCode ?? ""),
  });
}
