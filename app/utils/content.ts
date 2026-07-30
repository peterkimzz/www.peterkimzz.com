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
