import { bootstrap, disposeBootstrap, type BootstrapOptions } from "./bootstrap";
import type { Application } from "./feature";
import type { ElpodContract } from "../http/contract";

export type TestApplicationOptions = Omit<BootstrapOptions, "printFeatures"> & {
  readonly baseUrl?: string;
};

export type TestApplication<App extends Application = Application> = {
  readonly server: ElpodContract<App>;
  readonly request: (path: string | URL, init?: RequestInit) => Promise<Response>;
  readonly dispose: () => Promise<void>;
};

/** Boot an application in memory with native Request/Response integration. */
export async function createTestApplication<const App extends Application>(
  app: App,
  options: TestApplicationOptions = {},
): Promise<TestApplication<App>> {
  const { baseUrl = "http://elpod.test", ...bootstrapOptions } = options;
  const server = await bootstrap(app, { ...bootstrapOptions, printFeatures: false });

  return {
    server,
    request(path, init) {
      const url = typeof path === "string" ? new URL(path, baseUrl) : path;
      return server.handle(new Request(url.toString(), init));
    },
    dispose: () => disposeBootstrap(server),
  };
}
