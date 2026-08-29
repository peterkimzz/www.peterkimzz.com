import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const supportedVersion = "1.7.0";
const studioRoot = path.resolve("node_modules/nuxt-studio");
const packageJsonPath = path.join(studioRoot, "package.json");
const appDirectory = path.join(studioRoot, "dist/app");
const imageRouteMarker = "peterkimzz-image-route-fallback";
const imageControlsMarker = "peterkimzz-image-controls";
const imagePreviewMarker = "peterkimzz-image-preview-styles";
const imageSerializerMarker = "peterkimzz-image-attrs";
const imageGridPickerMarker = "peterkimzz-image-grid-picker";

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
      (source.includes(imageRouteMarker) ||
        source.includes(imageGridPickerMarker)) &&
      source.includes(imageControlsMarker) &&
      source.includes(imagePreviewMarker) &&
      source.includes(imageSerializerMarker) &&
      source.includes(imageGridPickerMarker)
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
  } else if (
    !source.includes(imageRouteMarker) &&
    !source.includes(imageGridPickerMarker)
  ) {
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

  if (!patchedSource.includes(imageSerializerMarker)) {
    patchedSource = patchImageSerializer(patchedSource, bundleName);
  }

  if (!patchedSource.includes(imageGridPickerMarker)) {
    patchedSource = patchImageGridPicker(patchedSource, bundleName);
  }

  return patchedSource;
}

function patchImageSerializer(source, bundleName) {
  return replaceOnce(
    source,
    't.class&&(n.class=t.class);return["nuxt-img"',
    `t.class&&(n.class=t.class),t.align&&(n.align=t.align),t.size&&(n.size=t.size);return["nuxt-img"/* ${imageSerializerMarker} */`,
    `image Markdown serializer attributes in ${bundleName}`,
  );
}

