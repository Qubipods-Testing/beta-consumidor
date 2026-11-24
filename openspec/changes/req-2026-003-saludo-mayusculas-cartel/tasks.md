# Tasks

## Serie A — Saludo en mayúsculas y pruebas (INCR-01)

Rojo primero: escribir las pruebas antes que la implementación.

- [ ] 1. Si `src/cliente-saludo.mjs` y `obtenerSaludo(nombre, baseUrl)` todavía
      no existen en el repositorio (DEF-2026-002 / `req-2026-002-mostrar-saludo-consumidor`
      sin construir), añadirlos primero tal cual esa línea base aprobada:
      `fetch` nativo de Node 22 a `GET {baseUrl}/saludo?nombre={nombre}`, 200
      → devuelve `mensaje`, 400/422 → lanza `Error(mensaje)` con `error.code =
      codigo`. Si ya existen, no tocarlos.
- [ ] 2. `package.json` con `"type": "module"`, script `"test": "node --test"`
      y sin `dependencies` (NFR-01). Si ya existe (por DEF-2026-002), no
      duplicar: verificar que cumple lo mismo.
- [ ] 3. Pruebas `node:test` (p. ej. `test/cliente-saludo-mayusculas.test.mjs`)
      que:
      - levantan `.ai-stack/contracts/mock-server.mjs` para el contrato
        `saludo-api@1.0.0` en un puerto efímero antes de cada caso y lo
        cierran al terminar;
      - cubren AC-01.01.1 (`saludoEnMayusculas("Ana", url)` →
        `"HOLA, ANA."`, fixture `nombre-valido`);
      - cubren AC-01.01.2 (sin `nombre` → `Error.code ===
        "NOMBRE_OBLIGATORIO"`, fixture `nombre-faltante`);
      - en este punto fallan porque `saludoEnMayusculas` no existe.
- [ ] 4. `saludoEnMayusculas(nombre, baseUrl)` en `src/cliente-saludo.mjs`:
      - llama a `obtenerSaludo(nombre, baseUrl)`;
      - devuelve el `mensaje` resuelto en mayúsculas (`.toUpperCase()`);
      - no captura el error de `obtenerSaludo`: lo deja propagarse.
- [ ] 5. `npm test` pasa en verde (los dos escenarios de aceptación, más los
      de `obtenerSaludo` si ya están en el repositorio).
