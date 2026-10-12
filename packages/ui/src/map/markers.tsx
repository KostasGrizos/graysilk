import maplibregl, { type Marker, type Popup } from "maplibre-gl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { Icon, type IconComponent } from "../components/Icon/Icon";
import { useMap } from "./context";
import { resolveColor, type MapColor } from "./theme";

/* ---------------- stations ---------------- */

export interface Station {
  id: string;
  name: string;
  lngLat: [number, number];
  /** Line ids or names serving the station, for the accessible label. */
  lines?: string[];
  /** interchange = larger square with a centre pixel; terminus = yellow fill, like the logo's end stop. */
  kind?: "station" | "interchange" | "terminus";
  /** Planned / under construction: hollow square. */
  planned?: boolean;
  /** Which side the name sits on (default right). Pick the side away from the line. */
  labelSide?: "left" | "right";
}

export interface StationLayerProps {
  stations: Station[];
  /**
   * Border colour: the line's slot or hex. Interchanges and stations on shared track
   * (more than one entry in `lines`) use ink and a larger square that spans the parallel lines.
   */
  color: MapColor;
  /** Labels show from this zoom up (they always show on focus/hover). */
  labelZoom?: number;
  visible?: boolean;
  selectedId?: string | null;
  onSelect?: (station: Station) => void;
}

/** Stations as focusable pixel squares with labels in the brand font. Markers are centred on the station. */
export function StationLayer({ stations, color, labelZoom = 13, visible = true, selectedId, onSelect }: StationLayerProps) {
  const { map, theme } = useMap();
  const markers = useRef(new Map<string, { marker: Marker; el: HTMLElement }>());
  const select = useRef(onSelect);
  select.current = onSelect;

  useEffect(() => {
    if (!map) return;
    for (const s of stations) {
      const el = document.createElement("div");
      el.className = "gs-station";
      el.dataset.kind = s.kind ?? "station";
      el.dataset.side = s.labelSide ?? "right";
      if ((s.lines?.length ?? 0) > 1) el.dataset.shared = "true";
      if (s.planned) el.dataset.planned = "true";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gs-station-dot";
      btn.setAttribute("aria-label", `${s.name}${s.lines?.length ? `, ${s.lines.join(" and ")}` : ""}${s.planned ? ", planned" : ""}`);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        select.current?.(s);
      });
      const label = document.createElement("span");
      label.className = "gs-station-label";
      label.textContent = s.name;
      el.append(btn, label);
      const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(s.lngLat).addTo(map);
      markers.current.set(s.id, { marker, el });
    }
    const current = markers.current;
    return () => {
      current.forEach(({ marker }) => marker.remove());
      current.clear();
    };
  }, [map, stations]);

  useEffect(() => {
    markers.current.forEach(({ el }) => {
      el.style.setProperty("--line", resolveColor(color, theme));
      el.hidden = !visible;
    });
  }, [color, theme, visible, stations, map]);

  useEffect(() => {
    markers.current.forEach(({ el }, id) => el.toggleAttribute("data-selected", id === selectedId));
  }, [selectedId, stations, map]);

  useEffect(() => {
    if (!map) return;
    const sync = () => map.getContainer().parentElement?.toggleAttribute("data-labels", map.getZoom() >= labelZoom);
    sync();
    map.on("zoom", sync);
    return () => {
      map.off("zoom", sync);
    };
  }, [map, labelZoom]);
  return null;
}

/* ---------------- points with popups ---------------- */

export interface MapPoint {
  id: string;
  title: string;
  lngLat: [number, number];
  icon: IconComponent;
}

export interface PointLayerProps {
  points: MapPoint[];
  /** Pin accent: slot or hex. */
  color?: MapColor;
  visible?: boolean;
  selectedId?: string | null;
  onSelect?: (point: MapPoint) => void;
}

/**
 * Pixel pins with a 24 px Pixelarticons icon. Pair with <MapPopup> for the card.
 * Zoomed out ("far" band) they shrink to small squares in the pin colour; the selected one stays full size.
 */
