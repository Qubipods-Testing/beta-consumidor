# Diseño: Saludo en mayúsculas para un cartel

## Arquitectura

```
módulo consumidor → saludoEnMayusculas(nombre, baseUrl) → obtenerSaludo(nombre, baseUrl) → GET /saludo (saludo-api) → mensaje en mayúsculas
```

`saludoEnMayusculas` es una función de presentación añadida a
`src/cliente-saludo.mjs`, junto a `obtenerSaludo` (DEF-2026-002). No agrega
una capa nueva: delega toda la llamada HTTP y la traducción de errores en
`obtenerSaludo`, y solo transforma el texto del mensaje exitoso a mayúsculas.

## Sistemas afectados

- `beta-consumidor` (este repositorio) · dueño: Bryan (pruebas beta) ·
  cambio: función `saludoEnMayusculas` sobre `obtenerSaludo`, en el mismo
  archivo `src/cliente-saludo.mjs`.

## Decisiones (ADR)

- **ADR-01 · Reutilizar `obtenerSaludo`** — motivo (DERCAS): "La regla del
  saludo vive en el proveedor; el consumidor solo la transforma."
  `saludoEnMayusculas` llama a `obtenerSaludo(nombre, baseUrl)` y no repite la
  llamada HTTP ni la traducción de errores: solo aplica
  `.toUpperCase()` al `mensaje` que `obtenerSaludo` resuelve. Si
  `obtenerSaludo` lanza, `saludoEnMayusculas` no captura ese error: lo deja
  propagarse tal cual (mismo `code`, mismo `message`).

Esta decisión se sigue tal cual: no se duplica la llamada a `GET /saludo` ni
la lógica de `obtenerSaludo`.

## Dependencia con DEF-2026-002

`obtenerSaludo(nombre, baseUrl)` es la línea base DEF-2026-002
(`req-2026-002-mostrar-saludo-consumidor`), que a la fecha de este paquete
todavía no está construida en `main` (su OpenSpec está aprobado pero sin PR
de construcción mergeado). Este cambio depende de que `src/cliente-saludo.mjs`
ya exporte `obtenerSaludo` antes de que `tasks.md` de este paquete pueda
cerrarse en verde:

- Si INCR-01 de DEF-2026-002 se construye primero, este paquete solo añade
  `saludoEnMayusculas` al archivo existente.
- Si este paquete se construye primero, su Serie A debe incluir también
  `obtenerSaludo` (copiándolo de la línea base DEF-2026-002 ya aprobada) para
  que `saludoEnMayusculas` tenga algo que reutilizar — nunca reimplementar la
  llamada HTTP por fuera de `obtenerSaludo`. `tasks.md` deja esto explícito
  como paso condicional.

## Contratos

- `saludo-api@1.0.0` (API de saludo, publicado por `beta-proveedor`, hash
  `47e4acc6d22bcafdec0bb2f6534d285c3c107e66c0b7b8e198d935309d9f1f1e`). Esta
  solicitud lo **consume**, no lo redefine ni lo copia, y lo hace
  indirectamente a través de `obtenerSaludo`:
  - `GET /saludo?nombre=` → 200 con `SaludoResponse` (`mensaje`,
    `generadoEn`). `saludoEnMayusculas` toma el `mensaje` que devuelve
    `obtenerSaludo` y lo pasa a mayúsculas; `generadoEn` no se usa en esta
    línea base (el DERCAS solo pide el mensaje en mayúsculas).
  - 400 con `ErrorResponse` (`codigo: NOMBRE_OBLIGATORIO`) cuando falta el
    nombre: `obtenerSaludo` ya lo traduce a `Error.code ===
    "NOMBRE_OBLIGATORIO"`; `saludoEnMayusculas` lo propaga sin modificarlo.
  - `casing`: `camelCase` (fijado por el contrato publicado por
    `beta-proveedor`; no se infiere en este paquete porque el contrato ya lo
    declara).
  - Faltante: ninguno. El contrato cubre los dos escenarios de aceptación del
    DERCAS (200 y 400) sin necesitar nada adicional del proveedor.

## Interfaz

Esta solicitud no tiene interfaz gráfica (así lo indica el DERCAS aprobado).
No se incluye sección UI ni `mockup.html`.

## Calidad

- **NFR-01 [Mantenibilidad] Sin dependencias externas de npm** — se verifica
  leyendo `package.json`: no debe declarar `dependencies` (solo puede tener
  `scripts` y metadatos). `saludoEnMayusculas` solo usa `obtenerSaludo` y
  `String.prototype.toUpperCase()`, ambos sin dependencias de npm.
- Estrategia de validación: `npm test`, que corre `node --test` contra
  `.ai-stack/contracts/mock-server.mjs` levantado con los fixtures del
  contrato `saludo-api@1.0.0`.

## Entorno de ejecución y plan de pruebas

El Qubipod que ejecuta este paquete trae Node 22, sin Docker. Las pruebas no
necesitan base de datos, Redis, ni Docker: `saludoEnMayusculas` es una
transformación pura sobre el resultado de un cliente HTTP, y el mock-server
del contrato (`.ai-stack/contracts/mock-server.mjs`) es un proceso Node plano
que expone `GET /saludo` sobre HTTP en un puerto local. Por eso el plan de
pruebas corre íntegro en el Qubipod, sin necesidad de RollForward ni de
marcar nada como "solo CI del repo":

1. Las pruebas (`node:test`) levantan el mock-server del contrato en un
   puerto efímero (`0`) antes de cada caso y lo cierran al terminar.
2. Cada caso llama `saludoEnMayusculas` contra la URL base del mock levantado
   y valida el resultado o el error lanzado, usando los fixtures del
   contrato (`nombre-valido`, `nombre-faltante`).
3. `npm test` ejecuta `node --test` sobre el directorio de pruebas, incluidas
   las pruebas existentes de `obtenerSaludo` si ya están en el repositorio.

## Riesgos

- Si DEF-2026-002 cambia la firma o el comportamiento de `obtenerSaludo`
  antes de que este paquete se construya, `saludoEnMayusculas` debe
  actualizarse para seguir delegando en la versión vigente. Mitigación: este
  paquete no copia la lógica de `obtenerSaludo`, solo la llama, así que
  cualquier cambio de comportamiento (salvo de firma) se hereda
  automáticamente.
- Ver también "Dependencia con DEF-2026-002" arriba: el orden de
  construcción entre este paquete y DEF-2026-002 no está garantizado.

## Verificación

| Acceptance Criteria | Verificación |
|---|---|
| AC-01.01.1 | `specs/saludo-mayusculas/spec.md` → Scenario "Nombre válido en mayúsculas"; prueba `node:test` contra el fixture `nombre-valido` del mock, verifica `"HOLA, ANA."`. |
| AC-01.01.2 | Scenario "Nombre obligatorio ausente propaga el error"; prueba contra el fixture `nombre-faltante`, verifica `Error.code === "NOMBRE_OBLIGATORIO"`. |
