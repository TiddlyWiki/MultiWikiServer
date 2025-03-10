import * as opaque from "@serenity-kit/opaque";
import { useAsyncEffect } from "./useAsyncEffect";
import React, { ReactNode, useCallback, useId, useState } from "react";
import { FieldValues, useForm, UseFormRegisterReturn } from "react-hook-form";
import { RecipeManager, RecipeManagerMap } from "../../../src/routes/manager-recipes";
import { UserManagerMap } from "../../../src/routes";
import { proxy } from "./prisma-proxy";
import { ZodAction } from "../../../src/routes/BaseManager";
import { z } from "zod";


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
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "X-Requested-With": "TiddlyWiki"
    },
    body: toSearchParams(formData),
  });
}
export function fetchPostJSON(url: string, formData: any) {
  return fetch(url, {
    method: 'POST',
    redirect: "manual",
    headers: {
      'Content-Type': 'application/json',
      "X-Requested-With": "TiddlyWiki"
    },
    body: JSON.stringify(formData),
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

  const registrationResponse = await serverRequest.user_update_password({ user_id: +userId, registrationRequest });

  if (!registrationResponse) throw 'Failed to update password'; // wierd, but shouldn't happen

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState, registrationResponse, password,
  });

  await serverRequest.user_update_password({ user_id: +userId, registrationRecord });

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

// export async function serverRequest<T extends ServerMapKeys>(key: T, data: ServerMapRequest[T]) {

//   const res = await fetch(`${location.origin}/api/${key}`, {
//     method: "POST",
//     headers: {
//       'Content-Type': 'application/json',
//       "X-Requested-With": "TiddlyWiki"
//     },
//     body: data !== undefined ? JSON.stringify(data) : undefined,
//   });
//   if (!res.ok) throw new Error(`Failed to fetch data for ${key}: ${await res.text()}`);
//   return await res.json() as ServerMapResponse[T];
// }
// export const serverRequest = new ServerRequests();

export const IndexJsonContext = React.createContext<[Awaited<ReturnType<typeof getIndexJson>>, () => void]>(null as any);

export function useIndexJson() { return React.useContext(IndexJsonContext); }

type PART<T extends (...args: any) => any> = Promise<Awaited<ReturnType<T>>>;

type Handler<T extends Record<string, ZodAction<any, any>>, K extends keyof T> =
  ((data: Parameters<z.input<ReturnType<T[K]["zodRequest"]>>>) => PART<z.output<ReturnType<T[K]["zodResponse"]>>>) & { zodRequest: any; zodResponse: any; };

function postManager<K extends keyof RecipeManagerMap>(key: K): RecipeManagerMap[K]
function postManager<K extends keyof UserManagerMap>(key: K): UserManagerMap[K]
function postManager(key: string) {
  return async (data: any) => {
    const req = await fetch("/manager/" + key, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "X-Requested-With": "TiddlyWiki"
      },
      body: JSON.stringify(data),
    });
    if (!req.ok) throw new Error(`Failed to fetch data for /manager/${key}: ${await req.text()}`);
    return await req.json();
  };

}

interface ManagerMap extends RecipeManagerMap, UserManagerMap {
  prisma: typeof proxy;
}


export const serverRequest: ManagerMap = {

  user_list: postManager("user_list"),
  user_create: postManager("user_create"),
  user_delete: postManager("user_delete"),
  user_update: postManager("user_update"),
  user_update_password: postManager("user_update_password"),

  index_json: postManager("index_json"),
  recipe_create: postManager("recipe_create"),
  bag_create: postManager("bag_create"),

  prisma: proxy,
}


export async function getIndexJson() {
  const res = await serverRequest.index_json(undefined);

  const bagMap = new Map(res.bagList.map(bag => [bag.bag_id, bag]));
  const recipeMap = new Map(res.recipeList.map(recipe => [recipe.recipe_id, recipe]));
  const hasRecipeAclAccess = (recipe: typeof res.recipeList[number]) => {
    if (res.isAdmin) return true;
    if (res.user_id && recipe.owner_id === res.user_id) return true;
    return recipe.recipe_bags.some(recipeBag => bagMap.get(recipeBag.bag_id)?._count.acl);
  }
  const hasBagAclAccess = (bag: typeof res.bagList[number]) => {
    if (res.isAdmin) return true;
    if (res.user_id && bag.owner_id === res.user_id) return true;
    if (bag._count.acl) return true;
    return true;
  }

  const getBagName = (bagId: number) => bagMap.get(bagId as any)?.bag_name;

  return {
    ...res,
    bagMap,
    recipeMap,
    hasBagAclAccess,
    getBagName,
    hasRecipeAclAccess,
  }
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

  function handler(fn: (input: T) => Promise<string>) {
    return handleSubmit((input: T) => fn(input).then(
      e => { setSuccess(e); setError(''); reset(); refreshPage(); },
      e => { console.log(e); setSuccess(''); setError(`${e}`); }
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
