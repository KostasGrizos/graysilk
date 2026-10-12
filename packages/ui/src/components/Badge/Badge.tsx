import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Badge.module.css";
import { cx } from "../../internal/cx";

export type BadgeVariant = "neutral" | "outline" | "accent" | "signal";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** neutral = quiet fill · outline = border only · accent = yellow · signal = orange (needs attention) */
  variant?: BadgeVariant;
  /** Prefix a square "station" marker, like the stations in the logo. */
  station?: boolean;
  /** sm 20 px · md 24 px */
  size?: "sm" | "md";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", station = false, size = "md", className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx(styles.badge, styles[variant], styles[size], className)} {...rest}>
      {station && <span className={styles.station} aria-hidden="true" />}
      {children}
    </span>
  );
});
