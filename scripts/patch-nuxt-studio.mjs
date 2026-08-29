import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const supportedVersion = "1.7.0";
const studioRoot = path.resolve("node_modules/nuxt-studio");
const packageJsonPath = path.join(studioRoot, "package.json");
const appDirectory = path.join(studioRoot, "dist/app");
const imageRouteMarker = "peterkimzz-image-route-fallback";
const imageControlsMarker = "peterkimzz-image-controls";
const imagePreviewMarker = "peterkimzz-image-preview-styles";

function fail(message) {
  throw new Error(`Nuxt Studio image preview patch failed: ${message}`);
}

function replaceOnce(source, search, replacement, label) {
  const firstIndex = source.indexOf(search);

  if (firstIndex === -1) {
    fail(`could not find ${label}`);
  }

  if (source.indexOf(search, firstIndex + search.length) !== -1) {
    fail(`found more than one ${label}`);
  }

  return source.replace(search, replacement);
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

    if (
      source.includes(imageRouteMarker) &&
      source.includes(imageControlsMarker) &&
      source.includes(imagePreviewMarker)
    ) {
      alreadyPatchedCount += 1;
      continue;
    }

    const patchedSource = patchImageBundle(source, bundleName);

    if (patchedSource !== source) {
      await writeFile(bundlePath, patchedSource, "utf8");
      patchedCount += 1;
    }
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

function patchImageBundle(source, bundleName) {
  let patchedSource = source;

  if (!source.includes(imageControlsMarker)) {
    const imageComponentStart = patchedSource.indexOf(
      'name:"Image",path:"",meta:{props:[',
    );
    const imageExtensionStart = patchedSource.indexOf(
      '.create({name:"image",',
      imageComponentStart,
    );
    const imagePickerStart = patchedSource.indexOf(
      '__name:"TiptapExtensionImagePicker"',
      imageExtensionStart,
    );

    if (
      imageComponentStart === -1 ||
      imageExtensionStart === -1 ||
      imagePickerStart === -1
    ) {
      fail(`could not identify the image editor sections in ${bundleName}`);
    }

    const imageComponent = patchedSource.slice(
      imageComponentStart,
      imageExtensionStart,
    );
    const imageExtension = patchedSource.slice(
      imageExtensionStart,
      imagePickerStart,
    );
    const extraProperties =
      `/* ${imageControlsMarker} */` +
      ',{name:"align",global:!1,description:"이미지 정렬",tags:[],required:!1,type:\'"left" | "center" | "right"\',declarations:[],schema:{kind:"enum",type:\'"left" | "center" | "right"\',schema:[]}}' +
      ',{name:"size",global:!1,description:"이미지 크기",tags:[],required:!1,type:\'"small" | "medium" | "large" | "full"\',declarations:[],schema:{kind:"enum",type:\'"small" | "medium" | "large" | "full"\',schema:[]}}';

    let patchedComponent = replaceOnce(
      imageComponent,
      "],slots:[],events:[]}}",
      `${extraProperties}],slots:[],events:[]}}`,
      `image property metadata in ${bundleName}`,
    );

    patchedComponent = replaceOnce(
      patchedComponent,
      'height:e.height||"",class:e.class||""',
      'height:e.height||"",align:e.align||"center",size:e.size||"large",class:e.class||""',
      `image preview attributes in ${bundleName}`,
    );

    let patchedExtension = replaceOnce(
      imageExtension,
      'class:e.getAttribute("class")||""})',
      'class:e.getAttribute("class")||"",align:e.getAttribute("align")||"",size:e.getAttribute("size")||""})',
      `image HTML attribute parser in ${bundleName}`,
    );

    patchedExtension = replaceOnce(
      patchedExtension,
      "t.class&&(n.class=String(t.class)),n",
      "t.class&&(n.class=String(t.class)),t.align&&(n.align=String(t.align)),t.size&&(n.size=String(t.size)),n",
      `image attribute renderer in ${bundleName}`,
    );
    patchedExtension = replaceOnce(
      patchedExtension,
      't.class&&(n.class=String(t.class)),["img"',
      't.class&&(n.class=String(t.class)),t.align&&(n.align=String(t.align)),t.size&&(n.size=String(t.size)),["img"',
      `image node renderer in ${bundleName}`,
    );

    patchedSource =
      patchedSource.slice(0, imageComponentStart) +
      patchedComponent +
      patchedExtension +
      patchedSource.slice(imagePickerStart);

    const imageInsertion = findImageInsertion(patchedSource);
    if (!imageInsertion) {
      fail(`could not find the image picker insertion code in ${bundleName}`);
    }

    patchedSource = replaceOnce(
      patchedSource,
      imageInsertion,
      'attrs:{props:{src:e?.routePath||e?.fsPath||"",alt:e?.name||"",align:"center",size:"large"}}/* peterkimzz-image-route-fallback */',
      `new image defaults in ${bundleName}`,
    );
  } else if (!source.includes(imageRouteMarker)) {
    const imageInsertion = findImageInsertion(patchedSource);
    if (!imageInsertion) {
      fail(`could not find the image picker insertion code in ${bundleName}`);
    }

    patchedSource = replaceOnce(
      patchedSource,
      imageInsertion,
      imageInsertion
        .replace('src:e?.routePath||""', 'src:e?.routePath||e?.fsPath||""')
        .replace("}}", `}}/* ${imageRouteMarker} */`),
      `image route fallback in ${bundleName}`,
    );
  }

  if (!patchedSource.includes(imagePreviewMarker)) {
    patchedSource = patchImagePreview(patchedSource, bundleName);
  }

  return patchedSource;
}

function patchImagePreview(source, bundleName) {
  const imageComponentStart = source.indexOf(
    'name:"Image",path:"",meta:{props:[',
  );
  const imagePickerStart = source.indexOf(
    '__name:"TiptapExtensionImagePicker"',
    imageComponentStart,
  );

  if (imageComponentStart === -1 || imagePickerStart === -1) {
    fail(`could not identify the image preview section in ${bundleName}`);
  }

  const imageComponent = source.slice(imageComponentStart, imagePickerStart);
  let patchedComponent = replaceOnce(
    imageComponent,
    'contenteditable:!1,class:Q(["relative rounded-lg overflow-hidden transition-all inline-block",[c.value?"ring-2 ring-primary":"ring-1 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-700"]])',
    'contenteditable:!1,class:Q(["relative rounded-lg overflow-hidden transition-all inline-block",[c.value?"ring-2 ring-primary":"ring-1 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-700"]]),style:{display:"block",width:"100%",maxWidth:"small"===r.value.size?"320px":"medium"===r.value.size?"520px":"large"===r.value.size?"720px":"100%",marginLeft:"right"===r.value.align?"auto":"0",marginRight:"left"===r.value.align||"center"===r.value.align?"auto":"0"}/* peterkimzz-image-preview-styles */',
    `image preview wrapper styles in ${bundleName}`,
  );
  const imageClickHandler = [
    "class:Q(r.value.class),onClick:d[0]",
    "class:Q(r.value.class),onClick:u[0]",
  ].find((candidate) => patchedComponent.includes(candidate));

  if (!imageClickHandler) {
    fail(`could not find the image preview click handler in ${bundleName}`);
  }

  patchedComponent = replaceOnce(
    patchedComponent,
    imageClickHandler,
    imageClickHandler.replace(
      ",onClick:",
      ',style:{width:"100%",height:"auto"},onClick:',
    ),
    `image preview image styles in ${bundleName}`,
  );

  return (
    source.slice(0, imageComponentStart) +
    patchedComponent +
    source.slice(imagePickerStart)
  );
}

function findImageInsertion(source) {
  for (const candidate of [
    'attrs:{props:{src:e?.routePath||"",alt:e?.name||""}}',
    'attrs:{props:{src:e?.routePath||e?.fsPath||"",alt:e?.name||""}}',
    'attrs:{props:{src:e?.routePath||"",alt:e?.name||"",align:"center",size:"large"}}',
  ]) {
    if (source.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
