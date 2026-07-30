import { expect, test } from "@playwright/test";
import { gunzipSync } from "node:zlib";

const articlePath = "/github-pages-nuxtjs";
const articleTitle = "평생 무료로 개인 블로그 운영하기";
const missingPath = "/e2e-missing-post/";

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

    expect(contentDump).toContain(articleTitle);
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
