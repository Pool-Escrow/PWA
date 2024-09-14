import { devices, test, expect } from '@playwright/test'

test.describe('Given a mobile browser', async () => {
    test.describe('When opening the default page', async () => {
        test('Then the welcome text should appear', async ({ page }) => {
            await page.goto('/')

            await expect(page.getByRole('heading', { name: 'Upcoming Pools' })).toBeVisible()
        })
    })
})
