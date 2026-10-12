"""GraySilk pixel bitmaps — single source of truth for the mark and wordmark."""

PAL = {
    "graphite": "#1B1B1E",
    "chalk": "#EDEDE9",
    "paper": "#DADAD5",
    "yellow": "#C98F00",
    "orange": "#FF5A1F",
    "lead": "#4A4A52",
}

# 16x16 mark. a = line, b = terminus (yellow), c = station (orange)
MARK = [
    "................",
    ".....aaaaaaaa...",
    "....aaaacaaaa...",
    "...aa...........",
    "..aa............",
    ".aa.............",
    ".aa.............",
    ".aa.....bbaaaaa.",
    ".aa.....bbaaaaa.",
    ".ca..........aa.",
    ".aa..........aa.",
    "..aa........aa..",
    "...aa......aa...",
    "....aaaacaaaa...",
    ".....aaaaaaa....",
    "................",
]

# Custom wordmark glyphs: 2-cell strokes, cap height 10 (rows 0-9),
# x-height 7 (rows 3-9), descender rows 10-12. Each glyph is 13 rows.
def _g(rows, top=0):
    width = max(len(r) for r in rows)
    out = ["." * width] * top + [r.ljust(width, ".") for r in rows]
    out += ["." * width] * (13 - len(out))
    return out

GLYPHS = {
    "G": _g([
        "..aaaaaa.",
        ".aaaaaaa.",
        "aa.......",
        "aa.......",
        "aa..aaaaa",
        "aa..aaaaa",
        "aa.....aa",
        "aa.....aa",
        ".aaaaaaaa",
        "..aaaaaa.",
    ]),
    "r": _g([
        "aa.aaaa",
        "aaaaaaa",
        "aaa....",
        "aa.....",
        "aa.....",
        "aa.....",
        "aa.....",
    ], top=3),
    "a": _g([
        "aaaaaa.",
        "aaaaaaa",
        ".....aa",
        ".aaaaaa",
        "aa...aa",
        "aaaaaaa",
        ".aaaaaa",
    ], top=3),
    "y": _g([
        "aa...aa",
        "aa...aa",
        "aa...aa",
        "aa...aa",
        "aa...aa",
        "aaaaaaa",
        ".aaaaaa",
        ".....aa",
        "aaaaaaa",
        "aaaaaa.",
    ], top=3),
    "S": _g([
        ".aaaaaaa",
        "aaaaaaaa",
        "aa......",
        "aa......",
        "aaaaaaa.",
        ".aaaaaaa",
        "......aa",
        "......aa",
        "aaaaaaaa",
        "aaaaaaa.",
    ]),
    "i": _g([
        "aa",
        "aa",
        "..",
        "aa",
        "aa",
        "aa",
        "aa",
        "aa",
        "aa",
        "aa",
    ]),
    "l": _g([
        "aa.",
        "aa.",
        "aa.",
        "aa.",
        "aa.",
        "aa.",
        "aa.",
        "aa.",
        "aaa",
        ".aa",
    ]),
    "k": _g([
        "aa.....",
        "aa.....",
        "aa.....",
        "aa...aa",
        "aa..aa.",
        "aa.aa..",
        "aaaa...",
        "aa.aa..",
        "aa..aa.",
        "aa...aa",
    ]),
}

def word(text, glyphs, gap=2):
    rows = [""] * len(next(iter(glyphs.values())))
    for i, ch in enumerate(text):
        g = glyphs[ch]
        for r in range(len(rows)):
            rows[r] += ("." * gap if i else "") + g[r]
    return rows

WORDMARK = word("GraySilk", GLYPHS)

# 5x7 one-cell-stroke caps for the descriptor (HOMELAB)
SMALL = {
    "H": ["a...a", "a...a", "a...a", "aaaaa", "a...a", "a...a", "a...a"],
    "O": [".aaa.", "a...a", "a...a", "a...a", "a...a", "a...a", ".aaa."],
    "M": ["a...a", "aa.aa", "a.a.a", "a.a.a", "a...a", "a...a", "a...a"],
    "E": ["aaaaa", "a....", "a....", "aaaa.", "a....", "a....", "aaaaa"],
    "L": ["a....", "a....", "a....", "a....", "a....", "a....", "aaaaa"],
    "A": [".aaa.", "a...a", "a...a", "aaaaa", "a...a", "a...a", "a...a"],
    "B": ["aaaa.", "a...a", "a...a", "aaaa.", "a...a", "a...a", "aaaa."],
}
HOMELAB = word("HOMELAB", SMALL, gap=2)

if __name__ == "__main__":
    for r in WORDMARK:
        print(r.replace(".", " ").replace("a", "█"))
    print(len(WORDMARK[0]), "x", len(WORDMARK))
    for r in HOMELAB:
        print(r.replace(".", " ").replace("a", "█"))
    print(len(HOMELAB[0]), "x", len(HOMELAB))
