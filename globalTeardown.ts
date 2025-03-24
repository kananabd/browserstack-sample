import { BrowserContext } from '@playwright/test'
import logger from './lib/utils/logger'

declare global {
    var __BROWSER_CONTEXT__: BrowserContext // Re-declare to access in other files
}

export default async function globalTeardown() {
    const context = global.__BROWSER_CONTEXT__ as BrowserContext
    if (context) {
        await context.close()
        logger.info(`Global BrowserContext for is closed successfully`)
    }
}
