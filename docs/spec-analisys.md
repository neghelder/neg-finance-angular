# Analysis behavior reference

This describes the implemented `/analysis` page and `/analysis/criteria` editor,
not a proposal. Browser spelling is `analysis`; the API path is `analisys`.

## Analysis selection and sets

[AnalisysComponent](../src/app/analisys/analisys.component.ts) queries
`ANALYSIS`-capable catalog categories for selector labels and market/type pairs.
It starts with a BR share fallback and dispatches known types SHARE, REIT,
FIAGRO, ETF, and BDR to the respective service methods, passing market as origin.
A registered catalog category does not create a new analysis implementation.

A loading bar accompanies selection. Returned `AnalysisSet` names become
segmented navigation labels, with the first set selected. The shared grid uses
column definitions for the chosen type; BDR reuses the share columns. This is
not the old two-tab SHARES/REITS interface. Threshold styling uses the loaded
criteria, and the watchlist panel supports ticker additions/removals with reloads.
Analysis money formatting currently uses a generic `$` string; the portfolio's
currency-aware rendering is not shared by this grid.

[AnalisysService](../src/app/analisys/analisys.service.ts) defines HTTP requests:

| Area | Requests |
|---|---|
| Sets | GET `/analisys/{shares,reits,fiagros,etfs,bdrs}?origin=...` (choose one path segment) |
| Recommendations | GET `/analisys/{plural-type}/buy-rec?origin=...&budget=...` |
| Criteria | GET/PUT `/analisys/criteria` |
| Watchlist | GET `/watchlist?collection=...`, POST `/watchlist`, DELETE `/watchlist/{ticker}?collection=...` |

The recommendations component submits a positive budget on demand and extracts
the `total_spent` aggregate row from ticker/quantity suggestions.

## Criteria editor

The lazy criteria route loads configuration from the API. Catalog analysis
categories supply unique type and origin options. Existing fields are selected
from the configuration; the UI does not define arbitrary new analysis engines.
`perc` values convert from fractions to percentages for editing and back when
saved. Reset restores the latest loaded/saved configuration, despite the
`resetToDefaults` method name.

## Reports and manual runs

The analysis template mounts
[ScheduledReportsComponent](../src/app/analisys/scheduled-reports/scheduled-reports.component.ts)
for BR SHARE, REIT, and FIAGRO, mapped to report types STOCK, FII, and FIAGRO.
It shows latest selected-ticker snapshots, source/freshness/conflict information,
qualitative details, partial failures, and on-demand snapshot history.

The panel also offers manual requests for backend-supported tickers, enforces
the backend job limit, asks confirmation for forced reprocessing, shows runtime
availability, and displays progress/errors. Active runs poll every three seconds;
terminal runs refresh reports. Partial/failed runs can be retried. Backend status
can restore an active manual run after the component loads. Selection for viewing
reports and selection for requesting new reports are separate.

| Method | Report requests under `/analisys/reports` |
|---|---|
| GET | `?asset_type=...` and `/{asset_type}/{ticker}/history` |
| GET | `/automation/status`, `/automation/assets?asset_type=...`, `/automation/runs/{run_id}` |
| POST | `/automation/runs` and `/automation/runs/{run_id}/retry` |

The API performs scheduling and processing; the UI does not schedule browser
jobs or calculate qualitative results. Full request/projection definitions are
in the [report models](../src/app/analisys/models/scheduled-report.ts).

## Contracts and verification

See [domain reference](ai/DOMAIN_MODEL.md#analysis-and-criteria) for field/unit
caveats, especially legacy camelCase interfaces versus snake_case grid keys.
Adjacent component/service tests cover selection, criteria, recommendations,
reports, and HTTP interactions. No browser E2E runner is configured. Validation
commands live in [CONSTITUTION.md](../CONSTITUTION.md#validation).
