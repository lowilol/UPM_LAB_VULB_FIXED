

# UPM LAB — Gestión de Grupos de Laboratorio

Aplicación web para la gestión de laboratorios, turnos, reservas e incidencias de la UPM. Consta de un frontend React (Vite + Tailwind + Flowbite), un backend Express con Sequelize (MySQL) y Redis, todo orquestado con Docker detrás de un proxy nginx con HTTPS en el dominio local `upmlab.es`.

Repositorio: [lowilol/UPM_LAB_VULB_FIXED](https://github.com/lowilol/UPM_LAB_VULB_FIXED)

## Arquitectura

| Servicio  | Contenedor    | Descripción                                      |
|-----------|---------------|--------------------------------------------------|
| nginx     | `tfg_nginx`   | Proxy inverso con TLS (puertos 80/443)           |
| frontend  | `tfg_frontend`| React + Vite servido en producción               |
| backend   | `tfg_backend` | API Express (puerto interno 4000)                |
| mysql     | `tfg_mysql`   | Base de datos MySQL 8                            |
| redis     | `tfg_redis`   | Códigos de verificación / sesiones               |
| dns       | `tfg_dns`     | dnsmasq: resuelve `upmlab.es` a la IP de tu LAN  |

## Requisitos

- Docker y Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) (certificados TLS locales)
- Node.js 20+ (solo para desarrollo local y para el seed fuera de Docker)

## Despliegue

### 1. Clonar y configurar variables de entorno

```bash
git clone https://github.com/lowilol/UPM_LAB_VULB_FIXED.git
cd UPM_LAB_VULB_FIXED
```

El proyecto usa [dotenvx](https://dotenvx.com) con el `.env` cifrado. Las variables necesarias son:

```
MYSQL_ROOT_PASSWORD  # contraseña root de MySQL
DB_NAME              # nombre de la base de datos
DB_USER / DB_PASS    # credenciales de la aplicación
ACCESS_TOKEN_SECRET  # secreto JWT de sesión
RESET_PASSWORD_TOKEN # secreto JWT de reseteo de contraseña
EMAIL_USER / EMAIL_PASS  # cuenta SMTP para los correos
HOST_LAN_IP          # IP de tu máquina en la LAN (para el DNS)
```

Para descifrar el `.env` necesitas la clave privada (`.env.keys`, no incluida en el repo). Si prefieres un `.env` en claro, sustituye los valores `encrypted:...` por los tuyos.

### 2. Generar los certificados TLS

```bash
./generate-certs.sh
# genera certs/upmlab.es.crt y certs/upmlab.es.key con mkcert
```

### 3. Levantar los servicios

```bash
docker compose up -d --build
```

### 4. Acceder

Apunta el DNS de tu equipo al contenedor `tfg_dns` (o añade `upmlab.es` con tu IP en el archivo hosts) y abre:

```
https://upmlab.es
```
En caso de que no funcione, desactivar ipv6.
## Usuarios de prueba — `back/seedUsuarios.js`

El script [`back/seedUsuarios.js`](https://github.com/lowilol/UPM_LAB_VULB_FIXED/blob/main/back/seedUsuarios.js) crea usuarios de demostración para poder probar la aplicación con los tres roles sin pasar por el registro. Es **idempotente**: si el email ya existe lo salta, así que puede ejecutarse varias veces sin duplicar datos. Usa una conexión propia a MySQL **sin `sync`**, de modo que nunca altera el esquema existente; solo inserta filas.

### Usuarios que crea

| Rol      | Email                         | Contraseña    | Datos extra                          |
|----------|-------------------------------|---------------|--------------------------------------|
| Profesor | `profesor.demo@upm.es`        | `Profesor123` | Departamento: Informática            |
| PAS      | `pas.demo@upm.es`             | `Pas123`      | —                                    |
| Alumno   | `alumno.demo@alumnos.upm.es`  | `Alumno123`   | Matrícula: A2026001                  |

Cada rol ejercita una parte distinta de la app: el **Profesor** puede crear turnos y ver incidencias de laboratorio (además se le crea su fila en la tabla `profesor` con su departamento); el **Alumno** puede reservar turnos y consultar su historial (se le crea su fila en `alumno` con su matrícula); el **PAS** gestiona laboratorios (alta, baja, edición). Las contraseñas se guardan hasheadas con bcrypt, igual que hace el registro real.

### Cómo ejecutarlo

**Con la base de datos en Docker (recomendado):** el script se incluye en la imagen del backend, así que basta con:

```bash
docker compose exec backend node seedUsuarios.js
```

(Si el contenedor se construyó antes de añadir el script: `docker compose cp back/seedUsuarios.js backend:/app/` y luego el `exec` anterior.)

**En local** (MySQL accesible desde tu máquina en el puerto 3306):

```bash
cd back
npx @dotenvx/dotenvx run --env-file=../.env -- node seedUsuarios.js
```

Salida esperada:

```
Creado Profesor: profesor.demo@upm.es (id_user=1)
Creado PAS: pas.demo@upm.es (id_user=2)
Creado Alumno: alumno.demo@alumnos.upm.es (id_user=3)
Seed completado.
```

## Tests

- **API (backend):** `cd back && npm run test:api` (Playwright, requiere `.env.test` — ver `back/.env.test.example` y `back/tests/README.md`)
- **E2E (frontend):** `cd front && npm run test:e2e` (Playwright)

## Desarrollo local sin Docker

```bash
# Backend (puerto 4000)
cd back && npm install && npm run dev

# Frontend (puerto 3000)
cd front && npm install && npm run dev
```

> Nota: en desarrollo local el front necesita un proxy `/api` → `http://localhost:4000` en `vite.config.js`; en el despliegue Docker ese enrutado lo hace nginx.
