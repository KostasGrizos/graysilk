import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "pixelarticons/react/BookOpen.js";
import { Image } from "pixelarticons/react/Image.js";
import { MapPin } from "pixelarticons/react/MapPin.js";
import { Badge, Button, Text } from "../src";
import {
  AreaLayer, LineLayer, MapLegend, MapPopup, MapView, PointLayer, StationLayer, VehicleLayer, along, circle, useMap,
  type LegendEntry, type LngLat, type MapPoint, type MapThemeSetting, type Station, type Vehicle,
} from "../src/map";

/* Example data: station positions are approximate, for demonstrating the theme only. */
const L1: Station[] = [
  { id: "nss", name: "Neos Sidirodromikos Stathmos", lngLat: [22.9301, 40.6442], kind: "terminus" },
  { id: "dim", name: "Dimokratias", lngLat: [22.9384, 40.6403] },
  { id: "ven", name: "Venizelou", lngLat: [22.944, 40.637] },
  { id: "ags", name: "Agias Sofias", lngLat: [22.9475, 40.6338] },
  { id: "sin", name: "Sintrivani", lngLat: [22.953, 40.6302] },
  { id: "pan", name: "Panepistimio", lngLat: [22.9585, 40.6275] },
  { id: "pap", name: "Papafi", lngLat: [22.963, 40.621] },
  { id: "efk", name: "Efkleidis", lngLat: [22.9612, 40.616] },
  { id: "fle", name: "Fleming", lngLat: [22.9585, 40.6115] },
  { id: "ana", name: "Analipsi", lngLat: [22.956, 40.6065] },
  { id: "25m", name: "25is Martiou", lngLat: [22.958, 40.6005], kind: "interchange" },
  { id: "vou", name: "Voulgari", lngLat: [22.9625, 40.5955] },
  { id: "nel", name: "Nea Elvetia", lngLat: [22.969, 40.5915], kind: "terminus" },
].map((s) => ({ ...s, lines: s.id === "25m" ? ["Line 1", "Line 2"] : ["Line 1"] })) as Station[];

const L2: Station[] = [
  { id: "nom", name: "Nomarchia", lngLat: [22.9545, 40.5948] },
  { id: "kal", name: "Kalamaria", lngLat: [22.9495, 40.588] },
  { id: "are", name: "Aretsou", lngLat: [22.9475, 40.5815] },
  { id: "nkr", name: "Nea Krini", lngLat: [22.9505, 40.576] },
  { id: "mik", name: "Mikra", lngLat: [22.958, 40.57], kind: "terminus" },
].map((s) => ({ ...s, lines: ["Line 2"], planned: true })) as Station[];

const line = (stations: Station[]): GeoJSON.Feature<GeoJSON.LineString> => ({
  type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: stations.map((s) => s.lngLat) },
});
const LINE1 = line(L1);
const LINE2 = line([L1[10], ...L2]);
const CATCHMENTS: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: L1.map((s) => circle(s.lngLat, 500)) };

const PLACES: Array<MapPoint & { eyebrow: string; text: string }> = [
  { id: "wt", title: "White Tower", lngLat: [22.9484, 40.6264], icon: Image, eyebrow: "Photo spot", text: "Waterfront landmark. Example of a point with a card." },
  { id: "rot", title: "Rotunda", lngLat: [22.9525, 40.6334], icon: MapPin, eyebrow: "Place", text: "Roman monument near Agias Sofias." },
  { id: "auth", title: "Aristotle University", lngLat: [22.959, 40.6305], icon: BookOpen, eyebrow: "Project site", text: "Points can hold any React content: text, badges, buttons." },
];

/* Offline sketch: shown only when the OSM tiles can't load (e.g. inside a sandboxed preview). */
const SEA: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature", properties: {},
  geometry: { type: "Polygon", coordinates: [[[22.85, 40.64], [22.9, 40.64], [22.925, 40.636], [22.935, 40.633], [22.942, 40.63], [22.948, 40.6255], [22.952, 40.62], [22.95, 40.612], [22.947, 40.604], [22.945, 40.596], [22.94, 40.588], [22.935, 40.58], [22.938, 40.572], [22.948, 40.565], [22.96, 40.558], [22.975, 40.55], [22.975, 40.5], [22.85, 40.5], [22.85, 40.64]]] },
};

function SketchSea({ visible }: { visible: boolean }) {
  const { theme } = useMap();
  return <AreaLayer id="sketch-sea" data={SEA} color={theme === "night" ? "#16212E" : "#C5D2DD"} fillOpacity={1} outline={false} visible={visible} />;
}

function TileWatch({ onBlocked }: { onBlocked: () => void }) {
  const { map } = useMap();
  useEffect(() => {
    if (!map) return;
    let fired = false;
    const check = (e: { sourceId?: string }) => {
      if (!fired && e.sourceId === "basemap") { fired = true; onBlocked(); }
    };
    map.on("error", check);
    return () => { map.off("error", check); };
  }, [map, onBlocked]);
  return null;
}