export function PointLayer({ points, color = 2, visible = true, selectedId, onSelect }: PointLayerProps) {
  const { map, theme } = useMap();
  const items = useRef(new Map<string, { marker: Marker; el: HTMLElement; root: Root }>());
  const select = useRef(onSelect);
  select.current = onSelect;

  useEffect(() => {
    if (!map) return;
    for (const p of points) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "gs-pin";
      el.setAttribute("aria-label", p.title);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        select.current?.(p);
      });
      const root = createRoot(el);
      root.render(<Icon icon={p.icon} />);
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(p.lngLat).addTo(map);
      items.current.set(p.id, { marker, el, root });
    }
    const current = items.current;
    return () => {
      current.forEach(({ marker, root }) => {
        marker.remove();
        queueMicrotask(() => root.unmount());
      });
      current.clear();
    };
  }, [map, points]);

  useEffect(() => {
    items.current.forEach(({ el }, id) => {
      el.style.setProperty("--pin", resolveColor(color, theme));
      el.hidden = !visible;
      el.toggleAttribute("data-selected", id === selectedId);
    });
  }, [color, theme, visible, selectedId, points, map]);
  return null;
}

export interface MapPopupProps {
  lngLat: [number, number] | null;
  onClose: () => void;
  children: ReactNode;
  /** Pixels between the anchor and the card (e.g. pin height). */
  offset?: number;
}

/**
 * A brand card anchored to a map position. Renders nothing while lngLat is null.
 * Escape closes it and returns focus to whatever opened it (e.g. the station button).
 */
export function MapPopup({ lngLat, onClose, children, offset = 14 }: MapPopupProps) {
  const { map } = useMap();
  const [node] = useState(() => (typeof document !== "undefined" ? document.createElement("div") : null));
  const popup = useRef<Popup | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!map || !node || !lngLat) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const p = new maplibregl.Popup({ offset, closeButton: true, closeOnClick: true, maxWidth: "320px", className: "gs-popup", focusAfterOpen: true })
      .setLngLat(lngLat)
      .setDOMContent(node)
      .addTo(map);
    p.on("close", () => close.current());
    popup.current = p;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      p.remove();
      if (opener?.isConnected && opener !== document.body) opener.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      p.remove();
      popup.current = null;
    };
  }, [map, node, lngLat, offset]);

  return node && lngLat ? createPortal(children, node) : null;
}

/* ---------------- live vehicles ---------------- */

export interface Vehicle {
  id: string;
  label: string;
  lngLat: [number, number];
  /** Degrees clockwise from north; the sprite flips to face left or right. */
  bearing?: number;
  color: MapColor;
}

const TRAIN = ["...aaaaaaaaaaaa.", "..aaaaaaaaaaaaaa", ".aa..a..a..a..aa", ".aa..a..a..a..aa", ".aaaaaaaaaaaaaaa", ".bbbbbbbbbbbbbba", "..dd.dd....dd.dd"];

function trainSvg(): string {
  const cells = TRAIN.flatMap((row, y) => [...row].map((c, x) => (c === "." ? "" : `<rect x="${x}" y="${y}" width="1" height="1" class="t-${c}"/>`))).join("");
  return `<svg viewBox="0 0 16 7" width="32" height="14" shape-rendering="crispEdges" aria-hidden="true">${cells}</svg>`;
}

/** Moving vehicles as pixel trains. Feed new positions in; markers move in whole steps. */
export function VehicleLayer({ vehicles, visible = true }: { vehicles: Vehicle[]; visible?: boolean }) {
  const { map, theme } = useMap();
  const items = useRef(new Map<string, { marker: Marker; el: HTMLElement }>());

  useEffect(() => {
    if (!map) return;
    const seen = new Set<string>();
    for (const v of vehicles) {
      seen.add(v.id);
      let item = items.current.get(v.id);
      if (!item) {
        const el = document.createElement("div");
        el.className = "gs-vehicle";
        el.setAttribute("role", "img");
        el.innerHTML = trainSvg();
        const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(v.lngLat).addTo(map);
        item = { marker, el };
        items.current.set(v.id, item);
      }
      item.marker.setLngLat(v.lngLat);
      item.el.setAttribute("aria-label", v.label);
      item.el.title = v.label;
      item.el.style.setProperty("--vehicle", resolveColor(v.color, theme));
      item.el.toggleAttribute("data-flip", ((v.bearing ?? 90) + 360) % 360 > 180);
      item.el.hidden = !visible;
    }
    items.current.forEach((item, id) => {
      if (!seen.has(id)) {
        item.marker.remove();
        items.current.delete(id);
      }
    });
  }, [map, vehicles, theme, visible]);

  useEffect(() => () => {
    items.current.forEach(({ marker }) => marker.remove());
    items.current.clear();
  }, [map]);
  return null;
}
