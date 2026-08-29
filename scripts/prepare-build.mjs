import { rm } from "node:fs/promises";

await Promise.all([
  rm(".output", { recursive: true, force: true }),
  rm(".data/content/contents.sqlite", { force: true }),
]);
