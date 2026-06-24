import { Z2 } from '@tiddlywiki/server';
import { BaseCommand, CommandInfo } from '@tiddlywiki/commander';
// import { StatusKeyMap, StatusManager } from '../managers';
// import { UserKeyMap, UserManager } from '../managers/admin-users';
// import { RecipeKeyMap, RecipeManager } from '../managers/admin-recipes';
// import { WikiRouterKeyMap, WikiRoutes } from '../managers/wiki-routes';
// import { PrinterOptions } from 'typescript';


export const info: CommandInfo = {
  name: "build-types",
  description: "Output endpoint types to a JSON file so we don't have to include it in the runtime.",
  arguments: [],
  internal: true,
};


export class Command extends BaseCommand<[], {}> {


  async execute() {
    //@ts-ignore
    const { zodToTs, printNode } = await import('zod-to-ts').catch(e => {
      console.log("The NPM package 'zod-to-ts' cannot be found.");
      throw "The NPM package 'zod-to-ts' cannot be found.";
    }) as any; // was giving an ""excessively deep type" error
    console.log("interface ClientTypes {")
    this.getEndpoints().forEach(([key, endpoint]) => {
      console.log(`  ${key}: {`);
      if (endpoint.zodRequestBody) {
        const { node } = zodToTs(endpoint.zodRequestBody(Z2), 'User');
        console.log("    RequestBody: ", printNode(node));
      }
      if (endpoint.zodPathParams) {
        const { node } = zodToTs(Z2.object(endpoint.zodPathParams(Z2)), 'PathParams');
        console.log("    PathParams: ", printNode(node));
      }
      if (endpoint.zodQueryParams) {
        const { node } = zodToTs(Z2.object(endpoint.zodQueryParams(Z2)), 'QueryParams');
        console.log("    QueryParams: ", printNode(node));
      }
      console.log("  }");
    });
    console.log("}");
  }
  getEndpoints() {
    const status = new StatusManager();
    const recipe = new RecipeManager();
    const user = new UserManager();
    // Note: WikiRoutes is not a manager, but it has the same interface as the others.
    // const wiki = new WikiRoutes();

    return [
      ...Object.keys(StatusKeyMap).map(e => [e, status[e]] as const),
      ...Object.keys(UserKeyMap).map(e => [e, user[e]] as const),
      ...Object.keys(RecipeKeyMap).map(e => [e, recipe[e]] as const),
      // ...Object.keys(WikiRouterKeyMap).map(e => [e, wiki[e]] as const),
    ];
  }
}