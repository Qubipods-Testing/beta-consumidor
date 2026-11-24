# Propuesta: Mostrar el saludo personalizado en el consumidor

## Why

El consumidor (`beta-consumidor`) necesita mostrar un saludo personalizado a sus
usuarios sin reimplementar la regla de negocio del saludo, que ya vive en el
contrato `saludo-api@1.0.0` publicado por `beta-proveedor`. Hoy no existe ningún
cliente HTTP en este repositorio que hable con ese contrato, así que cualquier
módulo que necesite el saludo tendría que construir su propia llamada HTTP y su
propio manejo de errores, duplicando lógica y arriesgando divergencias con el
contrato aprobado.

Este cambio implementa la línea base DEF-2026-002 v1.0.0: un único punto de
entrada, `obtenerSaludo(nombre, baseUrl)`, que encapsula la llamada a
`GET /saludo` y la traducción de errores del contrato a excepciones de
JavaScript.

## What Changes

- Añade `src/cliente-saludo.mjs` con `obtenerSaludo(nombre, baseUrl)`:
  - Llama a `GET {baseUrl}/saludo?nombre={nombre}` usando `fetch` nativo de
    Node 22 (sin dependencias de npm).
  - Si la respuesta es 200, devuelve el campo `mensaje` del cuerpo
    (`SaludoResponse`).
  - Si la respuesta es 400 o 422, lanza un `Error` cuyo `code` es el `codigo`
    del cuerpo (`ErrorResponse`) y cuyo `message` es el `mensaje` del cuerpo.
- Añade pruebas con `node:test` que ejercitan `obtenerSaludo` contra el
  mock-server del contrato `saludo-api` (`.ai-stack/contracts/mock-server.mjs`).
- Añade un script `test` en `package.json` (sin `dependencies`).

## Capabilities

- **ADDED**: `saludo-consumidor` — capacidad del consumidor para pedir y
  traducir el saludo del contrato `saludo-api`.

## Acceptance Criteria (trazadas al DERCAS)

- AC-01.01.1 → Scenario "Nombre válido" en
  `specs/saludo-consumidor/spec.md`.
- AC-01.01.2 → Scenario "Nombre obligatorio ausente (400)".
- AC-01.01.3 → Scenario "Nombre demasiado largo (422)".

## Impact

Un único PR de construcción (sin series adicionales, ver `tasks.md`):

- INCR-01: Cliente y pruebas mergeados en `main` · épicas: EPIC-01 (Consumir
  saludo-api).

Afecta solo al sistema `beta-consumidor` de este repositorio. No publica ni
modifica contratos; consume `saludo-api@1.0.0` tal cual está aprobado.

## Non-goals

- No incluye interfaz gráfica: esta solicitud no tiene pantallas (ver
  `design.md`, sección "Interfaz").
- No implementa reintentos, caché, ni timeouts configurables: el contrato no
  los pide y el DERCAS no los menciona.
- No modifica ni versiona el contrato `saludo-api`: se consume en su versión
  aprobada 1.0.0.
