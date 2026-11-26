import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { obtenerSaludo } from '../src/cliente-saludo.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const mockServerPath = join(repoRoot, '.ai-stack', 'contracts', 'mock-server.mjs');
const SLUG = 'saludo-api';

async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function startMock() {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    [mockServerPath, '--port', String(port), '--slug', SLUG, '--root', repoRoot],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  await once(child.stdout, 'data');
  return { child, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopMock(child) {
  child.kill();
  await once(child, 'exit');
}

function recordExercised(fixture, testName) {
  const dir = join(repoRoot, '.agentos', 'contracts', 'observed', SLUG);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${fixture}.json`), JSON.stringify({ exercised: true, test: testName }));
}

test('obtenerSaludo("Ana", url) devuelve el mensaje (AC-01.01.1 de DEF-2026-002)', async (t) => {
  const { child, baseUrl } = await startMock();
  t.after(() => stopMock(child));

  const mensaje = await obtenerSaludo('Ana', baseUrl);

  assert.equal(mensaje, 'Hola, Ana.');
  recordExercised('nombre-valido', t.name);
});

test('obtenerSaludo sin nombre lanza NOMBRE_OBLIGATORIO (AC-01.01.2 de DEF-2026-002)', async (t) => {
  const { child, baseUrl } = await startMock();
  t.after(() => stopMock(child));

  await assert.rejects(
    () => obtenerSaludo(undefined, baseUrl),
    (error) => {
      assert.equal(error.code, 'NOMBRE_OBLIGATORIO');
      return true;
    },
  );
  recordExercised('nombre-faltante', t.name);
});

test('obtenerSaludo con nombre de 51 caracteres lanza NOMBRE_DEMASIADO_LARGO (AC-01.01.3 de DEF-2026-002)', async (t) => {
  const { child, baseUrl } = await startMock();
  t.after(() => stopMock(child));

  const nombre = 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  await assert.rejects(
    () => obtenerSaludo(nombre, baseUrl),
    (error) => {
      assert.equal(error.code, 'NOMBRE_DEMASIADO_LARGO');
      return true;
    },
  );
  recordExercised('nombre-muy-largo', t.name);
});
