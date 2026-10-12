import type { HTMLAttributes } from "react";
import { cx } from "../../internal/cx";
import { TrainCells } from "../PixelTrain/PixelTrain";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** What is in progress, e.g. "Restoring photos". Shown above the bar and used as its name. */
  label: string;
  /** Leave undefined while the amount of work is unknown: the pixel train runs along the line instead. */
  value?: number;
  max?: number;
  /** Text for the value, e.g. "1.2 of 4 GB". Defaults to a percentage. */
  valueText?: string;
  /** The bar is made of this many pixel blocks; it fills one whole block at a time. */
  segments?: number;
  /** accent = yellow (default) · signal = orange, for work that needs attention when done. */
  tone?: "accent" | "signal";
  /** Hide the label row (the label still names the bar for screen readers). */
  hideLabel?: boolean;
}

/**
 * Progress of a task (backup, restore, import). Fills in whole blocks; with no value it
 * shows the pixel train running along the track. For bounded levels with status
 * (disk, CPU), use Meter instead.
 */
export function ProgressBar({ label, value, max = 100, valueText, segments = 24, tone = "accent", hideLabel = false, className, ...rest }: ProgressBarProps) {
  const known = typeof value === "number" && Number.isFinite(value);
  const ratio = known && max > 0 ? Math.min(1, Math.max(0, value! / max)) : 0;
  const filled = Math.round(ratio * segments);
  const shown = known ? valueText ?? `${Math.round(ratio * 100)}%` : valueText ?? "Working…";

  return (
    <div className={cx(styles.progress, tone === "signal" && styles.signal, className)} {...rest}>
      {!hideLabel && (
        <div className={styles.head}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{shown}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={known ? 0 : undefined}
        aria-valuemax={known ? max : undefined}
        aria-valuenow={known ? value : undefined}
        aria-valuetext={known ? shown : undefined}
        className={cx(styles.track, !known && styles.indeterminate)}
        style={{ ["--segments" as string]: segments }}
      >
        {known ? (
          Array.from({ length: segments }, (_, i) => <span key={i} className={cx(styles.block, i < filled && styles.on)} data-on={i < filled || undefined} />)
        ) : (
          <span className={styles.runner} aria-hidden="true">
            <svg viewBox="0 0 16 7" width={32} height={14} shapeRendering="crispEdges">
              <TrainCells />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
