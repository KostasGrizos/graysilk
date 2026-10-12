import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { along, bbox, catchment, circle, distance, lineLength } from "./geo";
import { MapLegend } from "./MapLegend";
import { parallelOffset } from "./layers";
import { baseStyle, MAP_THEME, OSM, rasterPaint, resolveColor, zoomBand } from "./theme";

describe("geo", () => {
  it("measures distance in metres", () => {
    // 0.01° of latitude ≈ 1.11 km
    expect(distance([22.95, 40.6], [22.95, 40.61])).toBeGreaterThan(1100);
    expect(distance([22.95, 40.6], [22.95, 40.61])).toBeLessThan(1120);
  });
  it("draws a closed circle with the right radius", () => {
    const ring = circle([22.95, 40.6], 500).geometry.coordinates[0];
    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(Math.round(distance([22.95, 40.6], ring[16] as [number, number]))).toBe(500);
  });
  it("walks along a line", () => {
    const line: [number, number][] = [[0, 0], [0, 1], [1, 1]];
    expect(along(line, 0).at).toEqual([0, 0]);
    expect(along(line, 1).at).toEqual([1, 1]);
    // both legs are ~111 km, so halfway is (almost exactly) the corner
    const mid = along(line, 0.5).at;
    expect(mid[0]).toBeCloseTo(0, 3);
    expect(mid[1]).toBeCloseTo(1, 3);
    expect(lineLength(line)).toBeGreaterThan(222000);
  });
  it("merges overlapping catchments into one shape, keeps far ones apart", () => {
    // stations ~560 m apart: 500 m circles overlap and merge
    expect(catchment([[22.95, 40.6], [22.95, 40.605]], 500).geometry.coordinates).toHaveLength(1);
    // ~5.5 km apart: two separate polygons
    expect(catchment([[22.95, 40.6], [22.95, 40.65]], 500).geometry.coordinates).toHaveLength(2);
    expect(catchment([], 500).geometry.coordinates).toEqual([]);
  });
  it("finds the bounds of coordinates", () => {
    expect(bbox([[22.93, 40.64], [22.97, 40.57], [22.95, 40.6]])).toEqual([[22.93, 40.57], [22.97, 40.64]]);
  });
});

describe("theme", () => {
  it("resolves slots per theme and passes hex through", () => {
    expect(resolveColor(1, "chalk")).toBe("#2F6FDB");
    expect(resolveColor(1, "night")).toBe("#4C8DF6");
    expect(resolveColor("#123456", "night")).toBe("#123456");
    expect(resolveColor("ink", "chalk")).toBe(MAP_THEME.chalk.ink);
    expect(resolveColor("ink", "night")).toBe(MAP_THEME.night.ink);
  });
  it("spaces parallel lines a width + 2 px apart and bands the zoom", () => {
    expect(parallelOffset(6) * 2).toBe(8);
    expect([zoomBand(11), zoomBand(13), zoomBand(15)]).toEqual(["far", "mid", "near"]);
  });
  it("inverts the OSM raster for Night", () => {
    const night = rasterPaint("night");
    expect(night["raster-brightness-min"]).toBeGreaterThan(night["raster-brightness-max"]);
    expect(baseStyle("chalk", OSM).sources.basemap).toMatchObject({ type: "raster" });
  });
});

describe("MapLegend", () => {
  it("toggles layers with pressed buttons", async () => {
    const onToggle = vi.fn();
    render(<MapLegend entries={[{ id: "l1", label: "Line 1", kind: "line", color: 6, visible: true }, { id: "c", label: "Catchment", kind: "area", color: 6, visible: false }]} onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Line 1" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Catchment" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("button", { name: "Line 1" }));
    expect(onToggle).toHaveBeenCalledWith("l1");
  });
  it("folds away from its title", async () => {
    render(<MapLegend title="Layers" defaultOpen entries={[{ id: "l1", label: "Line 1", kind: "line", color: 6 }]} />);
    const title = screen.getByRole("button", { name: "Layers" });
    expect(title).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(title);
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Line 1")).not.toBeVisible();
  });
});
