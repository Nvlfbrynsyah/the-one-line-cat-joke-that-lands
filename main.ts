#!/usr/bin/env node
"use strict";

import fs from "node:fs";
import path from "node:path";

const JOKE =
  "My vet called my cat morbidly obese, my cat called my vet morally opposed to joy, and my vet booked my cat a second appointment.";

const USAGE = [
  "Usage: node main.ts [--help | -h] [OUTPUT_DIR]",
  "",
  "Writes a single one-line cat joke to OUTPUT_DIR/entry.txt with no",
  "trailing newline.",
  "",
  "Arguments:",
  '  OUTPUT_DIR          Target directory (default: "/output").',
  "",
  "Options:",
  "  -h, --help          Print this help and exit 0.",
  "",
  "Environment:",
  "  MAKEFUN_OUTPUT_DIR  Overrides the default output directory when no",
  "                      positional OUTPUT_DIR is given.",
  "",
  "Exit codes:",
  "  0  Joke written (or help printed).",
  "  1  Invalid joke or write failure; an error is printed to stderr.",
].join("\n");

function resolveOutputDir(argsRev, env) {
  if (typeof argsRev[0] === "string" && argsRev[0] !== "") {
    return argsRev[0];
  }
  if (typeof env.MAKEFUN_OUTPUT_DIR === "string" && env.MAKEFUN_OUTPUT_DIR !== "") {
    return env.MAKEFUN_OUTPUT_DIR;
  }
  return "/output";
}

function main() {
  const argv = process.argv.slice(2);
  const args = [];

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(USAGE + "\n");
      return 0;
    }
    if (typeof arg !== "string" || arg.length === 0) {
      process.stderr.write("error: empty argument\n");
      return 1;
    }
    args.push(arg);
  }

  const joke = JOKE;
  if (typeof joke !== "string" || /[\r\n]/.test(joke) || joke.length < 1 || joke.length > 200) {
    process.stderr.write("error: joke must be a single line of 1-200 characters\n");
    return 1;
  }

  const outputDir = resolveOutputDir(args, process.env);
  const outputPath = path.join(outputDir, "entry.txt");

  try {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, joke, { encoding: "utf8" });
  } catch (err) {
    process.stderr.write(`error: failed to write ${outputPath}: ${err && err.message ? err.message : err}\n`);
    return 1;
  }

  process.stdout.write(`wrote ${Buffer.byteLength(joke, "utf8")} bytes: ${joke}\n`);
  return 0;
}

process.exitCode = main();
