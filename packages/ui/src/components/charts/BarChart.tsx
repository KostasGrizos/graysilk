import { ChartFrame } from "./ChartFrame";
import { formatCompact, niceTicks, seriesColor } from "./shared";
import styles from "./charts.module.css";

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  title: string;
  subtitle?: string;
  /** One series. Every bar wears the same slot colour: bar length already shows size. */
  data: BarDatum[];
  slot?: number;
  format?: (n: number) => string;
  /** Sort longest first (default) or keep the given order (for ordered categories). */
  sort?: boolean;
}

/** Horizontal bars with the value at the tip. Values are always visible, so no tooltip is needed. */
export function BarChart({ title, subtitle, data, slot = 1, format = formatCompact, sort = true }: BarChartProps) {
  const rows = sort ? [...data].sort((a, b) => b.value - a.value) : data;
  const ticks = niceTicks(Math.max(0, ...rows.map((d) => d.value)));
  const max = ticks[ticks.length - 1];
  const color = seriesColor(slot);
  return (
    <ChartFrame title={title} subtitle={subtitle}>
      <ul className={styles.bars}>
        {rows.map((d) => (
          <li key={d.label} className={styles.barRow}>
            <span className={styles.barLabel}>{d.label}</span>
            <span className={styles.barTrack}>
              <span className={styles.bar} style={{ width: `calc((100% - 64px) * ${max ? d.value / max : 0})`, background: color }} />
              <span className={styles.barValue}>{format(d.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
}
