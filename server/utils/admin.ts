import { createError } from 'h3'

export type AdminPostInput = {
  path?: string
  slug?: string
  title: string
  description?: string
  category?: string
  image?: string
  created?: string
  updated?: string
  published: boolean
  body: string
}

export function normalizeSlug(input?: string) {
  return (input || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '')
    .replace(/\/-+/g, '/')
    .replace(/-{2,}/g, '-')
}

export function isAllowedContentPath(path: string) {
  return path.startsWith('content/')
    && path.endsWith('.md')
    && !path.includes('..')
}

export function buildContentPath(input: AdminPostInput) {
  if (input.path) {
    if (!isAllowedContentPath(input.path)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid content path' })
    }

    return input.path
  }

  const normalized = normalizeSlug(input.slug || input.title)

  if (!normalized) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
  }

  return `content/${normalized}.md`
}

function yamlValue(value?: string | boolean) {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  return JSON.stringify(value || '')
}

export function serializeMarkdown(input: AdminPostInput) {
  const today = new Date().toISOString().slice(0, 10)
  const created = input.created || today
  const updated = input.updated || today
  const frontmatter = [
    '---',
    `title: ${yamlValue(input.title)}`,
    `description: ${yamlValue(input.description)}`,
    `category: ${yamlValue(input.category || 'tech')}`,
    `image: ${yamlValue(input.image)}`,
    `created: ${yamlValue(created)}`,
    `updated: ${yamlValue(updated)}`,
    `published: ${yamlValue(input.published)}`,
    '---',
    '',
  ]

  return `${frontmatter.join('\n')}${input.body.trim()}\n`
}
