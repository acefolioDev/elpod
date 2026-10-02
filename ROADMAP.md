# Roadmap

This roadmap is intentionally modest. It is based on gaps already called out in the README and documentation; dates and delivery promises are not implied.

## Now

- Make the alpha easier to evaluate: docs, examples, diagnostics, package smoke tests, and contribution workflows.
- Keep native Elysia routing, Eden Treaty inference, explicit DI, lifecycle ownership, and architecture checks coherent.
- Improve failure reports and documentation around the application-owned boundaries.

## Next

- Document and validate vendor database adapters without making an ORM part of the core package.
- Add a realistic users/auth example with a clearly optional Drizzle or Prisma integration.
- Improve adapters and guidance for durable event/job delivery, including outbox and retry boundaries.
- Add reference implementations or contracts for distributed cache, locks, and rate limiting.
- Improve OpenTelemetry integration guidance while keeping SDK/exporter setup application-owned.

## Later

- Durable queue/event integrations with deployment-specific guarantees documented per adapter.
- Distributed cache and rate-limit implementations with atomicity and multi-instance tests.
- More deployment hardening and provider-specific operational examples.
- Stable API and support policy after alpha feedback.

## Clearly labeled suggestions

These ideas are not commitments: a compatibility matrix for common Bun/Elysia versions; a small adapter certification checklist; and a hosted example repository that can evolve independently from the core package.
