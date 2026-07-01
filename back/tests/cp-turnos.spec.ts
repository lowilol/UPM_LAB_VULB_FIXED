/**
 * Caja negra — Gestión de turnos por el profesor.
 * Cubre CP-18 .. CP-22 (RF-9, RF-10, RF-11, RF-12, RF-13).
 */
import { test, expect } from '@playwright/test';
import { readSeed } from './setup/seedStore';
import { mintAccessToken } from './setup/tokens';
import { authHeader, createLab, createTurno, createReserva, futureDate } from './setup/helpers';
import { deleteLabById, closePool } from './setup/db';
import { closeRedis } from './setup/redisClient';

let seed: ReturnType<typeof readSeed>;
let profToken: string;
let alumnoToken: string;
const labsCreados: number[] = [];

test.beforeAll(() => {
  seed = readSeed();
  profToken = mintAccessToken(seed.profesor);
  alumnoToken = mintAccessToken(seed.alumno);
});

test.afterAll(async () => {
  for (const id of labsCreados) await deleteLabById(id);
  await closePool();
  await closeRedis();
});

// ── CP-18 ──────────────────────────────────────────────────────────────
test('CP-18 · Creación de turno con datos válidos [RF-9]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);

  const res = await request.post('/api/turno', {
    headers: authHeader(profToken),
    data: {
      id_laboratorio: lab.id_laboratorio,
      id_user: seed.profesor.id,
      fecha: futureDate(7),
      hora_inicio: '09:00',
      hora_fin: '11:00',
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.turno?.id_turno).toBeTruthy();
});

// ── CP-19 ──────────────────────────────────────────────────────────────
test('CP-19 · Creación de turno con horario solapado es rechazada [RF-9]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const fecha = futureDate(8);

  await createTurno(request, profToken, {
    labId: lab.id_laboratorio,
    profId: seed.profesor.id,
    fecha,
    hora_inicio: '09:00',
    hora_fin: '11:00',
  });

  const solapado = await request.post('/api/turno', {
    headers: authHeader(profToken),
    data: {
      id_laboratorio: lab.id_laboratorio,
      id_user: seed.profesor.id,
      fecha,
      hora_inicio: '10:00',
      hora_fin: '12:00',
    },
  });
  expect(solapado.status()).toBe(400);
  expect((await solapado.json()).error).toContain('Conflicto');
});

// ── CP-20 ──────────────────────────────────────────────────────────────
test('CP-20 · Edición de turno existente guarda los cambios [RF-10]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, {
    labId: lab.id_laboratorio,
    profId: seed.profesor.id,
    fecha: futureDate(9),
    hora_inicio: '09:00',
    hora_fin: '11:00',
  });

  const res = await request.put(`/api/turno/${seed.profesor.id}/${turno.id_turno}`, {
    headers: authHeader(profToken),
    data: { hora_inicio: '12:00', hora_fin: '14:00' },
  });
  expect(res.status()).toBe(200);
});

// ── CP-21 ──────────────────────────────────────────────────────────────
test('CP-21 · Eliminación de turno [RF-11, RF-12]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, {
    labId: lab.id_laboratorio,
    profId: seed.profesor.id,
    fecha: futureDate(10),
  });

  const res = await request.delete(`/api/turno/${seed.profesor.id}/${turno.id_turno}`, {
    headers: authHeader(profToken),
  });
  expect(res.status()).toBe(200);

  // Efecto: ya no existe entre los turnos del profesor.
  const lista = await request.get(`/api/turno/${seed.profesor.id}`, { headers: authHeader(profToken) });
  if (lista.status() === 200) {
    const turnos = await lista.json();
    expect(turnos.find((t: any) => t.id_turno === turno.id_turno)).toBeFalsy();
  } else {
    expect(lista.status()).toBe(404); // sin turnos restantes
  }
});

// ── CP-22 ──────────────────────────────────────────────────────────────
test('CP-22 · Descarga del listado de alumnos en Excel [RF-13]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, { labId: lab.id_laboratorio, profId: seed.profesor.id });
  await createReserva(request, turno.id_turno, seed.alumno.id);

  const res = await request.get(`/api/turno/exportar-alumnos/${turno.id_turno}`, {
    headers: authHeader(profToken),
  });
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('spreadsheetml');

  // F-19: un alumno NO debe poder exportar la lista (control de rol).
  const denegado = await request.get(`/api/turno/exportar-alumnos/${turno.id_turno}`, {
    headers: authHeader(alumnoToken),
  });
  expect(denegado.status()).toBe(403);
});
