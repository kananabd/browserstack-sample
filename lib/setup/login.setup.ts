import { test as setup, expect } from '@lib/fixtures/base.fixtures'
import logger from '@lib/utils/logger'

setup('Login to Humanforce', async ({ loginPage, homePage }) => {
    logger.info(`Running ${setup.info().title}`)
    // Perform login
    await loginPage.login(`${process.env.BASE_WEB_UI_USER}`, `${process.env.BASE_WEB_UI_PWD}`)
    await expect(homePage.page).toHaveTitle('Home')
    await homePage.page.context().storageState({ path: 'auth/login.json' })
})
