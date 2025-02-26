import { IModules, Wiki } from "tiddlywiki"

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
	outputPath
	verbose

	abstract get commands(): any;

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
		var path = require("path");
		this.commandTokens = commandTokens;
		this.nextToken = 0;
		this.callback = callback;
		this.wiki = wiki;
		this.streams = streams;
		this.outputPath = path.resolve($tw.boot.wikiPath, $tw.config.wikiOutputSubDir);
		this.verbose = false;
	}

	static initCommands(moduleType: string, modules: IModules) {
		console.log("initCommands");
		process.exit();
		// moduleType = moduleType || "command";
		// Commander.commands = {};
		// modules.forEachModuleOfType(moduleType, function (title, module: any) {
		// 	var c: any = $tw.commands[module.info.name] = {};
		// 	// Add the methods defined by the module
		// 	for (var f in module) {
		// 		if ($tw.utils.hop(module, f)) {
		// 			c[f] = module[f];
		// 		}
		// 	}
		// });
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
						c = new command.Command(params, this,
							command.info.synchronous ? undefined : resolve
						);
						err = await c.execute();
						if (err || command.info.synchronous) resolve(err);
					}).then((err: any) => {
						if (err) {
							console.log(err);
							this.callback(err);
						} else {
							this.executeNextCommand();
						}
					});


					// if (command.info.synchronous) {
					// 	// Synchronous command
					// 	c = new command.Command(params, this);
					// 	err = c.execute();
					// 	if (!err) {
					// 		if (command.info.synchronous)
					// 			this.executeNextCommand();
					// 	} else if (err instanceof Promise || err.toString() === "[object Promise]") {
					// 		err.then(() => {
					// 			if (command.info.synchronous)
					// 				this.executeNextCommand();
					// 		}, (err: any) => {
					// 			console.log(err);
					// 			this.callback(err);
					// 		});
					// 	} else {
					// 		this.callback(err);
					// 	}
					// } else {
					// 	// Asynchronous command
					// 	c = new command.Command(params, this, function (err: any) {
					// 		if (err) {
					// 			self.callback(err);
					// 		} else {
					// 			self.executeNextCommand();
					// 		}
					// 	});
					// 	err = c.execute();
					// 	if (err instanceof Promise || err.toString() === "[object Promise]") {
					// 		err.then(() => {
					// 			this.executeNextCommand();
					// 		}, (err: any) => {
					// 			console.log(err);
					// 			this.callback(err);
					// 		});
					// 	} else if (err) {
					// 		this.callback(err);
					// 	}
					// }
				}
			}
		}
	}
	/*
	Given an array of parameter strings `params` in name:value format, and an array of mandatory parameter names in `mandatoryParameters`, returns a hashmap of values or a string if error
	*/
	extractNamedParameters(params: string[], mandatoryParameters: string[]) {
		mandatoryParameters = mandatoryParameters || [];
		var errors: any[] = [], paramsByName = Object.create(null);
		// Extract the parameters
		$tw.utils.each(params, function (param: string) {
			var index = param.indexOf("=");
			if (index < 1) {
				errors.push("malformed named parameter: '" + param + "'");
			}
			paramsByName[param.slice(0, index)] = $tw.utils.trim(param.slice(index + 1));
		});
		// Check the mandatory parameters are present
		$tw.utils.each(mandatoryParameters, function (mandatoryParameter: string) {
			if (!$tw.utils.hop(paramsByName, mandatoryParameter)) {
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

