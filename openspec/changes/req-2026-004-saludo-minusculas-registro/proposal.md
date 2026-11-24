# Propuesta: Saludo en minúsculas para un registro

## Why

El consumidor (`beta-consumidor`) necesita guardar el saludo en un registro,
donde el texto va en minúsculas. Hoy `obtenerSaludo(nombre, baseUrl)` (línea
base DEF-2026-002) devuelve el saludo tal cual lo da `saludo-api`
(p. ej. `"Hola, Ana."`); ningún módulo transforma ese texto a minúsculas, así
que cualquier consumidor que necesite guardarlo en un registro tendría que
reimplementar esa transformación.

Este cambio implementa la línea base DEF-2026-004 v1.0.0: una función de
presentación, `saludoEnMinusculas(nombre, baseUrl)`, que reutiliza
`obtenerSaludo` y solo transforma el resultado a minúsculas. La regla del
saludo sigue viviendo en el proveedor (`saludo-api`); este cambio no la
reimplementa (ADR-01).

## What Changes

- Añade `saludoEnMinusculas(nombre, baseUrl)` a `src/cliente-saludo.mjs`:
  - Llama a `obtenerSaludo(nombre, baseUrl)`.
  - Si resuelve, devuelve el mensaje en minúsculas (`String.prototype.toLowerCase()`).
  - Si `obtenerSaludo` lanza un `Error` (p. ej. `NOMBRE_OBLIGATORIO`), deja que
    se propague sin modificarlo: `saludoEnMinusculas` no traduce errores, eso
    ya lo hace `obtenerSaludo`.
- Añade pruebas con `node:test` que ejercitan `saludoEnMinusculas` contra el
  mock-server del contrato `saludo-api` (`.ai-stack/contracts/mock-server.mjs`),
  reutilizando los fixtures ya existentes (`nombre-valido`, `nombre-faltante`).

## Capabilities

- **ADDED**: `saludo-minusculas` — capacidad del consumidor para obtener el
  saludo del proveedor y presentarlo en minúsculas para un registro.

## Acceptance Criteria (trazadas al DERCAS)

- AC-01.01.1 → Scenario "Nombre válido en minúsculas" en
  `specs/saludo-minusculas/spec.md`.
- AC-01.01.2 → Scenario "Nombre obligatorio ausente propaga el error".

## Impact

Un único PR de construcción (sin series adicionales, ver `tasks.md`):

- INCR-01: Función y pruebas mergeadas en `main` · épicas: EPIC-01 (Saludo
  para registro).

Afecta solo al sistema `beta-consumidor` de este repositorio, sobre el mismo
archivo `src/cliente-saludo.mjs` que ya expone `obtenerSaludo`
(DEF-2026-002). No publica ni modifica contratos; consume `saludo-api@1.0.0`
tal cual está aprobado, a través de `obtenerSaludo`.

## Non-goals

- No incluye interfaz gráfica: esta solicitud no tiene pantallas (ver
  `design.md`, sección "Interfaz").
- No reimplementa ni duplica la traducción de errores del contrato: eso ya lo
  hace `obtenerSaludo` (DEF-2026-002); `saludoEnMinusculas` solo transforma el
  mensaje exitoso.
- No modifica ni versiona el contrato `saludo-api`: se consume en su versión
  aprobada 1.0.0, indirectamente a través de `obtenerSaludo`.
