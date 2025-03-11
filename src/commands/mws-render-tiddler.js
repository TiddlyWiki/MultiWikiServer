/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-render-tiddler.js
type: application/javascript
module-type: command

Command to create and load a bag for the specified core editions



\*/

const { writeFileSync } = require("fs");

exports.info = {
  name: "mws-render-tiddler",
  synchronous: true
};

class Command {
  constructor(params, commander, callback) {
    this.params = params;
    this.commander = commander;
    this.callback = callback;
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