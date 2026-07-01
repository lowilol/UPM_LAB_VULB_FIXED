/**
 * Prueba END-TO-END de envío de correo real.
 *
 * A diferencia del resto de la suite (que usa direcciones ficticias), este
 * spec envía correos a una dirección REAL para verificar que el envío SMTP
 * funciona de extremo a extremo. El destinatario se configura con
 * TEST_REAL_EMAIL (por defecto: louanas.meziane@alumnos.upm.es).
 *
 * Cubre los dos flujos que envían correo al usuario:
 *   E2E-01: /api/signup            -> correo con el código de verificación
 *   E2E-02: /api/requestPasswordReset -> correo con el enlace de recuperación
 *
 * Tras ejecutarlo, revisa la bandeja de entrada (y la carpeta de spam) de la
 * dirección configurada. La consola muestra también el código generado.
 *
 * Nota: envía correos reales en cada ejecución. Para lanzar SOLO este spec:
 *   npm run test:email
 */
import { test, expect } from '@playwright/test';
import { CONFIG } from './setup/env';
import { SEED_PASSWORD } from './setup/seedStore';
import { seedUser, deleteUserByEmail, closePool } from './setup/db';
import { getVerificationCode, closeRedis } from './setup/redisClient';

const realEmail = CONFIG.realEmail;

test.describe.serial('E2E · envío de correo real', () => {
  test.beforeAll(async () => {
    // Estado limpio: el signup falla si ya existe un usuario con ese correo.
    await deleteUserByEmail(realEmail);
  });

  test.afterAll(async () => {
    await deleteUserByEmail(realEmail);
    await closePool();
    await closeRedis();
  });

  test('E2E-01 · signup envía el código de verificación al correo real', async ({ request }) => {
    const res = await request.post('/api/signup', {
      data: {
        name: 'Louanas',
        lastname: `E2E-${Date.now()}`,
        email: realEmail,
        password: SEED_PASSWORD,
      },
    });
    expect(res.status(), 'el signup con correo UPM debe responder 200').toBe(200);

    const code = await getVerificationCode(realEmail);
    expect(code, 'el código debe quedar guardado en Redis').toBeTruthy();

    console.log(
      `\n[E2E-01] Código de verificación (${code}) enviado a ${realEmail}.` +
        `\n         -> Revisa tu bandeja de entrada y la carpeta de spam.\n`,
    );
  });

  test('E2E-02 · requestPasswordReset envía el enlace de recuperación al correo real', async ({ request }) => {
    // Para recuperar contraseña el usuario debe existir: lo sembramos.
    await seedUser({
      email: realEmail,
      password: SEED_PASSWORD,
      rol: 'Alumno',
      firstName: 'Louanas',
      lastName: 'Meziane',
      matricula: null,
    });

    const res = await request.post('/api/requestPasswordReset', {
      data: { email: realEmail },
    });
    expect(res.status(), 'la solicitud de recuperación debe responder 200').toBe(200);

    console.log(
      `\n[E2E-02] Correo de recuperación enviado a ${realEmail}.` +
        `\n         -> Revisa tu bandeja de entrada y la carpeta de spam.\n`,
    );
  });
});
