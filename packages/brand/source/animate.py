"""Export the GraySilk loading animations from bitmaps.py.

Usage:  python3 animate.py <dir containing bitmaps.py> <branding folder>
        (export.py runs this too, so one command regenerates everything)
Needs:  Pillow with WebP.

Three loaders, each in GIF (works everywhere), animated WebP and animated SVG
(CSS, stands still when the viewer asks for reduced motion), on-light and on-dark,
transparent background, whole-number pixel sizes only:

  stations  three station squares lighting in turn (same as the UI's button loader)
  train     the pixel train running along a line, looping
  mark      the logo's three stations lighting up along the G, then holding
Motion is stepped, never smooth: one whole cell per frame.
"""
import os, sys
from PIL import Image

sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(__file__))
from bitmaps import MARK, TRAIN, PAL

OUT = sys.argv[2] if len(sys.argv) > 2 else "."
G, C, Y, O = PAL["graphite"], PAL["chalk"], PAL["yellow"], PAL["orange"]

TONES = {
    # name: (line, dim)  dim = an unlit station
    "on-light": (G, PAL["stone"]),
    "on-dark": (C, PAL["lead"]),
}


def mk(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def blank(w, h):
    return [[None] * w for _ in range(h)]


def stamp(grid, bmp, x0, y0, cmap):
    for y, row in enumerate(bmp):
        for x, ch in enumerate(row):
            col = cmap.get(ch)
            if col and 0 <= y0 + y < len(grid) and 0 <= x0 + x < len(grid[0]):
                grid[y0 + y][x0 + x] = col


def runs(grid):
    for y, row in enumerate(grid):
        x, w = 0, len(row)
        while x < w:
            col = row[x]
            if col is None:
                x += 1
                continue
            x1 = x
            while x1 < w and row[x1] == col:
                x1 += 1
            yield x, y, x1 - x, col
            x = x1


# ---------- the three loaders, as frames (grid, ms) ----------
SQ, GAP = 3, 2  # station squares: 3 cells, 2-cell gaps (2x = the button loader's 6 px / 4 px)


def stations(line, dim):
    w = SQ * 3 + GAP * 2
    frames = []
    for lit in range(3):
        g = blank(w, SQ)
        for i in range(3):
            for y in range(SQ):
                for x in range(SQ):
                    g[y][i * (SQ + GAP) + x] = O if i == lit else dim
        frames.append((g, 300))
    return frames


TRACK_W = 32  # the train runs along a 32-cell line and wraps round


def train(line, dim):
    cmap = {"a": line, "b": Y, "d": line}
    h = len(TRAIN) + 1
    frames = []
    for k in range(TRACK_W):
        g = blank(TRACK_W, h)
        for x0 in (k, k - TRACK_W):
            stamp(g, TRAIN, x0, 0, cmap)
        for x in range(TRACK_W):
            g[h - 1][x] = line
        frames.append((g, 50))
    return frames


# station cells of the mark, in order along the line from the top bar:
# top (row 2), left side (row 9), bottom bar (row 13); the yellow terminus ends it
MARK_STATIONS = sorted(((x, y) for y, r in enumerate(MARK) for x, ch in enumerate(r) if ch == "c"),
                       key=lambda p: {2: 0, 9: 1, 13: 2}[p[1]])


def mark(line, dim):
    frames = []
    for n, ms in ((0, 250), (1, 250), (2, 250), (3, 500)):
        g = blank(16, 16)
        stamp(g, MARK, 0, 0, {"a": line, "b": Y, "c": line})
        for (x, y) in MARK_STATIONS[:n]:
            g[y][x] = O
        frames.append((g, ms))
    return frames


LOADERS = {
    # name: (frames(), scales, title)
    "stations": (stations, (2, 3, 4), "Loading"),
    "train": (train, (2, 3, 4), "Loading"),
    "mark": (mark, (2, 3, 4, 8), "GraySilk, loading"),
}


# ---------- raster writers ----------
def to_rgba(grid, cell):
    h, w = len(grid), len(grid[0])
    img = Image.new("RGBA", (w * cell, h * cell), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(grid):
        for x, col in enumerate(row):
            if col:
                c = rgb(col) + (255,)
                for yy in range(y * cell, (y + 1) * cell):
                    for xx in range(x * cell, (x + 1) * cell):
                        px[xx, yy] = c
    return img


def to_p(grid, cell, colours):
    """Palette image with index 0 transparent, so GIF edges stay pixel-sharp."""
    h, w = len(grid), len(grid[0])
    idx = {c: i + 1 for i, c in enumerate(colours)}
    img = Image.new("P", (w * cell, h * cell), 0)
    pal = [0, 0, 0] + [v for c in colours for v in rgb(c)]
    img.putpalette(pal + [0] * (768 - len(pal)))
    px = img.load()
    for y, row in enumerate(grid):
        for x, col in enumerate(row):
            if col:
                for yy in range(y * cell, (y + 1) * cell):
                    for xx in range(x * cell, (x + 1) * cell):
                        px[xx, yy] = idx[col]
    return img


def write_gif(frames, cell, path):
    colours = sorted({c for g, _ in frames for row in g for c in row if c})
    imgs = [to_p(g, cell, colours) for g, _ in frames]
    imgs[0].save(mk(path), save_all=True, append_images=imgs[1:], duration=[ms for _, ms in frames],
                 loop=0, transparency=0, disposal=2, optimize=False)


def write_webp(frames, cell, path):
    imgs = [to_rgba(g, cell) for g, _ in frames]
    imgs[0].save(mk(path), save_all=True, append_images=imgs[1:], duration=[ms for _, ms in frames],
                 loop=0, lossless=True, quality=100, method=6)


# ---------- animated SVG (CSS, stepped; still under prefers-reduced-motion) ----------
def rects(grid, cls=None):
    c = f' class="{cls}"' if cls else ""
    return "".join(f'<rect{c} x="{x}" y="{y}" width="{n}" height="1" fill="{col}"/>' for x, y, n, col in runs(grid))


def svg(w, h, scale, title, style, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w * scale}" height="{h * scale}" '
            f'shape-rendering="crispEdges" role="img" aria-label="{title}"><title>{title}</title>'
            f'<style>{style}</style>{body}</svg>\n')


def svg_stations(line, dim):
    w = SQ * 3 + GAP * 2
    body = "".join(f'<rect class="s s{i + 1}" x="{i * (SQ + GAP)}" y="0" width="{SQ}" height="{SQ}"/>' for i in range(3))
    style = (f".s{{fill:{dim};animation:lit 900ms steps(1,end) infinite}}.s2{{animation-delay:300ms}}.s3{{animation-delay:600ms}}"
             f"@keyframes lit{{0%,33.3%{{fill:{O}}}33.4%,100%{{fill:{dim}}}}}"
             f"@media (prefers-reduced-motion:reduce){{.s{{animation:none}}.s2{{fill:{O}}}}}")
    return svg(w, SQ, 4, "Loading", style, body)


def svg_train(line, dim):
    h = len(TRAIN) + 1
    car = blank(TRACK_W * 2, h)
    for x0 in (0, TRACK_W):
        stamp(car, TRAIN, x0, 0, {"a": line, "b": Y, "d": line})
    track = blank(TRACK_W, h)
    for x in range(TRACK_W):
        track[h - 1][x] = line
    style = (f".t{{animation:run 1600ms steps({TRACK_W},end) infinite}}"
             f"@keyframes run{{from{{transform:translateX(-{TRACK_W}px)}}to{{transform:translateX(0)}}}}"
             f"@media (prefers-reduced-motion:reduce){{.t{{animation:none;transform:translateX(-{TRACK_W - 8}px)}}}}")
    body = f'<g class="t">{rects(car)}</g>{rects(track)}'
    return svg(TRACK_W, h, 4, "Loading", style, body)


def svg_mark(line, dim):
    g = blank(16, 16)
    stamp(g, MARK, 0, 0, {"a": line, "b": Y, "c": line})
    body = rects(g) + "".join(f'<rect class="m m{i + 1}" x="{x}" y="{y}" width="1" height="1"/>' for i, (x, y) in enumerate(MARK_STATIONS))
    # 1250 ms: none · top · +left · +bottom (held twice as long), like the GIF
    frames = "".join(f"@keyframes m{i + 1}{{0%,{19.9 + 20 * i}%{{fill:{line}}}{20 + 20 * i}%,100%{{fill:{O}}}}}" for i in range(3))
    style = (f".m{{fill:{line};animation:1250ms steps(1,end) infinite}}.m1{{animation-name:m1}}.m2{{animation-name:m2}}.m3{{animation-name:m3}}"
             f"{frames}@media (prefers-reduced-motion:reduce){{.m{{animation:none;fill:{O}}}}}")
    return svg(16, 16, 4, "GraySilk, loading", style, body)


SVGS = {"stations": svg_stations, "train": svg_train, "mark": svg_mark}


def main(out=OUT):
    for name, (make, scales, _title) in LOADERS.items():
        for tone, (line, dim) in TONES.items():
            frames = make(line, dim)
            base = f"graysilk-loader-{name}-{tone}"
            open(mk(f"{out}/loading/svg/{base}.svg"), "w").write(SVGS[name](line, dim))
            for s in scales:
                px = len(frames[0][0][0]) * s
                write_gif(frames, s, f"{out}/loading/gif/{base}-{px}px.gif")
                write_webp(frames, s, f"{out}/loading/webp/{base}-{px}px.webp")
    print("loaders exported to", f"{out}/loading")


if __name__ == "__main__":
    main()
