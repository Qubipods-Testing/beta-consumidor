import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);

function pickPort() {
  return 20000 + Math.floor(Math.random() * 20000);
}

export async function iniciarMock(slug) {
  const port = pickPort();
  const proc = spawn(
    process.execPath,
    ['.ai-stack/contracts/mock-server.mjs', '--port', String(port), '--slug', slug],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] },
  );
  await new Promise((resolve, reject) => {
    const onData = (chunk) => {
      if (chunk.toString().includes('mock de contratos')) {
        proc.stdout.off('data', onData);
        resolve();
      }
    };
    proc.stdout.on('data', onData);
    proc.once('error', reject);
    proc.once('exit', (code) => {
      if (code !== 0 && code !== null) reject(new Error(`mock-server salió con código ${code}`));
    });
  });
  return { proc, baseUrl: `http://127.0.0.1:${port}` };
}

export function detenerMock({ proc }) {
  return new Promise((resolve) => {
    proc.once('exit', resolve);
    proc.kill();
  });
}

export function registrarObservado(slug, nombreFixture, data) {
  const dir = new URL(`../.agentos/contracts/observed/${slug}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL(`${nombreFixture}.json`, dir), JSON.stringify(data));
}
