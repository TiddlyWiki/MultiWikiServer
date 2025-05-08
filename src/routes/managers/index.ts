
import { RecipeManager } from "../managers/manager-recipes";
import { UserManager } from "../managers/manager-users";
import { SiteConfig } from "../../commander";

export { UserManager, UserManagerMap } from "./manager-users";
export { RecipeManager, RecipeManagerMap } from "./manager-recipes";

export const ManagerRoutes = (root: rootRoute, config: SiteConfig) => {
  RecipeManager.defineRoutes(root, config);
  UserManager.defineRoutes(root, config);
};