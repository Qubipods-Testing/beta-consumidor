export async function obtenerSaludo(nombre, baseUrl) {
  const url = new URL('/saludo', baseUrl);
  if (nombre !== undefined) url.searchParams.set('nombre', nombre);

  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok) {
    const error = new Error(body.mensaje);
    error.code = body.codigo;
    throw error;
  }

  return body.mensaje;
}

export async function saludoEnMinusculas(nombre, baseUrl) {
  const mensaje = await obtenerSaludo(nombre, baseUrl);
  return mensaje.toLowerCase();
}
