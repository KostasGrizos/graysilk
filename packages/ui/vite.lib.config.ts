// Library build: what gets published. JS (ES modules) + one CSS file for the components.
// scripts/finish-build.mjs then assembles styles.css / tokens.css / fonts.css / map.css.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const external = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^pixelarticons($|\/)/,
  /^maplibre-gl($|\/)/,
  /^@fontsource\//,
  "polygon-clipping",
];

export default defineConfig({
  plugins: [react()],
  css: {
    // same class names as in development: gs-<Component>-<class>-<hash>
    modules: { generateScopedName: "gs-[name]-[local]-[hash:base64:4]" },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: { index: "src/index.ts", map: "src/map/index.ts" },
      formats: ["es"],
      cssFileName: "components",
    },
    rollupOptions: {
      external,
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
