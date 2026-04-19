import { setOauthStateCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.githubClientId) {
    throw createError({ statusCode: 500, statusMessage: 'GitHub OAuth is not configured' })
  }

  const state = crypto.randomUUID()
  setOauthStateCookie(event, state)

  const origin = getRequestURL(event).origin
  const redirectUri = `${origin}/api/auth/github/callback`
  const search = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: redirectUri,
    scope: 'repo read:user',
    state,
  })

  await sendRedirect(event, `https://github.com/login/oauth/authorize?${search.toString()}`)
})
