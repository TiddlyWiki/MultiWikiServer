import * as forms from "angular-forms-only";
import { ok, loginWithOpaque, ButtonAwait } from "../../helpers";
import { FormTextField, createDialogForm } from "../../forms";
import { useRef, useState } from "react";
import { Alert } from "@mui/material";


/* <JsonFormSimple
  required={["username", "password"]}
  properties={{
    returnUrl: { type: "string", default: "/dashboard", "ui:widget": "hidden" },
    username: { type: "string", title: "Username" },
    password: { type: "string", title: "Password", "ui:widget": "password" }
  }}
  onSubmit={async (data, event) => {
    await handleSubmit(data.formData);
    return "";
  }}
  value={value}
  onChange={onChange}
/> */

export const useLoginForm = createDialogForm({
  blockMode: true,
  create: (value: {} | null) => new forms.FormGroup({
    username: new forms.FormControl<string>("", {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.minLength(3)],
    }),
    password: new forms.FormControl<string>("", {
      nonNullable: true,
      validators: [forms.Validators.required, forms.Validators.minLength(4)],
    }),
  }),
  render: ({ form }) => {
    const [submitResult, setSubmitResult] = useState<{ ok: boolean, message: string } | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    return <>
      <FormTextField
        key="username"
        control={form.controls.username}
        label="Username"
        required
      />
      <FormTextField
        key="password"
        control={form.controls.password}
        label="Password"
        type="password"
        required
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
          }
        }}
      />
      {submitResult && submitResult.ok === false && <Alert severity='error'>{submitResult.message}</Alert>}
      {submitResult && submitResult.ok === true && <Alert severity='success'>{submitResult.message}</Alert>}
      {<ButtonAwait
        buttonRef={buttonRef}
        disabled={form.invalid || form.disabled || !form.dirty}
        variant="contained"
        onClick={async () => {
          const { username, password } = form.value;
          ok(username, "Username is required.");
          ok(password, "Password is required.");
          setSubmitResult(null);
          const submitResult = await loginWithOpaque(username, password, true).then(e => {
            const returnUrl = new URLSearchParams(location.search).get('returnUrl');
            location.href = returnUrl || `${pathPrefix}/`;
            return new Promise<string>(() => { });
          }, e => {
            throw `${e}`;
          }).then(
            message => ({ ok: true, message }),
            error => {
              console.error(error);
              return {
                ok: false,
                message: typeof error === "string" ? error : `${error?.message ?? error}`
              }
            }
          );
          setSubmitResult(submitResult);
        }}
      >Login</ButtonAwait>}
    </>
  }
}

);