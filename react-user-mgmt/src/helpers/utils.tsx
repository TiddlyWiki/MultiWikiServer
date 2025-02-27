

export function formDataToSearchParams(formData: FormData): URLSearchParams {
  const data = [...formData.entries()].filter((e): e is [string, string] => {
    if (typeof e[1] !== "string") throw new Error("Invalid form data"); 
    return true;
  });
  return new URLSearchParams(data);
}