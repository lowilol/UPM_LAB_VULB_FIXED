/**
 * PRUEBAS DE CAJA NEGRA — Login (/)
 *
 * Escenarios cubiertos:
 *  L-01  Renderizado correcto del formulario de login
 *  L-02  Login con credenciales válidas → redirige al dashboard
 *  L-03  Login con contraseña incorrecta → muestra mensaje de error
 *  L-04  Login con email no registrado → muestra mensaje de error
 *  L-05  Campos obligatorios vacíos → el navegador impide el envío (required)
 *  L-06  El enlace "¿Olvidó la contraseña?" navega a /requestPassword
 *  L-07  El enlace "Registrarse" navega a /signup
 *  L-08  Usuario ya autenticado es redirigido al dashboard sin ver el login
 *  L-09  Error de conexión con el servidor → muestra mensaje de error de red
 */

import { test, expect } from '@playwright/test';
import { API, mockUnauthenticated, mockAuthenticated, mockDashboard, buildUser } from './helpers';

// ─── Configuración común ─────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  // Por defecto cada test comienza con usuario NO autenticado
  await mockUnauthenticated(page);
});

// ─── L-01: Renderizado del formulario ────────────────────────────────────────
test('L-01 · La página de login muestra todos sus elementos', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('img[alt="logo"]')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.getByText('¿Olvidó la contaseña?')).toBeVisible();
  await expect(page.getByText('Registrarse')).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

// ─── L-02: Login exitoso ──────────────────────────────────────────────────────
test('L-02 · Login con credenciales válidas redirige al dashboard', async ({ page }) => {
  const fakeUser = buildUser('Alumno');

  // BUG CORREGIDO: el mock devolvía "publicUser" pero login.jsx
  // lee json.user → auth.saveUser(json.user)
  await page.route(`${API}/login`, (route) =>
    route.fulfill({
      status: 200,
      json: {
        accessToken: 'fake-jwt',
        user: fakeUser,
      },
    })
  );

  // verifyToken se mantiene en 401 (beforeEach) para que el formulario de
  // login se muestre; tras enviar /login, saveUser marca la sesión como
  // autenticada y ProtectedRoute permite el acceso a /dashboard.
  await mockDashboard(page, 'Alumno');

  await page.goto('/');
  await page.fill('#email', 'juan@alumnos.upm.es');
  await page.fill('#password', 'contraseña123');
  await page.click('button:has-text("login")');

  await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
});

// ─── L-03: Contraseña incorrecta ─────────────────────────────────────────────
test('L-03 · Login con contraseña incorrecta muestra mensaje de error', async ({ page }) => {
  await page.route(`${API}/login`, (route) =>
    route.fulfill({
      status: 401,
      json: { body: { error: 'Credenciales incorrectas.' } },
    })
  );

  await page.goto('/');
  await page.fill('#email', 'juan@alumnos.upm.es');
  await page.fill('#password', 'wrongpass');
  await page.click('button:has-text("login")');

  await expect(page.getByText('Credenciales incorrectas.')).toBeVisible();
  await expect(page).toHaveURL('/');
});

// ─── L-04: Email no registrado ───────────────────────────────────────────────
test('L-04 · Login con email no registrado muestra mensaje de error', async ({ page }) => {
  await page.route(`${API}/login`, (route) =>
    route.fulfill({
      status: 404,
      json: { body: { error: 'Usuario no encontrado.' } },
    })
  );

  await page.goto('/');
  await page.fill('#email', 'noexiste@upm.es');
  await page.fill('#password', 'alguna123');
  await page.click('button:has-text("login")');

  await expect(page.getByText('Usuario no encontrado.')).toBeVisible();
});

// ─── L-05: Campos vacíos — validación HTML nativa ────────────────────────────
test('L-05 · El formulario no se envía con campos vacíos (atributo required)', async ({ page }) => {
  await page.route(`${API}/login`, (route) => route.abort()); // nunca debe llamarse

  await page.goto('/');
  await page.click('button:has-text("login")');

  await expect(page).toHaveURL('/');
  const emailInput = page.locator('#email');
  const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
  expect(validity).toBe(true);
});

// ─── L-06: Enlace "¿Olvidó la contraseña?" ───────────────────────────────────
test('L-06 · El enlace "¿Olvidó la contraseña?" navega a /requestPassword', async ({ page }) => {
  await page.goto('/');
  await page.click('text=¿Olvidó la contaseña?');
  await expect(page).toHaveURL('/requestPassword');
});

// ─── L-07: Enlace "Registrarse" ──────────────────────────────────────────────
test('L-07 · El enlace "Registrarse" navega a /signup', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Registrarse');
  await expect(page).toHaveURL('/signup');
});

// ─── L-08: Usuario ya autenticado redirigido al dashboard ────────────────────
test('L-08 · Usuario ya autenticado es redirigido al dashboard automáticamente', async ({ page }) => {
  await page.unroute(`${API}/verifyToken`);
  await mockAuthenticated(page, 'Alumno');
  await mockDashboard(page, 'Alumno');

  await page.goto('/');

  await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
});

// ─── L-09: Error de conexión con el servidor ─────────────────────────────────
test('L-09 · Error de red durante el login muestra mensaje de error de conexión', async ({ page }) => {
  await page.route(`${API}/login`, (route) => route.abort('failed'));

  await page.goto('/');
  await page.fill('#email', 'juan@alumnos.upm.es');
  await page.fill('#password', 'contraseña123');
  await page.click('button:has-text("login")');

  await expect(page.getByText(/error de conexión/i)).toBeVisible();
});
