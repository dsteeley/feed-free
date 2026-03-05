import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve('.output/firefox-mv2');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  reporter: 'list',
  use: {
    // E2E tests use Firefox with extension loaded
    // Individual test files set up the context with the extension
    headless: true,
  },
  projects: [
    {
      name: 'firefox-extension',
      use: {
        browserName: 'firefox',
      },
      metadata: { extensionPath },
    },
  ],
  webServer: {
    command: 'npx serve tests/fixtures -p 9999 --no-clipboard',
    port: 9999,
    reuseExistingServer: !process.env.CI,
  },
});
