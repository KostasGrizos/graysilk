import { Check } from "pixelarticons/react/Check.js";
import { WarningDiamond } from "pixelarticons/react/WarningDiamond.js";
import { SquareAlert } from "pixelarticons/react/SquareAlert.js";
import { Icon } from "../Icon/Icon";
import styles from "./charts.module.css";

export type MeterStatus = "ok" | "caution" | "stop";

export interface MeterProps {
  label: string;
  value: number;
  max: number;
  /** Text shown for the value, e.g. "412 GB of 1.9 TB". */
  valueText?: string;
  /** Fractions of max where the meter turns caution / stop. Default 0.75 / 0.9. */
  thresholds?: { caution: number; stop: number };
  /** Higher is worse (disk, CPU) by default. Set false for battery-like meters. */
  higherIsWorse?: boolean;
}

const META: Record<MeterStatus, { text: string; icon: typeof Check; color: string }> = {
  ok: { text: "OK", icon: Check, color: "var(--gs-status-ok)" },
  caution: { text: "Caution", icon: WarningDiamond, color: "var(--gs-status-caution)" },
  stop: { text: "Stop", icon: SquareAlert, color: "var(--gs-status-stop)" },
};

/** A single bounded value. The fill carries status; the track is a lighter step of the same colour. */
export function Meter({ label, value, max, valueText, thresholds = { caution: 0.75, stop: 0.9 }, higherIsWorse = true }: MeterProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const level = higherIsWorse ? ratio : 1 - ratio;
  const status: MeterStatus = level >= thresholds.stop ? "stop" : level >= thresholds.caution ? "caution" : "ok";
  const meta = META[status];
  return (
    <div className={styles.meter} style={{ ["--fill" as string]: meta.color }}>
      <div className={styles.meterHead}>
        <span className={styles.meterLabel}>{label}</span>
        <span className={styles.meterStatus}>
          <Icon icon={meta.icon} size={24} className={styles.meterIcon} />
          {meta.text}
        </span>
      </div>
      <div
        className={styles.meterTrack}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${valueText ?? `${value} of ${max}`}, ${meta.text}`}
      >
        <span className={styles.meterFill} style={{ width: `${ratio * 100}%` }} />
      </div>
      {valueText && <div className={styles.meterValue}>{valueText}</div>}
    </div>
  );
}
