import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4201',
    channel: 'chrome',
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'uv run --project ../neg-finance-api python e2e/fixture_server.py',
      url: 'http://127.0.0.1:18000/openapi.json',
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npm run start -- --host 127.0.0.1 --port 4201',
      url: 'http://127.0.0.1:4201',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
