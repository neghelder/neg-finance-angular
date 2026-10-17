# Brokerage and catalog behavior reference

This describes the implemented `/brokerage-history` and
`/settings/asset-categories` pages, not a proposal.

## Operations

The [history component](../src/app/brokerage/brokerage-history/brokerage-history.component.ts)
selects among enabled category collections, including empty ones. It displays
notes in the shared grid, with row selection for editing/deleting. Add/edit use
the note dialog; ticker rename uses a separate dialog. Mutations refresh history
through [BrokerageService](../src/app/brokerage/brokerage.service.ts).

| Method | Request |
|---|---|
| GET | `/brokerage/notes?sort=1`, optionally `include_archived=true` |
| POST | `/brokerage/note` for create/update with collection and ID |
| DELETE | `/brokerage/note/{id}?collection=...` |
| PUT | `/brokerage/update-ticker-name?ticker=...&new_name=...&collection=...` |

The dialog offers buy, sell, split, and reverse-split choices. The API ledger
has no dedicated split/reverse-split calculation; these UI choices do not
establish support for corporate-action accounting. Required controls gate
submission. Dates are formatted `DD/MM/YYYY`; quantities remain numeric and may
be fractional. The price/fees fields still show `R$` prefixes. For field meanings
and backend calculation boundaries, see [domain models](ai/DOMAIN_MODEL.md#brokerage).

## Category management

`Gerenciar categorias` opens a separate panel for enabling available catalog
categories, reactivating archived brokerage categories, showing archived history,
and archiving the selected category. Note toolbar actions are disabled when the
selected collection is archived. The API enforces archival constraints, including
rejecting categories with open positions; the browser displays the API error.
Enabling an empty category permits its first operation without an existing note.

[AssetCatalogService](../src/app/settings/asset-catalog.service.ts) supplies
`ANALYSIS`/`BROKERAGE` capability-filtered catalog queries. Brokerage enable and
archive use PUT/DELETE `/brokerage/categories/{code}`. These are distinct from
catalog archival at DELETE `/asset-catalog/categories/{code}`.

## Catalog settings

The settings page lists current categories and supports creating a market with
currency, creating a category from existing market/type choices, and archiving
a catalog category. It loads GET `/asset-catalog/markets`,
`/asset-catalog/types`, and `/asset-catalog/categories`, and POSTs new
markets/categories. It does not create new asset
type definitions or quote providers. Brokerage enablement happens in history.
The header's **Profile** menu item currently opens this settings route; the
adjacent **Settings** item has no handler.

## Verification

Tests beside the [history component](../src/app/brokerage/brokerage-history/brokerage-history.component.spec.ts),
[brokerage service](../src/app/brokerage/brokerage.service.spec.ts),
[settings component](../src/app/settings/asset-categories/asset-categories.component.spec.ts),
and [catalog service](../src/app/settings/asset-catalog.service.spec.ts) cover
component/HTTP behavior. They do not provide browser E2E validation.
