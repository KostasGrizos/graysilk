import maplibregl, { type Map as GLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapContext } from "./context";
import { ZoomIn } from "pixelarticons/react/ZoomIn.js";
import { ZoomOut } from "pixelarticons/react/ZoomOut.js";
import { Compass } from "pixelarticons/react/Compass.js";
import { Target } from "pixelarticons/react/Target.js";
import { IconButton } from "../components/IconButton/IconButton";
import { baseStyle, MAP_THEME, OSM, rasterPaint, type Basemap, type MapTheme, type MapThemeSetting } from "./theme";

export { useMap } from "./context";

function useResolvedTheme(setting: MapThemeSetting): MapTheme {
  const query = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [dark, setDark] = useState(() => query?.matches ?? false);
  useEffect(() => {
    if (!query) return;
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    query.addEventListener("change", on);
    return () => query.removeEventListener("change", on);
  }, [query]);
  return setting === "system" ? (dark ? "night" : "chalk") : setting;
}

export interface MapViewProps {
  /** [lng, lat] */
  center: [number, number];
  zoom?: number;
  /** chalk (light) · night (dark) · system (follows the OS, default). */
  theme?: MapThemeSetting;
  /** Raster basemap. Defaults to standard OpenStreetMap tiles, recoloured to the theme. */
  basemap?: Basemap;
  /** CSS height of the map box. */
  height?: number | string;
  /** Accessible name, e.g. "Thessaloniki metro map". */
  label: string;
  /** Show the zoom / north / recenter controls. */
  controls?: boolean;
  /** Overlay layers, legend, popups. */
  children?: ReactNode;
  className?: string;
  /** Escape hatch for the underlying MapLibre map. */
  onReady?: (map: GLMap) => void;
}

/** An interactive OpenStreetMap in the GraySilk theme. Put overlay layers inside as children. */
export function MapView({ center, zoom = 13, theme = "system", basemap = OSM, height = 480, label, controls = true, children, className, onReady }: MapViewProps) {
  const box = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GLMap | null>(null);
  const resolved = useResolvedTheme(theme);
  const home = useRef({ center, zoom });

  useEffect(() => {
    if (!box.current) return;
    const m = new maplibregl.Map({
      container: box.current,
      style: baseStyle(resolved, basemap),
      center,
      zoom,
      attributionControl: false,
      dragRotate: true,
      cooperativeGestures: false,
    });
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    m.addControl(new maplibregl.ScaleControl({ maxWidth: 96 }), "bottom-right");
    // Ready as soon as the style is in, so overlays don't wait for (or depend on) basemap tiles.
    let ready = false;
    const markReady = () => {
      if (ready) return;
      ready = true;
      setMap(m);
      onReady?.(m);
    };
    m.once("style.load", markReady);
    m.once("load", markReady);
    return () => {
      setMap(null);
      m.remove();
    };
    // the map is created once; later prop changes are applied below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    map.setPaintProperty("gs-ground", "background-color", MAP_THEME[resolved].ground);
    for (const [k, v] of Object.entries(rasterPaint(resolved))) map.setPaintProperty("gs-basemap", k, v);
  }, [map, resolved]);

  const t = MAP_THEME[resolved];
  return (
    <MapContext.Provider value={{ map, theme: resolved, ground: t.ground, ink: t.ink }}>
      <div className={`gs-map ${className ?? ""}`} data-gs-theme={t.gsTheme} style={{ height }}>
        <div ref={box} className="gs-map-canvas" role="region" aria-label={label} />
        {controls && map && (
          <div className="gs-map-controls">
            <IconButton label="Zoom in" icon={<ZoomIn />} variant="secondary" size="sm" onClick={() => map.zoomIn()} />
            <IconButton label="Zoom out" icon={<ZoomOut />} variant="secondary" size="sm" onClick={() => map.zoomOut()} />
            <IconButton label="Face north" icon={<Compass />} variant="secondary" size="sm" onClick={() => map.resetNorthPitch()} />
            <IconButton label="Back to start" icon={<Target />} variant="secondary" size="sm" onClick={() => map.flyTo({ ...home.current, bearing: 0, pitch: 0 })} />
          </div>
        )}
        {children}
      </div>
    </MapContext.Provider>
  );
}
