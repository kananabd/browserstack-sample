import { Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium, Browser, BrowserContext } from '@playwright/test'
import { fixture } from './pageFixtures'
import { getEnv } from '../../env/env'

let browser: Browser
let context: BrowserContext

setDefaultTimeout(300 * 1000 * 1)
    // Load environment variables only if not already loaded
Before({ tags: '@login' }, async function () {
    if (!process.env.BASE_WEB_UI_URL) {
        getEnv()
    }

    const isMaximized = process.env.BROWSER_MAXIMIZED === 'true'


const args = isMaximized ? ['--start-maximized'] : []

    browser = await chromium.launch({
        headless: false,
        args: args,
    })

    context = await browser.newContext({
        viewport: isMaximized ? null : { width: 1280, height: 720 },
        permissions: ['camera', 'microphone'],
    })
    fixture.page = await context.newPage()
})

After(async function () {
    if (fixture.page) {
        await fixture.page.close()
    }
    if (browser) {
        await browser.close()
    }
})

export { context, browser }