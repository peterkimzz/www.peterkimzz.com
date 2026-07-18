import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import Callout from "~/components/content/Callout.global.vue";
import YouTubeEmbed from "~/components/content/YouTubeEmbed.global.vue";

describe("Callout", () => {
  it.each([
    ["info", "참고", "border-blue-200"],
    ["tip", "팁", "border-emerald-200"],
    ["warning", "주의", "border-amber-200"],
    ["danger", "중요", "border-red-200"],
  ] as const)("renders the %s variant", async (type, title, className) => {
    const wrapper = await mountSuspended(Callout, {
      props: { type },
      slots: { default: "본문 내용" },
    });

    expect(wrapper.get("aside").classes()).toContain(className);
    expect(wrapper.get("aside").attributes("aria-label")).toBe(title);
    expect(wrapper.text()).toContain("본문 내용");
  });

  it("uses a custom title", async () => {
    const wrapper = await mountSuspended(Callout, {
      props: { title: "알아두세요" },
    });

    expect(wrapper.get(".callout-title").text()).toBe("알아두세요");
  });
});

describe("YouTubeEmbed", () => {
  it("renders a privacy-enhanced embed and caption", async () => {
    const wrapper = await mountSuspended(YouTubeEmbed, {
      props: {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "테스트 영상",
        caption: "영상 설명",
      },
    });

    const iframe = wrapper.get("iframe");

    expect(iframe.attributes("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(iframe.attributes("title")).toBe("테스트 영상");
    expect(wrapper.get("figcaption").text()).toBe("영상 설명");
  });

  it("renders an editor-friendly placeholder for invalid URLs", async () => {
    const wrapper = await mountSuspended(YouTubeEmbed, {
      props: { url: "https://example.com/video" },
    });

    expect(wrapper.find("iframe").exists()).toBe(false);
    expect(wrapper.text()).toContain("올바른 YouTube URL");
  });
});
