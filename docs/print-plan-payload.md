# Payload `POST /api/v1/flotilla/plan/print/:idDocument?type=traslado|flete|renta`

Este endpoint (handler `FlotillasController.printPlan`) arma el payload a partir
del documento persistido en `Traslado` / `Flete` / `Rentas` y los datos del
vehículo (`Flotilla` + `Planes`), y lo envía al servicio externo de PDFs:

```
POST  ${PDF_SERVICE}/vehicle-invoice/
Body: <JSON vehicleData>     (ver schema abajo)
Resp: application/pdf        (arraybuffer → res.send)
```

> ⚠️ El `OPTIONS` del curl del frontend es solo el preflight de CORS — el
> servicio externo debe responder 200/204 a `OPTIONS` con los headers
> `Access-Control-Allow-*` correctos. El backend no intercepta ese request.

## Construcción del payload

```js
// controllers/FlotillasController.js  (printPlan)
const getDocumentData   = await FlotillasServices.getDocument(idDocument, type) // doc completo
const getFlotillaData   = await FlotillasServices.getPlanesByPlacas(doc.vehicle) // lookup por placas
const invoiceData       = PDFServices.vehicleData(getDocumentData, getFlotillaData)
const response          = await axios.post(process.env.PDF_SERVICE + '/vehicle-invoice/', invoiceData, { responseType: 'arraybuffer' })
```

`vehicleData(...)` (en `services/PDFServices.js`) **mapea el documento de BD al
shape que necesita el PDF service**. Es el contrato — cualquier campo nuevo
que se muestre en el PDF debe pasar por acá.

## Schema del JSON que recibe el PDF service

