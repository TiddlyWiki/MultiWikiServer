#!/usr/bin/env node
//@ts-check
import { existsSync, readFileSync, } from "fs";

const cwd = process.cwd();

/** @type {import("./package.json") | null} */
const pkg = existsSync(`${cwd}/package.json`) && tryParseJSON(readFileSync(`${cwd}/package.json`, "utf8")) || null;

if (pkg && pkg.name === "@tiddlywiki/mws" && existsSync(`${cwd}/mws.dev.mjs`)) {
  console.error("This appears to be a development version of MWS.");
  process.exit(1);
}

if (pkg && pkg.name === "@tiddlywiki/mws-instance" && pkg.private) {
  if (pkg.version !== "0.2.0") {
    console.log([
      "=======================================================================================",
      "The data folder you are trying to open appears to be from a different version of MWS.",
      "",
      "Folder: " + process.cwd(),
      "Version: " + pkg.version,
      "",
      "To prevent data loss the program will now exit.",
      "=======================================================================================",
    ].join("\n"));
    process.exit(1);
  }
  // need absolute path because of cwd
  import(`file://${cwd}/node_modules/@tiddlywiki/mws/dist/mws.js`)
    .then(mws => mws.default(pkg.version))
    .catch(console.error);
} else {
  console.error("This does not appear to be a valid MWS data folder.");
  console.error("Please run this command in the root of your MWS data folder.");
  process.exit(1);
}

/**
 * 
 * @param {string} file 
 * @returns 
 */
function tryParseJSON(file) {
  try {
    return JSON.parse(file);
  } catch (e) {
    return undefined;
  }
}
