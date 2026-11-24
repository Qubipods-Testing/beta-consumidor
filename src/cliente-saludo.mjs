export async function obtenerSaludo(nombre, baseUrl) {
  const url = new URL('/saludo', baseUrl);
  if (nombre !== undefined && nombre !== null) {
    url.searchParams.set('nombre', nombre);
  }

  const respuesta = await fetch(url);
  const cuerpo = await respuesta.json();

  if (respuesta.status === 200) {
    return cuerpo.mensaje;
  }

  const error = new Error(cuerpo.mensaje);
  error.code = cuerpo.codigo;
  throw error;
}

export async function saludoEnMayusculas(nombre, baseUrl) {
  const mensaje = await obtenerSaludo(nombre, baseUrl);
  return mensaje.toUpperCase();
}
