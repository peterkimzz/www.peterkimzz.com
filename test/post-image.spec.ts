import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import PostImage from "~/components/content/PostImage.global.vue";

describe("PostImage", () => {
  it.each([
    ["left", "small", "mr-auto", "320px"],
    ["center", "medium", "mx-auto", "520px"],
    ["right", "large", "ml-auto", "720px"],
    ["center", "full", "mx-auto", "100%"],
  ] as const)(
    "renders %s-aligned %s images",
    async (align, size, alignmentClass, maxWidth) => {
      const wrapper = await mountSuspended(PostImage, {
        props: {
          src: "/posts/example/image.webp",
          alt: "Example image",
          align,
          size,
        },
      });

      const figure = wrapper.get("figure");

      expect(figure.classes()).toContain(alignmentClass);
      expect(figure.attributes("style")).toContain(`max-width: ${maxWidth}`);
      expect(wrapper.get("img").attributes("alt")).toBe("Example image");
      expect(wrapper.get("img").attributes("data-zoomable")).toBeDefined();
    },
  );

  it("renders an optional caption", async () => {
    const wrapper = await mountSuspended(PostImage, {
      props: {
        src: "/posts/example/image.webp",
        alt: "Example image",
        caption: "이미지 설명",
      },
    });

    expect(wrapper.get("figcaption").text()).toBe("이미지 설명");
  });
});
