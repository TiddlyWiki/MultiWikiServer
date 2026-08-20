#!/usr/bin/env node
//@ts-check
import { existsSync, readFileSync, } from "fs";

const cwd = process.cwd();

if (existsSync(`${cwd}/mws.dev.mjs`)) {
  console.error("This appears to be a development version of MWS.");
  process.exit(1);
}

import("./dist/mws.js").then(mws => mws.default());