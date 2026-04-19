import { assertAdminUser, listAdminPosts } from '~~/server/utils/github'
import { getAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const token = getAccessTokenCookie(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await assertAdminUser(token)

  const posts = await listAdminPosts(token)

  return {
    posts,
  }
})
