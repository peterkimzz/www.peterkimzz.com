import { assertAdminUser } from '~~/server/utils/github'
import { clearOauthStateCookie, getOauthStateCookie, setAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = String(query.code || '')
  const state = String(query.state || '')
  const expectedState = getOauthStateCookie(event)

  if (!code || !state || !expectedState || state !== expectedState) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth state' })
  }

  clearOauthStateCookie(event)

  const origin = getRequestURL(event).origin
  const redirectUri = `${origin}/api/auth/github/callback`
  const oauth = await $fetch<{ access_token?: string }>('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: {
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
      redirect_uri: redirectUri,
      state,
    },
  })

  if (!oauth.access_token) {
    throw createError({ statusCode: 400, statusMessage: 'Unable to sign in with GitHub' })
  }

  await assertAdminUser(oauth.access_token)
  setAccessTokenCookie(event, oauth.access_token)
  await sendRedirect(event, '/admin')
})
