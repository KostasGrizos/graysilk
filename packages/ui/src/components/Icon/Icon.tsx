import type { ComponentType, SVGProps } from "react";
import { cx } from "../../internal/cx";
import styles from "./Icon.module.css";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** A Pixelarticons component, e.g. `import { Server } from "pixelarticons/react/Server.js"`. */
  icon: IconComponent;
  /** 24 (default) or 48. The icons sit on a 24 px grid; other sizes blur the pixels. */
  size?: 24 | 48;
  /** Accessible name. Leave empty for decorative icons next to visible text. */
  label?: string;
}

/**
 * Renders a Pixelarticons icon at a crisp size, in currentColor.
 * Decorative by default (aria-hidden); pass `label` when the icon carries meaning alone.
 */
export function Icon({ icon: Glyph, size = 24, label, className, ...rest }: IconProps) {
  return (
    <Glyph
      width={size}
      height={size}
      className={cx(styles.icon, className)}
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...rest}
    />
  );
}
