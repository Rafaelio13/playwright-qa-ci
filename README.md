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
| `tests/e2e/auth.spec.js` | UI login, bad-password error |
| `tests/e2e/catalog.spec.js` | Search UI vs `GET /products?q=` · out-of-stock blocks add-to-cart |
| `tests/e2e/checkout.spec.js` | Cart → cash on delivery → **invoice on the API** |
| `tests/e2e/permissions.spec.js` | Customer cannot open `/admin` · admin can |
| `tests/api/contracts.spec.js` | 401 · `/users/me` · product list vs detail |

`@smoke` is the PR gate. Checkout is full regression only.

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

`.github/workflows/ci.yml`

- Pull request → `npm run test:smoke`
- Push to `main` → `npm test`
- HTML report uploaded as an artifact

## AI in the workflow

Cursor and Claude helped draft cases and map the public API. Every assertion was run against the live app.

## License

MIT. Toolshop is © Testsmith; this repo only tests the hosted demo.
