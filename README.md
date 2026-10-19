# playwright-qa-ci

Playwright (JavaScript) suite with GitHub Actions quality gates against [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com/).

Personal portfolio. Not tied to any employer product.

## Layout

Playwright config stays at the repo root (the runner looks for it there). Everything else is split the way a real v2 suite is split: **framework in `src/`, cases in `tests/`**.

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

`@smoke` is the PR gate. Checkout, contact submit, and favorite mutations are full regression only.

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

Node 18+. This app holds an open connection — do not wait for `networkidle`.

## CI

**Live** — `.github/workflows/ci.yml`

- Pull request → `npm run test:smoke`
- Push to `main` → `npm test`
- HTML report uploaded as an artifact

**Examples only** — `examples/github-actions/`

Daily cron YAML (`0 6 * * *` full suite, `0 3 * * *` smoke) lives here on purpose. GitHub will not schedule them until you copy a file into `.github/workflows/`. See `examples/github-actions/README.md`.

## AI in the workflow

Cursor and Claude helped draft cases and map the public API. Every assertion was run against the live app.

## License

MIT. Toolshop is © Testsmith; this repo only tests the hosted demo.
