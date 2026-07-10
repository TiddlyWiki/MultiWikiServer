import { TabId } from "@mws/admin-vanilla/src/definition/tabs";
import { serverEvents } from "@tiddlywiki/events";
import { SendError, SendErrorItem } from "@tiddlywiki/server";
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
    SendErrorItem<500, { found: any }>

    "INSTANCE_NOT_FOUND":
    SendErrorItem<404, { recipeID: string }>;

    "INSTANCE_NO_READ_PERMISSION":
    SendErrorItem<403, { recipeID: string }>;

    "INSTANCE_NO_WRITE_PERMISSION":
    SendErrorItem<403, { recipeID: string }>;

    "INSTANCE_NOT_WRITABLE":
    SendErrorItem<403, { recipeID: string }>;

    "WRITE_NOT_PERMITTED":
    SendErrorItem<403, { recipe_id: string, title: string }>;

    "ARGUMENT_REQUIRED":
    SendErrorItem<400, { name: string }>;

    "RECORD_KEY_NOT_FOUND":
    SendErrorItem<400, { table: TabId; name: string; }>

    "CANNOT_WRITE_STATIC_ROWS":
    SendErrorItem<400, { table: TabId; name: string; }>

    "OPERATION_NOT_PERMITTED":
    SendErrorItem<403, { reason: string }>

    "ACCESS_DENIED":
    SendErrorItem<403, { reason: string }>
  }
}
SendError.oninstance.push(e => {
  switch (e.reason) {
    case "ARGUMENT_REQUIRED":
    case "BAG_DOES_NOT_HAVE_THIS_TIDDLER":
    case "BAG_NOT_FOUND":
    case "BAG_NO_READ_PERMISSION":
    case "BAG_NO_WRITE_PERMISSION":
    case "CANNOT_WRITE_STATIC_ROWS":
    // case "HOST_NOT_RECOGNIZED": // misconfigured server if this throws
    case "INCORRECT_SERVER_RESPONSE_SENT":
    case "INSTANCE_NOT_FOUND":
    case "INSTANCE_NOT_WRITABLE":
    case "INSTANCE_NO_READ_PERMISSION":
    case "INSTANCE_NO_WRITE_PERMISSION":
    case "INTERNAL_SERVER_ERROR":
    // case "INVALID_BODY_FORMAT": // a bug if this throws
    case "INVALID_REQUEST_BODY":
    case "INVALID_REQUEST_PATH":
    case "INVALID_REQUEST_QUERY":
    case "INVALID_X_REQUESTED_WITH":
    case "LAST_EVENT_ID_NOT_PROVIDED":
    case "MALFORMED_JSON":
    case "METHOD_NOT_ALLOWED":
    case "MULTIPART_INVALID_CONTENT_TYPE":
    case "MULTIPART_INVALID_PART_ENCODING":
    case "MULTIPART_MISSING_BOUNDARY":
    case "NO_ROUTE_MATCHED": // probably spam
    case "OPERATION_NOT_PERMITTED":
    case "OUTSIDE_PATH_PREFIX": // usually misconfigured, but very obvious in the client
    case "PAGE_NOT_AUTHORIZED_FOR_ENDPOINT":
    case "RECIPE_MUST_HAVE_BAGS":
    case "RECIPE_NOT_FOUND":
    case "RECIPE_NO_BAG_AT_POSITION_ZERO":
    case "RECIPE_NO_READ_PERMISSION":
    case "RECIPE_NO_WRITE_PERMISSION":
    case "RECORD_KEY_NOT_FOUND":
    case "REDIRECT":
    case "REQUEST_DROPPED":
    case "REQUIRES_HTTPS":
    case "RESPONSE_INTERCEPTED_BY_CHECKER":
    case "SETTING_KEY_INVALID":
    case "TIDDLER_WIRE_FORMAT_UNKNOWN":
    case "WRITE_NOT_PERMITTED":
      { e.skiplog = true; break; }
  }
})