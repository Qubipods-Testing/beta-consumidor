# Diseño: Mostrar el saludo personalizado en el consumidor

## Arquitectura

```
módulo consumidor → obtenerSaludo(nombre, baseUrl) → GET /saludo (saludo-api) → mensaje
```

`obtenerSaludo` es el único punto de entrada expuesto por
`src/cliente-saludo.mjs`. No hay capa adicional (sin repositorio, sin caché):
una llamada HTTP, una traducción de respuesta o error.

## Sistemas afectados

- `beta-consumidor` (este repositorio) · dueño: Bryan (pruebas beta) · cambio:
  cliente HTTP del contrato `saludo-api` con `fetch` de Node 22.

## Decisiones (ADR)

- **ADR-01 · Cliente con fetch de Node 22** — motivo (DERCAS): "Sin
  dependencias de npm, igual que el proveedor." `obtenerSaludo` usa el
  `fetch` global de Node 22, sin ninguna librería HTTP de npm. `package.json`
  no declara `dependencies`.
- **ADR-02 · Pruebas contra el mock del contrato** — motivo (DERCAS): "Las
  pruebas usan el mock-server del kit con los fixtures del contrato, no un
  servidor escrito a mano." Las pruebas de `node:test` levantan
  `.ai-stack/contracts/mock-server.mjs` para el contrato `saludo-api@1.0.0` y
  apuntan `obtenerSaludo` a la URL que ese mock expone, usando los fixtures
  (ejemplos) ya definidos en el contrato (`nombre-valido`, `nombre-faltante`,
  `nombre-muy-largo`) en lugar de construir un servidor ad hoc.

Ambas decisiones se siguen tal cual: no se introduce ninguna dependencia de
npm ni ningún servidor de pruebas distinto del mock del kit.

## Contratos

- `saludo-api@1.0.0` (API de saludo, publicado por `beta-proveedor`, hash
  `47e4acc6d22bcafdec0bb2f6534d285c3c107e66c0b7b8e198d935309d9f1f1e`). Esta
  solicitud lo **consume**, no lo redefine ni lo copia:
  - `GET /saludo?nombre=` → 200 con `SaludoResponse` (`mensaje`,
    `generadoEn`). `obtenerSaludo` devuelve `mensaje`; `generadoEn` no se usa
    en esta línea base (el DERCAS solo pide el mensaje).
  - 400 con `ErrorResponse` (`codigo: NOMBRE_OBLIGATORIO`) cuando falta el
    nombre.
  - 422 con `ErrorResponse` (`codigo: NOMBRE_DEMASIADO_LARGO`) cuando el
    nombre supera 50 caracteres.
  - `casing`: `camelCase` (fijado por el contrato publicado por
    `beta-proveedor`; no se infiere en este paquete porque el contrato ya lo
    declara).
  - Faltante: ninguno. El contrato cubre los tres escenarios de aceptación
    del DERCAS (200, 400, 422) sin necesitar nada adicional del proveedor.

## Interfaz

Esta solicitud no tiene interfaz gráfica (así lo indica el DERCAS aprobado).
No se incluye sección UI ni `mockup.html`.

## Calidad

- **NFR-01 [Mantenibilidad] Sin dependencias externas de npm** — se verifica
  leyendo `package.json`: no debe declarar `dependencies` (solo puede tener
  `scripts` y metadatos). `obtenerSaludo` solo usa APIs nativas de Node 22
  (`fetch`, `URL`).
- Estrategia de validación: `npm test`, que corre `node --test` contra
  `.ai-stack/contracts/mock-server.mjs` levantado con los fixtures del
  contrato `saludo-api@1.0.0`.

## Entorno de ejecución y plan de pruebas

El Qubipod que ejecuta este paquete trae Node 22, sin Docker. Las pruebas no
necesitan base de datos, Redis, ni Docker: `obtenerSaludo` es un cliente HTTP
puro y el mock-server del contrato (`.ai-stack/contracts/mock-server.mjs`) es
un proceso Node plano que expone `GET /saludo` sobre HTTP en un puerto local.
Por eso el plan de pruebas corre íntegro en el Qubipod, sin necesidad de
RollForward ni de marcar nada como "solo CI del repo":

1. Las pruebas (`node:test`) levantan el mock-server del contrato en un
   puerto efímero (`0`) antes de cada caso y lo cierran al terminar.
2. Cada caso llama `obtenerSaludo` contra la URL base del mock levantado y
   valida el resultado o el error lanzado, usando los fixtures del contrato
   (`nombre-valido`, `nombre-faltante`, `nombre-muy-largo`).
3. `npm test` ejecuta `node --test` sobre el directorio de pruebas.

## Riesgos

- Si el mock-server del kit (`.ai-stack/contracts/mock-server.mjs`) cambiara
  su forma de arranque o su contrato de fixtures, las pruebas de este cambio
  tendrían que actualizarse. Mitigación: las pruebas importan el mock-server
  en lugar de reimplementar un servidor, así heredan automáticamente
  cualquier fixture nuevo del contrato.
- El contrato permite extender el enum `codigo` de `ErrorResponse`
  (`x-extensible: true`). `obtenerSaludo` no hace un `switch` cerrado sobre
  los códigos conocidos: simplemente propaga el `codigo` recibido como
  `error.code`, así que un código nuevo no rompe el cliente.

## Verificación

| Acceptance Criteria | Verificación |
|---|---|
| AC-01.01.1 | `specs/saludo-consumidor/spec.md` → Scenario "Nombre válido"; prueba `node:test` contra el fixture `nombre-valido` del mock. |
| AC-01.01.2 | Scenario "Nombre obligatorio ausente (400)"; prueba contra el fixture `nombre-faltante`. |
| AC-01.01.3 | Scenario "Nombre demasiado largo (422)"; prueba contra el fixture `nombre-muy-largo`. |
