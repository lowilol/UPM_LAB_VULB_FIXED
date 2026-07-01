/**
 * Cliente Redis para leer el código de verificación que el servidor guarda
 * en `verification:<email>` (ver auth/verify.js -> saveVerificationCode).
 * Necesario para CP-06 (verificación con código correcto).
 */
import Redis from 'ioredis';
import { CONFIG } from './env';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis({
      host: CONFIG.redis.host,
      port: CONFIG.redis.port,
      db: 0,
      lazyConnect: false,
      maxRetriesPerRequest: 2,
    });
  }
  return client;
}

export async function getVerificationCode(email: string): Promise<string | null> {
  return getRedis().get(`verification:${email}`);
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit().catch(() => {});
    client = null;
  }
}
