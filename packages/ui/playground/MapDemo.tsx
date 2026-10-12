import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "pixelarticons/react/BookOpen.js";
import { Image } from "pixelarticons/react/Image.js";
import { MapPin } from "pixelarticons/react/MapPin.js";
import { Button, Text } from "../src";
import {
  AreaLayer, LineLayer, MapLegend, MapPopup, MapView, PointLayer, StationLayer, VehicleLayer,
  along, bbox, catchment, lineLength, parallelOffset, resolveColor, useMap,
  type LegendEntry, type LngLat, type MapColor, type MapPoint, type MapThemeSetting, type Station, type Vehicle,
} from "../src/map";

/*
 * Thessaloniki Metro as of October 2026. Station positions from Wikipedia (rounded to ~30 m);
 * track is drawn straight from station to station. Line 2 shares Line 1's track from the
 * New Railway Station to 25 Martiou, then runs to Mikra (opened August 2026).
 */
const LINE_WIDTH = 6;
const OFF = parallelOffset(LINE_WIDTH);
const st = (id: string, name: string, lat: number, lng: number, extra: Partial<Station> = {}): Station => ({ id, name, lngLat: [lng, lat], ...extra });

const TRUNK: Station[] = [
  st("nss", "New Railway Station", 40.64361, 22.92917, { kind: "terminus" }),
  st("dim", "Dimokratias", 40.64111, 22.93417),
  st("ven", "Venizelou", 40.63694, 22.94194),
  st("ags", "Agias Sofias", 40.63444, 22.94639),
  st("sin", "Sintrivani", 40.63056, 22.95417),
  st("pan", "Panepistimio", 40.62611, 22.96),
  st("pap", "Papafi", 40.61972, 22.9625),
  st("efk", "Efkleidis", 40.61611, 22.96028),
  st("fle", "Fleming", 40.60917, 22.95722),
  st("ana", "Analipsi", 40.60556, 22.95778),
  st("25m", "25 Martiou", 40.60056, 22.95833, { kind: "interchange" }),
].map((s) => ({ ...s, lines: ["Line 1", "Line 2"] }));

const L1_BRANCH: Station[] = [
  st("vou", "Voulgari", 40.59444, 22.96083),
  st("nel", "Nea Elvetia", 40.59306, 22.96861, { kind: "terminus" }),
].map((s) => ({ ...s, lines: ["Line 1"] }));

const L2_BRANCH: Station[] = [
  st("nom", "Nomarchia", 40.59139, 22.95694, { labelSide: "left" }),
  st("kal", "Kalamaria", 40.58472, 22.95306, { labelSide: "left" }),
  st("are", "Aretsou", 40.57861, 22.95444, { labelSide: "left" }),
  st("nkr", "Nea Krini", 40.5725, 22.96111, { labelSide: "left" }),
  st("mik", "Mikra", 40.56833, 22.96583, { kind: "terminus", labelSide: "left" }),
].map((s) => ({ ...s, lines: ["Line 2"] }));

const ALL = [...TRUNK, ...L1_BRANCH, ...L2_BRANCH];
const coords = (s: Station[]) => s.map((x) => x.lngLat);
const JUNCTION = TRUNK[TRUNK.length - 1];

interface LineInfo { id: "l1" | "l2"; name: string; color: MapColor; stations: Station[]; ends: string; opened: string }
const LINES: LineInfo[] = [
  { id: "l1", name: "Line 1", color: 6, stations: [...TRUNK, ...L1_BRANCH], ends: "New Railway Station – Nea Elvetia", opened: "Opened Nov 2024" },
  { id: "l2", name: "Line 2", color: 1, stations: [...TRUNK, ...L2_BRANCH], ends: "New Railway Station – Mikra", opened: "Kalamaria branch opened Aug 2026" },
];

