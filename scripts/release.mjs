// Bump both packages to one version, commit, and tag it. Pushing the tag publishes.
// Usage:  npm run release -- 0.6.1        (or patch | minor | major)
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const sh = (cmd) => execSync(cmd, { stdio: "inherit" });
const out = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();
const arg = process.argv[2];
if (!arg) {
  console.error("Usage: npm run release -- <version | patch | minor | major>");
  process.exit(1);
}
if (out("git status --porcelain")) {
  console.error("Commit or stash your changes first.");
  process.exit(1);
}
if (out("git branch --show-current") !== "main") {
  console.error("Release from main.");
  process.exit(1);
}

sh("npm run check");
sh(`npm version ${arg} --workspaces --no-git-tag-version`);
const version = JSON.parse(readFileSync("packages/ui/package.json", "utf8")).version;
sh("npm install --package-lock-only --ignore-scripts");
sh("git add packages/ui/package.json packages/brand/package.json package-lock.json");
sh(`git commit -m "release v${version}"`);
sh(`git tag -a v${version} -m "v${version}"`);
console.log(`\nTagged v${version}. Publish with:\n  git push --follow-tags\n`);
