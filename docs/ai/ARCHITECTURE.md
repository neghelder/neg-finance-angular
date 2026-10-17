# Architecture

The frontend is an Angular standalone SPA. The companion `neg-finance-api`
FastAPI project supplies REST data and performs persistence and financial
calculations. The frontend does not access SQLite or the API's MCP transport.
Dependency versions and build options live in [package.json](../../package.json)
and [angular.json](../../angular.json), not in a separate version inventory.

## Application composition

[src/main.ts](../../src/main.ts) bootstraps `AppComponent` with
[app.config.ts](../../src/app/app.config.ts), which provides routing, HTTP,
animations, and the native Material date module.

[AppComponent](../../src/app/app.component.ts) renders the header, router outlet,
and footer. Its initialization calls the session helper and would redirect to
`/default` if false. [AuthService](../../src/app/auth/auth.service.ts) currently
returns `true`; this is a stub, not authentication enforcement or a route guard.

[HomeComponent](../../src/app/home/home.component.ts) provides the responsive
sidebar and nested outlet. [Routes](../../src/app/app.routes.ts) attach feature
pages beneath that shell, with `/default`, `/404`, and the wildcard outside it.
The criteria and asset-category settings pages are lazy components.

## Feature boundaries

| Area | Responsibility |
|---|---|
| Portfolio | Render server positions/metrics, select a collection, build allocation chart series |
| Brokerage | Edit operation records and manage brokerage category lifecycle |
| Analysis | Select supported market/type analysis, show sets, criteria, watchlists, recommendations, and eligible report panels |
| Settings | Create catalog markets/categories and archive categories; brokerage enablement remains in brokerage history |
| Shared/layout | Grid/chart wrappers, selector/loading components, theme and sidebar state |

UI code uses Angular Material, AG Grid, Highcharts, and global theme styles.
Feature services use RxJS HTTP streams; brokerage publishes reloads through a
`BehaviorSubject`. Theme/layout services use signals. There is no NgRx store.
Only report-run progress is polled by the report component; there is no
continuous quote stream or WebSocket integration in these services.

## Runtime boundaries

HTTP services use an explicit `http://localhost:8000` origin. This is the
browser's localhost, including when Nginx serves a production build. Changing
hosting alone does not configure the API address. Deployment details and the
unapplied Nginx fallback file are documented in
[CONSTITUTION.md](../../CONSTITUTION.md#deployment-boundaries).

The dashboard currently renders demonstration data rather than live financial
metrics. Catalog registration does not install a new quote provider or analysis
implementation. Capability flags and available API data determine what a
category can do.

Read [DATA_FLOW.md](DATA_FLOW.md) for subscriptions and refresh behavior and
[DECISIONS.md](DECISIONS.md) for constraints requiring care during changes.
