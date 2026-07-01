/**
 * Caja negra — Autenticación y registro de usuarios.
 * Cubre CP-01 .. CP-07 (RF-1, RF-2, RF-3, RF-4, RNF-5).
 */
import { test, expect } from '@playwright/test';
import { readSeed, SEED_PASSWORD } from './setup/seedStore';
import { CONFIG } from './setup/env';
import { getVerificationCode, closeRedis } from './setup/redisClient';
import { userExistsByEmail, deleteUserByEmail, closePool } from './setup/db';
import { uniqueName } from './setup/helpers';

let seed: ReturnType<typeof readSeed>;
const creados: string[] = []; // emails a limpiar

test.beforeAll(() => {
  seed = readSeed();
});

test.afterAll(async () => {
  for (const email of creados) await deleteUserByEmail(email);
  await closePool();
  await closeRedis();
});

// ── CP-01 ──────────────────────────────────────────────────────────────
test('CP-01 · Login con credenciales correctas devuelve usuario y token [RF-1, RNF-5]', async ({ request }) => {
  const res = await request.post('/api/login', {
    data: { email: seed.alumno.email, password: SEED_PASSWORD },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.accessToken, 'debe emitir access token').toBeTruthy();
  expect(body.user.email).toBe(seed.alumno.email);
  expect(body.user.rol).toBe('Alumno');
  // F-01/F-02: nunca se expone el hash de la contraseña
  expect(body.user.password).toBeUndefined();
});

// ── CP-02 ──────────────────────────────────────────────────────────────
test('CP-02 · Login con credenciales incorrectas es rechazado [RF-1, RNF-5]', async ({ request }) => {
  const passMal = await request.post('/api/login', {
    data: { email: seed.alumno.email, password: 'contraseñaIncorrecta' },
  });
  expect(passMal.status()).toBe(401);

  const emailMal = await request.post('/api/login', {
    data: { email: 'noexiste_' + Date.now() + '@alumnos.upm.es', password: SEED_PASSWORD },
  });
  expect(emailMal.status()).toBe(401);
});

// ── CP-03 ──────────────────────────────────────────────────────────────
test('CP-03 · Registro con correo no institucional no se acepta [RF-1, RF-2]', async ({ request }) => {
  const email = `externo_${Date.now()}@gmail.com`;
  let status = 0;
  try {
    const res = await request.post('/api/signup', {
      data: { name: 'Ext', lastname: 'Erno', email, password: SEED_PASSWORD },
      timeout: 6000,
    });
    status = res.status();
  } catch {
    status = 0; // sin respuesta: el back no completa el registro
  }
  creados.push(email);
  expect(status, 'un dominio no institucional no debe producir alta (200)').not.toBe(200);
  expect(await userExistsByEmail(email)).toBe(false);
});

// ── CP-04 ──────────────────────────────────────────────────────────────
test('CP-04 · Confirmación de contraseña no coincidente [RF-2]', async () => {
  // El backend no recibe campo de "confirmar contraseña": la validación de
  // que ambas contraseñas coinciden es responsabilidad del cliente (front).
  // No hay endpoint que ejercitar en caja negra del back.
  test.skip(true, 'CP-04 es validación de cliente; el back no recibe confirmación de contraseña.');
});

// ── CP-05 ──────────────────────────────────────────────────────────────
test('CP-05 · El rol se asigna según el dominio del correo [RF-3]', async ({ request }) => {
  // Dominio de profesor -> rol Profesor
  const emailProf = `cp05_${uniqueName('prof')}${CONFIG.dominioProfesor}`;
  creados.push(emailProf);
  await registrarUsuario(request, { email: emailProf, name: 'Rol', lastname: 'Profe' });
  expect(await rolEnBD(emailProf)).toBe('Profesor');

  // Dominio de alumno -> rol Alumno
  const emailAlu = `cp05_${uniqueName('alu')}${CONFIG.dominioAlumno}`;
  creados.push(emailAlu);
  await registrarUsuario(request, { email: emailAlu, name: 'Rol', lastname: 'Alum' });
  expect(await rolEnBD(emailAlu)).toBe('Alumno');
});

// ── CP-06 ──────────────────────────────────────────────────────────────
test('CP-06 · Verificación con código correcto da de alta y elimina el código [RF-2, RF-4]', async ({ request }) => {
  const email = `cp06_${uniqueName('alu')}${CONFIG.dominioAlumno}`;
  creados.push(email);

  const signup = await request.post('/api/signup', {
    data: { name: 'Ver', lastname: 'Ifica', email, password: SEED_PASSWORD },
  });
  expect(signup.status()).toBe(200);

  const code = await getVerificationCode(email);
  expect(code, 'el código debe estar en Redis tras el signup').toBeTruthy();

  const verify = await request.post('/api/verifyCode', {
    data: { email, verificationCode: code, name: 'Ver', lastname: 'Ifica', password: SEED_PASSWORD },
  });
  expect(verify.status()).toBe(200);

  // Efecto: usuario dado de alta y código destruido
  expect(await userExistsByEmail(email)).toBe(true);
  expect(await getVerificationCode(email)).toBeNull();
});

// ── CP-07 ──────────────────────────────────────────────────────────────
test('CP-07 · Verificación con código incorrecto es rechazada [RF-4]', async ({ request }) => {
  const email = `cp07_${uniqueName('alu')}${CONFIG.dominioAlumno}`;
  creados.push(email);

  const signup = await request.post('/api/signup', {
    data: { name: 'Cod', lastname: 'Malo', email, password: SEED_PASSWORD },
  });
  expect(signup.status()).toBe(200);

  const verify = await request.post('/api/verifyCode', {
    data: { email, verificationCode: '000000', name: 'Cod', lastname: 'Malo', password: SEED_PASSWORD },
  });
  expect(verify.status()).toBe(400);
  // No debe haberse creado el usuario con un código inválido
  expect(await userExistsByEmail(email)).toBe(false);
});

// ── helpers locales ──────────────────────────────────────────────────────
async function registrarUsuario(
  request: import('@playwright/test').APIRequestContext,
  u: { email: string; name: string; lastname: string },
) {
  const signup = await request.post('/api/signup', {
    data: { name: u.name, lastname: u.lastname, email: u.email, password: SEED_PASSWORD },
  });
  expect(signup.status(), `signup de ${u.email}`).toBe(200);
  const code = await getVerificationCode(u.email);
  expect(code).toBeTruthy();
  const verify = await request.post('/api/verifyCode', {
    data: { email: u.email, verificationCode: code, name: u.name, lastname: u.lastname, password: SEED_PASSWORD },
  });
  expect(verify.status(), `verifyCode de ${u.email}`).toBe(200);
}

async function rolEnBD(email: string): Promise<string | null> {
  const { getPool } = await import('./setup/db');
  const [rows] = await getPool().execute('SELECT rol FROM usuario WHERE email = ?', [email]);
  const list = rows as Array<{ rol: string }>;
  return list.length ? list[0].rol : null;
}
