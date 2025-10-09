import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nuxtCommand = process.platform === 'win32'
  ? 'node ./node_modules/nuxt/bin/nuxt.mjs dev --hostname 127.0.0.1 --port 3000'
  : 'node ./node_modules/nuxt/bin/nuxt.mjs dev --hostname 127.0.0.1 --port 3000';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  webServer: {
    command: nuxtCommand,
    cwd: __dirname,
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});