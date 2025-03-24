import { test as base, BrowserContext, Page } from '@playwright/test'

type PlaywrightPageFixture = {
    page: Page
}

declare global {
    var __BROWSER_CONTEXT__: BrowserContext // Re-declare to access in other files
}

export const test = base.extend<PlaywrightPageFixture>({
    page: async ({}, use) => {
        console.log(global)
        const context = global.__BROWSER_CONTEXT__ as BrowserContext
        if (!context) {
            throw new Error('Global BrowserContext is not set. Ensure globalSetup.ts is properly configured.')
        }
        const page = await context.newPage()
        await use(page)
        await page.close()
    },
})
