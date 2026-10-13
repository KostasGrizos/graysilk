import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@graysilk/ui/fonts.css";   // the three brand faces, bundled (no Google requests)
import "@graysilk/ui/styles.css";  // tokens + base + component styles
import "./app.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
