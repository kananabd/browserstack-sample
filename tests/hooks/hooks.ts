import { BeforeAll } from '@cucumber/cucumber'
import { getEnv } from 'env/env'
import './web.hooks'
import './weblogin.hooks'

BeforeAll(async function () {
    getEnv()
})
