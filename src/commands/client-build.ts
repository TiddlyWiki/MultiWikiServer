import { Commander, CommandInfo } from "../commander";
import { esbuildStartup } from "../setupDevServer";

export const info: CommandInfo = {
  name: "client-build",
  description: "Build the client for the TiddlyWiki5 server",
  arguments: [],
  synchronous: true,
  internal: true,
};


export class Command {

  constructor(
    public params: string[],
    public commander: Commander,
  ) {
    if (this.params.length) throw `${info.name}: No parameters allowed. This is a no-op command.`;
  }
  async execute() {
    // if (!this.commander.config.enableDevServer) throw "Dev server is not enabled. Please set enableDevServer to true in the config file.";

    const { ctx, port, rootdir } = await esbuildStartup();


    ctx.dispose();
  }
}