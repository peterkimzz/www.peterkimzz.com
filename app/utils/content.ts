export function stripMarkdown(raw: string) {
  return raw
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/[>*_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function excerptFromRaw(raw?: string, limit = 140) {
  if (!raw) {
    return ''
  }

  const text = stripMarkdown(raw)

  if (text.length <= limit) {
    return text
  }

  return `${text.slice(0, limit).trim()}...`
}

export function normalizeContentPath(path?: string) {
  if (!path || path === '/') {
    return '/'
  }

  return path.replace(/\/+$/, '') || '/'
}
