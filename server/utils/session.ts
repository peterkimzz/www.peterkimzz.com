import { getCookie, setCookie, deleteCookie } from 'h3'

export const SESSION_COOKIE_NAME = 'pk_blog_gh_token'
export const OAUTH_STATE_COOKIE_NAME = 'pk_blog_oauth_state'

export function setAccessTokenCookie(event: Parameters<typeof setCookie>[0], token: string) {
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  })
}

export function getAccessTokenCookie(event: Parameters<typeof getCookie>[0]) {
  return getCookie(event, SESSION_COOKIE_NAME)
}

export function clearAccessTokenCookie(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}

export function setOauthStateCookie(event: Parameters<typeof setCookie>[0], state: string) {
  setCookie(event, OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 10,
  })
}

export function getOauthStateCookie(event: Parameters<typeof getCookie>[0]) {
  return getCookie(event, OAUTH_STATE_COOKIE_NAME)
}

export function clearOauthStateCookie(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, OAUTH_STATE_COOKIE_NAME, { path: '/' })
}
