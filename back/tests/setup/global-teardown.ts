/**
 * Global teardown: elimina los usuarios sembrados y cierra conexiones.
 */
import { deleteUserByEmail, closePool } from './db';
import { SEED_EMAILS } from './seedStore';
import { closeRedis } from './redisClient';

export default async function globalTeardown() {
  try {
    await deleteUserByEmail(SEED_EMAILS.alumno);
    await deleteUserByEmail(SEED_EMAILS.profesor);
    console.log('[teardown] Usuarios de prueba eliminados.');
  } catch (e) {
    console.warn('[teardown] No se pudieron limpiar los usuarios de prueba:', e);
  } finally {
    await closePool();
    await closeRedis();
  }
}
