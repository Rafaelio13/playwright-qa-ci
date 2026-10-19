# GitHub Actions examples

These YAML files are **examples**. GitHub only auto-runs workflows that live in `.github/workflows/`.

| File | What it would do if copied |
| --- | --- |
| `daily-regression.yml` | Every day at 06:00 UTC, `npm test` (full suite) |
| `nightly-smoke.yml` | Every day at 03:00 UTC, `npm run test:smoke` |

The live workflow that *does* run is still `.github/workflows/ci.yml` (PR smoke, `main` full suite). It has **no** `schedule:` trigger.

## Enable a daily job later

```bash
cp examples/github-actions/daily-regression.yml .github/workflows/daily-regression.yml
git add .github/workflows/daily-regression.yml
git commit -m "Enable daily Playwright regression"
```

Cron uses UTC. `workflow_dispatch` is included so you can also run the job by hand from the Actions tab.

Do not put a `schedule:` workflow in `.github/workflows/` unless you actually want GitHub to spend minutes every day.
