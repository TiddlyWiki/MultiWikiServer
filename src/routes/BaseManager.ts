import { ZodTypeAny, ZodType, z } from "zod";
import { StateObject } from "../StateObject";
import { Z2 } from "../zodAssert";
import { DataChecks } from "../store/data-checks";

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

export type BaseManagerMap<T> = {
  [K in keyof T as T[K] extends (input: any) => Promise<any> ? K : never]: T[K];
}

export class BaseManager {

  static defineManager(
    root: rootRoute,
    path: RegExp,
    Manager: { new(state: StateObject, prisma: PrismaTxnClient): BaseManager }
  ) {
    
  }

  user;
  checks;
  constructor(protected state: StateObject, protected prisma: PrismaTxnClient) {
    const isLoggedIn = !!this.state.authenticatedUser;

    const { isAdmin, user_id, username } = this.state.authenticatedUser ?? {
      // isAdmin: false, user_id: 0, username: "(anon)"
      isAdmin: true, user_id: 1, username: "admin"
    };

    this.user = { isAdmin, user_id, username, isLoggedIn };
    this.checks = new DataChecks({ allowAnonReads: false, allowAnonWrites: false });
  }

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
