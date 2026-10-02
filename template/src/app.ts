import { application, type ElpodContract } from "elpod";
import { app as appFeature } from "@features/app/app.pod";
import { hello } from "@features/hello/hello.pod";
import { Clock } from "@infra/clock";

export const app = application({
  features: [appFeature, hello],
  providers: [Clock],
});

/** Import this type from a client package with `import type`; it has no server runtime side effects. */
export type Api = ElpodContract<typeof app>;
