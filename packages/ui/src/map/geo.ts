import * as clip from "polygon-clipping";

// polygon-clipping ships a default export at runtime but types named exports; accept both.
const { union } = (clip as unknown as { default?: typeof clip }).default ?? clip;

export type LngLat = [number, number];

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in metres. */
export function distance(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** A circle as a GeoJSON polygon ring, e.g. a 500 m walking catchment. */
export function circle(center: LngLat, radiusM: number, steps = 64): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const ring: LngLat[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const dy = (radiusM * Math.sin(a)) / R;
    const dx = (radiusM * Math.cos(a)) / (R * Math.cos(rad(lat)));
    ring.push([lng + (dx * 180) / Math.PI, lat + (dy * 180) / Math.PI]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

/** Length of a polyline in metres. */
export const lineLength = (coords: LngLat[]) => coords.slice(1).reduce((s, c, i) => s + distance(coords[i], c), 0);

/** The point a fraction t (0–1) along a polyline, plus its bearing in degrees. */
export function along(coords: LngLat[], t: number): { at: LngLat; bearing: number } {
  if (coords.length < 2 || t <= 0) return { at: coords[0], bearing: 0 };
  const total = lineLength(coords);
  if (t >= 1) return { at: coords[coords.length - 1], bearing: along(coords, 0.9999).bearing };
  let target = Math.min(1, Math.max(0, t)) * total;
  for (let i = 1; i < coords.length; i++) {
    const seg = distance(coords[i - 1], coords[i]);
    if (target <= seg || i === coords.length - 1) {
      const f = seg ? Math.min(1, target / seg) : 0;
      const [a, b] = [coords[i - 1], coords[i]];
      const bearing = (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
      return { at: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], bearing };
    }
    target -= seg;
  }
  return { at: coords[coords.length - 1], bearing: 0 };
}

/**
 * Walking catchment around many points, merged into one shape so overlaps don't stack
 * into darker patches (e.g. 500 m around every station of a network).
 */
export function catchment(points: LngLat[], radiusM: number, steps = 48): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  const rings = points.map((p) => circle(p, radiusM, steps).geometry.coordinates as [number, number][][]);
  const merged = rings.length ? union(rings[0], ...rings.slice(1)) : [];
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: merged } };
}

/** [[west, south], [east, north]] around any coordinates, for <MapView bounds>. */
export function bbox(coords: LngLat[]): [LngLat, LngLat] {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of coords) {
    w = Math.min(w, x); e = Math.max(e, x);
    s = Math.min(s, y); n = Math.max(n, y);
  }
  return [[w, s], [e, n]];
}
