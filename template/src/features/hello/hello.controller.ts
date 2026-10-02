import type { ElpodElysia } from "elpod";
import { HelloService } from "./hello.service";

export class HelloController {
  static readonly inject = [HelloService] as const;

  constructor(private readonly hello: HelloService) {}

  routes(app: ElpodElysia) {
    return app.get("/", ({ requestId }) => ({
      ...this.hello.greet(),
      requestId,
    }));
  }
}
