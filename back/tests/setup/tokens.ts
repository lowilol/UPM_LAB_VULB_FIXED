/**
 * Minteo de tokens JWT para las pruebas.
 *
 * El backend acepta el access_token tanto por cookie HttpOnly como por
 * cabecera `Authorization: Bearer <token>` (ver auth/authenticateToken.js).
 * Para las rutas protegidas mintamos un token con el MISMO secreto y el
 * MISMO payload que produce el servidor en login (lib/getUserInfo.js):
 *     { id, email, name, rol }
 *
 * Esto permite probar las rutas protegidas de forma determinista sin depender
 * del envío de correos. Para CP-01/CP-02 (login) NO se mintea: se usa el
 * endpoint real /api/login con credenciales sembradas.
 */
import jwt from 'jsonwebtoken';
import { CONFIG } from './env';
import type { SeededUser } from './db';

export function mintAccessToken(user: SeededUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      rol: user.rol,
    },
    CONFIG.accessTokenSecret,
    { expiresIn: '1h', algorithm: 'HS256' },
  );
}

/** Token de reseteo válido (CP-10). El payload imita getUserInfo. */
export function mintResetToken(user: SeededUser, expiresIn: string | number = '1h'): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      rol: user.rol,
    },
    CONFIG.resetPasswordSecret,
    { expiresIn, algorithm: 'HS256' },
  );
}

/** Token de reseteo ya caducado (CP-11). */
export function mintExpiredResetToken(user: SeededUser): string {
  // expiresIn negativo => emitido en el pasado y ya vencido.
  return mintResetToken(user, -10);
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
