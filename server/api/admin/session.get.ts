import { assertAdminUser } from '~~/server/utils/github'
import { getAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const token = getAccessTokenCookie(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await assertAdminUser(token)

  return {
    login: user.login,
  }
})
