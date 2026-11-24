import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obtenerSaludo } from '../src/cliente-saludo.mjs';
import { iniciarMock, detenerMock, registrarObservado } from '../test-support/mock-contrato.mjs';

test('obtenerSaludo - nombre válido', async (t) => {
  const mock = await iniciarMock('saludo-api');
  t.after(() => detenerMock(mock));

  const mensaje = await obtenerSaludo('Ana', mock.baseUrl);

  assert.equal(mensaje, 'Hola, Ana.');
  registrarObservado('saludo-api', 'nombre-valido', { exercised: true, test: 'obtenerSaludo - nombre válido' });
});

test('obtenerSaludo - nombre obligatorio ausente (400)', async (t) => {
  const mock = await iniciarMock('saludo-api');
  t.after(() => detenerMock(mock));

  await assert.rejects(
    () => obtenerSaludo(undefined, mock.baseUrl),
    (error) => {
      assert.equal(error.code, 'NOMBRE_OBLIGATORIO');
      return true;
    },
  );
  registrarObservado('saludo-api', 'nombre-faltante', { exercised: true, test: 'obtenerSaludo - nombre obligatorio ausente (400)' });
});

test('obtenerSaludo - nombre demasiado largo (422)', async (t) => {
  const mock = await iniciarMock('saludo-api');
  t.after(() => detenerMock(mock));

  const nombreLargo = 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  await assert.rejects(
    () => obtenerSaludo(nombreLargo, mock.baseUrl),
    (error) => {
      assert.equal(error.code, 'NOMBRE_DEMASIADO_LARGO');
      return true;
    },
  );
  registrarObservado('saludo-api', 'nombre-muy-largo', { exercised: true, test: 'obtenerSaludo - nombre demasiado largo (422)' });
});