```jsonc
{
  // ── Identidad del documento ─────────────────────────────────────
  "_id": "6356dafff7313e00166f40c4",          // ObjectId del doc
  "__v": 0,                                   // versionKey de Mongoose
  "is_active": true,                          // estado del documento
  "type": "TRASLADO",                         // 'TRASLADO' | 'FLETE' | 'RENTA'
  "isCancel_status": null,                    // string | null
  "folio": 1,                                 // folio consecutivo por empresa
  "bussiness_cost": "626e223ffe9887654db63c37", // ObjectId empresa (string)
  "client":         "626e223ffe9887654db63c37", // ObjectId cliente (string)

  // ── Fechas formateadas es-MX ───────────────────────────────────
  "created_day":  "lunes, 1 de junio de 2026",
  "request_day":  "lunes, 1 de junio de 2026",
  "delivery_day": "lunes, 1 de junio de 2026",
  "updatedAt":    "2026-06-01T00:00:00.000Z",  // ISO

  // ── Empresa y cliente (lookup en empresaLogos[]) ───────────────
  "currentEmpresa": "INSTALACIONES TECNOLÓGICAS APLICADAS",
  "currentClient":  "INSTALACIONES TECNOLÓGICAS APLICADAS",

  // ── Encabezado ──────────────────────────────────────────────────
  "subject":     "Asdasd",
  "email_sent":  [],

  // ── Vehículo (de Flotilla + cruce con doc) ─────────────────────
  "vehicle": {
    "name":        "NPR",                       // modelo de Flotilla
    "placas":      "NEA604A",                   // placas de Flotilla
    "driver":      "OSCAR OLAGUE",              // del doc
    "fuel_card":   undefined,                  // del doc
    "fuel_amount": ""                           // $0.00 formateado
  },

  // ── Ruta y kilómetros ─────────────────────────────────────────
  "route":         "CODI CDMX → COAPA → GUADALAJARA",
  "kilometer_out": 10,
  "kilometer_in":  0,
  "fuel_level":    50,
  "recorrido_km":  "10",                        // string, mantener
  "subtotal_travel": "$4,000.00",

  // ── Descripción del plan (lookup con Planes) ──────────────────
  "description": {
    "link_googlemaps": "",
    "project_id":      "671bba68c8d09df0ab3e35fc",
    "document_id":     "",
    "planPrice":       "$4,000.00",
    "planDescription": "Recolección en Lerma",
    "planName":        "Recolección y/o traslado a Lerma",
    "idSlug":          "recolección-y/o-traslado-a-lerma",
    "flotilla":        "6627d31ea034a2001994c00d",
    "isActive":        true,
    "planCreatedAt":   "2024-10-25T15:34:00.994Z",
    "planUpdatedAt":   "2024-10-25T15:34:00.994Z",
    "planVersion":     0
  },

  // ── Desglose de costos (sub-schema del doc) ────────────────────
  "cost_breakdown": {
    "casetas_amount":   1000,   "casetas_unit": "fijo",    "casetas_notes": "",
    "operator_rate":    1000,   "operator_unit":"dia",     "operator_days": 1,
    "per_diem_rate":    1000,   "per_diem_unit":"dia",     "per_diem_days": 1,
    "gasoline_rate":    1200,   "gasoline_unit":"dia",     "gasoline_km": 10,
    "unit_rent_amount": 1000,   "unit_rent_period":"dia",  "unit_rent_unit":"dia", "unit_rent_qty": 1,
    "profit_amount":    0,      "indirect_amount": 0
  },

  // ── Snapshot para el PDF service (NO recalcular) ───────────────
  "snapshot_mode": true,
  "line_items": [
    { "label": "Casetas",         "unit_price": 1000, "qty": 1,   "unit": "fijo", "notes": "", "total": 1000 },
    { "label": "Operador",        "unit_price": 1000, "qty": 1,   "unit": "dia",  "notes": "", "total": 1000 },
    { "label": "Per diem",        "unit_price": 1000, "qty": 1,   "unit": "dia",  "notes": "", "total": 1000 },
    { "label": "Gasolina",        "unit_price": 1200, "qty": 10,  "unit": "dia",  "notes": "", "total": 1200 },
    { "label": "Renta de unidad", "unit_price": 1000, "qty": 1,   "unit": "dia",  "period": "dia", "notes": "", "total": 1000 }
  ],
  "totals": {
    "concepts_subtotal": 5200,
    "subtotal_travel":   4000,
    "profit_amount":     320,
    "indirect_amount":   480,
    "grand_total":       4800
  },

  // ── Pre-vuelo (sub-schema del doc) ─────────────────────────────
  "pre_flight": {
    "fuel_level":        50,
    "cargo_description": "",
    "items": {
      "extintor":         true,
      "llanta_refaccion": true,
      "herramientas":     true,
      "gato":             true,
      "cinturon":         true,
      "documentos":       true,
      "tarjetas":         true
    },
    "observaciones": ""
  },

  // ── Porcentajes y metadata libre ───────────────────────────────
  "profit_pct":        8,
  "indirect_pct":      12,
  "cargo_description": "",
  "origin":            "CODI CDMX",
  "destination":       "GUADALAJARA",
  "stops":             ["COAPA"],
  "cost_center":       "operaciones",
  "notes":             "",
  "tarjeta_deposito":  "",
  "casetas":           ""
}
```

## Campos disponibles del documento persistido

| Campo doc        | Mapea a payload          | Notas                              |
|------------------|-------------------------|------------------------------------|
| `_id`            | `_id`                   |                                    |
| `__v`            | `__v`                   | versionKey Mongoose                |
| `is_active`      | `is_active`             |                                    |
| `type`           | `type`                  | se manda en MAYÚSCULAS             |
| `isCancel_status`| `isCancel_status`       | string, default `null`             |
| `folio`          | `folio`                 | auto-incremental por empresa       |
| `bussiness_cost` | `bussiness_cost`        | ObjectId → string                  |
| `client`         | `currentClient` / `client` | ObjectId → lookup empresaLogos + raw |
| `subject`        | `subject`               |                                    |
| `email_sent`     | `email_sent`            | array                              |
| `vehicle`        | `vehicle.placas`        | cruza con Flotilla por placas      |
| `driver`         | `vehicle.driver`        |                                    |
| `fuel_card`      | `vehicle.fuel_card`     |                                    |
| `fuel_amount`    | `vehicle.fuel_amount`   | string → `$0.00`                   |
| `request_date`   | `request_day`           | es-MX full date                    |
| `delivery_date`  | `delivery_day`          | es-MX full date                    |
| `createdAt`      | `created_day`           | es-MX full date                    |
| `route`          | `route`                 | string                             |
| `kilometer_out`  | `kilometer_out`         | number                             |
| `kilometer_in`   | `kilometer_in`          | number                             |
| `fuel_level`     | `fuel_level`            | number                             |
| `recorrido_km`   | `recorrido_km`          | string                             |
| `subtotal_travel`| `subtotal_travel`       | number → `$0.00`                   |
| `description`    | `description`           | sub-objeto con plan info           |
| `cost_breakdown` | `cost_breakdown`        | sub-schema completo                |
| `pre_flight`     | `pre_flight`            | sub-schema completo                |
| `profit_pct`     | `profit_pct`            | default `8`                        |
| `indirect_pct`   | `indirect_pct`          | default `12`                       |
| `cargo_description` | `cargo_description`  |                                    |
| `origin`         | `origin`                |                                    |
| `destination`    | `destination`           |                                    |
| `stops`          | `stops`                 | array de strings                   |
| `cost_center`    | `cost_center`           |                                    |
| `notes`          | `notes`                 |                                    |
| `tarjeta_deposito` | `tarjeta_deposito`    |                                    |
| `casetas`        | `casetas`               |                                    |

