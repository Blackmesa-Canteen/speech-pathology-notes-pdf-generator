# speech-pathology-notes-pdf-generator

A small web app that replaces a paper "Speech Pathology Session Notes"
template: fill in a form for a session, click a button, and download a
clean, formally-formatted PDF.

**Privacy:** everything happens in your browser. There is no backend and no
server-side storage — form data, the signature, and PDF generation never
leave the device you're using.

**AI disclaimer:** this project's code, tests, CI setup, and docs were
written largely with AI assistance. Review before relying on it, especially
for anything privacy- or security-sensitive.

## Tech stack

- Vite + React + TypeScript
- Tailwind v4 + a small set of [shadcn/ui](https://ui.shadcn.com/)-style components (Radix UI primitives, code lives in `src/components/ui`)
- `react-hook-form` + `zod` for form state and validation (`src/schemas/sessionNotesSchema.ts`)
- [`@react-pdf/renderer`](https://react-pdf.org/) to generate the PDF client-side
- `react-signature-canvas` for the drawn signature
- Deployed as a static site on Cloudflare Pages — no Worker/Function needed

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run lint` | Run oxlint |
| `npm run typecheck` | Run `tsc` with no emit |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run the Playwright end-to-end smoke test |

The e2e test starts its own dev server automatically. On a system without
Playwright's browser installed yet, run `npx playwright install chromium`
once first (on Linux, `npx playwright install --with-deps chromium` also
pulls the required OS libraries).

## Configuring presets

The "Present participants" and "Type of visit" fields offer preset options
but always allow free typing. Presets are configured in
[`src/config/presets.json`](src/config/presets.json) — edit that file (even
directly in GitHub's web UI) to add or change options; no code changes
needed.

## Deployment

This repo is meant to be connected directly to
[Cloudflare Pages](https://developers.cloudflare.com/pages/) via its Git
integration: build command `npm run build`, output directory `dist`. Every
push gets a production deploy on `main` and a preview deploy on pull
requests.

## Repository security setup

This repo's CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit
tests, a build, and an end-to-end smoke test on every push and pull request,
plus a check that no Cloudflare credential has been committed (this app
should never need one). Dependabot (`.github/dependabot.yml`) keeps
dependencies and GitHub Actions up to date.

A few things are repository **settings**, not files, and need to be turned
on once in GitHub for this repo:

- Settings → Code security → **Secret scanning** and **Push protection**
- Settings → Code security → Code scanning → **CodeQL: Default setup**
- Settings → Branches → require the CI checks above (and CodeQL) to pass
  before merging to `main`
