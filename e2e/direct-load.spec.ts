import { expect, test } from "@playwright/test";

const articlePath = "/github-pages-nuxtjs/";
const articleTitle = "평생 무료로 개인 블로그 운영하기";
const externalFontHosts = new Set([
  "api.fontsource.org",
  "cdn.jsdelivr.net",
  "fonts.bunny.net",
  "fonts.google.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);

test("committed post renders on direct URL load", async ({ page }) => {
  await page.goto(articlePath);

  await expect(page).toHaveURL(new RegExp(`${articlePath}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: articleTitle }),
  ).toBeVisible();
  await expect(
    page.getByText("Github Pages의 장점은 크게 세 가지이다."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "페이지를 찾을 수 없습니다." }),
  ).toHaveCount(0);
});

test("site fonts are bundled locally without external provider requests", async ({
  page,
}) => {
  const externalFontRequests: string[] = [];
  const fontResponses: Array<{ status: number; url: string }> = [];

  page.on("request", (request) => {
    const url = new URL(request.url());

    if (externalFontHosts.has(url.hostname)) {
      externalFontRequests.push(url.href);
    }
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") {
      fontResponses.push({
        status: response.status(),
        url: response.url(),
      });
    }
  });

  await page.goto(articlePath);

  const loadedFontFaces = await page.evaluate(async () => {
    const [pretendard, jetBrainsMono] = await Promise.all([
      document.fonts.load('400 16px "Pretendard"', "한글"),
      document.fonts.load('400 16px "JetBrains Mono"', "code"),
    ]);

    await document.fonts.ready;

    return {
      jetBrainsMono: jetBrainsMono.length,
      pretendard: pretendard.length,
    };
  });

  expect(loadedFontFaces.pretendard).toBeGreaterThan(0);
  expect(loadedFontFaces.jetBrainsMono).toBeGreaterThan(0);
  expect(externalFontRequests).toEqual([]);
  expect(fontResponses.length).toBeGreaterThanOrEqual(2);

  const pageOrigin = new URL(page.url()).origin;

  for (const response of fontResponses) {
    expect(response.status).toBe(200);
    expect(new URL(response.url).origin).toBe(pageOrigin);
    expect(response.url).toMatch(/\.woff2(?:$|\?)/);
  }
});
