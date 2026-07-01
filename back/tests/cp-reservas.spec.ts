/**
 * Caja negra — Gestión de reservas del alumno.
 * Cubre CP-12 .. CP-17 (RF-5, RF-6, RF-7, RF-8).
 */
import { test, expect } from '@playwright/test';
import { readSeed } from './setup/seedStore';
import { mintAccessToken } from './setup/tokens';
import { authHeader, createLab, createTurno, createReserva, futureDate } from './setup/helpers';
import { insertTurno, deleteLabById, closePool } from './setup/db';
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

// ── CP-12 ──────────────────────────────────────────────────────────────
test('CP-12 · El listado de turnos expone los datos para filtrar [RF-5]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, { labId: lab.id_laboratorio, profId: seed.profesor.id });

  const res = await request.get('/api/turno', { headers: authHeader(profToken) });
  expect(res.status()).toBe(200);
  const turnos = await res.json();
  expect(Array.isArray(turnos)).toBe(true);

  const encontrado = turnos.find((t: any) => t.id_turno === turno.id_turno);
  expect(encontrado, 'el turno creado debe aparecer en el listado').toBeTruthy();
  // El filtrado por fecha/nombre lo hace el cliente: comprobamos que el back
  // entrega fecha y nombre de laboratorio necesarios para ello (RF-5).
  expect(encontrado.fecha).toBeTruthy();
  expect(encontrado.laboratorio?.nombre_laboratorio).toBe(lab.nombre_laboratorio);
});

// ── CP-13 ──────────────────────────────────────────────────────────────
test('CP-13 · Reserva de turno con plazas libres se confirma [RF-6]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, { labId: lab.id_laboratorio, profId: seed.profesor.id });

  const res = await request.post(`/api/reserva/${turno.id_turno}/${seed.alumno.id}`);
  expect(res.status()).toBe(201);

  // Efecto: la capacidad ocupada del turno se incrementa.
  const lista = await (await request.get('/api/turno', { headers: authHeader(profToken) })).json();
  const t = lista.find((x: any) => x.id_turno === turno.id_turno);
  expect(t.capacidad_ocupada).toBeGreaterThanOrEqual(1);
});

// ── CP-14 ──────────────────────────────────────────────────────────────
test('CP-14 · Reserva no disponible es rechazada [RF-6]', async ({ request }) => {
  // Nota: el turno no almacena su propia capacidad (solo capacidad_ocupada),
  // por lo que la rama "turno completo" no es alcanzable por API. La regla de
  // rechazo que SÍ aplica el back es impedir reservar dos veces el mismo turno.
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, { labId: lab.id_laboratorio, profId: seed.profesor.id });

  const primera = await request.post(`/api/reserva/${turno.id_turno}/${seed.alumno.id}`);
  expect(primera.status()).toBe(201);

  const repetida = await request.post(`/api/reserva/${turno.id_turno}/${seed.alumno.id}`);
  expect(repetida.status()).toBe(400);
  expect((await repetida.json()).error).toContain('ya existe');
});

// ── CP-15 ──────────────────────────────────────────────────────────────
test('CP-15 · Cancelación con antelación libera la plaza [RF-7]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, {
    labId: lab.id_laboratorio,
    profId: seed.profesor.id,
    fecha: futureDate(7), // muy por encima de 1h
  });

  await createReserva(request, turno.id_turno, seed.alumno.id);

  const cancel = await request.put(`/api/reserva/cancelar/${turno.id_turno}/${seed.alumno.id}`);
  expect(cancel.status()).toBe(200);
  const body = await cancel.json();
  expect(body.reserva.estado).toBe('Cancelada');
});

// ── CP-16 ──────────────────────────────────────────────────────────────
test('CP-16 · Cancelación fuera de plazo (<1h) es bloqueada [RF-7]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);

  // Turno que empieza dentro de 30 minutos (insertado en BD porque el endpoint
  // de creación no permite turnos tan próximos).
  const ahora = new Date();
  const inicio = new Date(ahora.getTime() + 30 * 60 * 1000);
  const fin = new Date(ahora.getTime() + 90 * 60 * 1000);
  const hhmmss = (d: Date) => d.toTimeString().split(' ')[0];
  const fecha = ahora.toISOString().split('T')[0];

  const idTurno = await insertTurno({
    labId: lab.id_laboratorio,
    profId: seed.profesor.id,
    fecha,
    hora_inicio: hhmmss(inicio),
    hora_fin: hhmmss(fin),
  });

  await createReserva(request, idTurno, seed.alumno.id);

  const cancel = await request.put(`/api/reserva/cancelar/${idTurno}/${seed.alumno.id}`);
  expect(cancel.status()).toBe(400);
  expect((await cancel.json()).error).toContain('1 hora');
});

// ── CP-17 ──────────────────────────────────────────────────────────────
test('CP-17 · Consulta del historial de reservas del alumno [RF-8]', async ({ request }) => {
  const lab = await createLab(request, profToken);
  labsCreados.push(lab.id_laboratorio);
  const turno = await createTurno(request, profToken, { labId: lab.id_laboratorio, profId: seed.profesor.id });
  await createReserva(request, turno.id_turno, seed.alumno.id);

  const res = await request.get(`/api/reserva/${seed.alumno.id}`);
  expect(res.status()).toBe(200);
  const reservas = await res.json();
  expect(Array.isArray(reservas)).toBe(true);
  expect(reservas.length).toBeGreaterThanOrEqual(1);
  expect(reservas[0].estado).toBeTruthy();
});
