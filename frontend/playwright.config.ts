import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const host = process.env.NUXT_HOST || '0.0.0.0'
const port = Number.parseInt(process.env.NITRO_PORT || process.env.NUXT_PORT || '3000', 10)
const nuxtCommand = `node ./node_modules/nuxt/bin/nuxt.mjs dev --hostname ${host} --port ${port}`
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: nuxtCommand,
    cwd: __dirname,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
})
