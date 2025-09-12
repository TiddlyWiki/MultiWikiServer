export abstract class SendError<XReasonStr extends keyof XReasonSendErrorMap> {
  constructor(
    { apiText, htmlText, status, xReason }
      : { apiText: string, htmlText: string, status: number, xReason: XReasonStr }
  ) {
    this.apiText = apiText
    this.htmlText = htmlText
    this.status = status
    this.#xReason = xReason
  }

  apiText
  htmlText
  status
  #xReason: XReasonStr
  get xReason() { return this.#xReason }

  get html() {
    return (
      `
      <html>
      <body>
      <div>
      ${this.htmlText}
      </div>
      </body>
      </html>
      `
    )
  }



}



// TODO: Make it a type error to break this interface.
export interface XReasonSendErrorMap {
  "RECIPE_NOT_FOUND": RecipeNotFound
  "RECIPE_NO_READ_PERMISSION": RecipeNoReadPermission
  "RECIPE_NO_WRITE_PERMISSION": RecipeNoWritePermission
  "BAG_NOT_FOUND": BagNotFound
  "BAG_NO_READ_PERMISSION": BagNoReadPermission
  "BAG_NO_WRITE_PERMISSION": BagNoWritePermission
  "PAGE_NOT_AUTHORIZED_FOR_ENDPOINT": PageNotAuthorizedForEndpoint
}

export type xReason = keyof XReasonSendErrorMap

export class RecipeNotFound extends SendError<"RECIPE_NOT_FOUND"> {
  constructor(public recipeName: string) {
    super({
      status: 404,
      apiText: "recipe not found",
      htmlText: `Recipe ${recipeName} was not found.`,
      xReason: "RECIPE_NOT_FOUND"
    })
  }
}

export class RecipeNoReadPermission extends SendError<"RECIPE_NO_READ_PERMISSION"> {
  constructor(public recipeName: string) {
    super({
      status: 403,
      apiText: "no read permission",
      htmlText: `You can not read from ${recipeName}.`,
      xReason: "RECIPE_NO_READ_PERMISSION"
    })
  }
}

export class RecipeNoWritePermission extends SendError<"RECIPE_NO_WRITE_PERMISSION"> {
  constructor(public recipeName: string) {
    super({
      status: 403,
      apiText: "no write permission",
      htmlText: `You can not write to ${recipeName}.`,
      xReason: "RECIPE_NO_WRITE_PERMISSION"
    })
  }
}

export class BagNotFound extends SendError<"BAG_NOT_FOUND"> {
  constructor(public bagName: string) {
    super({
      status: 404,
      apiText: "bag not found",
      htmlText: `Recipe ${bagName} was not found.`,
      xReason: "BAG_NOT_FOUND"
    })
  }
}

export class BagNoReadPermission extends SendError<"BAG_NO_READ_PERMISSION"> {
  constructor(public bagName: string) {
    super({
      status: 403,
      apiText: "no read permission",
      htmlText: `You can not read from ${bagName}.`,
      xReason: "BAG_NO_READ_PERMISSION"
    })
  }
}

export class BagNoWritePermission extends SendError<"BAG_NO_WRITE_PERMISSION"> {
  constructor(public bagName: string) {
    super({
      status: 403,
      apiText: "no write permission",
      htmlText: `You can not write to ${bagName}.`,
      xReason: "BAG_NO_WRITE_PERMISSION"
    })
  }
}

export class PageNotAuthorizedForEndpoint extends SendError<"PAGE_NOT_AUTHORIZED_FOR_ENDPOINT"> {
  constructor() {
    super({
      status: 403,
      apiText: "the page does not have permission to access this endpoint",
      htmlText: `The page does not have permission to access this endpoint.`,
      xReason: "PAGE_NOT_AUTHORIZED_FOR_ENDPOINT"
    })
  }
}