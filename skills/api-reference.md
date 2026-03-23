# open-factura API Reference
## Para el equipo de Frontend (React + Vite)

---

## 1. Información General

| Item | Valor |
|------|-------|
| Descripción | API de facturación electrónica Ecuador compatible con SRI |
| Base URL (desarrollo) | http://localhost:3000 |
| Base URL (producción) | Pendiente |
| Content-Type | application/json |
| Stack | React + Vite |

---

## 2. Autenticación

> **Estado**: Implementada con JWT Bearer Token
> 
> Se usa el header `Authorization: Bearer <token>` en las rutas protegidas.

**Payload del token:**
```json
{
  "sub": "uuid-del-usuario",
  "tenantId": "uuid-del-tenant",
  "branchId": "uuid-de-la-sucursal",
  "role": "ADMIN | SELLER"
}
```

### 2.1 Login

**POST /api/auth/login**

**Request:**
```json
{
  "email": "usuario@correo.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-usuario",
    "email": "usuario@correo.com",
    "name": "Usuario Demo",
    "role": "ADMIN",
    "tenantId": "uuid-tenant",
    "branchId": "uuid-branch"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

> **Nota**: El refresh token se envía en una cookie HttpOnly (`refreshToken`).

---

### 2.2 Refresh Token

**POST /api/auth/refresh**

Renueva el access token usando el refresh token de la cookie. El frontend debe llamar a este endpoint automáticamente cuando el access token expire.

**Cookies (enviadas automáticamente):**
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| refreshToken | HttpOnly | JWT de 7 días |

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "uuid-usuario",
    "tenantId": "uuid-tenant",
    "branchId": "uuid-branch",
    "role": "ADMIN",
    "email": "usuario@correo.com"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": "Refresh token inválido o expirado"
}
```

**Response Error - Sesión comprometida (401):**
```json
{
  "success": false,
  "error": "Sesión comprometida. Por seguridad, todas tus sesiones han sido revocadas."
}
```

> **Importante**: Si se detecta reúso del refresh token (posible robo), se revocan TODAS las sesiones del usuario.

---

### 2.3 Logout

**POST /api/auth/logout**

No requiere body. Retorna mensaje de éxito (stateless).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### 2.4 Get Current User

**GET /api/auth/me**

Obtiene los datos del usuario autenticado desde el token JWT.

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-usuario",
    "email": "usuario@correo.com",
    "name": "Usuario Demo",
    "role": "ADMIN",
    "tenantId": "uuid-tenant",
    "branchId": "uuid-branch"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

---

---

## 3. Enums y Catálogos

### 3.1 Tipos de Identificación (SRI)

| Código | Descripción |
|--------|-------------|
| 04 | RUC |
| 05 | Cédula |
| 06 | Pasaporte |
| 07 | Consumidor Final |
| 08 | Identificación del Exterior |

### 3.2 Tipos de Documento (SRI)

| Código | Descripción |
|--------|-------------|
| 01 | Factura |
| 03 | Liquidación de Compras |
| 04 | Nota de Crédito |
| 05 | Nota de Débito |
| 06 | Guía de Remisión |
| 07 | Comprobante de Retención |

### 3.3 Formas de Pago (SRI)

| Código | Descripción |
|--------|-------------|
| 01 | Sin Utilización del Sistema Financiero |
| 02 | Cheque |
| 03 | Tarjeta de Débito |
| 04 | Tarjeta de Crédito |
| 05 | Tarjeta Prepago |
| 06 | Dinero Electrónico |
| 07 | Transferencia |
| 08 | Depósito |
| 09 | Cargo |
| 10 | Aplicación de Anticipo |
| 11 | Letra de Cambio |
| 12 | Factura a Cargo Terceros |
| 13 | Beneficiario |
| 14 | Recaudación |
| 15 | Remesa |
| 16 | Plaza |
| 17 | Aval |
| 18 | Fideicomiso |
| 19 | Garantía |
| 20 | Otro |
| 21 | endosa |

