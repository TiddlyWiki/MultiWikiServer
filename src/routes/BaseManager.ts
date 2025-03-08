import { ZodTypeAny, ZodType } from "zod";
import { z } from "zod/lib/external";
import { StateObject } from "../StateObject";
import { Z2 } from "../zodAssert";

/*
You must have admin permission on a bag to add it to a recipe because it is an implicit ACL operation.
https://crates.io/crates/indradb


I'm also wondering if the system could be improved slightly by thinking of it more in terms of bag layers.

- Each layer could be writable or readonly. A tiddler from a readonly layer could not be overwritten unless there is a writable layer above it to put it in.
- Different layers could be given a more complicated set of permissions. Maybe admins can edit the template or system namespace, users can only edit their own pages in the user namespace, etc.
- Our current system is multiple readonly bag layers, with a single writable bag layer at the top.
- The simplest recipe is one writable bag layer.

Nothing should be happening to tiddlers in a bag unless they're in a writable layer of the recipe you're accessing them through.



*/
export class BaseManager {

  constructor(protected state: StateObject, protected prisma: PrismaTxnClient) { }

  protected ZodRequest<T extends ZodTypeAny, R>(
    zodRequest: (z: Z2<"JSON">) => T,
    handler: (route: z.output<T>) => Promise<R>,
    zodResponse: (z: Z2<"JSON">) => ZodType<R> = z => z.any()
  ) {
    return async (input: z.input<T>): Promise<R> => {

      const inputCheck = zodRequest(Z2).safeParse(input);
      if (!inputCheck.success) {
        console.log(inputCheck.error);
        throw this.state.sendEmpty(400, { "x-reason": "zod-request" });
      }

      const res = await handler(inputCheck.data);

      const outputCheck = zodResponse(Z2).safeParse(res);
      if (!outputCheck.success) {
        console.log(outputCheck.error);
        throw this.state.sendEmpty(500, { "x-reason": "zod-response" });
      }

      return outputCheck.data;

    };
  }
}
