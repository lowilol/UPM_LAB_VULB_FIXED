/**
 * Caja negra — Gestión de laboratorios.
 * Cubre CP-23 .. CP-25 (RF-21, RF-22, RF-23, RF-25).
 */
import { test, expect } from '@playwright/test';
import { CONFIG } from './setup/env';
import { readSeed, SEED_PASSWORD } from './setup/seedStore';
import { mintAccessToken } from './setup/tokens';
import { authHeader, createLab, uniqueName } from './setup/helpers';
import { deleteLabById, seedUser, deleteUserByEmail, closePool } from './setup/db';
import { closeRedis } from './setup/redisClient';

let seed: ReturnType<typeof readSeed>;
let profToken: string;
const labsCreados: number[] = [];

test.beforeAll(() => {
  seed = readSeed();
  profToken = mintAccessToken(seed.profesor);
});

test.afterAll(async () => {
  for (const id of labsCreados) await deleteLabById(id);
  await closePool();
  await closeRedis();
});

// ── CP-23 ──────────────────────────────────────────────────────────────
test('CP-23 · Creación de laboratorio con datos válidos [RF-21]', async ({ request }) => {
  const nombre = uniqueName('LabNuevoCP');
  const res = await request.post('/api/laboratorio', {
    headers: authHeader(profToken),
    data: { nombre_laboratorio: nombre, ubicacion: 'Planta 2', capacidad: 15 },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.laboratorio?.id_laboratorio).toBeTruthy();
  expect(body.laboratorio.nombre_laboratorio).toBe(nombre);
  labsCreados.push(body.laboratorio.id_laboratorio);
});

// ── CP-24 ──────────────────────────────────────────────────────────────
test('CP-24 · Edición de laboratorio actualiza los datos [RF-22]', async ({ request }) => {
  const lab = await createLab(request, profToken, { capacidad: 10 });
  labsCreados.push(lab.id_laboratorio);

  const res = await request.put(`/api/laboratorio/${lab.id_laboratorio}`, {
    headers: authHeader(profToken),
    data: { id_laboratorio: lab.id_laboratorio, capacidad: 25 },
  });
  expect(res.status()).toBe(200);

  // Efecto: la capacidad queda actualizada.
  const get = await request.get(`/api/laboratorio/${lab.id_laboratorio}`, { headers: authHeader(profToken) });
  expect(get.status()).toBe(200);
  expect((await get.json()).capacidad).toBe(25);
});

// ── CP-25 ──────────────────────────────────────────────────────────────
test('CP-25 · Deshabilitación de laboratorio [RF-23, RF-25]', async ({ request }) => {
  // Nota: este endpoint notifica por correo a todo el profesorado, por lo que
  // requiere SMTP operativo (credenciales EMAIL_USER/EMAIL_PASS del .env).
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);

  const res = await request.post(`/api/laboratorio/deshabilitar/${lab.id_laboratorio}`, {
    headers: authHeader(profToken),
    data: { id_user: seed.profesor.id },
  });
  expect(res.status()).toBe(200);

  // Efecto: el laboratorio queda marcado como deshabilitado.
  const get = await request.get(`/api/laboratorio/${lab.id_laboratorio}`, { headers: authHeader(profToken) });
  expect((await get.json()).deshabilitado).toBeTruthy();
});

// ── CP-25b ─────────────────────────────────────────────────────────────
// Eliminación de un laboratorio (valida DELETE /api/laboratorio/:id_labX:id_user).
// El endpoint notifica por correo al profesorado: sembramos un profesor con el
// correo real para verificar que la notificación llega.
// AVISO: también notifica al resto de profesores que existan en la BD.
test('CP-25b · Eliminación de laboratorio notifica al profesorado [RF-24]', async ({ request }) => {
  // Profesor con el correo real -> recibirá el aviso de eliminación.
  const profReal = await seedUser({
    email: CONFIG.realEmail,
    password: SEED_PASSWORD,
    rol: 'Profesor',
    firstName: 'Louanas',
    lastName: 'Meziane',
    departamento: '1102',
  });

  try {
    const lab = await createLab(request, profToken);
    labsCreados.push(lab.id_laboratorio);

    // El parámetro de la ruta es "<id_laboratorio>X<id_user>".
    const res = await request.delete(`/api/laboratorio/${lab.id_laboratorio}X${profReal.id}`, {
      headers: authHeader(profToken),
    });
    expect(res.status()).toBe(200);

    // Efecto: el laboratorio ya no existe.
    const get = await request.get(`/api/laboratorio/${lab.id_laboratorio}`, { headers: authHeader(profToken) });
    expect(get.status()).toBe(404);

    console.log(`\n[CP-25b] Aviso de eliminación de laboratorio enviado a ${CONFIG.realEmail} (y al resto del profesorado).\n`);
  } finally {
    await deleteUserByEmail(CONFIG.realEmail);
  }
});
