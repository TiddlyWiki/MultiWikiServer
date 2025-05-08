import * as forms from "angular-forms-only";
import { FormTextField, createDialogForm, useFormDialogForm } from "../../forms";
import { ButtonAwait, changeExistingPassword, changeExistingPasswordAdmin, serverRequest, useObservable } from "../../helpers";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Stack } from "@mui/material";



type User = ART<typeof serverRequest.user_edit_data>["user"] | null;

export const usePasswordForm = createDialogForm({
  blockMode: true,
  title: "Change Password",
  maxWidth: "xs",
  create: (user: ART<typeof serverRequest.user_edit_data>["user"] | null) => {
    const form = new forms.FormGroup({
      username: new forms.FormControl<string>(user?.username ?? "", {
        nonNullable: true,
        validators: [forms.Validators.required, forms.Validators.minLength(3), control => {
          if (control.disabled) return null;
          if (user && control.value !== user.username) return { mismatch: true };
          return null;
        }],
      }),
      password: new forms.FormControl<string>("", {
        nonNullable: true,
        validators: [forms.Validators.required, forms.Validators.minLength(4)],
      }),
      newPassword: new forms.FormControl<string>("", {
        nonNullable: true,
        validators: [forms.Validators.required, forms.Validators.minLength(4)],
      }),
      confirmPassword: new forms.FormControl<string>("", {
        nonNullable: true,
        validators: [forms.Validators.required, forms.Validators.minLength(4)],
      }),
    });
    form.controls.confirmPassword.addValidators([control => {
      if (form.controls.newPassword.value !== control.value) return { mismatch: true };
      return null;
    }]);
    form.updateValueAndValidity();
    return form;
  }, render: ({ form, indexJson: [indexJson], value, update }, user: User) => {
    useEffect(() => { if (value !== user) update(user); }, [user, value, update]);

    const mismatch = form.controls.confirmPassword.dirty
      && form.controls.newPassword.value !== form.controls.confirmPassword.value;



    const [complete, setComplete] = useState(false);

    useEffect(() => {
      if (indexJson.isAdmin) {
        form.controls.username.disable();
        form.controls.password.disable();
      }
    }, [form]);

    return <>
      {(complete || value === null) ? null : indexJson.user_id === value.user_id ? <>
        <FormTextField
          key="username"
          control={form.controls.username}
          label="Username"
          name="username"
          required
          autoComplete="username"
          helperText={form.controls.username.value !== indexJson.username
            ? "Please enter your current username." : undefined}
          error={form.controls.username.value !== indexJson.username}
        />
        <FormTextField
          key="password"
          control={form.controls.password}
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <FormTextField
          key="password"
          control={form.controls.newPassword}
          label="Password"
          name="newPassword"
          type="password"
          required
          autoCapitalize="suggest-password"
        />
        <FormTextField
          key="confirmPassword"
          control={form.controls.confirmPassword}
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          required
          autoComplete="suggest-password"
          error={mismatch}
          helperText={mismatch ? "Passwords do not match." : undefined}
        />
      </> : indexJson.isAdmin ? <>
        <FormTextField
          key="password"
          control={form.controls.newPassword}
          label="Password"
          type="password"
          name="newPassword"
          required
          slotProps={slotProps}
          autoCapitalize="suggest-password"
        />
        <FormTextField
          key="confirmPassword"
          control={form.controls.confirmPassword}
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          required
          slotProps={slotProps}
          autoComplete="suggest-password"
          error={mismatch}
          helperText={mismatch ? "Passwords do not match." : undefined}
        />
      </> : null}

      <PasswordChangeSubmitButton {...{ complete, setComplete, user_id: user?.user_id }} />
    </>;
  }
});



export function PasswordChangeSubmitButton({ complete, setComplete, user_id }: {
  complete: boolean,
  setComplete: (complete: boolean) => void,
  user_id?: string;
}) {
  const { form, onClose, onReset, indexJson: [indexJson] } = useFormDialogForm();
  useObservable(form.events);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean, message: string } | null>(null);

  return <>
    {submitResult && submitResult.ok === false && <Alert severity='error'>{submitResult.message}</Alert>}
    {submitResult && submitResult.ok === true && <Alert severity='success'>{submitResult.message}</Alert>}
    <Stack direction="row-reverse" spacing={2}>
      <ButtonAwait
        disabled={form.invalid || form.disabled || !form.dirty || complete}
        variant="contained"
        onClick={async () => {
          setSubmitResult(null);
          const { username, password, newPassword, confirmPassword } = form.value;
          if (!indexJson.isAdmin) {
            if (!username || !password || !confirmPassword || !newPassword) throw "All fields are required.";
          } else {
            if (!confirmPassword || !newPassword) throw "All fields are required.";
          }
          if (newPassword !== confirmPassword) throw "Passwords do not match.";
          console.log(user_id, form.value);
          if (!user_id) throw "Internal Error: USER_ID";

          const submitResult = await (
            indexJson.isAdmin
              ? changeExistingPasswordAdmin({ user_id, newPassword })
              : changeExistingPassword({ username, password, newPassword })
          ).then(() => {
            setComplete(true);
            return "Password successfully changed.";
          }).catch(e => {
            console.log(e);
            throw `${e}`;
          }).then(
            message => ({ ok: true, message }),
            error => {
              console.error(error);
              return { ok: false, message: typeof error === "string" ? error : `${error?.message ?? error}` }
            }
          );
          setComplete(true);
          setSubmitResult(submitResult);
        }}>Save</ButtonAwait>
      {/* <Button disabled={form.disabled} onClick={onClose}>{complete ? "Close" : "Cancel"}</Button> */}
    </Stack>

  </>
}


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