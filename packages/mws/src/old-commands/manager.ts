import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";


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
  internal: true,
};


export class Command extends BaseCommand {


  async execute() {
    throw "The manager command is not implemented yet.";
  }

}