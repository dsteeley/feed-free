# Feed Free

[![CI](https://github.com/dsteeley/feed-free/actions/workflows/ci.yml/badge.svg)](https://github.com/dsteeley/feed-free/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Feed Free is an open-source browser extension that hides algorithmic feeds on Facebook, YouTube, Instagram, Twitter/X, and TikTok — while keeping the parts you actually need.

Works on **Firefox for Android** (Firefox 113+).

## Features

| Platform        | Feed hiding | Notes                                                         |
| --------------- | ----------- | ------------------------------------------------------------- |
| **Facebook**    | ✅          | News Feed, Reels, Stories, Right sidebar                      |
| **YouTube**     | ✅          | Home feed, Watch sidebar, Shorts shelf, End screens, Autoplay |
| **Instagram**   | ✅          | Home feed, Explore, Reels tab                                 |
| **Twitter / X** | ✅          | For You tab, Trending, Who to Follow, Promoted tweets         |
| **TikTok**      | ✅          | For You feed, Explore, Sidebar suggestions                    |

### Additional features

- **Mindfulness cooldown** — need to check the feed? Start a 5-minute pause, then it unlocks for 30 minutes and auto-relocks
- **Per-platform on/off toggles** — enable/disable each site independently
- **Media silencing** — hidden feed videos can't play or unmute
- **SPA-aware** — works with client-side navigation (no page reloads needed)
- **Developer Mode** — structured console logs + on-page debug badge
- **Open source** — MIT licensed, no analytics or telemetry
- **Firefox for Android** — competitor extensions don't work on mobile Firefox; Feed Free does

## Stack

- [WXT](https://wxt.dev/) extension framework
- Vanilla TypeScript
- Manifest V3 (Firefox MV2 build output via WXT)
- `@wxt-dev/storage` for extension settings
- Vitest + jsdom for unit + functional tests
- Playwright for E2E tests

## Project Structure

```
lib/
  selectors/          # CSS selector constants, one file per platform
  storage.ts          # All storage items (platform switches, cooldown timestamps)
  platform-utils.ts   # Shared: SPA tracker, media silencer, cooldown overlay
  page-context.ts     # Facebook route/page classification
  reel-tagger.ts      # Facebook reel/watch article tagging
  video-silencer.ts   # Facebook media silencing policy

entrypoints/
  facebook.content.ts / style.css
  youtube.content.ts / style.css
  instagram.content.ts / style.css
  twitter.content.ts / style.css
  tiktok.content.ts / style.css
  popup/              # Popup UI with per-platform toggles

tests/
  fixtures/           # HTML DOM snapshots for each platform (no auth needed)
  functional/         # Logic tests against fixtures (Vitest + jsdom)
  e2e/                # Playwright tests (real Firefox + extension)
  health/             # Selector health check + fixture update scripts
```

## Install

```bash
npm install
```

## Development

```bash
npm run dev:firefox
```

## Testing

```bash
npm test                 # Unit tests (<5s)
npm run test:functional  # DOM fixture tests (<30s)
npm run test:e2e         # Real Firefox E2E (<2min, requires build first)
npm run test:all         # All of the above
```

## Build

```bash
npm run build            # Chrome
npm run build:firefox    # Firefox
```

## Load in Firefox

1. `npm run build:firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on...** → select `.output/firefox-mv2/manifest.json`

## Release

Tag the version — GitHub Actions does the rest (tests, builds, signs XPI, creates GitHub Release):

```bash
git tag v1.2.0 && git push --tags
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full release process and how to add new platforms.

## Selector Maintenance

Social media sites change their DOM. When selectors break:

1. `npm run selector:health` — find what's stale
2. `npm run fixtures:update` — capture fresh DOM
3. Update `lib/selectors/<platform>.ts` + `tests/fixtures/<platform>.html`
4. `npm run test:functional` — verify

A nightly GitHub Action runs the health check automatically and opens an issue if selectors are stale.

## Signing (Unlisted / Self-distributed)

```bash
cp .env.example .env  # add your AMO API keys
npm run sign:firefox
```

## Privacy

- Uses only `storage` permission for toggle state
- No analytics, no telemetry, no external requests

## License

MIT — see [LICENSE](LICENSE).
