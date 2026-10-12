import type { SVGAttributes } from "react";
import { runs, TRAIN } from "../../internal/bitmaps";
import { cx } from "../../internal/cx";
import styles from "./PixelTrain.module.css";

export interface PixelTrainProps extends Omit<SVGAttributes<SVGSVGElement>, "direction"> {
  /** Pixels per cell, whole numbers only (1–8). 2 = 32 × 14 px. */
  scale?: number;
  /** Which way the nose points. */
  direction?: "right" | "left";
  /** Body colour; any CSS colour. Defaults to the text colour. */
  color?: string;
  /** Accessible name. Without it the train is decorative (hidden from screen readers). */
  label?: string;
}

const CLASS: Record<string, string> = { a: styles.body, b: styles.stripe, d: styles.wheels };

/** The brand's pixel train (16 × 7 cells), for loading, progress and empty states. */
export function PixelTrain({ scale = 2, direction = "right", color, label, className, style, ...rest }: PixelTrainProps) {
  const s = Math.min(8, Math.max(1, Math.round(scale)));
  return (
    <svg
      viewBox="0 0 16 7"
      width={16 * s}
      height={7 * s}
      shapeRendering="crispEdges"
      className={cx(styles.train, direction === "left" && styles.left, className)}
      style={color ? { ...style, ["--gs-train" as string]: color } : style}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...rest}
    >
      <TrainCells />
    </svg>
  );
}

/** The train's rects, for use inside another SVG (e.g. a moving loader). */
export function TrainCells({ x = 0 }: { x?: number }) {
  return (
    <>
      {runs(TRAIN).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={x + r.x} y={r.y} width={r.w} height={1} className={CLASS[r.ch]} />
      ))}
    </>
  );
}
