# saludo-mayusculas

## ADDED Requirements

### Requirement: Obtener el saludo en mayúsculas para un cartel
The system SHALL provide `saludoEnMayusculas(nombre, baseUrl)`, which SHALL
call `obtenerSaludo(nombre, baseUrl)` and return its resolved message
converted to uppercase.

#### Scenario: Nombre válido en mayúsculas
- **GIVEN** the `saludo-api` contract mock is running at `baseUrl`
- **WHEN** `saludoEnMayusculas("Ana", baseUrl)` is called
- **THEN** it resolves to `"HOLA, ANA."`

### Requirement: Propagar sin modificar el error de obtenerSaludo
The system SHALL propagate, unmodified, any `Error` thrown by
`obtenerSaludo` when the provider rejects the request.

#### Scenario: Nombre obligatorio ausente propaga el error
- **GIVEN** the `saludo-api` contract mock responds `400` with
  `codigo: "NOMBRE_OBLIGATORIO"` when `nombre` is missing
- **WHEN** `saludoEnMayusculas` is called without a `nombre`
- **THEN** it throws an `Error` whose `code` is `"NOMBRE_OBLIGATORIO"`
