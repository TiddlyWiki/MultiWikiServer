import { ok } from "assert";
import { Commander, CommandInfo } from "../commander";
import { RecipeManager, RecipeKeyMap } from "../routes/managers/manager-recipes";
import { UserManager, UserKeyMap } from "../routes/managers/manager-users";
import { is, Z2 } from "../utils";
import { zodToTs, printNode } from 'zod-to-ts'

export const info: CommandInfo = {
  name: "manager",
  description: "Run manager commands",
  arguments: [
    ["endpoint", "The manager endpoint to call"],
    [
      "mode",
      "json: read JSON from stdin\n" +
      "options: read key=value pairs from the command line\n" +
      "help: print options for the specified endpoint"
    ]
  ],
  synchronous: true,
  internal: false,
};


export class Command {

  constructor(
    public params: string[],
    public commander: Commander,
  ) {
    // if (this.params.length) throw `${info.name}: No parameters allowed. This is a no-op command.`;
  }
  async execute() {
    const endpoint = this.getEndpoint();
    const { node } = zodToTs(endpoint.zodRequest(Z2), 'User');
    console.log("\ninterface", this.params[0], printNode(node));
  }
  getEndpoint() {
    const [endpoint, mode] = this.params;
    if (is<keyof typeof UserKeyMap>(endpoint, endpoint as string in UserKeyMap)) {
      // if (endpoint as string in UserKeyMap) {
      return new UserManager()[endpoint]
    } else if (is<keyof typeof RecipeKeyMap>(endpoint, endpoint as string in RecipeKeyMap)) {
      return new RecipeManager(this.commander.siteConfig)[endpoint];
    } else {
      throw "The specified endpoint does not exist. Possible values include: \n" +
      [...Object.keys(UserKeyMap), ...Object.keys(RecipeKeyMap)].map(e => `- ${e}`).join("\n")
    }
  }
}