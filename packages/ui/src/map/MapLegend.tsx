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
}

/** Key for the overlay layers, in a card over the map. Entries can toggle their layers. */
export function MapLegend({ title = "Layers", entries, onToggle }: MapLegendProps) {
  const { theme } = useMap();
  return (
    <section className="gs-map-legend" aria-label={title}>
      <h3 className="gs-map-legend-title">{title}</h3>
      <ul>
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
