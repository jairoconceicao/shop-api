import {
  expect,
  test as base,
  type PlaywrightTestArgs,
  type PlaywrightTestOptions,
  type PlaywrightWorkerArgs,
  type PlaywrightWorkerOptions,
  type TestType,
} from '@playwright/test'

import { installAuthApi, type AuthApi } from './support/authApi'

type AuthFixtures = { authApi: AuthApi }

const test = base.extend<AuthFixtures>({
  authApi: [
    async ({ context }, use, testInfo) => {
      await context.clearCookies()

      const authApi = await installAuthApi(context, testInfo)
      authApi.reset()

      try {
        await use(authApi)
      } finally {
        try {
          authApi.assertRequestCounts()
        } finally {
          await Promise.all(
            context.pages().map(async (page) => {
              await page
                .evaluate(() => {
                  window.localStorage.clear()
                  window.sessionStorage.clear()
                })
                .catch(() => undefined)
            }),
          )
          await context.clearCookies()
          await context.unrouteAll({ behavior: 'wait' })
          authApi.reset()
        }
      }
    },
    { auto: true },
  ],
})

const typedTest: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & AuthFixtures,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = test

export { expect, typedTest as test }
