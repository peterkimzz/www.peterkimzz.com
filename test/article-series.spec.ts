import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import ArticleSeries from "~/components/ArticleSeries.vue";

describe("ArticleSeries", () => {
  it("sorts articles and links previous and next entries", async () => {
    const wrapper = await mountSuspended(ArticleSeries, {
      props: {
        name: "Nuxt 시작하기",
        currentPath: "/series-two",
        articles: [
          {
            path: "/series-three",
            title: "세 번째",
            series: { name: "Nuxt 시작하기", order: 3 },
          },
          {
            path: "/series-one",
            title: "첫 번째",
            series: { name: "Nuxt 시작하기", order: 1 },
          },
          {
            path: "/series-two",
            title: "두 번째",
            series: { name: "Nuxt 시작하기", order: 2 },
          },
        ],
      },
    });

    const listItems = wrapper.findAll("ol li");

    expect(listItems.map((item) => item.text())).toEqual([
      "1첫 번째",
      "2두 번째",
      "3세 번째",
    ]);
    expect(wrapper.get('[aria-current="page"]').text()).toContain("두 번째");
    expect(wrapper.get('a[href="/series-one"]').text()).toContain("첫 번째");
    expect(wrapper.get('a[href="/series-three"]').text()).toContain("세 번째");
  });
});
