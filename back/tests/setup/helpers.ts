/**
 * Helpers de alto nivel para los specs: fabricación de datos vía API
 * (laboratorios, turnos, reservas) y utilidades de fechas.
 */
import { APIRequestContext, expect } from '@playwright/test';
import { authHeader } from './tokens';

/** Fecha futura en formato YYYY-MM-DD (por defecto, +7 días). */
export function futureDate(daysAhead = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

/** Nombre único para evitar colisiones de "nombre_laboratorio" entre ejecuciones. */
export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

export interface Lab {
  id_laboratorio: number;
  nombre_laboratorio: string;
  ubicacion: string;
  capacidad: number;
}

export async function createLab(
  request: APIRequestContext,
  token: string,
  overrides: Partial<{ nombre_laboratorio: string; ubicacion: string; capacidad: number }> = {},
): Promise<Lab> {
  const body = {
    nombre_laboratorio: overrides.nombre_laboratorio ?? uniqueName('LabCP'),
    ubicacion: overrides.ubicacion ?? 'Edificio Test',
    capacidad: overrides.capacidad ?? 10,
  };
  const res = await request.post('/api/laboratorio', { headers: authHeader(token), data: body });
  expect(res.status(), 'creación de laboratorio de apoyo').toBe(201);
  const json = await res.json();
  return json.laboratorio as Lab;
}

export interface Turno {
  id_turno: number;
  id_laboratorio: number;
  id_profesor: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad?: number;
  capacidad_ocupada?: number;
}

export async function createTurno(
  request: APIRequestContext,
  token: string,
  args: {
    labId: number;
    profId: number;
    fecha?: string;
    hora_inicio?: string;
    hora_fin?: string;
  },
): Promise<Turno> {
  const body = {
    id_laboratorio: args.labId,
    id_user: args.profId,
    fecha: args.fecha ?? futureDate(7),
    hora_inicio: args.hora_inicio ?? '09:00',
    hora_fin: args.hora_fin ?? '11:00',
  };
  const res = await request.post('/api/turno', { headers: authHeader(token), data: body });
  expect(res.status(), 'creación de turno de apoyo').toBe(201);
  const json = await res.json();
  return json.turno as Turno;
}

export async function createReserva(
  request: APIRequestContext,
  turnoId: number,
  alumnoId: number,
): Promise<void> {
  const res = await request.post(`/api/reserva/${turnoId}/${alumnoId}`);
  expect(res.status(), 'creación de reserva de apoyo').toBe(201);
}

export { authHeader };
export { mintAccessToken, mintResetToken, mintExpiredResetToken } from './tokens';
export { readSeed, SEED_EMAILS, SEED_PASSWORD } from './seedStore';
