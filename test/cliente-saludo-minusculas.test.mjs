import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { saludoEnMinusculas } from '../src/cliente-saludo.mjs';

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

test('saludoEnMinusculas("Ana", url) devuelve el saludo en minúsculas (AC-01.01.1)', async (t) => {
  const { child, baseUrl } = await startMock();
  t.after(() => stopMock(child));

  const mensaje = await saludoEnMinusculas('Ana', baseUrl);

  assert.equal(mensaje, 'hola, ana.');
  recordExercised('nombre-valido', t.name);
});

test('saludoEnMinusculas sin nombre propaga el error NOMBRE_OBLIGATORIO (AC-01.01.2)', async (t) => {
  const { child, baseUrl } = await startMock();
  t.after(() => stopMock(child));

  await assert.rejects(
    () => saludoEnMinusculas(undefined, baseUrl),
    (error) => {
      assert.equal(error.code, 'NOMBRE_OBLIGATORIO');
      return true;
    },
  );
  recordExercised('nombre-faltante', t.name);
});
