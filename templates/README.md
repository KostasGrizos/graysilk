# Templates

Starting points that already follow the GraySilk brand. Copy a folder, then edit.

| Template | For | Start |
|---|---|---|
| [`web-app/`](web-app/) | A new web app: Vite + React + TypeScript wired to `@graysilk/ui` and `@graysilk/brand` (fonts, theme, favicons, home-screen icons). | `cp -R templates/web-app ~/code/my-app && cd ~/code/my-app && npm install && npm run dev` |
| [`repo/`](repo/) | Files for any new repository: README with the banner, MIT LICENSE, CODEOWNERS, a CI workflow that can install the private packages, Renovate config with the GraySilk rules, `.editorconfig`, `.gitignore`, `.npmrc`. | `cp -R templates/repo/. ~/code/my-repo/` then fill in the README |
| [`docs-page/`](docs-page/) | One self-contained HTML page for guides, status pages, or a README as a web page. No build, no dependencies; light/dark follows the system. | Copy `docs-page/index.html` and replace the content |

## Notes

- **Private packages:** `web-app` and `repo` install `@kostasgrizos/*` packages from GitHub Packages, so `~/.npmrc` needs a token (see the root README). In GitHub Actions, add the new repo under **Manage Actions access** on each package.
- **Docs page fonts:** the page uses system fonts unless the brand faces are available. To ship them, copy the `.woff2` files from `@fontsource/silkscreen`, `@fontsource/ibm-plex-sans` and `@fontsource/jetbrains-mono` next to the page and add `@font-face` rules, or install the fonts on the machine.
- **Staying in step:** `docs-page/index.html` carries a copy of the tokens and the mark. `npm run sync:templates` refreshes them; CI fails if they drift from `packages/ui`.
