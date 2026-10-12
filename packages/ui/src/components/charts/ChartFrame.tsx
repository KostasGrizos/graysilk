import { useId, useState, type ReactNode } from "react";
import styles from "./charts.module.css";
import { cx } from "../../internal/cx";

export interface LegendItem {
  name: string;
  color: string;
  /** Legend key mirrors the mark: a short line for line charts, a square for bars and areas. */
  shape?: "line" | "square";
}

export interface ChartFrameProps {
  title: string;
  subtitle?: string;
  legend?: LegendItem[];
  /** Rows for the table view: first entry is the header. Omit to hide the toggle. */
  table?: { columns: string[]; rows: Array<Array<string | number>> };
  children: ReactNode;
  className?: string;
}

/** Title, legend and a table-view toggle around any chart. */
export function ChartFrame({ title, subtitle, legend, table, children, className }: ChartFrameProps) {
  const [showTable, setShowTable] = useState(false);
  const id = useId();
  return (
    <figure className={cx(styles.frame, className)} aria-labelledby={`${id}-t`}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <figcaption id={`${id}-t`} className={styles.title}>{title}</figcaption>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        {table && (
          <button
            type="button"
            className={styles.toggle}
            aria-pressed={showTable}
            aria-controls={`${id}-body`}
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? "Chart" : "Table"}
          </button>
        )}
      </div>
      {legend && legend.length > 1 && !showTable && (
        <ul className={styles.legend} aria-label="Legend">
          {legend.map((item) => (
            <li key={item.name} className={styles.legendItem}>
              <span
                className={item.shape === "square" ? styles.keySquare : styles.keyLine}
                style={{ background: item.color }}
                aria-hidden="true"
              />
              {item.name}
            </li>
          ))}
        </ul>
      )}
      <div id={`${id}-body`}>
        {showTable && table ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>{table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </figure>
  );
}
