import { test, expect } from '@lib/fixtures/base.fixtures'

test('Login Test', async ({ loginPage }) => {
    await expect(loginPage.page).toHaveTitle('Home')
})
