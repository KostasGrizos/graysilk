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
  /** LineString / MultiLineString features. */
  data: Data;
  /** Slot 1–8 from the data palette, or a hex. */
  color: MapColor;
  /** Line width at zoom 14, in px. */
  width?: number;
  /** Dashed = planned or under construction. */
  dashed?: boolean;
  /** A ground-coloured casing so lines stay readable over the basemap and each other. */
  casing?: boolean;
  visible?: boolean;
  onClick?: (feature: GeoJSON.Feature, e: MapLayerMouseEvent) => void;
}

/** A route, line or path drawn over the map. */
export function LineLayer({ id, data, color, width: w = 5, dashed = false, casing = true, visible = true, onClick }: LineLayerProps) {
  const { theme, ground } = useMap();
  const ids = [`${id}-casing`, id];
  const map = useSource(id, data, ids, () => {
    if (casing)
      map!.addLayer({ id: `${id}-casing`, type: "line", source: id, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ground, "line-width": width(w + 4) } });
    map!.addLayer({
      id, type: "line", source: id,
      layout: { "line-cap": dashed ? "butt" : "round", "line-join": "round" },
      paint: { "line-color": resolveColor(color, theme), "line-width": width(w), ...(dashed ? { "line-dasharray": [1.4, 1] } : {}) },
    });
  });
  useVisibility(ids, visible);
  useEffect(() => {
    if (!map?.getLayer(id)) return;
    map.setPaintProperty(id, "line-color", resolveColor(color, theme));
    if (map.getLayer(`${id}-casing`)) map.setPaintProperty(`${id}-casing`, "line-color", ground);
  }, [map, id, color, theme, ground]);
  useEffect(() => {
    if (!map || !onClick) return;
    const click = (e: MapLayerMouseEvent) => e.features?.[0] && onClick(e.features[0] as unknown as GeoJSON.Feature, e);
    const enter = () => (map.getCanvas().style.cursor = "pointer");
    const leave = () => (map.getCanvas().style.cursor = "");
    map.on("click", id, click);
    map.on("mouseenter", id, enter);
    map.on("mouseleave", id, leave);
    return () => {
      map.off("click", id, click);
      map.off("mouseenter", id, enter);
      map.off("mouseleave", id, leave);
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
  visible?: boolean;
}

/** Zones, catchments, study areas, choropleths. */
export function AreaLayer({ id, data, color, fillOpacity = 0.12, getColor, outline = true, outlineOpacity = 0.8, visible = true }: AreaLayerProps) {
  const { theme } = useMap();
  const painted: Data = getColor
    ? { type: "FeatureCollection", features: (data.type === "FeatureCollection" ? data.features : [data]).map((f) => ({ ...f, properties: { ...f.properties, __gs_fill: getColor(f) } })) }
    : data;
  const fill = (): ExpressionSpecification | string => (getColor ? ["get", "__gs_fill"] : resolveColor(color, theme));
  const ids = [`${id}-fill`, `${id}-outline`];
  const map = useSource(id, painted, ids, () => {
    map!.addLayer({ id: `${id}-fill`, type: "fill", source: id, paint: { "fill-color": fill(), "fill-opacity": fillOpacity } });
    if (outline) map!.addLayer({ id: `${id}-outline`, type: "line", source: id, paint: { "line-color": fill(), "line-width": 1.5, "line-opacity": outlineOpacity } });
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
