import process from 'node:process'
import { copyImageToPost, getContentPath, getSlug } from './utils.mjs'

async function main() {
  const slug = getSlug(process.argv[2])
  const inputFiles = process.argv.slice(3)

  if (!inputFiles.length) {
    throw new Error('Provide at least one image file path.')
  }

  const results = []

  for (const filePath of inputFiles) {
    results.push(await copyImageToPost(slug, filePath))
  }

  const contentPath = getContentPath(slug)

  process.stdout.write([
    `Post: ${contentPath}`,
    '',
    ...results.map((result) => `${result.markdown}  <- ${result.sourcePath}`),
  ].join('\n'))
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
