# Plan: Snapshot de costos para el PDF service de flotillas

## Resumen

Convertir el payload que enviamos a `PDF_SERVICE + /vehicle-invoice/` en un **snapshot completo y no recalculable**: cada concepto de costo debe ir con su total ya resuelto, junto con un flag `snapshot_mode: true` que le indique al servicio de PDFs que solo debe renderizar, no calcular.

Esto evita que el PDF service vuelva a derivar malos valores como "renta por día = precio unitario × días calculados de las fechas", que es el problema actual.

## Problema actual

- `FlotillasController.printPlan` toma el documento de Mongo, lo pasa por `PDFServices.vehicleData` y lo envía por HTTP al servicio externo de PDFs.
- El frontend ya envía los cálculos correctos (`subtotal_travel`, `profit_amount`, `indirect_amount`, `unit_rent_amount`, `unit_rent_qty`, etc.) y `mapDocumentBody` los guarda tal cual.
- `PDFServices.vehicleData` solo recalcula `profit_amount` e `indirect_amount` cuando vienen en `0`, y ahora ya los redondea a 2 decimales.
- El PDF service parece estar recalculando la renta a partir de las fechas (`request_date` / `delivery_date`) en lugar de usar `unit_rent_qty` y `subtotal_travel` que ya le enviamos.

## Solución propuesta

Enriquecer el return de `PDFServices.vehicleData` con dos nuevas secciones:

1. **`snapshot_mode: true`** — flag semántico para el PDF service.
2. **`line_items`** — arreglo de conceptos listos para iterar y renderizar en tabla, cada uno con `label`, `unit_price`, `qty`, `unit`, `total`.
3. **`totals`** — objeto con todos los totales finales:
   - `concepts_subtotal`
   - `subtotal_travel`
   - `profit_amount`
   - `indirect_amount`
   - `grand_total`

El PDF service podrá entonces pintar la tabla directamente desde `line_items` y el resumen desde `totals`, sin necesidad de mirar fechas ni volver a multiplicar nada.

## Cálculos del snapshot

```js
const unitRentTotal = unit_rent_amount * unit_rent_qty
const operatorTotal = operator_rate * operator_days
const perDiemTotal  = per_diem_rate * per_diem_days
const gasolineTotal = gasoline_unit === 'km'
  ? gasoline_rate * gasoline_km
  : gasoline_rate
const casetasTotal  = casetas_amount

const conceptsSubtotal = unitRentTotal + operatorTotal + perDiemTotal + gasolineTotal + casetasTotal
const profitFinal = profit_amount // ya persistido o recalculado en vehicleData
const indirectFinal = indirect_amount // ya persistido o recalculado en vehicleData
const grandTotal = subtotal_travel_raw + profitFinal + indirectFinal
```

> Nota: usamos los valores **persistidos** del documento. No recalculamos desde cero, salvo que `vehicleData` haya tenido que recalcular utilidad/indirectos por venir en `0`.

## Archivos a modificar

### 1. `services/PDFServices.js`

- Agregar helper interno `calculateSnapshotTotals(plainCostBreakdown, subtotal, profit, indirect)`.
- Agregar helper interno `buildLineItems(plainCostBreakdown)`.
- En `vehicleData`, incluir en el return:
  - `snapshot_mode: true`
  - `line_items`
  - `totals`
- Mantener todos los campos actuales (`cost_breakdown`, `subtotal_travel`, etc.) para compatibilidad hasta que el PDF service migre a usar `line_items`/`totals`.

### 2. `docs/print-plan-payload.md`

- Documentar la nueva sección `snapshot_mode`, `line_items` y `totals`.
- Actualizar el ejemplo JSON.
- Agregar nota para el equipo del PDF service: "Cuando `snapshot_mode` es `true`, usar `line_items` y `totals`; no recalcular conceptos a partir de fechas".

### 3. `test/unit/PDFServices.test.js`

- Agregar tests para el snapshot:
  - `snapshot_mode` es `true`.
  - `line_items` contiene cada concepto con su total correcto.
  - `totals.concepts_subtotal` es la suma de los conceptos.
  - `totals.grand_total = subtotal_travel_raw + profit + indirect`.
  - Renta: `unit_rent_amount * unit_rent_qty` refleja el valor real (caso del payload con 41 × 450 = 18450).

### 4. `controllers/FlotillasController.js`

- No cambia la lógica de negocio, solo mantener el envío al PDF service. Se deja intacto salvo si se decide también agregar un header `X-Snapshot-Mode: true`.

## Contrato nuevo del payload (resumen)

```jsonc
{
  // ... campos existentes ...
  "snapshot_mode": true,
  "line_items": [
    { "label": "Casetas",        "unit_price": 0,    "qty": 0,  "unit": "fijo", "total": 0 },
    { "label": "Operador",       "unit_price": 0,    "qty": 0,  "unit": "dia",  "total": 0 },
    { "label": "Per diem",       "unit_price": 0,    "qty": 0,  "unit": "dia",  "total": 0 },
    { "label": "Gasolina",       "unit_price": 0,    "qty": 1,  "unit": "dia",  "total": 0 },
    { "label": "Renta de unidad","unit_price": 41,   "qty": 450,"unit": "dia",  "total": 18450 }
  ],
  "totals": {
    "concepts_subtotal": 18450,
    "subtotal_travel": 18450,
    "profit_amount": 1476,
    "indirect_amount": 2214,
    "grand_total": 22140
  }
}
```

## Backward compatibility

- Los campos actuales (`cost_breakdown`, `subtotal_travel`, `subtotal_travel_raw`, `description.planPrice`) se mantienen iguales.
- El PDF service puede seguir usándolos mientras migra, pero el flag `snapshot_mode` y los nuevos objetos le dan la información completa para no recalcular.

## Riesgos / preguntas abiertas

1. ¿El PDF service que recibe el payload está bajo control del equipo para que pueda ignorar `cost_breakdown` y usar `line_items`/`totals`?
2. ¿El "total final" esperado es `subtotal_travel + profit + indirect`, o el `subtotal_travel` ya incluye esos montos? El snapshot lo hará explícito y el PDF service puede elegir.
3. ¿Se requiere también enviar los días calculados desde fechas, o con `unit_rent_qty` ya es suficiente?

## Criterios de aceptación

- [ ] `PDFServices.vehicleData` incluye `snapshot_mode: true`.
- [ ] `line_items` tiene todos los conceptos con totales pre-calculados.
- [ ] `totals` tiene subtotales y total final explícitos.
- [ ] Los tests unitarios cubren el snapshot, incluyendo el caso de renta 41 × 450.
- [ ] La documentación del payload está actualizada.
- [ ] `npm test` sigue pasando.
