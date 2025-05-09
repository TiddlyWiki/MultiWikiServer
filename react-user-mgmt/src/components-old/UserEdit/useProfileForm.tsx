import * as forms from "angular-forms-only";
import { serverRequest, SelectField } from "../../helpers";
import { FormDialogSubmitButton, FormTextField, createDialogForm } from "../../forms";
import { useEffect } from "react";

type EditUser = ART<typeof serverRequest.user_edit_data>;
type User = EditUser["user"];


export const useProfileForm = createDialogForm({
  blockMode: true,
  create: (value: Partial<User> | null) => new forms.FormGroup({
    userId: new forms.FormControl<string | null>(value?.user_id ?? null),
    username: new forms.FormControl<string>(value?.username ?? "" as string, {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.minLength(3)],
    }),
    email: new forms.FormControl<string>(value?.email ?? "" as string, {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.email],
    }),
    role_ids: new forms.FormControl<string[]>(value?.roles?.map(e => e.role_id) ?? [], {
      nonNullable: true,
    }),
  }),
  render: ({ form, onReset: onRefresh, value, update }, allRoles: EditUser["allRoles"], user: User, refresh: () => void) => {
    if (!allRoles || !user) return null;
    useEffect(() => { if (value !== user) update(user); }, [user, value, update]);
    return <>
      <FormTextField
        key="username"
        control={form.controls.username}
        label="Username"
        required
      />
      <FormTextField
        key="email"
        control={form.controls.email}
        label="Email"
        type="email"
        required
      />
      <SelectField
        title="Roles"
        multiple
        control={form.controls.role_ids}
        options={allRoles.map(e => ({ value: e.role_id, label: e.role_name }))}
      />
      <FormDialogSubmitButton
        key="submit"
        hideClose
        onSubmit={async () => {
          const { email, role_ids, userId, username } = form.value;

          if (!userId) throw "User ID is required.";
          if (!username || !email) throw "All fields are required.";
          if (username.length < 3) throw "Username must be at least 3 characters long.";
          if (!role_ids?.length) throw "Role is required.";

          return await serverRequest.user_update({
            user_id: userId,
            username,
            email,
            role_ids,
          }).then(async () => {
            refresh();
            return "User updated successfully.";
          }).catch(e => {
            throw `${e}`;
          });
        }}
      />
    </>
  }
});

