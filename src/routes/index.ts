import { readdirSync } from "fs";
import { rootRoute, Router } from "../router";
import AuthRoutes from "./auth";
import { TWRoutes } from "./tw-test";



/** 
 * The root route is specially defined in router.ts, 
 * so we don't really need to do anything here except 
 * setup the child routes. 
 */
export default async function RootRoute(root: rootRoute) {
  // AuthRoutes(root);
  // TWRoutes(root);

  await Promise.all(readdirSync("src/routes/handlers").map(async (file) => {
    (await import(`./handlers/${file}`).then(e => {
      if(!e.route) console.error(`No route defined in ${file}`);
      return e;
    })).route(root);
  }));
}
