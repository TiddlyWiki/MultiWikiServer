import * as opaque from "@serenity-kit/opaque";
import { useAsyncEffect } from "./useAsyncEffect";
import React, { ReactNode, useCallback, useId, useState } from "react";
import { ServerMapKeys, ServerMapRequest, ServerMapResponse, ServerMapType } from "../../../src/routes/api/_index";
import { FieldValues, useForm, UseFormRegisterReturn } from "react-hook-form";


type MapLike = { entries: () => Iterable<[string, any]> };
/** Takes an iterable of key-value pairs and makes sure the values are all strings */
export function toSearchParams(formData: MapLike | Record<string, any>): URLSearchParams {
  const entries = formData.entries ? formData.entries() : Object.entries(formData);
  const data = [...entries].filter((e, i): e is [string, string] => {
    if (typeof e[1] !== "string") throw console.error(formData);
    return true;
  });
  return new URLSearchParams(data);
}


export function fetchPostSearchParams(url: string, formData: MapLike | Record<string, any>) {
  return fetch(url, {
    method: 'POST',
    redirect: "manual",
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', "X-Requested-With": "TiddlyWiki" },
    body: toSearchParams(formData),
  });
}

export interface ChangePasswordForm {
  userId: string
  password: string
  confirmPassword: string
}

export async function changePassword(input: ChangePasswordForm) {

  const { userId, password, confirmPassword } = input;

  if (password !== confirmPassword) throw 'Passwords do not match';

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

  const register1 = await fetchPostSearchParams('/change-user-password/1', { userId, registrationRequest, });
  const registrationResponse = await register1.text();
  if (!register1.ok) throw registrationResponse;

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState, registrationResponse, password,
  });

  const register2 = await fetchPostSearchParams('/change-user-password/2', { userId, registrationRecord, });
  if (!register2.ok) throw await register2.text();

}





export function DataLoader<T, P>(
  loader: (props: P) => Promise<T>,
  useRender: (data: T, refresh: () => void, props: P) => ReactNode
) {
  return (props: P) => {
    const [refreshData, setRefreshData] = useState({});
    const [result, setResult] = useState<T | null>(null);
    const refresh = useCallback(() => setRefreshData({}), []);

    useAsyncEffect(async () => {
      setResult(await loader(props));
    }, undefined, undefined, [refreshData]);

    if (!result) return null;

    return <Render useRender={() => useRender(result, refresh, props)} />;
  }
}

export function Render({ useRender }: { useRender: () => ReactNode }) { return useRender(); }

export async function serverRequest<T extends ServerMapKeys>(key: T, data: ServerMapRequest[T]) {

  const res = await fetch(`${location.origin}/api/${key}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      "X-Requested-With": "TiddlyWiki"
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error(`Failed to fetch data for ${key}: ${await res.text()}`);
  return await res.json() as ServerMapResponse[T];
}


export const IndexJsonContext = React.createContext<Awaited<ReturnType<typeof getIndexJson>>>(null as any);

export function useIndexJson() { return React.useContext(IndexJsonContext); }


export async function getIndexJson() {
  const index = await serverRequest("IndexJson", undefined);
  const recipes = new Map();
  index.bagList.forEach(e => e.recipe_bags.forEach(f => recipes.set(f.recipe.recipe_id, f.recipe)));
  return { ...index, recipes: [...recipes.values()], }
}




export function useFormFieldHandler<T extends FieldValues>(refreshPage: () => void) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const {
    register,
    handleSubmit,
    formState,
    reset,
  } = useForm<T>();
  const { isSubmitting, isLoading } = formState;

  function handler(fn: (input: T) => Promise<void>) {
    return handleSubmit((input: T) => fn(input).then(
      e => { setSuccess(`User added`); setError(''); reset(); refreshPage(); },
      e => { setSuccess(''); setError(`${e}`); }
    ));
  }

  function footer(buttonText: string) {
    return <>
      {error && (
        <div className="mws-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="mws-success-message">
          {success}
        </div>
      )}

      <div className="mws-form-actions">
        <button type="submit"
          className="mws-btn mws-btn-primary"
          disabled={isSubmitting || isLoading}
        >
          {buttonText}
        </button>
      </div>
    </>;
  }
  return {
    register,
    /** add to the onSubmit property of form */
    handler,
    footer,
  };
}



export interface FormFieldInputProps extends UseFormRegisterReturn {
  type: "select" | React.HTMLInputTypeAttribute | undefined;
  id?: string | true;
  autoComplete?: string;
  children?: ReactNode;
  title: string;
}

export function FormFieldInput({ id, type, children, title, ...inputProps }: FormFieldInputProps) {
  if (id === true) id = useId();
  if (type === "hidden") return <input {...inputProps} type="hidden" id={id} />;
  return <div className="mws-form-group">
    <label htmlFor={id}>{title}</label>
    {type === "select"
      ? <select
        {...inputProps}
        id={id}
        className="mws-form-input"
      >{children}</select>
      : <input
        {...inputProps}
        id={id}
        type={type}
        className="mws-form-input"
      />}

  </div>
  // return <input {...props} />;
  // <div className="mws-form-group">
  //   <label htmlFor="role">Role:</label>
  //   <select id="role" name="role" defaultValue={userRole.role_id} required>
  //     {allRoles.map((role) => (
  //       <option key={role.role_id} value={role.role_id}>
  //         {role.role_name}
  //       </option>
  //     ))}
  //   </select>
  // </div>
}
