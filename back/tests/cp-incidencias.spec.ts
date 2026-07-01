/**
 * Caja negra — Tratamiento de incidencias.
 * Cubre CP-26 .. CP-27 (RF-26, RF-27, RF-28).
 */
import { test, expect } from '@playwright/test';
import { readSeed } from './setup/seedStore';
import { mintAccessToken } from './setup/tokens';
import { authHeader, createLab } from './setup/helpers';
import { deleteLabById, closePool } from './setup/db';
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

// ── CP-26 ──────────────────────────────────────────────────────────────
test('CP-26 · Registro de incidencia asociada a un laboratorio [RF-26, RF-27]', async ({ request }) => {
  // Laboratorio sin turnos => el endpoint no dispara correos a profesorado.
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);

  const res = await request.post('/api/incidencia/laboratorio', {
    headers: authHeader(profToken),
    data: {
      id_laboratorio: lab.id_laboratorio,
      incidencia: 'Proyector averiado',
      descripcion_incidencia: 'El proyector del aula no enciende.',
      id_user: seed.profesor.id,
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.incidencia?.id_incidencia).toBeTruthy();
  expect(body.incidencia.id_laboratorio).toBe(lab.id_laboratorio);
});

// ── CP-27 ──────────────────────────────────────────────────────────────
test('CP-27 · Resolución/eliminación de incidencia actualiza su estado [RF-28]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);

  const crear = await request.post('/api/incidencia/laboratorio', {
    headers: authHeader(profToken),
    data: {
      id_laboratorio: lab.id_laboratorio,
      incidencia: 'Equipo a reparar',
      descripcion_incidencia: 'PC 3 sin arrancar.',
      id_user: seed.profesor.id,
    },
  });
  expect(crear.status()).toBe(201);
  const idIncidencia = (await crear.json()).incidencia.id_incidencia;

  const del = await request.delete(`/api/incidencia/laboratorio/${idIncidencia}`, {
    headers: authHeader(profToken),
  });
  expect(del.status()).toBe(200);

  // Eliminar de nuevo debe indicar que ya no existe.
  const otra = await request.delete(`/api/incidencia/laboratorio/${idIncidencia}`, {
    headers: authHeader(profToken),
  });
  expect(otra.status()).toBe(404);
});
