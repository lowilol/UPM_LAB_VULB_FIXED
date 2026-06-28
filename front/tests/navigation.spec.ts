/**
 * PRUEBAS DE CAJA NEGRA — Navegación y rutas protegidas
 *
 * Escenarios cubiertos:
 *   N-01  Ruta raíz (/) muestra el formulario de login
 *   N-02  Ruta /signup muestra el formulario de registro
 *   N-03  Ruta /requestPassword muestra el formulario de recuperación
 *   N-04  Ruta /changerPassword/:token muestra el formulario de cambio
 *   N-05  Ruta /dashboard sin sesión → redirige a /
 *   N-06  Ruta /me sin sesión → redirige a /
 *   N-07  Ruta inexistente no rompe la aplicación (el Router no lanza error)
 *   N-08  Logo UPM está presente en todas las páginas públicas
 */

import { test, expect } from '@playwright/test';
import { mockUnauthenticated } from './helpers';

test.beforeEach(async ({ page }) => {
  await mockUnauthenticated(page);
});

// ─── N-01 ────────────────────────────────────────────────────────────────────
test('N-01 · La ruta raíz (/) muestra el formulario de login', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

// ─── N-02 ────────────────────────────────────────────────────────────────────
test('N-02 · La ruta /signup muestra el formulario de registro', async ({ page }) => {
  await page.goto('/signup');

  await expect(page.locator('#nombre')).toBeVisible();
  await expect(page.locator('#Apellidos')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
});

// ─── N-03 ────────────────────────────────────────────────────────────────────
test('N-03 · La ruta /requestPassword muestra el formulario de recuperación', async ({ page }) => {
  await page.goto('/requestPassword');

  await expect(page.locator('#email')).toBeVisible();
  await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
});

// ─── N-04 ────────────────────────────────────────────────────────────────────
test('N-04 · La ruta /changerPassword/:token muestra el formulario de cambio', async ({ page }) => {
  await page.goto('/changerPassword/tokenABC');

  await expect(page.locator('#NewPassword')).toBeVisible();
  await expect(page.locator('#ConfirmPassword')).toBeVisible();
  await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
});

// ─── N-05 ────────────────────────────────────────────────────────────────────
test('N-05 · Acceso directo a /dashboard sin sesión redirige a /', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/', { timeout: 10_000 });
});

// ─── N-06 ────────────────────────────────────────────────────────────────────
test('N-06 · Acceso directo a /me sin sesión redirige a /', async ({ page }) => {
  await page.goto('/me');
  await expect(page).toHaveURL('/', { timeout: 10_000 });
});

// ─── N-07 ────────────────────────────────────────────────────────────────────
test('N-07 · Una ruta inexistente no rompe la aplicación', async ({ page }) => {
  // React Router no define una ruta 404 explícita; simplemente no renderiza nada
  await page.goto('/ruta-que-no-existe');
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.waitForTimeout(1000);
  expect(errors).toHaveLength(0);
});

// ─── N-08 ────────────────────────────────────────────────────────────────────
test('N-08 · El logo de la UPM aparece en todas las páginas públicas', async ({ page }) => {
  const publicRoutes = ['/', '/signup', '/requestPassword', '/changerPassword/fakeToken'];

  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(
      page.locator('img[alt="logo"]'),
      `Logo no encontrado en ${route}`
    ).toBeVisible();
  }
});
