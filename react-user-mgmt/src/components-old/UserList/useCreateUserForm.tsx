import * as forms from "angular-forms-only";
import { serverRequest, SelectField, ok, createNewPassword } from "../../helpers";
import { FormDialogSubmitButton, FormTextField, createDialogForm } from "../../forms";

/* <JsonFormSimple
  required={['username', 'email', 'password', 'confirmPassword']}
  properties={{
    username: { type: 'string', title: 'Username' },
    email: { type: 'string', title: 'Email', "ui:inputType": "email" },
    password: { type: 'string', title: 'Password', 'ui:widget': 'password' },
    confirmPassword: { type: 'string', title: 'Confirm Password', 'ui:widget': 'password' }
  }}
  value={value}
  onChange={onChange}
  onSubmit={async (data, event) => {
    const result = await addNewUser(data.formData);
    props.refreshPage();
    return result;
  }}
/> */

const slotProps = {
  htmlInput: {
    autoCorrect: "off",
    autoCapitalize: "none",
    spellCheck: "false",
    // data attributes to prevent browser from autofilling
    // just try everything copilot gives me
    "data-lpignore": "true",
    "data-autofill": "false",
    "data-autocomplete": "off",
    "data-autocorrect": "off",
    "data-autocapitalize": "none",
    "data-spellcheck": "false",
    "data-gramm": "false",
  }
}

export const useCreateUserForm = createDialogForm({
  blockMode: true,
  create: () => new forms.FormGroup({
    username: new forms.FormControl<string>("", {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.minLength(3)],
    }),
    email: new forms.FormControl<string>("", {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.email],
    }),
    role_ids: new forms.FormControl<string[]>([], {
      nonNullable: true,
    }),
    password: new forms.FormControl<string>("", {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.minLength(4)],
    }),
    confirmPassword: new forms.FormControl<string>("", {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.minLength(4)],
    }),
  }),
  render: ({ form, indexJson: [indexJson, refreshIndex], onReset }, refreshUsers: () => void) => {
    return <>
      <FormTextField
        key="username"
        control={form.controls.username}
        label="Username"
        required
        slotProps={slotProps}
      />
      <FormTextField
        key="email"
        control={form.controls.email}
        label="Email"
        type="email"
        required
        slotProps={slotProps}
      />
      <SelectField
        title="Roles"
        multiple
        control={form.controls.role_ids}
        options={indexJson.roleList.map(e => ({ value: e.role_id, label: e.role_name }))}
      />
      <FormTextField
        key="password"
        control={form.controls.password}
        label="Password"
        type="password"
        required
        slotProps={slotProps}
      />
      <FormTextField
        key="confirmPassword"
        control={form.controls.confirmPassword}
        label="Confirm Password"
        type="password"
        required
        slotProps={slotProps}
      />
      <FormDialogSubmitButton
        key="submit"
        hideClose
        onSubmit={async () => {

          const { username, email, role_ids, password, confirmPassword } = form.value;

          ok(username, "Username is required.");
          ok(email, "Email is required.");
          ok(role_ids?.length, "Role is required.");
          ok(password, "Password is required.");
          ok(confirmPassword, "Confirm Password is required.");

          if (password !== confirmPassword) throw 'Passwords do not match';

          const { user_id } = await serverRequest.user_create({ username, email, role_ids })

          await createNewPassword({ user_id, password });

          onReset();
          refreshUsers();
          refreshIndex();

          return "User added successfully";
        }}
      />
    </>
  }
});