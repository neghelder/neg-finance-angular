# neg-finance-angular

Angular web UI for the neg-finance personal finance tracker. It displays
portfolio positions, manages brokerage notes and asset categories, and provides
investment screening and report-analysis views backed by `neg-finance-api`.

## Local development

Install dependencies with Yarn, matching the committed `yarn.lock` and Docker
build, then start the development server:

```sh
yarn install
npm start
```

Open `http://localhost:4200`. Start `neg-finance-api` separately on port 8000;
the frontend services currently call `http://localhost:8000` directly. There is
no configured development proxy or environment-based API URL selection.

## Validation and build

```sh
npm run test -- --watch=false --runInBand
npm run build
```

Tests use Jest and `jest-preset-angular`. Browser end-to-end testing is not
configured. The production build writes browser assets to
`dist/neg-finance/browser`; the Dockerfile serves these files through Nginx.

## Project documentation

- [Project conventions](CONSTITUTION.md)
- [Architecture](docs/ai/ARCHITECTURE.md), [code map](docs/ai/CODEBASE_MAP.md),
  and [data flow](docs/ai/DATA_FLOW.md)
- [Domain terminology](docs/ai/DOMAIN_MODEL.md) and
  [implementation constraints](docs/ai/DECISIONS.md)
- Feature behavior: [portfolio](docs/spec-portifolio.md),
  [brokerage](docs/spec-brokerage.md), and [analysis](docs/spec-analisys.md)
- [Agent entry point](AGENTS.md) and [task guide](docs/ai/AGENT_GUIDE.md)

File paths and API routes retain the existing `portifolio` and `analisys`
spellings. The session check is a stub that currently returns `true`; it does
not provide authentication or access control.
