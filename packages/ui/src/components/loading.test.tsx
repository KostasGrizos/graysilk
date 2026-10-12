import { render, screen } from "@testing-library/react";
import { Loader, PixelTrain, ProgressBar } from "../index";
import { MARK, MARK_STATIONS, runs, TRAIN } from "../internal/bitmaps";

describe("Loader", () => {
  it("is a polite status named by its label", () => {
    render(<Loader label="Loading photos" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading photos");
    expect(status.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["stations", 13 * 3, 3 * 3],
    ["train", 32 * 3, 8 * 3],
    ["mark", 16 * 3, 16 * 3],
  ] as const)("draws %s at whole-pixel sizes", (variant, w, h) => {
    const { container } = render(<Loader variant={variant} size="md" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", String(w));
    expect(svg).toHaveAttribute("height", String(h));
  });

  it("can show its label as text", () => {
    render(<Loader showLabel label="Starting services" />);
    expect(screen.getByText("Starting services")).toBeVisible();
  });
});

describe("PixelTrain", () => {
  it("is decorative unless labelled", () => {
    const { container, rerender } = render(<PixelTrain />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    rerender(<PixelTrain label="Train to Mikra" scale={3} />);
    const img = screen.getByRole("img", { name: "Train to Mikra" });
    expect(img).toHaveAttribute("width", "48");
  });
});

describe("ProgressBar", () => {
  it("reports its value and fills whole blocks", () => {
    const { container } = render(<ProgressBar label="Restoring photos" value={50} max={200} segments={20} />);
    const bar = screen.getByRole("progressbar", { name: "Restoring photos" });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuemax", "200");
    expect(bar).toHaveAttribute("aria-valuetext", "25%");
    expect(container.querySelectorAll("[data-on]")).toHaveLength(5);
  });

  it("uses custom value text", () => {
    render(<ProgressBar label="Upload" value={1.2} max={4} valueText="1.2 of 4 GB" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "1.2 of 4 GB");
    expect(screen.getByText("1.2 of 4 GB")).toBeInTheDocument();
  });

  it("has no value while the amount of work is unknown", () => {
    render(<ProgressBar label="Checking backups" />);
    const bar = screen.getByRole("progressbar", { name: "Checking backups" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(screen.getByText("Working…")).toBeInTheDocument();
  });
});

describe("bitmaps", () => {
  it("keeps the mark's stations on 'c' cells, and the train 16 × 7", () => {
    for (const [x, y] of MARK_STATIONS) expect(MARK[y][x]).toBe("c");
    expect(TRAIN).toHaveLength(7);
    expect(TRAIN.every((r) => r.length === 16)).toBe(true);
    expect(runs(["aab.", "..aa"])).toEqual([
      { x: 0, y: 0, w: 2, ch: "a" }, { x: 2, y: 0, w: 1, ch: "b" }, { x: 2, y: 1, w: 2, ch: "a" },
    ]);
  });
});
