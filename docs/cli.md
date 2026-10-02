# CLI: the launch console

## The idea

The CLI is the launch console for the conventions in your repository. It can create the starter shape, inspect what is wired, and stop a risky deployment before it leaves the hangar.

## How Elpod provides it

The `elpod` executable is included in the package. Run it with `bunx elpod ...` or through project scripts.

| Command | Purpose |
| --- | --- |
| `elpod init` | Create the starter application structure. |
| `elpod deployment init` | Interactively add selected deployment files. |
| `elpod dev` | Run `src/main.ts` with Bun watch mode. |
| `elpod start` | Run `src/main.ts`. |
| `elpod make:feature <name>` | Generate controller, pod, and service files. |
| `elpod seal` | Validate architecture and the DI graph. |
| `elpod audit` | Combine architecture and project-risk checks. |
| `elpod doctor` | Check project setup and production hazards. |
| `elpod routes [--json]` | Print native registered routes. |
| `elpod openapi` | Print the generated OpenAPI JSON. |
| `elpod test` | Run the project’s `test` script. |
| `elpod check` | Run the project’s `check` script. |
| `elpod build` | Run the project’s `build` script. |

Useful release checks:

```bash
elpod audit --production --strict --json
elpod doctor --production --strict
elpod routes --json > routes.json
elpod openapi > openapi.json
```

`--strict` turns warnings into blocking findings. `--json` is intended for CI tooling. `audit` checks architecture plus project risks such as lockfiles, secret ignores, container files, unsafe watch-mode starts, and non-root container users.

Project initialization does not choose a deployment platform. Run `elpod deployment init` from the project root to select Docker and/or Kubernetes files. Use `--docker` and `--kubernetes` to make the selection non-interactive in scripts. Generated deployment files remain ordinary project files and can be customized freely; existing files are preserved when the command is run again.

## Common mistakes

- Running commands outside the project root; route/openapi commands load `src/app.ts`.
- Treating `doctor` as a vulnerability scanner.
- Using `dev` for a production start.
- Forgetting to add a generated feature to `src/app.ts`.

## Production notes

Make `seal`, `audit --production --strict`, typecheck, tests, and your deployment-specific checks release gates. Read findings rather than suppressing them; warnings often identify missing ownership decisions.
