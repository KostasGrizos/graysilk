import type { HTMLAttributes } from "react";
import { MARK, MARK_STATIONS, runs } from "../../internal/bitmaps";
import { cx } from "../../internal/cx";
import { TrainCells } from "../PixelTrain/PixelTrain";
import styles from "./Loader.module.css";

export type LoaderVariant = "stations" | "train" | "mark";
export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * stations = three squares lighting in turn (inline, small spaces) ·
   * train = the pixel train running along a line (panels, empty states) ·
   * mark = the logo's stations lighting up along the G (app start, splash)
   */
  variant?: LoaderVariant;
  /** Whole-pixel scale: sm 2× · md 3× · lg 4×. */
  size?: LoaderSize;
  /** What is loading, read by screen readers ("Loading photos"). */
  label?: string;
  /** Also show the label as text next to the loader. */
  showLabel?: boolean;
}

const SCALE: Record<LoaderSize, number> = { sm: 2, md: 3, lg: 4 };
const TRACK = 32;

/**
 * The brand's loading indicator. Motion is stepped (whole cells), and it holds a still
 * frame when the viewer asks for reduced motion. Announced politely as a status.
 */
export function Loader({ variant = "stations", size = "md", label = "Loading", showLabel = false, className, ...rest }: LoaderProps) {
  const s = SCALE[size];
  return (
    <span role="status" className={cx(styles.loader, styles[size], className)} {...rest}>
      {variant === "stations" && (
        <svg viewBox="0 0 13 3" width={13 * s} height={3 * s} shapeRendering="crispEdges" aria-hidden="true" className={styles.stations}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={i * 5} y={0} width={3} height={3} className={styles.station} />
          ))}
        </svg>
      )}
      {variant === "train" && (
        <svg viewBox={`0 0 ${TRACK} 8`} width={TRACK * s} height={8 * s} shapeRendering="crispEdges" aria-hidden="true" className={styles.trainLoader}>
          <g className={styles.run}>
            <TrainCells x={0} />
            <TrainCells x={TRACK} />
          </g>
          <rect x={0} y={7} width={TRACK} height={1} className={styles.track} />
        </svg>
      )}
      {variant === "mark" && (
        <svg viewBox="0 0 16 16" width={16 * s} height={16 * s} shapeRendering="crispEdges" aria-hidden="true" className={styles.mark}>
          {runs(MARK, (ch) => ch === "." || ch === "c").map((r) => (
            <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} className={r.ch === "b" ? styles.terminus : styles.line} />
          ))}
          {MARK_STATIONS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={1} height={1} className={cx(styles.line, styles.markStation)} />
          ))}
        </svg>
      )}
      <span className={showLabel ? styles.label : styles.srOnly}>{label}</span>
    </span>
  );
}
