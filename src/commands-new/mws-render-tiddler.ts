/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-render-tiddler.js
type: application/javascript
module-type: command

Command to create and load a bag for the specified core editions



\*/


import { Commander, CommandInfo } from ".";

const { writeFileSync } = require("fs");

export const info: CommandInfo = {
  name: "mws-render-tiddler",
  synchronous: true
};

export class Command {

  constructor(
    public params: string[], 
    public commander: Commander, 
    public callback: (err?: any) => void
  ) {

  }
  async execute() {

    const result = this.commander.wiki.renderTiddler("text/plain", "$:/core/templates/tiddlywiki5.html", {
      variables: {
        saveTiddlerFilter: `
          $:/boot/boot.css
          $:/boot/boot.js
          $:/boot/bootprefix.js
          $:/core
          $:/library/sjcl.js
          $:/plugins/tiddlywiki/multiwikiclient
          $:/themes/tiddlywiki/snowwhite
          $:/themes/tiddlywiki/vanilla
        `
      }
    });

    writeFileSync("tiddlywiki5.html", result);
  }
};

exports.Command = Command;