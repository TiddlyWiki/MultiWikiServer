import * as opaque from "@serenity-kit/opaque";
import { useAsyncEffect } from "./useAsyncEffect";
import React, { ReactNode, useCallback, useId, useMemo, useState } from "react";
import { FieldValues, useForm, UseFormRegisterReturn } from "react-hook-form";
import type { RecipeManagerMap } from "@tiddlywiki/mws/src/managers/admin-recipes.ts";
import type { UserManagerMap } from "@tiddlywiki/mws/src/managers/admin-users.ts";
import type { StatusManagerMap } from "@tiddlywiki/mws/src/managers/index.ts";
import { Button, ButtonProps } from "@mui/material";
import { SessionManagerMap } from "@tiddlywiki/mws/src/services/sessions";
import { SettingsManagerMap } from "@tiddlywiki/mws/src/managers/admin-settings";


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

export function DataLoader<T, P>(
  loader: (props: P) => Promise<T>,
  useRender: (data: T, refresh: Refresher<T>, props: P) => ReactNode
) {
  return (props: P) => {

    const [refreshData, setRefreshData] = useState(new PromiseSubject<T>());
    const [result, setResult] = useState<T | null>(null);

    const refresh = useCallback(() => {
      const promise = new PromiseSubject<T>();
      setRefreshData(promise);
      return promise.promise;
    }, []);

    useAsyncEffect(async () => {
      const result = await loader(props);
      setResult(result);
      refreshData.resolve(result);
    }, undefined, undefined, [refreshData]);

    if (!result) return null;

    return <Render useRender={() => useRender(result, refresh, props)} />;

  }
}

export interface Refresher<T> {
  (): Promise<T>;
  // promise: Promise<T>;
}

export type DataLoaderContext<T> = [T, Refresher<T>];

export class PromiseSubject<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
export function Render({ useRender }: { useRender: () => ReactNode }) { return useRender(); }

export type UseIndexJson = DataLoaderContext<ART<typeof getIndexJson>>;

export const IndexJsonContext = React.createContext<UseIndexJson>(null as any);

export function useIndexJson() { return React.useContext(IndexJsonContext); }

export type IndexJson = ART<typeof getIndexJson>;



declare global {
  // see packages/mws/services/setupDevServer.ts
  const pathPrefix: string;
}
type t = StatusManagerMap["index_json"]

function postManager<K extends keyof StatusManagerMap>(key: K): StatusManagerMap[K]
function postManager<K extends keyof RecipeManagerMap>(key: K): RecipeManagerMap[K]
function postManager<K extends keyof UserManagerMap>(key: K): UserManagerMap[K]
function postManager<K extends keyof SettingsManagerMap>(key: K): SettingsManagerMap[K]
function postManager(key: string) {
  return async (data: any) => {
    const req = await fetch(pathPrefix + "/admin/" + key, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "X-Requested-With": "TiddlyWiki"
      },
      body: JSON.stringify(data),
    });
    if (!req.ok) throw new Error(`Failed to fetch data for /admin/${key}: ${await req.text()}`);
    return await req.json();
  };

}

interface ManagerMap extends RecipeManagerMap, UserManagerMap, StatusManagerMap, SettingsManagerMap {
  // prisma: typeof proxy;
}


export const serverRequest: ManagerMap = {
  index_json: postManager("index_json"),

  user_edit_data: postManager("user_edit_data"),
  user_list: postManager("user_list"),
  user_create: postManager("user_create"),
  user_delete: postManager("user_delete"),
  user_update: postManager("user_update"),
  user_update_password: postManager("user_update_password"),

  recipe_create_or_update: postManager("recipe_create_or_update"),
  recipe_delete: postManager("recipe_delete"),
  recipe_acl_update: postManager("recipe_acl_update"),

  bag_create_or_update: postManager("bag_create_or_update"),
  bag_delete: postManager("bag_delete"),
  bag_acl_update: postManager("bag_acl_update"),

  role_create: postManager("role_create"),
  role_update: postManager("role_update"),
  // role_delete: postManager("role_delete"),

  settings_read: postManager("settings_read"),
  settings_update: postManager("settings_update"),

  // prisma: proxy,
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
  const getBag = (bagId: string) => bagMap.get(bagId as any);
  const getBagName = (bagId: string) => bagMap.get(bagId as any)?.bag_name;
  const getBagDesc = (bagId: string) => bagMap.get(bagId as any)?.description;

  return {
    ...res,
    bagMap,
    recipeMap,
    hasBagAclAccess,
    getBag,
    getBagName,
    getBagDesc,
    // getBagOwnerName,
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

export interface ButtonAwaitProps extends ButtonProps {
  onClick: (event: Parameters<ButtonProps["onClick"] & {}>[0]) => Promise<void>
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function ButtonAwait({ onClick, loading: propsLoading, ...props }: ButtonAwaitProps) {
  const [isLoading, setIsLoading] = useState(false);
  return <Button
    ref={props.buttonRef}
    loading={isLoading || propsLoading}
    onClick={(event) => {
      setIsLoading(true);
      onClick?.(event).finally(() => {
        setIsLoading(false);
      });
    }}
    {...props}
  />
}

export function ok<T>(value: T | null | undefined | "" | 0 | false, message?: string): asserts value is T {
  if (!value) throw new Error(message ?? `AssertionError: ${value}`);
}


export function truthy<T>(
  obj: T
): obj is Exclude<T, false | null | undefined | 0 | '' | void> {
  return !!obj;
}
