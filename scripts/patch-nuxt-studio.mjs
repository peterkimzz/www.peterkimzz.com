import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const supportedVersion = "1.7.0";
const studioRoot = path.resolve("node_modules/nuxt-studio");
const packageJsonPath = path.join(studioRoot, "package.json");
const moduleEntryPath = path.join(studioRoot, "dist/module/module.mjs");
const appDirectory = path.join(studioRoot, "dist/app");
const appEntryPath = path.join(appDirectory, "main.js");

function fail(message) {
  throw new Error(`Nuxt Studio image editor patch failed: ${message}`);
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

  const didPatchMediaPolicy = await patchMediaPolicyDefaults();
  const appEntry = await readFile(appEntryPath, "utf8");
  const bundleNames = [...appEntry.matchAll(/from"\.\/(main-.+?\.js)"/g)].map(
    (match) => match[1],
  );
  const bundles = [];

  for (const file of [
    ...new Set(
      bundleNames.length
        ? bundleNames
        : (await readdir(appDirectory)).filter((name) =>
            /^main-.+\.js$/.test(name),
          ),
    ),
  ]) {
    const candidatePath = path.join(appDirectory, file);
    const candidate = await readFile(candidatePath, "utf8");

    if (
      candidate.includes('name:"Image",path:"",meta:{props:[') &&
      candidate.includes("studio.tiptap.image.source")
    ) {
      bundles.push({ path: candidatePath, source: candidate });
    }
  }

  if (!bundles.length) {
    fail("could not locate the Studio application bundle");
  }

  let patchedCount = 0;

  for (const bundle of bundles) {
    if (await patchBundle(bundle.path, bundle.source)) {
      patchedCount += 1;
    }
  }

  process.stdout.write(
    patchedCount || didPatchMediaPolicy
      ? `Patched Nuxt Studio media policy and image controls in ${patchedCount} bundles.\n`
      : "Nuxt Studio image editor patch already applied.\n",
  );
}

async function patchMediaPolicyDefaults() {
  const source = await readFile(moduleEntryPath, "utf8");
  const marker = "peterkimzz-image-only-media";

  if (source.includes(marker)) {
    return false;
  }

  const patchedSource = replaceOnce(
    source,
    'allowedTypes: ["image/*", "video/*", "audio/*"],',
    `allowedTypes: [], // ${marker}`,
    "default Studio media types",
  );

  await writeFile(moduleEntryPath, patchedSource, "utf8");
  return true;
}

