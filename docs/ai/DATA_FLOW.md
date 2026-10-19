# Data flow

These are current frontend flows. Endpoint methods and payloads are defined in
the linked services; [repository conventions](../../CONSTITUTION.md#contracts-and-navigation)
point to area references for the corresponding UI behavior.

## Portfolio

The template subscribes to `PortifolioComponent.portifolio$` using the async
pipe. [PortifolioService](../../src/app/portifolio/portifolio.service.ts) issues
`GET /portifolio`. The component's `tap` schedules local updates: save returned
collections, clear loading, build selector options and chart data, and choose
the first portfolio if none is selected. There is no `ngOnInit` loader in this
component and the route resolver is disabled.

The map is keyed by portfolio name, then chart mode. `ByPosition` uses known
`market_value` values; `BySector` and `BySubSector` count assets. Changing the
selected portfolio uses the already loaded array. Metrics and row values are
formatted with that portfolio's currency; missing valuation is displayed as
`N/A` rather than recomputed in the browser.

## Brokerage and catalog

[BrokerageService](../../src/app/brokerage/brokerage.service.ts) loads
`/brokerage/notes?sort=1` on construction and publishes results through its
`BehaviorSubject`. The history component consumes that stream, builds category
options, preserves a valid current selection, and derives ticker autocomplete
choices from the latest positive holdings in notes.

Create/edit/delete and ticker rename refresh the full history after a successful
HTTP mutation. Enabling/archiving a brokerage category delegates to
[AssetCatalogService](../../src/app/settings/asset-catalog.service.ts) and also
refreshes history. The include-archived switch changes subsequent history loads.
These are reloads, not optimistic local accounting updates.

Settings loads markets, types, and categories independently. Creating a market
or category, or archiving a catalog category, reloads those lists. This catalog
lifecycle is distinct from enabling a category for brokerage.

## Analysis, criteria, and recommendations

[AnalisysComponent](../../src/app/analisys/analisys.component.ts) loads criteria
and `ANALYSIS`-capable catalog categories on initialization. Selection starts
with the BR share fallback. The selection subject feeds `switchMap`, which
chooses the service method for SHARE, REIT, FIAGRO, ETF, or BDR and passes the
market as origin. Deferred local updates set columns/loading, watchlist,
returned set labels, and the first set's rows. Selecting a different set uses
already loaded rows. Watchlist mutations reload the list and analysis.

The criteria editor loads the API configuration, converts `perc` fields to
percentage values for editing, and reverses that conversion for saving. Its
reset action copies the latest loaded/saved configuration.

Recommendations run only when requested with a positive budget. The component
normalizes type/origin, calls the buy-rec endpoint, and separates the
`total_spent` pseudo-row from ticker/amount recommendations.

## Report snapshots and manual automation

[ScheduledReportsComponent](../../src/app/analisys/scheduled-reports/scheduled-reports.component.ts)
receives the eligible BR report asset type. Changing that input stops existing
polling and loads snapshots, automation status, and supported manual-run assets
with `forkJoin`. It keeps the newest snapshot per asset, while historical
snapshots load on demand. Report cards initially require ticker selection.

A manual request sends selected tickers, asset type, and `force_reprocess`.
Force reprocessing has a separate confirmation in the UI. The backend-provided
job limit constrains selection. A created/recovered active run is fetched
immediately and then polled every three seconds. Terminal statuses are
`FINALIZED`, `UP_TO_DATE`, `PARTIAL`, and `FAILED`; on completion polling stops
and snapshots/status refresh. Failed or partial runs can expose retry. Input
changes and component destruction unsubscribe the interval.

The browser requests work and displays progress; the API owns scheduling,
document retrieval, analysis, and persistence. Errors are handled per feature;
there is no application-wide error stream or standardized error object.
