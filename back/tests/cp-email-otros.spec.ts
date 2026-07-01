/**
 * Pruebas END-TO-END del RESTO de correos del sistema (aparte de la
 * verificación de registro y la recuperación de contraseña, ya cubiertas en
 * cp-email-e2e.spec.ts).
 *
 * Puntos de envío cubiertos:
 *   E2E-03  POST   /api/incidencia/laboratorio   -> profesor del laboratorio
 *   E2E-04  POST   /api/incidencia/turno         -> alumnos con reserva
 *   E2E-05  DELETE /api/turno/:idProf/:idTurno   -> alumnos (turno cancelado)
 *   E2E-06  PUT    /api/turno/:idProf/:idTurno   -> alumnos (turno actualizado)
 *   E2E-07  POST   /api/laboratorio/deshabilitar -> TODO el profesorado (*)
 *   E2E-08  POST   /api/laboratorio/habilitar    -> TODO el profesorado (*)
 *   E2E-09  DELETE /api/laboratorio/:idXuser     -> TODO el profesorado (*)
 *
 * En cada caso el destinatario relevante se siembra con el correo real
 * (CONFIG.realEmail) para poder comprobar la recepción.
 *
 * (*) Los avisos de laboratorio se envían a TODOS los profesores de la BD, no
 * solo al de prueba. Para no molestar a profesores reales, E2E-07/08/09 están
 * DESACTIVADOS por defecto; actívalos con RUN_BROADCAST_EMAIL=1 solo si tu BD
 * no contiene profesores reales.
 */
import { test, expect } from '@playwright/test';
import { CONFIG } from './setup/env';
import { readSeed } from './setup/seedStore';
import { mintAccessToken, authHeader } from './setup/tokens';
import { createLab, createTurno, createReserva, futureDate } from './setup/helpers';
import {
  seedUser,
  deleteUserByEmail,
  deleteLabById,
  setLabDeshabilitado,
  closePool,
  SeededUser,
} from './setup/db';
import { closeRedis } from './setup/redisClient';

const realEmail = CONFIG.realEmail;
const correrBroadcast = process.env.RUN_BROADCAST_EMAIL === '1';

let seed: ReturnType<typeof readSeed>;
let profTestToken: string; // profesor de prueba global (para crear turnos/labs)
const labsCreados: number[] = [];

