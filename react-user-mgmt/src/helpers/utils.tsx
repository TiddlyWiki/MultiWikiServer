
type MapLike = { entries: () => Iterable<[string, any]> };
/** Takes an iterable of key-value pairs and makes sure the values are all strings */
export function toSearchParams(formData: MapLike | Record<string, any>): URLSearchParams {
  const entries = formData.entries ? formData.entries() : Object.entries(formData);
  const data = [...entries].filter((e): e is [string, string] => {
    if (typeof e[1] !== "string") throw new Error("Invalid form data");
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