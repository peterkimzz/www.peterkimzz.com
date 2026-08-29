import { describe, expect, it } from "vitest";
import { getYouTubeVideoId } from "~/utils/youtube";

describe("getYouTubeVideoId", () => {
  it.each([
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=4", "dQw4w9WgXcQ"],
    [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared",
      "dQw4w9WgXcQ",
    ],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("extracts an ID from %s", (input, expected) => {
    expect(getYouTubeVideoId(input)).toBe(expected);
  });

  it.each([
    "",
    "definitely-not-a-video",
    "https://example.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=too-short",
  ])("rejects invalid input %s", (input) => {
    expect(getYouTubeVideoId(input)).toBeNull();
  });
});
