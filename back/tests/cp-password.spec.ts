/**
 * Caja negra — Recuperación de contraseña.
 * Cubre CP-08 .. CP-11 (RF-19, RF-20).
 */
import { test, expect } from '@playwright/test';
import { readSeed, SEED_PASSWORD } from './setup/seedStore';
import { CONFIG } from './setup/env';
import { seedUser, deleteUserByEmail, closePool, SeededUser } from './setup/db';
import { closeRedis } from './setup/redisClient';
import { mintResetToken, mintExpiredResetToken } from './setup/tokens';
import { uniqueName } from './setup/helpers';

let seed: ReturnType<typeof readSeed>;
let userReset: SeededUser; // usuario dedicado para CP-10
let userExpira: SeededUser; // usuario dedicado para CP-11

test.beforeAll(async () => {
  seed = readSeed();
  userReset = await seedUser({
    email: `cp10_${uniqueName('u')}${CONFIG.dominioProfesor}`,
    password: SEED_PASSWORD,
    rol: 'Profesor',
    firstName: 'Reset',
    lastName: 'Valido',
    departamento: '1102',
  });
  userExpira = await seedUser({
    email: `cp11_${uniqueName('u')}${CONFIG.dominioProfesor}`,
    password: SEED_PASSWORD,
    rol: 'Profesor',
    firstName: 'Reset',
    lastName: 'Caducado',
    departamento: '1102',
  });
});

test.afterAll(async () => {
  await deleteUserByEmail(userReset.email);
  await deleteUserByEmail(userExpira.email);
  await closePool();
  await closeRedis();
});

// ── CP-08 ──────────────────────────────────────────────────────────────
test('CP-08 · Solicitud de recuperación con correo existente [RF-19, RF-20]', async ({ request }) => {
  const res = await request.post('/api/requestPasswordReset', {
    data: { email: seed.alumno.email },
  });
  expect(res.status()).toBe(200);
});

// ── CP-09 ──────────────────────────────────────────────────────────────
test('CP-09 · Solicitud de recuperación con correo inexistente se gestiona sin fallo [RF-19]', async ({ request }) => {
  const res = await request.post('/api/requestPasswordReset', {
    data: { email: `nadie_${Date.now()}@upm.es` },
  });
  expect(res.status()).toBe(404); // correo no encontrado, sin error 500
});

// ── CP-10 ──────────────────────────────────────────────────────────────
test('CP-10 · Restablecimiento con token válido actualiza la contraseña [RF-20]', async ({ request }) => {
  const token = mintResetToken(userReset);
  const nueva = 'NuevaClave#2026';

  const res = await request.post(`/api/resetPassword/${token}`, {
    data: { newPassword: nueva },
  });
  expect(res.status()).toBe(200);

  // Verificación de efecto (caja negra): la nueva contraseña permite iniciar sesión.
  const login = await request.post('/api/login', {
    data: { email: userReset.email, password: nueva },
  });
  expect(login.status(), 'el login con la nueva contraseña debe funcionar').toBe(200);
});

// ── CP-11 ──────────────────────────────────────────────────────────────
test('CP-11 · Restablecimiento con token caducado es rechazado [RF-20]', async ({ request }) => {
  const tokenCaducado = mintExpiredResetToken(userExpira);

  const res = await request.post(`/api/resetPassword/${tokenCaducado}`, {
    data: { newPassword: 'NoDeberiaAplicarse#1' },
  });
  expect(res.status(), 'un token caducado no debe permitir el cambio').toBeGreaterThanOrEqual(400);

  // La contraseña original sigue siendo válida.
  const login = await request.post('/api/login', {
    data: { email: userExpira.email, password: SEED_PASSWORD },
  });
  expect(login.status()).toBe(200);
});
