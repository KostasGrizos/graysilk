import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Archive, Bell, BookOpen, Bookmark, Calendar, ChartBarBig, Check, CircleInfo, Clock, Cloud, Database, Docker, Download,
  ExternalLink, FileText, Github, Globe, Home, Image, Lock, MapPin, Music, Pause, Play, Power, Reload, Search, Server,
  SettingsCog, Shield, Stop, Terminal, Trash, Upload, User, Video, WarningDiamond, Wifi,
} from "pixelarticons/react";
import {
  Badge, BarChart, Button, Card, CardFooter, CardHeader, Icon, IconButton, LineChart, Meter, StatTile, Text,
  type IconComponent,
} from "../src";
import { COMPARISON } from "./iconComparison";
import { MapDemo } from "./MapDemo";

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
  ["icons", "Icons"],
  ["button", "Button"],
  ["icon-button", "IconButton"],
  ["badge", "Badge"],
  ["card", "Card"],
  ["data-colour", "Data colour"],
  ["charts", "Charts"],
  ["map", "Map"],
];

/* ---------- icons ---------- */
const ICONS: Array<[string, IconComponent]> = [
  ["Home", Home], ["Play", Play], ["Pause", Pause], ["Stop", Stop], ["Reload", Reload], ["Power", Power],
  ["SettingsCog", SettingsCog], ["Server", Server], ["Database", Database], ["Cloud", Cloud], ["Archive", Archive], ["Download", Download],
  ["Upload", Upload], ["Lock", Lock], ["Shield", Shield], ["User", User], ["Image", Image], ["Video", Video],
  ["Music", Music], ["BookOpen", BookOpen], ["FileText", FileText], ["Terminal", Terminal], ["Docker", Docker], ["Github", Github],
  ["Globe", Globe], ["Wifi", Wifi], ["MapPin", MapPin], ["ChartBarBig", ChartBarBig], ["Clock", Clock], ["Calendar", Calendar],
  ["Bell", Bell], ["CircleInfo", CircleInfo], ["WarningDiamond", WarningDiamond], ["Check", Check], ["Search", Search], ["Trash", Trash],
];

const COMPARE_PX: IconComponent[] = [Home, Play, Reload, SettingsCog, Lock, Image, Search, Trash];

/* ---------- data colour ---------- */
const SERIES: Array<[string, string, string]> = [
  ["Lapis", "#2F6FDB", "#4C8DF6"],
  ["Safety", "#B07C00", "#BA8400"],
  ["Magenta", "#D2479B", "#E0609F"],
  ["Moss", "#6C8A1E", "#7A9A2A"],
  ["Violet", "#7B5CE0", "#8F78EC"],
  ["Signal", "#FF5A1F", "#EE5219"],
  ["Sky", "#1C93C9", "#2E9BD0"],
  ["Brick", "#B4322C", "#E0544B"],
];
const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const RAMPS = ["safety", "lapis", "signal"];
const STATUS: Array<[string, string, IconComponent, string]> = [
  ["ok", "Proceed", Check, "Running, backed up, healthy"],
  ["caution", "Caution", WarningDiamond, "Degraded, nearly full, update waiting"],
  ["attention", "Attention", Bell, "Needs you soon"],
  ["stop", "Stop", Stop, "Down, failed, out of space"],
  ["unknown", "Unknown", CircleInfo, "No signal yet"],
];

/* ---------- example data (marked as such in the UI) ---------- */
const DAYS = ["29 Sep", "30 Sep", "1 Oct", "2 Oct", "3 Oct", "4 Oct", "5 Oct", "6 Oct", "7 Oct", "8 Oct", "9 Oct", "10 Oct", "11 Oct", "12 Oct"];
const BACKUP_GB = [2.05, 2.06, 2.08, 2.08, 2.1, 2.13, 2.13, 2.15, 2.18, 2.2, 2.21, 2.24, 2.27, 2.3];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const wave = (base: number, amp: number, phase: number, spike?: [number, number]) =>
  HOURS.map((_, h) => {
    const v = base + amp * Math.sin((h + phase) / 3.2) + amp * 0.4 * Math.sin((h * 7 + phase) / 2.1);
    return Math.max(0, Math.round((spike && h >= spike[0] && h < spike[0] + 3 ? v + spike[1] : v) * 10) / 10);
  });
