
import { RecipeKeyMap, RecipeManager } from "../managers/manager-recipes";
import { UserKeyMap, UserManager } from "../managers/manager-users";
import { BaseManager, ZodAction } from "../BaseManager";

export { UserManager, UserManagerMap } from "./manager-users";
export { RecipeManager, RecipeManagerMap } from "./manager-recipes";

function isKeyOf<T extends Record<string, any>>(obj: T, key: string | number | symbol): key is keyof T {
  return key in obj;
}


export const ManagerRoutes = (root: rootRoute) => root.defineRoute({
  useACL: {},
  method: ["POST", "OPTIONS"],
  path: /^\/manager\/(.*)/,
  pathParams: ["action"],
  bodyFormat: "json",
}, async state => {
  if (state.method === "OPTIONS") {
    return state.sendEmpty(200, {
      // "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    });
  }

  // we do it out here so we don't start a transaction if the key is invalid.
  const Handler: { new(...args: ConstructorParameters<typeof BaseManager>): any } = (() => {
    if (!state.pathParams.action) throw "No action";
    if (isKeyOf(RecipeKeyMap, state.pathParams.action)) {
      return RecipeManager;
    } else if (isKeyOf(UserKeyMap, state.pathParams.action)) {
      return UserManager;
    } else {
      throw "No such action";
    }
  })();

  return await state.$transaction(async prisma => {
    // the zodRequest handler does the input and output checking. 
    // this just sorts the requests into the correct classes.
    // the transaction will rollback if this throws an error.
    // the key maps are defined in the manager classes based on the zodRequest handlers.
    const action = new Handler(
      state.config, prisma, state.user, state.firstGuestUser, state.PasswordService
    )[state.pathParams.action as string] as ZodAction<any, any>;
    return await action(state);
  })

});