// Copies the brand files this app serves from @graysilk/brand into public/.
// Runs before dev and build, so the brand package stays the single source of truth.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** This app's name on phones' home screens. Change it per project. */
const APP = { name: "GraySilk app", short_name: "GraySilk", description: "A GraySilk app." };

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = dirname(createRequire(import.meta.url).resolve("@graysilk/brand/package.json"));
const files = {
  "icons/dashboard/brand-mark.svg": "brand/mark-tile.svg",
  "logos/svg/graysilk-wordmark-on-dark.svg": "brand/wordmark-on-dark.svg",
  "logos/svg/graysilk-wordmark-on-light.svg": "brand/wordmark-on-light.svg",
  "icons/favicon/favicon.svg": "favicon.svg",
  "icons/favicon/favicon.ico": "favicon.ico",
  "icons/favicon/apple-touch-icon.png": "apple-touch-icon.png",
  "icons/favicon/icon-192.png": "icon-192.png",
  "icons/favicon/icon-512.png": "icon-512.png",
  "icons/favicon/icon-maskable-192.png": "icon-maskable-192.png",
  "icons/favicon/icon-maskable-512.png": "icon-maskable-512.png",
};
for (const [from, to] of Object.entries(files)) {
  const target = join(app, "public", to);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(brand, from), target);
}
// the web app manifest: the brand's icons and colours, this app's name
const manifest = JSON.parse(readFileSync(join(brand, "icons/favicon/site.webmanifest"), "utf8"));
writeFileSync(join(app, "public", "site.webmanifest"), JSON.stringify({ ...manifest, ...APP }, null, 2) + "\n");

console.log(`sync-brand: copied ${Object.keys(files).length} files from @graysilk/brand`);
