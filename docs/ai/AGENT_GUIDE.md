# Change guide

Read [repository conventions](../../CONSTITUTION.md) for commands and completion
requirements. Use the [code map](CODEBASE_MAP.md) to find implementation files.
This guide describes how to work with the existing patterns, not a list of
unimplemented feature proposals.

## Components and routes

1. Locate the owning feature and its neighboring `*.spec.ts` tests.
2. Keep the component standalone. Declare the Angular directives, forms, Material modules, and shared components used by its template.
3. Register a new page in [app.routes.ts](../../src/app/app.routes.ts), then wire navigation in the appropriate header or sidebar. Child routes are directly addressable; hosting must supply SPA fallback for reloads.
4. Verify interaction and template behavior in tests, then perform the validation in the constitution.

The root template owns header/footer. `HomeComponent` owns the sidebar and child
router outlet. Inspect those templates before changing layout to avoid adding a
second shell. The existing lazy settings and criteria routes are examples for
additional lazy standalone pages.

## API changes

1. Agree the request/response shape with the API project; it is a FastAPI backend in the multi-project workspace.
2. Update the owning service and model, using the actual serialized keys.
3. Update consumers, including loading/error states and optional or null values.
4. Use `HttpTestingController` to verify requests and component tests to verify the resulting behavior.

[AssetCatalogService](../../src/app/settings/asset-catalog.service.ts) exposes
catalog requests directly; its consumers receive `HttpErrorResponse` objects.
Other feature services commonly convert HTTP errors to strings with
`catchError`. Inspect the particular service before relying on `error.message`
or `error.error.detail`; there is no universal error handler.

## Feature-specific checks

- **Portfolio:** exercise both the grid renderer and card template when changing currency or missing-value behavior. Position chart data omits assets with unknown market value; sector charts count assets.
- **Brokerage:** creating or editing uses a dialog and refreshes the service's collection stream after success. Test category enable/archive/reactivate separately from note actions. Preserve decimal quantities when constructing payloads.
- **Analysis:** selection combines market and singular type, such as `BR_SHARE`. Catalog capability filtering controls offered categories; the component still dispatches to known analysis methods. Check recommendations, watchlists, and report-panel eligibility after changing selection logic.
- **Criteria:** fields with unit `perc` are converted between fractional API values and percentage UI values. Reset restores the last loaded/saved configuration, not hardcoded defaults.
- **Reports:** cover loading, empty selection, source/history details, manual-run limits, force confirmation, retry, terminal states, and polling cleanup when touching automation UI.

For template integration tests that replace component imports, include forms and
other directives the real template needs. For HTTP tests, flush every expected
request and verify that none remain. Existing feature tests are references for
fixtures and mocks; do not assume every existing test measures full coverage.
