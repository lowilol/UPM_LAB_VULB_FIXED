/**
 * PRUEBAS DE CAJA NEGRA — Registro (/signup)
 *
 * Escenarios cubiertos:
 *  S-01  Renderizado correcto del formulario de registro
 *  S-02  Registro exitoso → aparece modal de verificación de código
 *  S-03  Contraseña con menos de 9 caracteres → mensaje de error de longitud
 *  S-04  Las contraseñas no coinciden → mensaje de error de coincidencia
 *  S-05  Email ya registrado → mensaje de error del servidor
 *  S-06  Campos obligatorios vacíos → el navegador impide el envío (required)
 *  S-07  Modal de verificación: código incorrecto → mensaje de error
 *  S-08  Modal de verificación: código correcto → redirige al dashboard
 *  S-09  Usuario ya autenticado accede a /signup → redirige al dashboard
 */

import { test, expect } from '@playwright/test';
import { API, mockUnauthenticated, mockAuthenticated, mockDashboard } from './helpers';

test.beforeEach(async ({ page }) => {
  await mockUnauthenticated(page);
});

// Utilidad: rellenar el formulario de signup
async function fillSignupForm(
  page: import('@playwright/test').Page,
  {
    nombre = 'Juan',
    apellidos = 'García',
    email = 'juan@alumnos.upm.es',
    password = 'contraseña123',
    confirmPassword = 'contraseña123',
  } = {}
) {
  await page.fill('#nombre', nombre);
  await page.fill('#Apellidos', apellidos);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#ConfirmPassword', confirmPassword);
}

// ─── S-01: Renderizado ───────────────────────────────────────────────────────
test('S-01 · La página de registro muestra todos sus campos', async ({ page }) => {
  await page.goto('/signup');

  await expect(page.locator('img[alt="logo"]')).toBeVisible();
  await expect(page.locator('#nombre')).toBeVisible();
  await expect(page.locator('#Apellidos')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#ConfirmPassword')).toBeVisible();
  await expect(page.getByRole('button', { name: /sing in/i })).toBeVisible();
});

// ─── S-02: Registro exitoso → modal de verificación ─────────────────────────
test('S-02 · Registro exitoso muestra el modal de verificación de correo', async ({ page }) => {
  await page.route(`${API}/signup`, (route) =>
    route.fulfill({ status: 200, json: { message: 'Código de verificación enviado.' } })
  );

  await page.goto('/signup');
  await fillSignupForm(page);
  await page.click('button:has-text("sing in")');

  await expect(page.getByText('Verificación de Correo')).toBeVisible({ timeout: 6_000 });
  await expect(page.locator('#verificationCode')).toBeVisible();
  await expect(page.getByText(/te hemos enviado un código de verificación/i)).toBeVisible();
});

// ─── S-03: Contraseña demasiado corta ────────────────────────────────────────
test('S-03 · Contraseña con menos de 9 caracteres muestra error de longitud', async ({ page }) => {
  await page.route(`${API}/signup`, (route) => route.abort());

  await page.goto('/signup');
  await fillSignupForm(page, { password: 'corta1', confirmPassword: 'corta1' });
  await page.click('button:has-text("sing in")');

  await expect(page.getByText(/al menos 9 caracteres/i)).toBeVisible();
  await expect(page).toHaveURL('/signup');
});

// ─── S-04: Contraseñas que no coinciden ──────────────────────────────────────
test('S-04 · Contraseñas distintas muestran mensaje de no coincidencia', async ({ page }) => {
  await page.route(`${API}/signup`, (route) => route.abort());

  await page.goto('/signup');
  await fillSignupForm(page, {
    password: 'contraseña123',
    confirmPassword: 'diferente456',
  });
  await page.click('button:has-text("sing in")');

  await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
  await expect(page).toHaveURL('/signup');
});

// ─── S-05: Email ya registrado ───────────────────────────────────────────────
test('S-05 · Email ya registrado devuelve error del servidor', async ({ page }) => {
  await page.route(`${API}/signup`, (route) =>
    route.fulfill({
      status: 409,
      json: { body: { error: 'El correo ya está registrado.' } },
    })
  );

  await page.goto('/signup');
  await fillSignupForm(page, { email: 'existente@upm.es' });
  await page.click('button:has-text("sing in")');

  await expect(page.getByText('El correo ya está registrado.')).toBeVisible();
});

// ─── S-06: Campos vacíos ─────────────────────────────────────────────────────
test('S-06 · El formulario no se envía con campos obligatorios vacíos', async ({ page }) => {
  await page.route(`${API}/signup`, (route) => route.abort());

  await page.goto('/signup');
  await page.click('button:has-text("sing in")');

  await expect(page).toHaveURL('/signup');
  const nombreInput = page.locator('#nombre');
  const validity = await nombreInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
  expect(validity).toBe(true);
});

// ─── S-07: Código de verificación incorrecto ─────────────────────────────────
test('S-07 · Código de verificación incorrecto muestra error en el modal', async ({ page }) => {
  await page.route(`${API}/signup`, (route) =>
    route.fulfill({ status: 200, json: { message: 'OK' } })
  );
  await page.route(`${API}/verifyCode`, (route) =>
    route.fulfill({
      status: 400,
      json: { body: { error: 'Código de verificación incorrecto.' } },
    })
  );

  await page.goto('/signup');
  await fillSignupForm(page);
  await page.click('button:has-text("sing in")');

  await expect(page.getByText('Verificación de Correo')).toBeVisible();
  await page.fill('#verificationCode', '000000');
  await page.click('button:has-text("Verificar")');

  await expect(page.getByText('Código de verificación incorrecto.')).toBeVisible();
});

// ─── S-08: Código correcto → redirige al dashboard ───────────────────────────
test('S-08 · Código de verificación correcto redirige al dashboard', async ({ page }) => {
  await page.route(`${API}/signup`, (route) =>
    route.fulfill({ status: 200, json: { message: 'OK' } })
  );
  await page.route(`${API}/verifyCode`, (route) =>
    route.fulfill({ status: 200, json: { message: 'Verificado correctamente.' } })
  );
  await mockDashboard(page, 'Alumno');
  // verifyToken → autenticado tras verificar
  await page.route(`${API}/verifyToken`, (route) =>
    route.fulfill({ status: 200, json: { user: { dataValues: { rol: 'Alumno' } } } })
  );

  await page.goto('/signup');
  await fillSignupForm(page);
  await page.click('button:has-text("sing in")');

  await expect(page.getByText('Verificación de Correo')).toBeVisible();
  await page.fill('#verificationCode', '123456');
  await page.click('button:has-text("Verificar")');

  await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
});

// ─── S-09: Autenticado → redirige al dashboard ───────────────────────────────
test('S-09 · Usuario autenticado al acceder a /signup es redirigido al dashboard', async ({
  page,
}) => {
  await page.unroute(`${API}/verifyToken`);
  await mockAuthenticated(page, 'Alumno');
  await mockDashboard(page, 'Alumno');

  await page.goto('/signup');

  await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
});
