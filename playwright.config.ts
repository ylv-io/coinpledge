import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'bun run dev --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
