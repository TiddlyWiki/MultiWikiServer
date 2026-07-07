import * as commander from "commander";

export type CommandClass = { 
  info: CommandInfo,
  new(...args: ConstructorParameters<typeof BaseCommand<any, any>>): BaseCommand<any, any> 
};
export type CommandFile = {
  Command: CommandClass,
  info: CommandInfo,
}


/** 
 * The types for the BaseCommand are as follows: 
 * 
 * @example
 * 
 * BaseCommand<Params, Options>
 * type Params = string[]
 * type Options = { [K: string]: string[] | boolean }
 * 
 * @description
 * 
 * - Params is all of the strings before the first option
 * - Options is a hashmap of each option, with either a boolean, or an array of strings.
 * 
 * The option declaration in info determines how it is parsed.
 * 
 * - For options declared with an argument, the value will be an array. 
 *   - If no value is given, the array will be empty.
 *   - If the option is not present in the cli, it will not be added to the hashmap.
 * - For options declared without an argument, the value will be true or it will not be present. 
 * 
 * 
 */
export abstract class BaseCommand<P extends string[] = string[], O extends object = object> {

  constructor(
    public params: P,
    public options: O,
  ) {

  }

  abstract execute(): Promise<any>;
}
export interface CommandInfo {
  name: string;
  description: string;
  /** The values end up as an array in this.params, so the order is important. */
  arguments: [string, string][];
  /** The values end up in a hashmap of "key": "value", so order is only used in the help. */
  options?: [string, string][];
  internal?: boolean;
  getHelp?: () => string;
  command?(program: commander.Command): commander.Command;
}

