export function normalizeContentPath(path?: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "") || "/";
}

export function normalizeTag(tag?: string) {
  return tag?.trim() || "";
}

export function tagPath(tag: string) {
  return `/tags/${encodeURIComponent(normalizeTag(tag))}`;
}

export function toSeoDescription(value?: string, limit = 140) {
  const normalized = value?.replace(/\s+/g, " ").trim() || "";

  if (normalized.length <= limit) {
    return normalized;
  }

  const suffix = "...";
  const contentLength = Math.max(0, limit - suffix.length);

  return `${normalized.slice(0, contentLength).trimEnd()}${suffix}`.slice(
    0,
    limit,
  );
}

// Obsidian 은 vault 기준 경로(posts/a.png)로 이미지를 넣는다. 사이트 경로(/posts/a.png)로 맞춘다.
export function toPublicSrc(src?: string) {
  if (!src || /^(\/|[a-z][a-z0-9+.-]*:)/i.test(src)) {
    return src;
  }

  return `/${src}`;
}

export function toAbsoluteUrl(value: string | undefined, baseUrl: string) {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(value, baseUrl).toString();
    } catch {
      return undefined;
    }
  }
}
