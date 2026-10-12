/*
 * Pixel bitmaps shared by components. Source of truth: branding/source/bitmaps.py
 * (keep them in step). One character per cell; "." is empty.
 */

/** The 16 × 16 mark. a = line, b = terminus (yellow), c = station (orange). */
export const MARK = [
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
];

/** The mark's station cells in order along the line: top, left, bottom. */
export const MARK_STATIONS: Array<[number, number]> = [
  [8, 2],
  [1, 9],
  [8, 13],
];

/** 16 × 7 pixel train, nose to the right. a = body, b = yellow stripe, d = wheels. */
export const TRAIN = [
  ".aaaaaaaaaaaa...",
  "aaaaaaaaaaaaaa..",
  "aa..a..a..a..aa.",
  "aa..a..a..a..aa.",
  "aaaaaaaaaaaaaaa.",
  "abbbbbbbbbbbbbb.",
  "dd.dd....dd.dd..",
];

export interface Run { x: number; y: number; w: number; ch: string }

/** Horizontal runs of equal cells, so a bitmap draws as few <rect>s. */
export function runs(bitmap: string[], skip: (ch: string) => boolean = (ch) => ch === "."): Run[] {
  const out: Run[] = [];
  bitmap.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (!skip(ch)) out.push({ x, y, w: end - x, ch });
      x = end;
    }
  });
  return out;
}
