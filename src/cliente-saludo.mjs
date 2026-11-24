export async function obtenerSaludo(nombre, baseUrl) {
  const url = new URL('/saludo', baseUrl);
  if (nombre !== undefined) url.searchParams.set('nombre', nombre);

  const res = await fetch(url);
  const body = await res.json();

  if (res.status === 200) return body.mensaje;

  const error = new Error(body.mensaje);
  error.code = body.codigo;
  throw error;
}
