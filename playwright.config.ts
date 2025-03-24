import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import os from 'node:os'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({
    path: `./env/.env.${process.env.ENV}`,
})

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    // globalSetup: require.resolve('./globalSetup.ts'),
    // globalTeardown: require.resolve('./globalTeardown.ts'),
    testDir: './tests',
    testMatch: '*spec.ts',
    /* Run tests in files in parallel */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 3 : 100,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['junit', { outputFile: 'test-results/test-report.xml' }],
        //['./src/utils/reporter.ts', { customOption: 'some value' }]
        [
            'allure-playwright',
            {
                detail: true,
                resultsDir: `${process.env.WORKSPACE}/allure-results`,
                environmentInfo: {
                    OS: os.platform(),
                    Architecture: os.arch(),
                    NodeVersion: process.version,
                },
                links: [
                    {
                        type: 'issue',
                        urlTemplate: 'https://humanforce.atlassian.net/browse/%s',
                        nameTemplate: 'Issue: %s',
                    },
                    {
                        type: 'tms',
                        urlTemplate: 'https://humanforce.atlassian.net/browse/%s',
                        nameTemplate: 'Task: %s',
                    },
                    {
                        type: 'custom',
                        urlTemplate: 'https://humanforce.atlassian.net/browse/%s',
                        nameTemplate: 'Custom: %s',
                    },
                ],
            },
        ],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.BASE_WEB_UI_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',
        screenshot: 'on',
        video: 'on',
        //storageState: 'storage-state.json',
    },
    /* Configure timeouts */
    timeout: 360000,
    //globalTimeout: process.env.CI ? 60 * 60 * 1000 : undefined,
    /* Configure projects for major browsers */
    projects: [
]})
