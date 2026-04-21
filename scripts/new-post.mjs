import { mkdir, stat, writeFile } from 'node:fs/promises'
import process from 'node:process'
import {
  ensureImageDir,
  getContentPath,
  getLocalDateString,
  getSlug,
  loadTemplate,
  slugToTitle,
} from './utils.mjs'

async function main() {
  const slug = getSlug(process.argv[2])
  const contentPath = getContentPath(slug)

  try {
    await stat(contentPath)
    throw new Error(`Post already exists: content/${slug}.md`)
  }
  catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }

  const date = getLocalDateString()
  const title = slugToTitle(slug)
  const template = await loadTemplate()
  const content = template
    .replaceAll('{{title}}', title)
    .replaceAll('{{date}}', date)
    .replaceAll('{{slug}}', slug)

  await mkdir(new URL('../content', import.meta.url), { recursive: true })
  await writeFile(contentPath, content, 'utf8')
  await ensureImageDir(slug)

  process.stdout.write([
    `Created content/${slug}.md`,
    `Created public/posts/${slug}/`,
    '',
    'Next steps:',
    `1. Open content/${slug}.md`,
    `2. Run yarn paste:image ${slug} or yarn add:image ${slug} <file...>`,
  ].join('\n'))
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
