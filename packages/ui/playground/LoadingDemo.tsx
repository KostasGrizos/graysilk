import { useEffect, useState } from "react";
import { Loader, PixelTrain, ProgressBar, Text } from "../src";

/** A value that climbs in steps and starts over, so the progress bar has something to show. */
function useClimb(stepMs = 500) {
  const [v, setV] = useState(35);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setV((n) => (n >= 100 ? 0 : Math.min(100, n + 4))), stepMs);
    return () => window.clearInterval(t);
  }, [stepMs]);
  return v;
}

export function LoaderRow() {
  return (
    <div className="pg-loaders">
      <figure>
        <Loader variant="stations" size="md" />
        <figcaption>stations · inline</figcaption>
      </figure>
      <figure>
        <Loader variant="train" size="sm" />
        <figcaption>train · panels</figcaption>
      </figure>
      <figure>
        <Loader variant="mark" size="md" />
        <figcaption>mark · app start</figcaption>
      </figure>
      <figure>
        <Loader variant="stations" size="sm" showLabel label="Starting Immich" />
        <figcaption>with label</figcaption>
      </figure>
    </div>
  );
}

export function TrainRow() {
  return (
    <div className="pg-row" style={{ alignItems: "flex-end", gap: 24 }}>
      {[1, 2, 3, 4].map((s) => <PixelTrain key={s} scale={s} />)}
      <PixelTrain scale={3} direction="left" color="var(--gs-series-1)" label="Line 2 train heading west" />
      <PixelTrain scale={3} color="var(--gs-series-6)" label="Line 1 train heading east" />
    </div>
  );
}

export function ProgressDemo() {
  const v = useClimb();
  return (
    <div className="pg-progress">
      <ProgressBar label="Restoring Immich database" value={v} />
      <ProgressBar label="Uploading to backup drive" value={1.2} max={4} valueText="1.2 of 4 GB" />
      <ProgressBar label="Pulling container images" tone="signal" value={17} max={20} valueText="17 of 20 images" segments={20} />
      <ProgressBar label="Checking backups" />
      <Text variant="small" tone="muted">With no value, the train runs along the line until the work is measurable.</Text>
    </div>
  );
}
