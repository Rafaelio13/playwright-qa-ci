# playwright-qa-ci

Playwright (JavaScript) suite with GitHub Actions quality gates against [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com/), a public demo app built for QA practice.

This is a **personal portfolio repo**. It is not tied to any employer product.

## What this is for

Show a client what “done” looks like on an automation engagement:

- A small set of **business journeys**, not 80 tutorial specs
- **API + UI agreement** (search hits, stock, invoices after checkout)
- Tests that **actually run in CI**, with a smoke gate on PRs and full regression on `main`
- Failures that are readable (HTML report artifact)

## What it covers

| Spec | What it proves |
| --- | --- |
| `tests/auth.spec.js` | UI login, bad-password error |
| `tests/catalog.spec.js` | Search UI matches `GET /products?q=` · out-of-stock matches API and blocks add-to-cart |
| `tests/checkout.spec.js` | Cart → pay (cash on delivery) → **invoice exists on the API** |
| `tests/permissions.spec.js` | Customer cannot open `/admin` · admin can |
| `tests/api.spec.js` | 401 on bad login · `/users/me` · product list vs detail |

`@smoke` tags are the PR gate. Checkout is full regression only: it hits a shared public cart.

## What it does not cover

- Visual, mobile, accessibility, or load testing
- Sauce Demo / OrangeHRM clones
- The `with-bugs` Toolshop host (that is for exploratory reports, not a green CI)

## Run locally

```bash
npm ci
npx playwright install chromium
npm test              # full suite
npm run test:smoke    # PR gate
npx playwright show-report
```

Requires Node 18+.

Demo accounts are public ([Testsmith docs](https://testsmith-io.github.io/practice-software-testing/#/)):

- customer `customer@practicesoftwaretesting.com` / `welcome01`
- admin `admin@practicesoftwaretesting.com` / `welcome01`

Override with `BASE_URL`, `API_URL`, `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD` if you point at another Toolshop sprint.

## CI

`.github/workflows/ci.yml`

- **Pull request** → `npm run test:smoke`
- **Push to `main`** → `npm test`
- HTML report uploaded as an artifact on success or failure
- Chromium only, 1 worker on CI, 2 retries — this is a public demo, not a private staging box

Do not wait for `networkidle` on this app: it keeps a connection open and the wait never settles. Navigations use `domcontentloaded`.

## Design choices

- Selectors go through `data-test` (`testIdAttribute` in config). No CSS-class or copy-based locators for primary actions.
- Auth for non-login tests injects `localStorage.auth-token` from `POST /users/login`. Login itself is still exercised in the UI.
- Product ids come from the API, not hardcoded ULID strings that rotate when the demo reseeds.
- Fixtures stay small. If a helper needs a 400-line page object, the test is doing too much.

## AI in the workflow

Cursor and Claude were used to draft cases and to grok the public Toolshop API. Every assertion was checked against the live app. A green test the model invented and nobody ran would not be in this repo.

## License

MIT. Toolshop itself is © Testsmith; this repo only tests the hosted demo.
