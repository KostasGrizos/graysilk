"""Export the GraySilk brand kit from bitmaps.py.

Usage:  python3 export.py <dir containing bitmaps.py> <branding folder>
Needs:  Pillow (with WebP) and reportlab (vector PDF).
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, sys.argv[1])
from bitmaps import MARK, WORDMARK, HOMELAB, PAL

OUT = sys.argv[2]
G, C, Y, O = PAL["graphite"], PAL["chalk"], PAL["yellow"], PAL["orange"]

TONES = {
    # name: (line, station, terminus, descriptor)
    "on-light": (G, O, Y, Y),
    "on-dark": (C, O, Y, Y),
    "mono-black": ("#000000",) * 4,
    "mono-white": ("#FFFFFF",) * 4,
}


def rgb(h, a=255):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (a,)


def mk(path):
    os.makedirs(os.path.dirname(path), exist_ok=True); return path


def layer(bmp, line, station=O, terminus=Y):
    cmap = {"a": line, "b": terminus, "c": station}
    return [[cmap.get(ch) for ch in row] for row in bmp]


def compose(w, h, parts, bg=None):
    grid = [[bg] * w for _ in range(h)]
    for x0, y0, lay in parts:
        for y, row in enumerate(lay):
            for x, col in enumerate(row):
                if col:
                    grid[y0 + y][x0 + x] = col
    return grid


def cut_corners(grid):
    h, w = len(grid), len(grid[0])
    for y, x in ((0, 0), (0, w-1), (h-1, 0), (h-1, w-1)):
        grid[y][x] = None
    return grid


def runs(grid):
    for y, row in enumerate(grid):
        x, w = 0, len(row)
        while x < w:
            col = row[x]
            if col is None:
                x += 1; continue
            x1 = x
            while x1 < w and row[x1] == col:
                x1 += 1
            yield x, y, x1 - x, col
            x = x1


# ---------- writers ----------
def write_svg(grid, path, title):
    h, w = len(grid), len(grid[0])
    rects = "".join(f'<rect x="{x}" y="{y}" width="{n}" height="1" fill="{c}"/>' for x, y, n, c in runs(grid))
    open(mk(path), "w").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w*8}" height="{h*8}" '
        f'shape-rendering="crispEdges" role="img" aria-label="{title}"><title>{title}</title>{rects}</svg>\n')


def write_pdf(grid, path, title, cell_pt=8):
    from reportlab.pdfgen import canvas
    h, w = len(grid), len(grid[0])
    c = canvas.Canvas(mk(path), pagesize=(w * cell_pt, h * cell_pt))
    c.setTitle(title); c.setAuthor("GraySilk")
    for x, y, n, col in runs(grid):
        r, g, b, _ = rgb(col)
        c.setFillColorRGB(r/255, g/255, b/255)
        # tiny overlap avoids hairline seams in some PDF viewers
        c.rect(x * cell_pt, (h - y - 1) * cell_pt - 0.02, n * cell_pt, cell_pt + 0.04, stroke=0, fill=1)
    c.showPage(); c.save()


def raster(grid, cell):
    h, w = len(grid), len(grid[0])
    img = Image.new("RGBA", (w*cell, h*cell), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for x, y, n, col in runs(grid):
        d.rectangle([x*cell, y*cell, (x+n)*cell-1, (y+1)*cell-1], fill=rgb(col))
    return img


def write_all(grid, name, title, scales):
    write_svg(grid, f"{OUT}/logos/svg/{name}.svg", title)
    write_pdf(grid, f"{OUT}/logos/pdf/{name}.pdf", title)
    for s in scales:
        img = raster(grid, s)
        tag = f"{img.width}px"
        img.save(mk(f"{OUT}/logos/png/{name}-{tag}.png"), optimize=True)
        img.save(mk(f"{OUT}/logos/webp/{name}-{tag}.webp"), lossless=True, quality=100, method=6)


# ---------- logo variants ----------
MW, MH = 16, 16
WW, WH = len(WORDMARK[0]), len(WORDMARK)
HW = len(HOMELAB[0])
GAP, WY = 5, 3

for tone, (line, st, term, desc) in TONES.items():
    m = layer(MARK, line, st, term)
    w = layer(WORDMARK, line)
    write_all(compose(MW, MH, [(0, 0, m)]), f"graysilk-mark-{tone}", "GraySilk", (4, 8, 16, 32, 64))
    write_all(compose(WW, WH, [(0, 0, w)]), f"graysilk-wordmark-{tone}", "GraySilk", (2, 4, 8, 16))
    lw = MW + GAP + WW
    write_all(compose(lw, MH, [(0, 0, m), (MW + GAP, WY, w)]), f"graysilk-lockup-{tone}", "GraySilk", (2, 4, 8, 16))
    write_all(compose(lw + 6 + HW, MH, [(0, 0, m), (MW + GAP, WY, w), (lw + 6, WY + 3, layer(HOMELAB, desc))]),
              f"graysilk-lockup-homelab-{tone}", "GraySilk Homelab", (2, 4, 8, 16))
    write_all(compose(WW, MH + 4 + WH, [((WW - MW)//2, 0, m), (0, MH + 4, w)]),
              f"graysilk-stacked-{tone}", "GraySilk", (2, 4, 8, 16))

TILES = {
    "graphite": cut_corners(compose(16, 16, [(0, 0, layer(MARK, C))], bg=G)),
    "chalk": cut_corners(compose(16, 16, [(0, 0, layer(MARK, G))], bg=C)),
}
for tname, grid in TILES.items():
    write_all(grid, f"graysilk-tile-{tname}", "GraySilk", (2, 4, 8, 16, 32, 64))

# ---------- icons ----------
TILE = TILES["graphite"]
write_svg(TILE, f"{OUT}/icons/favicon/favicon.svg", "GraySilk")
for s in (16, 32, 48):
    raster(TILE, s // 16).save(mk(f"{OUT}/icons/favicon/favicon-{s}.png"))
raster(TILE, 3).save(mk(f"{OUT}/icons/favicon/favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
SQ = compose(18, 18, [(1, 1, layer(MARK, C))], bg=G)
raster(SQ, 10).save(mk(f"{OUT}/icons/favicon/apple-touch-icon.png"))
for s in (192, 512):
    raster(SQ, 32).resize((s, s), Image.NEAREST).save(mk(f"{OUT}/icons/favicon/icon-{s}.png"))
open(mk(f"{OUT}/icons/favicon/site.webmanifest"), "w").write(
    '{"name":"GraySilk Homelab","short_name":"GraySilk","icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png"},'
    '{"src":"/icon-512.png","sizes":"512x512","type":"image/png"}],"theme_color":"#1B1B1E","background_color":"#1B1B1E","display":"standalone"}\n')
write_svg(TILE, f"{OUT}/icons/dashboard/brand-mark.svg", "GraySilk")


def app_icon(size=1024):
    S = size / 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    body = int(824 * S); off = (size - body) // 2
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([off, off, off + body, off + body], radius=int(185 * S), fill=255)
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([off, off + int(10*S), off + body, off + body + int(10*S)], radius=int(185*S), fill=(0, 0, 0, 110))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(max(1, int(14 * S)))))
    face = Image.new("RGBA", (size, size), rgb(G))
    d = ImageDraw.Draw(face)
    sy = off + body - int(118 * S)
    d.rectangle([0, sy, size, sy + int(36 * S)], fill=rgb(Y))
    dot = max(2, int(10 * S)); step = max(3, int(26 * S))
    for x in range(off, off + body, step):
        d.rectangle([x + step//2 - dot//2, sy + int(18*S) - dot//2, x + step//2 + dot//2 - 1, sy + int(18*S) + dot//2 - 1], fill=rgb(G))
    m = raster(compose(16, 16, [(0, 0, layer(MARK, C))]), max(1, int(36 * S)))
    face.alpha_composite(m, ((size - m.width) // 2, off + int(70 * S)))
    img.paste(face, (0, 0), mask)
    return img

icon = app_icon(1024)
icon.save(mk(f"{OUT}/icons/app-icon/GraySilk-1024.png"))
icon.save(mk(f"{OUT}/icons/app-icon/GraySilk.icns"))
for s in (16, 32, 64, 128, 256, 512):
    icon.resize((s, s), Image.LANCZOS).save(mk(f"{OUT}/icons/app-icon/GraySilk-{s}.png"))

# ---------- social ----------
def stripe(d, x0, y0, w, h, cell):
    d.rectangle([x0, y0, x0 + w - 1, y0 + h - 1], fill=rgb(Y))
    for x in range(x0, x0 + w, cell * 3):
        d.rectangle([x + cell, y0 + (h - cell)//2, x + 2*cell - 1, y0 + (h - cell)//2 + cell - 1], fill=rgb(G))


def banner(w, h, cell, homelab, name):
    img = Image.new("RGBA", (w, h), rgb(G))
    parts = [(0, 0, layer(MARK, C)), (MW + GAP, WY, layer(WORDMARK, C))]
    lw = MW + GAP + WW
    if homelab:
        parts.append((lw + 6, WY + 3, layer(HOMELAB, Y))); lw += 6 + HW
    lock = raster(compose(lw, MH, parts), cell)
    img.alpha_composite(lock, ((w - lock.width)//2, (h - lock.height)//2 - cell*2))
    stripe(ImageDraw.Draw(img), 0, h - cell*6, w, cell*3, cell)
    img.save(mk(f"{OUT}/social/{name}.png"))
    img.save(mk(f"{OUT}/social/{name}.webp"), lossless=True)

banner(1280, 320, 6, False, "readme-banner-1280x320")
banner(1280, 320, 5, True, "homelab-banner-1280x320")
banner(1280, 640, 8, False, "github-social-1280x640")
raster(compose(20, 20, [(2, 2, layer(MARK, C))], bg=G), 32).save(mk(f"{OUT}/social/avatar-640.png"))
print("exported to", OUT)

# ---------- loading animations (see animate.py) ----------
import animate
animate.main(OUT)
