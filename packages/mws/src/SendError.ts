import { SendErrorItem } from "@tiddlywiki/server";
declare module "@tiddlywiki/server" {
  interface SendErrorReasonData {
    "RECIPE_NOT_FOUND":
    SendErrorItem<404, { recipeName: string }>;

    "RECIPE_NO_READ_PERMISSION":
    SendErrorItem<403, { recipeName: string }>;

    "RECIPE_NO_WRITE_PERMISSION":
    SendErrorItem<403, { recipeName: string }>;

    "RECIPE_MUST_HAVE_BAGS":
    SendErrorItem<400, { recipeName: string }>;

    "RECIPE_NO_BAG_AT_POSITION_ZERO":
    SendErrorItem<403, { recipeName: string }>;

    "BAG_NOT_FOUND":
    SendErrorItem<404, { bagName: string }>;

    "BAG_NO_READ_PERMISSION":
    SendErrorItem<403, { bagName: string }>;

    "BAG_NO_WRITE_PERMISSION":
    SendErrorItem<403, { bagName: string }>;

    "BAG_DOES_NOT_HAVE_THIS_TIDDLER":
    SendErrorItem<403, { bagName: string, tiddlerTitle: string }>;

    "PAGE_NOT_AUTHORIZED_FOR_ENDPOINT":
    SendErrorItem<403, null>;

    "RESPONSE_INTERCEPTED_BY_CHECKER":
    SendErrorItem<500, null>;

    "TIDDLER_WIRE_FORMAT_UNKNOWN":
    SendErrorItem<403, { contentType: string }>;

    "SETTING_KEY_INVALID":
    SendErrorItem<403, { key: string }>;

    "LAST_EVENT_ID_NOT_PROVIDED":
    SendErrorItem<403, null>;

    "INCORRECT_SERVER_RESPONSE_SENT":
    SendErrorItem<500, { instead: any }>
  }
}