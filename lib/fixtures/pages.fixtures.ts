import { test as base } from '@playwright/test'
import { LoginPage } from '../web/pages/login.page'
import { HomePage } from '../web/pages/home.page'
import { IntegrationCentralPage } from '../web/pages/IntegrationCentral/integration-central.page'
import { DatapayPage } from '../web/pages/IntegrationCentral/datapay.page'
import { FileImportPage } from '../web/pages/IntegrationCentral/file-import.page'
import { PayrollMetricsPage } from '../web/pages/IntegrationCentral/payroll-metrics.page'
import { CintraPage } from '../web/pages/IntegrationCentral/cintra.page'
import { EpayrollPage } from '../web/pages/IntegrationCentral/epayroll.page'
import { IntelliHRPage } from '../web/pages/IntegrationCentral/intelli-hr.page'
import { ReckonOnePage } from '../web/pages/IntegrationCentral/reckon-one.page'
import { SwiftPosPage } from '../web/pages/IntegrationCentral/swiftpos.page'

// Declare the types of your fixtures.
type PageFixtures = {
    loginPage: LoginPage
    homePage: HomePage
    integrationCentralPage: IntegrationCentralPage
    datapayPage: DatapayPage
    fileImportPage: FileImportPage
    payrollMetricsPage: PayrollMetricsPage
    cintraPage: CintraPage
    ePayrollPage: EpayrollPage
    intelliHRPage: IntelliHRPage
    reckonOnePage: ReckonOnePage
    swiftPosPage: SwiftPosPage
}

const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        const loginpage = new LoginPage(page)
        await loginpage.goto()
        // Use the fixture value in the test.
        await use(loginpage)
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page))
    },
    integrationCentralPage: async ({ page }, use) => {
        await use(new IntegrationCentralPage(page))
    },
    datapayPage: async ({ page }, use) => {
        await use(new DatapayPage(page))
    },
    fileImportPage: async ({ page }, use) => {
        await use(new FileImportPage(page))
    },
    payrollMetricsPage: async ({ page }, use) => {
        await use(new PayrollMetricsPage(page))
    },
    cintraPage: async ({ page }, use) => {
        await use(new CintraPage(page))
    },
    ePayrollPage: async ({ page }, use) => {
        await use(new EpayrollPage(page))
    },
    intelliHRPage: async ({ page }, use) => {
        await use(new IntelliHRPage(page))
    },
    reckonOnePage: async ({ page }, use) => {
        await use(new ReckonOnePage(page))
    },
    swiftPosPage: async ({ page }, use) => {
        await use(new SwiftPosPage(page))
    },
})

export { test }
export { expect } from '@playwright/test'