async function patchBundle(bundlePath, source) {
  let patchedSource = source;
  let didPatch = false;

  const hasImageControls =
    source.includes('description:"이미지 정렬"') &&
    source.includes('e.getAttribute("caption")');

  if (!hasImageControls) {
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
      fail("could not identify the image editor sections");
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
      ',{name:"align",global:!1,description:"이미지 정렬",tags:[],required:!1,type:\'"left" | "center" | "right"\',declarations:[],schema:{kind:"enum",type:\'"left" | "center" | "right"\',schema:[]}}' +
      ',{name:"size",global:!1,description:"이미지 크기",tags:[],required:!1,type:\'"small" | "medium" | "large" | "full"\',declarations:[],schema:{kind:"enum",type:\'"small" | "medium" | "large" | "full"\',schema:[]}}' +
      ',{name:"caption",global:!1,description:"이미지 캡션",tags:[],required:!1,type:"string",declarations:[],schema:{kind:"enum",type:"string",schema:[]}}';

    let patchedComponent = replaceOnce(
      imageComponent,
      "],slots:[],events:[]}}",
      `${extraProperties}],slots:[],events:[]}}`,
      "image property metadata",
    );

    patchedComponent = replaceOnce(
      patchedComponent,
      'height:e.height||"",class:e.class||""',
      'height:e.height||"",align:e.align||"center",size:e.size||"large",caption:e.caption||"",class:e.class||""',
      "image preview attributes",
    );

    let patchedExtension = replaceOnce(
      imageExtension,
      'class:e.getAttribute("class")||""})',
      'class:e.getAttribute("class")||"",align:e.getAttribute("align")||"",size:e.getAttribute("size")||"",caption:e.getAttribute("caption")||""})',
      "image HTML attribute parser",
    );

    patchedExtension = replaceOnce(
      patchedExtension,
      "t.class&&(n.class=String(t.class)),n",
      "t.class&&(n.class=String(t.class)),t.align&&(n.align=String(t.align)),t.size&&(n.size=String(t.size)),t.caption&&(n.caption=String(t.caption)),n",
      "image attribute renderer",
    );
    patchedExtension = replaceOnce(
      patchedExtension,
      't.class&&(n.class=String(t.class)),["img"',
      't.class&&(n.class=String(t.class)),t.align&&(n.align=String(t.align)),t.size&&(n.size=String(t.size)),t.caption&&(n.caption=String(t.caption)),["img"',
      "image node renderer",
    );

    patchedSource =
      patchedSource.slice(0, imageComponentStart) +
      patchedComponent +
      patchedExtension +
      patchedSource.slice(imagePickerStart);

    patchedSource = replaceOnce(
      patchedSource,
      'attrs:{props:{src:e?.routePath||"",alt:e?.name||""}}',
      'attrs:{props:{src:e?.routePath||"",alt:e?.name||"",align:"center",size:"large"}}',
      "new image defaults",
    );
    didPatch = true;
  }

  if (!source.includes("peterkimzz-media-folder")) {
    const mediaPickerStart = patchedSource.indexOf('__name:"ModalMediaPicker"');
    const mediaPickerEnd = patchedSource.indexOf(
      '__name:"InputText"',
      mediaPickerStart,
    );
    const mediaPicker = patchedSource.slice(mediaPickerStart, mediaPickerEnd);
    const contextMatch = mediaPicker.match(
      /const\{mediaTree:n,context:o\}=([A-Za-z$_][\w$]*)\(\),\{t:a\}=([A-Za-z$_][\w$]*)\(\)/,
    );
    const treeFinderMatch = mediaPicker.match(
      /Fn\(u,e=>\{d\.value&&!([A-Za-z$_][\w$]*)\(e,d\.value\)/,
    );

    if (
      mediaPickerStart === -1 ||
      mediaPickerEnd === -1 ||
      !contextMatch ||
      !treeFinderMatch
    ) {
      fail("could not identify the media picker sections");
    }

    const [, studioContext, translationContext] = contextMatch;
    const [, findTreeItem] = treeFinderMatch;
    let patchedMediaPicker = replaceOnce(
      mediaPicker,
      contextMatch[0],
      `const{mediaTree:n,context:o,documentTree:h}=${studioContext}(),{t:a}=${translationContext}()`,
      "media picker Studio context",
    );
    patchedMediaPicker = replaceOnce(
      patchedMediaPicker,
      "d=/* @__PURE__ */Pt(null);Fn([c,d]",
      'd=/* @__PURE__ */Pt(null);/* peterkimzz-media-folder */const A=()=>{const e=h.currentItem.value?.fsPath;if(!e||!e.endsWith(".md"))return null;const t=e.split("/").pop()?.replace(/\\.md$/,"");return t?"posts/"+t:null};Fn([c,d]',
      "post media folder resolver",
    );
    patchedMediaPicker = replaceOnce(
      patchedMediaPicker,
      "Fn(()=>r.open,e=>{e&&(d.value=null)});const u=",
      `Fn(()=>r.open,e=>{if(e){const e=A();d.value=e&&${findTreeItem}(u.value,e)?e:null}});const u=`,
      "media picker initial folder",
    );
    patchedMediaPicker = replaceOnce(
      patchedMediaPicker,
      'const w=async()=>{await o.switchFeature(IA.Media),i("cancel")}',
      `const w=async()=>{const e=A();e&&(${findTreeItem}(u.value,e)||await n.draft.createFolder(e),await n.selectItemByFsPath(e)),await o.switchFeature(IA.Media),i("cancel")}`,
      "media picker upload folder",
    );
    patchedSource =
      patchedSource.slice(0, mediaPickerStart) +
      patchedMediaPicker +
      patchedSource.slice(mediaPickerEnd);
    didPatch = true;
  }

  if (!didPatch) {
    return false;
  }

  await writeFile(bundlePath, patchedSource, "utf8");
  return true;
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
