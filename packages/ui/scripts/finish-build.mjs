// Assembles the published CSS files next to the built JS:
//   styles.css  tokens + base + every component's styles (import this once)
//   tokens.css  just the design tokens (CSS variables)
//   fonts.css   the three brand faces, bundled from @fontsource (resolved by your bundler)
//   map.css     MapLibre's styles + the GraySilk map theme (only if you use @graysilk/ui/map)
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (p) => readFileSync(join(root, "src", p), "utf8");
const out = (p, s) => writeFileSync(join(root, "dist", p), s);
const stripImports = (css) => css.replace(/^@import\s+[^;]+;\s*$/gm, "").trimStart();

const tokens = src("styles/tokens.css");
const base = stripImports(src("styles/index.css"));
const componentsFile = join(root, "dist", "components.css");
const components = existsSync(componentsFile) ? readFileSync(componentsFile, "utf8") : "";

out("tokens.css", tokens);
out("styles.css", `${tokens}\n${base}\n/* ---- components ---- */\n${components}`);
out("fonts.css", src("styles/fonts.css"));
out("map.css", `@import "maplibre-gl/dist/maplibre-gl.css";\n\n${src("map/map.css")}`);
rmSync(componentsFile, { force: true });
console.log("finish-build: styles.css, tokens.css, fonts.css, map.css");