function patchImageGridPicker(source, bundleName) {
  const modalStart = source.indexOf('__name:"ModalMediaPicker"');
  const modalEnd = source.indexOf('__name:"InputText"', modalStart);
  let imagePickerStart = source.indexOf('__name:"TiptapExtensionImagePicker"');
  let videoPickerStart = source.indexOf(
    '__name:"TiptapExtensionVideoPicker"',
    imagePickerStart,
  );

  if (
    modalStart === -1 ||
    modalEnd === -1 ||
    imagePickerStart === -1 ||
    videoPickerStart === -1
  ) {
    fail(`could not identify the media picker sections in ${bundleName}`);
  }

  let patchedSource = source;
  let modal = patchedSource.slice(modalStart, modalEnd);

  modal = replaceOnce(
    modal,
    "props:{open:{type:Boolean},type:{}}",
    "props:{open:{type:Boolean},type:{},multiple:{type:Boolean}}",
    `media picker props in ${bundleName}`,
  );

  const selectedFolderMatch = modal.match(
    /([A-Za-z_$][\w$]*)=(\/\* @__PURE__ \*\/)?Pt\(null\);Fn\(\[c,\1\]/,
  );

  if (!selectedFolderMatch) {
    fail(`could not find the media picker folder state in ${bundleName}`);
  }

  const selectedFolderVariable = selectedFolderMatch[1];
  const selectedFolderDeclaration = selectedFolderMatch[0];
  modal = replaceOnce(
    modal,
    selectedFolderDeclaration,
    `${selectedFolderVariable}=${selectedFolderMatch[2] || ""}Pt(null),peterkimzzSelected=/* @__PURE__ */Pt([]);Fn([c,${selectedFolderVariable}]`,
    `media picker selection state in ${bundleName}`,
  );

  modal = replaceOnce(
    modal,
    `e&&(${selectedFolderVariable}.value=null)`,
    `e&&(${selectedFolderVariable}.value=null,peterkimzzSelected.value=[])`,
    `media picker selection reset in ${bundleName}`,
  );

  const clearFolderMatch = modal.match(
    new RegExp(
      `([A-Za-z_$][\\w$]*)=\\(\\)=>\\{i\\("select",null\\)\\},([A-Za-z_$][\\w$]*)=\\(\\)=>\\{${selectedFolderVariable}\\.value=null\\};function j\\(e\\)\\{`,
    ),
  );

  if (!clearFolderMatch) {
    fail(`could not find the media picker actions in ${bundleName}`);
  }

  const externalVariable = clearFolderMatch[1];
  const clearFolderVariable = clearFolderMatch[2];
  const mediaPickerActions = clearFolderMatch[0];
  modal = replaceOnce(
    modal,
    mediaPickerActions,
    `${externalVariable}=()=>{i("select",null)},peterkimzzToggle=e=>{if(!r.multiple)return i("select",e);const t=peterkimzzSelected.value.findIndex(t=>t.fsPath===e.fsPath);peterkimzzSelected.value=-1===t?[...peterkimzzSelected.value,e]:peterkimzzSelected.value.filter((e,n)=>n!==t)},peterkimzzConfirm=()=>{peterkimzzSelected.value.length&&i("select",peterkimzzSelected.value)},peterkimzzIsSelected=e=>peterkimzzSelected.value.some(t=>t.fsPath===e.fsPath),${clearFolderVariable}=()=>{${selectedFolderVariable}.value=null};function j(e){`,
    `media picker actions in ${bundleName}`,
  );

  modal = replaceOnce(
    modal,
    'class:"group relative aspect-square cursor-pointer rounded-lg",onClick:e=>i("select",t)',
    'class:Q(["group relative aspect-square cursor-pointer rounded-lg",{"ring-2 ring-primary":r.multiple&&peterkimzzIsSelected(t)}]),onClick:e=>r.multiple?peterkimzzToggle(t):i("select",t)',
    `media picker multi-selection button in ${bundleName}`,
  );

  const externalButton = `br(s,{variant:"outline",icon:"i-lucide-link",onClick:${externalVariable}},{default:Dn(()=>[wr(ae(qt(a)(\`studio.mediaPicker.\${e.type}.useExternal\`)),1)]),_:1})`;
  modal = replaceOnce(
    modal,
    externalButton,
    `br(s,{variant:"outline",icon:r.multiple?"i-lucide-check":"i-lucide-link",onClick:r.multiple?peterkimzzConfirm:${externalVariable},disabled:r.multiple&&0===peterkimzzSelected.value.length},{default:Dn(()=>[wr(ae(r.multiple?"선택한 이미지 삽입":qt(a)(\`studio.mediaPicker.\${e.type}.useExternal\`)),1)]),_:1},8,["icon","onClick","disabled"])`,
    `media picker multi-selection confirmation button in ${bundleName}`,
  );

  const buttonPatchPropsMatch = patchedSource
    .slice(Math.max(0, modalStart - 500), modalStart)
    .match(/([A-Za-z_$][\w$]*)=\["onClick"\]/);

  if (!buttonPatchPropsMatch) {
    fail(`could not find the media picker button patch props in ${bundleName}`);
  }

  patchedSource = replaceOnce(
    patchedSource,
    `${buttonPatchPropsMatch[1]}=["onClick"]`,
    `${buttonPatchPropsMatch[1]}=["class","onClick"]`,
    `media picker button patch props in ${bundleName}`,
  );

  patchedSource =
    patchedSource.slice(0, modalStart) + modal + patchedSource.slice(modalEnd);

  imagePickerStart = patchedSource.indexOf(
    '__name:"TiptapExtensionImagePicker"',
  );
  videoPickerStart = patchedSource.indexOf(
    '__name:"TiptapExtensionVideoPicker"',
    imagePickerStart,
  );

  let imagePicker = patchedSource.slice(imagePickerStart, videoPickerStart);
  imagePicker = replaceOnce(
    imagePicker,
    'type:"image",onSelect:o',
    'type:"image",multiple:!0,onSelect:o',
    `image grid picker mode in ${bundleName}`,
  );

  const imageSelectionHandler = imagePicker.match(
    /o=e=>\{const o=t\.getPos\(\);"number"==typeof o&&.*?\.run\(\),n\.value=!1\}/,
  );

  if (!imageSelectionHandler) {
    fail(`could not find the image picker selection handler in ${bundleName}`);
  }

  imagePicker = replaceOnce(
    imagePicker,
    imageSelectionHandler[0],
    `o=e=>{const o=t.getPos();if("number"==typeof o){const a=Array.isArray(e)?e:[e],r=a.length>1?{type:"element",attrs:{tag:"ImageGrid",props:{columns:a.length>=4?4:a.length>=3?3:2,gap:"medium"}},content:[{type:"slot",attrs:{name:"default"},content:a.map(e=>({type:"image",attrs:{props:{src:e?.routePath||e?.fsPath||"",alt:e?.name||"",align:"center",size:"large"}}}))}]}:{type:"image",attrs:{props:{src:a[0]?.routePath||a[0]?.fsPath||"",alt:a[0]?.name||"",align:"center",size:"large"}}};t.editor.chain().focus().deleteRange({from:o,to:o+1}).insertContentAt(o,r).run()}n.value=!1}/* ${imageRouteMarker} *//* ${imageGridPickerMarker} */`,
    `image grid picker insertion in ${bundleName}`,
  );

  return (
    patchedSource.slice(0, imagePickerStart) +
    imagePicker +
    patchedSource.slice(videoPickerStart)
  );
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
