# playwright-qa-ci

[![Playwright CI](https://github.com/Rafaelio13/playwright-qa-ci/actions/workflows/ci.yml/badge.svg)](https://github.com/Rafaelio13/playwright-qa-ci/actions/workflows/ci.yml)

Playwright (JavaScript) suite against [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com/). Personal portfolio — not tied to any employer product.

The interesting part is not the click count. **UI is checked against the public API** (search, sort, filters, profile, invoices, favorites). Checkout is not “thank you on screen”; it is **an invoice the API can see**. PRs run `@smoke`. `main` runs the full suite.

## Test strategy

| Layer | What belongs here | What does not |
| --- | --- | --- |
| `@smoke` (PR gate) | Cheap, high-signal, little or no mutation: login, 401, empty search, empty register, guest favorite unauthorized, profile vs `/users/me` | Checkout, contact submit, favorite add/delete |
| Full suite (`main`) | Journeys that change demo data, plus the smoke tests | Pixel snapshots, every payment method, i18n of all locales |
| API contracts | Status codes, list vs detail, brands/tree, payment/check | Replacing UI coverage |

Locators use Toolshop’s `data-test` attributes (`playwright.config.js` → `testIdAttribute`). Product ULIDs reseed; fixtures always fetch live IDs. Toolshop keeps an open connection — **never wait for `networkidle`**.

Shared demo user (`customer@practicesoftwaretesting.com`): tests do not change the password or enable TOTP. Favorite add/delete cleans up in `finally`.

## Layout

Playwright config stays at the repo root (the runner looks for it there). Framework in `src/`, cases in `tests/`.

```
.
├── playwright.config.js      # runner config only
├── .env.example              # committed — template
├── .env                      # gitignored — your local overrides
├── .github/workflows/ci.yml  # live CI (PR smoke, main full suite)
├── examples/github-actions/  # daily cron YAML — examples only, not executed
├── src/
│   ├── config/env.js         # reads process.env / .env
│   ├── api/toolshop.api.js   # HTTP client + assertions
│   ├── fixtures/index.js     # auth + catalog fixtures
│   ├── app/navigation.js     # goto / wait / token inject
│   ├── pages/                # locators only
│   └── flows/                # multi-step journeys
└── tests/
    ├── api/                  # contract tests
    └── e2e/                  # UI journeys
```

Specs stay short. If a test needs twenty clicks, that belongs in `src/flows/`.

## What it covers

| Spec | Proves |
| --- | --- |
| `tests/e2e/auth.spec.js` | UI login · bad password · empty register stays invalid |
| `tests/e2e/catalog.spec.js` | Search vs API · out-of-stock · sort A–Z · Hammer category · brand filter · empty search · Hand Tools nav · related products · compare bar |
| `tests/e2e/cart.spec.js` | Empty cart hides the header icon · qty 2 updates badge and line total |
| `tests/e2e/checkout.spec.js` | Cart → cash on delivery → **invoice on the API** |
| `tests/e2e/contact.spec.js` | Required fields · 50-character message · confirmation after POST `/messages` |
| `tests/e2e/favorites.spec.js` | Guest is unauthorized · customer add / list / delete |
| `tests/e2e/account.spec.js` | Profile matches `GET /users/me` · invoices page |
| `tests/e2e/permissions.spec.js` | Customer cannot open `/admin` · admin can |
| `tests/api/contracts.spec.js` | 401 · `/users/me` · list vs detail · brands · category tree · related · payment/check · empty register 422 · empty search |

## Secrets

**Do not commit `.env`.** Git ignores it.

```bash
cp .env.example .env   # optional local overrides
```

`.env.example` is safe to publish: Toolshop demo accounts are public. Real credentials never go in git, README, or CI logs.

`src/config/env.js` is not a secrets file. It only reads environment variables.

## Run locally

```bash
npm ci
npx playwright install chromium
npm test              # full suite
npm run test:smoke    # PR gate
npm run test:api
npm run test:e2e
npx playwright show-report
```

Node 18+.

## CI

**Live** — `.github/workflows/ci.yml`

- Pull request → `npm run test:smoke`
- Push to `main` → `npm test`
- HTML report uploaded as an artifact

**Examples only** — `examples/github-actions/`

Daily cron YAML (`0 6 * * *` full suite, `0 3 * * *` smoke) lives here on purpose. GitHub will not schedule them until you copy a file into `.github/workflows/`. See `examples/github-actions/README.md`. Leaving cron disabled avoids burning minutes and hammering the public demo.

## Known limits

- Cloudflare sometimes challenges a full-page `goto` (login redirect, a second navigation in the same test). Auth smoke accepts **nav-menu or the challenge**. Favorite cleanup uses in-app routing instead of another `goto`.
- Jane Doe’s saved address is Vienna. Checkout switches to a Dutch postcode so city and country match; a Vienna + NL mix 422s the invoice.
- Empty cart hides `nav-cart` (`items === 0`). There is no empty-state copy until a cart exists.

## AI in the workflow

Cursor and Claude helped draft cases and map the public API. Every assertion was run against the live app.

## License

MIT. Toolshop is © Testsmith; this repo only tests the hosted demo.
