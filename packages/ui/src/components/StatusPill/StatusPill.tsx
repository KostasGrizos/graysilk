import type { HTMLAttributes } from "react";
import { Check } from "pixelarticons/react/Check.js";
import { Hourglass } from "pixelarticons/react/Hourglass.js";
import { WarningDiamond } from "pixelarticons/react/WarningDiamond.js";
import { SquareAlert } from "pixelarticons/react/SquareAlert.js";
import { Minus } from "pixelarticons/react/Minus.js";
import { Icon, type IconComponent } from "../Icon/Icon";
import { cx } from "../../internal/cx";
import styles from "./StatusPill.module.css";

/** Railway signal aspects: ok · caution (working, wait) · attention (look at me) · stop (failed) · unknown (off, no data). */
export type Status = "ok" | "caution" | "attention" | "stop" | "unknown";

const ICONS: Record<Status, IconComponent> = {
  ok: Check,
  caution: Hourglass,
  attention: WarningDiamond,
  stop: SquareAlert,
  unknown: Minus,
};

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status: Status;
  /** The word that names the state: "Running", "Starting", "Stopped". Always shown: colour is never the only cue. */
  label: string;
  /** Replace the default icon for the status. */
  icon?: IconComponent;
  /** quiet = icon + word only · solid = on a tinted ground. */
  variant?: "quiet" | "solid";
}

/** A state shown with an icon, a word and a status colour, in that order of importance. */
export function StatusPill({ status, label, icon, variant = "quiet", className, ...rest }: StatusPillProps) {
  return (
    <span className={cx(styles.pill, styles[status], styles[variant], className)} data-status={status} {...rest}>
      <Icon icon={icon ?? ICONS[status]} className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
