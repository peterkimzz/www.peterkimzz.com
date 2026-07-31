import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const contentDirectory = path.resolve(process.cwd(), "content");
const allowedCategories = [
  "tech",
  "retrospective",
  "design",
  "life",
  "nuxt3",
] as const;
const topLevelFieldOrder = [
  "title",
  "description",
  "category",
  "tags",
  "image",
  "created",
  "updated",
  "series",
  "seo",
];

function frontmatterFrom(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);

  expect(match, "Markdown must start with frontmatter").not.toBeNull();
  return match?.[1] || "";
}

function scalarField(frontmatter: string, field: string) {
  return frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1].trim();
}

function listField(frontmatter: string, field: string) {
  const block = frontmatter.match(
    new RegExp(`^${field}:\\n((?: {2}- .+(?:\\n|$))+)`, "m"),
  )?.[1];

  return [...(block || "").matchAll(/^ {2}- (.+)$/gm)].map((match) =>
    match[1].trim(),
  );
}

describe("content frontmatter", () => {
  it("keeps every post compatible with the Studio collection schema", async () => {
    const filenames = (await readdir(contentDirectory))
      .filter((filename) => filename.endsWith(".md"))
      .sort();

    expect(filenames.length).toBeGreaterThan(0);

    for (const filename of filenames) {
      const source = await readFile(
        path.join(contentDirectory, filename),
        "utf8",
      );
      const frontmatter = frontmatterFrom(source);
      const title = scalarField(frontmatter, "title");
      const category = scalarField(frontmatter, "category");
      const created = scalarField(frontmatter, "created");
      const updated = scalarField(frontmatter, "updated");
      const tags = listField(frontmatter, "tags");
      const fields = [...frontmatter.matchAll(/^([a-z][a-zA-Z]*):/gm)].map(
        (match) => match[1],
      );
      const fieldRanks = fields.map((field) =>
        topLevelFieldOrder.indexOf(field),
      );

      expect(title, `${filename}: title`).toBeTruthy();
      expect(allowedCategories, `${filename}: category`).toContain(category);
      expect(created, `${filename}: created`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(updated, `${filename}: updated`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tags, `${filename}: category tag`).toContain(category);
      expect(frontmatter, `${filename}: rawbody`).not.toMatch(/^rawbody:/m);
      expect(frontmatter, `${filename}: empty image`).not.toMatch(
        /^image:\s*$/m,
      );
      expect(source, `${filename}: legacy series syntax`).not.toContain(
        ":Serieis",
      );
      expect(fieldRanks, `${filename}: known fields`).not.toContain(-1);
      expect(fieldRanks, `${filename}: field order`).toEqual(
        [...fieldRanks].sort((left, right) => left - right),
      );
    }
  });

  it("migrates legacy series metadata with stable ordering", async () => {
    const expectedSeries = {
      "github-pages-nuxtjs.md": ["평생 무료", "1"],
      "monitoring-tool-in-10-minutes.md": ["평생 무료", "2"],
      "custom-email-service-for-free-forever.md": ["평생 무료", "3"],
      "introduce-free-responsive-email-template-mjml.md": ["평생 무료", "4"],
      "phone-validation-service-twilio-in-5-minutes.md": ["N분 만에", "1"],
    };

    for (const [filename, [name, order]] of Object.entries(expectedSeries)) {
      const source = await readFile(
        path.join(contentDirectory, filename),
        "utf8",
      );
      const frontmatter = frontmatterFrom(source);

      expect(frontmatter, `${filename}: series name`).toContain(
        `series:\n  name: ${name}`,
      );
      expect(frontmatter, `${filename}: series order`).toContain(
        `\n  order: ${order}`,
      );
    }
  });

  it("keeps the new-post template free of rendered scaffolding", async () => {
    const template = await readFile(
      path.resolve(process.cwd(), "scripts/templates/basic.md"),
      "utf8",
    );

    expect(template).toContain("title: {{title}}");
    expect(template).toContain("tags:\n  - life");
    expect(template).not.toContain("# {{title}}");
    expect(template).not.toContain("<!--more-->");
    expect(template).not.toContain("slug:");
    expect(template).not.toContain("images:");
  });
});
