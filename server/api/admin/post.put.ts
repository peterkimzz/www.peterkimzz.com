import type { AdminPostInput } from '~~/server/utils/admin'
import { buildContentPath, serializeMarkdown } from '~~/server/utils/admin'
import { assertAdminUser, saveRepoFile } from '~~/server/utils/github'
import { getAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const token = getAccessTokenCookie(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await assertAdminUser(token)

  const body = await readBody(event) as AdminPostInput
  const path = buildContentPath(body)
  const content = serializeMarkdown(body)
  const message = `${body.published ? 'publish' : 'draft'}: ${body.title}`

  await saveRepoFile(token, path, content, message)

  return {
    ok: true,
    path,
  }
})
