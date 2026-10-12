import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../../internal/cx";
import styles from "./LineMap.module.css";

/** lit = running · unlit = off · busy = changing (blinks in steps) · alert = needs attention · planned = not built yet. */
export type StationState = "lit" | "unlit" | "busy" | "alert" | "planned";

export interface LineStation {
  id: string;
  name: string;
  state: StationState;
  /** Words for the state, read by screen readers and shown as a tooltip: "Running". */
  stateLabel: string;
  /** Makes the station a button. */
  onSelect?: () => void;
  /** Makes the station a link (ignored when onSelect is set). */
  href?: string;
}

export interface Line {
  id: string;
  name: ReactNode;
  /** Plain-text name for screen readers when `name` is not a string. */
  label?: string;
  /** Colour of the track, e.g. "var(--gs-series-3)". Defaults to the ink colour. */
  color?: string;
  stations: LineStation[];
}

export interface LineMapProps extends HTMLAttributes<HTMLElement> {
  lines: Line[];
  /** Accessible name of the whole map, e.g. "Service lines". */
  label: string;
}

/**
 * The brand's line map: each line is a group, each station one item on it, ending in the
 * yellow terminus. States differ in shape as well as colour (filled, hollow, ringed).
 */
export function LineMap({ lines, label, className, ...rest }: LineMapProps) {
  return (
    <nav aria-label={label} className={cx(styles.map, className)} {...rest}>
      <ul className={styles.lines}>
        {lines.map((line) => {
          const lineName = line.label ?? (typeof line.name === "string" ? line.name : line.id);
          return (
            <li key={line.id} className={styles.line} style={line.color ? ({ ["--line-color" as string]: line.color } as CSSProperties) : undefined}>
              <span className={styles.name} id={`gs-line-${line.id}`}>{line.name}</span>
              <ol className={styles.track} aria-labelledby={`gs-line-${line.id}`}>
                {line.stations.map((station) => {
                  const content = (
                    <>
                      <span className={cx(styles.station, styles[station.state])} aria-hidden="true" />
                      <span className={styles.stationName}>{station.name}</span>
                      <span className={styles.srOnly}>, {station.stateLabel}</span>
                    </>
                  );
                  return (
                    <li key={station.id} className={styles.stop} title={`${station.name}: ${station.stateLabel}`}>
                      {station.onSelect ? (
                        <button type="button" className={styles.target} onClick={station.onSelect} aria-label={`${station.name}, ${station.stateLabel} (${lineName})`}>
                          {content}
                        </button>
                      ) : station.href ? (
                        <a className={styles.target} href={station.href} aria-label={`${station.name}, ${station.stateLabel} (${lineName})`}>
                          {content}
                        </a>
                      ) : (
                        <span className={styles.target}>{content}</span>
                      )}
                    </li>
                  );
                })}
                <li className={styles.terminus} aria-hidden="true" />
              </ol>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
