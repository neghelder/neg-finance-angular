# Implementation constraints and decision record

This file records observable implementation choices and their consequences.
The source does not establish the historical reasons or alternatives considered;
those are not inferred here. Future architectural decisions should include their
actual context, chosen option, rationale, and affected contracts.

## Current choices

| Observation | Consequence for changes | Evidence |
|---|---|---|
| Standalone components; lazy criteria/settings routes | Declare template imports locally and preserve route boundaries | [routes](../../src/app/app.routes.ts) |
| HTTP streams plus local state, brokerage `BehaviorSubject`, layout/theme signals | Match the flow being changed rather than imposing one global store pattern | [flow reference](DATA_FLOW.md) |
| Shared AG Grid and Highcharts wrappers | Inspect existing inputs/events before adding another wrapper | [code map](CODEBASE_MAP.md) |
| API origin embedded in services | A different host requires an explicit configuration change; Nginx does not rewrite these absolute requests | [deployment boundaries](../../CONSTITUTION.md#deployment-boundaries) |
| Financial results are API projections | Preserve nullability and serialized keys; put accounting changes in the API | [domain reference](DOMAIN_MODEL.md) |
| Catalog capabilities and brokerage lifecycle are separate | Registering a category does not imply quotes, analysis, or brokerage enablement | [brokerage reference](../spec-brokerage.md) |

## Known limitations verified in source

- Session checking returns a constant `true`; the root redirect is not a route guard or server authentication.
- The dashboard displays sample data.
- The portfolio resolver is present but disabled in the route.
- Service error handling differs: some services rethrow strings, while catalog requests preserve HTTP errors. There is no shared error handler.
- Analysis interfaces and grid fields are not fully aligned: for example `Stock.priceLimit` differs from grid key `price_limit`. Use actual API JSON when changing mappings; an interface alone does not prove the runtime shape.
- Analysis selectors use the catalog, but the component dispatches only known asset types. Registering another market/category does not provide new data ingestion or pricing.
- The note dialog still shows `R$` price/fee prefixes even though brokerage metadata can include other currencies.
- The note dialog offers split/reverse-split operation codes, but the API ledger has no dedicated corporate-action accounting for them. The labels alone do not establish backend support.
- Jest tests cover components/services; no browser E2E runner is configured. Test counts and coverage are validation results, not permanent architecture facts.

These are observations, not approved plans or assigned priorities. Adding auth,
configurable hosting, caching, another state library, or browser E2E tooling needs
a concrete task and appropriate contract/design work.
