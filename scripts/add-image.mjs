import { spawnSync } from "node:child_process";
import process from "node:process";
import { copyImageToPost, getContentPath, getSlug } from "./utils.mjs";

function copyToClipboard(text) {
  const result = spawnSync("pbcopy", {
    input: text,
    encoding: "utf8",
  });

  return !result.error && result.status === 0;
}

async function main() {
  const slug = getSlug(process.argv[2]);
  const inputFiles = process.argv.slice(3);

  if (!inputFiles.length) {
    throw new Error("Provide at least one image file path.");
  }

  const results = [];

  for (const filePath of inputFiles) {
    results.push(await copyImageToPost(slug, filePath));
  }

  const contentPath = getContentPath(slug);
  const markdownLines = results.map((result) => result.markdown);
  const didCopy = copyToClipboard(markdownLines.join("\n"));

  process.stdout.write(
    [
      `Post: ${contentPath}`,
      "",
      "Markdown:",
      ...results.map((result) => `${result.markdown}  <- ${result.sourcePath}`),
      "",
      didCopy
        ? "Copied markdown to clipboard."
        : "Could not copy markdown to clipboard.",
    ].join("\n") + "\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
