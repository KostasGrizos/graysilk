# @graysilk/ui

React components for the GraySilk brand (palette "Platform Edge"). It ships as a **source package**: TypeScript and CSS Modules, compiled by the consuming Vite app. There is no build step here.

- Brand guide: `/Volumes/Homelab/branding/BRAND_GUIDE.md`
- Status: **v0.5**: tokens, `Text`, `Button`, `IconButton`, `Badge`, `Card`, `Icon`, `StatusPill`, `LineMap`, loading (`Loader`, `PixelTrain`, `ProgressBar`), charts (`LineChart`, `BarChart`, `Meter`, `StatTile`, `ChartFrame`) and maps (`@graysilk/ui/map`).
- Theme: follows the OS by default. Pin with `data-gs-theme="dark"|"light"` on any element; `data-gs-theme="system"` follows the OS again inside a pinned area.
- Borders: `--gs-border` is for dividers and card edges (decorative). Outlines that identify a control (inputs, toggles, checkboxes) use `--gs-border-control`, which keeps 3:1 against every background.
- Touch: on touch screens (`pointer: coarse`) buttons grow to 44 px (md) and 40 px (sm).

## Use it in a Vite app (e.g. apps/dashboard)

1. Point the app at the package. In `vite.config.ts`:

   ```ts
   resolve: { alias: { "@graysilk/ui": path.resolve(__dirname, "../../packages/ui/src") } }
   ```

   In `tsconfig.app.json`:

   ```json
   "paths": { "@graysilk/ui": ["../../packages/ui/src"] }
   ```

2. Load styles once. `fonts.css` bundles the three brand faces from npm (`@fontsource`, OFL), so they are served by your own app, never fetched from Google, and work offline. Run `npm install` in `packages/ui` so the app build can find them.

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

## Status and lines

- `StatusPill status="ok|caution|attention|stop|unknown" label="Running"`: a state as an icon, a word and a status colour. The word is always shown.
- `LineMap lines={[{ id, name, stations: [{ id, name, state, stateLabel, onSelect? }] }]} label="Service lines"`: the brand line map. Station states differ in shape as well as colour: filled = `lit`, blinking = `busy`, thick orange ring = `alert`, thin ring = `unlit`, hairline = `planned`. Each line ends in the yellow terminus. Inside a card, set `--gs-line-ground: var(--gs-surface)` so station rings match the card. Optional `color` per line (use a data-palette colour, e.g. `var(--gs-series-3)`) tints its track and adds a swatch before its name; the station states stay the same.

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

## Loading

```tsx
import { Loader, PixelTrain, ProgressBar } from "@graysilk/ui";

<Loader />                                         {/* stations: inline waits */}
<Loader variant="train" label="Loading photos" />  {/* panels, empty states */}
<Loader variant="mark" size="lg" />                {/* app start, splash */}
<PixelTrain scale={3} direction="left" color="var(--gs-series-1)" />
<ProgressBar label="Restoring Immich" value={42} />
<ProgressBar label="Uploading" value={1.2} max={4} valueText="1.2 of 4 GB" />
<ProgressBar label="Checking backups" />             {/* no value: the train runs along the line */}
```

- Motion is stepped (whole cells, never smooth) and stops on a still frame under `prefers-reduced-motion`.
- `Loader` is a polite `role="status"`; `label` is read out (and shown with `showLabel`). Sizes are whole-pixel scales: sm 2×, md 3×, lg 4×.
- `ProgressBar` is a real `progressbar` with value text; it fills one block at a time (`segments`, default 24). For levels with status (disk, CPU) use `Meter`.
- The same three loaders exist as files (GIF, animated WebP, SVG) in `branding/loading/` for places without React: READMEs, emails, the macOS launcher, static pages.

## Maps (`@graysilk/ui/map`)

An interactive OpenStreetMap in the brand, with your own layers on top. It needs `maplibre-gl` (optional peer dependency) and is a separate entry, so apps without maps don't load it.

```tsx
import { MapView, LineLayer, StationLayer, AreaLayer, PointLayer, MapPopup, VehicleLayer, MapLegend,
  bbox, catchment, parallelOffset } from "@graysilk/ui/map";

<MapView bounds={bbox(allStations)} label="Thessaloniki Metro">        {/* theme="system" | "chalk" | "night" */}
  <AreaLayer id="walk" data={catchment(allStations, 500)} color="ink" fillOpacity={0.06} outlineDashed />
  <LineLayer id="l1" data={line1} color={6} width={6} onClick={showLine} />
  <LineLayer id="l2" data={line2} color={1} width={6} />               {/* shared track: per-feature `offset` */}
  <StationLayer stations={stations} color={6} onSelect={setStation} />
  <PointLayer points={places} onSelect={setPlace} />
  <VehicleLayer vehicles={live} />
  <MapPopup lngLat={station?.lngLat ?? null} onClose={close}>…any React…</MapPopup>
  <MapLegend entries={legend} onToggle={toggle} />
</MapView>
```

- **Framing**: pass `bounds` (use `bbox()`) so the network fits any screen; `center` + `zoom` also work. "Back to start" returns there.
- **Embedding**: `cooperative` (on by default) keeps page scrolling working: Ctrl/⌘ + scroll zooms, two fingers move the map on phones.
- **Basemap**: standard OSM raster tiles, recoloured on the GPU. Chalk is greyscale with lifted blacks; Night is greyscale and inverted (`raster-brightness-min/max` swapped). Overlays carry all the colour. Pass `basemap={…}` for another tile server; for heavy traffic use your own tiles (OSM tile policy).
- **Colours**: `color` takes a data slot 1–8 (resolved per theme), `"ink"` / `"muted"` (follow the theme), or a hex. Casings use the theme ground.
- **Lines**: `dashed` = planned. Lines that share track run side by side: give each line's shared piece an `offset` property of ±`parallelOffset(width)` (positive = right of the drawing direction) and its own branch `offset: 0`. A 16 px invisible hit area makes `onClick` easy to tap.
- **Areas**: `catchment(points, metres)` merges overlapping circles into one shape, so overlaps don't stack darker. `outlineDashed` for soft edges.
- **Stations**: focusable pixel squares centred on the station. Shared track (more than one line in `lines`) = one larger ink square spanning the parallel lines; interchange = heavier square with a centre pixel; terminus = yellow; planned = dashed. Names show for termini and interchanges, from `labelZoom` for the rest, and on hover/focus; `labelSide: "left"` moves a name off the line.
- **Decluttering**: `<MapView>` sets `data-zoom` = `far` / `mid` / `near` (see `zoomBand`). When far, stations get smaller and pins become small pixel diamonds; the selected pin stays full size.
- **Points**: square pins with a 24 px Pixelarticons icon. **Vehicles**: the brand pixel train; feed positions and it moves in steps.
- **Popups**: brand cards; Escape closes them and puts focus back on the station or pin that opened them.
- **Legend**: entries toggle layers; the title folds it away (starts folded on maps under 560 px wide).
- `useMap()` gives the MapLibre map for custom layers.

## Scripts

```bash
npm install
npm run playground   # live specimen page (vite dev server)
npm test             # vitest + testing-library
npm run typecheck
```
