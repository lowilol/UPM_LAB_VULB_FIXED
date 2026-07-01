/**
 * Acceso directo a MySQL para la siembra (seed) y verificación de datos.
 *
 * Aunque las pruebas son de "caja negra" a nivel de API (las ASERCIONES
 * comprueban solo respuestas HTTP), la preparación de datos y algunas
 * comprobaciones de efecto colateral (p.ej. "el usuario se ha dado de alta")
 * requieren tocar la BD real que el enunciado indica que estará levantada.
 *
 * Esquema relevante (de los modelos Sequelize):
 *   usuario(id_user PK, email, FirstName, LastName, rol, password)
 *   alumno(id_alumno PK, id_user, matricula)
 *   profesor(id_profesor PK, id_user, departamento)
 */
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { CONFIG } from './env';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: CONFIG.db.host,
      port: CONFIG.db.port,
      user: CONFIG.db.user,
      password: CONFIG.db.password,
      database: CONFIG.db.database,
      waitForConnections: true,
      connectionLimit: 4,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export interface SeededUser {
  id: number;
  email: string;
  password: string;
  rol: 'Alumno' | 'Profesor';
  firstName: string;
  lastName: string;
}

/**
 * Crea (o recrea) un usuario de prueba con contraseña conocida.
 * Devuelve el id_user real para usarlo como FK en turnos/reservas.
 */
export async function seedUser(opts: {
  email: string;
  password: string;
  rol: 'Alumno' | 'Profesor';
  firstName: string;
  lastName: string;
  matricula?: string | null;
  departamento?: string | null;
}): Promise<SeededUser> {
  const db = getPool();
  const hash = await bcrypt.hash(opts.password, 10);

  // Limpieza previa por si quedó de una ejecución anterior.
  await deleteUserByEmail(opts.email);

  const [res] = await db.execute(
    'INSERT INTO usuario (email, FirstName, LastName, rol, password) VALUES (?, ?, ?, ?, ?)',
    [opts.email, opts.firstName, opts.lastName, opts.rol, hash],
  );
  const id = (res as mysql.ResultSetHeader).insertId;

  if (opts.rol === 'Alumno') {
    await db.execute(
      'INSERT INTO alumno (id_alumno, id_user, matricula) VALUES (?, ?, ?)',
      [id, id, opts.matricula ?? null],
    );
  } else {
    await db.execute(
      'INSERT INTO profesor (id_profesor, id_user, departamento) VALUES (?, ?, ?)',
      [id, id, opts.departamento ?? null],
    );
  }

  return {
    id,
    email: opts.email,
    password: opts.password,
    rol: opts.rol,
    firstName: opts.firstName,
    lastName: opts.lastName,
  };
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const db = getPool();
  const [rows] = await db.execute('SELECT id_user FROM usuario WHERE email = ?', [email]);
  const list = rows as Array<{ id_user: number }>;
  for (const r of list) {
    await db.execute('DELETE FROM alumno WHERE id_user = ?', [r.id_user]).catch(() => {});
    await db.execute('DELETE FROM profesor WHERE id_user = ?', [r.id_user]).catch(() => {});
    await db.execute('DELETE FROM usuario WHERE id_user = ?', [r.id_user]).catch(() => {});
  }
}

export async function userExistsByEmail(email: string): Promise<boolean> {
  const db = getPool();
  const [rows] = await db.execute('SELECT 1 FROM usuario WHERE email = ?', [email]);
  return (rows as unknown[]).length > 0;
}

/** Borra laboratorios de prueba por nombre (limpieza). Cascada elimina turnos/reservas. */
export async function deleteLabByName(nombre: string): Promise<void> {
  const db = getPool();
  await db.execute('DELETE FROM laboratorio WHERE nombre_laboratorio = ?', [nombre]).catch(() => {});
}

export async function deleteLabById(id: number): Promise<void> {
  const db = getPool();
  await db.execute('DELETE FROM reserva WHERE id_turno IN (SELECT id_turno FROM turno WHERE id_laboratorio = ?)', [id]).catch(() => {});
  await db.execute('DELETE FROM turno WHERE id_laboratorio = ?', [id]).catch(() => {});
  await db.execute('DELETE FROM laboratorio WHERE id_laboratorio = ?', [id]).catch(() => {});
}

/**
 * Inserta un turno directamente en BD. Se usa para CP-16 (cancelación fuera de
 * plazo), ya que el endpoint de creación impide crear turnos que empiecen en
 * menos de 4 horas, y necesitamos un turno que arranque en <1h.
 */
export async function setLabDeshabilitado(id: number, value: boolean): Promise<void> {
  const db = getPool();
  await db.execute('UPDATE laboratorio SET deshabilitado = ? WHERE id_laboratorio = ?', [value ? 1 : 0, id]);
}

export async function insertTurno(opts: {
  labId: number;
  profId: number;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM:SS
  hora_fin: string; // HH:MM:SS
}): Promise<number> {
  const db = getPool();
  const [res] = await db.execute(
    'INSERT INTO turno (id_laboratorio, id_profesor, fecha, hora_inicio, hora_fin, capacidad_ocupada, estado) VALUES (?, ?, ?, ?, ?, 0, ?)',
    [opts.labId, opts.profId, opts.fecha, opts.hora_inicio, opts.hora_fin, 'Activo'],
  );
  return (res as mysql.ResultSetHeader).insertId;
}
