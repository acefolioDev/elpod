# Contributing to Elpod

Thanks for helping improve Elpod. It is a working alpha, so small, well-scoped changes and clear boundary discussions are especially valuable.

## Development setup

Requirements: Bun `>=1.4.0` and Git.

```bash
git clone https://github.com/acefolioDev/elpod.git
cd elpod
bun install --frozen-lockfile
bun run check
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `bun run check` | line limits, typecheck, examples, and tests |
| `bun run check:lines` | enforce the 250-line TypeScript limit |
| `bun run seal` | run the full repository check as the architecture gate |
| `bun run build` | emit declarations and Bun bundles |
| `bun run test:package` | pack and exercise a clean consumer |
| `bun run bench` | run environment-specific diagnostic measurements |
| `bun run landing:build` | build the documentation website |

Run focused tests with `bun test test/<name>.test.ts`.

## Branches and commits

Use a short branch from `main`, preferably `codex/<topic>` for automation-created branches or `<type>/<topic>` for human work. Keep commits focused. Conventional-style prefixes are encouraged: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.

Do not commit generated `dist/` output unless a release process explicitly requires it. Keep `bun.lock` current when dependency metadata changes.

## Tests and documentation

Add or update focused tests for behavior changes. Prefer native `Request`/`Response` integration tests and explicit provider overrides through the test harness. For documentation-only changes, verify links, code snippets, and line limits where relevant. New tracked example applications under `examples/` are checked for type safety and a basic runtime request by `check:examples`.

## Architecture rules

- TypeScript only for maintained source; Bun is the default runtime and toolchain.
- No decorators, reflection-based injection, service locators, or hidden global state.
- Keep routes native to Elysia. Controllers receive and return the native Elysia instance.
- Keep feature wiring explicit through pods, providers, `uses`, `imports`, and `exports`.
- Keep public application imports pointed at `elpod`; do not create a second framework API.
- Keep maintained TypeScript files under 250 lines; split focused capability modules when needed.
- Treat in-memory adapters as local/test implementations unless the documentation says otherwise.
- Preserve alpha and production-boundary caveats. Do not add security or performance claims without evidence.

## Pull requests

Before opening a PR:

- [ ] Explain the user-facing problem and the smallest useful change.
- [ ] Add or update tests when behavior changes.
- [ ] Update the relevant docs and changelog entry when appropriate.
- [ ] Run `bun run check`, `bun run build`, and `bun run test:package`.
- [ ] Confirm no secrets, generated artifacts, or unrelated refactors are included.
- [ ] Call out API, security, compatibility, or migration implications.

Maintainers may ask for a narrower scope or a follow-up issue. That is normal for an alpha project.
