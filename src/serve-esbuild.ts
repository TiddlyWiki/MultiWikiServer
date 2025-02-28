import { request } from "http";
import * as esbuild from "esbuild"
import { StateObject } from "./StateObject";
import { Router } from "./router";

export async function setupDevServer() {
  let ctx = await esbuild.context({
    entryPoints: ['react-user-mgmt/src/main.tsx'],
    bundle: true,
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic',
    outdir: 'react-user-mgmt/public',
  })

  const { port } = await ctx.serve({
    servedir: 'react-user-mgmt/public',
    fallback: 'react-user-mgmt/public/index.html',
  });

  return async function sendDevServer(this: Router, state: StateObject) {
    const proxyRes = await new Promise<import("http").IncomingMessage>((resolve, reject) => {
      const headers = { ...state.headers };
      delete headers[":method"];
      delete headers[":path"];
      delete headers[":authority"];
      delete headers[":scheme"];
      headers.host = "localhost";
      const proxyReq = request({
        hostname: "localhost",
        port: port,
        path: state.url,
        method: state.method,
        headers,
      }, resolve);
      state.reader.pipe(proxyReq, { end: true });
    });

    const { statusCode, headers } = proxyRes;
    if (statusCode === 404 || !statusCode)
      return state.sendEmpty(404, { 'Content-Type': 'text/html' });

    const body = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      proxyRes.on("data", chunk => { chunks.push(chunk); });
      proxyRes.on("end", () => { resolve(Buffer.concat(chunks)); });
      proxyRes.on("error", reject);
    });

    const text = body.toString("utf8");
    const part = `<script type="application/json" id="index-json"></script>`;
    const parts = text.split(part);
    if (parts.length !== 2) return state.sendBuffer(statusCode as number, headers, body);

    state.writeHead(proxyRes.statusCode as number, proxyRes.headers);
    state.write(parts[0] as string);
    const json = await getIndexJson(state);
    
    state.write(`<script type="application/json" id="index-json">${
      JSON.stringify(json).replace(/<\/script>/g, '<\\/script>')
    }</script>`);
    state.write(parts[1] as string);
    return state.end();
  }
}


async function getIndexJson(state: StateObject) {

  // Get the bag and recipe information
  var bagList = await state.store.listBags(),
    recipeList = await state.store.listRecipes();


  // filter bags and recipies by user's read access from ACL
  const allowedRecipes = await state.filterAsync(recipeList, async recipe =>
    recipe.recipe_name.startsWith("$:/")
    || state.authenticatedUser?.isAdmin
    || state.authenticatedUser
    && await state.store.sql.hasRecipePermission(
      state.authenticatedUser.user_id,
      recipe.recipe_name,
      state.store.permissions.READ
    )
    || state.allowAnon && state.allowAnonReads
  );

  const allowedBags = await state.filterAsync(bagList, async bag =>
    bag.bag_name.startsWith("$:/")
    || state.authenticatedUser?.isAdmin
    || state.authenticatedUser && await state.store.sql.hasBagPermission(
      state.authenticatedUser.user_id,
      bag.bag_name,
      state.store.permissions.READ
    )
    || state.allowAnon && state.allowAnonReads
  );

  const allowedRecipesWithWrite = await state.mapAsync(allowedRecipes, async recipe => ({
    ...recipe,
    has_acl_access: state.authenticatedUser && (
      state.authenticatedUser.isAdmin
      || recipe.owner_id === state.authenticatedUser.recipe_owner_id
      || await state.store.sql.hasRecipePermission(
        state.authenticatedUser.user_id,
        recipe.recipe_name,
        state.store.permissions.WRITE
      )
    )
  }))

  const variables = {
    "bag-list": (allowedBags),
    "recipe-list": (allowedRecipesWithWrite),
    "username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Anonymous User" : "Guest",
    "user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin,
    "first-guest-user": state.firstGuestUser,
    "show-anon-config": state.showAnonConfig,
    "user-is-logged-in": !!state.authenticatedUser,
    "user": state.authenticatedUser,
    "has-profile-access": !!state.authenticatedUser,
    allowReads: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousReads", "undefined"),
    allowWrites: "yes" === state.store.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AllowAnonymousWrites", "undefined"),
  };

  return variables;

}