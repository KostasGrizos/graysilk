import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { along, circle, distance, lineLength } from "./geo";
import { MapLegend } from "./MapLegend";
import { baseStyle, OSM, rasterPaint, resolveColor } from "./theme";

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
});

describe("theme", () => {
  it("resolves slots per theme and passes hex through", () => {
    expect(resolveColor(1, "chalk")).toBe("#2F6FDB");
    expect(resolveColor(1, "night")).toBe("#4C8DF6");
    expect(resolveColor("#123456", "night")).toBe("#123456");
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
});
