import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saludoEnMayusculas } from '../src/cliente-saludo.mjs';
import { iniciarMock, detenerMock, registrarObservado } from '../test-support/mock-contrato.mjs';

test('saludoEnMayusculas - nombre válido en mayúsculas', async (t) => {
  const mock = await iniciarMock('saludo-api');
  t.after(() => detenerMock(mock));

  const mensaje = await saludoEnMayusculas('Ana', mock.baseUrl);

  assert.equal(mensaje, 'HOLA, ANA.');
  registrarObservado('saludo-api', 'nombre-valido', { exercised: true, test: 'saludoEnMayusculas - nombre válido en mayúsculas' });
});

test('saludoEnMayusculas - nombre obligatorio ausente propaga el error', async (t) => {
  const mock = await iniciarMock('saludo-api');
  t.after(() => detenerMock(mock));

  await assert.rejects(
    () => saludoEnMayusculas(undefined, mock.baseUrl),
    (error) => {
      assert.equal(error.code, 'NOMBRE_OBLIGATORIO');
      return true;
    },
  );
  registrarObservado('saludo-api', 'nombre-faltante', { exercised: true, test: 'saludoEnMayusculas - nombre obligatorio ausente propaga el error' });
});
