import { assertAdminUser, getAdminPost } from '~~/server/utils/github'
import { getAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const token = getAccessTokenCookie(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await assertAdminUser(token)

  const query = getQuery(event)
  const path = String(query.path || '')

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Path is required' })
  }

  return {
    post: await getAdminPost(token, path),
  }
})
