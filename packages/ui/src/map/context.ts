import type { Map as GLMap } from "maplibre-gl";
import { createContext, useContext } from "react";
import { MAP_THEME, type MapTheme } from "./theme";

export interface MapContextValue {
  map: GLMap | null;
  theme: MapTheme;
  ground: string;
  ink: string;
}
export const MapContext = createContext<MapContextValue>({ map: null, theme: "chalk", ground: MAP_THEME.chalk.ground, ink: MAP_THEME.chalk.ink });
/** The live map and its resolved theme, for custom layers. `map` is null until the style has loaded. */
export const useMap = () => useContext(MapContext);
