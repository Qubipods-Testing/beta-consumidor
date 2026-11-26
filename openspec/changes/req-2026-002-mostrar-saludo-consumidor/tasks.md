# Tasks

## Serie A — Cliente del saludo y pruebas (INCR-01)

Rojo primero: escribir las pruebas antes que la implementación.

- [x] 1. `package.json` con `"type": "module"`, script `"test": "node --test"` y
      sin `dependencies` (NFR-01).
- [x] 2. Pruebas `node:test` (p. ej. `test/cliente-saludo.test.mjs`) que:
      - levantan `.ai-stack/contracts/mock-server.mjs` para el contrato
        `saludo-api@1.0.0` en un puerto efímero antes de cada caso y lo
        cierran al terminar;
      - cubren AC-01.01.1 (`obtenerSaludo("Ana", url)` → `"Hola, Ana."`, fixture
        `nombre-valido`);
      - cubren AC-01.01.2 (sin `nombre` → 400 → `Error.code ===
        "NOMBRE_OBLIGATORIO"`, fixture `nombre-faltante`);
      - cubren AC-01.01.3 (nombre de 51 caracteres → 422 → `Error.code ===
        "NOMBRE_DEMASIADO_LARGO"`, fixture `nombre-muy-largo`);
      - en este punto fallan porque `src/cliente-saludo.mjs` no existe.
- [x] 3. `src/cliente-saludo.mjs` con `obtenerSaludo(nombre, baseUrl)`:
      - `fetch` nativo de Node 22 a `GET {baseUrl}/saludo?nombre={nombre}`;
      - 200 → devuelve `mensaje` de `SaludoResponse`;
      - 400/422 → lanza `Error(mensaje)` con `error.code = codigo` de
        `ErrorResponse`.
- [x] 4. `npm test` pasa en verde (los tres escenarios de aceptación).
