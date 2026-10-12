import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChartFrame } from "./ChartFrame";
import { formatCompact, niceTicks, seriesColor, useWidth } from "./shared";
import styles from "./charts.module.css";

export interface LineSeries {
  id: string;
  name: string;
  values: number[];
  /** Categorical slot 1–8. Defaults to the series' position; pin it so colours follow the entity. */
  slot?: number;
}

export interface LineChartProps {
  title: string;
  subtitle?: string;
  /** X positions in order (dates, hours…). */
  labels: string[];
  series: LineSeries[];
  /** Plot height in px, x-axis band included. */
  height?: number;
  /** Value formatter for ticks, tooltip, end labels and table. */
  format?: (n: number) => string;
  /** 10 % wash under a single series. */
  area?: boolean;
}

const M = { top: 12, bottom: 28, left: 44 };

export function LineChart({ title, subtitle, labels, series, height = 240, format = formatCompact, area = false }: LineChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const n = labels.length;
  const colored = series.map((s, i) => ({ ...s, color: seriesColor(s.slot ?? i + 1) }));
  const ticks = niceTicks(Math.max(0, ...series.flatMap((s) => s.values)));
  const yMax = ticks[ticks.length - 1];

  // End labels only while they stay readable: <= 4 series and no collisions.
  const lastY = (v: number, h: number) => M.top + h - (v / yMax) * h;
  const plotH0 = height - M.top - M.bottom;
  const ends = colored.map((s) => lastY(s.values[n - 1] ?? 0, plotH0)).sort((a, b) => a - b);
  const endLabels = colored.length <= 4 && ends.every((y, i) => i === 0 || y - ends[i - 1] >= 14);
  const right = endLabels ? 56 : 16;

  const plotW = Math.max(40, width - M.left - right);
  const plotH = plotH0;
  const x = (i: number) => M.left + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 72))));

  const pick = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - box.left) / box.width) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, i)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : -1;
      setActive((a) => Math.min(n - 1, Math.max(0, (a ?? (d > 0 ? -1 : n)) + d)));
    } else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else if (e.key === "Escape") setActive(null);
  };

  const tipLeft = active == null ? 0 : x(active) + 12;
  const flip = tipLeft + 180 > width;

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      legend={colored.map((s) => ({ name: s.name, color: s.color, shape: "line" }))}
      table={{ columns: ["", ...series.map((s) => s.name)], rows: labels.map((l, i) => [l, ...series.map((s) => format(s.values[i] ?? 0))]) }}
    >
      <div
        ref={ref}
        className={styles.plot}
        tabIndex={0}
        role="group"
        aria-label={`${title}. Use the left and right arrow keys to read values.`}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        <svg width={width} height={height} className={styles.svg} aria-hidden="true">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} className={t === 0 ? styles.axis : styles.grid} />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className={styles.tick}>{format(t)}</text>
            </g>
          ))}
          {labels.map((l, i) =>
            i === n - 1 || (i % every === 0 && n - 1 - i >= every) ? (
              <text key={l + i} x={x(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className={styles.tick}>
                {l}
              </text>
            ) : null,
          )}
          {area && colored.length === 1 && (
            <path
              d={`M${x(0)},${y(0)} ` + colored[0].values.map((v, i) => `L${x(i)},${y(v)}`).join(" ") + ` L${x(n - 1)},${y(0)} Z`}
              fill={colored[0].color}
              opacity={0.1}
            />
          )}
          {colored.map((s) => (
            <path key={s.id} d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")} className={styles.line} stroke={s.color} />
          ))}
          {colored.map((s) => (
            <circle key={s.id} cx={x(n - 1)} cy={y(s.values[n - 1] ?? 0)} r={4} fill={s.color} className={styles.ring} />
          ))}
          {endLabels &&
            colored.map((s) => (
              <text key={s.id} x={x(n - 1) + 10} y={y(s.values[n - 1] ?? 0)} dy="0.32em" className={styles.endLabel}>
                {format(s.values[n - 1] ?? 0)}
              </text>
            ))}
          {active != null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + plotH} className={styles.crosshair} />
              {colored.map((s) => (
                <circle key={s.id} cx={x(active)} cy={y(s.values[active] ?? 0)} r={4} fill={s.color} className={styles.ring} />
              ))}
            </g>
          )}
          <rect
            x={M.left}
            y={M.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
        {active != null && (
          <div
            className={styles.tooltip}
            style={flip ? { right: width - x(active) + 12, top: M.top } : { left: tipLeft, top: M.top }}
            aria-live="polite"
          >
            <div className={styles.tipHead}>{labels[active]}</div>
            {colored.map((s) => (
              <div key={s.id} className={styles.tipRow}>
                <span className={styles.tipKey} style={{ background: s.color }} aria-hidden="true" />
                <strong>{format(s.values[active] ?? 0)}</strong>
                <span className={styles.tipName}>{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChartFrame>
  );
}
