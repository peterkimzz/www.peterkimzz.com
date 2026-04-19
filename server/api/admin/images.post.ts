import { assertAdminUser } from '~~/server/utils/github'
import { uploadToR2 } from '~~/server/utils/r2'
import { getAccessTokenCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const token = getAccessTokenCookie(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await assertAdminUser(token)

  const form = await event.request.formData()
  const image = form.get('image')

  if (!(image instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'Image file is required' })
  }

  const uploaded = await uploadToR2(image)

  return uploaded
})
