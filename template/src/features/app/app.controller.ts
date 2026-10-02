import type { ElpodElysia } from "elpod";

export class AppController {
  routes(app: ElpodElysia) {
    return app.get("/", () => ({
      name: "Elpod",
      message: "Your Elpod application is running.",
    }));
  }
}
