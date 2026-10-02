import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const deploymentTemplateRoot = join(packageRoot, "template/deployment");

export const deploymentTargets = ["docker", "kubernetes"] as const;
export type DeploymentTarget = (typeof deploymentTargets)[number];

type DeploymentManifest = {
  readonly version: 1;
  readonly targets: readonly DeploymentTarget[];
  readonly files: readonly string[];
};

type DeploymentOptions = {
  readonly targets?: readonly DeploymentTarget[];
};

const targetFiles: Record<DeploymentTarget, readonly string[]> = {
  docker: ["Dockerfile", ".dockerignore"],
  kubernetes: ["deploy/kubernetes.yaml"],
};

export async function initDeployment(target: string, options: DeploymentOptions = {}) {
  const appPath = join(target, "src/app.ts");
  if (!(await Bun.file(appPath).exists())) {
    throw new Error("src/app.ts not found — run this in an Elpod app");
  }

  const selected = options.targets === undefined
    ? await chooseTargets()
    : normalizeTargets(options.targets);
  if (selected.length === 0) {
    throw new Error("select at least one deployment target");
  }

  const packageName = await readPackageName(target);
  const existing = await readManifest(target);
  const files = new Set(existing?.files ?? []);

  for (const targetName of selected) {
    for (const file of targetFiles[targetName]) {
      const destination = join(target, file);
      if (await Bun.file(destination).exists()) {
        console.log(`  ·  preserved ${file}`);
      } else {
        await mkdir(dirname(destination), { recursive: true });
        const template = join(deploymentTemplateRoot, file);
        const source = await Bun.file(template).text();
        const content = file === "deploy/kubernetes.yaml"
          ? source.replaceAll("elpod-app", normalizeApplicationName(packageName))
          : source;
        await writeFile(destination, content);
        console.log(`  ✓  created ${file}`);
      }
      files.add(file);
    }
  }

  const manifest: DeploymentManifest = {
    version: 1,
    targets: [...new Set([...(existing?.targets ?? []), ...selected])],
    files: [...files].sort(),
  };
  const manifestPath = join(target, ".elpod/deployment.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\n  ◆  deployment setup complete — ${manifest.targets.join(", ")}`);
  console.log("  │  deployment files are ordinary project files; customize them freely.\n");
  return manifest;
}

async function chooseTargets(): Promise<DeploymentTarget[]> {
  console.log("\n  Select deployment targets:");
  console.log("  1) Docker container (Dockerfile, .dockerignore)");
  console.log("  2) Kubernetes manifests (deploy/kubernetes.yaml)");
  console.log("\n  Enter one or more numbers separated by commas (default: 1):");
  const answer = prompt("  Targets: ", "1")?.trim() ?? "1";
  const selections = answer.split(",").map((value) => value.trim()).filter(Boolean);
  if (selections.includes("0") || selections.includes("none")) return [];

  const selected: DeploymentTarget[] = [];
  for (const selection of selections) {
    const target = selection === "1" ? "docker" : selection === "2" ? "kubernetes" : undefined;
    if (!target) throw new Error(`unknown deployment target "${selection}" — choose 1 or 2`);
    if (!selected.includes(target)) selected.push(target);
  }
  return selected;
}

function normalizeTargets(targets: readonly DeploymentTarget[]) {
  const selected: DeploymentTarget[] = [];
  for (const target of targets) {
    if (!deploymentTargets.includes(target)) throw new Error(`unknown deployment target "${target}"`);
    if (!selected.includes(target)) selected.push(target);
  }
  return selected;
}

async function readManifest(root: string): Promise<DeploymentManifest | undefined> {
  const path = join(root, ".elpod/deployment.json");
  if (!(await Bun.file(path).exists())) return undefined;
  const parsed = JSON.parse(await readFile(path, "utf8")) as Partial<DeploymentManifest>;
  if (parsed.version !== 1 || !Array.isArray(parsed.targets) || !Array.isArray(parsed.files)) {
    throw new Error(".elpod/deployment.json is invalid; fix or remove it before continuing");
  }
  return {
    version: 1,
    targets: normalizeTargets(parsed.targets as DeploymentTarget[]),
    files: parsed.files.filter((file): file is string => typeof file === "string"),
  };
}

async function readPackageName(root: string) {
  const path = join(root, "package.json");
  if (!(await Bun.file(path).exists())) return undefined;
  const pkg = JSON.parse(await Bun.file(path).text()) as { name?: string };
  return pkg.name;
}

function normalizeApplicationName(value: string | undefined) {
  const name = (value ?? "elpod-app").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return name.slice(0, 52) || "elpod-app";
}
