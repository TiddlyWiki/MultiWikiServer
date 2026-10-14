import { SendError } from "@/server";

export class IdString extends String {
  static cast(val: IdString): string { return val.toString(); }
  static prefix = "IdString____";
  name = "IdString" as const;
  constructor(value: string) { super(value); }
  toJSON() { return IdString.prefix + this.valueOf(); }
}

declare module "@tiddlywiki/server" {
  namespace SendError {
    function errorString(error: unknown): string;
  }
}

SendError.errorString = (error: unknown) => {
  return error instanceof SendError ? (
    error.reason === "INVALID_REQUEST_BODY"
    || error.reason === "INVALID_REQUEST_QUERY"
    || error.reason === "INVALID_REQUEST_PATH"
  ) ? error.details.prettyErrors
    : error.reason
    : error instanceof Error
      ? error.message
      : String(error);
}