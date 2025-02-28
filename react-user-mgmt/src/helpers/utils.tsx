import * as opaque from "@serenity-kit/opaque";
import { useAsyncEffect } from "./useAsyncEffect";
import { ReactNode, useCallback, useState } from "react";

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



export interface CreateUserForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export async function addNewUser(input: CreateUserForm) {

  const { username, email, password, confirmPassword } = input;

  if (password !== confirmPassword) throw 'Passwords do not match';

  const createUser = await fetchPostSearchParams('/admin/post-user', { username, email });

  if (!createUser.ok) throw await createUser.text() || 'Failed to add user'

  const userId = (await createUser.json()).userId.toString();

  await changePassword({ userId, password, confirmPassword });

}



export function DataLoader<T, P>(
  loader: () => Promise<T>,
  useRender: (data: T, refresh: () => void, props: P) => ReactNode
) {
  return (props: P) => {
    const [refreshData, setRefreshData] = useState({});
    const [result, setResult] = useState<T | null>(null);
    const refresh = useCallback(() => setRefreshData({}), []);

    useAsyncEffect(async () => {
      setResult(await loader());
    }, undefined, undefined, [refreshData]);

    if (!result) return null;

    return <Render useRender={() => useRender(result, refresh, props)} />;
  }
}

export function Render({ useRender }: { useRender: () => ReactNode }) { return useRender(); }