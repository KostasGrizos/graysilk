# GraySilk brand (`@graysilk/brand`)

Everything for the GraySilk identity: the logo files, the icons, the brand guide, and the source that generates them.

- **Brand guide:** [`BRAND_GUIDE.md`](BRAND_GUIDE.md). The visual version is on the GraySilk Logo canvas, page "Brand guide".
- **Palette:** Graphite `#1B1B1E` · Chalk `#EDEDE9` · Paper `#DADAD5` · Lead `#4A4A52` · Safety yellow `#C98F00` · Signal orange `#FF5A1F`
- **Type:** Silkscreen (pixel headlines) · IBM Plex Sans (text/UI) · JetBrains Mono (code/labels)

## Folders

```
packages/brand/
├── BRAND_GUIDE.md
├── logos/
│   ├── svg/    vector, crisp-edged. Best for web and docs
│   ├── pdf/    vector. Best for print and design tools
│   ├── png/    transparent, whole-number pixel sizes
│   └── webp/   lossless, same sizes as png
├── icons/
│   ├── favicon/     favicon.svg/.ico, 16/32/48 png, apple-touch-icon, icon-192/512, maskable 192/512, site.webmanifest
│   ├── app-icon/    GraySilk.icns + png 16 to 1024 (macOS launcher)
│   └── dashboard/   brand-mark.svg (32 px sidebar tile)
├── social/     README banners, GitHub social preview, avatar (png + webp)
├── loading/    animated loaders: stations, train, mark (gif, webp, svg; on-light / on-dark)
└── source/     bitmaps.py (the pixel drawings) + export.py (builds all of the above) + animate.py (the loaders)
```

## Logo files

File name pattern: `graysilk-<variant>-<tone>[-<width>px].<ext>`

| Variant | What | PNG/WebP widths |
|---|---|---|
| `mark` | The G only | 64, 128, 256, 512, 1024 |
| `wordmark` | "GraySilk" only | 128, 256, 512, 1024 |
| `lockup` | Mark + wordmark (primary) | 170, 340, 680, 1360 |
| `lockup-homelab` | Mark + wordmark + HOMELAB | 276, 552, 1104, 2208 |
| `stacked` | Mark above wordmark | 128, 256, 512, 1024 |
| `tile-graphite` / `tile-chalk` | Mark on a square tile with pixel-cut corners | 32, 64, 128, 256, 512, 1024 |

| Tone | Means | Use on |
|---|---|---|
| `on-light` | Graphite artwork, orange stations, yellow terminus | Chalk, Paper, white |
| `on-dark` | Chalk artwork, orange stations, yellow terminus | Graphite, dark photos |
| `mono-black` | Everything black | One-colour print, stamps, engraving |
| `mono-white` | Everything white | One-colour on dark or photos |

Scale only by whole numbers. If you need a size that isn't listed, use the SVG or PDF.

## Loading animations

File name pattern: `graysilk-loader-<stations|train|mark>-<on-light|on-dark>[-<width>px].<ext>`. Backgrounds are transparent; pick the tone for the background it sits on.

| Format | Where | Notes |
| --- | --- | --- |
| `gif/` | anywhere: READMEs, email, chat | pixel-sharp, 1-bit transparency |
| `webp/` | web pages | lossless, smaller |
| `svg/` | web pages, docs | scalable; CSS animation that stands still under reduced motion |

Sizes: stations 26/39/52 px wide, train 64/96/128 px, mark 32/48/64/128 px (2×, 3×, 4×, 8×). In React use `Loader` from `@graysilk/ui` instead of the files.

## Regenerate

```bash
cd packages/brand                        # in the graysilk repo
python3 source/export.py source .        # needs Pillow (with WebP) + reportlab; also runs animate.py
python3 source/animate.py source .       # just the loading animations
```

Edit `source/bitmaps.py` to change a pixel; every file follows. Exports are byte-identical between runs, so `git diff` shows only real changes. Commit the regenerated files, then release (see the repo README).

## Use it in a project

Published as `@kostasgrizos/graysilk-brand` (GitHub Packages, private). Install it under the short name with an npm alias, so code and docs always say `@graysilk/brand`:

```bash
npm install @graysilk/brand@npm:@kostasgrizos/graysilk-brand
```

Files are then under `node_modules/@graysilk/brand/` (same folders as here). Copy what an app serves into its `public/` before dev and build; `templates/web-app/scripts/sync-brand.mjs` does that.

- **Favicons** (in the app's `index.html`):

  ```html
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1B1B1E">
  ```

  Copy everything in `icons/favicon/` into `public/`. The manifest has `id`, `start_url` and `scope` set to `/`, plus normal and **maskable** icons (`icon-maskable-*.png`: extra padding so round home-screen masks don't clip the G).
- **Sidebar mark:** `icons/dashboard/brand-mark.svg`, rendered at 32 × 32 with no background or radius.
- **macOS app icon:** `icons/app-icon/GraySilk.icns`.
- **Without npm** (Python tools, slides, READMEs): every GitHub release of the graysilk repo has `graysilk-brand-<version>.zip` with these files.
- **React components, charts, loaders and the map theme:** `@graysilk/ui` (`packages/ui`).
