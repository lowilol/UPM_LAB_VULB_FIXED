import { defineConfig } from '@playwright/test';

/**
 * Configuración de Playwright para las pruebas de CAJA NEGRA del backend.
 *
 * A diferencia de las pruebas del front (que mockean la red), estas pruebas
 * atacan al servidor REAL corriendo en http://127.0.0.1:4000 contra la base
 * de datos real. Solo se usa el `request` context de Playwright (HTTP puro),
 * sin navegador.
 *
 * Ejecución:  npm run test:api   (desde la carpeta back/)
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: { timeout: 8_000 },

  // Estado compartido en BD => sin paralelismo para evitar interferencias.
  fullyParallel: false,
  workers: 1,

  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',

  reporter: [
    ['html', { outputFolder: 'playwright-report-api', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.API_BASE_URL || 'http://127.0.0.1:4000',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
    trace: 'on-first-retry',
  },
});
