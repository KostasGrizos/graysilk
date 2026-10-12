# @graysilk/ui

React components for the GraySilk brand (palette "Platform Edge"). It ships as a **source package**: TypeScript and CSS Modules, compiled by the consuming Vite app. There is no build step here.

- Brand guide: `/Volumes/Homelab/branding/BRAND_GUIDE.md`
- Status: **v0.1 · Foundations**, made of tokens, `Text`, `Button`, `IconButton`, `Badge` and `Card`.

## Use it in a Vite app (e.g. apps/dashboard)

1. Point the app at the package. In `vite.config.ts`:

   ```ts
   resolve: { alias: { "@graysilk/ui": path.resolve(__dirname, "../../packages/ui/src") } }
   ```

   In `tsconfig.app.json`:

   ```json
   "paths": { "@graysilk/ui": ["../../packages/ui/src"] }
   ```

2. Load styles once (fonts are optional; self-host them for an offline homelab):

   ```ts
   import "../../packages/ui/src/styles/fonts.css";
   import "../../packages/ui/src/styles/index.css";
   ```

3. Choose a theme on the root and use the components:

   ```html
   <html data-gs-theme="dark" class="gs-root">   <!-- dark | light | system -->
   ```

   ```tsx
   import { Button, Card, CardHeader, Badge } from "@graysilk/ui";
   ```

## Rules the components follow

- Components read **semantic** tokens only (`--gs-bg`, `--gs-text`, `--gs-accent` …). Themes swap them via `data-gs-theme`, which works on any subtree.
- Yellow and orange never carry text on light grounds. `tone="accent"` and `tone="signal"` switch to the deep tones (`#7A5700`, `#B33A0F`) in the light theme.
- Motion is stepped (`steps()`), never eased, and every animation stops under `prefers-reduced-motion`.
- Brand surfaces (cards) are square. Controls use a 4 px radius.
- `primary` buttons cast a 4 px ledge below themselves. Leave 4 px of space under them in tight layouts.

## Scripts

```bash
npm install
npm run playground   # live specimen page (vite dev server)
npm test             # vitest + testing-library
npm run typecheck
```
