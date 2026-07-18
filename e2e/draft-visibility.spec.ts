import { expect, test } from "@playwright/test";
import { gunzipSync } from "node:zlib";

const draftPath = "/e2e-draft-hidden-post";
const draftSlug = `${draftPath}/`;
const draftTitle = "E2E Draft Hidden Post";
const publishedPath = "/github-pages-nuxtjs";
const publishedTitle = "평생 무료로 개인 블로그 운영하기";

test.describe("draft visibility", () => {
  test("draft post is hidden from the home page and sitemap", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    await expect(page.getByText(/PETERKIM\s*ZZ/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "평생 무료로 개인 블로그 운영하기" }),
    ).toBeVisible();
    await expect(page.getByText(draftTitle)).toHaveCount(0);

    const sitemapResponse = await request.get("/sitemap.xml");

    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemap = await sitemapResponse.text();

    expect(sitemap).toContain(publishedPath);
    expect(sitemap).not.toContain(draftPath);

    const contentDumpResponse = await request.get(
      "/__nuxt_content/content/sql_dump.txt",
    );
    const compressedDump = await contentDumpResponse.text();
    const contentDump = gunzipSync(
      Buffer.from(compressedDump, "base64"),
    ).toString();

    expect(contentDump).toContain(publishedTitle);
    expect(contentDump).not.toContain(draftTitle);
  });

  test("draft post returns the 404 experience on direct load", async ({
    page,
  }) => {
    await page.goto(draftSlug);

    await expect(page.getByText("404")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "페이지를 찾을 수 없습니다.",
      }),
    ).toBeVisible();
    await expect(page.getByText(draftTitle)).toHaveCount(0);
  });
});
