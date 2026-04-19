import { clearAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  clearAccessTokenCookie(event)

  return { ok: true }
})
