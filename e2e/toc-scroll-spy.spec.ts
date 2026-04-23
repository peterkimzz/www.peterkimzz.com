import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const tocArticlePath = "/nuxt3-perfect-setup-guide-2024/";
const nestedArticlePath = "/fastfive-fivespot-yongsan-review/";

function getTocSection(page: Page) {
  return page.locator("section").filter({
    has: page.getByRole("heading", { level: 4, name: "목차" }),
  });
}

async function expectHeadingNearTop(locator: Locator) {
  await expect
    .poll(async () => {
      return locator.evaluate((element) => {
        return Math.round(element.getBoundingClientRect().top);
      });
    })
    .toBeGreaterThanOrEqual(0);

  await expect
    .poll(async () => {
      return locator.evaluate((element) => {
        return Math.round(element.getBoundingClientRect().top);
      });
    })
    .toBeLessThanOrEqual(120);
}

async function scrollHeadingIntoSpyZone(page: Page, locator: Locator) {
  await locator.waitFor();

  await page.evaluate(
    (element) => {
      const target = element as HTMLElement;
      const top = window.scrollY + target.getBoundingClientRect().top - 80;

      window.scrollTo({ top, behavior: "instant" });
    },
    await locator.elementHandle(),
  );
}

test.describe("toc scroll spy", () => {
  test("clicking a toc item navigates to its section and marks it current", async ({
    page,
  }) => {
    await page.goto(tocArticlePath);

    const toc = getTocSection(page);
    const projectSetupLink = toc.getByRole("link", { name: "Project Setup" });
    const nuxtUiLink = toc.getByRole("link", { name: "Nuxt UI" });
    const projectSetupHeading = page.locator("#project-setup");

    await expect(toc).toBeVisible();

    await projectSetupLink.click();

    await expect(page).toHaveURL(/#project-setup$/);
    await expectHeadingNearTop(projectSetupHeading);
    await expect(projectSetupLink).toHaveAttribute("aria-current", "location");
    await expect(nuxtUiLink).not.toHaveAttribute("aria-current", "location");
  });

  test("scrolling updates the current toc item", async ({ page }) => {
    await page.goto(tocArticlePath);

    const toc = getTocSection(page);
    const projectSetupLink = toc.getByRole("link", { name: "Project Setup" });
    const nuxtUiLink = toc.getByRole("link", { name: "Nuxt UI" });
    const nuxtUiHeading = page.locator("#nuxt-ui");

    await expect(projectSetupLink).toHaveAttribute("aria-current", "location");

    await scrollHeadingIntoSpyZone(page, nuxtUiHeading);

    await expectHeadingNearTop(nuxtUiHeading);
    await expect(nuxtUiLink).toHaveAttribute("aria-current", "location");
    await expect(projectSetupLink).not.toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("nested toc items mark only the child as current while keeping the parent emphasized", async ({
    page,
  }) => {
    await page.goto(nestedArticlePath);

    const toc = getTocSection(page);
    const parentLink = toc.getByRole("link", { name: "후기" });
    const childLink = toc.getByRole("link", { name: "장점" });
    const childHeading = page.locator("#장점");

    await scrollHeadingIntoSpyZone(page, childHeading);

    await expectHeadingNearTop(childHeading);
    await expect(childLink).toHaveAttribute("aria-current", "location");
    await expect(parentLink).not.toHaveAttribute("aria-current", "location");
  });
});
