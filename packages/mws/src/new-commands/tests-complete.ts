import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { serverEvents } from "@tiddlywiki/events";

serverEvents.on("cli.register", (commands) => {
  commands[info.name] = { info, Command: TestsCompleteCommand };
});

const info: CommandInfo = {
  name: "done",
  description: "Tests completed successfully.",
  arguments: [],
  internal: true,
};


export class TestsCompleteCommand extends BaseCommand {
  static info = info;

  async execute() {
    console.log("Tests completed successfully.");
    process.exit(0);
  }
}