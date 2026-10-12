import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";
import { cx } from "../../internal/cx";
import { StationLoader } from "../../internal/StationLoader";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = yellow key with a ledge (one per view) · secondary = outline · ghost = quiet · danger = orange key */
  variant?: ButtonVariant;
  /** sm 32 px · md 40 px · lg 48 px */
  size?: ButtonSize;
  /** Shows the station loader, disables the button and sets aria-busy. The label stays for screen readers. */
  loading?: boolean;
  /** Icon before the label (e.g. a lucide-react icon). */
  iconStart?: ReactNode;
  /** Icon after the label. */
  iconEnd?: ReactNode;
  /** Stretch to the container width. */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    iconStart,
    iconEnd,
    fullWidth = false,
    disabled,
    type = "button",
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      {...rest}
    >
      <span className={styles.content}>
        {iconStart && <span className={styles.icon} aria-hidden="true">{iconStart}</span>}
        {children != null && <span className={styles.label}>{children}</span>}
        {iconEnd && <span className={styles.icon} aria-hidden="true">{iconEnd}</span>}
      </span>
      {loading && <StationLoader className={styles.loader} />}
    </button>
  );
});
