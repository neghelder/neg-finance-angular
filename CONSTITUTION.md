# Repository conventions

This document defines local development conventions. Implementation facts are
linked to source; feature behavior is described in the area references.

## Development

[package.json](package.json) defines dependencies and npm scripts;
[yarn.lock](yarn.lock) is the dependency lockfile used by the [Dockerfile](Dockerfile).
Use `yarn install` to follow that dependency workflow. Run scripts from this
repository root:

```sh
npm start
npm run build
npm run test -- --watch=false --runInBand
```

On PowerShell hosts that block `npm.ps1`, use `npm.cmd` for the same commands.
The build defaults to production in [angular.json](angular.json). The test script
runs Jest with [jest.config.js](jest.config.js) and [setup-jest.ts](setup-jest.ts);
there is no Angular CLI Karma test target or browser E2E target configured.

## Validation

For source changes, run the Jest suite and production build above. Tests live
beside their components and services as `*.spec.ts`. Exercise changed user flows
through component/template integration and HTTP mocks, and add browser E2E
coverage when required by the task. Report what was actually run and any
remaining browser coverage gap. Build warnings are distinct from build failures;
check the configured budgets in `angular.json` before assessing them.

For documentation-only changes, verify claims, source paths, relative links,
and examples against the repository; source test runs are unnecessary unless
the change also affects executable behavior.

## Code conventions

- Build standalone components with explicit template dependencies in `imports`.
- Keep code under its feature folder; reuse the shared grid, selector, loading bar, and chart components when their interfaces fit.
- Prefer TypeScript interfaces for API projections. Match serialized field names and nullability to the API rather than inferring them from labels.
- Use feature services for HTTP calls; choose observable streams or local state according to the flow. Brokerage uses a `BehaviorSubject`; theme and layout use signals. A single state mechanism is not a requirement.
- Manage long-lived subscriptions through the async pipe or explicit cleanup. Report polling already stops on destruction and asset-type changes.
- Preserve supported fractional quantities and distinguish missing valuation from zero.
- Use the shared theme variables in [src/styles.scss](src/styles.scss) for visual changes. Existing templates combine custom styling and Angular Material.
- Follow the strict compiler settings in [tsconfig.json](tsconfig.json).

## Contracts and navigation

[app.routes.ts](src/app/app.routes.ts) is authoritative for route registration.
The application shell hosts dashboard, portfolio, brokerage, analysis, criteria,
and catalog settings. The criteria and settings pages use lazy `loadComponent`
routes. [CODEBASE_MAP.md](docs/ai/CODEBASE_MAP.md) identifies their source files.

Services currently call `http://localhost:8000` directly. No dev-server API proxy
is configured. The API project owns persistence, accounting, catalog capability
rules, analysis calculations, and report processing. Read the relevant area
reference before changing a request or response shape.

## Deployment boundaries

The [Dockerfile](Dockerfile) builds the SPA and copies
`dist/neg-finance/browser` into Nginx. It does not copy the repository's
[nginx.conf](nginx.conf), which defines an SPA fallback, into the image. Treat
that config as unapplied unless deployment supplies it separately. It contains
no API reverse-proxy rule. Browser API requests still use the hardcoded host.
