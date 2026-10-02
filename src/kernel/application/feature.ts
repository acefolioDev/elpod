import type { AnyElysia } from "elysia";
import { providerToken, type Injectable, type InjectionToken, type Provider } from "../di/di";
import type { ElpodPlugin } from "./plugins";

/**
 * A route registrar keeps its concrete Elysia type in the controller source.
 * The framework only invokes it with the native grouped Elysia instance.
 */
export type NativeRouteRegistrar = (app: AnyElysia) => AnyElysia;

export type ControllerInstance = {
  routes: NativeRouteRegistrar;
};

export type Controller = Injectable<ControllerInstance> & {
  prototype: ControllerInstance;
};

export type Feature<
  ControllerType extends Controller = Controller,
  Name extends string = string,
  Prefix extends `/${string}` = `/${string}`,
> = {
  readonly kind: "feature";
  readonly name: Name;
  readonly prefix: Prefix;
  readonly controller: ControllerType;
  readonly providers: readonly Provider[];
  /** Tokens provided by the application and intentionally consumed by this feature. */
  readonly uses: readonly InjectionToken[];
  /** Feature-owned providers that other features may import explicitly. */
  readonly exports: readonly InjectionToken[];
  /** Features whose exported providers this feature may consume. */
  readonly imports: readonly Feature[];
};

export type Application<Features extends readonly Feature[] = readonly Feature[]> = {
  readonly kind: "application";
  readonly features: Features;
  readonly providers: readonly Provider[];
  readonly plugins: readonly ElpodPlugin[];
};

export type Pod = Feature;

export function pod<
  const Name extends string,
  const ControllerType extends Controller,
  const Prefix extends `/${string}` = `/${Name}`,
>(input: {
  name: Name;
  prefix?: Prefix;
  controller: ControllerType;
  providers?: readonly Provider[];
  uses?: readonly (Provider | InjectionToken)[];
  exports?: readonly (Provider | InjectionToken)[];
  imports?: readonly Feature[];
}): Feature<ControllerType, Name, Prefix> {
  if (!/^[a-z][a-z0-9]*$/.test(input.name)) {
    throw new Error(`Feature name must be a single lowercase word (got "${input.name}")`);
  }
  const prefix = input.prefix ?? `/${input.name}`;
  if (!prefix.startsWith("/")) {
    throw new Error(`Feature prefix must start with "/"`);
  }
  if (prefix.startsWith("//") || /[?#\r\n]/.test(prefix)) {
    throw new Error("Feature prefix must be a path without a query, fragment, or control characters");
  }
  const uses = (input.uses ?? []).map(providerUseToken);
  const exports = (input.exports ?? []).map(providerUseToken);
  const providerTokens = new Set((input.providers ?? []).map(providerToken));
  for (const token of exports) {
    if (!providerTokens.has(token)) {
      throw new Error(`${input.name}: exported provider ${providerName(token)} must be declared in providers`);
    }
  }
  assertUnique([...uses, ...input.providers ?? []], "feature provider");
  assertUnique(exports, "feature export");

  return Object.freeze({
    kind: "feature",
    name: input.name,
    prefix,
    controller: input.controller,
    providers: Object.freeze([...(input.providers ?? [])]),
    uses: Object.freeze(uses),
    exports: Object.freeze(exports),
    imports: Object.freeze([...(input.imports ?? [])]),
  }) as Feature<ControllerType, Name, Prefix>;
}

export function application<const Features extends readonly Feature[]>(input: {
  features: Features;
  providers?: readonly Provider[];
  plugins?: readonly ElpodPlugin[];
  /** @deprecated Use providers. Kept for a gentle migration from 0.1.x. */
  infra?: readonly Injectable[];
}): Application<Features> {
  if (input.features.length === 0) {
    throw new Error("Application requires at least one feature");
  }

  assertUnique(input.features.map((feature) => feature.name), "feature name");
  assertUnique(input.features.map((feature) => feature.prefix), "feature prefix");
  const features = new Set<Feature>(input.features);
  for (const feature of input.features) {
    assertUnique(feature.imports.map((imported) => imported.name), "feature import");
    const importedTokens = new Map<InjectionToken, Feature>();
    for (const imported of feature.imports) {
      if (!features.has(imported)) {
        throw new Error(`${feature.name}: imported feature ${imported.name} is not in application.features`);
      }
      if (imported === feature) throw new Error(`${feature.name}: a feature cannot import itself`);
      for (const token of imported.exports) {
        const previous = importedTokens.get(token);
        if (previous && previous !== imported) {
          throw new Error(`${feature.name}: provider ${providerName(token)} is exported by both ${previous.name} and ${imported.name}`);
        }
        importedTokens.set(token, imported);
      }
    }
    for (const provider of [...feature.providers, feature.controller]) {
      const token = providerToken(provider);
      const imported = importedTokens.get(token);
      if (imported) {
        throw new Error(`${feature.name}: provider ${providerName(token)} shadows exported provider from ${imported.name}`);
      }
    }
  }
  if (input.providers !== undefined && input.infra !== undefined) {
    throw new Error('Use application.providers or deprecated application.infra, not both');
  }
  const plugins = input.plugins ?? [];
  assertUnique(plugins.map((extension) => extension.name), "plugin name");
  const providers = input.providers ?? input.infra ?? [];
  const pluginProviders = plugins.flatMap((extension) => extension.providers);
  assertUnique([...providers, ...pluginProviders], "application provider");

  return Object.freeze({
    kind: "application",
    features: Object.freeze([...input.features]),
    providers: Object.freeze([...providers, ...pluginProviders]),
    plugins: Object.freeze([...plugins]),
  }) as Application<Features>;
}

export function featureNames(app: Application): string[] {
  return app.features.map((feature) => feature.name);
}

function assertUnique(values: readonly (string | Provider | InjectionToken)[], label: string) {
  const seen = new Set<string | ReturnType<typeof providerToken>>();
  for (const value of values) {
    const key = typeof value === "string" ? value : providerUseToken(value);
    if (seen.has(key)) {
      const display = typeof value === "string" ? value : providerName(value);
      throw new Error(`Duplicate ${label}: ${display}`);
    }
    seen.add(key);
  }
}

function providerName(provider: Provider | InjectionToken) {
  const token = providerUseToken(provider);
  return typeof token === "function" ? token.name : token.description ?? "anonymous token";
}

function providerUseToken(value: Provider | InjectionToken): InjectionToken {
  return typeof value === "function" || typeof value === "symbol" ? value : providerToken(value);
}
