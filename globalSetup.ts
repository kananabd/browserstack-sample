import { chromium, firefox, webkit, BrowserContext } from '@playwright/test'
import logger from './lib/utils/logger'

declare global {
    var __BROWSER_CONTEXT__: BrowserContext // Re-declare to access in other files
}

export default async function globalSetup() {
    // Determine the browser to use (this can be adjusted based on your setup)
    const browserName = process.env.BROWSER_NAME || 'chromium' // You can set this environment variable or use another mechanism

    let browser
    switch (browserName) {
        case 'firefox':
            browser = await firefox.launch()
            break
        case 'webkit':
            browser = await webkit.launch()
            break
        case 'chromium':
        default:
            browser = await chromium.launch()
            break
    }

    const context = await browser.newContext()

    // Store the context globally
    global.__BROWSER_CONTEXT__ = context
    logger.info(`Global BrowserContext for ${browserName} set up successfully.`)
}
