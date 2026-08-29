const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/;

function validVideoId(value?: string | null) {
  return value && youtubeVideoIdPattern.test(value) ? value : null;
}

export function getYouTubeVideoId(input?: string) {
  const value = input?.trim();

  if (!value) {
    return null;
  }

  const directId = validVideoId(value);

  if (directId) {
    return directId;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    return validVideoId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (
    host !== "youtube.com" &&
    host !== "m.youtube.com" &&
    host !== "youtube-nocookie.com"
  ) {
    return null;
  }

  if (url.pathname === "/watch") {
    return validVideoId(url.searchParams.get("v"));
  }

  const [kind, id] = url.pathname.split("/").filter(Boolean);

  if (["embed", "shorts", "live"].includes(kind || "")) {
    return validVideoId(id);
  }

  return null;
}
