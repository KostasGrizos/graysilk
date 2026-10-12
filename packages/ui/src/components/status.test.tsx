import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LineMap, StatusPill, type Line } from "../index";

describe("StatusPill", () => {
  it("always shows the word, with a decorative icon", () => {
    const { container } = render(<StatusPill status="stop" label="Failed" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(container.querySelector("[data-status='stop']")).not.toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("LineMap", () => {
  const select = vi.fn();
  const lines: Line[] = [
    { id: "photos", name: "Photos", stations: [{ id: "immich", name: "Immich", state: "lit", stateLabel: "Running" }] },
    { id: "reading", name: "Reading", stations: [
      { id: "kavita", name: "Kavita", state: "unlit", stateLabel: "Stopped", onSelect: select },
      { id: "abs", name: "Audiobookshelf", state: "alert", stateLabel: "Failed" },
    ] },
  ];

  it("names every line and gives each station its state in words", () => {
    render(<LineMap lines={lines} label="Service lines" />);
    expect(screen.getByRole("navigation", { name: "Service lines" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Reading" })).toBeInTheDocument();
    expect(screen.getByText(", Failed")).toBeInTheDocument();
    expect(screen.getByTitle("Immich: Running")).toBeInTheDocument();
  });

  it("makes selectable stations buttons", async () => {
    const user = userEvent.setup();
    render(<LineMap lines={lines} label="Service lines" />);
    await user.click(screen.getByRole("button", { name: "Kavita, Stopped (Reading)" }));
    expect(select).toHaveBeenCalledOnce();
  });
});