### 3.4 Códigos de Impuesto (SRI)

| Código | Descripción |
|--------|-------------|
| 2 | IVA |
| 3 | ICE |
| 5 | IRBPNR |

### 3.5 Porcentajes IVA (SRI)

| Código | Porcentaje |
|--------|------------|
| 0 | 0% |
| 2 | 12% |
| 3 | 14% |
| 6 | No objeto de impuesto |
| 7 | Exento de IVA |
| 8 | Gravado con tarifa 0% |

### 3.6 Estados (Enum de la API)

**DeliveryStatus (envío de correo):**
| Valor | Descripción |
|-------|-------------|
| SIN_ENVIAR | Pendiente de envío |
| ENVIADO | Ya enviado |
| REENVIADO | Reenviado |

**CustomerStatus:**
| Valor | Descripción |
|-------|-------------|
| ACTIVE | Cliente activo |
| INACTIVE | Cliente inactivo |

**UserRole:**
| Valor | Descripción |
|-------|-------------|
| ADMIN | Administrador |
| SELLER | Vendedor |

---

## 4. Interfaces TypeScript

### 4.1 Customer

```typescript
// Crear cliente (POST /api/customers)
interface CreateCustomerRequest {
  tenantId: string;                    // UUID - Obligatorio
  idType: string;                       // "04"|"05"|"06"|"07"|"08" - Obligatorio
  idNumber: string;                     // Número identificación - Obligatorio
  legalName: string;                    // Razón social / nombre - Obligatorio
  email: string;                        // Correo electrónico - Obligatorio
  commercialName?: string;              // Nombre comercial - Opcional
  phone?: string;                       // Teléfono - Opcional
  address?: string;                     // Dirección - Opcional
  city?: string;                        // Ciudad - Opcional
  birthday?: string;                     // Fecha nacimiento (YYYY-MM-DD) - Opcional
  notes?: string;                       // Notas internas - Opcional
}

// Actualizar cliente (PUT /api/customers/:id)
interface UpdateCustomerRequest {
  idType?: string;
  idNumber?: string;
  legalName?: string;
  commercialName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthday?: string;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// Respuesta de cliente
interface CustomerData {
  id: string;
  tenantId: string;
  idType: string;
  idNumber: string;
  legalName: string;
  commercialName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  birthday?: string;
  notes?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}
```

### 4.2 Invoice - InfoFactura

```typescript
interface InvoiceInfo {
  // Obligatorios
  fechaEmision: string;                              // DD/MM/YYYY
  dirEstablecimiento: string;                        // Dirección del establecimiento
  obligadoContabilidad: "SI" | "NO";
  tipoIdentificacionComprador: "04" | "05" | "06" | "07" | "08";
  razonSocialComprador: string;                      // Nombre del cliente
  identificacionComprador: string;                   // RUC/Cédula/Pasaporte
  direccionComprador: string;                       // Dirección del cliente
  totalSinImpuestos: string;                        // Subtotal sin impuestos
  totalDescuento: string;                           // Total descuentos
  totalConImpuestos: {                              // Impuestos por tipo
    totalImpuesto: Array<{
      codigo: "2" | "3" | "5";                     // 2=IVA, 3=ICE, 5=IRBPNR
      codigoPorcentaje: "0" | "2" | "3" | "6" | "7" | "8";
      descuentoAdicional?: string;
      baseImponible: string;
      tarifa?: string;
      valor: string;
    }>[];
  };
  importeTotal: string;                              // Total a pagar
  moneda: string;                                   // USD
  pagos: {                                         // Información de pago
    pago: Array<{
      formaPago: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21";
      total: string;
      plazo?: string;                                // Días de plazo
      unidadTiempo?: string;                         // días
    }>[];
  };

  // Opcionales
  contribuyenteEspecial?: string;
  comercioExterior?: string;
  guiaRemision?: string;
  totalSubsidio?: string;
  compensaciones?: {
    compensacion: Array<{
      codigo: string;
      tarifa: string;
      valor: string;
    }>;
  };
  propina?: string;
  valorRetIva?: string;
  valorRetRenta?: string;
  placa?: string;
}
```

