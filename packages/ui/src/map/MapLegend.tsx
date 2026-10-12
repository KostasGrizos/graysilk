import { useEffect, useId, useState } from "react";
import { ChevronDown } from "pixelarticons/react/ChevronDown.js";
import { ChevronUp } from "pixelarticons/react/ChevronUp.js";
import { Icon } from "../components/Icon/Icon";
import { useMap } from "./context";
import { resolveColor, type MapColor } from "./theme";

export interface LegendEntry {
  id: string;
  label: string;
  kind: "line" | "planned" | "area" | "station" | "point" | "vehicle";
  color: MapColor;
  visible?: boolean;
}

export interface MapLegendProps {
  title?: string;
  entries: LegendEntry[];
  /** Makes each entry a toggle button that shows or hides its layer. */
  onToggle?: (id: string) => void;
  /**
   * The title folds the list away. Starts folded on narrow maps (under 560 px) so the
   * legend doesn't cover a phone-sized map; `defaultOpen` overrides that.
   */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

/** Key for the overlay layers, in a card over the map. Entries can toggle their layers. */
export function MapLegend({ title = "Layers", entries, onToggle, collapsible = true, defaultOpen }: MapLegendProps) {
  const { map, theme } = useMap();
  const listId = useId();
  const [open, setOpen] = useState(defaultOpen ?? true);
  useEffect(() => {
    if (defaultOpen === undefined && collapsible && map) setOpen(map.getContainer().clientWidth >= 560);
  }, [map, collapsible, defaultOpen]);
  const expanded = !collapsible || open;

  return (
    <section className="gs-map-legend" aria-label={title} data-open={expanded || undefined}>
      {collapsible ? (
        <button type="button" className="gs-map-legend-title" aria-expanded={expanded} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
          <span>{title}</span>
          <Icon icon={expanded ? ChevronDown : ChevronUp} />
        </button>
      ) : (
        <h3 className="gs-map-legend-title">{title}</h3>
      )}
      <ul id={listId} hidden={!expanded}>
        {entries.map((e) => {
          const key = <span className={`gs-key gs-key-${e.kind}`} style={{ ["--key" as string]: resolveColor(e.color, theme) }} aria-hidden="true" />;
          return (
            <li key={e.id}>
              {onToggle ? (
                <button type="button" aria-pressed={e.visible !== false} onClick={() => onToggle(e.id)}>
                  {key}
                  <span>{e.label}</span>
                </button>
              ) : (
                <span className="gs-map-legend-row">
                  {key}
                  <span>{e.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
