# Portfolio behavior reference

This describes the implemented `/portifolio` page, not a proposal.

## Data and selection

[PortifolioService](../src/app/portifolio/portifolio.service.ts) fetches
`GET /portifolio` and exposes the returned collection array. The
[component](../src/app/portifolio/portifolio.component.ts) subscribes through the
template, shows an initial loading bar, and selects the first collection.
A shared selector changes the displayed collection; this is not a Material tab
per portfolio. Labels replace underscores in collection names with spaces.

## Display

The selected collection provides metric cards, an asset grid, and a pie chart.
Cards display total value, cost, total/unrealized/realized gain, and last
dividends. The dividends card is conditional on a truthy dividend value.
Currency follows `currency_code`, falling back to BRL. Missing total value or
gain appears as `N/A`, while cost remains visible.

Grid columns are defined in the component and include ticker, amount, cost,
mean price, market value, unrealized gain, sector, and subsector. The price
renderer uses the selected currency and renders null/undefined as `N/A`;
zero remains a numeric value.

The chart modes are `ByPosition`, `BySector`, and `BySubSector`. Position values
use known market values and omit unknown ones. Sector/subsector series count
assets and use `N/A` for absent classification; they are not value-weighted.

## Contracts and verification

See [domain models](ai/DOMAIN_MODEL.md#portfolio) for nullable fields and
[flow details](ai/DATA_FLOW.md#portfolio) for subscription/refresh behavior.
The disabled route resolver does not prefetch this page.
[Component tests](../src/app/portifolio/portifolio.component.spec.ts) cover
selection, chart preparation, currency rendering, and unavailable valuations;
[service tests](../src/app/portifolio/portifolio.service.spec.ts) cover HTTP.
They do not constitute browser E2E coverage.