const CPU = [
  { id: "immich", name: "Immich", slot: 1, values: wave(9, 3, 1, [2, 34]) },
  { id: "jellyfin", name: "Jellyfin", slot: 2, values: wave(5, 4, 8, [20, 18]) },
  { id: "ollama", name: "Ollama", slot: 3, values: wave(3, 2, 4, [14, 40]) },
  { id: "vaultwarden", name: "Vaultwarden", slot: 4, values: wave(1.2, 0.5, 2) },
];
const STORAGE = [
  { label: "Media", value: 5.6 },
  { label: "Photos", value: 2.2 },
  { label: "App data", value: 1.5 },
  { label: "Immich model cache", value: 0.8 },
  { label: "Immich database", value: 0.3 },
];
const gb = (n: number) => `${n.toFixed(1)} GB`;

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
            <div className="pg-brand-meta">@graysilk/ui · v0.3 · Foundations, icons, charts &amp; maps</div>
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
            GraySilk components for the homelab dashboard and anything else on graysilk.tech. Every specimen is rendered twice, on
            the dark and the light theme, from the same React code that lives in <code>packages/ui</code>. Apps follow the system
            theme by default.
          </p>
        </section>

        <Section
          id="tokens"
          title="Tokens"
          lead="Six brand colours as primitives, plus semantic tokens that switch with the theme. Components only read the semantic ones. With no data-gs-theme set, the page follows the system."
          usage={`import "@graysilk/ui/fonts.css";\nimport "@graysilk/ui/styles.css";\n// <html class="gs-root">               follows the system\n// <html data-gs-theme="dark" class="gs-root">  pinned`}
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
          id="icons"
          title="Icons"
          lead="Pixelarticons: 1,036 free icons drawn on a strict 24 px pixel grid, MIT licensed, with React components. Use them at 24 px, or 48 px for empty states. Any other size blurs the pixels."
          usage={`import { Server } from "pixelarticons/react/Server.js";\n<Icon icon={Server} />            // decorative, 24 px\n<Icon icon={Server} size={48} label="Server" />`}
        >
          <Specimen>
            {() => (
              <div className="pg-icons">
                {ICONS.map(([name, glyph]) => (
                  <div key={name} className="pg-icon-cell">
                    <Icon icon={glyph} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </Specimen>
          <Specimen>
            {() => (
              <div className="pg-row pg-row-end">
                <Icon icon={Server} size={48} label="Server" />
                <Icon icon={Archive} size={48} label="Backups" />
                <Icon icon={Image} size={48} label="Photos" />
                <span style={{ color: "var(--gs-text-accent)" }}><Icon icon={WarningDiamond} size={48} label="Caution" /></span>
                <span style={{ color: "var(--gs-text-signal)" }}><Icon icon={Bell} size={48} label="Attention" /></span>
              </div>
            )}
          </Specimen>
          <div className="pg-compare" role="table" aria-label="Icon library comparison">
            <div className="pg-compare-row pg-compare-chosen" role="row">
              <div className="pg-compare-name" role="rowheader"><strong>Pixelarticons</strong><span>Chosen · 1,036 free · MIT · React</span></div>
              {COMPARE_PX.map((g, i) => <div key={i} role="cell"><Icon icon={g} /></div>)}
            </div>
            <div className="pg-compare-row" role="row">
              <div className="pg-compare-name" role="rowheader"><strong>HackerNoon Pixel</strong><span>Pixel, but no server, settings or terminal icons</span></div>
              {COMPARISON.map((c) => (
                <div key={c.name} role="cell">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.hackernoon }} />
                </div>
              ))}
            </div>
            <div className="pg-compare-row" role="row">
              <div className="pg-compare-name" role="rowheader"><strong>Lucide</strong><span>Today's dashboard set · smooth strokes, off-brand</span></div>
              {COMPARISON.map((c) => (
                <div key={c.name} role="cell">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.lucide }} />
                </div>
              ))}
            </div>
          </div>
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
                  <Button variant="danger" iconStart={<Stop />}>Stop</Button>
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
          usage={`<IconButton label="Restart Immich" icon={<Reload />} />`}
        >
          <Specimen>
            {(theme) => (
              <>
                <IconButton label="Start" icon={<Play />} variant="primary" />
                <IconButton label="Restart" icon={<Reload />} variant="secondary" loading={busy[`rs-${theme}`]} onClick={() => run(`rs-${theme}`)} />
                <IconButton label="Pin as always-on" icon={<Bookmark />} />
                <IconButton label="Settings" icon={<SettingsCog />} />
                <IconButton label="Delete" icon={<Trash />} variant="danger" />
                <IconButton label="Small" icon={<SettingsCog />} size="sm" variant="secondary" />
                <IconButton label="Large" icon={<SettingsCog />} size="lg" variant="secondary" />
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

        <Section
          id="data-colour"
          title="Data colour"
          lead="Eight chart colours named like metro lines, in a fixed order that passes colour-blind checks on both themes. Status colours are railway signal aspects and always come with an icon and a word."
          usage={`stroke="var(--gs-series-1)"   // Lapis\nbackground: var(--gs-safety-500); // ramps: safety | lapis | signal, 100–900\ncolor: var(--gs-status-stop);`}
        >
          <Specimen stack>
            {(theme) => (
              <>
                <Text variant="label" tone="muted">Categorical · series 1–8</Text>
                <div className="pg-series">
                  {SERIES.map(([name, light, dark], i) => (
                    <div key={name} className="pg-series-item">
                      <span className="pg-series-chip" style={{ background: `var(--gs-series-${i + 1})` }} />
                      <span className="pg-series-name">{i + 1} · {name}</span>
                      <span className="pg-mono pg-series-hex">{theme === "dark" ? dark : light}</span>
                    </div>
                  ))}
                </div>
                <Text variant="label" tone="muted">Sequential · 100 → 900</Text>
                {RAMPS.map((r) => (
                  <div key={r} className="pg-ramp" aria-label={`${r} ramp`}>
                    {STEPS.map((s) => <span key={s} style={{ background: `var(--gs-${r}-${s})` }} title={`--gs-${r}-${s}`} />)}
                    <span className="pg-ramp-name">{r}</span>
                  </div>
                ))}
                <Text variant="label" tone="muted">Diverging · lapis ↔ signal</Text>
                <div className="pg-ramp">
                  {[700, 500, 300].map((s) => <span key={`l${s}`} style={{ background: `var(--gs-lapis-${s})` }} />)}
                  <span style={{ background: "var(--gs-div-mid)" }} />
                  {[300, 500, 700].map((s) => <span key={`s${s}`} style={{ background: `var(--gs-signal-${s})` }} />)}
                  <span className="pg-ramp-name">below · on target · above</span>
                </div>
                <Text variant="label" tone="muted">Status</Text>
                <div className="pg-status">
                  {STATUS.map(([key, word, glyph, meaning]) => (
                    <div key={key} className="pg-status-item">
                      <span style={{ color: `var(--gs-status-${key})` }}><Icon icon={glyph} /></span>
                      <strong>{word}</strong>
                      <span className="pg-dim">{meaning}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Specimen>
        </Section>

        <Section
          id="charts"
          title="Charts"
          lead="Thin marks, square bar ends, hairline grids and quiet chrome; the data is the only loud thing. Line charts have a crosshair (pointer or arrow keys) and every chart has a table view. Figures below are examples."
          usage={`<LineChart title="CPU by service" labels={hours} series={[{ id: "immich", name: "Immich", slot: 1, values }]} />\n<Meter label="Mac internal disk" value={174} max={229} valueText="174 GB of 229 GB" />`}
        >
          <Specimen stack>
            {() => (
              <>
                <div className="pg-stats">
                  <StatTile
                    label="Essentials backup"
                    value="2.3 GB"
                    delta={{ text: "+0.25 GB", direction: "up", good: true, period: "vs 14 days ago" }}
                    trend={BACKUP_GB.slice(2)}
                  />
                  <StatTile label="Services always-on" value="2 of 12" />
                </div>
                <LineChart title="Backup repository size" subtitle="Example data · last 14 days" labels={DAYS} series={[{ id: "repo", name: "Repository", values: BACKUP_GB }]} format={gb} area height={200} />
                <LineChart title="CPU by service" subtitle="Example data · last 24 hours · % of one core" labels={HOURS} series={CPU} format={(n) => `${Math.round(n)}%`} />
                <BarChart title="Storage by folder" subtitle="Homelab SSD · snapshot 11 Oct" data={STORAGE} format={gb} />
                <div className="pg-meters">
                  <Meter label="Homelab SSD" value={0.4} max={1.9} valueText="0.4 TB of 1.9 TB" />
                  <Meter label="Mac internal disk" value={174} max={229} valueText="174 GB of 229 GB" />
                  <Meter label="Docker disk" value={61} max={64} valueText="61 GB of 64 GB (example)" />
                </div>
              </>
            )}
          </Specimen>
        </Section>
        <Section
          id="map"
          title="Map"
          lead="Live OpenStreetMap under your own layers. The OSM tiles are recoloured on the GPU (greyscale for Chalk, inverted grey for Night) so the overlays carry all the colour. Examples: metro lines and stations, a planned extension, 500 m walking catchments, places with cards, and moving trains. Click a station or a pin; use the legend to toggle layers."
          usage={`import { MapView, LineLayer, StationLayer } from "@graysilk/ui/map";\n<MapView center={[22.95, 40.61]} zoom={13} label="Metro map">\n  <LineLayer id="l1" data={line1} color={6} />\n  <StationLayer stations={stations} color={6} onSelect={open} />\n</MapView>`}
        >
          <MapDemo />
        </Section>
      </main>

      <footer className="pg-footer">
        <span>GraySilk UI · packages/ui · branch ui-foundations</span>
        <span>Map data © OpenStreetMap contributors · example station positions are approximate</span>
      </footer>
    </div>
  );
}
