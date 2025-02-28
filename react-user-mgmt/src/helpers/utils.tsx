import * as opaque from "@serenity-kit/opaque";

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


export const changePassword = async (userId: string, password: string) => {

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

  const register1 = await fetchPostSearchParams('/change-user-password/1', { userId, registrationRequest, });
  const registrationResponse = await register1.text();
  if (!register1.ok) throw registrationResponse;

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState, registrationResponse, password,
  });

  const register2 = await fetchPostSearchParams('/change-user-password/2', { userId, registrationRecord, });
  if (!register2.ok) throw await register2.text();

};
