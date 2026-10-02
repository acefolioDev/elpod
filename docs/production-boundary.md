# Production boundary

Elpod is a working alpha foundation for application structure. It does not certify an application as production-ready and it has not been independently security audited.

## Elpod provides

- Explicit application and feature composition.
- Constructor DI with provider lifetimes, overrides, and disposal.
- Native Elysia routes, request context, errors, health routes, and shutdown helpers.
- Boundaries for configuration, auth/session primitives, CSRF, rate limiting, events, jobs, caching, HTTP clients, and observability.
- CLI diagnostics, architecture checks, a test harness, and deployment starters.

## Your application still owns

- Database drivers, schema, migrations, transactions, backups, and recovery testing.
- Identity providers, token formats, MFA, account recovery, authorization policy, and session storage.
- Durable brokers, queues, schedulers, outbox delivery, retries, consumer groups, and dead letters.
- Distributed cache, lock, and rate-limit implementations with atomic guarantees.
- OpenTelemetry SDK/exporter setup, log retention, alerting, and operational dashboards.
- Secrets management, TLS, proxy trust, network egress, container images, orchestration, and rollout policy.
- Load testing, dependency review, incident response, and release rollback.

## Before launch

1. Pin Bun and Elpod versions and review the changelog before upgrades.
2. Run `elpod audit --production --strict --json` in CI.
3. Run the application’s own tests, migration checks, and dependency scans.
4. Verify authentication, authorization, tenant isolation, CSRF, proxy trust, and secret handling for your deployment.
5. Exercise readiness, shutdown, retries, queue recovery, backups, and rollback in an environment shaped like production.

In-memory implementations are useful for local development and tests. They do not coordinate across processes. Treat every adapter boundary as an explicit decision.
