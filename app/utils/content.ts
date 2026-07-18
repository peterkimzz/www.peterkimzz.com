export function stripMarkdown(raw: string) {
  return raw
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/[>*_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromRaw(raw?: string, limit = 140) {
  if (!raw) {
    return "";
  }

  const text = stripMarkdown(raw);

  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trim()}...`;
}

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
