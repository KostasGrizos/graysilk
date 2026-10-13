import { useState } from "react";
import { Badge, Button, Card, CardFooter, CardHeader, Loader, ProgressBar, StatusPill, Text } from "@graysilk/ui";

export function App() {
  const [busy, setBusy] = useState(false);
  const run = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 2000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/brand/mark-tile.svg" width={32} height={32} alt="" />
        <Text variant="h3" as="span">GraySilk app</Text>
        <span className="app-header-end">
          <StatusPill status="ok" label="All systems normal" />
        </span>
      </header>
      <div className="app-stripe" aria-hidden="true" />

      <main className="app-main">
        <Text variant="h1">Hello, platform</Text>
        <Text tone="muted">A starting point wired to @graysilk/ui and @graysilk/brand. Replace this page with your app.</Text>

        <div className="app-grid">
          <Card stripe="bottom">
            <CardHeader eyebrow="Example" title="A task" actions={<Badge station>New</Badge>} />
            <ProgressBar label="Progress" value={busy ? undefined : 64} />
            <CardFooter>
              <span>Buttons step, never ease</span>
              <Button size="sm" variant="secondary" loading={busy} onClick={run}>Run</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader eyebrow="Loading" title="While you wait" />
            <Loader variant="train" label="Loading example" showLabel />
          </Card>
        </div>
      </main>
    </div>
  );
}
