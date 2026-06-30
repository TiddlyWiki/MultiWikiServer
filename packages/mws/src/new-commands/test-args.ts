import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";

export const info: CommandInfo = {
  name: "test-args",
  description: "Prints the command args to console. Useful for testing your inputs.",
  arguments: [],
};


export class Command extends BaseCommand {

  async execute() {
    console.log(this.params);
  }
}