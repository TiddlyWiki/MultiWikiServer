import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";

export const info: CommandInfo = {
  name: "done",
  description: "Tests completed successfully.",
  arguments: [],
  internal: true,
};


export class Command extends BaseCommand {

  async execute() {
    console.log("Tests completed successfully.");
    process.exit(0);
  }
}