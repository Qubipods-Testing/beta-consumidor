import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { obtenerSaludo } from '../src/cliente-saludo.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const OBSERVED_DIR = join(repoRoot, '.agentos', 'contracts', 'observed', 'saludo-api');

function freePort() {
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
    ['.ai-stack/contracts/mock-server.mjs', '--port', String(port), '--slug', 'saludo-api', '--root', repoRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'inherit'] },
  );

  await new Promise((resolve, reject) => {
    let out = '';
    const onData = (chunk) => {
      out += chunk.toString();
      if (out.includes('mock de contratos en')) {
        child.stdout.off('data', onData);
        resolve();
      }
    };
    child.stdout.on('data', onData);
    child.once('error', reject);
    child.once('exit', (code) => reject(new Error(`mock-server salió con código ${code} antes de iniciar`)));
  });

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async stop() {
      child.kill();
      await once(child, 'exit');
    },
  };
}

function marcarEjercitado(fixture, testName) {
  mkdirSync(OBSERVED_DIR, { recursive: true });
  writeFileSync(join(OBSERVED_DIR, `${fixture}.json`), JSON.stringify({ exercised: true, test: testName }));
}

let mock;

beforeEach(async () => {
  mock = await startMock();
});

afterEach(async () => {
  await mock.stop();
});

test('AC-01.01.1 nombre válido devuelve el mensaje del saludo', async () => {
  const mensaje = await obtenerSaludo('Ana', mock.baseUrl);
  assert.equal(mensaje, 'Hola, Ana.');
  marcarEjercitado('nombre-valido', 'AC-01.01.1 nombre válido devuelve el mensaje del saludo');
});

test('AC-01.01.2 sin nombre lanza Error con código NOMBRE_OBLIGATORIO (400)', async () => {
  await assert.rejects(
    () => obtenerSaludo(undefined, mock.baseUrl),
    (error) => {
      assert.ok(error instanceof Error);
      assert.equal(error.code, 'NOMBRE_OBLIGATORIO');
      return true;
    },
  );
  marcarEjercitado('nombre-faltante', 'AC-01.01.2 sin nombre lanza Error con código NOMBRE_OBLIGATORIO (400)');
});

test('AC-01.01.3 nombre de 51 caracteres lanza Error con código NOMBRE_DEMASIADO_LARGO (422)', async () => {
  const nombreMuyLargo = 'A' + 'a'.repeat(50);
  await assert.rejects(
    () => obtenerSaludo(nombreMuyLargo, mock.baseUrl),
    (error) => {
      assert.ok(error instanceof Error);
      assert.equal(error.code, 'NOMBRE_DEMASIADO_LARGO');
      return true;
    },
  );
  marcarEjercitado('nombre-muy-largo', 'AC-01.01.3 nombre de 51 caracteres lanza Error con código NOMBRE_DEMASIADO_LARGO (422)');
});
