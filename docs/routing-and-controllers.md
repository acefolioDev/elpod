# Routing and controllers: Elysia keeps the steering wheel

## The idea

Frameworks often make routing feel like filling out paperwork: add metadata here, decorate a method there, and hope another layer generates the route you meant. That can be useful, but it also creates a second language to learn.

## How Elpod provides it

Elpod controllers are thin native Elysia route registrars. The `routes(app)` method receives a grouped Elysia instance and must return it. `ElpodElysia` adds typed request identity fields while preserving Elysia’s route API. If Elysia can do it, your controller can do it.

```ts
import { t } from "elysia";
import type { ElpodElysia } from "elpod";

export class UsersController {
  routes(app: ElpodElysia) {
    return app
      .get("/", () => ({ users: [] }), {
        response: t.Object({ users: t.Array(t.Object({ id: t.String() })) }),
      })
      .post("/", ({ body, requestId }) => ({ id: body.id, requestId }), {
        body: t.Object({ id: t.String({ minLength: 1 }) }),
      });
  }
}
```

Use Elysia’s `t` schemas, params, query, headers, cookies, response maps, lifecycle hooks, `app.ws`, multipart, redirects, streams, and plugins directly. Elpod does not create route decorators or a second router. Native `Response` values retain status, headers, body, and streaming behavior.

The request context includes `requestId` and `correlationId`, and Elpod returns both headers. Request-scoped services can receive the richer `REQUEST_CONTEXT` token through constructor injection.

## Eden Treaty contract

Elpod preserves the native route type assembled from pod controllers. Export the contract from the composition root:

```ts
import { application, type ElpodContract } from "elpod";

export const app = application({ features: [users] });
export type Api = ElpodContract<typeof app>;
```

Clients can consume it from the same workspace or from a published type-only package:

```ts
import { treaty } from "@elysiajs/eden";
import type { Api } from "@company/api-contract";

export const api = treaty<Api>("https://api.example.com");
```

The contract includes controller schemas, dynamic parameters, response types, and pod prefixes. Keep public routes in pods; routes added through untyped `configure` callbacks or native plugins are intentionally runtime-only escape-hatch routes.

## When to use a controller

Use one controller as the HTTP entrypoint for a feature. Keep parsing and transport concerns in the route, then call a service for business logic. Keep route schemas close to routes so Elysia validation and OpenAPI reflect what is actually registered.

## Common mistakes

- Returning a plain object from `routes()` instead of the Elysia instance.
- Adding business authorization only in a route hook and forgetting service-level calls from jobs or events.
- Using a route prefix as a tenancy or permission boundary.
- Hiding route registration behind metadata that `routeManifest()` cannot inspect.

## Production notes

Validate request input and response output with Elysia schemas. Set a deliberate request-body limit in `bootstrap({ maxRequestBodyBytes })`, handle native streaming cleanup, and use `Native Response` only when its headers/status are intentional. See [OpenAPI](./openapi-and-routes.md) and [Errors](./errors.md).
