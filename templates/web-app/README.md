# GraySilk web app starter

Vite + React + TypeScript, already wired to the GraySilk brand: fonts, colours, light/dark theme that follows the system, favicons and home-screen icons, and the `@graysilk/ui` components.

## Start a project from it

```bash
cp -R /Volumes/Homelab/git/graysilk/templates/web-app ~/code/my-app   # or download it from GitHub
cd ~/code/my-app
npm install        # needs the GitHub Packages token in ~/.npmrc (see the graysilk README)
npm run dev
```

## What's wired

- `@graysilk/ui` and `@graysilk/brand` are installed under those short names through npm aliases of the private `@kostasgrizos/graysilk-*` packages. Renovate can keep them current.
- `src/main.tsx` imports `@graysilk/ui/fonts.css` and `@graysilk/ui/styles.css` once.
- `scripts/sync-brand.mjs` copies favicons, the web app manifest and the brand mark from `@graysilk/brand` into `public/` before `dev` and `build`. Those copies are git-ignored.
- `<html class="gs-root">` gives the page the brand ground, ink and type; add `data-gs-theme="dark"` or `"light"` to pin a theme.
- Rename the project in `index.html` (`<title>`), `package.json` and the `APP` constant at the top of `scripts/sync-brand.mjs` (the home-screen name written into `site.webmanifest`).
