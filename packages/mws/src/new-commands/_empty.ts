import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { serverEvents } from "@tiddlywiki/events";

serverEvents.on("cli.register", (commands) => {
  // commands[info.name] = { info, Command: EmptyCommand };
});

const info: CommandInfo = {
  name: "",
  description: "",
  arguments: [],
};


export class EmptyCommand extends BaseCommand {
  static info = info;

  async execute() {

  }
}