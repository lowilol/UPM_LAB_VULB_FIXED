/**
 * Almacén del estado sembrado (seed) que comparten global-setup y los specs.
 * Se persiste en un JSON temporal porque global-setup corre en un proceso
 * distinto al de los tests.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { SeededUser } from './db';

export interface SeedData {
  alumno: SeededUser;
  profesor: SeededUser;
}

const SEED_PATH = path.resolve(__dirname, '../.tmp/seed.json');

// Emails deterministas (facilita la limpieza entre ejecuciones).
export const SEED_EMAILS = {
  alumno: 'cp.alumno.test@alumnos.upm.es',
  profesor: 'cp.profesor.test@upm.es',
};

export const SEED_PASSWORD = 'Passw0rd!Test';

export function writeSeed(data: SeedData): void {
  fs.mkdirSync(path.dirname(SEED_PATH), { recursive: true });
  fs.writeFileSync(SEED_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function readSeed(): SeedData {
  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(
      '[tests] No existe seed.json. ¿Se ejecutó global-setup? Ejecuta con `npm run test:api`.',
    );
  }
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8')) as SeedData;
}
