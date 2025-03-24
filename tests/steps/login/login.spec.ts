import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { LoginPage } from '@lib/web/pages/login.page'
import { fixture } from 'tests/hooks/pageFixtures'

let loginPage: LoginPage

Given('User navigates to the application', async function () {
    loginPage = new LoginPage(fixture.page)
    await loginPage.goto()
})

Given('User enters the username from the environment', async function () {
    const username = process.env.BASE_WEB_UI_USER
    if (!username) {
        throw new Error('Username environment variable is not set.')
    }
    await loginPage.getUsernameLocator().fill(username)
})

Given('User enters the password from the environment', async function () {
    const password = process.env.BASE_WEB_UI_PWD
    if (!password) {
        throw new Error('Username and Password environment variable is not set.')
    }
    await loginPage.getPasswordLocator().fill(password)
})

When('User click on the login button', async function () {
    await loginPage.getLoginButtonLocator().click()
})

Then('User should be able to see the Home Page', async function () {
    await loginPage.page.waitForLoadState('load')
    expect(await loginPage.page.title()).toContain('Home')
})
