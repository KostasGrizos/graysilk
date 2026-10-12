import { useEffect, useRef, useState, type ReactNode } from "react";
import { Archive, ExternalLink, Pin, Play, RotateCw, Settings, Square, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardFooter, CardHeader, IconButton, Text } from "../src";

/* ---------- the 16 × 16 mark, drawn from the brand bitmap ---------- */
const MARK = [
  "................",
  ".....aaaaaaaa...",
  "....aaaacaaaa...",
  "...aa...........",
  "..aa............",
  ".aa.............",
  ".aa.............",
  ".aa.....bbaaaaa.",
  ".aa.....bbaaaaa.",
  ".ca..........aa.",
  ".aa..........aa.",
  "..aa........aa..",
  "...aa......aa...",
  "....aaaacaaaa...",
  ".....aaaaaaa....",
  "................",
];

function Mark({ size = 32 }: { size?: number }) {
  const fill: Record<string, string> = { a: "var(--pg-ink)", b: "var(--gs-yellow)", c: "var(--gs-orange)" };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {MARK.flatMap((row, y) =>
        [...row].map((ch, x) => (fill[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill[ch]} /> : null)),
      )}
    </svg>
  );
}

/* ---------- layout helpers ---------- */
function Specimen({ children, stack = false }: { children: (theme: "dark" | "light") => ReactNode; stack?: boolean }) {
  return (
    <div className="pg-specimen">
      {(["dark", "light"] as const).map((theme) => (
        <div key={theme} className="pg-panel gs-root" data-gs-theme={theme}>
          <span className="pg-panel-label">{theme}</span>
          <div className={stack ? "pg-stack" : "pg-row"}>{children(theme)}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ id, title, lead, usage, children }: { id: string; title: string; lead: string; usage: string; children: ReactNode }) {
  return (
    <section id={id} className="pg-section" aria-labelledby={`${id}-title`}>
      <div className="pg-section-head">
        <h2 id={`${id}-title`} className="pg-h2">{title}</h2>
        <p className="pg-lead">{lead}</p>
        <CopyCode code={usage} />
      </div>
      {children}
    </section>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      const range = document.createRange();
      if (ref.current) {
        range.selectNodeContents(ref.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };
  return (
    <div className="pg-code">
      <code ref={ref}>{code}</code>
      <button type="button" className="pg-copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}

/* ---------- tokens ---------- */
const SEMANTIC: Array<[string, string, string]> = [
  ["--gs-bg", "#1B1B1E", "#EDEDE9"],
  ["--gs-surface", "#232327", "#FFFFFF"],
  ["--gs-text", "#EDEDE9", "#1B1B1E"],
  ["--gs-text-muted", "#A9A9A4", "#4A4A52"],
  ["--gs-text-accent", "#C98F00", "#7A5700"],
  ["--gs-text-signal", "#FF5A1F", "#B33A0F"],
  ["--gs-border", "#3A3A40", "#C4C4BE"],
  ["--gs-border-strong", "#EDEDE9", "#1B1B1E"],
  ["--gs-accent", "#C98F00", "#C98F00"],
  ["--gs-signal", "#FF5A1F", "#FF5A1F"],
  ["--gs-focus", "#C98F00", "#1B1B1E"],
];

const PRIMITIVES: Array<[string, string, string]> = [
  ["Graphite", "--gs-graphite", "#1B1B1E"],
  ["Chalk", "--gs-chalk", "#EDEDE9"],
  ["Paper", "--gs-paper", "#DADAD5"],
  ["Lead", "--gs-lead", "#4A4A52"],
  ["Safety yellow", "--gs-yellow", "#C98F00"],
  ["Signal orange", "--gs-orange", "#FF5A1F"],
];

const NAV = [
  ["tokens", "Tokens"],
  ["type", "Text"],
  ["button", "Button"],
  ["icon-button", "IconButton"],
  ["badge", "Badge"],
  ["card", "Card"],
];

export function App() {
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = (key: string) => {
    setBusy((b) => ({ ...b, [key]: true }));
    timers.current.push(window.setTimeout(() => setBusy((b) => ({ ...b, [key]: false })), 2400));
  };

  return (
    <div className="pg">
      <header className="pg-header">
        <div className="pg-brand">
          <Mark size={32} />
          <div>
            <div className="pg-brand-name">GraySilk UI</div>
            <div className="pg-brand-meta">@graysilk/ui · v0.1 · Foundations</div>
          </div>
        </div>
        <nav className="pg-nav" aria-label="Components">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>
      </header>
      <div className="pg-stripe" aria-hidden="true" />

      <main className="pg-main">
        <section className="pg-intro" aria-label="About">
          <p>
            The first batch of GraySilk components for the homelab dashboard and anything else on graysilk.tech. Every specimen is
            rendered twice, on the dark theme (the default) and the light theme, from the same React code that lives in{" "}
            <code>packages/ui</code>.
          </p>
        </section>

        <Section
          id="tokens"
          title="Tokens"
          lead="Six brand colours as primitives, plus semantic tokens that switch with data-gs-theme. Components only read the semantic ones."
          usage={`import "@graysilk/ui/fonts.css";\nimport "@graysilk/ui/styles.css";\n// <html data-gs-theme="dark" class="gs-root">`}
        >
          <div className="pg-swatches">
            {PRIMITIVES.map(([name, token, hex]) => (
              <div key={token} className="pg-swatch">
                <div className="pg-swatch-chip" style={{ background: hex }} />
                <div className="pg-swatch-name">{name}</div>
                <div className="pg-mono">{token}</div>
                <div className="pg-mono pg-dim">{hex}</div>
              </div>
            ))}
          </div>
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead>
                <tr><th scope="col">Semantic token</th><th scope="col">Dark</th><th scope="col">Light</th></tr>
              </thead>
              <tbody>
                {SEMANTIC.map(([token, dark, light]) => (
                  <tr key={token}>
                    <td className="pg-mono">{token}</td>
                    <td><span className="pg-dot" style={{ background: dark }} /> <span className="pg-mono">{dark}</span></td>
                    <td><span className="pg-dot" style={{ background: light }} /> <span className="pg-mono">{light}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="type"
          title="Text"
          lead="One component for the whole type scale. Silkscreen only for Display and H1; Plex Sans for reading; JetBrains Mono for labels and code."
          usage={`<Text variant="h1">All lines running</Text>\n<Text variant="label" tone="muted">Platform 01</Text>`}
        >
          <Specimen stack>
            {() => (
              <>
                <Text variant="display">Line G</Text>
                <Text variant="h1">All lines running</Text>
                <Text variant="h2">Backups run every night</Text>
                <Text variant="h3">Restore drill, quarterly</Text>
                <Text>Every service starts from the dashboard, and the data stays on the external SSD.</Text>
                <Text variant="small" tone="muted">Last backup 03:00 · 2.3 GB · essentials tier</Text>
                <div className="pg-row">
                  <Text variant="label">Platform 01</Text>
                  <Text variant="label" tone="accent">Always-on</Text>
                  <Text variant="label" tone="signal">Needs attention</Text>
                </div>
                <Text variant="code">homelabctl profile start photos</Text>
              </>
            )}
          </Specimen>
        </Section>

        <Section
          id="button"
          title="Button"
          lead="Primary is a yellow arcade key with a ledge that presses in; use one per view. Secondary is the workhorse. Loading shows three stations lighting up in turn."
          usage={`<Button variant="primary" iconStart={<Play />} loading={starting}>Start Immich</Button>`}
        >
          <Specimen stack>
            {(theme) => (
              <>
                <div className="pg-row">
                  <Button variant="primary" iconStart={<Play />} loading={busy[`start-${theme}`]} onClick={() => run(`start-${theme}`)}>
                    Start Immich
                  </Button>
                  <Button variant="secondary" iconStart={<Archive />} loading={busy[`backup-${theme}`]} onClick={() => run(`backup-${theme}`)}>
                    Back up now
                  </Button>
                  <Button variant="ghost" iconEnd={<ExternalLink />}>Open</Button>
                  <Button variant="danger" iconStart={<Square />}>Stop</Button>
                </div>
                <div className="pg-row pg-row-end">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="secondary" size="sm">Small</Button>
                  <Button variant="secondary" size="lg">Large</Button>
                </div>
                <div className="pg-row">
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                  <Button variant="primary" loading>Loading</Button>
                  <Button variant="secondary" loading>Loading</Button>
                </div>
              </>
            )}
          </Specimen>
        </Section>

        <Section
          id="icon-button"
          title="IconButton"
          lead="Square buttons for toolbars and table rows. The label is required: it becomes the accessible name and the tooltip."
          usage={`<IconButton label="Restart Immich" icon={<RotateCw />} />`}
        >
          <Specimen>
            {(theme) => (
              <>
                <IconButton label="Start" icon={<Play />} variant="primary" />
                <IconButton label="Restart" icon={<RotateCw />} variant="secondary" loading={busy[`rs-${theme}`]} onClick={() => run(`rs-${theme}`)} />
                <IconButton label="Pin as always-on" icon={<Pin />} />
                <IconButton label="Settings" icon={<Settings />} />
                <IconButton label="Delete" icon={<Trash2 />} variant="danger" />
                <IconButton label="Small" icon={<Settings />} size="sm" variant="secondary" />
                <IconButton label="Large" icon={<Settings />} size="lg" variant="secondary" />
              </>
            )}
          </Specimen>
        </Section>

        <Section
          id="badge"
          title="Badge"
          lead="Mono labels for state and metadata. Add a station square for status. Orange means look here; keep it rare."
          usage={`<Badge station variant="signal">Down</Badge>`}
        >
          <Specimen>
            {() => (
              <>
                <Badge station>Running</Badge>
                <Badge variant="outline">Tailscale</Badge>
                <Badge variant="accent" station>Always-on</Badge>
                <Badge variant="signal" station>Down</Badge>
                <Badge size="sm">v3.0.1</Badge>
                <Badge size="sm" variant="outline">Local</Badge>
              </>
            )}
          </Specimen>
        </Section>

        <Section
          id="card"
          title="Card"
          lead="Square surfaces with an optional header and footer. A clickable card lifts onto a hard pixel shadow. Use the platform stripe on one card per view at most."
          usage={`<Card stripe="bottom">\n  <CardHeader eyebrow="Backups" title="Nightly backup" actions={<Badge station>OK</Badge>} />\n</Card>`}
        >
          <Specimen>
            {(theme) => (
              <div className="pg-cards">
                <Card stripe="bottom">
                  <CardHeader eyebrow="Backups · essentials" title="Nightly backup" actions={<Badge station>OK</Badge>} />
                  <Text variant="small" tone="muted">Restic to the KG drive. Vaultwarden, Immich database, Papra and secrets.</Text>
                  <CardFooter>
                    <span>Last run 03:00</span>
                    <Button size="sm" variant="secondary" loading={busy[`card-${theme}`]} onClick={() => run(`card-${theme}`)}>Run now</Button>
                  </CardFooter>
                </Card>
                <Card as="a" href="#card" interactive padding="md">
                  <CardHeader eyebrow="Photos" title="Immich" actions={<Badge variant="accent" station>Always-on</Badge>} />
                  <Text variant="small" tone="muted">immich.graysilk.tech</Text>
                </Card>
                <Card tone="inverse" padding="md">
                  <CardHeader eyebrow="Inverse" title="Restore drill due" />
                  <Text variant="small" style={{ color: "inherit" }}>Last drill: never. Pick one service and restore it to a scratch folder.</Text>
                </Card>
              </div>
            )}
          </Specimen>
        </Section>
      </main>

      <footer className="pg-footer">
        <span>GraySilk UI · packages/ui · branch ui-foundations</span>
        <span>Next: status &amp; transit (LineMap, StatusPill, PixelTrain)</span>
      </footer>
    </div>
  );
}
