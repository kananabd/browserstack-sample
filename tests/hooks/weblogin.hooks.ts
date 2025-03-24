import { Before } from '@cucumber/cucumber'
import { fixture } from './pageFixtures'
import { LoginPage } from '@lib/web/pages/login.page'

let loginPage: LoginPage

Before({ tags: '@login' }, async function () {
    loginPage = new LoginPage(fixture.page)
})