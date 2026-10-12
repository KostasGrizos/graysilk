import styles from "./StationLoader.module.css";
import { cx } from "./cx";

/** Three stations lighting up in turn: the brand's pixel loading indicator. */
export function StationLoader({ className }: { className?: string }) {
  return (
    <span className={cx(styles.loader, className)} aria-hidden="true">
      <span className={styles.station} />
      <span className={styles.station} />
      <span className={styles.station} />
    </span>
  );
}
