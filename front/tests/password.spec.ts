/**
 * PRUEBAS DE CAJA NEGRA — Recuperación de contraseña
 *
 * Página: /requestPassword  (solicitar email de recuperación)
 *   RP-01  Renderizado correcto del formulario
 *   RP-02  Email existente → mensaje informativo de éxito
 *   RP-03  Email no registrado → mensaje de error
 *   RP-04  Campo vacío → validación HTML nativa (required)
 *
 * Página: /changerPassword/:token  (establecer nueva contraseña)
 *   CP-01  Renderizado correcto del formulario
 *   CP-02  Nueva contraseña con menos de 9 caracteres → error de longitud
 *   CP-03  Las dos contraseñas no coinciden → error de coincidencia
 *   CP-04  Token válido + contraseñas correctas → mensaje de éxito
 *   CP-05  Token inválido/expirado → mensaje de error del servidor
 */

import { test, expect } from '@playwright/test';
import { API, mockUnauthenticated } from './helpers';

test.beforeEach(async ({ page }) => {
  await mockUnauthenticated(page);
});

// ══════════════════════════════════════════════════════════════════════════════
// /requestPassword
// ══════════════════════════════════════════════════════════════════════════════

test('RP-01 · La página de solicitud de contraseña muestra sus elementos', async ({ page }) => {
  await page.goto('/requestPassword');

  await expect(page.locator('img[alt="logo"]')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
  await expect(page.getByText(/introduzca su correo electrónico/i)).toBeVisible();
});

test('RP-02 · Email registrado muestra mensaje informativo de éxito', async ({ page }) => {
  await page.route(`${API}/requestPasswordReset`, (route) =>
    route.fulfill({
      status: 200,
      json: { body: { request: 'Se ha enviado un enlace de recuperación a su correo.' } },
    })
  );

  await page.goto('/requestPassword');
  await page.fill('#email', 'juan@alumnos.upm.es');
  await page.click('button:has-text("enviar")');

  await expect(
    page.getByText(/se ha enviado un enlace de recuperación/i)
  ).toBeVisible();
});

test('RP-03 · Email no registrado muestra mensaje de error', async ({ page }) => {
  await page.route(`${API}/requestPasswordReset`, (route) =>
    route.fulfill({
      status: 404,
      json: { body: { error: 'No existe ninguna cuenta con ese correo.' } },
    })
  );

  await page.goto('/requestPassword');
  await page.fill('#email', 'noexiste@upm.es');
  await page.click('button:has-text("enviar")');

  await expect(page.getByText('No existe ninguna cuenta con ese correo.')).toBeVisible();
});

test('RP-04 · El campo email es obligatorio (required)', async ({ page }) => {
  await page.route(`${API}/requestPasswordReset`, (route) => route.abort());

  await page.goto('/requestPassword');
  await page.click('button:has-text("enviar")');

  const emailInput = page.locator('#email');
  const missing = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
  expect(missing).toBe(true);
  await expect(page).toHaveURL('/requestPassword');
});

// ══════════════════════════════════════════════════════════════════════════════
// /changerPassword/:token
// ══════════════════════════════════════════════════════════════════════════════

const FAKE_TOKEN = 'tokenABC123';

test('CP-01 · La página de cambio de contraseña muestra sus elementos', async ({ page }) => {
  await page.goto(`/changerPassword/${FAKE_TOKEN}`);

  await expect(page.locator('img[alt="logo"]')).toBeVisible();
  await expect(page.locator('#NewPassword')).toBeVisible();
  await expect(page.locator('#ConfirmPassword')).toBeVisible();
  await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
  await expect(page.getByText('Nueva contraseña')).toBeVisible();
  await expect(page.getByText(/confimar contraseña/i)).toBeVisible();
});

test('CP-02 · Nueva contraseña con menos de 9 caracteres muestra error de longitud', async ({
  page,
}) => {
  await page.route(`${API}/resetPassword/${FAKE_TOKEN}`, (route) => route.abort());

  await page.goto(`/changerPassword/${FAKE_TOKEN}`);
  await page.fill('#NewPassword', 'corta1');
  await page.fill('#ConfirmPassword', 'corta1');
  await page.click('button:has-text("enviar")');

  await expect(page.getByText(/al menos 9 caracteres/i)).toBeVisible();
});

test('CP-03 · Las contraseñas no coinciden muestran error de coincidencia', async ({ page }) => {
  await page.route(`${API}/resetPassword/${FAKE_TOKEN}`, (route) => route.abort());

  await page.goto(`/changerPassword/${FAKE_TOKEN}`);
  await page.fill('#NewPassword', 'contraseña123');
  await page.fill('#ConfirmPassword', 'diferente456');
  await page.click('button:has-text("enviar")');

  await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
});

test('CP-04 · Token válido y contraseñas correctas muestran mensaje de éxito', async ({ page }) => {
  await page.route(`${API}/resetPassword/${FAKE_TOKEN}`, (route) =>
    route.fulfill({
      status: 200,
      json: { message: 'Contraseña actualizada exitosamente.' },
    })
  );

  await page.goto(`/changerPassword/${FAKE_TOKEN}`);
  await page.fill('#NewPassword', 'NuevaPass123');
  await page.fill('#ConfirmPassword', 'NuevaPass123');
  await page.click('button:has-text("enviar")');

  await expect(page.getByText(/contraseña actualizada exitosamente/i)).toBeVisible();
});

test('CP-05 · Token inválido o expirado muestra error del servidor', async ({ page }) => {
  await page.route(`${API}/resetPassword/${FAKE_TOKEN}`, (route) =>
    route.fulfill({
      status: 400,
      json: { error: 'El token es inválido o ha expirado.' },
    })
  );

  await page.goto(`/changerPassword/${FAKE_TOKEN}`);
  await page.fill('#NewPassword', 'NuevaPass123');
  await page.fill('#ConfirmPassword', 'NuevaPass123');
  await page.click('button:has-text("enviar")');

  await expect(page.getByText(/el token es inválido o ha expirado/i)).toBeVisible();
});
