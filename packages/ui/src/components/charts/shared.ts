import { useEffect, useRef, useState } from "react";

/** Measure an element's content width (charts redraw to fit their card). */
export function useWidth<T extends HTMLElement>(fallback = 480) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(160, Math.round(el.getBoundingClientRect().width)) || fallback);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, width] as const;
}

/** Round a maximum up to a clean axis end and return evenly spaced ticks. */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(10));
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
/** 950 · 1.2K · 3.4M */
export const formatCompact = (n: number) => compact.format(n);

/** CSS colour for a categorical slot (1–8). Slots follow the entity, never its rank. */
export const seriesColor = (slot: number) => `var(--gs-series-${Math.min(8, Math.max(1, Math.round(slot)))})`;
