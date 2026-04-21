import { expect, test } from '@playwright/test'

const draftSlug = '/e2e-draft-hidden-post/'
const draftTitle = 'E2E Draft Hidden Post'

test.describe('draft visibility', () => {
  test('draft post is hidden from the home page and sitemap', async ({ page, request }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: '기술과 일상, 그리고 만들면서 남긴 생각들.' })).toBeVisible()
    await expect(page.getByText(draftTitle)).toHaveCount(0)

    const sitemapResponse = await request.get('/sitemap.xml')

    expect(sitemapResponse.ok()).toBeTruthy()
    expect(await sitemapResponse.text()).not.toContain(draftSlug)
  })

  test('draft post returns the 404 experience on direct load', async ({ page }) => {
    await page.goto(draftSlug)

    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다.' })).toBeVisible()
    await expect(page.getByText(draftTitle)).toHaveCount(0)
  })
})
