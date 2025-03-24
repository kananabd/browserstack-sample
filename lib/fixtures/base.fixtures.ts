import { mergeTests } from '@playwright/test'
// import { test as browserFixtures } from './browser.fixture'
import { test as utilFixtures } from './utils.fixtures'
import { test as pageFixtures } from './pages.fixtures'
import { test as apiFixtures } from './publicapi.fixtures'
import { test as connectorApiFixtures } from './connectorapi.fixture'
import { test as integrationApiFixtures } from './integrationapi.fixture'
import { test as graphqlApiFixtures } from './graphqlapi.fixture'

const test = mergeTests(
    // browserFixtures,
    pageFixtures,
    utilFixtures,
    apiFixtures,
    connectorApiFixtures,
    integrationApiFixtures,
    graphqlApiFixtures,
)

export { test }
export { expect, Page, Response, Locator } from '@playwright/test'
