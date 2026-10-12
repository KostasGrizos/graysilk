# GraySilk brand guide · v1.0 (October 2026)

GraySilk is the personal developer identity of Konstandinos Grizos (graysilk.tech). The homelab is one product under it: **GraySilk Homelab**.

The visual guide, with every page drawn out, is on the GraySilk Logo canvas, page "Brand guide". This file is the written reference.

---

## 1. The mark

A metro line drawn as a **G**. It passes three stations, turns inward and stops at its terminus: home.

| Part | Spec |
|---|---|
| Grid | 16 × 16 cells. 1 cell = 1 px at favicon size |
| Line | 2-cell stroke, 45° steps, Graphite (on light) or Chalk (on dark) |
| Stations | 3 single cells, Signal orange |
| Terminus | 2 × 2 cells at the inner end of the bar, Safety yellow |
| Margin | 1 empty cell on every side (built into the artwork) |

**Pixel rule:** scale only by whole numbers (16, 32, 48, 64 … px). Any other size blurs the pixels. For example, the dashboard tile is 32 px, not 30.

## 2. Wordmark and lockups

- The wordmark **GraySilk** is custom pixel lettering: 2-cell strokes (the same weight as the mark), cap height 10, x-height 7, descender 3. **It is artwork, not a font. Never retype it.**
- The descriptor **HOMELAB** is 5 × 7 pixel caps with a 1-cell stroke, in Safety yellow.

| Lockup | Construction (in cells) | Use |
|---|---|---|
| Primary (horizontal) | Mark, then 5-cell gap, then wordmark lowered 3 cells | Default everywhere |
| Product | Primary + 6-cell gap + HOMELAB lowered 6 cells | Homelab surfaces |
| Stacked | Mark centred above wordmark, 4-cell gap | Square spaces, covers, stickers |
| Mark only | Free-standing, or the tile (graphite square with 1-cell cut corners) | Favicon, avatar, app icon |

- **Clear space:** 4 cells (¼ of the mark) on every side.
- **Minimum size:** mark 16 px; lockup 85 px wide (1×). Prefer 170 px and up.
- **Preferred:** reversed (Chalk on Graphite).

## 3. Misuse

Don't:

1. Scale to sizes that aren't whole multiples (blurs the pixels).
2. Use colours outside the palette. **No teal or green**, because those belong to Rhoé.
3. Rotate the mark.
4. Stretch it; cells are always square.
5. Retype the wordmark in Silkscreen or any other font.
6. Add glows, shadows, bevels or gradients.
7. Place it on busy backgrounds.
8. Crowd it inside its clear space.

## 4. Color: Platform Edge

Mostly gray, like the name. Yellow is the safety line on the platform edge; orange marks the stations. Use both like signals: small and rare.

| Name | Token | Hex | RGB | Role |
|---|---|---|---|---|
| Graphite | `--gs-graphite` | `#1B1B1E` | 27 27 30 | Dark backgrounds; artwork and text on light |
| Chalk | `--gs-chalk` | `#EDEDE9` | 237 237 233 | Light backgrounds; artwork and text on dark |
| Paper | `--gs-paper` | `#DADAD5` | 218 218 213 | Panels, cards, page grounds |
| Lead | `--gs-lead` | `#4A4A52` | 74 74 82 | Secondary text on light, borders, inactive |
| Safety yellow | `--gs-yellow` | `#C98F00` | 201 143 0 | Terminus, platform stripe, highlights on dark |
| Signal orange | `--gs-orange` | `#FF5A1F` | 255 90 31 | Stations, alerts, the one thing to notice |

**Proportion:** Graphite 50 · Chalk 22 · Paper 15 · Lead 7 · Yellow 4 · Orange 2.

**Contrast (WCAG):**

- **OK for text:** Graphite/Chalk 14.6 · Graphite/Paper 12.2 · Lead/Chalk 7.5 · Lead/Paper 6.3 · Yellow/Graphite 6.1 · Orange/Graphite 5.5.
- **Graphics only, never text:** Yellow/Chalk 2.4 · Orange/Chalk 2.7 · Lead/Graphite 2.0.

## 5. Typography

All three typefaces are free on Google Fonts. Sizes follow an 8 px rhythm.

| Role | Typeface | Weights |
|---|---|---|
| Display / pixel headlines | **Silkscreen** | 700 (≥ 24 px only; never for the wordmark) |
| Text and UI | **IBM Plex Sans** | 400, 500, 600 |
| Code, labels, data | **JetBrains Mono** | 400, 600 |

| Style | Font | Size / line | Weight | Notes |
|---|---|---|---|---|
| Display | Silkscreen | 64 / 64 | 700 | |
| H1 | Silkscreen | 40 / 48 | 700 | |
| H2 | Plex Sans | 28 / 36 | 600 | −0.01em |
| H3 | Plex Sans | 20 / 28 | 600 | |
| Body | Plex Sans | 16 / 24 | 400 | |
| Small | Plex Sans | 14 / 20 | 400 | |
| Label | JetBrains Mono | 12 / 16 | 600 | +0.14em, uppercase |
| Code | JetBrains Mono | 14 / 20 | 400 | |

## 6. Graphic elements

- **Platform stripe:** Safety yellow band with Graphite squares, square-to-gap 1 : 2. Use it full-bleed and horizontal, at the foot of banners, covers and footers.
- **Line map:** services drawn as stations (orange squares) on an 8 px Chalk line, ending in a yellow terminus. Use it for status pages, READMEs and roadmaps.
- **Pixel train:** for loading, progress and empty states. It moves in whole-pixel steps, never smoothly. Its nose points the way it travels.
- **Grid and corners:** spacing in multiples of 8 px. Brand surfaces get square or pixel-cut corners. UI controls may use a 4 px radius.

### Loading

Three loaders, each moving one whole cell per frame and holding a still frame when the viewer asks for reduced motion.

| Loader | Looks like | Use for | Timing |
| --- | --- | --- | --- |
| Stations | three squares, one lit in Signal orange at a time | inline waits, buttons, small spaces | 300 ms per station |
| Train | the pixel train running along a line, wrapping round | panels, empty states, long waits | 1 cell per 50 ms (1.6 s loop) |
| Mark | the logo's three stations lighting up along the G, then holding | app start, splash screens | 250 ms per step, 500 ms hold |

- Unlit stations use the border tone (Stone on light, Lead on dark). Lit = Signal orange; the train's stripe and the mark's terminus stay Safety yellow.
- Progress: fill in whole blocks of Safety yellow (Signal orange when the result needs attention). When the amount of work is unknown, run the train along a 2 px line instead.
- Always pair a loader with words for screen readers ("Loading photos"); show them when the wait is longer than a moment.
- Files: `loading/` (GIF, animated WebP, animated SVG; on-light and on-dark). In React: `Loader`, `PixelTrain`, `ProgressBar` from `@graysilk/ui`.

## 7. Applications

- **Dashboard:** 32 px tile plus the 2× wordmark in a Graphite sidebar; the active nav item gets a yellow left edge; the line map shows service status.
- **README / GitHub:** `social/readme-banner-1280x320.png`, `social/github-social-1280x640.png`.
- **App icon:** `icons/app-icon/GraySilk.icns`. The icon is a Graphite squircle with the platform stripe.
- **Avatar:** `social/avatar-640.png` (services crop it to a circle).
- **Favicon:** `icons/favicon/`.
