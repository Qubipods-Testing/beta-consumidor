# saludo-minusculas

## ADDED Requirements

### Requirement: Obtener el saludo en minúsculas para un registro
The system SHALL provide `saludoEnMinusculas(nombre, baseUrl)`, which SHALL
call `obtenerSaludo(nombre, baseUrl)` and return its resolved message
converted to lowercase.

#### Scenario: Nombre válido en minúsculas
- **GIVEN** the `saludo-api` contract mock is running at `baseUrl`
- **WHEN** `saludoEnMinusculas("Ana", baseUrl)` is called
- **THEN** it resolves to `"hola, ana."`

### Requirement: Propagar sin modificar el error de obtenerSaludo
The system SHALL propagate, unmodified, any `Error` thrown by
`obtenerSaludo` when the provider rejects the request.

#### Scenario: Nombre obligatorio ausente propaga el error
- **GIVEN** the `saludo-api` contract mock responds `400` with
  `codigo: "NOMBRE_OBLIGATORIO"` when `nombre` is missing
- **WHEN** `saludoEnMinusculas` is called without a `nombre`
- **THEN** it throws an `Error` whose `code` is `"NOMBRE_OBLIGATORIO"`
