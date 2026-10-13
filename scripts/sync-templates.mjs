// Keeps the self-contained templates in step with the packages:
//   templates/docs-page/index.html  ← tokens.css (between the tokens markers)
//                                   ← the 16 × 16 mark from internal/bitmaps.ts (mark markers)
// Usage:  node scripts/sync-templates.mjs           rewrite the templates
//         node scripts/sync-templates.mjs --check   fail if they are out of date (CI)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const check = process.argv.includes("--check");

const tokens = read("packages/ui/src/styles/tokens.css").trim();

// MARK = [ "....", ... ] in bitmaps.ts
const bitmaps = read("packages/ui/src/internal/bitmaps.ts");
const block = bitmaps.match(/export const MARK = \[([\s\S]*?)\];/)[1];
const MARK = [...block.matchAll(/"([.abc]+)"/g)].map((m) => m[1]);
const fill = { a: "currentColor", b: "#C98F00", c: "#FF5A1F" };
const rects = [];
MARK.forEach((row, y) => {
  let x = 0;
  while (x < row.length) {
    const ch = row[x];
    let end = x + 1;
    while (end < row.length && row[end] === ch) end++;
    if (fill[ch]) rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${fill[ch]}"/>`);
    x = end;
  }
});
const mark =
  `<!-- the 16 × 16 mark; the line follows the text colour -->\n  ` +
  `<svg width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${rects.join("")}</svg>`;

const between = (s, name, body) =>
  s.replace(new RegExp(`(/\\* ${name}:start \\*/|<!-- ${name}:start -->)[\\s\\S]*?(/\\* ${name}:end \\*/|<!-- ${name}:end -->)`), (_, a, b) => `${a}\n${body}\n${b.startsWith("<!--") ? "  " : ""}${b}`);

let stale = 0;
for (const file of ["templates/docs-page/index.html"]) {
  const before = read(file);
  const after = between(between(before, "tokens", tokens), "mark", `  ${mark}`);
  if (after !== before) {
    stale++;
    if (!check) writeFileSync(join(root, file), after);
    console.log(`${check ? "out of date" : "updated"}: ${file}`);
  }
}
if (check && stale) {
  console.error("Templates are out of date: run  node scripts/sync-templates.mjs  and commit.");
  process.exit(1);
}
if (!stale) console.log("templates up to date");
