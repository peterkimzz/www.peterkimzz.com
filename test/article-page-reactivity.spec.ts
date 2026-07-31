import {
  mockComponent,
  mockNuxtImport,
  mountSuspended,
} from "@nuxt/test-utils/runtime";
import { useNuxtApp } from "#app";
import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArticlePage from "~/pages/[...slug].vue";

const queryState = vi.hoisted(() => ({
  article: undefined as Record<string, unknown> | undefined,
}));

mockNuxtImport("queryCollection", () => {
  return () => {
    const builder = {
      all: async () => [],
      first: async () => queryState.article,
      order: () => builder,
      path: () => builder,
      select: () => builder,
      where: () => builder,
    };

    return builder;
  };
});

mockComponent("ArticleComment", {
  template: "<div />",
});

mockComponent("ArticleDate", {
  props: ["value"],
  template: '<time data-testid="article-date">{{ value }}</time>',
});

mockComponent("ArticleSeoPreview", {
  props: ["title", "description", "image", "canonical"],
  template:
    '<div data-testid="seo-preview">{{ title }}|{{ description }}|{{ canonical }}</div>',
});

mockComponent("ArticleToc", {
  props: ["links"],
  template:
    '<div data-testid="article-toc">{{ links.map((link) => link.text).join("|") }}</div>',
});

mockComponent("ContentRenderer", {
  props: ["value"],
  template:
    '<div data-testid="content-body">{{ value.body.children[0].value }}</div>',
});

function articleDocument(overrides: Record<string, unknown> = {}) {
  return {
    path: "/github-pages-nuxtjs",
    title: "수정 전 제목",
    description: "수정 전 설명",
    category: "Nuxt",
    created: "2026-07-30",
    tags: ["기존 태그"],
    rawbody: "수정 전 본문",
    body: {
      type: "root",
      children: [{ type: "text", value: "수정 전 본문" }],
      toc: {
        links: [{ id: "before", text: "수정 전 목차" }],
      },
    },
    ...overrides,
  };
}

describe("article page Studio preview", () => {
  beforeEach(() => {
    queryState.article = articleDocument();
  });

  it("renders the refreshed article after Studio replaces async data", async () => {
    const wrapper = await mountSuspended(ArticlePage, {
      route: "/github-pages-nuxtjs",
    });

    expect(wrapper.get("h1").text()).toBe("수정 전 제목");
    expect(wrapper.get('[data-testid="content-body"]').text()).toBe(
      "수정 전 본문",
    );
    expect(wrapper.get('[data-testid="article-toc"]').text()).toBe(
      "수정 전 목차",
    );

    queryState.article = articleDocument({
      title: "수정 후 제목",
      description: "수정 후 설명",
      tags: ["새 태그"],
      seo: {
        title: "수정 후 검색 제목",
        canonical: "/updated-canonical",
      },
      rawbody: "수정 후 본문",
      body: {
        type: "root",
        children: [{ type: "text", value: "수정 후 본문" }],
        toc: {
          links: [{ id: "after", text: "수정 후 목차" }],
        },
      },
    });

    await useNuxtApp().hooks.callHookParallel("app:data:refresh");
    await nextTick();

    expect(wrapper.get("h1").text()).toBe("수정 후 제목");
    expect(wrapper.get('[data-testid="content-body"]').text()).toBe(
      "수정 후 본문",
    );
    expect(wrapper.get('[data-testid="article-toc"]').text()).toBe(
      "수정 후 목차",
    );
    expect(wrapper.get('[aria-label="글 태그"]').text()).toContain("새 태그");
    expect(wrapper.get('[data-testid="seo-preview"]').text()).toContain(
      "수정 후 검색 제목|수정 후 설명|https://www.peterkimzz.com/updated-canonical",
    );
  });
});
