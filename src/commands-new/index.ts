
import { IModules, Wiki } from "tiddlywiki"
import { Router } from "../router";


import * as mwsloadpluginbags from "./mws-load-plugin-bags";
import * as mwsrendertiddler from "./mws-render-tiddler";
import * as mwsloadwikifolder from "./mws-load-wiki-folder";



export interface CommandInfo {
  name: string;
  synchronous?: boolean;
  namedParameterMode?: boolean;
  mandatoryParameters?: string[];
}
/**
Parse a sequence of commands
  commandTokens: an array of command string tokens
  wiki: reference to the wiki store object
  streams: {output:, error:}, each of which has a write(string) method
  callback: a callback invoked as callback(err) where err is null if there was no error
*/
export abstract class Commander {
  commandTokens
  nextToken
  callback
  wiki
  streams
  abstract outputPath: string;
  verbose

  commands: Record<string, { info: CommandInfo, Command: any }> = {
    [mwsloadpluginbags.info.name]: mwsloadpluginbags,
    [mwsrendertiddler.info.name]: mwsrendertiddler,
    [mwsloadwikifolder.info.name]: mwsloadwikifolder,
  };

  abstract get $tw(): any;
  abstract router: Router;

  constructor(
    commandTokens: string[],
    callback: (err: any) => void,
    wiki: Wiki,
    streams: {
      output: { write: (str: string) => void },
      error: { write: (str: string) => void }
    }
  ) {
    console.log(commandTokens);
    this.commandTokens = commandTokens;
    this.nextToken = 0;
    this.callback = callback;
    this.wiki = wiki;
    this.streams = streams;
    this.verbose = false;


  }

  // Commander.initCommands = function(moduleType) {
  // 	moduleType = moduleType || "command";
  // 	$tw.commands = {};
  // 	$tw.modules.forEachModuleOfType(moduleType,function(title,module) {
  // 		var c = $tw.commands[module.info.name] = {};
  // 		// Add the methods defined by the module
  // 		for(var f in module) {
  // 			if($tw.utils.hop(module,f)) {
  // 				c[f] = module[f];
  // 			}
  // 		}
  // 	});
  // };
  static initCommands(moduleType?: string) {
    if (moduleType) throw new Error("moduleType is not implemented");
  }
  /*
  Log a string if verbose flag is set
  */
  log(str: string) {
    if (this.verbose) {
      this.streams.output.write(str + "\n");
    }
  }
  /*
  Write a string if verbose flag is set
  */
  write(str: string) {
    if (this.verbose) {
      this.streams.output.write(str);
    }
  }
  /*
  Add a string of tokens to the command queue
  */
  addCommandTokens(params: string[]) {
    this.commandTokens.splice(this.nextToken, 0, ...params);
  }
  /*
  Execute the sequence of commands and invoke a callback on completion
  */
  execute() {
    this.executeNextCommand();
  }
  /*
  Execute the next command in the sequence
  */
  executeNextCommand() {
    var self = this;
    // Invoke the callback if there are no more commands
    if (this.nextToken >= this.commandTokens.length) {
      this.callback(null);
    } else {
      // Get and check the command token
      var commandName = this.commandTokens[this.nextToken++] as string;
      if (commandName.substr(0, 2) !== "--") {
        this.callback("Missing command: " + commandName);
      } else {
        commandName = commandName.substr(2); // Trim off the --

        // Accumulate the parameters to the command
        var params: string[] = [];
        while (this.nextToken < this.commandTokens.length &&
          (this.commandTokens[this.nextToken] as string).substr(0, 2) !== "--") {
          params.push(this.commandTokens[this.nextToken++] as string);
        }
        // Get the command info
        var command = this.commands[commandName], c, err;
        if (!command) {
          this.callback("Unknown command: " + commandName);
        } else {
          if (this.verbose) {
            this.streams.output.write("Executing command: " + commandName + " " + params.join(" ") + "\n");
          }
          // Parse named parameters if required
          if (command.info.namedParameterMode) {
            params = this.extractNamedParameters(params as string[], command.info.mandatoryParameters);
            if (typeof params === "string") {
              return this.callback(params);
            }
          }
          console.log(command.info, params);
          new Promise<void>(async (resolve) => {
            const { Command, info } = command!;
            c = new Command(params, this,
              info.synchronous ? undefined : resolve
            );
            err = await c.execute();
            if (err || info.synchronous) resolve(err);
          }).then((err: any) => {
            if (err) {
              console.log(err);
              this.callback(err);
            } else {
              this.executeNextCommand();
            }
          });


        }
      }
    }
  }
  /*
  Given an array of parameter strings `params` in name:value format, and an array of mandatory parameter names in `mandatoryParameters`, returns a hashmap of values or a string if error
  */
  extractNamedParameters(params: string[], mandatoryParameters?: string[]) {
    mandatoryParameters = mandatoryParameters || [];
    var errors: any[] = [], paramsByName = Object.create(null);
    // Extract the parameters
    each(params, function (param: string) {
      var index = param.indexOf("=");
      if (index < 1) {
        errors.push("malformed named parameter: '" + param + "'");
      }
      paramsByName[param.slice(0, index)] = param.slice(index + 1).trim();
    });
    // Check the mandatory parameters are present
    each(mandatoryParameters, function (mandatoryParameter: string) {
      if (!hop(paramsByName, mandatoryParameter)) {
        errors.push("missing mandatory parameter: '" + mandatoryParameter + "'");
      }
    });
    // Return any errors
    if (errors.length > 0) {
      return errors.join(" and\n");
    } else {
      return paramsByName;
    }
  }
}

