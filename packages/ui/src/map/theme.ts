import type { StyleSpecification } from "maplibre-gl";

export type MapTheme = "chalk" | "night";
export type MapThemeSetting = MapTheme | "system";

/** Ground and ink per map theme. Overlays use these for casings, halos and labels. */
export const MAP_THEME = {
  chalk: { ground: "#EDEDE9", ink: "#1B1B1E", muted: "#4A4A52", gsTheme: "light" },
  night: { ground: "#1B1B1E", ink: "#EDEDE9", muted: "#A9A9A4", gsTheme: "dark" },
} as const;

/** Categorical "lines" (same order and values as --gs-series-1…8), resolved for GL paint. */
export const SERIES = {
  chalk: ["#2F6FDB", "#B07C00", "#D2479B", "#6C8A1E", "#7B5CE0", "#FF5A1F", "#1C93C9", "#B4322C"],
  night: ["#4C8DF6", "#BA8400", "#E0609F", "#7A9A2A", "#8F78EC", "#EE5219", "#2E9BD0", "#E0544B"],
} as const;

/** A colour for GL paint: a categorical slot (1–8) or any hex. */
export type MapColor = number | string;
export const resolveColor = (c: MapColor, theme: MapTheme) =>
  typeof c === "number" ? SERIES[theme][Math.min(8, Math.max(1, Math.round(c))) - 1] : c;

export interface Basemap {
  /** XYZ raster tile template(s). */
  tiles: string[];
  attribution: string;
  maxzoom?: number;
  tileSize?: number;
}

/** Standard OpenStreetMap tiles. Fine for low-traffic personal pages; heavy use needs your own tile server. */
export const OSM: Basemap = {
  tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
  attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxzoom: 19,
  tileSize: 256,
};

/**
 * The OSM tiles are recoloured on the GPU so the overlays carry the colour:
 * Chalk = greyscale, lifted blacks; Night = greyscale, inverted (brightness min/max swapped).
 */
export const rasterPaint = (theme: MapTheme) =>
  theme === "chalk"
    ? { "raster-saturation": -1, "raster-contrast": -0.2, "raster-brightness-min": 0.32, "raster-brightness-max": 1, "raster-opacity": 0.92 }
    : { "raster-saturation": -1, "raster-contrast": -0.28, "raster-brightness-min": 0.74, "raster-brightness-max": 0.07, "raster-opacity": 0.95 };

export function baseStyle(theme: MapTheme, basemap: Basemap): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: basemap.tiles,
        tileSize: basemap.tileSize ?? 256,
        maxzoom: basemap.maxzoom ?? 19,
        attribution: basemap.attribution,
      },
    },
    layers: [
      { id: "gs-ground", type: "background", paint: { "background-color": MAP_THEME[theme].ground } },
      { id: "gs-basemap", type: "raster", source: "basemap", paint: rasterPaint(theme) },
    ],
  };
}
