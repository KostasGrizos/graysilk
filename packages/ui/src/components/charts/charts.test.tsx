import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Server } from "pixelarticons/react/Server.js";
import { BarChart, Icon, LineChart, Meter, StatTile, niceTicks } from "../../index";

describe("niceTicks", () => {
  it("rounds the top up to a clean step", () => {
    expect(niceTicks(37)).toEqual([0, 10, 20, 30, 40]);
    expect(niceTicks(2.3)).toEqual([0, 1, 2, 3]);
  });
});

describe("Icon", () => {
  it("is decorative unless labelled", () => {
    const { container } = render(<Icon icon={Server} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    render(<Icon icon={Server} size={48} label="Server" />);
    expect(screen.getByRole("img", { name: "Server" })).toHaveAttribute("width", "48");
  });
});

describe("LineChart", () => {
  const props = {
    title: "CPU by service",
    labels: ["00:00", "01:00", "02:00"],
    series: [
      { id: "a", name: "Immich", values: [5, 8, 12] },
      { id: "b", name: "Jellyfin", values: [2, 3, 1] },
    ],
  };

  it("shows a legend for two or more series", () => {
    render(<LineChart {...props} />);
    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getByText("Immich")).toBeInTheDocument();
  });

  it("reads values with the arrow keys", () => {
    render(<LineChart {...props} />);
    const plot = screen.getByRole("group", { name: /CPU by service/ });
    fireEvent.keyDown(plot, { key: "End" });
    // axis label + tooltip header
    expect(screen.getAllByText("02:00")).toHaveLength(2);
    fireEvent.keyDown(plot, { key: "Escape" });
    expect(screen.getAllByText("02:00")).toHaveLength(1);
  });

  it("switches to a table view", async () => {
    render(<LineChart {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Table" }));
    const table = screen.getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "01:00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chart" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("BarChart", () => {
  it("sorts longest first and labels every value", () => {
    render(<BarChart title="Storage" data={[{ label: "Photos", value: 2 }, { label: "Media", value: 5 }]} format={(n) => `${n} GB`} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Media");
    expect(items[0]).toHaveTextContent("5 GB");
  });
});

describe("Meter", () => {
  it("exposes value and status", () => {
    render(<Meter label="Mac internal disk" value={174} max={229} valueText="174 GB of 229 GB" />);
    const meter = screen.getByRole("meter", { name: "Mac internal disk" });
    expect(meter).toHaveAttribute("aria-valuetext", "174 GB of 229 GB, Caution");
    expect(screen.getByText("Caution")).toBeInTheDocument();
  });
});

describe("StatTile", () => {
  it("renders label, value and delta", () => {
    render(<StatTile label="Essentials backup" value="2.3 GB" delta={{ text: "+0.25 GB", direction: "up", good: true, period: "vs last week" }} />);
    expect(screen.getByText("2.3 GB")).toBeInTheDocument();
    expect(screen.getByText("+0.25 GB")).toBeInTheDocument();
  });
});
