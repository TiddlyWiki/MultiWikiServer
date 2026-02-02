
export interface SendErrorItem<STATUS extends number, DETAIL extends (object & {}) | null> {
  status: STATUS;
  details: DETAIL;
}

export interface SendErrorReasonData {
  /** Check the server logs for this one */
  "INTERNAL_SERVER_ERROR":
  SendErrorItem<500, { message: string; details?: any; }>;

  "INVALID_X_REQUESTED_WITH":
  SendErrorItem<400, null>;

  "MALFORMED_JSON":
  SendErrorItem<400, null>;

  // return 400 rather than 404 to protect the semantic meaning of 404 NOT FOUND,
  // because if the request does not match a route, we have no way of knowing what
  // resource they thought they were requesting and whether or not it exists.
  "NO_ROUTE_MATCHED":
  SendErrorItem<400, null>;

  "METHOD_NOT_ALLOWED":
  SendErrorItem<405, { allowedMethods: string[] }>;

  "INVALID_BODY_FORMAT":
  SendErrorItem<500, null>;

  "REQUEST_DROPPED":
  SendErrorItem<500, null>;

  "MULTIPART_INVALID_CONTENT_TYPE":
  SendErrorItem<400, null>;

  "MULTIPART_MISSING_BOUNDARY":
  SendErrorItem<400, null>;

  "MULTIPART_INVALID_PART_ENCODING":
  SendErrorItem<400, { partIndex: number; partEncoding: string; }>;

  "REQUIRES_HTTPS":
  SendErrorItem<400, null>;

  "HOST_NOT_RECOGNIZED":
  SendErrorItem<400, null>;
};


export type SendErrorTypes = {
  [K in keyof SendErrorReasonData]: SendError<K>;
}[keyof SendErrorReasonData];

export class SendError<REASON extends SendErrorReason> extends Error {

  static [Symbol.hasInstance](instance: any): instance is SendErrorTypes {
    return Function.prototype[Symbol.hasInstance].call(this, instance);
  }

  constructor(
    public reason: REASON,
    public status: SendErrorReasonData[REASON]["status"],
    public details: SendErrorReasonData[REASON]["details"],
  ) {
    super();
    this.name = SendError.name;
  }

  override get message() {
    return JSON.stringify({
      status: this.status,
      reason: this.reason,
      details: this.details
    });
  }

  toJSON() {
    return {
      status: this.status,
      reason: this.reason,
      details: this.details
    };
  }

}

export type SendErrorReason = keyof SendErrorReasonData
