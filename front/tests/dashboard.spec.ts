/**
 * PRUEBAS DE CAJA NEGRA — Dashboard (/dashboard)
 *
 * Escenarios cubiertos:
 *
 * Estructura general:
 *   D-01  Renderizado: cabecera, aside, footer y bienvenida
 *   D-02  El botón "Cerrar sesión" redirige a la raíz (/)
 *   D-03  El botón "Perfil" muestra la sección de perfil
 *
 * Rol Alumno:
 *   D-04  El aside muestra "Turnos Disponibles" e "Historial de Reservas"
 *   D-05  "Turnos Disponibles" carga y muestra la tabla de turnos
 *   D-06  "Historial de Reservas" carga y muestra la tabla de reservas
 *   D-07  Hacer clic en un turno abre el modal de detalles
 *   D-16  Hacer clic en una reserva abre el modal de detalles de reserva
 *
 * Rol Profesor:
 *   D-08  El aside muestra "Mis Turnos", "Turnos Disponibles" e "Incidencias laboratorio"
 *   D-09  El aside muestra el botón "Crear Turnos"
 *   D-10  El modal de creación de turno se abre al pulsar "Crear Turnos"
 *   D-15  "Mis Turnos" carga y muestra los turnos del profesor
 *
 * Rol PAS:
 *   D-11  El aside muestra "Mostrar Laboratorios" y "Dar alta Laboratorios"
 *   D-12  "Mostrar Laboratorios" carga y muestra la tabla de laboratorios
 *   D-13  El modal de alta de laboratorio se abre al pulsar "Dar alta Laboratorios"
 *   D-17  Hacer clic en un laboratorio abre el modal de detalles de laboratorio
 *
 * Ruta protegida:
 *   D-14  Acceso sin autenticación redirige a la raíz (/)
 */

import { test, expect } from '@playwright/test';
import { API, mockAuthenticated, mockDashboard, buildUser } from './helpers';

// ─── Helper interno ───────────────────────────────────────────────────────────

async function setupDashboard(
  page: import('@playwright/test').Page,
  rol: 'Alumno' | 'Profesor' | 'PAS' = 'Alumno'
) {
  await mockAuthenticated(page, rol);
  await mockDashboard(page, rol);

  await page.route(`${API}/turno`, (route) =>
    route.fulfill({
      status: 200,
      json: [
        {
          id_turno: 1,
          fecha: '2025-06-01',
          hora_inicio: '09:00',
          hora_fin: '11:00',
          laboratorio: 'Lab A',
          capacidad: 20,
          inscritos: 5,
        },
      ],
    })
  );

  // Turnos del profesor (por id)
  await page.route(`${API}/turno/1`, (route) =>
    route.fulfill({
      status: 200,
      json: [
        {
          id_turno: 1,
          fecha: '2025-06-01',
          hora_inicio: '09:00',
          hora_fin: '11:00',
          laboratorio: 'Lab A',
          capacidad: 20,
          inscritos: 3,
        },
      ],
    })
  );

  await page.route(`${API}/reserva/1`, (route) =>
    route.fulfill({
      status: 200,
      json: [
        {
          id_turno: 1,
          id_alumno: 1,
          estado: 'Activa',
          fecha: '2025-06-01',
          hora_inicio: '09:00',
          hora_fin: '11:00',
          laboratorio: 'Lab A',
        },
      ],
    })
  );

  await page.route(`${API}/laboratorio`, (route) =>
    route.fulfill({
      status: 200,
      json: [
        {
          id_laboratorio: 1,
          nombre: 'Laboratorio A',
          capacidad: 30,
          estado: 'Habilitado',
        },
      ],
    })
  );

  await page.route(`${API}/incidencia/laboratorio`, (route) =>
    route.fulfill({ status: 200, json: [] })
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Estructura general
// ══════════════════════════════════════════════════════════════════════════════

test('D-01 · El dashboard muestra cabecera, aside, footer y mensaje de bienvenida', async ({
  page,
}) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await expect(page.locator('nav.dashboard-nav')).toBeVisible();
  await expect(page.locator('aside.dashboard-aside')).toBeVisible();
  await expect(page.locator('footer.dashboard-footer')).toBeVisible();
  await expect(page.getByText(/Bienvenido, Alumno : Juan García/i)).toBeVisible();
  await expect(page.getByText(/Universidad Politécnica de Madrid/i)).toBeVisible();
});

test('D-02 · El botón "Cerrar sesión" redirige a la raíz (/)', async ({ page }) => {
  await setupDashboard(page, 'Alumno');

  await page.route(`${API}/logout`, (route) =>
    route.fulfill({ status: 200, json: { message: 'OK' } })
  );

  await page.goto('/dashboard');
  await page.click('button:has-text("Cerrar sesión")');

  await expect(page).toHaveURL('/', { timeout: 8_000 });
});

test('D-03 · El botón "Perfil" muestra la sección de perfil del usuario', async ({ page }) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await page.click('button.btn-profile');

  await expect(page.getByText('Juan')).toBeVisible();
  await expect(page.getByText('juan@alumnos.upm.es')).toBeVisible();
});

// ══════════════════════════════════════════════════════════════════════════════
// Rol Alumno
// ══════════════════════════════════════════════════════════════════════════════

