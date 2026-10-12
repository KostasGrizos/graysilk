import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Badge, Button, Card, CardFooter, CardHeader, IconButton, Text } from "../index";

describe("Text", () => {
  it("picks a sensible element per variant", () => {
    render(
      <>
        <Text variant="h1">Homelab</Text>
        <Text variant="label">Platform 01</Text>
        <Text variant="code">homelabctl status</Text>
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Homelab" })).toBeInTheDocument();
    expect(screen.getByText("Platform 01").tagName).toBe("SPAN");
    expect(screen.getByText("homelabctl status").tagName).toBe("CODE");
  });

  it("lets `as` override the element", () => {
    render(<Text variant="h1" as="h2">Section</Text>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Section");
  });
});

describe("Button", () => {
  it("defaults to type=button and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Start</Button>);
    const button = screen.getByRole("button", { name: "Start" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is busy and disabled while loading, keeping its name", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Back up now</Button>);
    const button = screen.getByRole("button", { name: "Back up now" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe("IconButton", () => {
  it("uses the label as accessible name and tooltip", () => {
    render(<IconButton label="Restart Immich" icon={<svg />} />);
    const button = screen.getByRole("button", { name: "Restart Immich" });
    expect(button).toHaveAttribute("title", "Restart Immich");
  });
});

describe("Badge", () => {
  it("renders text with an optional station marker", () => {
    const { container } = render(<Badge station variant="signal">Down</Badge>);
    expect(screen.getByText("Down")).toBeInTheDocument();
    expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(1);
  });
});

describe("Card", () => {
  it("renders header, body and footer", () => {
    render(
      <Card as="section" aria-label="Backups">
        <CardHeader eyebrow="Essentials" title="Nightly backup" actions={<Badge>OK</Badge>} />
        <Text>2.3 GB to the KG drive.</Text>
        <CardFooter>restic · 03:00</CardFooter>
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Backups" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Nightly backup" })).toBeInTheDocument();
    expect(screen.getByText("Essentials")).toBeInTheDocument();
  });

  it("renders as a link when asked", () => {
    render(<Card as="a" href="https://immich.graysilk.tech" interactive>Immich</Card>);
    expect(screen.getByRole("link", { name: "Immich" })).toHaveAttribute("href", "https://immich.graysilk.tech");
  });
});
