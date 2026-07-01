import { Page } from '@playwright/test';

// ─────────────────────────────────────────────
// Base de las rutas API a interceptar.
//
// El front llama a rutas relativas (/api/...), que el navegador resuelve
// contra el origen del dev server (localhost:3000). Por eso los mocks deben
// apuntar a localhost:3000, NO a :4000 (el backend real nunca se llama en test).
// ─────────────────────────────────────────────
export const API = 'http://localhost:3000/api';

// ─────────────────────────────────────────────
// Mock: verifyToken devuelve 401 → usuario NO autenticado
// ─────────────────────────────────────────────
export async function mockUnauthenticated(page: Page) {
  await page.route(`${API}/verifyToken`, (route) =>
    route.fulfill({ status: 401, json: { error: 'Unauthorized' } })
  );
}

// ─────────────────────────────────────────────
// Mock: verifyToken devuelve 200 → usuario autenticado
// ─────────────────────────────────────────────
export async function mockAuthenticated(
  page: Page,
  rol: 'Alumno' | 'Profesor' | 'PAS' = 'Alumno',
  id = 1
) {
  const user = buildUser(rol, id);

  await page.route(`${API}/verifyToken`, (route) =>
    route.fulfill({ status: 200, json: { user } })
  );

  // Inyectar sessionStorage y cookie antes de navegar
  await page.addInitScript(
    ({ userJson }) => {
      sessionStorage.setItem('user', userJson);
    },
    { userJson: JSON.stringify(user) }
  );

  // Cookie de access_token (valor ficticio)
  await page.context().addCookies([
    {
      name: 'access_token',
      value: 'fake-jwt-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

// ─────────────────────────────────────────────
// Mock: dashboard endpoint (POST /api/dashboard)
//
// BUG CORREGIDO: se usaba "publicUser" pero dashboard.jsx
// lee data.user (setUsuario(data.user))
// ─────────────────────────────────────────────
export async function mockDashboard(page: Page, rol: 'Alumno' | 'Profesor' | 'PAS' = 'Alumno') {
  const user = buildUser(rol);
  await page.route(`${API}/dashboard`, (route) =>
    route.fulfill({ status: 200, json: { user, missingData: false } })
  );
}

// ─────────────────────────────────────────────
// Construye un objeto usuario simulado
//
// BUG CORREGIDO: se devolvía la estructura anidada Sequelize
// { dataValues: { ... } } pero dashboard.jsx y profile.jsx
// acceden a los campos directamente (userData.rol, userData.FirstName…)
// ─────────────────────────────────────────────
export function buildUser(rol: 'Alumno' | 'Profesor' | 'PAS', id = 1) {
  return {
    id_user: id,
    FirstName: 'Juan',
    LastName: 'García',
    email: 'juan@alumnos.upm.es',
    rol,
    specificData: rol === 'Alumno' ? '12345678A' : 'Informática',
  };
}