test.describe.serial('E2E · resto de correos del sistema', () => {
  test.beforeAll(() => {
    seed = readSeed();
    profTestToken = mintAccessToken(seed.profesor);
  });

  test.afterAll(async () => {
    for (const id of labsCreados) await deleteLabById(id);
    await deleteUserByEmail(realEmail);
    await closePool();
    await closeRedis();
  });

  // Siembra el correo real como Profesor y devuelve su usuario + token.
  async function profesorReal(): Promise<{ user: SeededUser; token: string }> {
    await deleteUserByEmail(realEmail);
    const user = await seedUser({
      email: realEmail,
      password: 'Passw0rd!Test',
      rol: 'Profesor',
      firstName: 'Louanas',
      lastName: 'Meziane',
      departamento: '1102',
    });
    return { user, token: mintAccessToken(user) };
  }

  // Siembra el correo real como Alumno y devuelve su usuario.
  async function alumnoReal(): Promise<SeededUser> {
    await deleteUserByEmail(realEmail);
    return seedUser({
      email: realEmail,
      password: 'Passw0rd!Test',
      rol: 'Alumno',
      firstName: 'Louanas',
      lastName: 'Meziane',
      matricula: null,
    });
  }

  // ── E2E-03 ────────────────────────────────────────────────────────────
  test('E2E-03 · incidencia de laboratorio notifica al profesor (correo real)', async ({ request }) => {
    const { user: prof, token } = await profesorReal();
    const lab = await createLab(request, token);
    labsCreados.push(lab.id_laboratorio);
    // El turno del laboratorio lo imparte el profesor real -> recibirá el aviso.
    await createTurno(request, token, { labId: lab.id_laboratorio, profId: prof.id });

    const res = await request.post('/api/incidencia/laboratorio', {
      headers: authHeader(token),
      data: {
        id_laboratorio: lab.id_laboratorio,
        incidencia: 'Proyector averiado (E2E)',
        descripcion_incidencia: 'Prueba de envío de correo de incidencia de laboratorio.',
        id_user: prof.id,
      },
    });
    expect(res.status()).toBe(201);
    console.log(`\n[E2E-03] Aviso de incidencia de laboratorio enviado a ${realEmail}.\n`);
  });

  // ── E2E-04 ────────────────────────────────────────────────────────────
  test('E2E-04 · incidencia de turno notifica al alumno con reserva (correo real)', async ({ request }) => {
    const alu = await alumnoReal();
    const lab = await createLab(request, profTestToken);
    labsCreados.push(lab.id_laboratorio);
    const turno = await createTurno(request, profTestToken, {
      labId: lab.id_laboratorio,
      profId: seed.profesor.id,
    });
    await createReserva(request, turno.id_turno, alu.id);

    const res = await request.post('/api/incidencia/turno', {
      headers: authHeader(profTestToken),
      data: {
        id_turno: turno.id_turno,
        incidencia: 'Cambio de aula (E2E)',
        descripcion_incidencia: 'Prueba de envío de correo de incidencia de turno.',
      },
    });
    expect(res.status()).toBe(201);
    console.log(`\n[E2E-04] Aviso de incidencia de turno enviado a ${realEmail}.\n`);
  });

  // ── E2E-05 ────────────────────────────────────────────────────────────
  test('E2E-05 · cancelación de turno notifica al alumno con reserva (correo real)', async ({ request }) => {
    const alu = await alumnoReal();
    const lab = await createLab(request, profTestToken);
    labsCreados.push(lab.id_laboratorio);
    const turno = await createTurno(request, profTestToken, {
      labId: lab.id_laboratorio,
      profId: seed.profesor.id,
      fecha: futureDate(12),
    });
    await createReserva(request, turno.id_turno, alu.id);

    const res = await request.delete(`/api/turno/${seed.profesor.id}/${turno.id_turno}`, {
      headers: authHeader(profTestToken),
    });
    expect(res.status()).toBe(200);
    console.log(`\n[E2E-05] Aviso de cancelación de turno enviado a ${realEmail}.\n`);
  });

  // ── E2E-06 ────────────────────────────────────────────────────────────
  test('E2E-06 · actualización de turno notifica al alumno con reserva (correo real)', async ({ request }) => {
    const alu = await alumnoReal();
    const lab = await createLab(request, profTestToken);
    labsCreados.push(lab.id_laboratorio);
    const turno = await createTurno(request, profTestToken, {
      labId: lab.id_laboratorio,
      profId: seed.profesor.id,
      fecha: futureDate(13),
      hora_inicio: '09:00',
      hora_fin: '11:00',
    });
    await createReserva(request, turno.id_turno, alu.id);

    const res = await request.put(`/api/turno/${seed.profesor.id}/${turno.id_turno}`, {
      headers: authHeader(profTestToken),
      data: { hora_inicio: '12:00', hora_fin: '14:00' },
    });
    expect(res.status()).toBe(200);
    console.log(`\n[E2E-06] Aviso de actualización de turno enviado a ${realEmail}.\n`);
  });

  // ── E2E-07 (broadcast) ─────────────────────────────────────────────────
  test('E2E-07 · deshabilitar laboratorio notifica al profesorado (correo real)', async ({ request }) => {
    test.skip(!correrBroadcast, 'Envía a TODO el profesorado. Activa con RUN_BROADCAST_EMAIL=1.');
    const { user: prof, token } = await profesorReal();
    const lab = await createLab(request, token);
    labsCreados.push(lab.id_laboratorio);

    const res = await request.post(`/api/laboratorio/deshabilitar/${lab.id_laboratorio}`, {
      headers: authHeader(token),
      data: { id_user: prof.id },
    });
    expect(res.status()).toBe(200);
    console.log(`\n[E2E-07] Aviso de deshabilitación enviado al profesorado (incluye ${realEmail}).\n`);
  });

  // ── E2E-08 (broadcast) ─────────────────────────────────────────────────
  test('E2E-08 · habilitar laboratorio notifica al profesorado (correo real)', async ({ request }) => {
    test.skip(!correrBroadcast, 'Envía a TODO el profesorado. Activa con RUN_BROADCAST_EMAIL=1.');
    const { user: prof, token } = await profesorReal();
    const lab = await createLab(request, token);
    labsCreados.push(lab.id_laboratorio);
    await setLabDeshabilitado(lab.id_laboratorio, true); // requisito para habilitar

    const res = await request.post(`/api/laboratorio/habilitar/${lab.id_laboratorio}`, {
      headers: authHeader(token),
      data: { id_user: prof.id },
    });
    expect(res.status()).toBe(200);
    console.log(`\n[E2E-08] Aviso de habilitación enviado al profesorado (incluye ${realEmail}).\n`);
  });

  // ── E2E-09 (broadcast) ─────────────────────────────────────────────────
  test('E2E-09 · eliminar laboratorio notifica al profesorado (correo real)', async ({ request }) => {
    test.skip(!correrBroadcast, 'Envía a TODO el profesorado. Activa con RUN_BROADCAST_EMAIL=1.');
    const { user: prof, token } = await profesorReal();
    const lab = await createLab(request, token);
    labsCreados.push(lab.id_laboratorio);

    // La ruta recibe "<id_laboratorio>X<id_user>" como único parámetro.
    const res = await request.delete(`/api/laboratorio/${lab.id_laboratorio}X${prof.id}`, {
      headers: authHeader(token),
    });
    expect(res.status()).toBe(200);
    console.log(`\n[E2E-09] Aviso de eliminación enviado al profesorado (incluye ${realEmail}).\n`);
  });
});