## Lookup de vehículo (Flotilla + Planes)

`getPlanesByPlacas(doc.vehicle)` corre una agregación:

```js
Flotilla.aggregate([
  { $match: { placas: doc.vehicle } },
  { $lookup: { from: 'planes', localField: '_id', foreignField: 'flotilla', as: 'planes' } },
  { $unwind: { path: '$planes' } }
])
```

Devuelve documentos `{ modelo, placas, planes: { planName, planPrice, planDescription, … } }`.
Si el array viene vacío `vehicleData` usa defaults (`Sin modelo`, `Sin placas`,
`Sin planes`).

## Lookup de empresa (hardcoded)

`services/PDFServices.js` exporta `empresaLogos` con `_id` → `name`. Si el
ObjectId de `bussiness_cost` o `client` no está en el array, el PDF service
recibirá `"Empresa no encontrada"` / `"Cliente no encontrado"`. **Mantener
sincronizado con la colección `bussinesses` de Mongo.**

## Errores del PDF service

Si el servicio externo responde 4xx/5xx, el backend decodifica el body
(arraybuffer → JSON) y lo reenvía al frontend tal cual para que el equipo de
PDFs vea el problema:

```json
{
  "message": "El mensaje de error que mandó el PDF service",
  "errors":  [...],
  "raw":     "..."
}
```

## Snapshot de costos (modo "no recalcular")

A partir de esta versión, el payload incluye tres campos nuevos para evitar
recálculos en el PDF service:

- `snapshot_mode: true` — flag semántico que indica que los valores ya están
  resueltos.
- `line_items` — arreglo de conceptos listos para iterar en una tabla. Cada
  elemento ya trae `unit_price`, `qty`, `unit` y `total`.
- `totals` — totales finales: `concepts_subtotal`, `subtotal_travel`,
  `profit_amount`, `indirect_amount` y `grand_total`.

### Regla para el PDF service

> Cuando `snapshot_mode` es `true`, **usar `line_items` y `totals` tal cual**.
> No volver a calcular días a partir de `request_date` / `delivery_date`, ni
> multiplicar `unit_rent_amount` por ninguna cantidad derivada de fechas.
> Los cálculos ya los hizo el frontend y los validó el backend.

### Ejemplo: renta por día

Si el backend envía:

```json
{
  "unit_rent_amount": 41,
  "unit_rent_qty": 450,
  "subtotal_travel": 18450
}
```

El PDF service debe mostrar **41 × 450 = 18450**, usando el `total` ya
pre-calculado en `line_items` y `totals.subtotal_travel`.

## Cómo extender el payload

1. Agregar campo al schema (`models/Traslado.js` | `Flete.js` | `Rentas.js`).
2. Si viene del frontend, agregarlo al mapper `mapDocumentBody` en
   `services/FlotillasService.js`.
3. Si debe verse en el PDF, exponerlo en el return de `PDFServices.vehicleData`
   (este archivo). Coordinar con equipo de PDF service.
4. (Opcional) Crear endpoint para setear `getMapImage` si el PDF va a
   incluir el mapa — el backend hoy no la está pasando, revisar
   `getMapImage` que se menciona en `flotillaInvoice` legacy.