### 4.3 Invoice - Detalles

```typescript
interface Detail {
  codigoPrincipal: string;              // Código del producto
  codigoAuxiliar?: string;              // Código alternativo
  descripcion: string;                 // Descripción del producto
  cantidad: string;                    // Cantidad
  precioUnitario: string;              // Precio unitario
  descuento: string;                   // Descuento por línea
  precioTotalSinImpuesto: string;      // Cantidad × PrecioUnitario - Descuento
  
  detallesAdicionales?: {               // Info adicional por línea
    detAdicional: Array<{
      "@nombre": string;
      "@valor": string;
    }>;
  };
  
  impuestos: {                          // Impuestos de la línea
    impuesto: Array<{
      codigo: "2" | "3" | "5";         // Tipo impuesto
      codigoPorcentaje: "0" | "2" | "3" | "6" | "7" | "8";
      tarifa: string;                  // Porcentaje (0, 12, 14, etc.)
      baseImponible: string;
      valor: string;
    }>;
  };
}

interface Details {
  detalle: Detail[];
}
```

### 4.4 Invoice - Info Adicional

```typescript
interface AdditionalInfo {
  campoAdicional: Array<{
    "@nombre": string;   // ej: "Email", "Teléfono"
    "#": string;         // ej: "correo@ejemplo.com"
  }>;
}
```

### 4.5 CreateInvoiceRequest

```typescript
interface CreateInvoiceRequest {
  // FK - Obligatorios (UUID)
  branchId: string;      // UUID de la sucursal
  configId: string;       // UUID de la configuración de facturación
  customerId: string;    // UUID del cliente

  // Datos de la factura
  infoFactura: InvoiceInfo;
  detalles: Details;
  
  // Opcionales
  reembolsos?: any;
  retenciones?: any;
  infoAdicional?: AdditionalInfo;
}
```

---

## 5. Endpoints - Customers

### 5.1 POST /api/customers
Crear un nuevo cliente.

**Request:**
```json
{
  "tenantId": "uuid-tenant",
  "idType": "05",
  "idNumber": "0912345678",
  "legalName": "Juan Pérez",
  "email": "juan@correo.com",
  "phone": "0991234567",
  "address": "Guayaquil, Av. Principal 123",
  "city": "Guayaquil"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "customer": {
    "id": "uuid-customer",
    "tenantId": "uuid-tenant",
    "idType": "05",
    "idNumber": "0912345678",
    "legalName": "Juan Pérez",
    "commercialName": null,
    "email": "juan@correo.com",
    "phone": "0991234567",
    "address": "Guayaquil, Av. Principal 123",
    "city": "Guayaquil",
    "birthday": null,
    "notes": null,
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Ya existe un cliente con la identificación 0912345678"
}
```

---

### 5.2 GET /api/customers/:id
Obtener un cliente por ID.

**Response (200 OK):**
```json
{
  "success": true,
  "customer": { ... }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Cliente no encontrado"
}
```

---

### 5.3 GET /api/customers/identification/:idNumber
Buscar cliente por número de identificación exacta.

**Query Params:**
- `tenantId` (obligatorio): UUID del tenant

**Ejemplo:** `/api/customers/identification/0912345678?tenantId=uuid-tenant`

**Response (200 OK):**
```json
{
  "success": true,
  "customer": { ... }
}
```

---

### 5.4 GET /api/customers
Buscar clientes con filtros y paginación.

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| tenantId | string | UUID del tenant (obligatorio) |
| search | string | Texto a buscar en idNumber o legalName |
| page | number | Página (default: 1) |
| limit | number | Elementos por página (default: 20) |

**Ejemplo:** `/api/customers?tenantId=uuid&search=juan&page=1&limit=20`

