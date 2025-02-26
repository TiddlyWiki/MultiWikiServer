import { readdirSync, statSync } from "fs";
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
  root.defineRoute({
    method: ['GET'],
    path: /^\/public\/(.*)/,
    pathParams: ['reqpath'],
    useACL: {},
  }, async state => {
    console.log(state.pathParams.reqpath);
    return state.sendFile(200, {}, {
      root: 'public',
      reqpath: state.pathParams.reqpath?.trim() || 'index.html', 
    });
  })
  await importDir(root, 'handlers');
}
async function importDir(root: rootRoute, folder: string) {
  await Promise.all(readdirSync(`src/routes/${folder}`).map(async (item) => {
    const stat = statSync(`src/routes/${folder}/${item}`);
    if (stat.isFile()) {
      const e = await import(`./${folder}/${item}`);
      if (!e.route) throw new Error(`No route defined in ${item}`);
      e.route(root);
    } else if (stat.isDirectory()) {
      await importDir(root, `${folder}/${item}`);
    }
  }));
}