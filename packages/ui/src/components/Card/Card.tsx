import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Card.module.css";
import { cx } from "../../internal/cx";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Element to render: div (default), section, article, or a/button for a clickable card. */
  as?: ElementType;
  /** sm 16 · md 24 · lg 32 px */
  padding?: CardPadding;
  /** surface = default card · raised = one step lighter · inverse = flips to the opposite theme ground */
  tone?: "surface" | "raised" | "inverse";
  /** Platform stripe along the top or bottom edge. Use sparingly: one striped card per view. */
  stripe?: "none" | "top" | "bottom";
  /** Hover lifts the card onto a hard pixel shadow. Use with as="a" or as="button". */
  interactive?: boolean;
  /** Extra props for link/button cards. */
  href?: string;
  type?: string;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as: Component = "div", padding = "md", tone = "surface", stripe = "none", interactive = false, className, children, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx(
        styles.card,
        styles[`pad-${padding}`],
        styles[tone],
        stripe !== "none" && styles[`stripe-${stripe}`],
        interactive && styles.interactive,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small mono label above the title, e.g. "PLATFORM 01" or "BACKUPS". */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Buttons or badges aligned to the right. */
  actions?: ReactNode;
  /** Heading level for the title. Default 3. */
  level?: 2 | 3 | 4;
}

export function CardHeader({ eyebrow, title, actions, level = 3, className, ...rest }: CardHeaderProps) {
  const Heading = `h${level}` as ElementType;
  return (
    <div className={cx(styles.header, className)} {...rest}>
      <div className={styles.headings}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <Heading className={styles.title}>{title}</Heading>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.footer, className)} {...rest} />;
}