function useTrains(): Vehicle[] {
  const coords = LINE1.geometry.coordinates as LngLat[];
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 700); // stepped, like the brand's pixel motion
    return () => window.clearInterval(t);
  }, [reduced]);
  return useMemo(() => {
    const trip = (offset: number, dir: 1 | -1, id: string): Vehicle => {
      const p = (offset + tick * 0.006) % 1;
      const { at, bearing } = along(coords, dir === 1 ? p : 1 - p);
      return { id, label: `Line 1 train ${id} (simulated)`, lngLat: at, bearing: dir === 1 ? bearing : bearing + 180, color: 6 };
    };
    return [trip(0.1, 1, "A"), trip(0.55, -1, "B")];
  }, [tick, coords]);
}

export function MapDemo() {
  const [theme, setTheme] = useState<MapThemeSetting>("system");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<{ kind: "station" | "place"; id: string } | null>(null);
  const [blocked, setBlocked] = useState(false);
  const trains = useTrains();
  const on = (id: string) => visible[id] !== false;
  const toggle = (id: string) => setVisible((v) => ({ ...v, [id]: v[id] === false }));

  const legend: LegendEntry[] = [
    { id: "l1", label: "Line 1", kind: "line", color: 6, visible: on("l1") },
    { id: "l2", label: "Line 2 · Kalamaria", kind: "planned", color: 1, visible: on("l2") },
    { id: "catch", label: "500 m walk from Line 1", kind: "area", color: 6, visible: on("catch") },
    { id: "places", label: "Places", kind: "point", color: 2, visible: on("places") },
    { id: "trains", label: "Trains (simulated)", kind: "vehicle", color: 6, visible: on("trains") },
  ];

  const station = selected?.kind === "station" ? [...L1, ...L2].find((s) => s.id === selected.id) : undefined;
  const place = selected?.kind === "place" ? PLACES.find((p) => p.id === selected.id) : undefined;

  return (
    <div className="pg-map">
      <div className="pg-row" role="group" aria-label="Map theme">
        {(["system", "chalk", "night"] as const).map((t) => (
          <Button key={t} size="sm" variant={theme === t ? "primary" : "secondary"} aria-pressed={theme === t} onClick={() => setTheme(t)}>
            {t === "system" ? "System" : t === "chalk" ? "Chalk" : "Night"}
          </Button>
        ))}
      </div>
      <MapView center={[22.952, 40.607]} zoom={11.9} theme={theme} height={560} label="Thessaloniki metro example map">
        <TileWatch onBlocked={() => setBlocked(true)} />
        <SketchSea visible={blocked} />
        <AreaLayer id="catch" data={CATCHMENTS} color={6} fillOpacity={0.05} outlineOpacity={0.35} visible={on("catch")} />
        <LineLayer id="l2" data={LINE2} color={1} dashed visible={on("l2")} />
        <LineLayer id="l1" data={LINE1} color={6} width={6} visible={on("l1")} />
        <StationLayer stations={L2} color={1} visible={on("l2")} selectedId={station?.id} onSelect={(s) => setSelected({ kind: "station", id: s.id })} />
        <StationLayer stations={L1} color={6} visible={on("l1")} selectedId={station?.id} onSelect={(s) => setSelected({ kind: "station", id: s.id })} />
        <PointLayer points={PLACES} color={2} visible={on("places")} selectedId={place?.id} onSelect={(p) => setSelected({ kind: "place", id: p.id })} />
        <VehicleLayer vehicles={trains} visible={on("trains")} />
        <MapPopup lngLat={station?.lngLat ?? null} onClose={() => setSelected(null)}>
          {station && (
            <div className="pg-popup">
              <Text variant="label" tone="muted">{station.planned ? "Station · planned style" : "Station"}</Text>
              <Text variant="h3">{station.name}</Text>
              <div className="pg-row">
                {station.lines?.map((l) => <Badge key={l} station size="sm" variant={l === "Line 1" ? "signal" : "outline"}>{l}</Badge>)}
              </div>
              <Text variant="small" tone="muted">Approximate position, example data.</Text>
            </div>
          )}
        </MapPopup>
        <MapPopup lngLat={place?.lngLat ?? null} onClose={() => setSelected(null)} offset={46}>
          {place && (
            <div className="pg-popup">
              <Text variant="label" tone="muted">{place.eyebrow}</Text>
              <Text variant="h3">{place.title}</Text>
              <Text variant="small">{place.text}</Text>
            </div>
          )}
        </MapPopup>
        <MapLegend title="Example layers" entries={legend} onToggle={toggle} />
      </MapView>
      {blocked && (
        <p className="pg-map-note" role="status">
          The OpenStreetMap tiles can't load in this preview, so a rough coastline sketch stands in for them. On your site and in
          <code> npm run playground</code> the real recoloured OSM map shows underneath.
        </p>
      )}
    </div>
  );
}