/* Each line = the shared trunk (shifted to its side) + its own branch (centred on the stations). */
const lineData = (trunkOffset: number, branch: Station[]): GeoJSON.FeatureCollection => ({
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { offset: trunkOffset }, geometry: { type: "LineString", coordinates: coords(TRUNK) } },
    { type: "Feature", properties: { offset: 0 }, geometry: { type: "LineString", coordinates: coords([JUNCTION, ...branch]) } },
  ],
});
const LINE1 = lineData(-OFF, L1_BRANCH); // inland side of the trunk, so it turns east without crossing
const LINE2 = lineData(OFF, L2_BRANCH); // coast side, so it carries on south

const WALK = catchment(coords(ALL), 500);

const PLACES: Array<MapPoint & { eyebrow: string; text: string }> = [
  { id: "wt", title: "White Tower", lngLat: [22.94839, 40.62643], icon: Image, eyebrow: "Photo spot", text: "Waterfront landmark. An example of a point with a card." },
  { id: "rot", title: "Rotunda", lngLat: [22.95278, 40.63333], icon: MapPin, eyebrow: "Place", text: "Roman monument, a short walk from Agias Sofias." },
  { id: "auth", title: "Aristotle University", lngLat: [22.9593, 40.6302], icon: BookOpen, eyebrow: "Project site", text: "Cards can hold any React content: text, badges, buttons." },
];

const BOUNDS = bbox([...coords(ALL), ...PLACES.map((p) => p.lngLat)]);

/* Offline sketch: shown only when the OSM tiles can't load (e.g. inside a sandboxed preview). */
const SEA: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature", properties: {},
  geometry: { type: "Polygon", coordinates: [[[22.85, 40.637], [22.92, 40.637], [22.934, 40.634], [22.9405, 40.6315], [22.9475, 40.6253], [22.9515, 40.619], [22.9535, 40.612], [22.952, 40.604], [22.949, 40.596], [22.946, 40.588], [22.9435, 40.581], [22.9485, 40.5745], [22.955, 40.569], [22.962, 40.5645], [22.972, 40.558], [22.99, 40.552], [22.99, 40.5], [22.85, 40.5], [22.85, 40.637]]] },
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

/** A line name with its colour square, coloured for the current map theme. */
function LineChip({ line }: { line: LineInfo }) {
  const { theme } = useMap();
  return (
    <span className="pg-line-chip" style={{ ["--c" as string]: resolveColor(line.color, theme) }}>
      {line.name}
    </span>
  );
}

function useTrains(): Vehicle[] {
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 700); // stepped, like the brand's pixel motion
    return () => window.clearInterval(t);
  }, [reduced]);
  return useMemo(() => {
    const out: Vehicle[] = [];
    for (const line of LINES) {
      const path = coords(line.stations) as LngLat[];
      [[0.08, 1], [0.6, -1]].forEach(([offset, dir], i) => {
        const p = (offset + tick * 0.006) % 1;
        const { at, bearing } = along(path, dir === 1 ? p : 1 - p);
        const id = `${line.id}-${i}`;
        out.push({ id, label: `${line.name} train (simulated)`, lngLat: at, bearing: dir === 1 ? bearing : bearing + 180, color: line.color });
      });
    }
    return out;
  }, [tick]);
}

type Selection = { kind: "station" | "place"; id: string } | { kind: "line"; id: LineInfo["id"]; at: LngLat } | null;

