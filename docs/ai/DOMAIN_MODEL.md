# Frontend domain model

This is a guide to API projections consumed by the UI, not a database schema or
a new source of accounting/tax rules. The API owns calculations and validation.
TypeScript interfaces describe compile-time expectations; they do not validate
runtime JSON.

## Catalog and categories

[Catalog models](../../src/app/settings/asset-catalog.ts) distinguish:

- **Market:** code, label, currency, and active flag.
- **Asset type:** supported type code and collection suffix.
- **Category:** market/type combination with a code, display label, currency, capability list, and brokerage state.

`brokerage_state` is `available`, `enabled`, or `archived`. It is distinct from
catalog activity/archival. A category may exist in the catalog without an enabled
brokerage collection. Capabilities such as `BROKERAGE` and `ANALYSIS` describe
available behavior, rather than granting every registered category market data.

## Portfolio

[Portifolio](../../src/app/portifolio/portifolio.ts) is a returned collection of
positions with a name, optional `currency_code`, assets, and summary metrics.
The endpoint returns an array of such collections, not one user-named portfolio
per account. There is no user-account cardinality constraint in this model.

[Asset](../../src/app/portifolio/asset.ts) represents a ticker's position:
`amount`, `cost`, `mean_price`, and valuation/classification fields. `price`
accepts `null`; optional `market_value` and `unrealized_gain` also accept `null`.
[TotalMetrics](../../src/app/portifolio/totalMetrics.ts) allows unknown
`total_value`, `unrealized_gain`, and `gain`, while preserving numeric cost,
realized gain, and last dividends. The UI treats unavailable valuation separately
from zero and falls back to BRL if currency metadata is absent.

## Brokerage

[Note and BrokerageCollection](../../src/app/brokerage/brokerage.ts) are operation
records grouped by category/collection, not by ticker. One collection can contain
many tickers. Collection metadata can include label, market, type, currency,
capabilities, and archival state.

The dialog offers `C` (buy), `V` (sell), `D` (split), and `A` (reverse split).
It sends dates as `DD/MM/YYYY`. `qtd` and holding `amount` are numbers and may be
fractional. `total_rat` is the fees input, not trade notional. `id: -1` is used
by the create payload; edit uses the existing ID and both include collection.
Derived cost, average price, gain/loss, and tax-related fields are supplied by
the API. Do not derive tax rules from their labels or turn this document into
tax advice.

The note form requires its input controls; stronger accounting validation belongs
to the API. No ticker-length limit, universal nonnegative ratio rule, or
future-date prohibition is established by these interfaces.

## Analysis and criteria

[AnalysisSet](../../src/app/analisys/models/analysisSet.ts) contains `name` and
`analisys` rows. The frontend dispatches SHARE, REIT, FIAGRO, ETF, and BDR across
supported catalog markets. Row interfaces live under
[src/app/analisys/models](../../src/app/analisys/models). Existing grids also
reference serialized keys such as `price_limit`, `mean_price`, `to_buy`, and
`to_equalize`; some legacy interfaces use camelCase and are incomplete. Match
changes to the API response and service tests rather than silently renaming keys.

[CriteriaConfig](../../src/app/analisys/models/criteria.ts) indexes by asset type,
origin, then field. A field has optional min/max and a unit. `perc` values are
fractions at the API boundary and displayed as percentages in the editor.

A [Recommendation](../../src/app/analisys/recommendations/recommendation.ts) has
ticker and amount. The `total_spent` ticker is a special aggregate row separated
by the recommendations component. Grades, price limits, and allocation values
are backend analysis outputs, not fixed numeric ranges or exchange price bands.

## Reports

[Report models](../../src/app/analisys/models/scheduled-report.ts) distinguish
read-only snapshots from manual automation requests/runs. Report asset types are
`FII`, `FIAGRO`, and `STOCK`; the analysis page maps BR REIT, FIAGRO, and SHARE
to them respectively. A snapshot combines market, portfolio, qualitative, source,
freshness, conflict, failure, and detail projections. Preserve unavailable and
partial states instead of presenting every snapshot as a completed analysis.

Manual requests contain asset type, tickers, and force-reprocess choice. Run
status, per-ticker items, diagnostics, and errors come from the API. The frontend
polls progress and renders details; it does not run the processing pipeline.
