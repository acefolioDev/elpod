import type {
  AnyElysia,
  CreateEden,
  DefinitionBase,
  Elysia,
  MetadataBase,
} from "elysia";
import type { Application, Controller, Feature } from "../application/feature";
import type { ElpodSingleton } from "./http";

type ControllerRoutes<ControllerType extends Controller> =
  ControllerType extends { prototype: { routes: (...args: any[]) => infer Registered } }
    ? Registered extends AnyElysia
      ? Registered["~Routes"]
      : {}
    : {};

type FeatureRoutes<FeatureType extends Feature> = FeatureType extends Feature<
  infer ControllerType,
  string,
  infer Prefix
>
  ? ControllerType extends Controller
    ? CreateEden<Prefix, ControllerRoutes<ControllerType>>
    : {}
  : {};

type UnionToIntersection<Union> =
  (Union extends unknown ? (value: Union) => void : never) extends (value: infer Intersection) => void
    ? Intersection
    : never;

type ApplicationRoutes<Features extends readonly Feature[]> = UnionToIntersection<
  Features[number] extends infer FeatureType
    ? FeatureType extends Feature
      ? FeatureRoutes<FeatureType>
      : never
    : never
> extends infer Routes
  ? Routes extends Record<string, unknown>
    ? Routes
    : {}
  : {};

/**
 * The native Elysia contract assembled from an application's pod controllers.
 * Use this as the type parameter for Eden Treaty without importing the server at runtime.
 */
export type ElpodContract<App extends Application = Application> = Elysia<
  "",
  ElpodSingleton,
  DefinitionBase,
  MetadataBase,
  ApplicationRoutes<App["features"]>
>;
