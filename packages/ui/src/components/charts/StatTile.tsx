import { ArrowUp } from "pixelarticons/react/ArrowUp.js";
import { ArrowDown } from "pixelarticons/react/ArrowDown.js";
import { Icon } from "../Icon/Icon";
import styles from "./charts.module.css";

export interface StatTileProps {
  /** Sentence case, no colon: "Photos backed up". */
  label: string;
  /** Pre-formatted: "2.3 GB", "1,284", "12.9K". */
  value: string;
  delta?: {
    text: string;
    direction: "up" | "down";
    /** Whether this direction is good news. Decides the arrow colour. */
    good: boolean;
    /** "vs last week" */
    period?: string;
  };
  /** About 12 points; drawn quietly, with the latest point in the accent. */
  trend?: number[];
}

function Sparkline({ values }: { values: number[] }) {
  const w = 120, h = 32, p = 4;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [p + (i * (w - 2 * p)) / Math.max(1, values.length - 1), h - p - ((v - min) / span) * (h - 2 * p)]);
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={w} height={h} className={styles.spark} aria-hidden="true">
      <polyline points={pts.map((q) => q.join(",")).join(" ")} className={styles.sparkLine} />
      <circle cx={lx} cy={ly} r={4} className={`${styles.sparkDot} ${styles.ring}`} />
    </svg>
  );
}

/** A headline number with an optional change and trend. Use when the story is one number. */
export function StatTile({ label, value, delta, trend }: StatTileProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statRow}>
        <div className={styles.statValue}>{value}</div>
        {trend && trend.length > 1 && <Sparkline values={trend} />}
      </div>
      {delta && (
        <div className={styles.statDelta}>
          <Icon
            icon={delta.direction === "up" ? ArrowUp : ArrowDown}
            size={24}
            style={{ color: delta.good ? "var(--gs-status-ok)" : "var(--gs-status-stop)" }}
          />
          <span>{delta.text}</span>
          {delta.period && <span className={styles.statPeriod}>{delta.period}</span>}
        </div>
      )}
    </div>
  );
}
