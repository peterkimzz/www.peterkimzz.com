import { expect, test } from "@playwright/test";

const publishedPath = "/github-pages-nuxtjs/";
const publishedTitle = "평생 무료로 개인 블로그 운영하기";

test("published post renders on direct URL load", async ({ page }) => {
  await page.goto(publishedPath);

  await expect(page).toHaveURL(new RegExp(`${publishedPath}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: publishedTitle }),
  ).toBeVisible();
  await expect(
    page.getByText("Github Pages의 장점은 크게 세 가지이다."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "페이지를 찾을 수 없습니다." }),
  ).toHaveCount(0);
});
