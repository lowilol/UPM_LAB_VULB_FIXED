# Pruebas de caja negra del backend

Suite de pruebas de **caja negra** sobre la API REST del backend, implementada con
el `request` context de **Playwright** (HTTP puro, sin navegador). Cada prueba
ataca al servidor **real** corriendo contra la **base de datos real**, comprobando
únicamente las salidas (códigos de estado, cuerpos JSON y efectos observables)
frente a unas entradas concretas.

Los casos implementados se corresponden uno a uno con la tabla de casos de prueba
del TFG (`resultados.tex`): **CP-01 … CP-27**, anotados con su requisito (RF/RNF).

## Requisitos previos

1. **Backend levantado** en `http://127.0.0.1:4000`:

   ```bash
   cd back
   npm run dev      # o npm start
   ```

2. **MySQL** y **Redis** accesibles (los mismos que usa el servidor). Las pruebas
   los utilizan para *sembrar* usuarios de prueba y para leer el código de
   verificación de Redis (CP-06). Las credenciales se leen de `../.env`.

3. **SMTP operativo** (credenciales `EMAIL_USER` / `EMAIL_PASS` de `../.env`).
   Solo lo necesita **CP-25** (deshabilitar laboratorio notifica al profesorado).

## Instalación

```bash
cd back
npm install
npx playwright install        # binarios de Playwright (solo la primera vez)
```

## Ejecución

```bash
cd back
npm run test:api              # ejecuta CP-01 .. CP-27
npm run test:api:report       # abre el informe HTML
```

Filtrar por módulo o caso:

```bash
npx playwright test --config=playwright.api.config.ts cp-auth.spec.ts
npx playwright test --config=playwright.api.config.ts -g "CP-13"
```

## Qué hace el setup

`tests/setup/global-setup.ts` comprueba que el servidor responde y siembra dos
usuarios deterministas con contraseña conocida:

- `cp.alumno.test@alumnos.upm.es` (rol **Alumno**)
- `cp.profesor.test@upm.es` (rol **Profesor**)

`global-teardown.ts` los elimina al terminar. Cada spec crea y limpia sus propios
laboratorios/turnos/reservas.

Para las rutas protegidas (JWT) se mintean tokens con el mismo secreto y formato
de payload que emite `/login` (`{id,email,name,rol}`), de modo que las pruebas no
dependen del envío de correos. CP-01/CP-02 sí usan el endpoint real `/login`.

## Mapa de casos

| Fichero                  | Casos        | Módulo                          |
|--------------------------|--------------|---------------------------------|
| `cp-auth.spec.ts`        | CP-01..CP-07 | Autenticación y registro        |
| `cp-password.spec.ts`    | CP-08..CP-11 | Recuperación de contraseña      |
| `cp-reservas.spec.ts`    | CP-12..CP-17 | Reservas del alumno             |
| `cp-turnos.spec.ts`      | CP-18..CP-22 | Turnos del profesor             |
| `cp-laboratorios.spec.ts`| CP-23..CP-25 | Laboratorios                    |
| `cp-incidencias.spec.ts` | CP-26..CP-27 | Incidencias                     |

## Notas sobre el alcance (caja negra honesta)

- **CP-04** (confirmación de contraseña no coincidente) es validación de
  **cliente**: el back no recibe campo de confirmación, por lo que el caso se
  marca como *skipped* con su justificación.
- **CP-12** El filtrado por fecha/nombre se realiza en el cliente. La prueba
  verifica que el back entrega los datos necesarios (fecha y nombre de
  laboratorio) en el listado de turnos.
- **CP-14** El turno no almacena su propia capacidad (solo `capacidad_ocupada`),
  por lo que la rama "turno completo" no es alcanzable por API. La prueba valida
  la regla de rechazo que **sí** aplica el back: no permitir reservar dos veces
  el mismo turno.
- **CP-16** Usa inserción directa en BD para crear un turno que empieza en <1h
  (el endpoint de creación bloquea turnos tan próximos), y luego comprueba que la
  cancelación fuera de plazo se rechaza por API.
- **CP-25** Requiere SMTP operativo porque el endpoint notifica al profesorado.
