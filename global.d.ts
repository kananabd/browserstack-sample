import { BrowserContext } from '@playwright/test'

declare global {
    var __BROWSER_CONTEXT__: BrowserContext
}

export { global }
