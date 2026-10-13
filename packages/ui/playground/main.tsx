import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/fonts.css";
import "../src/styles/index.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "../src/map/map.css";
import "./playground.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
