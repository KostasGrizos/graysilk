# GraySilk branding

Everything for the GraySilk identity: the logo files, the icons, the brand guide, and the source that generates them.

- **Brand guide:** [`BRAND_GUIDE.md`](BRAND_GUIDE.md). The visual version is on the GraySilk Logo canvas, page "Brand guide".
- **Palette:** Graphite `#1B1B1E` · Chalk `#EDEDE9` · Paper `#DADAD5` · Lead `#4A4A52` · Safety yellow `#C98F00` · Signal orange `#FF5A1F`
- **Type:** Silkscreen (pixel headlines) · IBM Plex Sans (text/UI) · JetBrains Mono (code/labels)

## Folders

```
branding/
├── BRAND_GUIDE.md
├── logos/
│   ├── svg/    vector, crisp-edged. Best for web and docs
│   ├── pdf/    vector. Best for print and design tools
│   ├── png/    transparent, whole-number pixel sizes
│   └── webp/   lossless, same sizes as png
├── icons/
│   ├── favicon/     favicon.svg/.ico, 16/32/48 png, apple-touch-icon, icon-192/512, site.webmanifest
│   ├── app-icon/    GraySilk.icns + png 16 to 1024 (macOS launcher)
│   └── dashboard/   brand-mark.svg (32 px sidebar tile)
├── social/     README banners, GitHub social preview, avatar (png + webp)
└── source/     bitmaps.py (the pixel drawings) + export.py (builds all of the above)
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

## Regenerate

```bash
cd branding   # from the root of the homelab repo
python3 source/export.py source .        # needs Pillow (with WebP) + reportlab
```

Edit `source/bitmaps.py` to change a pixel; every file follows.

## Wire into the homelab

- **Dashboard:** copy `icons/dashboard/brand-mark.svg` into `apps/dashboard/public/`. Render it at 32 × 32 inside `.brand-mark`, with no background or radius.
- **Favicons** (in the dashboard's `index.html`):

  ```html
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  ```
- **Launcher:** use `icons/app-icon/GraySilk.icns` as the app icon of `Start Homelab`.
- **UI components and maps:** React components, charts and the interactive OSM map theme live in `@graysilk/ui` (`packages/ui` in the homelab repo; maps under `@graysilk/ui/map`).