test('D-04 · El aside de Alumno muestra "Turnos Disponibles" e "Historial de Reservas"', async ({
  page,
}) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await expect(page.getByRole('button', { name: 'Turnos Disponibles' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Historial de Reservas' })).toBeVisible();
  // No debe ver opciones de otros roles
  await expect(page.getByRole('button', { name: 'Mis Turnos' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Mostrar Laboratorios' })).not.toBeVisible();
});

test('D-05 · "Turnos Disponibles" carga la lista de turnos y los muestra', async ({ page }) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await page.click('button:has-text("Turnos Disponibles")');

  await expect(page.getByText('Lab A')).toBeVisible({ timeout: 8_000 });
});

test('D-06 · "Historial de Reservas" carga las reservas del alumno', async ({ page }) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await page.click('button:has-text("Historial de Reservas")');

  await expect(page.getByText('Activa')).toBeVisible({ timeout: 8_000 });
});

test('D-07 · Hacer clic en un turno abre el modal de detalles del turno', async ({ page }) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await page.click('button:has-text("Turnos Disponibles")');
  await page.locator('table tbody tr').first().click({ timeout: 8_000 });

  await expect(
    page.locator('[role="dialog"], .modal, [class*="modal"]').first()
  ).toBeVisible({ timeout: 6_000 });
});

test('D-16 · Hacer clic en una reserva abre el modal de detalles de reserva', async ({ page }) => {
  await setupDashboard(page, 'Alumno');
  await page.goto('/dashboard');

  await page.click('button:has-text("Historial de Reservas")');
  await page.locator('table tbody tr').first().click({ timeout: 8_000 });

  await expect(
    page.locator('[role="dialog"], .modal, [class*="modal"]').first()
  ).toBeVisible({ timeout: 6_000 });
});

// ══════════════════════════════════════════════════════════════════════════════
// Rol Profesor
// ══════════════════════════════════════════════════════════════════════════════

test('D-08 · El aside de Profesor muestra "Turnos Disponibles", "Mis Turnos" e "Incidencias"', async ({
  page,
}) => {
  await setupDashboard(page, 'Profesor');
  await page.goto('/dashboard');

  await expect(page.getByRole('button', { name: 'Turnos Disponibles' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mis Turnos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Incidencias laboratorio' })).toBeVisible();
  // No debe ver opciones de Alumno ni PAS
  await expect(page.getByRole('button', { name: 'Historial de Reservas' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Mostrar Laboratorios' })).not.toBeVisible();
});

test('D-09 · El aside de Profesor muestra el botón "Crear Turnos"', async ({ page }) => {
  await setupDashboard(page, 'Profesor');
  await page.goto('/dashboard');

  await expect(page.getByRole('button', { name: /crear turnos/i })).toBeVisible();
});

test('D-10 · "Crear Turnos" abre el modal de creación de turno', async ({ page }) => {
  await setupDashboard(page, 'Profesor');
  await page.goto('/dashboard');

  await page.click('button:has-text("Crear Turnos")');

  await expect(
    page.locator('[role="dialog"], .modal, [class*="modal"]').first()
  ).toBeVisible({ timeout: 6_000 });
});

test('D-15 · "Mis Turnos" del Profesor carga y muestra sus turnos', async ({ page }) => {
  await setupDashboard(page, 'Profesor');
  await page.goto('/dashboard');

  await page.click('button:has-text("Mis Turnos")');

  // El mock de /api/turno/1 devuelve un turno con Lab A
  await expect(page.getByText('Lab A')).toBeVisible({ timeout: 8_000 });
});

// ══════════════════════════════════════════════════════════════════════════════
// Rol PAS
// ══════════════════════════════════════════════════════════════════════════════

test('D-11 · El aside de PAS muestra "Mostrar Laboratorios" y "Dar alta Laboratorios"', async ({
  page,
}) => {
  await setupDashboard(page, 'PAS');
  await page.goto('/dashboard');

  await expect(page.getByRole('button', { name: 'Mostrar Laboratorios' })).toBeVisible();
  await expect(page.getByRole('button', { name: /dar alta laboratorios/i })).toBeVisible();
  // No debe ver opciones de Alumno ni Profesor
  await expect(page.getByRole('button', { name: 'Turnos Disponibles' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Mis Turnos' })).not.toBeVisible();
});

test('D-12 · "Mostrar Laboratorios" carga y muestra la lista de laboratorios', async ({ page }) => {
  await setupDashboard(page, 'PAS');
  await page.goto('/dashboard');

  await page.click('button:has-text("Mostrar Laboratorios")');

  await expect(page.getByText('Laboratorio A')).toBeVisible({ timeout: 8_000 });
});

test('D-13 · "Dar alta Laboratorios" abre el modal de creación de laboratorio', async ({ page }) => {
  await setupDashboard(page, 'PAS');
  await page.goto('/dashboard');

  await page.click('button:has-text("Dar alta Laboratorios")');

  await expect(
    page.locator('[role="dialog"], .modal, [class*="modal"]').first()
  ).toBeVisible({ timeout: 6_000 });
});

test('D-17 · Hacer clic en un laboratorio abre el modal de detalles de laboratorio', async ({
  page,
}) => {
  // Mock adicional: incidencias por laboratorio
  await setupDashboard(page, 'PAS');
  await page.route(`${API}/incidencia/laboratorio/1`, (route) =>
    route.fulfill({ status: 200, json: [] })
  );

  await page.goto('/dashboard');
  await page.click('button:has-text("Mostrar Laboratorios")');
  await page.locator('table tbody tr').first().click({ timeout: 8_000 });

  await expect(
    page.locator('[role="dialog"], .modal, [class*="modal"]').first()
  ).toBeVisible({ timeout: 6_000 });
});

// ══════════════════════════════════════════════════════════════════════════════
// Ruta protegida
// ══════════════════════════════════════════════════════════════════════════════

test('D-14 · Acceso al dashboard sin autenticación redirige a la raíz (/)', async ({ page }) => {
  await page.route(`${API}/verifyToken`, (route) =>
    route.fulfill({ status: 401, json: { error: 'Unauthorized' } })
  );

  await page.goto('/dashboard');

  await expect(page).toHaveURL('/', { timeout: 10_000 });
});
