import { join } from "node:path";

const root = join(import.meta.dir, "..");
const trackedApps = (await Bun.$`git -C ${root} ls-files -- 'examples/**/src/app.ts'`.text())
  .trim()
  .split("\n")
  .filter(Boolean);

if (trackedApps.length === 0) {
  console.log("No example applications found; example checks skipped.");
  process.exit(0);
}

for (const appPath of trackedApps) {
  const directory = join(root, appPath, "../..");
  const name = appPath.split("/").at(-3) ?? appPath;
  const child = Bun.spawn([process.execPath, "x", "tsc", "--noEmit", "-p", "tsconfig.json"], {
    cwd: directory,
    stdin: "ignore",
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await child.exited;
  if (exitCode !== 0) throw new Error(`example typecheck failed: ${name}`);

  const runtime = Bun.spawn([process.execPath, "-e", `
    import { bootstrap, disposeBootstrap } from "elpod";
    import { app } from "./src/app.ts";
    const server = await bootstrap(app, { printFeatures: false });
    try {
      const response = await server.handle(new Request("http://example.test/"));
      if (response.status >= 500) throw new Error("example request failed: ${name} " + response.status);
    } finally {
      await disposeBootstrap(server);
    }
  `], {
    cwd: directory,
    stdin: "ignore",
    stdout: "inherit",
    stderr: "inherit",
  });
  if (await runtime.exited !== 0) throw new Error(`example runtime check failed: ${name}`);
}

console.log(`Example typecheck and runtime checks passed for ${trackedApps.length} applications.`);
