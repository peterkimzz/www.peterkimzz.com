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
