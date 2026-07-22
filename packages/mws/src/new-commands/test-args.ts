import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { serverEvents } from "@tiddlywiki/events";

serverEvents.on("cli.register", (commands) => {
  commands[info.name] = { info, Command: TestArgsCommand };
});

const info: CommandInfo = {
  name: "test-args",
  description: "Prints the command args to console. Useful for testing your inputs.",
  arguments: [],
  
};


export class TestArgsCommand extends BaseCommand {
  static info = info;

  async execute() {
    console.log(this.params);
  }
}