import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import styles from "./Text.module.css";
import { cx } from "../../internal/cx";

export type TextVariant = "display" | "h1" | "h2" | "h3" | "body" | "small" | "label" | "code";
export type TextTone = "default" | "muted" | "accent" | "signal";

const defaultElement: Record<TextVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  small: "p",
  label: "span",
  code: "code",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Style from the type scale. Display and H1 use Silkscreen; the rest use Plex Sans or JetBrains Mono. */
  variant?: TextVariant;
  /** Element to render. Defaults to a sensible tag for the variant (h1, p, span, code…). */
  as?: ElementType;
  /** Colour role. Accent and signal switch to deeper tones on light themes to keep contrast. */
  tone?: TextTone;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = "body", as, tone = "default", className, ...rest },
  ref,
) {
  const Component = as ?? defaultElement[variant];
  return (
    <Component
      ref={ref}
      className={cx(styles.text, styles[variant], tone !== "default" && styles[tone], className)}
      {...rest}
    />
  );
});
