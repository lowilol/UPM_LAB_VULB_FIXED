/**
 * Global setup: comprueba que el servidor responde y siembra los usuarios
 * de prueba (un Alumno y un Profesor) con contraseña conocida.
 */
import { request } from '@playwright/test';
import { CONFIG } from './env';
import { seedUser, closePool } from './db';
import { writeSeed, SEED_EMAILS, SEED_PASSWORD } from './seedStore';
import { closeRedis } from './redisClient';

async function pingServer(): Promise<void> {
  const ctx = await request.newContext({ baseURL: CONFIG.baseURL });
  try {
    // /api/verifyToken sin cookie debe responder 401 (servidor vivo).
    const res = await ctx.post('/api/verifyToken');
    if (res.status() === 0) throw new Error('sin respuesta');
    console.log(`[setup] Servidor accesible en ${CONFIG.baseURL} (verifyToken -> ${res.status()})`);
  } catch (e) {
    throw new Error(
      `[setup] No se pudo contactar con el backend en ${CONFIG.baseURL}. ` +
        `Arráncalo con \`npm run dev\` (o \`npm start\`) antes de lanzar las pruebas.`,
    );
  } finally {
    await ctx.dispose();
  }
}

export default async function globalSetup() {
  await pingServer();

  const alumno = await seedUser({
    email: SEED_EMAILS.alumno,
    password: SEED_PASSWORD,
    rol: 'Alumno',
    firstName: 'Ana',
    lastName: 'TestAlumno',
    matricula: null,
  });

  const profesor = await seedUser({
    email: SEED_EMAILS.profesor,
    password: SEED_PASSWORD,
    rol: 'Profesor',
    firstName: 'Pablo',
    lastName: 'TestProfesor',
    departamento: '1102',
  });

  writeSeed({ alumno, profesor });
  console.log(
    `[setup] Sembrados Alumno(id=${alumno.id}) y Profesor(id=${profesor.id}).`,
  );

  await closePool();
  await closeRedis();
}
