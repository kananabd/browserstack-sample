import { Page, Response } from '@playwright/test'
import { NavigatePages } from './navigate.page'
import logger from '@lib/utils/logger'

export class HomePage {
    page: Page

    constructor(page: Page) {
        this.page = page
    }

    public async navigateToIntegrationsCentral(): Promise<null | Response> {
        let response: Response | null = null
        try {
            response = await this.page.goto(process.env.BASE_WEB_UI_URL + NavigatePages.integrationCentral, {
                waitUntil: 'networkidle',
            })
        } catch (error) {
            logger.error('Error during navigation: ' + error)
        }
        return response
    }

    public async navigateToEmployeeManagement(): Promise<null | Response> {
        return await this.page.goto(process.env.BASE_WEB_UI_URL + NavigatePages.employeeManagement, {
            waitUntil: 'networkidle',
        })
    }
}
