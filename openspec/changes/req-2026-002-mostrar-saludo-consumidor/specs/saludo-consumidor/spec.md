# saludo-consumidor

## ADDED Requirements

### Requirement: Obtener el saludo del proveedor
The system SHALL provide `obtenerSaludo(nombre, baseUrl)`, which SHALL request
`GET {baseUrl}/saludo?nombre={nombre}` from the `saludo-api` contract and
return the `mensaje` field of its response when the request succeeds.

#### Scenario: Nombre válido
- **GIVEN** the `saludo-api` contract mock is running at `baseUrl`
- **WHEN** `obtenerSaludo("Ana", baseUrl)` is called
- **THEN** it resolves to `"Hola, Ana."`

### Requirement: Traducir el error del proveedor cuando falta el nombre
The system SHALL throw an `Error` whose `code` property equals the `codigo`
field of the contract's error response when the provider responds `400`.

#### Scenario: Nombre obligatorio ausente (400)
- **GIVEN** the `saludo-api` contract mock responds `400` with
  `codigo: "NOMBRE_OBLIGATORIO"` when `nombre` is missing
- **WHEN** `obtenerSaludo` is called without a `nombre`
- **THEN** it throws an `Error` whose `code` is `"NOMBRE_OBLIGATORIO"`

### Requirement: Traducir el error del proveedor cuando el nombre es demasiado largo
The system SHALL throw an `Error` whose `code` property equals the `codigo`
field of the contract's error response when the provider responds `422`.

#### Scenario: Nombre demasiado largo (422)
- **GIVEN** the `saludo-api` contract mock responds `422` with
  `codigo: "NOMBRE_DEMASIADO_LARGO"` when `nombre` exceeds 50 characters
- **WHEN** `obtenerSaludo` is called with a 51-character `nombre`
- **THEN** it throws an `Error` whose `code` is `"NOMBRE_DEMASIADO_LARGO"`
