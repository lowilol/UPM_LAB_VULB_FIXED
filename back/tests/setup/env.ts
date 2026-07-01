/**
 * Carga las variables de entorno que necesitan las pruebas.
 *
 * Busca el .env en varias ubicaciones candidatas (raíz del repo y back/),
 * porque el servidor lo carga con dotenvx desde ../.env. También admite un
 * back/.env.test con overrides locales (no versionado).
 *
 * Variables usadas:
 *   - ACCESS_TOKEN_SECRET   -> mintar JWT válidos para rutas protegidas
 *   - RESET_PASSWORD_TOKEN  -> mintar tokens de reseteo (CP-10 / CP-11)
 *   - DB_*                  -> sembrar/consultar usuarios de prueba
 *   - REDIS_HOST            -> leer el código de verificación (CP-06)
 *   - API_BASE_URL          -> URL del backend (def. http://127.0.0.1:4000)
 *
 * Las variables obligatorias NO se validan al importar (para no romper la
 * fase de descubrimiento de Playwright); se validan de forma perezosa al
 * acceder a ellas (lo cual ocurre dentro de global-setup / beforeAll).
 */
import * as path from 'path';
import * as dotenv from 'dotenv';

// Candidatos en orden de prioridad (el primero que exista define cada variable).
const candidatos = [
  path.resolve(__dirname, '../../.env.test'), // back/.env.test (overrides)
  path.resolve(__dirname, '../../.env'),       // back/.env
  path.resolve(__dirname, '../../../.env'),    // raíz del repo /.env
];
for (const p of candidatos) {
  dotenv.config({ path: p }); // dotenv no sobreescribe variables ya definidas
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `[tests] Falta la variable de entorno ${name}. ` +
        `Debe estar definida en ../.env, back/.env o back/.env.test.`,
    );
  }
  return v;
}

export const CONFIG = {
  get baseURL() {
    return process.env.API_BASE_URL || 'http://127.0.0.1:4000';
  },
  get accessTokenSecret() {
    return required('ACCESS_TOKEN_SECRET');
  },
  get resetPasswordSecret() {
    return required('RESET_PASSWORD_TOKEN');
  },
  get db() {
    return {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: required('DB_USER'),
      password: process.env.DB_PASS || '',
      database: required('DB_NAME'),
    };
  },
  get redis() {
    return {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
    };
  },
  get dominioAlumno() {
    return process.env.TEST_EMAIL_DOMAIN_ALUMNO || '@alumnos.upm.es';
  },
  get dominioProfesor() {
    return process.env.TEST_EMAIL_DOMAIN_PROFESOR || '@upm.es';
  },
  // Correo real para la prueba E2E de envío (cp-email-e2e.spec.ts).
  // Configurable con TEST_REAL_EMAIL en back/.env.test.
  get realEmail() {
    return process.env.TEST_REAL_EMAIL || 'louanas.meziane@alumnos.upm.es';
  },
};
