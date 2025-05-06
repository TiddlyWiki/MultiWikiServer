import { Commander, CommandInfo } from "../commander";

export const info: CommandInfo = {
  name: "manager",
  description: "Run manager commands",
  arguments: [
    ["endpoint", "The manager endpoint to call"]
  ],
  synchronous: true,
  internal: false,
};


export class Command {

  constructor(
    public params: string[],
    public commander: Commander,
  ) {
    if (this.params.length) throw `${info.name}: No parameters allowed. This is a no-op command.`;
  }
  execute() {
    // Do nothing
  }
}