**Response (200 OK):**
```json
{
  "success": true,
  "customers": [
    { "id": "...", "idNumber": "0912345678", "legalName": "Juan Pérez", ... },
    { "id": "...", "idNumber": "0900000000", "legalName": "Juan García", ... }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

---

### 5.5 PUT /api/customers/:id
Actualizar un cliente existente.

**Request (todos los campos son opcionales):**
```json
{
  "legalName": "Juan Pérez Actualizado",
  "phone": "0999999999",
  "address": "Nueva dirección"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "customer": {
    "id": "uuid-customer",
    "tenantId": "uuid-tenant",
    "idType": "05",
    "idNumber": "0912345678",
    "legalName": "Juan Pérez Actualizado",
    "email": "juan@correo.com",
    "phone": "0999999999",
    "address": "Nueva dirección",
    "city": "Guayaquil",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

## 6. Endpoints - Facturación

### 6.1 POST /api/factura
Crear, firmar, enviar y autorizar una factura electrónica.

**Request:**
```json
{
  "branchId": "uuid-branch",
  "configId": "uuid-config",
  "customerId": "uuid-customer",
  "infoFactura": {
    "fechaEmision": "15/01/2024",
    "dirEstablecimiento": "Av. Principal 123, Guayaquil",
    "obligadoContabilidad": "NO",
    "tipoIdentificacionComprador": "05",
    "razonSocialComprador": "Juan Pérez",
    "identificacionComprador": "0912345678",
    "direccionComprador": "Av. Secundaria 456, Guayaquil",
    "totalSinImpuestos": "100.00",
    "totalDescuento": "0.00",
    "totalConImpuestos": {
      "totalImpuesto": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "baseImponible": "100.00",
          "tarifa": "12",
          "valor": "12.00"
        }
      ]
    },
    "importeTotal": "112.00",
    "moneda": "USD",
    "pagos": {
      "pago": [
        {
          "formaPago": "01",
          "total": "112.00"
        }
      ]
    }
  },
  "detalles": {
    "detalle": [
      {
        "codigoPrincipal": "PROD001",
        "descripcion": "Producto de ejemplo",
        "cantidad": "2.00",
        "precioUnitario": "50.00",
        "descuento": "0.00",
        "precioTotalSinImpuesto": "100.00",
        "impuestos": {
          "impuesto": [
            {
              "codigo": "2",
              "codigoPorcentaje": "2",
              "tarifa": "12",
              "baseImponible": "100.00",
              "valor": "12.00"
            }
          ]
        }
      }
    ]
  },
  "infoAdicional": {
    "campoAdicional": [
      {
        "@nombre": "Email",
        "#": "cliente@correo.com"
      },
      {
        "@nombre": "Teléfono",
        "#": "0991234567"
      }
    ]
  }
}
```

**Response Éxito (200 OK):**
```json
{
  "success": true,
  "accessKey": "1501202401099123456700110012345678901",
  "xmlS3Url": "https://bucket.s3.amazonaws.com/xmls/1501202401099123456700110012345678901.xml",
  "pdfS3Url": "https://bucket.s3.amazonaws.com/pdfs/1501202401099123456700110012345678901.pdf",
  "reception": {
    "comprobante": "...",
    "mensajes": { ... }
  },
  "authorization": {
    "estado": "AUTORIZADO",
    "numeroAutorizacion": "1501202401099123456700110012345678901",
    "fechaAutorizacion": "15/01/2024T10:30:00-05:00",
    "raw": { ... }
  },
  "invoice": {
    "id": "uuid-invoice",
    "branchId": "uuid-branch",
    "configId": "uuid-config",
    "customerId": "uuid-customer",
    "accessKey": "1501202401099123456700110012345678901",
    "sriStatus": "AUTORIZADO",
    "xmlS3Url": "https://...",
    "pdfS3Url": "https://...",
    "deliveryStatus": "SIN_ENVIAR",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response Error (500):**
```json
{
  "success": false,
  "accessKey": "1501202401099123456700110012345678901",
  "error": "Factura no autorizada. Estado: RECHAZADO",
  "reception": { ... },
  "authorization": {
    "estado": "RECHAZADO",
    "raw": { ... }
  }
}
```

---

### 6.2 GET /api/factura/:accessKey
Consultar una factura por su clave de acceso.

**Response (200 OK):**
```json
{
  "success": true,
  "invoice": {
    "id": "uuid-invoice",
    "branchId": "uuid-branch",
    "configId": "uuid-config",
    "customerId": "uuid-customer",
    "accessKey": "1501202401099123456700110012345678901",
    "environment": "1",
    "emissionType": "1",
    "documentType": "01",
    "establishment": "001",
    "emissionPoint": "001",
    "sequential": "000000001",
    "issueDate": "15/01/2024",
    "buyerIdType": "05",
    "buyerId": "0912345678",
    "buyerName": "Juan Pérez",
    "subtotal": 100.00,
    "totalDiscount": 0.00,
    "totalAmount": 112.00,
    "authorizationNumber": "1501202401099123456700110012345678901",
    "sriStatus": "AUTORIZADO",
    "xmlS3Url": "https://...",
    "pdfS3Url": "https://...",
    "deliveryStatus": "SIN_ENVIAR",
    "deliveryDate": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 6.3 GET /api/facturas
Listar facturas por sucursal con paginación.

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| branchId | string | UUID de la sucursal (obligatorio) |
| page | number | Página (default: 1) |
| limit | number | Elementos por página (default: 20) |

**Ejemplo:** `/api/facturas?branchId=uuid-branch&page=1&limit=20`

**Response (200 OK):**
```json
{
  "success": true,
  "invoices": [
    {
      "id": "uuid-1",
      "accessKey": "1501202401099123456700110012345678901",
      "sriStatus": "AUTORIZADO",
      "totalAmount": 112.00,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid-2",
      "accessKey": "1401202401099123456700110012345678902",
      "sriStatus": "AUTORIZADO",
      "totalAmount": 250.00,
      "createdAt": "2024-01-14T09:15:00Z"
    }
  ]
}
```

---

## 7. Endpoints - Certificados

### 7.1 POST /api/certificates/upload
Subir un certificado digital (.p12) para firmar documentos electrónicos.

**Content-Type:** multipart/form-data

**Form Data:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| file | File | Archivo .p12 (máx 1MB) |
| password | String | Password del certificado |

**Response (200 OK):**
```json
{
  "success": true,
  "certificate": {
    "id": "uuid-cert",
    "fileName": "certificado.p12",
    "thumbprint": "A1B2C3D4...",
    "subjectCn": "RAZON SOCIAL C.A.",
    "validFrom": "2024-01-01T00:00:00Z",
    "validUntil": "2026-01-01T00:00:00Z",
    "status": "VALID"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "El certificado está vencido o es inválido"
}
```

---

### 7.2 GET /api/certificates/status
Verificar si existe un certificado activo para la sucursal del usuario autenticado.

**Response (200 OK) - Certificado activo:**
```json
{
  "success": true,
  "hasCertificate": true,
  "certificate": {
    "id": "uuid-cert",
    "subjectCn": "RAZON SOCIAL C.A.",
    "validUntil": "2026-01-01T00:00:00Z",
    "daysUntilExpiry": 365
  }
}
```

**Response (200 OK) - Sin certificado:**
```json
{
  "success": true,
  "hasCertificate": false,
  "certificate": null
}
```

---

### 7.3 GET /api/certificates
Listar todos los certificados de la sucursal del usuario autenticado.

**Response (200 OK):**
```json
{
  "success": true,
  "certificates": [
    {
      "id": "uuid-cert-1",
      "fileName": "certificado2024.p12",
      "thumbprint": "A1B2C3D4...",
      "subjectCn": "RAZON SOCIAL C.A.",
      "validFrom": "2024-01-01T00:00:00Z",
      "validUntil": "2026-01-01T00:00:00Z",
      "status": "VALID"
    }
  ]
}
```

---

## 8. Health Check

### GET /health

Verificar que el servidor está funcionando.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 9. Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Request exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Respuesta vacía (CORS preflight) |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - Token inválido o faltante |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error en el servidor |

---

## Rutas Públicas vs Protegidas

| Método | Ruta | Requiere Auth |
|--------|------|---------------|
| GET | /health | No |
| POST | /api/auth/login | No |
| POST | /api/auth/logout | No |
| GET | /api/auth/me | Sí |
| POST | /api/factura | Sí |
| GET | /api/factura/:accessKey | Sí |
| GET | /api/facturas | Sí |
| POST | /api/customers | Sí |
| GET | /api/customers/:id | Sí |
| GET | /api/customers/identification/:idNumber | Sí |
| GET | /api/customers | Sí |
| PUT | /api/customers/:id | Sí |
| POST | /api/certificates/upload | Sí |
| GET | /api/certificates/status | Sí |
| GET | /api/certificates | Sí |

---

## 10. Notas para el Frontend

### 10.1 Validaciones recomendadas

- **Identificación**: Verificar longitud según tipo (RUC=13, Cédula=10, Pasaporte=máx 20)
- **Email**: Formato válido de correo
- **Fechas**: Formato DD/MM/YYYY para facturas
- **Montos**: Usar Decimal (2 decimales) en strings

### 10.2 Flujo típico de uso

1. **Login**: `POST /api/auth/login` → obtener token JWT
2. **Verificar certificado**: `GET /api/certificates/status` antes de crear facturas
3. **Crear cliente** (si no existe): `POST /api/customers`
4. **Buscar cliente** (al escribir identificación): `GET /api/customers/identification/:idNumber?tenantId=X`
5. **Listar clientes** (autocompletado): `GET /api/customers?tenantId=X&search=`
6. **Crear factura**: `POST /api/factura` con el customerId del cliente

### 10.3 Manejo de errores

- Mostrar mensaje de error al usuario
- Loguear errores para debugging
- Para errores 500, verificar logs del servidor

---

## 11. Ejemplo Completo - Crear Factura

```javascript
// Ejemplo en React
const crearFactura = async () => {
  const request = {
    branchId: "uuid-branch",
    configId: "uuid-config", 
    customerId: "uuid-customer",
    infoFactura: {
      fechaEmision: "15/01/2024",
      dirEstablecimiento: "Av. Principal 123, Guayaquil",
      obligadoContabilidad: "NO",
      tipoIdentificacionComprador: "05",
      razonSocialComprador: "Juan Pérez",
      identificacionComprador: "0912345678",
      direccionComprador: "Av. Secundaria 456",
      totalSinImpuestos: "100.00",
      totalDescuento: "0.00",
      totalConImpuestos: {
        totalImpuesto: [{
          codigo: "2",
          codigoPorcentaje: "2",
          baseImponible: "100.00",
          tarifa: "12",
          valor: "12.00"
        }]
      },
      importeTotal: "112.00",
      moneda: "USD",
      pagos: {
        pago: [{
          formaPago: "01",
          total: "112.00"
        }]
      }
    },
    detalles: {
      detalle: [{
        codigoPrincipal: "PROD001",
        descripcion: "Producto de ejemplo",
        cantidad: "2.00",
        precioUnitario: "50.00",
        descuento: "0.00",
        precioTotalSinImpuesto: "100.00",
        impuestos: {
          impuesto: [{
            codigo: "2",
            codigoPorcentaje: "2",
            tarifa: "12",
            baseImponible: "100.00",
            valor: "12.00"
          }]
        }
      }]
    }
  };

  const response = await fetch('http://localhost:3000/api/factura', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  const result = await response.json();
  console.log(result);
};
```

---

*Documento generado para el equipo de Frontend - React + Vite*
