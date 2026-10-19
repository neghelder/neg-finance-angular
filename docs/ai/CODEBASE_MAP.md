# Code map

Use this map to locate the owner of a change. It deliberately omits generated
files, exhaustive directory trees, line counts, and dependency versions.

| Change | Start here |
|---|---|
| Bootstrap/providers | [main.ts](../../src/main.ts), [app.config.ts](../../src/app/app.config.ts) |
| Routes/session redirect | [app.routes.ts](../../src/app/app.routes.ts), [app.component.ts](../../src/app/app.component.ts), [auth.service.ts](../../src/app/auth/auth.service.ts) |
| Shell/navigation/theme | [home](../../src/app/home/home.component.ts), [header](../../src/app/layout/header/header.component.ts), [sidebar](../../src/app/shared/side-bar/side-bar.component.ts), [theme](../../src/app/layout/theme.service.ts), [layout state](../../src/app/layout/layout.service.ts) |
| Portfolio rendering/data | [component](../../src/app/portifolio/portifolio.component.ts), [service](../../src/app/portifolio/portifolio.service.ts), [models](DOMAIN_MODEL.md#portfolio) |
| Brokerage operations | [history](../../src/app/brokerage/brokerage-history/brokerage-history.component.ts), [service](../../src/app/brokerage/brokerage.service.ts), [note dialog](../../src/app/brokerage/brokerage-history/create-note/create-note.component.ts), [rename dialog](../../src/app/brokerage/brokerage-history/rename-ticker/rename-ticker.component.ts) |
| Analysis sets/watchlist | [component](../../src/app/analisys/analisys.component.ts), [service](../../src/app/analisys/analisys.service.ts) |
| Criteria configuration | [editor](../../src/app/analisys/criteria-editor/criteria-editor.component.ts), [model](../../src/app/analisys/models/criteria.ts) |
| Recommendations | [component](../../src/app/analisys/recommendations/recommendations.component.ts) |
| Reports/history/manual runs | [component](../../src/app/analisys/scheduled-reports/scheduled-reports.component.ts), [models](../../src/app/analisys/models/scheduled-report.ts) |
| Catalog settings | [component](../../src/app/settings/asset-categories/asset-categories.component.ts), [service](../../src/app/settings/asset-catalog.service.ts), [models](../../src/app/settings/asset-catalog.ts) |
| Shared table/chart | [grid](../../src/app/shared/widgets/grid/grid.component.ts), [pie](../../src/app/shared/widgets/pie/pie.component.ts), [trend](../../src/app/shared/widgets/trend/trend.component.ts) |
| Selector/loading | [selector](../../src/app/shared/asset-type-selector/asset-type-selector.component.ts), [loading bar](../../src/app/shared/loading-bar/loading-bar.component.ts) |
| Global appearance | [styles.scss](../../src/styles.scss) and the owning component's template/style files |
| Tests/build | [package.json](../../package.json), [Jest config](../../jest.config.js), [Angular config](../../angular.json), adjacent `*.spec.ts` files |

Paths retain the existing spellings `portifolio` and `analisys`. Browser routing
uses `/analysis`, while analysis API URLs use `/analisys`; preserve that
distinction. `PortifolioResolverService` exists but is disabled in the route.
[DashboardComponent](../../src/app/shared/dashboard/dashboard.component.ts) uses
demo data. The older [FiagroReportsComponent](../../src/app/analisys/fiagro-reports/fiagro-reports.component.ts)
exists, but the analysis template currently mounts `ScheduledReportsComponent`.
