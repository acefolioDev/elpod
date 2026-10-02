import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initDeployment } from "../src/cli/deployment";

describe("deployment generator", () => {
  test("creates only the selected deployment targets", async () => {
    const root = await makeProject();
    try {
      await initDeployment(root, { targets: ["docker"] });

      expect(await Bun.file(join(root, "Dockerfile")).exists()).toBe(true);
      expect(await Bun.file(join(root, ".dockerignore")).exists()).toBe(true);
      expect(await Bun.file(join(root, "deploy/kubernetes.yaml")).exists()).toBe(false);
      expect(JSON.parse(await readFile(join(root, ".elpod/deployment.json"), "utf8"))).toEqual({
        version: 1,
        targets: ["docker"],
        files: [".dockerignore", "Dockerfile"],
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("preserves customized files when rerun", async () => {
    const root = await makeProject();
    try {
      await initDeployment(root, { targets: ["docker"] });
      await writeFile(join(root, "Dockerfile"), "FROM custom/image\n");

      await initDeployment(root, { targets: ["docker", "kubernetes"] });

      expect(await readFile(join(root, "Dockerfile"), "utf8")).toBe("FROM custom/image\n");
      expect(await Bun.file(join(root, "deploy/kubernetes.yaml")).exists()).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

async function makeProject() {
  const root = await mkdtemp(join(tmpdir(), "elpod-deployment-"));
  await mkdir(join(root, "src"), { recursive: true });
  await writeFile(join(root, "src/app.ts"), "export {}\n");
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "demo-app" }) + "\n");
  return root;
}
