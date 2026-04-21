import { copyFile, mkdir, readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function getSlug(input) {
  const slug = (input || '').trim().toLowerCase()

  if (!slug) {
    throw new Error('Slug is required.')
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Slug must use lowercase letters, numbers, and hyphens only.')
  }

  return slug
}

export function getLocalDateString() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const parts = formatter.formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return `${year}-${month}-${day}`
}

export function slugToTitle(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function getContentPath(slug) {
  return path.join(projectRoot, 'content', `${slug}.md`)
}

export function getImageDir(slug) {
  return path.join(projectRoot, 'public', 'posts', slug)
}

export async function ensureImageDir(slug) {
  const imageDir = getImageDir(slug)
  await mkdir(imageDir, { recursive: true })
  return imageDir
}

export function getPublicImagePath(slug, filename) {
  return `/posts/${slug}/${filename}`
}

export function fileStem(filename) {
  return path.basename(filename, path.extname(filename))
}

export function sanitizeFilename(filename) {
  const extension = path.extname(filename).toLowerCase()
  const stem = fileStem(filename)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const safeStem = stem || 'image'
  return `${safeStem}${extension}`
}

export async function getAvailableFilename(directory, originalName) {
  const extension = path.extname(originalName)
  const stem = fileStem(originalName)
  let candidate = originalName
  let index = 1

  while (true) {
    try {
      await stat(path.join(directory, candidate))
      candidate = `${stem}-${index}${extension}`
      index += 1
    }
    catch {
      return candidate
    }
  }
}

export function toMarkdownImage(publicPath) {
  const alt = fileStem(publicPath).replace(/[-_]+/g, ' ').trim() || 'image'
  return `![${alt}](${publicPath})`
}

export async function copyImageToPost(slug, sourcePath) {
  const imageDir = await ensureImageDir(slug)
  const resolvedSource = path.resolve(sourcePath)
  const sourceStat = await stat(resolvedSource)

  if (!sourceStat.isFile()) {
    throw new Error(`Not a file: ${sourcePath}`)
  }

  const sanitizedName = sanitizeFilename(path.basename(resolvedSource))
  const targetName = await getAvailableFilename(imageDir, sanitizedName)
  const targetPath = path.join(imageDir, targetName)

  await copyFile(resolvedSource, targetPath)

  return {
    sourcePath: resolvedSource,
    targetPath,
    publicPath: getPublicImagePath(slug, targetName),
    markdown: toMarkdownImage(getPublicImagePath(slug, targetName)),
  }
}

export async function loadTemplate() {
  return readFile(path.join(projectRoot, 'content', '.template', 'basic.md'), 'utf8')
}
