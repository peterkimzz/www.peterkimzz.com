import { expect, test } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const articlePath = "/github-pages-nuxtjs";
const articleTitle = "평생 무료로 개인 블로그 운영하기";
const generatedDescription =
  "거의 대부분의 개발자들이 개인 블로그를 운영하라고 얘기한다.";
const missingPath = "/e2e-missing-post/";
const contentDirectory = path.resolve(process.cwd(), "content");

function getFrontmatter(source: string, filename: string) {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];

  if (!frontmatter) {
    throw new Error(`Missing frontmatter in content/${filename}`);
  }

  return frontmatter;
}

function getTags(frontmatter: string, filename: string) {
  const list = frontmatter.match(/^tags:\n((?: {2}- .+(?:\n|$))+)/m)?.[1];
  const tags = [...(list || "").matchAll(/^ {2}- (.+)$/gm)].map((match) =>
    match[1].trim(),
  );

  if (!tags.length) {
    throw new Error(`Missing tags in content/${filename}`);
  }

  return tags;
}

async function getPostPathsByTag() {
  const filenames = (await readdir(contentDirectory)).filter((filename) =>
    filename.endsWith(".md"),
  );
  const pathsByTag = new Map<string, Set<string>>();

  for (const filename of filenames) {
    const source = await readFile(
      path.join(contentDirectory, filename),
      "utf8",
    );
    const tags = getTags(getFrontmatter(source, filename), filename);
    const articlePath = `/${filename.replace(/\.md$/, "")}`;

    for (const tag of tags) {
      const paths = pathsByTag.get(tag) || new Set<string>();
      paths.add(articlePath);
      pathsByTag.set(tag, paths);
    }
  }

  return new Map(
    [...pathsByTag].map(([tag, paths]) => [tag, [...paths].sort()]),
  );
}

test.describe("committed content publication", () => {
  test("committed content appears on the home page, sitemap, and content database", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    await expect(page.getByText(/PETERKIM\s*ZZ/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "평생 무료로 개인 블로그 운영하기" }),
    ).toBeVisible();

    const sitemapResponse = await request.get("/sitemap.xml");

    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemap = await sitemapResponse.text();

    expect(sitemap).toContain(articlePath);

    const contentDumpResponse = await request.get(
      "/__nuxt_content/content/sql_dump.txt",
    );
    const compressedDump = await contentDumpResponse.text();
    const contentDump = gunzipSync(
      Buffer.from(compressedDump, "base64"),
    ).toString();
    const contentStatements = JSON.parse(contentDump) as string[];
    const contentSchema = contentStatements.find((statement) =>
      statement.startsWith("CREATE TABLE IF NOT EXISTS _content_content"),
    );

    expect(contentDump).toContain(articleTitle);
    expect(contentDump).toContain(generatedDescription);
    expect(contentSchema).toBeTruthy();
    expect(contentSchema).not.toContain("rawbody");
    expect(contentSchema).toContain('"created" VARCHAR');
    expect(contentSchema).toContain('"updated" VARCHAR');

    await page.goto(articlePath);

    await expect(
      page.locator('time[datetime="2020-12-17"]').first(),
    ).toHaveText("2020년 12월 17일");

    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");

    expect(metaDescription).toBeTruthy();
    expect(metaDescription?.length).toBeLessThanOrEqual(140);
    expect(metaDescription).toMatch(/\.\.\.$/);
  });

  test("tag pages expose every tagged post", async ({ page }) => {
    const expectedPathsByTag = await getPostPathsByTag();

    for (const [tag, expectedPaths] of expectedPathsByTag) {
      await page.goto(`/tags/${tag}`);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        `#${tag}`,
      );
      await expect(
        page.getByText(`${expectedPaths.length}개의 글`),
      ).toBeVisible();

      const articleLinks = page.locator("ul.grid > li > a");
      const actualPaths = await articleLinks.evaluateAll((links) =>
        links.map((link) => link.getAttribute("href")),
      );

      await expect(articleLinks).toHaveCount(expectedPaths.length);
      expect(actualPaths.sort()).toEqual(expectedPaths);
    }
  });

  test("migrated series render in frontmatter order", async ({ page }) => {
    await page.goto(articlePath);

    const foreverSeries = page.getByRole("navigation", {
      name: "평생 무료 시리즈",
    });
    const foreverLinks = foreverSeries.locator("ol a");

    await expect(foreverLinks).toHaveCount(4);
    await expect(foreverLinks.nth(0)).toHaveAttribute(
      "href",
      "/github-pages-nuxtjs",
    );
    await expect(foreverLinks.nth(1)).toHaveAttribute(
      "href",
      "/monitoring-tool-in-10-minutes",
    );
    await expect(foreverLinks.nth(2)).toHaveAttribute(
      "href",
      "/custom-email-service-for-free-forever",
    );
    await expect(foreverLinks.nth(3)).toHaveAttribute(
      "href",
      "/introduce-free-responsive-email-template-mjml",
    );

    await page.goto("/phone-validation-service-twilio-in-5-minutes");

    const quickSeries = page.getByRole("navigation", {
      name: "N분 만에 시리즈",
    });

    await expect(quickSeries).toBeVisible();
    await expect(quickSeries.locator("ol a")).toHaveCount(1);
  });

  test("a missing content path returns the 404 experience", async ({
    page,
  }) => {
    await page.goto(missingPath);

    await expect(page.getByText("404")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "페이지를 찾을 수 없습니다.",
      }),
    ).toBeVisible();
  });
});
