import { describe, expect, it } from "vitest";
import { normalizeTag, tagPath, toAbsoluteUrl } from "~/utils/content";

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
});
