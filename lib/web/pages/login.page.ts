import { Page, Locator } from '@playwright/test'
import { LoginPageLocators } from '../locators/login.locators'

export class LoginPage {
    page: Page

    constructor(page: Page) {
        this.page = page
    }

    async goto(): Promise<void> {
        await this.page.goto(`${process.env.BASE_WEB_UI_URL}`)
    }

    getUsernameLocator(): Locator {
        return this.page.locator(LoginPageLocators.username)
    }

    getPasswordLocator(): Locator {
        return this.page.locator(LoginPageLocators.password)
    }

    getLoginButtonLocator(): Locator {
        return this.page.locator(LoginPageLocators.loginButton)
    }

    async login(username: string, password: string): Promise<void> {
        await this.getUsernameLocator().fill(username)
        await this.getPasswordLocator().fill(password)
        await this.getLoginButtonLocator().click()
    }
}
