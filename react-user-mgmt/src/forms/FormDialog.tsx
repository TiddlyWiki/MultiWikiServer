import { createContext, useContext, useCallback, useMemo, useState, PropsWithChildren, ReactNode } from "react";
import * as forms from "angular-forms-only";
import { ButtonAwait, UseIndexJson, useIndexJson } from "../helpers";
import { useObservable } from "../helpers";
import { Alert, Autocomplete, Button, Dialog, DialogContent, DialogProps, DialogTitle, Stack, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";


const FormDialogFormContext = createContext<FormDialogContextType<any, any>>(null as never);

export interface FormDialogContextType<
  T extends {}, F extends forms.AbstractControl
> extends FormDialogProps<T, F, any> {
  /** 
   * The parent FormDialog component subscribes to status and value changes, 
   * so only memoed components need to subscribe. 
   */
  form: F;
  indexJson: UseIndexJson;
  value: T | null;
  /** Calling this calls the create function to get a new form */
  onReset: () => void;
};

export interface FormDialogProps<
  T extends {},
  F extends forms.AbstractControl,
  A extends any[]
> {
  args: A;
  value: T | null | undefined;
  /** If the form is clean, clicking the dialog background will call onClose. */
  onClose: () => void;
  update: React.Dispatch<React.SetStateAction<T | null | undefined>>;
}

export function useFormDialogForm<T extends {}, F extends forms.AbstractControl>() {
  return useContext(FormDialogFormContext) as FormDialogContextType<T, F>;
}

export interface CreateFormDialog<T extends {}, F extends forms.AbstractControl<any>, A extends any[]> {
  title?: string;
  maxWidth?: DialogProps["maxWidth"];
  blockMode?: boolean;
  /** 
   * The function which creates the initial form.
   */
  create: (value: T | null) => F;
  /** The render function, essentially the body of a function component. It may use hooks. */
  render: (ctx: FormDialogContextType<T, F>, ...args: A) => React.ReactNode;

}
export function createDialogForm<
  T extends {},
  F extends forms.AbstractControl<any>,
  A extends any[]
>(options: CreateFormDialog<T, F, A>) {
  return (...args: A) => {
    const [value, update] = useState<T | null | undefined>(options.blockMode ? null : undefined);

    const onClose = useCallback(() => { update(undefined); }, []);

    return [(
      <FormDialog<T, F, A> {...options} {...{ value, onClose, args, update,  }} />
    ), update] as const;
  };
}

interface FormDialogPropsFinal<T extends {}, F extends forms.AbstractControl, A extends any[]>
  extends FormDialogProps<T, F, A>, CreateFormDialog<T, F, A> { }

export function FormDialog<T extends {}, F extends forms.AbstractControl, A extends any[]>({
  title,
  maxWidth,
  onClose,
  create,
  render,
  value,
  args,
  update,
  blockMode,
}: FormDialogPropsFinal<T, F, A>) {

  const [token, setToken] = useState<object>({});
  const onReset = useCallback(() => { setToken({}); }, []);

  const form = useMemo(() => value === undefined ? null : create(value), [value, token, create]);

  useObservable(form?.valueChanges);
  useObservable(form?.statusChanges);

  const indexJson = useIndexJson();

  const children = <FormDialogFormContext.Provider value={{
    form, value, onClose, onReset, update, indexJson, args
  }}>
    <Stack
      component="div" spacing={4} paddingBlockStart={2}
      direction="column" justifyContent="flex-start" alignItems="stretch"
    >
      {form && <DialogFormChildren render={ctx => render(ctx, ...args)} />}
    </Stack>
  </FormDialogFormContext.Provider>;

  return blockMode ? children : (
    <Dialog open={!!form} onClose={() => {
      if (!form?.dirty) onClose()
    }} maxWidth={maxWidth ?? "sm"} fullWidth>
      {title !== undefined && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );

}


function DialogFormChildren({ render }: { render: (ctx: FormDialogContextType<any, any>) => React.ReactNode }) {
  return render(useFormDialogForm());
}


export function FormDialogSubmitButton({ submitLabel, onSubmit, closeOnDiscard, hideClose, hideDiscard, hideSave }: {
  /** 
   * A function which returns a string for the success message, or throws an error.
   * 
   * Uses error directly if it is a string, or error.message if available, or `${error}`.
   */
  onSubmit: () => Promise<string>;
  submitLabel?: string;
  closeOnDiscard?: boolean;
  /** Hides the dialog controls */
  hideSave?: boolean;
  hideDiscard?: boolean;
  hideClose?: boolean;
}) {
  const { form, onClose, onReset } = useFormDialogForm();
  useObservable(form.events);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean, message: string } | null>(null);
  const onDiscard = useCallback(() => {
    closeOnDiscard ? onClose() : onReset();
  }, [closeOnDiscard, onClose, form]);
  return <>
    {submitResult && submitResult.ok === false && <Alert severity='error'>{submitResult.message}</Alert>}
    {submitResult && submitResult.ok === true && <Alert severity='success'>{submitResult.message}</Alert>}
    <Stack direction="row-reverse" spacing={2}>
      {!hideSave && (form.dirty || hideClose) && <ButtonAwait
        disabled={form.invalid || form.disabled || !form.dirty}
        variant="contained"
        onClick={async () => {
          setSubmitResult(null);
          const submitResult = await onSubmit().then(
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
        }}>{submitLabel || "Save"}</ButtonAwait>}
      {!hideDiscard && form.dirty && <Button disabled={form.disabled} onClick={onDiscard}>Discard</Button>}
      {!hideClose && !form.dirty && <Button onClick={() => onClose()}>Close</Button>}
    </Stack>

  </>
}