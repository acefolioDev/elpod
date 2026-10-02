import { describe, expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { t } from "elysia";
import { application, pod, type ElpodContract, type ElpodElysia } from "../src/kernel";

class UsersController {
  routes(app: ElpodElysia) {
    return app.get(
      "/:id",
      ({ params }) => ({ id: params.id }),
      {
        params: t.Object({ id: t.String() }),
        response: t.Object({ id: t.String() }),
      },
    );
  }
}

const users = pod({
  name: "users",
  prefix: "/users",
  controller: UsersController,
});
const app = application({ features: [users] });
type Contract = ElpodContract<typeof app>;
type Routes = Contract["~Routes"];
const api = treaty<Contract>("http://elpod.test");

type Expect<Value extends true> = Value;
type HasKey<Value, Key extends PropertyKey> = Key extends keyof Value ? true : false;
type UsersRoute = Routes["users"];
type UserRoute = UsersRoute[":id"];

type _UsersPath = Expect<HasKey<Routes, "users">>;
type _UsersParameter = Expect<HasKey<UsersRoute, ":id">>;
type _UserId = Expect<HasKey<UserRoute, "get">>;

describe("Elpod Eden contract", () => {
  test("keeps native routes at runtime while exposing a typed contract", async () => {
    expect(typeof api.users({ id: "user-1" }).get).toBe("function");
    const { bootstrap, disposeBootstrap } = await import("../src/kernel");
    const server = await bootstrap(app, { printFeatures: false, seal: false });

    try {
      const response = await server.handle(new Request("http://elpod.test/users/user-1"));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: "user-1" });
    } finally {
      await disposeBootstrap(server);
    }
  });
});
