import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import {
  ensureImageDir,
  getAvailableFilename,
  getLocalDateString,
  getPublicImagePath,
  getSlug,
  sanitizeFilename,
  toMarkdownImage,
} from './utils.mjs'

function copyToClipboard(text) {
  const result = spawnSync('pbcopy', {
    input: text,
    encoding: 'utf8',
  })

  return !result.error && result.status === 0
}

async function main() {
  const slug = getSlug(process.argv[2])
  const baseName = process.argv[3] || `${slug}-${getLocalDateString()}`
  const imageDir = await ensureImageDir(slug)
  const requestedName = sanitizeFilename(`${baseName}.png`)
  const targetName = await getAvailableFilename(imageDir, requestedName)
  const targetPath = path.join(imageDir, targetName)
  const saveResult = spawnSync('pngpaste', [targetPath], {
    encoding: 'utf8',
  })

  if (saveResult.error?.code === 'ENOENT') {
    throw new Error('pngpaste is not installed. Install it with `brew install pngpaste`, or use `yarn add:image <slug> <file...>` instead.')
  }

  if (saveResult.status !== 0) {
    const message = (saveResult.stderr || '').trim() || 'Clipboard does not contain an image.'
    throw new Error(`${message} Use \`yarn add:image ${slug} <file...>\` instead if you want to import a local file.`)
  }

  const publicPath = getPublicImagePath(slug, targetName)
  const markdown = toMarkdownImage(publicPath)
  const didCopy = copyToClipboard(markdown)

  process.stdout.write([
    `Saved clipboard image for ${slug}`,
    '',
    'Markdown:',
    markdown,
    '',
    didCopy ? 'Copied markdown to clipboard.' : 'Could not copy markdown to clipboard.',
  ].join('\n') + '\n')
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
