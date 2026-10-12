import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import buttonStyles from "../Button/Button.module.css";
import styles from "./IconButton.module.css";
import { cx } from "../../internal/cx";
import { StationLoader } from "../../internal/StationLoader";
import type { ButtonSize, ButtonVariant } from "../Button/Button";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  /** Accessible name, also shown as the tooltip. Required: an icon alone says nothing to a screen reader. */
  label: string;
  /** The icon, a Pixelarticons component (24 px grid). */
  icon: ReactNode;
  variant?: ButtonVariant;
  /** sm 32 · md 40 · lg 48 px square */
  size?: ButtonSize;
  loading?: boolean;
  /** Show a tooltip with the label on hover (native title). Default true. */
  showTooltip?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    icon,
    variant = "ghost",
    size = "md",
    loading = false,
    showTooltip = true,
    disabled,
    type = "button",
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={showTooltip ? label : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        buttonStyles.button,
        buttonStyles[variant],
        styles.square,
        styles[size],
        loading && buttonStyles.loading,
        className,
      )}
      {...rest}
    >
      <span className={cx(buttonStyles.content, styles.icon)} aria-hidden="true">{icon}</span>
      {loading && <StationLoader className={buttonStyles.loader} />}
    </button>
  );
});
