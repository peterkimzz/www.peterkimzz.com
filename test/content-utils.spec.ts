import { describe, expect, it } from "vitest";
import {
  normalizeTag,
  tagPath,
  toAbsoluteUrl,
  toPublicSrc,
  toSeoDescription,
} from "~/utils/content";

describe("content tag utilities", () => {
  it("normalizes surrounding whitespace", () => {
    expect(normalizeTag("  Nuxt  ")).toBe("Nuxt");
  });

  it("creates an encoded tag route", () => {
    expect(tagPath("웹 개발")).toBe("/tags/%EC%9B%B9%20%EA%B0%9C%EB%B0%9C");
  });

  it("resolves public paths and rejects invalid URLs", () => {
    expect(toAbsoluteUrl("/posts/example.png", "https://example.com")).toBe(
      "https://example.com/posts/example.png",
    );
    expect(toAbsoluteUrl("https://cdn.example.com/a.png", "not-a-url")).toBe(
      "https://cdn.example.com/a.png",
    );
    expect(toAbsoluteUrl("relative", "not-a-url")).toBeUndefined();
  });

  it("roots vault-relative image paths and leaves the rest alone", () => {
    expect(toPublicSrc("posts/Pasted%20image.png")).toBe(
      "/posts/Pasted%20image.png",
    );
    expect(toPublicSrc("/posts/a.png")).toBe("/posts/a.png");
    expect(toPublicSrc("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
    expect(toPublicSrc("data:image/png;base64,AA")).toBe(
      "data:image/png;base64,AA",
    );
    expect(toPublicSrc(undefined)).toBeUndefined();
  });

  it("normalizes and caps SEO descriptions", () => {
    expect(toSeoDescription("  짧은\n설명  ")).toBe("짧은 설명");

    const description = toSeoDescription("가".repeat(160));

    expect(description).toHaveLength(140);
    expect(description).toMatch(/\.\.\.$/);
  });
});
