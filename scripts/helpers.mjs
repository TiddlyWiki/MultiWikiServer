// @ts-check
import { existsSync, rmSync, renameSync } from "fs";
import { spawn } from "child_process";
import EventEmitter from "events";
export const events = new EventEmitter();

/**
 * 
 * @param {string} cmd
 * @param {Record<string, string>} env 
 * @param {string} [cwd]
 * @returns 
 */
export const run = (cmd, env, cwd) => {
  return start(cmd, [], env, { cwd });
}

/**
 * @overload
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {Record<string, string>} [env2]
 * @param {{cwd?: string, pipeOut: true}} [options]
 * @returns {Promise<string>}
 * 
 * @overload
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {Record<string, string>} [env2]
 * @param {{cwd?: string, pipeOut?: false}} [options]
 * @returns {Promise<void>}
 * 
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {Record<string, string>} [env2]
 * @param {{cwd?: string, pipeOut?: boolean}} [options]
 */
export function start(cmd, args = [], env2 = {}, { cwd = process.cwd(), pipeOut } = {}) {
  // Cross-platform shell execution
  const shell = true;

  const cp = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env2, },
    shell,
    stdio: ["inherit", pipeOut ? "pipe" : "inherit", "inherit"],
  });

  events.on("exit", (code) => { cp.kill(code); });

  if(pipeOut) {
    return new Promise((r, c) => {
      /** @type {any[]} */
      const chunks = [];
      cp.stdout?.on("data", (data) => {
        chunks.push(data);
      });
      cp.stdout?.on("end", () => {
        r(chunks.map(e => e.toString()).join(""));
      });
      // if any process errors it will immediately exit the script
      cp.on("exit", (code) => {
        if(code) c(code);
      });
    });
  } else {
    return /** @type {Promise<void>} */(new Promise((r, c) => {
      // if any process errors it will immediately exit the script
      cp.on("exit", (code) => { if(code) c(code); else r(); });
    }));
  }
}


/**
 * Cross-platform file/directory removal
 * @param {string} targetPath 
 */
export function removeRecursive(targetPath) {
  if(existsSync(targetPath)) {
    rmSync(targetPath, { recursive: true, force: true });
  }
}

/**
 * Cross-platform move/rename operation
 * @param {string} oldPath 
 * @param {string} newPath 
 */
export function moveFile(oldPath, newPath) {
  try {
    if(existsSync(oldPath)) {
      // Remove target if it exists
      if(existsSync(newPath)) {
        removeRecursive(newPath);
      }
      renameSync(oldPath, newPath);
      console.log(`Moved ${oldPath} to ${newPath}`);
    } else {
      console.log(`Source path ${oldPath} does not exist, skipping move`);
    }
  } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to move ${oldPath} to ${newPath}:`, errorMessage);
    throw error;
  }
}
