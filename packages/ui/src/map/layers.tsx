import type { ExpressionSpecification, GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { useMap } from "./context";
import { resolveColor, type MapColor } from "./theme";

type Data = GeoJSON.Feature | GeoJSON.FeatureCollection;
const width = (w: number): ExpressionSpecification => ["interpolate", ["linear"], ["zoom"], 10, w * 0.5, 14, w, 18, w * 1.8];

/** Keeps a GeoJSON source in sync with `data` and removes it (and its layers) on unmount. */
function useSource(id: string, data: Data, layerIds: string[], add: () => void) {
  const { map } = useMap();
  const added = useRef(false);
  useEffect(() => {
    if (!map) return;
    map.addSource(id, { type: "geojson", data });
    add();
    added.current = true;
    return () => {
      added.current = false;
      if (!map.getStyle()) return;
      for (const l of layerIds) if (map.getLayer(l)) map.removeLayer(l);
      if (map.getSource(id)) map.removeSource(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id]);
  useEffect(() => {
    if (map && added.current) (map.getSource(id) as GeoJSONSource | undefined)?.setData(data);
  }, [map, id, data]);
  return map;
}

function useVisibility(layerIds: string[], visible: boolean) {
  const { map } = useMap();
  useEffect(() => {
    if (!map) return;
    for (const l of layerIds) if (map.getLayer(l)) map.setLayoutProperty(l, "visibility", visible ? "visible" : "none");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, visible, layerIds.join()]);
}

export interface LineLayerProps {
  id: string;
  /** LineString / MultiLineString features. A feature's `offset` property overrides `offset` for that piece. */
  data: Data;
  /** Slot 1–8 from the data palette, "ink", or a hex. */
  color: MapColor;
  /** Line width at zoom 14, in px. */
  width?: number;
  /**
   * Sideways shift at zoom 14, in px (positive = right of the drawing direction). Use it to run
   * lines side by side where they share track; parallelOffset(width) gives the right spacing.
   */
  offset?: number;
  /** Dashed = planned or under construction. */
  dashed?: boolean;
  /** A ground-coloured casing so lines stay readable over the basemap and each other. */
  casing?: boolean;
  visible?: boolean;
  /** Click / tap on the line. A 16 px invisible hit area makes thin lines easy to tap. */
  onClick?: (feature: GeoJSON.Feature, e: MapLayerMouseEvent) => void;
}

/** Offsets for lines sharing track: centres one width + 2 px apart, with a ground gap between. */
export const parallelOffset = (width = 5) => (width + 2) / 2;

const scaled = (v: ExpressionSpecification | number): ExpressionSpecification => [
  "interpolate", ["linear"], ["zoom"], 10, ["*", 0.5, v], 14, v, 18, ["*", 1.8, v],
];

/** A route, line or path drawn over the map. */
export function LineLayer({ id, data, color, width: w = 5, offset = 0, dashed = false, casing = true, visible = true, onClick }: LineLayerProps) {
  const { theme, ground } = useMap();
  const ids = [`${id}-casing`, id, `${id}-hit`];
  const shift = scaled(["coalesce", ["get", "offset"], offset]);
  const map = useSource(id, data, ids, () => {
    if (casing)
      map!.addLayer({ id: `${id}-casing`, type: "line", source: id, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ground, "line-width": width(w + 4), "line-offset": shift } });
    map!.addLayer({
      id, type: "line", source: id,
      layout: { "line-cap": dashed ? "butt" : "round", "line-join": "round" },
      paint: { "line-color": resolveColor(color, theme), "line-width": width(w), "line-offset": shift, ...(dashed ? { "line-dasharray": [1.4, 1] } : {}) },
    });
    map!.addLayer({ id: `${id}-hit`, type: "line", source: id, layout: { "line-join": "round" }, paint: { "line-color": "#000", "line-opacity": 0, "line-width": 16, "line-offset": shift } });
  });
  useVisibility(ids, visible);
  useEffect(() => {
    if (!map?.getLayer(id)) return;
    map.setPaintProperty(id, "line-color", resolveColor(color, theme));
    if (map.getLayer(`${id}-casing`)) map.setPaintProperty(`${id}-casing`, "line-color", ground);
  }, [map, id, color, theme, ground]);
  useEffect(() => {
    if (!map || !onClick) return;
    const hit = `${id}-hit`;
    const click = (e: MapLayerMouseEvent) => e.features?.[0] && onClick(e.features[0] as unknown as GeoJSON.Feature, e);
    const enter = () => (map.getCanvas().style.cursor = "pointer");
    const leave = () => (map.getCanvas().style.cursor = "");
    map.on("click", hit, click);
    map.on("mouseenter", hit, enter);
    map.on("mouseleave", hit, leave);
    return () => {
      map.off("click", hit, click);
      map.off("mouseenter", hit, enter);
      map.off("mouseleave", hit, leave);
    };
  }, [map, id, onClick]);
  return null;
}

export interface AreaLayerProps {
  id: string;
  /** Polygon / MultiPolygon features. */
  data: Data;
  color: MapColor;
  /** Fill strength, 0–1. Areas stay a wash (default 0.12) so lines and points read on top. */
  fillOpacity?: number;
  /** Per-feature colour for choropleths; overrides `color`. */
  getColor?: (feature: GeoJSON.Feature) => string;
  outline?: boolean;
  /** Outline strength, 0–1 (default 0.8). */
  outlineOpacity?: number;
  /** Dashed outline, e.g. for catchments and study areas (soft edges). */
  outlineDashed?: boolean;
  visible?: boolean;
}

/** Zones, catchments, study areas, choropleths. */
export function AreaLayer({ id, data, color, fillOpacity = 0.12, getColor, outline = true, outlineOpacity = 0.8, outlineDashed = false, visible = true }: AreaLayerProps) {
  const { theme } = useMap();
  const painted: Data = getColor
    ? { type: "FeatureCollection", features: (data.type === "FeatureCollection" ? data.features : [data]).map((f) => ({ ...f, properties: { ...f.properties, __gs_fill: getColor(f) } })) }
    : data;
  const fill = (): ExpressionSpecification | string => (getColor ? ["get", "__gs_fill"] : resolveColor(color, theme));
  const ids = [`${id}-fill`, `${id}-outline`];
  const map = useSource(id, painted, ids, () => {
    map!.addLayer({ id: `${id}-fill`, type: "fill", source: id, paint: { "fill-color": fill(), "fill-opacity": fillOpacity } });
    if (outline) map!.addLayer({ id: `${id}-outline`, type: "line", source: id, paint: { "line-color": fill(), "line-width": 1.5, "line-opacity": outlineOpacity, ...(outlineDashed ? { "line-dasharray": [3, 2] } : {}) } });
  });
  useVisibility(ids, visible);
  useEffect(() => {
    if (!map?.getLayer(`${id}-fill`)) return;
    map.setPaintProperty(`${id}-fill`, "fill-color", fill());
    if (map.getLayer(`${id}-outline`)) map.setPaintProperty(`${id}-outline`, "line-color", fill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id, theme, color]);
  return null;
}
