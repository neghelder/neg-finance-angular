# neg-finance-angular

Angular web UI for the neg-finance REST API. In the multi-project workspace,
read the orchestration root at `../AGENTS.md` for cross-project work and quality
gates. That parent file belongs to the workspace and may be absent in a
standalone clone; this file and the references below cover this repository.

## Read by task

- Before changing code, read [CONSTITUTION.md](CONSTITUTION.md) for local conventions and validation.
- To locate a feature, use [CODEBASE_MAP.md](docs/ai/CODEBASE_MAP.md).
- For a component, service, route, or test change, use [AGENT_GUIDE.md](docs/ai/AGENT_GUIDE.md).
- For subscription, refresh, or automation behavior, read [DATA_FLOW.md](docs/ai/DATA_FLOW.md).
- For contracts and terminology, read [DOMAIN_MODEL.md](docs/ai/DOMAIN_MODEL.md).
- For system boundaries and implementation constraints, read [ARCHITECTURE.md](docs/ai/ARCHITECTURE.md) and [DECISIONS.md](docs/ai/DECISIONS.md).
- For user-facing behavior, read the relevant [portfolio](docs/spec-portifolio.md), [brokerage](docs/spec-brokerage.md), or [analysis](docs/spec-analisys.md) reference.

## Completion requirements

Source changes include unit tests and integration or end-to-end coverage for
the affected behavior. New user-facing flows should include browser E2E tests;
the current project has no browser E2E runner configured. Report any coverage
gap explicitly. Target full coverage of changed logic without claiming an
unmeasured coverage percentage.

Run the validation commands in [CONSTITUTION.md](CONSTITUTION.md#validation)
and report failures or warnings before handoff. Coordinate API contract changes
with the API project before updating the consumer. Keep persistent financial
calculations and database writes in the API.
