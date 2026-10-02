# Elpod

An enterprise-friendly structure for Elysia applications: explicit constructor DI, feature boundaries, and native Elysia routes in controllers.

[![npm version](https://img.shields.io/npm/v/elpod?logo=npm)](https://www.npmjs.com/package/elpod)
[![CI](https://github.com/acefolioDev/elpod/actions/workflows/ci.yml/badge.svg)](https://github.com/acefolioDev/elpod/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/acefolioDev/elpod)](./LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-000000?logo=bun)](https://bun.sh)

> Working alpha. APIs and conventions may change. Elpod is a foundation for application structure, not a production-readiness or security guarantee.

## Why Elpod?

Elpod is for teams building a medium-to-large Bun/Elysia service who want named feature boundaries, visible dependency graphs, and useful operational checks without replacing Elysia. It is not a database, identity provider, message broker, deployment platform, or drop-in NestJS migration.

| Approach | Strength | Trade-off |
| --- | --- | --- |
| Plain Elysia | Small, direct, native API | Your team owns conventions as the codebase grows |
| Elpod | Explicit DI, pods, lifecycle boundaries, native routes, `elpod audit` | Working alpha; adapters and deployment policy remain application-owned |
| NestJS | Mature batteries-included application conventions | Decorators and framework abstractions are a poor fit for teams choosing native Elysia/Bun |
| Hand-rolled structure | Total freedom | Boundaries, testing conventions, and architecture checks must be designed and maintained by each team |

## Quickstart

```bash
mkdir my-app && cd my-app
bun init -y
bun add elpod
bunx elpod init
bun run dev
```

`bunx elpod init` creates the starter structure; installing Elpod does not modify an application. See [Getting started](./docs/getting-started.md) for the longer path.

## A minimal feature

Controllers use the native Elysia instance. Pods wire the controller and its providers. Services contain application logic.

```ts
// src/features/hello/hello.service.ts
export class HelloService {
  greet() { return { line: "the service is alive" }; }
}
```

```ts
// src/features/hello/hello.controller.ts
import type { ElpodElysia } from "elpod";
import { HelloService } from "./hello.service";

export class HelloController {
  static readonly inject = [HelloService] as const;
  constructor(private readonly hello: HelloService) {}

  routes(app: ElpodElysia) {
    return app.get("/", () => this.hello.greet());
  }
}
```

```ts
// src/features/hello/hello.pod.ts
import { pod } from "elpod";
import { HelloController } from "./hello.controller";
import { HelloService } from "./hello.service";

export const hello = pod({
  name: "hello", prefix: "/hello", controller: HelloController,
  providers: [HelloService],
});
```

`GET /hello` returns:

```json
{"line":"the service is alive"}
```

## What makes it different

- No decorators, reflection, service locator, or parallel router.
- Constructor injection and provider lifetimes are explicit and type-checked.
- Routes stay native Elysia routes, so Eden Treaty inference is preserved.
- `elpod audit --production --strict --json` can be a CI or release gate.
- Bun-first commands, generated declarations, a CLI, and a package smoke test.

## Feature overview

| Capability | Reference |
| --- | --- |
| Features, pods, and project layout | [Features and pods](./docs/features-and-pods.md), [project structure](./docs/project-structure.md) |
| Constructor DI, lifetimes, overrides | [Dependency injection](./docs/dependency-injection.md) |
| Providers, imports, exports, plugins | [Provider boundaries](./docs/providers-uses-exports.md), [plugins](./docs/plugins.md) |
| Native routes, Eden, OpenAPI | [Routing](./docs/routing-and-controllers.md), [OpenAPI](./docs/openapi-and-routes.md) |
| Configuration, errors, health, shutdown | [Configuration](./docs/configuration.md), [errors](./docs/errors.md), [health](./docs/health-and-shutdown.md) |
| Authentication, sessions, CSRF, tenancy | [Security overview](./docs/security/overview.md), [authentication](./docs/security/authentication.md), [tenancy](./docs/security/tenancy.md) |
| HTTP clients and persistence boundaries | [HTTP client](./docs/http-client.md), [database and migrations](./docs/database-and-migrations.md) |
| Events, jobs, caching, rate limiting | [Events](./docs/events.md), [jobs](./docs/jobs.md), [cache and locks](./docs/cache-and-locks.md), [rate limiting](./docs/security/rate-limiting.md) |
| Observability, testing, deployment | [Observability](./docs/observability.md), [testing](./docs/testing.md), [deployment](./docs/deployment.md) |
| CLI diagnostics | [CLI](./docs/cli.md) |

## Status and roadmap

The core composition model, native routing, DI, lifecycle, configuration, health checks, security primitives, observability boundaries, events/jobs boundaries, cache primitives, HTTP client, testing harness, and CLI diagnostics are implemented. Vendor database adapters, durable queues and brokers, distributed cache/rate limiting, OpenTelemetry SDK/exporter setup, identity providers, and deployment hardening remain application-owned or planned.

See [the production boundary](./docs/production-boundary.md) and [the roadmap](./ROADMAP.md). For the full documentation map, visit [`docs/README.md`](./docs/README.md).

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md), then run `bun install --frozen-lockfile` and `bun run check`. Small, focused pull requests are welcome. Please treat the alpha caveat and the 250-line TypeScript limit as repository rules.

## License

MIT. See [LICENSE](./LICENSE).