export function MapDemo() {
  const [theme, setTheme] = useState<MapThemeSetting>("system");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Selection>(null);
  const [blocked, setBlocked] = useState(false);
  const trains = useTrains();
  const on = (id: string) => visible[id] !== false;
  const toggle = (id: string) => setVisible((v) => ({ ...v, [id]: v[id] === false }));

  const legend: LegendEntry[] = [
    { id: "l1", label: "Line 1", kind: "line", color: 6, visible: on("l1") },
    { id: "l2", label: "Line 2", kind: "line", color: 1, visible: on("l2") },
    { id: "walk", label: "500 m walk to a station", kind: "area", color: "ink", visible: on("walk") },
    { id: "places", label: "Places", kind: "point", color: 2, visible: on("places") },
    { id: "trains", label: "Trains (simulated)", kind: "vehicle", color: "ink", visible: on("trains") },
  ];

  const station = selected?.kind === "station" ? ALL.find((s) => s.id === selected.id) : undefined;
  const place = selected?.kind === "place" ? PLACES.find((p) => p.id === selected.id) : undefined;
  const line = selected?.kind === "line" ? LINES.find((l) => l.id === selected.id) : undefined;
  const pickStation = (s: Station) => setSelected({ kind: "station", id: s.id });

  return (
    <div className="pg-map">
      <div className="pg-row" role="group" aria-label="Map theme">
        {(["system", "chalk", "night"] as const).map((t) => (
          <Button key={t} size="sm" variant={theme === t ? "primary" : "secondary"} aria-pressed={theme === t} onClick={() => setTheme(t)}>
            {t === "system" ? "System" : t === "chalk" ? "Chalk" : "Night"}
          </Button>
        ))}
      </div>
      <MapView bounds={BOUNDS} theme={theme} height={560} label="Thessaloniki Metro map">
        <TileWatch onBlocked={() => setBlocked(true)} />
        <SketchSea visible={blocked} />
        <AreaLayer id="walk" data={WALK} color="ink" fillOpacity={0.06} outlineOpacity={0.45} outlineDashed visible={on("walk")} />
        {LINES.map((l) => (
          <LineLayer
            key={l.id} id={l.id} data={l.id === "l1" ? LINE1 : LINE2} color={l.color} width={LINE_WIDTH} visible={on(l.id)}
            onClick={(_, e) => setSelected({ kind: "line", id: l.id, at: [e.lngLat.lng, e.lngLat.lat] })}
          />
        ))}
        <StationLayer stations={TRUNK} color="ink" visible={on("l1") || on("l2")} selectedId={station?.id} onSelect={pickStation} />
        <StationLayer stations={L1_BRANCH} color={6} visible={on("l1")} selectedId={station?.id} onSelect={pickStation} />
        <StationLayer stations={L2_BRANCH} color={1} visible={on("l2")} selectedId={station?.id} onSelect={pickStation} />
        <PointLayer points={PLACES} color={2} visible={on("places")} selectedId={place?.id} onSelect={(p) => setSelected({ kind: "place", id: p.id })} />
        <VehicleLayer vehicles={trains.filter((v) => on("trains") && on(v.id.slice(0, 2)))} />

        <MapPopup lngLat={station?.lngLat ?? null} onClose={() => setSelected(null)}>
          {station && (
            <div className="pg-popup">
              <Text variant="label" tone="muted">{station.kind === "interchange" ? "Interchange" : station.kind === "terminus" ? "Terminus" : "Station"}</Text>
              <Text variant="h3">{station.name}</Text>
              <div className="pg-row">
                {LINES.filter((l) => station.lines?.includes(l.name)).map((l) => <LineChip key={l.id} line={l} />)}
              </div>
            </div>
          )}
        </MapPopup>
        <MapPopup lngLat={line && selected?.kind === "line" ? selected.at : null} onClose={() => setSelected(null)} offset={8}>
          {line && (
            <div className="pg-popup">
              <Text variant="label" tone="muted">Line</Text>
              <div className="pg-row"><LineChip line={line} /></div>
              <Text variant="body">{line.ends}</Text>
              <Text variant="small" tone="muted">
                {line.stations.length} stations · {(lineLength(coords(line.stations)) / 1000).toFixed(1)} km · {line.opened}
              </Text>
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
        <MapLegend title="Layers" entries={legend} onToggle={toggle} />
      </MapView>
      <p className="pg-map-note">
        Stations from Wikipedia; track drawn straight between stations. Click a line, a station or a pin. Ctrl/⌘ + scroll zooms.
        {blocked && (
          <span role="status">
            {" "}The OpenStreetMap tiles can't load in this preview, so a rough coastline sketch stands in for them; on your site and in
            <code> npm run playground</code> the real recoloured map shows underneath.
          </span>
        )}
      </p>
    </div>
  );
}
