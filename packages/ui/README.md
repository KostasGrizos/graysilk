# @graysilk/ui

React components for the GraySilk brand (palette "Platform Edge"). It ships as a **source package**: TypeScript and CSS Modules, compiled by the consuming Vite app. There is no build step here.

- Brand guide: `/Volumes/Homelab/branding/BRAND_GUIDE.md`
- Status: **v0.2**: tokens, `Text`, `Button`, `IconButton`, `Badge`, `Card`, `Icon`, and charts (`LineChart`, `BarChart`, `Meter`, `StatTile`, `ChartFrame`).
- Theme: follows the OS by default. Pin with `data-gs-theme="dark"|"light"` on any element.

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
   <html class="gs-root">   <!-- follows the OS; or data-gs-theme="dark" | "light" -->
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

## Icons

The icon set is **Pixelarticons** (MIT, 1,036 free icons, 24 px pixel grid). Use 24 px, or 48 px for empty states; other sizes blur the pixels.

```tsx
import { Server } from "pixelarticons/react/Server.js";
<Icon icon={Server} />                       // decorative
<Icon icon={Server} size={48} label="Server" />
<Button iconStart={<Server />}>Servers</Button>
```

## Data colour and charts

- Categorical `--gs-series-1…8`: Lapis, Safety, Magenta, Moss, Violet, Signal, Sky, Brick. The order is fixed and validated for colour-blind separation on both themes. Pin a `slot` per entity so colours never move when data is filtered. Scatter plots and maps take at most 3 series.
- Sequential `--gs-{safety|lapis|signal}-100…900` (500 of safety = brand yellow). For ordered steps use 400–800 on light and 200–600 on dark.
- Diverging: lapis ↔ `--gs-div-mid` ↔ signal.
- Status `--gs-status-{ok|caution|attention|stop|unknown}`: railway signal aspects, always shown with an icon and a word, never used for series.
- Charts: thin 2 px lines, square bar ends, hairline grid, legend for 2+ series, a crosshair you can drive with the arrow keys, and a table view on every line chart. One y-axis only.

## Scripts

```bash
npm install
npm run playground   # live specimen page (vite dev server)
npm test             # vitest + testing-library
npm run typecheck
```
