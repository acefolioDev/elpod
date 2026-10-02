import type { DefinitionBase, MetadataBase, RouteBase } from "elysia";
import type Elysia from "elysia";
import { token, type ProviderToken } from "../di/di";
import type { TraceContext } from "../observability/observability";

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

export type ElpodRequestContext = {
  readonly request: Request;
  readonly route: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly traceContext?: TraceContext;
};

/** Explicit request data available to request-scoped constructor dependencies. */
export const REQUEST_CONTEXT: ProviderToken<ElpodRequestContext> = token("elpod.request-context");

export type ElpodSingleton = {
  readonly decorator: {};
  readonly store: {};
  readonly derive: {
    readonly requestId: string;
    readonly correlationId: string;
  };
  readonly resolve: {};
};

/** Native Elysia with Elpod's typed request context. */
export type ElpodElysia<
  BasePath extends string = "",
  Routes extends RouteBase = {},
> = Elysia<BasePath, ElpodSingleton, DefinitionBase, MetadataBase, Routes>;

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function requestIdFrom(headers: Headers): string {
  const supplied = headers.get(REQUEST_ID_HEADER);
  return supplied && REQUEST_ID_PATTERN.test(supplied) ? supplied : crypto.randomUUID();
}

/** Read a safe upstream correlation ID, falling back to the request ID. */
export function correlationIdFrom(headers: Headers, fallback: string = crypto.randomUUID()): string {
  const supplied = headers.get(CORRELATION_ID_HEADER);
  if (supplied && REQUEST_ID_PATTERN.test(supplied)) return supplied;
  return REQUEST_ID_PATTERN.test(fallback) ? fallback : crypto.randomUUID();
}
