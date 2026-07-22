#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const args = process.argv.slice(2);
const targetArg = args.find((arg) => !arg.startsWith("--"));
const approved = args.includes("--approved");
const skipInstall = args.includes("--skip-install");

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (args.includes("--help")) {
  console.log(
    "Usage: node scripts/init-deck.mjs <target-directory> --approved [--skip-install]"
  );
  process.exit(0);
}

if (!targetArg) {
  console.log(
    "Usage: node scripts/init-deck.mjs <target-directory> --approved [--skip-install]"
  );
  process.exit(1);
}

if (!approved) {
  fail("refusing to create a deck before explicit brief approval; pass --approved after approval");
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.resolve(scriptDirectory, "..");
const templateDirectory = path.join(skillDirectory, "assets", "starter-template");
const targetDirectory = path.resolve(process.cwd(), targetArg);
const briefPath = path.join(targetDirectory, "brief.md");

await mkdir(targetDirectory, { recursive: true });

let brief;
try {
  brief = await readFile(briefPath, "utf8");
} catch {
  fail(`missing approved brief: ${briefPath}`);
}

if (!brief.trim()) {
  fail(`approved brief is empty: ${briefPath}`);
}

const existingEntries = await readdir(targetDirectory);
const conflicts = existingEntries.filter((entry) => entry !== "brief.md");

if (conflicts.length > 0) {
  fail(
    `target directory must contain only brief.md; found: ${conflicts.join(", ")}`
  );
}

const templateEntries = await readdir(templateDirectory);

for (const entry of templateEntries) {
  const source = path.join(templateDirectory, entry);
  const destination = path.join(targetDirectory, entry);
  const sourceStat = await stat(source);

  await cp(source, destination, {
    recursive: sourceStat.isDirectory(),
    errorOnExist: true,
    force: false
  });
}

console.log(`Deck starter copied to ${targetDirectory}`);

if (!skipInstall) {
  const isWindows = process.platform === "win32";
  const npmCommand = isWindows ? process.env.ComSpec || "cmd.exe" : "npm";
  const npmArgs = isWindows
    ? ["/d", "/s", "/c", "npm", "install"]
    : ["install"];
  const result = spawnSync(npmCommand, npmArgs, {
    cwd: targetDirectory,
    stdio: "inherit"
  });

  if (result.error || result.status !== 0) {
    const reason = result.error?.message || `exit code ${result.status ?? "unknown"}`;
    fail(
      `npm install failed (${reason}); starter files were copied but dependencies are not ready`
    );
  }

  console.log("Dependencies installed.");
} else {
  console.log("Dependency installation skipped.");
}
