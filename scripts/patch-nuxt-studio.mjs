import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const supportedVersion = "1.7.0";
const studioRoot = path.resolve("node_modules/nuxt-studio");
const packageJsonPath = path.join(studioRoot, "package.json");
const appDirectory = path.join(studioRoot, "dist/app");
const marker = "peterkimzz-image-route-fallback";

function fail(message) {
  throw new Error(`Nuxt Studio image preview patch failed: ${message}`);
}

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  if (packageJson.version !== supportedVersion) {
    fail(
      `expected nuxt-studio ${supportedVersion}, received ${packageJson.version}`,
    );
  }

  const bundleNames = (await readdir(appDirectory)).filter((name) =>
    /^main-.+\.js$/.test(name),
  );

  if (!bundleNames.length) {
    fail("could not locate the Studio application bundle");
  }

  let patchedCount = 0;
  let alreadyPatchedCount = 0;

  for (const bundleName of bundleNames) {
    const bundlePath = path.join(appDirectory, bundleName);
    const source = await readFile(bundlePath, "utf8");

    if (source.includes(marker)) {
      alreadyPatchedCount += 1;
      continue;
    }

    const search = 'attrs:{props:{src:e?.routePath||"",alt:e?.name||""}}';
    const replacement =
      'attrs:{props:{src:e?.routePath||e?.fsPath||"",alt:e?.name||""}}/* peterkimzz-image-route-fallback */';

    if (!source.includes(search)) {
      continue;
    }

    const patchedSource = source.replace(search, replacement);

    if (patchedSource === source) {
      fail(`could not patch ${bundleName}`);
    }

    await writeFile(bundlePath, patchedSource, "utf8");
    patchedCount += 1;
  }

  if (!patchedCount && !alreadyPatchedCount) {
    fail("could not find the image picker insertion code");
  }

  process.stdout.write(
    patchedCount
      ? `Patched Nuxt Studio image preview fallback in ${patchedCount} bundle(s).\n`
      : "Nuxt Studio image preview fallback patch already applied.\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
