# GraySilk

The GraySilk identity in one place: the brand, the React components that follow it, and templates for new projects. Everything here is published as versioned, private packages, so every project (the homelab first) uses the same brand and gets updates as reviewable pull requests.

| Folder | Published as | What it is |
|---|---|---|
| [`packages/brand`](packages/brand) | `@kostasgrizos/graysilk-brand` | Logos, favicons and app icons, loading animations, social images, the [brand guide](packages/brand/BRAND_GUIDE.md), and the scripts that draw them |
| [`packages/ui`](packages/ui) | `@kostasgrizos/graysilk-ui` | React components: tokens, buttons, cards, status, loaders, charts, and an OSM map theme |
| [`templates`](templates) | (copy, not installed) | Web app starter, repository starter, self-contained docs page |

Projects install the packages under short names with npm aliases, so code always says `@graysilk/ui` and `@graysilk/brand`:

```bash
npm install @graysilk/ui@npm:@kostasgrizos/graysilk-ui @graysilk/brand@npm:@kostasgrizos/graysilk-brand
```

## One-time setup on a machine

The packages are private, so npm needs a GitHub token to read them.

1. Create a **classic** personal access token at <https://github.com/settings/tokens/new> with only the `read:packages` scope (add `write:packages` only if you will publish from this machine; normally GitHub Actions publishes). GitHub Packages' npm registry doesn't accept fine-grained tokens.
2. Put it in your user `~/.npmrc` (never in a repo):

   ```ini
   //npm.pkg.github.com/:_authToken=ghp_your_token
   ```

Each project then has an `.npmrc` that says where the `@kostasgrizos` scope lives:

```ini
@kostasgrizos:registry=https://npm.pkg.github.com
```

## Working here

```bash
npm install            # npm workspaces: packages/ui and packages/brand
npm run playground     # live specimen page for the components
npm run check          # typecheck, tests, build, templates in step
```

- **Brand files** are generated: edit `packages/brand/source/bitmaps.py`, run `npm run export -w packages/brand` (Python 3 with Pillow and reportlab), commit the results. Re-runs are byte-identical.
- **Templates** carry copies of the tokens and the mark; `npm run sync:templates` refreshes them and CI fails if they drift.

## Releasing

Both packages share one version number.

```bash
npm run release -- 0.6.1      # or patch | minor | major: runs the checks, bumps, commits, tags
git push --follow-tags        # GitHub Actions publishes both packages and makes a GitHub release
```

The release workflow publishes with the repository's own `GITHUB_TOKEN`, and attaches `graysilk-brand-vX.Y.Z.zip` (the brand files) to the GitHub release for projects that don't use npm.

Versioning: patch = fixes (projects auto-merge these), minor = new components or assets, major = something a project must change. Below 1.0, treat a minor that changes existing behaviour as major and say so in the release notes.

## How projects stay in sync

Renovate watches each project. When a new version is published it opens a pull request there; patch releases merge on their own, minor and major ones wait on the dependency dashboard. The [`templates/repo/renovate.json`](templates/repo/renovate.json) has the rules, including the `hostRules` entry Renovate needs to read the private packages (a `GH_PACKAGES_TOKEN` secret in the Renovate app settings).

For GitHub Actions in another private repo to install the packages: on each package's page (github.com/KostasGrizos → Packages → the package → Package settings), add that repo under **Manage Actions access**.
